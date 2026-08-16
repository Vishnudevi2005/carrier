import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Shipments from "./pages/Shipments";
import Carriers from "./pages/Carriers";
import Recommendations from "./pages/Recommendations";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function Layout({ children }) {
  return (
    <>
      <Navbar />

      <main className="main-content">
        {children}
      </main>
    </>
  );
}

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Shipments */}
        <Route
          path="/shipments"
          element={
            <ProtectedRoute>
              <Layout>
                <Shipments />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Carriers */}
        <Route
          path="/carriers"
          element={
            <ProtectedRoute>
              <Layout>
                <Carriers />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Recommendations */}
<Route
  path="/recommendations/:shipmentId"
  element={
    <ProtectedRoute>
      <Layout>
        <Recommendations />
      </Layout>
    </ProtectedRoute>
  }
/>

        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;