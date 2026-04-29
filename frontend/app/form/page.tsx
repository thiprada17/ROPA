// app/form/page.tsx
"use client";
import { useEffect, useState } from "react";
import { CircleArrowLeft } from "lucide-react";
import StepContent from "./components/StepContent";
import ProgressBar from "./components/ProgressBar";
import Sidebar from "../components/Sidebar";
import { Suspense } from "react";

// import validate function ของแต่ละ step
import { validateStep1 } from "./components/steps/Step1Activity";
import { validateStep2 } from "./components/steps/Step2DataType";
import { validateStep3 } from "./components/steps/Step3LegalBasis";
import { validateStep4 } from "./components/steps/Step4Transfer";
import { ProcessorData } from "./components/steps/Step7Processor";
import { validateStep5 } from "./components/steps/Step5Retention";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingScreen from "../components/Loading";

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
  departments: {
    id: string;
    name: string;
    label?: string;
    value?: string;
    description?: string | null;
  }[];
};

type Errors<FormData> = {
  [K in keyof FormData]?: {
    [F in keyof FormData[K]]?: boolean;
  };
};

function FormPageContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditingProcessor, setIsEditingProcessor] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nextAction, setNextAction] = useState<"prev" | "next" | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [formOptions, setFormOptions] = useState<FormOptions | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode");
  const activityId = searchParams.get("id");
  const isEditMode = mode === "edit" && !!activityId;
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
      description: string;
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
      description: "",
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

  useEffect(() => {
    if (!isEditMode) return;

    const fetchOldForm = async () => { //อยุ่นี่นะฝ้าย ข้อมูลฟอร์มเดิม
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:8000/api/form/activity/${activityId}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "โหลดข้อมูลเดิมไม่สำเร็จ");
        }

        setFormData((prev) => ({
          ...prev,
          step1: { ...prev.step1, ...(data.step1 || {}) },
          step2: { ...prev.step2, ...(data.step2 || {}) },
          step3: {
            ...prev.step3,
            ...(data.step3 || {}),
            minorConsent: {
              ...prev.step3.minorConsent,
              ...(data.step3?.minorConsent || {}),
            },
          },
          step4: { ...prev.step4, ...(data.step4 || {}) },
          step5: { ...prev.step5, ...(data.step5 || {}) },
          step6: {
            selectedSecurity: data.step6?.selectedSecurity || {},
            securityDetails: data.step6?.securityDetails || {},
          },
          step7: {
            processors: data.step7?.processors || [],
          },
        }));
      } catch (err: any) {
        console.error("fetchOldForm error:", err);
        alert(err.message || "โหลดข้อมูลเดิมไม่สำเร็จ");
      }
    };

    fetchOldForm();
  }, [isEditMode, activityId]);

  const updateField = <K extends keyof FormData, F extends keyof FormData[K]>(
    stepKey: K,
    field: F,
    value: FormData[K][F],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [stepKey]: { ...prev[stepKey], [field]: value } as FormData[K],
    }));

    setErrors((prev) => ({
      ...prev,
      [stepKey]: {
        ...(prev[stepKey] || {}),
        [field]: false,
      } as Errors<FormData>[K],
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
      const userId = localStorage.getItem("user_id");

      if (!token) {
        alert("Please login to proceed.");
        return;
      }

      const url = isEditMode
        ? `http://localhost:8000/api/form/activity/${activityId}`
        : "http://localhost:8000/api/form/submit";

      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(userId ? { "x-user-id": userId } : {}),
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(
          isEditMode
            ? "Form updated successfully!"
            : "Form submitted successfully!",
        );
        console.log("SUCCESS:", data);
        router.push("/Ropa");
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

  if (loadingOptions) return <LoadingScreen message="กำลังโหลดฟอร์ม..." />;

  if (optionsError || !formOptions) {
    return (
      <div className="p-10 text-red-500">
        {optionsError || "Failed to load form options."}
      </div>
    );
  }
  const toOption = (x: any) => ({
  id: x.id,
  name: x.name,
  label: x.label ?? x.name,
  value: x.value ?? x.id,
});

  const mappedOptions = {
  departments: formOptions.departments.map((d) => ({
    id: d.id,
    name: d.name,
    label: d.label ?? d.name,
    value: d.value ?? d.id,
  })),

  activityNames: formOptions.activityNames.map((a) => ({
    id: a.id,
    name: a.name,
    label: a.name,
    value: a.id,
  })),

  purposes: formOptions.purposes.map(toOption),

  dataCategories: formOptions.dataCategories.map(toOption),
  dataTypes: formOptions.dataTypes.map(toOption),
  acquisitionMethods: formOptions.acquisitionMethods.map(toOption),
  dataSources: formOptions.dataSources.map(toOption),

  legalBases: formOptions.legalBases.map(toOption),
  deletionMethods: formOptions.deletionMethods.map(toOption),
  transferMethods: formOptions.transferMethods.map(toOption),
  protectionStandards: formOptions.protectionStandards.map(toOption),
  legalExemptions: formOptions.legalExemptions.map(toOption),
  retentionStorageTypes: formOptions.retentionStorageTypes.map(toOption),
  retentionStorageMethods: formOptions.retentionStorageMethods.map(toOption),
  usagePurposes: formOptions.usagePurposes.map(toOption),
  accessRights: formOptions.accessRights.map(toOption),
};

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* <Sidebar /> */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-8 min-h-screen">
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
                  you have unsaved changes in the processor details. Are you
                  sure you want to{" "}
                  {nextAction === "prev"
                    ? "go back"
                    : "proceed to the next step"}{" "}
                  without saving?
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

export default function FormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormPageContent />
    </Suspense>
  );
}