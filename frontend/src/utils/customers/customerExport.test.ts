import { buildCustomerCsv } from './customerExport'

describe('buildCustomerCsv', () => {
  it('formats customer details as escaped CSV rows', () => {
    expect(
      buildCustomerCsv([
        {
          address: '4, Workshop Road',
          created_at: '2026-09-17T00:00:00Z',
          email: 'asha@example.com',
          id: 44,
          mobile_number: '9876543210',
          name: 'Asha "Ace" Rao',
          notes: null,
          updated_at: '2026-09-17T00:00:00Z',
        },
      ]),
    ).toBe(
      '"Customer ID","Name","Mobile Number","Email","Address","Notes"\n"CUST-44","Asha ""Ace"" Rao","9876543210","asha@example.com","4, Workshop Road",""',
    )
  })
})
