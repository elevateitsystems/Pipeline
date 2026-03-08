"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import axios from "axios";

type Step = "EMAIL" | "OTP" | "RESET" | "SUCCESS";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "OTP" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const { data } = await axios.post("/api/auth/forgot-password", { email });
      if (data.success) {
        setStep("OTP");
        setTimeLeft(120);
        setMessage({ text: data.message, type: "success" });
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      setMessage({
        text: axiosError.response?.data?.error || "Failed to send OTP",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLeft === 0) {
      setMessage({
        text: "OTP expired. Please request a new one.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const otpValue = otp.join("");
      const { data } = await axios.post("/api/auth/verify-otp", {
        email,
        otp: otpValue,
      });
      if (data.success) {
        setStep("RESET");
        setMessage({ text: "", type: "" });
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      setMessage({
        text: axiosError.response?.data?.error || "Invalid OTP",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/reset-password", {
        email,
        otp: otp.join(""),
        newPassword,
      });
      if (data.success) {
        setStep("SUCCESS");
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      setMessage({
        text: axiosError.response?.data?.error || "Failed to reset password",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url(/bg-img.png)",
        backgroundSize: "contain",
      }}
    >
      <div className="absolute inset-0 bg-[rgba(43,64,85,0.70)] z-0"></div>

      <div className="flex flex-col items-center relative z-10">
        <Image
          src="/logo.png"
          alt="Logo"
          width={180}
          height={60}
          className="mb-4"
        />

        <div className="bg-white rounded-2xl shadow-xl w-[400px] p-8">
          {step !== "SUCCESS" && (
            <button
              onClick={() =>
                step === "EMAIL" ? window.history.back() : setStep("EMAIL")
              }
              className="flex items-center text-xs text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft size={14} className="mr-1" />
              Back
            </button>
          )}

          <h3 className="text-center font-['Acumin_Variable_Concept'] font-light text-[22px] uppercase text-gray-700 mb-6">
            {step === "EMAIL" && "Reset Password"}
            {step === "OTP" && "Enter OTP"}
            {step === "RESET" && "New Password"}
            {step === "SUCCESS" && "Success!"}
          </h3>

          {message.text && (
            <div
              className={`p-3 rounded-lg mb-6 text-sm text-center ${
                message.type === "success"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message.text}
            </div>
          )}

          {step === "EMAIL" && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <p className="text-sm text-gray-500 text-center mb-4">
                Enter your email address to receive a 6-digit verification code.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-b from-yellow-400 to-yellow-500 text-gray-800 font-semibold py-2 rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {step === "OTP" && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <p className="text-sm text-gray-500 text-center">
                We&apos;ve sent a code to{" "}
                <span className="font-semibold">{email}</span>
              </p>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                    required
                  />
                ))}
              </div>
              <div className="text-center">
                <p
                  className={`text-sm ${timeLeft < 30 ? "text-red-500 font-semibold" : "text-gray-500"}`}
                >
                  Expires in: {formatTime(timeLeft)}
                </p>
                {timeLeft === 0 && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="text-sm text-blue-600 hover:underline mt-2"
                  >
                    Resend Code
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || timeLeft === 0}
                className="w-full bg-linear-to-b from-yellow-400 to-yellow-500 text-gray-800 font-semibold py-2 rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-70"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          )}

          {step === "RESET" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-b from-yellow-400 to-yellow-500 text-gray-800 font-semibold py-2 rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-70"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {step === "SUCCESS" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600">
                Your password has been successfully reset. You can now log in
                with your new credentials.
              </p>
              <Link
                href="/signin"
                className="block w-full bg-linear-to-b from-yellow-400 to-yellow-500 text-gray-800 font-semibold py-2 rounded-lg shadow-md hover:opacity-90 text-center transition-all"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
