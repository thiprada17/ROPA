"use client";

import { useState } from "react";
import StepContent from "./components/StepContent";
import ProgressBar from "./components/ProgressBar";

export default function FormPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Activity Information",
    "Type and Sources of Data",
    "Legal Basis and Consent",
    "Sending/Transferring Data Abroad",
    "Data Retention and Use/Disclosure",
    "Security",
  ];

  const nextStep = () => currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6 bg-[#F2F4F7]">

      {/* Progress Bar ตอนแรกจะเอาไว้หน้าแต่เลเอ้าพังมาก ขอแยกกันยุก่อน*/}
      <ProgressBar steps={steps} currentStep={currentStep} />

      {/* ไอที่แสดงเป็นการ์ด */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 transition-all duration-300">
        <h2 className="text-BLUE font-gabarito font-bold text-xl text-center">{steps[currentStep]}</h2>
        <StepContent step={currentStep} />
      </div>

      {/* ปุ่มปุ่ม */}
      <div className="w-full max-w-2xl flex justify-between mt-6">
        {currentStep > 0 ? (
          <button
            onClick={prevStep}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={nextStep}
          className="px-5 py-2 bg-BLUE text-white rounded-md hover:opacity-90"
        >
          {currentStep === steps.length - 1 ? "เสร็จ" : "Next"}
        </button>
      </div>
    </div>
  );
}