"use client";
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import Link from "next/link";
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation'

export default function VerifyEmail() {
  const router = useRouter();
  {/* สำหรับOTPและนับถอยหลัง */ }
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));    // array 6 ช่อง
  const [timeLeft, setTimeLeft] = useState(300);                  // 300วินาที = 5นาที
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  {/* Countdown timer */ }
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  {/* แปลงให้เวลาเป็น format ดีๆ */ }
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;                               // ถ้าไม่ใช่ตัวเลขหรือค่าว่างให้ return ออก ป้องกันตัวพิเศษ
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();  // พิมพ์แล้วกระโดดไปช่องต่อไปอัตโนมัติ
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();                        // กด backspace แล้วย้อนกลับไปช่องก่อนหน้า
    }
  };

  {/* ส่งค่าใหม่ & reset เวลา */ }
  const handleResend = async () => {
    const email = sessionStorage.getItem("reset_email")
    if (!email) return;

    setTimeLeft(300);
    setOtp(Array(6).fill(""));
    inputsRef.current[0]?.focus();

    await fetch("https://ropa-server.onrender.com/api/auth/forget-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  }

  const handleVerify = async () => {
    const otpValue = otp.join('')

    if (otpValue.length !== 6) {
      return
    }

    const email = sessionStorage.getItem("reset_email");
    if (!email) {
      return;
    }

    try {
      const res = await fetch("https://ropa-server.onrender.com/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        return;
      }

      // เก็บ OTP ไว้ด้วย เพราะหน้า reset-password ต้องใช้ยืนยันอีกรอบ
      sessionStorage.setItem("reset_otp", otpValue);
      router.push("/login/reset-password");

    } catch (error) {
      alert(error)
    }
  }




  return (
    <div className="w-full min-h-screen flex 
      bg-[#F2F4F7] px-[120px] py-[64px]">
      <Link href="/login/send-email">
        <ChevronLeft className="text-[#1C1B1F] h-[24px] w-[24px]" />
      </Link>

      <div className="flex flex-col w-full items-center justify-center">
        <img src="/bell.svg" className="w-[300px]" />
        <p className="text-[#131415] font-gabarito text-[40px] text-center font-medium mt-[20px]">
          Verify Your Email
        </p>
        <p className="text-[#767A8C] font-gabarito text-[22px] text-center font-medium">
          We’ve sent the code to your phone
        </p>


        {/* OTP Input Boxes */}
        <div className="flex gap-[13px] mt-[30px]">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-[50px] h-[50px] text-center text-[40px] font-medium font-gabarito text-[#616872] 
                  border-[1px] border-[#DBE1E8] rounded-[10px] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.25)]
                  outline-none transition-all focus:border-[#767A8C]"
            />
          ))}
        </div>

        {/* Countdown Timer */}
        <p className="text-[#767A8C] text-[16px] font-normal mt-3 font-gabarito">
          Code expires in:{" "}
          <span className="text-[#131415]">
            {formatTime(timeLeft)}
          </span>
        </p>


        {/* Buttons */}
        <button
          onClick={handleVerify}
          disabled={otp.join("").length !== 6}
          className="bg-gradient-to-r from-[#03369D] via-[#414548] to-[#6F757B] text-[16px] font-gabarito font-bold text-white
          py-2 mt-[30px] w-full max-w-[390px] rounded-full disabled:opacity-50">
          VERIFY
        </button>
        <button
          onClick={handleResend}
          disabled={timeLeft > 0}
          // ปุ่ม Resend กด disabled จนกว่าเวลาจะหมด
          className="border-[1px] border-black bg-transparent text-[16px] font-gabarito font-bold text-[#616872]
          mt-[16px] w-full max-w-[390px] py-2 rounded-full disabled:opacity-40">
          {timeLeft > 0 ? `RESEND (${formatTime(timeLeft)})` : "RESEND CODE"}
        </button>
      </div>
    </div>
  );
}