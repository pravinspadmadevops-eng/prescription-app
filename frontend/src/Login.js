import { useState } from "react";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

import { app } from "./firebase";

const auth = getAuth(app);

export default function Login() {

  const [phone, setPhone] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [confirmationResult,
    setConfirmationResult] =
    useState(null);

  // =========================
  // SEND OTP
  // =========================

  const sendOTP = async () => {

    try {

      window.recaptchaVerifier =
        new RecaptchaVerifier(

          auth,

          "recaptcha-container",

          {
            size: "normal"
          }

        );

      const appVerifier =
        window.recaptchaVerifier;

      const result =
        await signInWithPhoneNumber(

          auth,
          phone,
          appVerifier

        );

      setConfirmationResult(result);

      alert("OTP Sent");

    } catch (error) {

      console.log(error);

      alert(error.message);

    }

  };

  // =========================
  // VERIFY OTP
  // =========================

  const verifyOTP = async () => {

    try {

      const result =
        await confirmationResult.confirm(otp);

      const user =
        result.user;

      const token =
        await user.getIdToken();

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          phone: user.phoneNumber
        })
      );

      alert("Login Success");

      window.location.href =
        "/dashboard";

    } catch (error) {

      console.log(error);

      alert("Invalid OTP");

    }

  };

  return (

    <div
      style={{
        padding: 40
      }}
    >

      <h2>
        Mobile Login
      </h2>

      <input

        type="text"

        placeholder="+919876543210"

        value={phone}

        onChange={(e) =>
          setPhone(e.target.value)
        }

      />

      <br /><br />

      <button onClick={sendOTP}>
        Send OTP
      </button>

      <br /><br />

      <input

        type="text"

        placeholder="Enter OTP"

        value={otp}

        onChange={(e) =>
          setOtp(e.target.value)
        }

      />

      <br /><br />

      <button onClick={verifyOTP}>
        Verify OTP
      </button>

      <div id="recaptcha-container"></div>

    </div>

  );

}