// app/form/page.tsx
"use client";
import { useState } from "react";
import { CircleArrowLeft } from "lucide-react"
import StepContent from "./components/StepContent";
import ProgressBar from "./components/ProgressBar";
import Sidebar from "../components/Sidebar";

// import validate function ของแต่ละ step
import { validateStep1 } from "./components/steps/Step1Activity";
import { validateStep2 } from "./components/steps/Step2DataType";
import { validateStep3 } from "./components/steps/Step3LegalBasis";
import { validateStep4 } from "./components/steps/Step4Transfer";
import { ProcessorData } from "./components/steps/Step7Precessor";
import { validateStep5 } from "./components/steps/Step5Retention";

// Type สำหรับ errors ของแต่ละ step
type Errors<FormData> = {
  [K in keyof FormData]?: {
    [F in keyof FormData[K]]?: boolean;
  }
};

export default function FormPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditingProcessor, setIsEditingProcessor] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nextAction, setNextAction] = useState<"prev" | "next" | null>(null);

  const handleBackClick = () => {
    if (isEditingProcessor) {
      setNextAction("prev");
      setShowConfirm(true);
    } else {
      prevStep();
    }
  };

  const handleNextClick = () => {
    if (isEditingProcessor) {
      setNextAction("next");
      setShowConfirm(true);
    } else {
      if (currentStep === steps.length - 1) {
        console.log("Submit form:", formData);
      } else {
        nextStep();
      }
    }
  };

  const confirmAction = () => {
    setShowConfirm(false);
    setIsEditingProcessor(false); // ปิด draft
    if (nextAction === "prev") prevStep();
    if (nextAction === "next") {
      if (currentStep === steps.length - 1) {
        console.log("Submit form:", formData);
      } else {
        nextStep();
      }
    }
  };

  const cancelAction = () => {
    setShowConfirm(false);
  };

  interface FormData {
    step1: { dataOwner: string; dataType: string; processingPurpose: string };
    step2: { dataClass: string; otherText: string; categories: string[]; dataType: string; methods: string[]; dataSource: string };
    step3: { primaryBases: string[]; supplementaryBases: string[]; minorConsent: { under10: string; age10to20: string } };
    step4: { hasTransferAbroad: string; transferCountry: string; isToSubsidiary: string; subsidiaryName: string; transferMethod: string; dataProtectionStandard: string[]; legalExemption: string[] };
    step5: { retentionDD: string; retentionMM: string; retentionYY: string; dataType: string[]; storageMethod: string[]; accessRight: string[]; usageStatus: string; usagePurpose: string };
    step6: any;
    step7: { processors: ProcessorData[] };
  }

  const [formData, setFormData] = useState<FormData>({
    step1: { dataOwner: "", dataType: "", processingPurpose: "" },
    step2: { dataClass: "", otherText: "", categories: [], dataType: "", methods: [], dataSource: "" },
    step3: { primaryBases: [], supplementaryBases: [], minorConsent: { under10: "", age10to20: "" } },
    step4: { hasTransferAbroad: "", transferCountry: "", isToSubsidiary: "", subsidiaryName: "", transferMethod: "", dataProtectionStandard: [], legalExemption: [] },
    step5: { retentionDD: "", retentionMM: "", retentionYY: "", dataType: [], storageMethod: [], accessRight: [], usageStatus: "", usagePurpose: "" },
    step6: {},
    step7: { processors: [] },
  });

  const [errors, setErrors] = useState<Errors<FormData>>({});

  const updateField = <K extends keyof FormData, F extends keyof FormData[K]>(
    stepKey: K,
    field: F,
    value: FormData[K][F]
  ) => {
    setFormData(prev => ({
      ...prev,
      [stepKey]: { ...prev[stepKey], [field]: value } as FormData[K],
    }));

    setErrors(prev => ({
      ...prev,
      [stepKey]: { ...(prev[stepKey] || {}), [field]: false } as Errors<FormData>[K],
    }));
  };

  const validateStep = (step: number) => {
    let stepErrors: any = {};
    switch (step) {
      case 0: stepErrors = validateStep1(formData.step1); break;
      case 1: stepErrors = validateStep2(formData.step2); break;
      case 2: stepErrors = validateStep3(formData.step3); break;
      case 3: stepErrors = validateStep4(formData.step4); break;
      case 4: stepErrors = validateStep5(formData.step5); break;
      case 5: stepErrors = {}; break; // No validation for Step6
      default: stepErrors = {};
    }
    setErrors(prev => ({ ...prev, [`step${step + 1}`]: stepErrors }));
    return !Object.values(stepErrors).some(Boolean);
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep(s => s + 1);
  };
  const prevStep = () => setCurrentStep(s => s - 1);

  const steps = [
    "Activity Information",
    "Type and Sources",
    "Legal and Consent",
    "Sending/Transferring Data",
    "Data Retention and Use",
    "Security",
    "Processor",
  ];

  return (
    <div className="flex min-h-screen bg-[#F2F4F7]">
      <Sidebar />
      <div className="ml-16 flex-1 flex flex-col items-center justify-center py-12 px-8 min-h-screen">
        <div className="w-full max-w-[1000px] mb-10 ">
          <ProgressBar steps={steps} currentStep={currentStep} />
        </div>

        <div className="w-full max-w-[1100px] bg-white rounded-lg shadow-sm px-[160px] py-[60px]">
          <h2 className="text-[#1a3a8f] font-bold text-[22px] text-center mb-[28px] font-gabarito">
            {steps[currentStep]}
          </h2>

          <StepContent<FormData>
            step={currentStep}
            formData={formData}
            errors={errors}
            updateField={updateField}
            step7Props={{
              processors: formData.step7.processors,
              updateProcessors: (v) => updateField("step7", "processors", v),
              setIsEditingProcessor,
            }}
          />


        </div>
        <div className="w-full max-w-[1100px] flex justify-between mt-6">
          {/* Back Button */}
          {currentStep > 0 ? (
            <button
              onClick={handleBackClick}
              className="font-gabarito flex items-center gap-2 px-4 py-2 border border-BLUE rounded-[10px] text-BLUE hover:bg-gray-100 text-sm"
            >
              <CircleArrowLeft size={16} /> Back
            </button>
          ) : (
            <div /> // เว้นว่างด้านซ้ายถ้า Step แรก
          )}

          {/* Next/Submit Button */}
          <button
            onClick={handleNextClick}
            className={`border border-[#1a3a8f] font-gabarito flex items-center gap-2 px-5 py-2 rounded-[10px] text-sm ml-auto
      ${currentStep === steps.length - 1 ? "bg-[#DFE9FF] text-[#1a3a8f]" : "text-BLUE hover:opacity-90"}`}
          >
            {currentStep === steps.length - 1 ? "Submit" : "Next"}
            {currentStep === steps.length - 1 ? null : <CircleArrowLeft size={16} className="rotate-180" />}
          </button>

          {/* Confirm Modal */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-gabarito">
              <div className="bg-white p-6 rounded-[15px] shadow-lg max-w-sm text-center">
                <p className="mb-4 text-sm">
                  you have unsaved changes in the processor details. Are you sure you want to {nextAction === "prev" ? "go back" : "proceed to the next step"} without saving?
                </p>
                <div className="flex justify-around mt-4">
                  <button
                    onClick={confirmAction}
                    className="px-4 py-2 bg-red-500 text-white rounded-[5px] hover:bg-red-600"
                  >
                    exit without saving
                  </button>
                  <button
                    onClick={cancelAction}
                    className="px-4 py-2 bg-gray-300 rounded-[5px] hover:bg-gray-400"
                  >
                    cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}