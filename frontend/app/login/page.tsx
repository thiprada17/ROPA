"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // errors เก็บ object ของ error message แต่ละ field เช่น { email: "...", password: "..." }
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  {/* validate function returns error object */}
  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Please enter the email";
    } 
    
    if (!password) {
      newErrors.password = "Please enter the password";
    }
    else if (password.length < 10) {
      newErrors.password = "Password must be at least 10 characters long";
    }

    return newErrors;
  };


  {/* handleLogin function เรียกใช้ตอนกด login button */}
  const handleLogin = async () => {
    // เรียก validate() เพื่อเช็ค error ก่อน
    const validationErrors = validate();

    // ถ้ามี error (object ไม่ว่าง) ให้ set errors และหยุดการทำงาน
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // ถ้าผ่าน validation ให้ clear errors และดำเนินการ login ต่อ
    setErrors({});
    setLoading(true);

    try {
    const res = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: email,
        password: password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    localStorage.setItem("token", data.token);

    router.push("/Ropa");

  } catch (err) {
    console.error(err);
    setErrors({
      password: err.message,
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full min-h-screen flex items-center justify-center 
      bg-[url('/login_bg.png')] bg-cover bg-top">
      
      {/* login card */}
      <div className="bg-white/20 backdrop-filter backdrop-blur-lg 
        border-t-[0.5px] border-b-[0.5px] border-gray-200 
        rounded-3xl shadow-lg px-6 pb-6 h-[500px] w-[500px]
        flex flex-col">
        <p className="text-[#131415] font-gabarito text-5xl text-center font-bold my-16">
          login
        </p>
        
        <div className="flex-1">
          <div className="flex flex-col">

            {/* username/email */}
            <div className="mb-2">
              <div className={`flex items-center bg-white rounded-lg p-4 
                ${errors.email ? "border border-[#D82D49]" : ""}`}>
                <img  src="/person.svg" className='w-[24px] h-[24px] absolute'/>
                <input type="text" id="username" title='Enter the Username/Email' 
                  value={email}
                  onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                  placeholder="Username/Email"
                  className="text-[16px] font-gabarito text-black placeholder-[#616872] 
                  pl-8 border-none w-full"/>
              </div>

              {/* แสดง error message ใต้ field ถ้ามี */}
              <p className="text-[#D82D49] text-sm mt-1 pl-2 min-h-[24px]">
                {errors.email ?? ""}</p>
            </div>
      
            {/* password */}
            <div>
              <div className={`flex items-center bg-white rounded-lg p-4 
                ${errors.password ? "border border-[#D82D49]" : ""}`}>
                <img src="/lock.svg" className='w-[24px] h-[24px] absolute'/>
                <input type={showPassword ? "text" : "password"}  title='Enter the Password' 
                  value={password}
                  onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                  placeholder="Password"
                  className="text-[16px] font-gabarito text-black placeholder-[#616872] 
                    pl-8 rounded-lg border-none w-full"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="w-[20px] h-[20px]">
                  {showPassword
                    ? <img src="/visibility_off.svg" className="w-[24px] h-[24px]" />
                    : <img src="/visibility.svg" className="w-[24px] h-[24px]" />}
                </button>
              </div>
              
              <div className="flex  mt-1">
                <p className="text-[#D82D49] text-sm pl-2 min-h-[20px]">
                {errors.password ?? ""}</p>
                <Link href="/login/send-email"
                  className="text-[16px] font-gabarito text-black ml-auto">
                  Forgot password?
                </Link>
              </div>
              {/* แสดง error message ใต้ field ถ้ามี */}
              
            </div>
          </div>

          
        </div>

        {/* login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-gradient-to-b from-[#6F757B] to-[#131415] text-[16px] font-medium font-gabarito text-white 
          py-2 mb-4 w-full rounded-full transition 
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "LOGGING IN..." : "LOGIN"}
        </button>
        
      </div>

    </div>
  );
}