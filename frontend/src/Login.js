import { useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

import { auth } from "./firebase";
import axios from "axios";

export default function Login() {

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  // =========================
  // SEND OTP
  // =========================
  const sendOTP = async () => {
    try {
    if (!phone.startsWith("+")) {
      alert("Use +91XXXXXXXXXX format");
      return;
    }

    // IMPORTANT: destroy old verifier
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible"
      }
    );

    const appVerifier = window.recaptchaVerifier;

    const result = await signInWithPhoneNumber(
      auth,
      phone,
      appVerifier
    );

    window.confirmationResult = result; // IMPORTANT backup
    setConfirmationResult(result);

    alert("OTP Sent");
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };
  window.confirmationResult = result;
  // =========================
  // VERIFY OTP + LOGIN
  // =========================
  const verifyOTP = async () => {
    try {
      const confirmation = confirmationResult || window.confirmationResult;
        console.log("confirmationResult:", confirmationResult);
    console.log("OTP entered:", otp);

      if (!confirmation) {
        alert("Session expired. Please request OTP again.");
        return;
      }

      const result = await confirmation.confirm(otp);

      const user = result.user;
      const token = await user.getIdToken();

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({ phone: user.phoneNumber })
      );

      alert("Login Success");
      window.location.href = "/dashboard";

    } catch (error) {
      console.log("OTP ERROR:", error.code, error.message);

      // THIS is key for debugging
      if (error.code === "auth/invalid-verification-code") {
        alert("Wrong OTP entered");
      } else if (error.code === "auth/session-expired") {
        alert("OTP expired. Request again.");
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Mobile Login</h2>

      <input
        type="text"
        placeholder="+919876543210"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
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
        onChange={(e) => setOtp(e.target.value)}
      />

      <br /><br />

      <button onClick={verifyOTP}>
        Verify OTP
      </button>

      <div id="recaptcha-container"></div>
    </div>
  );
}