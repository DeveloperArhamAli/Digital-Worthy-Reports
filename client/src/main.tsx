import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import AboutPage from './pages/AboutPage.tsx'
import ContactUsPage from './pages/ContactUsPage.tsx'
import PricingPage from './pages/PricingPage.tsx'
import PaymentSuccess from './pages/PaymentSuccess.tsx'
import PaymentCancel from './pages/PaymentCancel.tsx'
import AdminPage from './pages/AdminPage.tsx'
import AdminLoginPage from './pages/AdminLoginPage.tsx'
import VinPreviewPage from './pages/VinPreviewPage.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />
      },
      {
        path: "/about",
        element: <AboutPage />
      },
      {
        path: "/pricing",
        element: <PricingPage />
      },
      {
        path: "/contact",
        element: <ContactUsPage />
      },
      {
        path: "/preview",
        element: <VinPreviewPage />
      },
      {
        path: "/payment-success",
        element: <PaymentSuccess />
      },
      {
        path: "/payment-cancel",
        element: <PaymentCancel />
      },
      {
        path: "/admin",
        element: <AdminPage />
      },
      {
        path: "/admin-login",
        element: <AdminLoginPage />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)