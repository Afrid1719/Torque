import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { GlobalLoadingIndicator } from './GlobalLoadingIndicator'

it('shows progress while a query is fetching and hides it when complete', async () => {
  let resolveQuery!: (result: string) => void

  function QueryHarness() {
    useQuery({
      queryKey: ['loading-indicator-test'],
      queryFn: () =>
        new Promise<string>((resolve) => {
          resolveQuery = resolve
        }),
    })
    return null
  }

  render(
    <QueryClientProvider client={new QueryClient()}>
      <GlobalLoadingIndicator />
      <QueryHarness />
    </QueryClientProvider>,
  )

  const progress = await screen.findByRole('progressbar', {
    name: 'Loading data',
  })
  expect(progress).toBeVisible()
  const removedProgress = waitForElementToBeRemoved(progress)

  await act(async () => {
    resolveQuery('loaded')
  })

  await removedProgress
})

it('does not show progress for mutations', async () => {
  let resolveMutation!: () => void
  function MutationHarness() {
    const mutation = useMutation({
      mutationFn: () =>
        new Promise<void>((resolve) => {
          resolveMutation = resolve
        }),
    })

    return <button onClick={() => mutation.mutate()}>Save</button>
  }

  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <GlobalLoadingIndicator />
      <MutationHarness />
    </QueryClientProvider>,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Save' }))

  expect(
    screen.queryByRole('progressbar', { name: 'Loading data' }),
  ).not.toBeInTheDocument()
  await waitFor(() => expect(resolveMutation).toBeDefined())

  await act(async () => {
    resolveMutation()
  })
})
