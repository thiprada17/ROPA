"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from 'lucide-react';

export default function ResetPassword() {
  return(
    <div className="w-full min-h-screen flex items-center justify-center 
      bg-[#F2F4F7]">
        <ChevronLeft />
    </div>
  );
}