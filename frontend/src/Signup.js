import { useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

export default function Signup() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {

    try {

      const res = await axios.post(
        "/api/auth/login",
        {
          name,
          email,
          password
        }
      );

     localStorage.setItem(
  "token",
  res.data.token
);

localStorage.setItem(
  "token",
  res.data.token
);

alert("Signup successful");

window.location.href = "/dashboard";

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Signup failed"
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

      <h2>Signup</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

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

      <button onClick={signup}>
        Signup
      </button>

      <p>
        Already have an account?
      </p>

      <button
        onClick={() =>
          navigate("/")
        }
      >
        Login
      </button>

    </div>

  );

}