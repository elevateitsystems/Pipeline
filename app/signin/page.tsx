"use client";

import { useState } from "react";
import { useLogin } from "@/lib/hooks";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function SigninPage() {
  const [formData, setFormData] = useState({
    email: "",
    passCode: "",
  });
  const [pin, setPin] = useState(["", "", "", ""]);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usePin, setUsePin] = useState(false);
  const loginMutation = useLogin();

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const getPinValue = () => pin.join("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const loginData = usePin
        ? { email: formData.email, pin: getPinValue() }
        : { email: formData.email, passCode: formData.passCode };

      const response = await loginMutation.mutateAsync(loginData);

      if (response.success) {
        // Redirect admins to dashboard, regular users to home
        if (response.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        setMessage("Login failed");
      }
    } catch (error: unknown) {
      const apiError = error as { message?: string };
      setMessage(apiError.message || "An error occurred");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Content */}
      <div className="flex flex-col items-center relative z-10">
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="Pipeline Conversions"
          width={180}
          height={60}
          className="mb-4"
        />
        <h2
          className="
  font-['Acumin_Variable_Concept'] 
  font-light 
  text-[34px] 
  leading-[39px] 
  tracking-[0.006em] 
  uppercase 
  [text-box-trim:both] 
  [text-box-edge:cap_alphabetic]
  text-white
  mb-6
"
        >
          {/* WELCOME BACK */}
          welcome back
        </h2>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl w-[380px] p-8">
          <h3 className="text-center t  font-['Acumin_Variable_Concept'] font-light text-[24px] leading-[39px] tracking-[0.006em] uppercase [text-box-trim:both] [text-box-edge:cap_alphabetic] text-gray-700 mb-6">
            LOGIN INTO YOUR ACCOUNT
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-600">
                  {usePin ? "PIN" : "Passcode"}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setUsePin(!usePin);
                    setFormData((prev) => ({ ...prev, passCode: "" }));
                    setPin(["", "", "", ""]);
                  }}
                  className="text-xs text-[#2F68DF] cursor-pointer hover:text-[#2F68DF/50] underline"
                >
                  {usePin ? "Use Passcode" : "Use PIN"}
                </button>
              </div>
              {usePin ? (
                <div className="flex gap-2 justify-center">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      id={`pin-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(index, e)}
                      className="w-10 h-10 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      required
                    />
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="passCode"
                    required
                    value={formData.passCode}
                    onChange={handleInputChange}
                    placeholder="Enter your passcode"
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
              )}
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-[#2F68DF] hover:text-[#2F68DF/50] underline"
              >
                Forgot Passcode?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-linear-to-b from-yellow-400 to-yellow-500 text-gray-800 font-semibold py-2 rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-70"
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </button>
            <div className="text-center ">
              Create an account ?
              <Link
                href="/signup"
                className="text-sm px-1 text-[#2F68DF] hover:text-[#2F68DF/50] underline"
              >
                Signup
              </Link>
            </div>
            {message && (
              <p
                className={`text-center text-sm ${
                  message.includes("failed") || message.includes("Invalid")
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
