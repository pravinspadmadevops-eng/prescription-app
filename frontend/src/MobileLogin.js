import React, { useState } from 'react';

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';

import app from './firebase';

import axios from 'axios';

const auth = getAuth(app);

function MobileLogin() {

  const [phone, setPhone] = useState('');

  const [otp, setOtp] = useState('');

  const [confirmation, setConfirmation] = useState(null);

  const setupRecaptcha = () => {

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'invisible'
      }
    );

  };

  const sendOtp = async () => {

    try {

      setupRecaptcha();

      const appVerifier =
        window.recaptchaVerifier;

      const result =
        await signInWithPhoneNumber(
          auth,
          phone,
          appVerifier
        );

      setConfirmation(result);

      alert('OTP Sent');

    } catch (error) {

      console.log(error);

      alert(error.message);

    }

  };

  const verifyOtp = async () => {

    try {

      const result =
        await confirmation.confirm(otp);

      const user = result.user;

      const response =
        await axios.post(
          'http://localhost:5001/api/auth/mobile-login',
          {
            phone: user.phoneNumber
          }
        );

      localStorage.setItem(
        'token',
        response.data.token
      );

      localStorage.setItem(
        'user',
        JSON.stringify(response.data.user)
      );

      window.location.href = '/dashboard';

    } catch (error) {

      console.log(error);

      alert('Invalid OTP');

    }

  };

  return (
    <div>

      <h2>Mobile Login</h2>

      <input
        type="text"
        placeholder="+919876543210"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button onClick={sendOtp}>
        Send OTP
      </button>

      <br /><br />

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button onClick={verifyOtp}>
        Verify OTP
      </button>

      <div id="recaptcha-container"></div>

    </div>
  );
}

export default MobileLogin;