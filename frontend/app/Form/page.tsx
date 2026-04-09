// app/form/page.tsx
"use client";

import { useState } from "react";
import StepContent from "./components/StepContent";
import ProgressBar from "./components/ProgressBar";
import Sidebar from "../components/Sidebar";

export default function FormPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Activity Information",
    "Type and Sources",
    "Legal and Consent",
    "Sending/Transferring Data",
    "Data Retention and Use/Disclosure",
    "Security",
  ];

  const nextStep = () => currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);

  return (
    <div className="flex min-h-screen bg-[#F2F4F7]">
      <Sidebar />

      {/* main */}
      <div className="ml-16 flex-1 flex flex-col items-center justify-center py-12 px-8 min-h-screen">

        {/* progress Bar */}
        <div className="w-full max-w-[1000px] mb-10 ">
          <ProgressBar steps={steps} currentStep={currentStep} />
        </div>

        {/* card */}
        <div className="w-full max-w-[1100px] bg-white rounded-lg shadow-sm px-[160px] py-[60px]">
          <h2 className="text-[#1a3a8f] font-bold text-[22px] text-center mb-6 font-gabarito">
            {currentStep === 1 ? "Data type and Sources" : steps[currentStep]}
          </h2>
          <StepContent step={currentStep} />
        </div>

        {/* buttons */}
        <div className="w-full max-w-[1100px] flex justify-between mt-6">
          {currentStep > 0 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 text-sm"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2 bg-[#1a3a8f] text-white rounded-full hover:opacity-90 text-sm ml-auto"
          >
            {currentStep === steps.length - 1 ? "เสร็จ" : "Next"} →
          </button>
        </div>

      </div>
    </div>
  );
}