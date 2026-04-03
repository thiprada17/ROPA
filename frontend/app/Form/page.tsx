// app/form/page.tsx
"use client";

import { useState } from "react";
import StepContent from "./components/StepContent";

export default function FormPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Stage 1: ข้อมูลผู้ควบคุมและกิจกรรม",
    "Stage 2: ประเภทและแหล่งข้อมูล",
    "Stage 3: ฐานทางกฎหมายและความยินยอม",
    "Stage 4: การส่ง/โอนข้อมูลไปต่างประเทศ",
    "Stage 5: การเก็บรักษาและใช้/เปิดเผยข้อมูล",
    "Stage 6: มาตรการความมั่นคงปลอดภัย",
  ];

  const nextStep = () => currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);

  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6 bg-[#F2F4F7]">
      {/* Progress Bar */}
      <div className="w-full max-w-3xl mb-6">
        <div className="flex justify-between items-center mb-2">
          {steps.map((title, index) => (
            <div
              key={index}
              className={`flex-1 text-center text-sm font-bold ${
                index <= currentStep ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {title}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-300 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Content Card */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 transition-all duration-300">
        <h2 className="text-blue-600 font-bold text-xl text-center">{steps[currentStep]}</h2>
        <StepContent step={currentStep} />

        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}