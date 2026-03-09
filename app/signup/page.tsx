"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInvite, useRegister } from "@/lib/hooks";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

interface InvitationData {
  email: string;
  role: string;
  company: {
    id: string;
    name: string;
  };
}

export default function SignupPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    passCode: "",
    pin: "",
    companyName: "",
    primaryColor: "#456987",
    secondaryColor: "#F7AF41",
    profileImageUrl: "",
    companyLogoUrl: "",
    role: "USER",
    inviteToken: "",
  });
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newPin = [...pinDigits];
    newPin[index] = value;
    setPinDigits(newPin);

    // Update formData pin
    const pinValue = newPin.join("");
    setFormData((prev) => ({ ...prev, pin: pinValue }));

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`signup-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      const prevInput = document.getElementById(`signup-pin-${index - 1}`);
      prevInput?.focus();
    }
  };
  const [message, setMessage] = useState("");
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    data: inviteData,
    error: inviteQueryError,
    isLoading: inviteLoading,
  } = useInvite(token);
  const registerMutation = useRegister();
  console.log(inviteData);
  useEffect(() => {
    if (inviteData && token) {
      const inviteEmail = (inviteData as unknown as InvitationData).email;
      setFormData((prev) => ({
        ...prev,
        email: inviteEmail,
        role: (inviteData as unknown as InvitationData).role,
        inviteToken: token,
        // Set a default name from email (extract name part before @) or use email
        name: prev.name || inviteEmail.split("@")[0] || "User",
      }));
    }
    // no-op for inviteQueryError: handled downstream via disabled inputs/messages if needed
  }, [inviteData, inviteQueryError, token]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "company",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === "profile") setProfilePreview(result);
      else setLogoPreview(result);
    };
    reader.readAsDataURL(file);

    const setter = type === "profile" ? setUploadingProfile : setUploadingLogo;
    setter(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({
        ...prev,
        [type === "profile" ? "profileImageUrl" : "companyLogoUrl"]: url,
      }));
    } catch (error) {
      console.error(`${type} image upload failed:`, error);
    } finally {
      setter(false);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    );

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      uploadData,
    );
    return response.data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        passCode: formData.passCode,
        pin: formData.pin || undefined,
        inviteToken: formData.inviteToken || token || undefined, // Use inviteToken to match validation schema
        // Only include company-related fields if not using token
        ...(token
          ? {}
          : {
            companyName: formData.companyName || undefined,
            companyLogoUrl: formData.companyLogoUrl || undefined,
            // Only include colors if not using token (invited users get colors from inviter)
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
          }),
        // Profile image can be included for both cases
        profileImageUrl: formData.profileImageUrl || undefined,
      };

      const response = await registerMutation.mutateAsync(dataToSend);

      if (response.success) {
        setMessage("Registration successful!");
        window.location.href = "/";
      } else {
        setMessage("Registration failed");
      }
    } catch (error) {
      const apiError = error as { message?: string };
      setMessage(apiError.message || "An error occurred");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center relative z-10 w-full px-4 py-16 lg:px-8 xl:px-12">
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="Pipeline Conversions"
          width={191}
          height={59}
          className="h-[50px] sm:h-[60px] lg:h-[70px] xl:h-[59px] w-[150px] sm:w-[160px] lg:w-[170px] xl:w-[191px] mb-[20px] sm:mb-[30px] lg:mb-[40px] xl:mb-[49px]"
        />

        {/* <h2 className="font-light text-[24px] sm:text-[34px] leading-[28px] sm:leading-[39px] uppercase text-white mb-[20px] sm:mb-[30px] lg:mb-[40px] xl:mb-[84px]">
          create your account
        </h2> */}

        {/* Form Card */}
        <div className="bg-white rounded-[12px] sm:rounded-[20px] lg:rounded-[30px] px-[20px] sm:px-[46px] py-[20px] sm:py-[44px] flex flex-col items-start gap-2 sm:gap-3 xl:gap-5 w-full">
          <h3 className="text-[20px] sm:text-[24px] lg:text-[30px] xl:text-[34px] leading-[28px] sm:leading-[39px] font-light xl:w-[482px]">
            CREATE NEW ACCOUNT
          </h3>

          <form onSubmit={handleSubmit} className="w-full space-y-3">
            {/* Show all fields if no token, only email and passCode if token exists */}
            {!token ? (
              <>
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-[12px] sm:text-[16px] xl:text-[20px] font-light text-gray-600"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!token}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-[#f5f5f5] border-0 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
              </>
            ) : null}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[12px] sm:text-[16px] xl:text-[20px] font-light text-gray-600"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                disabled={!!token}
                className="w-full border border-gray-300 rounded-lg px-[8px] sm:px-[12px] xl:px-[16px] h-10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Passcode and PIN */}
            <div className="flex gap-3">
              {/* Passcode */}
              <div className="flex-1">
                <label
                  htmlFor="passCode"
                  className="block text-[12px] sm:text-[16px] xl:text-[20px] font-light text-gray-600"
                >
                  Passcode
                </label>
                <div className="relative">
                  <input
                    id="passCode"
                    name="passCode"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.passCode}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-[8px] sm:px-[12px] xl:px-[16px] h-10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.59 21.59 0 014.29-5.94M9.53 9.53A3 3 0 0114.47 14.47M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* PIN */}
              <div className="flex-1">
                <label
                  htmlFor="pin"
                  className="block text-[12px] sm:text-[16px] xl:text-[20px] font-light text-gray-600"
                >
                  PIN (Optional - 4 digits)
                </label>
                <div className="flex gap-2">
                  {pinDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`signup-pin-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(index, e)}
                      className="w-10 h-10 text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                  You can use PIN instead of passcode for faster login
                </p>
              </div>
            </div>


            {!token ? (
              <>
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-[12px] sm:text-[16px] xl:text-[20px] font-light text-gray-600"
                  >
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-[8px] sm:px-[12px] xl:px-[16px] h-10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Primary Color */}
                  <div className="flex flex-col">
                    <label className="text-[14px] sm:text-[18px] font-light text-gray-800">
                      Primary Color
                    </label>
                    <div className="relative h-10 w-full">
                      <input
                        id="primaryColor"
                        name="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={handleInputChange}
                        className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                      />
                      <div className="flex items-center w-full h-full bg-[#f8f8f8] border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-center w-[40px] sm:w-[50px] h-full rounded border border-gray-300 overflow-hidden bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAACpJREFUGFdjZEACJ0+e/M/AwMDIACHY0KWAicEIrALMZwRJM8KEuEDSFABfXAsvW09M7QAAAABJRU5ErkJggg==')]">
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: formData.primaryColor }}
                          />
                        </div>
                        <span className="ml-3 text-[12px] sm:text-[14px] text-gray-400 font-light truncate">
                          Chosen primary color
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div className="flex flex-col">
                    <label className="text-[14px] sm:text-[18px] font-light text-gray-800">
                      Secondary Color
                    </label>
                    <div className="relative h-10 w-full">
                      <input
                        id="secondaryColor"
                        name="secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={handleInputChange}
                        className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                      />
                      <div className="flex items-center w-full h-full bg-[#f8f8f8] border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-center w-[40px] sm:w-[50px] h-full rounded border border-gray-300 overflow-hidden bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAACpJREFUGFdjZEACJ0+e/M/AwMDIACHY0KWAicEIrALMZwRJM8KEuEDSFABfXAsvW09M7QAAAABJRU5ErkJggg==')]">
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: formData.secondaryColor }}
                          />
                        </div>
                        <span className="ml-3 text-[12px] sm:text-[14px] text-gray-400 font-light truncate">
                          Chosen secondary color
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Company Logo */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] sm:text-[18px] font-light text-gray-800">
                      Company Logo
                    </label>
                    <div className="relative h-10 w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "company")}
                        className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                        id="companyLogo"
                      />
                      <div className="flex items-center w-full h-full bg-white border border-gray-200 rounded-lg px-2">
                        <div className="bg-[#f0f0f0] border border-gray-300 rounded px-3 py-1 text-[11px] sm:text-[13px] text-black font-normal shadow-sm">
                          Choose File
                        </div>
                        <span className="ml-3 text-[11px] sm:text-[13px] text-gray-400 font-light truncate">
                          {logoPreview ? "File selected" : "No files chosen"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Photo */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] sm:text-[18px] font-light text-gray-800">
                      Profile Photo
                    </label>
                    <div className="relative h-10 w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "profile")}
                        className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                        id="profilePhoto"
                      />
                      <div className="flex items-center w-full h-full bg-white border border-gray-200 rounded-lg px-2">
                        <div className="bg-[#f0f0f0] border border-gray-300 rounded px-3 py-1 text-[11px] sm:text-[13px] text-black font-normal shadow-sm">
                          Choose File
                        </div>
                        <span className="ml-3 text-[11px] sm:text-[13px] text-gray-400 font-light truncate">
                          {profilePreview ? "File selected" : "No files chosen"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null
            }

            <button
              type="submit"
              disabled={registerMutation.isPending || inviteLoading}
              className="w-full bg-yellow text-black font-normal h-14 text-[18px] sm:text-[20px] rounded-full hover:opacity-90 transition-all disabled:opacity-70 mt-3 shadow-sm"
            >
              {registerMutation.isPending ? "Creating Account..." : "Signup"}
            </button>

            {
              message && (
                <p
                  className={`text-center text-sm mt-3 ${message.includes("success") ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {message}
                </p>
              )
            }

            <div className="text-center mt-3 w-full text-gray-800 text-[14px] sm:text-[16px]">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="underline font-normal"
              >
                Login
              </Link>
            </div>
          </form >
        </div >
      </div >
    </div >
  );
}
