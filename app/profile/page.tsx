"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useUpdateProfile } from "@/lib/hooks";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";
import { UpdateProfileData } from "@/validation/update-profile.validation";

export default function ProfilePage() {
  const { user, isInvitedUser } = useUser();
  const router = useRouter();
  const updateProfileMutation = useUpdateProfile();
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

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6 sm:p-11">
      <div className="w-full max-w-[764px] rounded-[20px] border border-[#CFCFCF] bg-white p-8 sm:p-11">
        <h2 className="text-[34px] font-normal text-[#2D2D2D] uppercase tracking-[0.006em] mb-11 text-center sm:text-left">
          EDIT YOUR PROFILE
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Name & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="name"
                className="text-[25px] font-light tracking-[-0.021em] text-[#2D2D2D] leading-none"
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
                className="h-[50px] w-full rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] px-4 py-3 text-[#1F1F1F] text-[18px] font-medium outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-[25px] font-light tracking-[-0.021em] text-[#2D2D2D] leading-none"
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
                className="h-[50px] w-full cursor-not-allowed rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] px-4 py-3 text-[#1F1F1F] text-[18px] font-medium outline-none"
              />
            </div>
          </div>

          {/* Passcode & PIN Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="passCode"
                className="text-[25px] font-light tracking-[-0.021em] text-[#2D2D2D] leading-none"
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
                  className="h-[50px] w-full rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] px-4 py-3 pr-12 text-[#1F1F1F] text-[18px] font-medium outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7B7B7B]"
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
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="pin"
                className="text-[25px] font-light tracking-[-0.021em] text-[#2D2D2D] leading-none"
              >
                PIN (Optional)
              </label>
              <div className="flex gap-2">
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
                    className="h-[50px] w-[50px] rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] text-center text-[#1F1F1F] text-[18px] font-medium outline-none"
                  />
                ))}
              </div>
              <p className="text-[#2D2D2D]/70 text-[14px] font-normal leading-tight tracking-tight">
                Enter new PIN (leave empty to keep current) - Use PIN for faster
                login
              </p>
            </div>
          </div>

          {/* Company & Colors (only for non-invited) */}
          {!isInvitedUser && (
            <>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="companyName"
                  className="text-[25px] font-light tracking-[-0.021em] text-[#2D2D2D] leading-none"
                >
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="h-[50px] w-full rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] px-4 py-3 text-[#1F1F1F] text-[18px] font-medium outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Primary Color */}
                <div className="flex flex-col gap-1">
                  <label className="text-[25px] font-light tracking-[-0.021em] text-[#2D2D2D] leading-none">
                    Primary Color
                  </label>
                  <div className="relative flex h-[46px] items-center overflow-hidden rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7]">
                    <div
                      className="h-full w-[44px]"
                      style={{ backgroundColor: formData.primaryColor }}
                    />
                    <input
                      type="color"
                      value={formData.primaryColor || "#000000"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          primaryColor: e.target.value,
                        }))
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="flex-1 px-4 text-[#2D2D2D] uppercase text-[19px]">
                      {formData.primaryColor}
                    </span>
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="flex flex-col gap-1">
                  <label className="text-[25px] font-light tracking-[-0.021em] text-[#2D2D2D] leading-none">
                    Secondary Color
                  </label>
                  <div className="relative flex h-[46px] items-center overflow-hidden rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7]">
                    <div
                      className="h-full w-[44px]"
                      style={{ backgroundColor: formData.secondaryColor }}
                    />
                    <input
                      type="color"
                      value={formData.secondaryColor || "#000000"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          secondaryColor: e.target.value,
                        }))
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="flex-1 px-4 text-[#2D2D2D] uppercase text-[19px]">
                      {formData.secondaryColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Company Logo */}
                <div className="flex flex-col gap-1">
                  <label className="text-[25px] font-light tracking-[-0.021em] text-[#2D2D2D] leading-none">
                    Company Logo
                  </label>
                  <div className="relative h-[48px] overflow-hidden rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] flex items-center p-1.5 gap-2">
                    <input
                      type="file"
                      id="companyLogo"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "company")}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <span className="h-full px-4 flex items-center justify-center rounded-[6px] border border-[#E3E3E3] bg-gradient-to-b from-[#F4F4F4] to-[#DEDEDE] text-[#2D2D2D] text-[18px] whitespace-nowrap">
                      Choose File
                    </span>
                    <span className="truncate text-[#2D2D2D]/50 text-[18px]">
                      {companyLogo ? "File selected" : "No files chosen"}
                    </span>
                  </div>
                  {logoPreview && !uploadingLogo && (
                    <div className="mt-2 h-20 relative">
                      <Image
                        src={logoPreview}
                        alt="Logo"
                        fill
                        className="object-contain object-left"
                      />
                    </div>
                  )}
                </div>

                {/* Profile Photo */}
                <div className="flex flex-col gap-1">
                  <label className="text-[25px] font-light tracking-[-0.021em] text-[#2D2D2D] leading-none">
                    Profile Photo
                  </label>
                  <div className="relative h-[48px] overflow-hidden rounded-[8px] border border-[#E3E3E3] bg-[#F7F7F7] flex items-center p-1.5 gap-2">
                    <input
                      type="file"
                      id="profilePhoto"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "profile")}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <span className="h-full px-4 flex items-center justify-center rounded-[6px] border border-[#E3E3E3] bg-gradient-to-b from-[#F4F4F4] to-[#DEDEDE] text-[#2D2D2D] text-[18px] whitespace-nowrap">
                      Choose File
                    </span>
                    <span className="truncate text-[#2D2D2D]/50 text-[18px]">
                      {profileImage ? "File selected" : "No files chosen"}
                    </span>
                  </div>
                  {profilePreview && !uploadingProfile && (
                    <div className="mt-2 size-[101px] relative overflow-hidden border">
                      <Image
                        src={profilePreview}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 h-[52px] rounded-[30px] bg-[#CECECE] text-[#212121] text-[23px] font-normal hover:opacity-90 transition-opacity"
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
              className="flex-[2] h-[52px] rounded-[30px] bg-[#F7AF41] text-[#2D2D2D] text-[23px] font-normal hover:opacity-90 transition-opacity disabled:opacity-50"
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
              className={`text-center text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
