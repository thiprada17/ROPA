// app/form/page.tsx
"use client";
import { useEffect, useState } from "react";
import { CircleArrowLeft } from "lucide-react";
import StepContent from "./components/StepContent";
import ProgressBar from "./components/ProgressBar";
import Sidebar from "../components/Sidebar";

// import validate function ของแต่ละ step
import { validateStep1 } from "./components/steps/Step1Activity";
import { validateStep2 } from "./components/steps/Step2DataType";
import { validateStep3 } from "./components/steps/Step3LegalBasis";
import { validateStep4 } from "./components/steps/Step4Transfer";
import { ProcessorData } from "./components/steps/Step7Processor";
import { validateStep5 } from "./components/steps/Step5Retention";

type Option = {
  label: string;
  value: string;
};

type FormOptions = {
  activityNames: { id: string; name: string; department_id: string | null }[];
  purposes: { id: string; name: string }[];
  dataCategories: { id: string; name: string }[];
  dataTypes: { id: string; name: string }[];
  acquisitionMethods: { id: string; name: string }[];
  dataSources: { id: string; name: string }[];
  legalBases: { id: string; name: string }[];
  deletionMethods: { id: string; name: string }[];
  transferMethods: { id: string; name: string }[];
  protectionStandards: { id: string; name: string }[];
  legalExemptions: { id: string; name: string }[];
  retentionStorageTypes: { id: string; name: string }[];
  retentionStorageMethods: { id: string; name: string }[];
  usagePurposes: { id: string; name: string }[];
  accessRights: { id: string; name: string }[];
  departments: { id: string; department_name: string; description?: string | null }[];
};

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
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [formOptions, setFormOptions] = useState<FormOptions | null>(null);

  interface FormData {
    step1: {
      dataOwner: string;
      departmentId: string;
      processActivity: string;
      processingPurpose: string;
    };
    step2: {
      dataClass: string;
      otherText: string;
      categories: string[];
      dataType: string;
      methods: string[];
      dataSource: string;
    };
    step3: {
      primaryBases: string[];
      supplementaryBases: string[];
      minorConsent: { under10: string; age10to20: string };
    };
    step4: {
      hasTransferAbroad: string;
      transferCountry: string;
      isToSubsidiary: string;
      subsidiaryName: string;
      transferMethod: string;
      dataProtectionStandard: string[];
      legalExemption: string[];
    };
    step5: {
      retentionDD: string;
      retentionMM: string;
      retentionYY: string;
      dataType: string[];
      storageMethod: string[];
      accessRight: string[];
      destructionMethod: string;
      usageStatus: string;
      usagePurpose: string;
      refusalNote: string;
    };
    step6: {
      selectedSecurity?: Record<string, boolean>;
      securityDetails?: Record<string, string>;
    };
    step7: { processors: ProcessorData[] };
  }

  const [formData, setFormData] = useState<FormData>({
    step1: {
      dataOwner: "",
      departmentId: "",
      processActivity: "",
      processingPurpose: "",
    },
    step2: {
      dataClass: "",
      otherText: "",
      categories: [],
      dataType: "",
      methods: [],
      dataSource: "",
    },
    step3: {
      primaryBases: [],
      supplementaryBases: [],
      minorConsent: { under10: "", age10to20: "" },
    },
    step4: {
      hasTransferAbroad: "",
      transferCountry: "",
      isToSubsidiary: "",
      subsidiaryName: "",
      transferMethod: "",
      dataProtectionStandard: [],
      legalExemption: [],
    },
    step5: {
      retentionDD: "",
      retentionMM: "",
      retentionYY: "",
      dataType: [],
      storageMethod: [],
      accessRight: [],
      destructionMethod: "",
      usageStatus: "",
      usagePurpose: "",
      refusalNote: "",
    },
    step6: {
      selectedSecurity: {},
      securityDetails: {},
    },
    step7: { processors: [] },
  });

  const [errors, setErrors] = useState<Errors<FormData>>({});

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8000/api/form/options", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch form options");
        }

        setFormOptions(data);
      } catch (err: any) {
        console.error("fetchOptions error:", err);
        setOptionsError(err.message || "โหลดตัวเลือกฟอร์มไม่สำเร็จ");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const updateField = <K extends keyof FormData, F extends keyof FormData[K]>(
    stepKey: K,
    field: F,
    value: FormData[K][F]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [stepKey]: { ...prev[stepKey], [field]: value } as FormData[K],
    }));

    setErrors((prev) => ({
      ...prev,
      [stepKey]: { ...(prev[stepKey] || {}), [field]: false } as Errors<FormData>[K],
    }));
  };

  const validateStep = (step: number) => {
    let stepErrors: any = {};
    switch (step) {
      case 0:
        stepErrors = validateStep1(formData.step1);
        break;
      case 1:
        stepErrors = validateStep2(formData.step2);
        break;
      case 2:
        stepErrors = validateStep3(formData.step3);
        break;
      case 3:
        stepErrors = validateStep4(formData.step4);
        break;
      case 4:
        stepErrors = validateStep5(formData.step5);
        break;
      case 5:
        stepErrors = {};
        break;
      default:
        stepErrors = {};
    }

    setErrors((prev) => ({ ...prev, [`step${step + 1}`]: stepErrors }));
    return !Object.values(stepErrors).some(Boolean);
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((s) => s + 1);
  };

  const prevStep = () => setCurrentStep((s) => s - 1);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to proceed.");
        return;
      }

      const res = await fetch("http://localhost:8000/api/form/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Form submitted successfully!");
        console.log("SUCCESS:", data);
      } else {
        alert(`Submission failed: ${data.error || "Unknown error"}`);
        console.error("SUBMIT ERROR:", data);
      }
    } catch (err) {
      console.error("NETWORK ERROR:", err);
      alert("Unable to connect to the server.");
    }
  };

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
      return;
    }

    if (currentStep === steps.length - 1) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  const confirmAction = () => {
    setShowConfirm(false);
    setIsEditingProcessor(false);

    if (nextAction === "prev") prevStep();
    if (nextAction === "next") {
      if (currentStep === steps.length - 1) {
        handleSubmit();
      } else {
        nextStep();
      }
    }
  };

  const cancelAction = () => setShowConfirm(false);

  const steps = [
    "Activity Information",
    "Type and Sources",
    "Legal and Consent",
    "Sending/Transferring Data",
    "Data Retention and Use",
    "Security",
    "Processor",
  ];

  if (loadingOptions) {
    return <div className="p-10">Loading form options...</div>;
  }

  if (optionsError || !formOptions) {
    return <div className="p-10 text-red-500">{optionsError || "Failed to load form options."}</div>;
  }

  const mappedOptions = {
  departments: formOptions.departments.map((d) => ({
    label: d.department_name,
    value: d.id,
  })),
  activityNames: formOptions.activityNames.map((a) => ({
    label: a.name,
    value: a.id,
  })),
  purposes: formOptions.purposes.map((p) => ({
    label: p.name,
    value: p.id,
  })),

  dataCategories: formOptions.dataCategories,
  dataTypes: formOptions.dataTypes,
  acquisitionMethods: formOptions.acquisitionMethods,
  dataSources: formOptions.dataSources,

  legalBases: formOptions.legalBases.map((x) => ({
    label: x.name,
    value: x.id,
  })),
  deletionMethods: formOptions.deletionMethods.map((x) => ({
    label: x.name,
    value: x.id,
  })),
  transferMethods: formOptions.transferMethods.map((x) => ({
    label: x.name,
    value: x.id,
  })),
  protectionStandards: formOptions.protectionStandards.map((x) => ({
    label: x.name,
    value: x.id,
  })),
  legalExemptions: formOptions.legalExemptions.map((x) => ({
    label: x.name,
    value: x.id,
  })),
  retentionStorageTypes: formOptions.retentionStorageTypes.map((x) => ({
    label: x.name,
    value: x.id,
  })),
  retentionStorageMethods: formOptions.retentionStorageMethods.map((x) => ({
    label: x.name,
    value: x.id,
  })),
  usagePurposes: formOptions.usagePurposes.map((x) => ({
    label: x.name,
    value: x.id,
  })),
  accessRights: formOptions.accessRights.map((x) => ({
    label: x.name,
    value: x.id,
  })),
};

  return (
    <div className="flex min-h-screen bg-[#F2F4F7]">
      <Sidebar />
      <div className="ml-16 flex-1 flex flex-col items-center justify-center py-12 px-8 min-h-screen">
        <div className="w-full max-w-[1000px] mb-10">
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
            options={mappedOptions}
            step7Props={{
              processors: formData.step7.processors,
              updateProcessors: (v) => updateField("step7", "processors", v),
              setIsEditingProcessor,
            }}
          />
        </div>

        <div className="w-full max-w-[1100px] flex justify-between mt-6">
          {currentStep > 0 ? (
            <button
              onClick={handleBackClick}
              className="font-gabarito flex items-center gap-2 px-4 py-2 border border-BLUE rounded-[10px] text-BLUE hover:bg-gray-100 text-sm"
            >
              <CircleArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNextClick}
            className={`border border-[#1a3a8f] font-gabarito flex items-center gap-2 px-5 py-2 rounded-[10px] text-sm ml-auto ${
              currentStep === steps.length - 1
                ? "bg-[#DFE9FF] text-[#1a3a8f]"
                : "text-BLUE hover:opacity-90"
            }`}
          >
            {currentStep === steps.length - 1 ? "Submit" : "Next"}
            {currentStep === steps.length - 1 ? null : (
              <CircleArrowLeft size={16} className="rotate-180" />
            )}
          </button>

          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-gabarito">
              <div className="bg-white p-6 rounded-[15px] shadow-lg max-w-sm text-center">
                <p className="mb-4 text-sm">
                  you have unsaved changes in the processor details. Are you sure you want to{" "}
                  {nextAction === "prev" ? "go back" : "proceed to the next step"} without saving?
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