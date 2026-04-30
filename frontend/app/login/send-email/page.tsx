"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from 'lucide-react';

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = "Please enter the email";
    }
    return newErrors;
  };

  const handleReset = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      const res = await fetch("https://ropa-server.onrender.com/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })


      const text = await res.text()
      console.log(text)

      if (!res.ok) {
        // setErrors({ email: data.error });
        return
      }

      sessionStorage.setItem('reset_email', email)
      router.push("/login/verify-email")
    } catch (error) {
      console.log(error)
      alert('error จ้าขี้เกียจเขียนดีๆเด่วมาแก้นะ')
    }
  }

  return (
    <div className="w-full min-h-screen flex 
      bg-[#F2F4F7] px-[120px] py-[64px]">
      <Link href="/login">
        <ChevronLeft className="text-[#1C1B1F] h-[24px] w-[24px]" />
      </Link>

      <div className="flex flex-col w-full items-center justify-center">
        <img src="/mail.svg" className="w-[500px]" />
        <p className="text-[#131415] font-gabarito text-[40px] text-center font-medium mt-[10px]">
          Forgot Password
        </p>
        <p className="text-[#767A8C] font-gabarito text-[22px] text-center font-medium">
          Enter your email to recover your password
        </p>

        <div className={`flex items-center bg-white rounded-lg p-4 mt-[20px] w-full max-w-[500px] shadow-md 
            ${errors.email ? "border border-[#D82D49]" : "border border-black"}`}>
          <img src="/email.svg" className='w-[24px] h-[24px] absolute' />
          <input type="text" id="username" title='Enter the Username/Email'
            placeholder="Username/Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-[16px] font-gabarito text-black placeholder-[#616872] 
              pl-8 border-none w-full"
          />
        </div>
        <p className="text-[#D82D49] text-sm mt-1 pl-2 min-h-[24px] w-[500px] text-left">
          {errors.email ?? ""}</p>

        {/* Reset button */}
        <button
          className="bg-gradient-to-r from-[#03369D] via-[#414548] to-[#6F757B] text-[20px] font-gabarito font-bold text-white 
            py-2 my-4 w-full max-w-[390px] rounded-full"
          onClick={handleReset}>
          Recover Password
        </button>
      </div>
    </div>

  );
}