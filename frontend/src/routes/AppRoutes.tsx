import { Navigate, Route, Routes } from 'react-router'

import { ProtectedRoute } from '@app/contexts/ProtectedRoute'
import { AppShell } from '@app/layouts/AppShell'
import { DashboardPage } from '@app/pages/DashboardPage'
import { AddCustomerPage } from '@app/pages/Customers/AddCustomerPage'
import { CustomerProfilePage } from '@app/pages/Customers/CustomerProfilePage'
import { LoginPage } from '@app/pages/Login/Login'
import { PlaceholderPage } from '@app/pages/PlaceholderPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route element={<DashboardPage />} path="/" />
          <Route
            element={<PlaceholderPage title="Customers" />}
            path="/customers"
          />
          <Route
            element={
              <ProtectedRoute
                allowedRoles={['workshop_manager', 'service_advisor']}
              />
            }
          >
            <Route element={<AddCustomerPage />} path="/customers/new" />
            <Route
              element={<CustomerProfilePage />}
              path="/customers/:customerId"
            />
          </Route>
          <Route
            element={<PlaceholderPage title="Vehicles" />}
            path="/vehicles"
          />
          <Route
            element={<PlaceholderPage title="Job Cards" />}
            path="/job-cards"
          />
          <Route
            element={<PlaceholderPage title="Inventory" />}
            path="/inventory"
          />
          <Route
            element={<PlaceholderPage title="Billing" />}
            path="/billing"
          />
          <Route
            element={<PlaceholderPage title="Reports" />}
            path="/reports"
          />
          <Route
            element={<PlaceholderPage title="Settings" />}
            path="/settings"
          />
        </Route>
      </Route>
      <Route element={<Navigate to="/" replace />} path="*" />
    </Routes>
  )
}
