"use client";

import { useState, useEffect } from "react";
import { useLogin } from "@/lib/hooks";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
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
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [user, router]);

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
    <div className="min-h-screen flex items-center justify-center">
      {/* Content */}
      <div className="flex flex-col items-center relative z-10 lg:w-[728px] px-4 py-16 lg:px-8 xl:px-12">
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="Pipeline Conversions"
          width={191}
          height={59}
          className="h-[50px] sm:h-[60px] lg:h-[70px] xl:h-[59px] w-[150px] sm:w-[160px] lg:w-[170px] xl:w-[191px] mb-4 sm:mb-7 lg:mb-8 xl:mb-10"
        />
        <h2 className="font-light text-[24px] sm:text-[34px] leading-[28px] sm:leading-[39px] uppercase text-white mb-5 sm:mb-7 lg:mb-8 xl:mb-10">
          {/* WELCOME BACK */}
          welcome back
        </h2>

        {/* Card */}
        <div className="bg-white rounded-[12px] sm:rounded-[20px] lg:rounded-[30px] px-[20px] sm:px-[46px] py-[20px] sm:py-[44px] flex flex-col items-start gap-2 sm:gap-3 xl:gap-5">
          <h3 className="text-[20px] sm:text-[24px] lg:text-[30px] xl:text-[34px] leading-[28px] sm:leading-[39px] font-light xl:w-[482px]">
            LOGIN INTO YOUR ACCOUNT
          </h3>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-[10px] sm:mb-[15px] xl:mb-[22px]">
              <label className="block text-[12px] sm:text-[16px] xl:text-[20px] font-light text-gray-600">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-[8px] sm:px-[12px] xl:px-[16px] h-10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="mb-[10px] sm:mb-[15px] xl:mb-[22px]">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[12px] sm:text-[16px] xl:text-[20px] font-light text-gray-600">
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
                      className="w-full border border-gray-300 rounded-lg px-[8px] sm:px-[12px] xl:px-[16px] h-10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                    className="w-full border border-gray-300 rounded-lg px-[8px] sm:px-[12px] xl:px-[16px] h-10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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

            <div className="text-right my-[10px] sm:my-[22px]">
              <Link
                href="/forgot-password"
                className="text-[12px] sm:text-[14px] xl:[18px] text-[#2F68DF] hover:text-[#2F68DF/50] underline"
              >
                Forgot Passcode?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-yellow text-black font-normal h-12 text-[18px] sm:text-[20px] rounded-full hover:opacity-90 transition-all disabled:opacity-70 shadow-sm"
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </button>
            <div className="text-center mt-[16px] sm:mt-[22px]">
              Create an account ?
              <Link
                href="/signup"
                className="text-[14px] sm:text-[18px] px-1 text-[#2F68DF] hover:text-[#2F68DF/50] underline"
              >
                Signup
              </Link>
            </div>
            {message && (
              <p
                className={`text-center text-sm ${message.includes("failed") || message.includes("Invalid")
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
