"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useUpdateProfile } from "@/lib/hooks";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";
import { UpdateProfileData } from "@/validation/update-profile.validation";
import { CustomButton } from "@/components/common";

export default function ProfilePage() {
  const CANVAS_WIDTH = 1920;
  const PROFILE_CARD_WIDTH = 764;
  const PROFILE_CARD_HEIGHT = 965;
  const { user, isInvitedUser } = useUser();
  const router = useRouter();
  const updateProfileMutation = useUpdateProfile();
  const [viewportWidth, setViewportWidth] = useState(1863);
  const [message, setMessage] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      const nextInput = document.getElementById(`profile-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      const prevInput = document.getElementById(`profile-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);

    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        passCode: "",
        pin: "",
        companyName: user.company?.name || "",
        primaryColor: user.primaryColor || "#456987",
        secondaryColor: user.secondaryColor || "#F7AF41",
        profileImageUrl: user.profileImageUrl || "",
        companyLogoUrl: user.company?.logoUrl || "",
      });
      if (user.profileImageUrl) {
        setProfilePreview(user.profileImageUrl);
      }
      if (user.company?.logoUrl) {
        setLogoPreview(user.company.logoUrl);
      }
    }
  }, [user]);

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

    // Store file for later upload
    if (type === "profile") {
      setProfileImage(file);
    } else {
      setCompanyLogo(file);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === "profile") setProfilePreview(result);
      else setLogoPreview(result);
    };
    reader.readAsDataURL(file);
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
      let profileImageUrl = formData.profileImageUrl;
      let companyLogoUrl = formData.companyLogoUrl;

      // Upload new images if files are selected
      if (profileImage) {
        setUploadingProfile(true);
        try {
          profileImageUrl = await uploadToCloudinary(profileImage);
          setFormData((prev) => ({ ...prev, profileImageUrl }));
        } catch (error) {
          console.error("Profile image upload failed:", error);
          toast.error("Failed to upload profile image");
        } finally {
          setUploadingProfile(false);
        }
      }

      if (companyLogo && !isInvitedUser) {
        setUploadingLogo(true);
        try {
          companyLogoUrl = await uploadToCloudinary(companyLogo);
          setFormData((prev) => ({ ...prev, companyLogoUrl }));
        } catch (error) {
          console.error("Company logo upload failed:", error);
          toast.error("Failed to upload company logo");
        } finally {
          setUploadingLogo(false);
        }
      }

      const dataToSend: Partial<UpdateProfileData> = {
        name: formData.name,
      };

      // Only include company-related fields if user is not an invited user
      if (!isInvitedUser) {
        dataToSend.companyName = formData.companyName;
        dataToSend.primaryColor = formData.primaryColor;
        dataToSend.secondaryColor = formData.secondaryColor;
        if (companyLogoUrl) {
          dataToSend.companyLogoUrl = companyLogoUrl;
        }
      }

      // Only include passCode if it's provided
      if (formData.passCode) {
        dataToSend.passCode = formData.passCode;
      }

      // Only include PIN if it's provided
      if (formData.pin) {
        dataToSend.pin = formData.pin;
      }

      // Only include profile image URL if it exists
      if (profileImageUrl) {
        dataToSend.profileImageUrl = profileImageUrl;
      }

      await updateProfileMutation.mutateAsync(dataToSend);
      toast.success("Profile updated successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const errorMessage =
        axiosError.response?.data?.error || "An error occurred";
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  const getCenteredLeft = (scale: number) =>
    Math.round((CANVAS_WIDTH - PROFILE_CARD_WIDTH * scale) / 2);

  const profileCardLayout =
    viewportWidth <= 480
      ? { left: getCenteredLeft(0.9), top: 86, scale: 0.9 }
      : viewportWidth <= 768
        ? { left: getCenteredLeft(0.96), top: 60, scale: 0.96 }
        : viewportWidth <= 900
          ? { left: getCenteredLeft(0.96), top: 56, scale: 0.96 }
          : viewportWidth <= 1024
            ? { left: getCenteredLeft(1.02), top: 30, scale: 1.02 }
            : viewportWidth <= 1280
              ? { left: 278, top: 50, scale: 0.9 }
              : viewportWidth <= 1440
                ? { left: 360, top: 52, scale: 1.02 }
                : { left: 383, top: 45, scale: 1 };

  if (!user) {
    return (
      <div className="flex min-h-full items-center justify-center bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-white">
      {/* Form Card */}
      <div
        className="absolute"
        style={{
          left: `${profileCardLayout.left}px`,
          top: `${profileCardLayout.top}px`,
          width: `${PROFILE_CARD_WIDTH * profileCardLayout.scale}px`,
          height: `${PROFILE_CARD_HEIGHT * profileCardLayout.scale}px`,
        }}
      >
        <div
          className="rounded-[20px] border border-[#CFCFCF] bg-white"
          style={{
            width: `${PROFILE_CARD_WIDTH}px`,
            height: `${PROFILE_CARD_HEIGHT}px`,
            transform: `scale(${profileCardLayout.scale})`,
            transformOrigin: "top left",
          }}
        >
          <h2
            className="
      absolute 
      top-[50px] 
      left-[44px] 
      w-[482px] 
      h-[24px] 
      text-[34px] 
      leading-[39px] 
      font-[400] 
      text-[#2D2D2D] 
      uppercase 
      tracking-[0.006em]
    "
            style={{ fontFamily: "'Acumin Variable Concept', sans-serif" }}
          >
            EDIT YOUR PROFILE
          </h2>

          <form
            onSubmit={handleSubmit}
            className="
    absolute 
    top-[130px]   
    left-[44px]  
    w-[676px] 
    h-auto 
    flex flex-col 
    gap-[28px]
  "
          >
            {/* Name */}
            <div className="flex h-[73px] w-[676px] flex-col gap-[10px]">
              <label
                htmlFor="name"
                className="text-[25px] font-[300] tracking-[-0.021em] text-[#2D2D2D] leading-[100%]"
                style={{ fontFamily: "'Acumin Variable Concept', sans-serif" }}
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="h-[50px] w-full rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] px-[16px] py-[14px] text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-gray-300"
                style={{
                  fontFamily: "'Acumin Variable Concept', sans-serif",
                  fontSize: "18px",
                  fontWeight: 500,
                  lineHeight: "22px",
                }}
              />
            </div>

            {/* Email */}
            <div className="flex h-[73px] w-[676px] flex-col gap-[10px]">
              <label
                htmlFor="email"
                className="text-[25px] font-[300] tracking-[-0.021em] text-[#2D2D2D] leading-[100%]"
                style={{ fontFamily: "'Acumin Variable Concept', sans-serif" }}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                disabled
                className="h-[50px] w-full cursor-not-allowed rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] px-[16px] py-[14px] text-[#1F1F1F] focus:outline-none"
                style={{
                  fontFamily: "'Acumin Variable Concept', sans-serif",
                  fontSize: "18px",
                  fontWeight: 500,
                  lineHeight: "22px",
                }}
              />
            </div>

            {/* Passcode & PIN Row */}
            <div className="flex h-[73px] w-[676px] flex-row gap-[24px]">
              {/* Passcode */}
              <div className="flex h-[73px] w-[326px] shrink-0 flex-col gap-[10px]">
                <label
                  htmlFor="passCode"
                  className="text-[25px] font-[300] tracking-[-0.021em] text-[#2D2D2D] leading-[100%]"
                  style={{ fontFamily: "'Acumin Variable Concept', sans-serif" }}
                >
                  Passcode
                </label>
                <div className="relative">
                  <input
                    id="passCode"
                    name="passCode"
                    type={showPassword ? "text" : "password"}
                    value={formData.passCode}
                    onChange={handleInputChange}
                    placeholder="Enter passcode"
                    className="h-[50px] w-full rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] px-[16px] py-[14px] pr-[45px] text-[#1F1F1F] focus:outline-none focus:ring-0"
                    style={{
                      fontFamily: "'Acumin Variable Concept', sans-serif",
                      fontSize: "18px",
                      fontWeight: 500,
                      lineHeight: "22px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[16px] top-1/2 z-20 -translate-y-1/2 text-[#7B7B7B]"
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
              <div className="flex w-[326px] shrink-0 flex-col gap-[10px]">
                <label
                  htmlFor="pin"
                  className="text-[25px] font-[300] tracking-[-0.021em] text-[#2D2D2D] leading-[100%]"
                  style={{ fontFamily: "'Acumin Variable Concept', sans-serif" }}
                >
                  PIN (Optional)
                </label>
                <div className="flex h-[50px] items-center justify-start gap-[8px]">
                  {pinDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`profile-pin-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(index, e)}
                      className="h-[50px] w-[50px] rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] text-center text-[#1F1F1F] focus:outline-none focus:ring-0"
                      style={{
                        fontFamily: "'Acumin Variable Concept', sans-serif",
                        fontSize: "18px",
                        fontWeight: 500,
                        lineHeight: "22px",
                      }}
                    />
                  ))}
                </div>
                <p
                  className="text-[#2D2D2D]/70"
                  style={{
                    fontFamily: "'Acumin Variable Concept', sans-serif",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "18px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Enter new PIN (leave empty to keep current) - Use PIN for
                  faster login
                </p>
              </div>
            </div>

            {/* Company Name */}
            {!isInvitedUser && (
              <div className="flex h-[73px] w-[676px] flex-col gap-[10px]">
                <label
                  htmlFor="companyName"
                  className="text-[25px] font-[300] tracking-[-0.021em] text-[#2D2D2D] leading-[100%]"
                  style={{ fontFamily: "'Acumin Variable Concept', sans-serif" }}
                >
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="h-[50px] w-full rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] px-[16px] py-[14px] text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-gray-300"
                  style={{
                    fontFamily: "'Acumin Variable Concept', sans-serif",
                    fontSize: "18px",
                    fontWeight: 500,
                    lineHeight: "22px",
                  }}
                />
              </div>
            )}

            {/* Colors row */}
            {!isInvitedUser && (
              <div className="flex h-[73px] w-[676px] flex-row gap-[24px]">
                {/* Primary Color */}
                <div className="flex h-[73px] w-[326px] flex-col gap-[10px]">
                  <label
                    className="text-[25px] font-[300] tracking-[-0.021em] text-[#2D2D2D] leading-[100%]"
                    style={{ fontFamily: "'Acumin Variable Concept', sans-serif" }}
                  >
                    Primary Color
                  </label>
                  <div className="relative flex h-[46px] w-[326px] overflow-hidden rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7]">
                    <input
                      type="color"
                      value={formData.primaryColor || "#000000"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          primaryColor: e.target.value,
                        }))
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className="h-[46px] w-[44px] shrink-0"
                      style={{ backgroundColor: formData.primaryColor }}
                    />
                    <div className="flex h-[46px] w-[282px] items-center gap-[12px] px-[14px]">
                      <span
                        className="flex items-center text-[#2D2D2D] uppercase"
                        style={{
                          fontFamily: "'Acumin Variable Concept', sans-serif",
                          fontSize: "19px",
                          fontWeight: 400,
                          lineHeight: "100%",
                          letterSpacing: "-0.021em",
                        }}
                      >
                        {formData.primaryColor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="flex h-[73px] w-[326px] flex-col gap-[10px]">
                  <label
                    className="text-[25px] font-[300] tracking-[-0.021em] text-[#2D2D2D] leading-[100%]"
                    style={{ fontFamily: "'Acumin Variable Concept', sans-serif" }}
                  >
                    Secondary Color
                  </label>
                  <div className="relative flex h-[46px] w-[326px] overflow-hidden rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7]">
                    <input
                      type="color"
                      value={formData.secondaryColor || "#000000"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          secondaryColor: e.target.value,
                        }))
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className="h-[46px] w-[44px] shrink-0"
                      style={{ backgroundColor: formData.secondaryColor }}
                    />
                    <div className="flex h-[46px] w-[282px] items-center gap-[12px] px-[14px]">
                      <span
                        className="flex items-center text-[#2D2D2D] uppercase"
                        style={{
                          fontFamily: "'Acumin Variable Concept', sans-serif",
                          fontSize: "19px",
                          fontWeight: 400,
                          lineHeight: "100%",
                          letterSpacing: "-0.021em",
                        }}
                      >
                        {formData.secondaryColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logos Row */}
            {!isInvitedUser && (
              <div className="flex h-[186px] w-[676px] flex-row gap-[20px]">
                {/* Company Logo */}
                <div className="flex h-[171px] w-[328px] flex-col gap-[10px]">
                  <label
                    className="text-[25px] font-[300] tracking-[-0.021em] text-[#2D2D2D] leading-[100%]"
                    style={{ fontFamily: "'Acumin Variable Concept', sans-serif" }}
                  >
                    Company Logo
                  </label>
                  <div className="relative flex h-[48px] w-[328px] items-center gap-[10px] overflow-hidden rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] px-[8px] py-[7px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "company")}
                      className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                      id="companyLogo"
                    />
                    <label
                      htmlFor="companyLogo"
                      className="flex w-full cursor-pointer items-center gap-[10px]"
                    >
                      <span
                        className="flex h-[33px] w-[114px] items-center justify-center whitespace-nowrap rounded-[6px] border border-[#E3E3E3] bg-gradient-to-b from-[#F4F4F4] to-[#DEDEDE] text-[#2D2D2D]"
                        style={{
                          fontFamily: "'Acumin Variable Concept', sans-serif",
                          fontSize: "18px",
                          fontWeight: 400,
                          lineHeight: "100%",
                          letterSpacing: "-0.021em",
                        }}
                      >
                        Choose File
                      </span>
                      <span
                        className="truncate text-[#2D2D2D]/50"
                        style={{
                          fontFamily: "'Acumin Variable Concept', sans-serif",
                          fontSize: "18px",
                          fontWeight: 400,
                          lineHeight: "100%",
                          letterSpacing: "-0.021em",
                        }}
                      >
                        {companyLogo ? "File selected" : "No files chosen"}
                      </span>
                    </label>
                  </div>
                  {uploadingLogo && (
                    <p className="text-xs text-[#2d3e50]">Uploading...</p>
                  )}
                  {logoPreview && !uploadingLogo && (
                    <div className="flex h-[86px] w-[249px] items-center justify-start overflow-hidden">
                      <Image
                        src={logoPreview}
                        alt="Company Logo"
                        width={249}
                        height={86}
                        className="max-h-[86px] w-auto max-w-[249px] object-contain object-left"
                      />
                    </div>
                  )}
                </div>

                {/* Profile Photo */}
                <div className="flex h-[186px] w-[328px] flex-col gap-[10px]">
                  <label
                    className="text-[25px] font-[300] tracking-[-0.021em] text-[#2D2D2D] leading-[100%]"
                    style={{ fontFamily: "'Acumin Variable Concept', sans-serif" }}
                  >
                    Profile Photo
                  </label>
                  <div className="relative flex h-[48px] w-[328px] items-center gap-[10px] overflow-hidden rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] px-[8px] py-[7px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "profile")}
                      className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                      id="profilePhoto"
                    />
                    <label
                      htmlFor="profilePhoto"
                      className="flex w-full cursor-pointer items-center gap-[10px]"
                    >
                      <span
                        className="flex h-[33px] w-[114px] items-center justify-center whitespace-nowrap rounded-[6px] border border-[#E3E3E3] bg-gradient-to-b from-[#F4F4F4] to-[#DEDEDE] text-[#2D2D2D]"
                        style={{
                          fontFamily: "'Acumin Variable Concept', sans-serif",
                          fontSize: "18px",
                          fontWeight: 400,
                          lineHeight: "100%",
                          letterSpacing: "-0.021em",
                        }}
                      >
                        Choose File
                      </span>
                      <span
                        className="truncate text-[#2D2D2D]/50"
                        style={{
                          fontFamily: "'Acumin Variable Concept', sans-serif",
                          fontSize: "18px",
                          fontWeight: 400,
                          lineHeight: "100%",
                          letterSpacing: "-0.021em",
                        }}
                      >
                        {profileImage ? "File selected" : "No files chosen"}
                      </span>
                    </label>
                  </div>
                  {uploadingProfile && (
                    <p className="text-xs text-[#2d3e50]">Uploading...</p>
                  )}
                  {profilePreview && !uploadingProfile && (
                    <div className="flex h-[92px] w-[92px] items-center justify-start overflow-hidden">
                      <Image
                        src={profilePreview}
                        alt="Profile"
                        width={92}
                        height={92}
                        className="h-[92px] w-[92px] object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-[10px] flex h-[52px] w-[676px] flex-row items-center gap-[28px]">
              <button
                type="button"
                onClick={handleBack}
                className="flex h-[52px] w-[183px] cursor-pointer items-center justify-center rounded-[30px] bg-[#CECECE] px-[26px] py-[18px] text-[#212121] transition-opacity hover:opacity-90"
                style={{
                  fontFamily: "'Acumin Variable Concept', sans-serif",
                  fontSize: "23px",
                  fontWeight: 400,
                  lineHeight: "100%",
                  letterSpacing: "0.02em",
                }}
              >
                No, Back
              </button>
              <button
                type="submit"
                disabled={
                  updateProfileMutation.isPending ||
                  uploadingProfile ||
                  uploadingLogo
                }
                onClick={handleSubmit}
                className="flex h-[50px] w-[465px] cursor-pointer items-center justify-center rounded-[30px] bg-[#F7AF41] px-[26px] py-[17px] text-[#2D2D2D] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  fontFamily: "'Acumin Variable Concept', sans-serif",
                  fontSize: "23px",
                  fontWeight: 400,
                  lineHeight: "100%",
                  letterSpacing: "0.02em",
                }}
              >
                {updateProfileMutation.isPending ||
                  uploadingProfile ||
                  uploadingLogo
                  ? "Saving..."
                  : "Save it"}
              </button>
            </div>

            {message && (
              <p
                className={`text-center text-sm mt-3 ${message.includes("success") ? "text-green-600" : "text-red-600"
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
