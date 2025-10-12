import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute'; // <-- THIS IS THE FIX

// Import Layout and Pages
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import DoctorsPage from "./pages/DoctorsPage";
import PatientsPage from "./pages/PatientsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register", // Added register route for completeness
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>, // Protect the main layout
    errorElement: <NotFound />,
    children: [
      {
        // Redirect root path to dashboard after login
        index: true, 
        element: <Dashboard />
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "doctors",
        element: <DoctorsPage />,
      },
      {
        path: "patients",
        element: <PatientsPage />,
      },
      {
        path: "appointments",
        element: <AppointmentsPage />,
      },
    ],
  },
]);

export default router;