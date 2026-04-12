"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from 'lucide-react';

export default function ResetPassword() {

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);      // เปลี่ยนปุ่มเมื่อกดสำเร็จ

  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const validate = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      newErrors.newPassword = "Please enter the password";
    } else if (newPassword.length < 10) {
      newErrors.newPassword = "Password must be at least 10 characters long";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/.test(newPassword)) {
      newErrors.newPassword = "Password must contain uppercase, lowercase, and number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSuccess(true);   // เมื่อกดสำเร็จแบบไม่มี error จะคืนค่า true
  };

  return(
    <div className="w-full min-h-screen flex bg-[#F2F4F7] px-[120px] py-[64px]">
      <Link href="/login/send-email">
        <ChevronLeft className="text-[#1C1B1F] h-[24px] w-[24px]"/>
      </Link>
      
      <div className="flex flex-col w-full items-center justify-center">
        <p className="text-[#131415] font-gabarito text-[40px] text-center font-medium mt-[10px]">
          Reset your password
        </p>
        <p className="text-[#767A8C] font-gabarito text-[22px] text-center font-medium">
          Please enter your new password
        </p>

        {/* new password */}
        <div className="flex flex-col w-full max-w-[500px] mt-[20px]">
          <p className="text-[#616872] font-gabarito text-[16px] font-medium mb-[16px]">New Password</p>
          <div className={`flex items-center bg-white rounded-lg p-4 
            ${errors.newPassword ? "border border-[#D82D49]" : ""}`}>
            <img src="/lock.svg" className='w-[24px] h-[24px] absolute'/>
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              className="text-[16px] font-gabarito text-black placeholder-[#616872] pl-8 rounded-lg border-none w-full"
            />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="w-[20px] h-[20px]">
              {showNewPassword
                ? <img src="/visibility_off.svg" className="w-[24px] h-[24px]" />
                : <img src="/visibility.svg" className="w-[24px] h-[24px]" />}
            </button>
          </div>
          <p className="text-[#D82D49] text-sm mt-1 pl-2 min-h-[24px]">
            {errors.newPassword ?? ""}
          </p>
        </div>

        {/* confirm password */}
        <div className="flex flex-col w-full max-w-[500px]">
          <p className="text-[#616872] font-gabarito text-[16px] font-medium mb-[16px]">Confirm Password</p>
          <div className={`flex items-center bg-white rounded-lg p-4 
            ${errors.confirmPassword ? "border border-[#D82D49]" : ""}`}>
            <img src="/lock.svg" className='w-[24px] h-[24px] absolute'/>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              className="text-[16px] font-gabarito text-black placeholder-[#616872] pl-8 rounded-lg border-none w-full"
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="w-[20px] h-[20px]">
              {showConfirmPassword
                ? <img src="/visibility_off.svg" className="w-[24px] h-[24px]" />
                : <img src="/visibility.svg" className="w-[24px] h-[24px]" />}
            </button>
          </div>
          <p className="text-[#D82D49] text-sm mt-1 pl-2 min-h-[24px]">
            {errors.confirmPassword ?? ""}
          </p>
        </div>

        {isSuccess ? (
          <Link
            href="/login"
            className="border border-black text-[#616872] text-[16px] font-gabarito font-bold
            py-2 my-4 w-full max-w-[390px] rounded-full text-center block">
              BACK TO LOGIN
          </Link>
        ) : (
          <button
            className="bg-gradient-to-r from-[#03369D] via-[#414548] to-[#6F757B] text-[16px] font-gabarito font-bold text-white 
            py-2 my-4 w-full max-w-[390px] rounded-full"
            onClick={handleSubmit}>
              CONFIRM PASSWORD
          </button>
        )}


      </div>
    </div>
  );
}