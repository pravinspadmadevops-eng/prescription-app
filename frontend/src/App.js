import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";

function App() {

  // =========================
  // Logout function
  // =========================

  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "/";

  };

  // =========================
  // Get token
  // =========================

  const token =
    localStorage.getItem("token");

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={
            token
              ? <Navigate to="/dashboard" />
              : <Login />
          }
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/dashboard"
          element={
            token
              ? (
                  <Dashboard
                    token={token}
                    logout={logout}
                  />
                )
              : (
                  <Navigate to="/" />
                )
          }
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;