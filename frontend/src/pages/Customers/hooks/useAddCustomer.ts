import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { ApiError } from '@app/api/client'
import {
  createCustomer,
  customerQueryKey,
  type CreateCustomerRequest,
} from '@app/api/customers'
import { useAuth } from '@app/hooks/useAuth'
import {
  toProfileState,
  type CustomerProfileState,
} from '@app/utils/customers/customerProfileModel'
import {
  validateCustomer,
  type CustomerField,
  type CustomerFieldErrors,
} from '@app/utils/customers/customerValidation'

export type CustomerFlowState = 'form' | 'loading' | 'success'

export function useAddCustomer() {
  const navigate = useNavigate()
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  const [flowState, setFlowState] = useState<CustomerFlowState>('form')
  const [name, setName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [email, setEmail] = useState('')
  const [fieldErrors, setFieldErrors] = useState<CustomerFieldErrors>({})
  const [requestError, setRequestError] = useState<string | null>(null)
  const [customerSummary, setCustomerSummary] =
    useState<CustomerProfileState | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const mutation = useMutation({
    mutationFn: (payload: CreateCustomerRequest) => {
      if (!accessToken) throw new Error('Missing authenticated session.')
      return createCustomer(accessToken, payload)
    },
  })

  const updateField = (field: CustomerField, value: string) => {
    if (field === 'name') setName(value)
    if (field === 'mobileNumber') setMobileNumber(value)
    if (field === 'email') setEmail(value)
    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const values = {
      email: email.trim(),
      mobileNumber: mobileNumber.trim(),
      name: name.trim(),
    }
    const errors = validateCustomer(values)
    setFieldErrors(errors)
    setRequestError(null)
    if (Object.keys(errors).length) {
      if (errors.name) nameInputRef.current?.focus()
      else if (errors.mobileNumber) mobileInputRef.current?.focus()
      else emailInputRef.current?.focus()
      return
    }

    setFlowState('loading')
    try {
      const address = String(data.get('address') ?? '').trim()
      const notes = String(data.get('notes') ?? '').trim()
      const customer = await mutation.mutateAsync({
        address: address || null,
        email: values.email || null,
        mobile_number: values.mobileNumber,
        name: values.name,
        notes: notes || null,
      })
      queryClient.setQueryData(customerQueryKey(customer.id), customer)
      setCustomerSummary(toProfileState(customer))
      setFlowState('success')
    } catch (error) {
      setFlowState('form')
      if (error instanceof ApiError && error.status === 409) {
        setFieldErrors({ mobileNumber: error.message })
        mobileInputRef.current?.focus()
      } else {
        setRequestError(
          error instanceof ApiError
            ? error.message
            : 'Unable to create the customer. Please try again.',
        )
      }
    }
  }

  useEffect(() => {
    if (flowState !== 'success' || !customerSummary) return
    const timer = window.setTimeout(
      () =>
        navigate(`/customers/${customerSummary.id}`, {
          replace: true,
          state: { customer: customerSummary },
        }),
      5_000,
    )
    return () => window.clearTimeout(timer)
  }, [customerSummary, flowState, navigate])

  return {
    customerSummary,
    email,
    emailInputRef,
    fieldErrors,
    flowState,
    handleSubmit,
    isCreating: flowState === 'loading',
    mobileInputRef,
    mobileNumber,
    name,
    nameInputRef,
    navigate,
    requestError,
    updateField,
  }
}
