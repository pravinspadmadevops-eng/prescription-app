import { useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {

    try {

      const res = await api.post(
        "/api/auth/login",
        {
          email,
          password
        }
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      alert("Login successful");

      window.location.href = "/dashboard";

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Login failed"
      );

    }

  };

  return (

    <div
      style={{
        width: "300px",
        margin: "100px auto",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
    >

      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button onClick={login}>
        Login
      </button>

      <p>
        Don't have an account?
      </p>

      <button
        onClick={() =>
          navigate("/signup")
        }
      >
        Signup
      </button>

    </div>

  );

}