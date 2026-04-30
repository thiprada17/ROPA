// app/form/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { CircleArrowLeft } from "lucide-react";
import StepContent from "./components/StepContent";
import ProgressBar from "./components/ProgressBar";

// import validate function ของแต่ละ step
import { validateStep1 } from "./components/steps/Step1Activity";
import { validateStep2 } from "./components/steps/Step2DataType";
import { validateStep3 } from "./components/steps/Step3LegalBasis";
import { validateStep4 } from "./components/steps/Step4Transfer";
import { ProcessorData } from "./components/steps/Step7Processor";
import { validateStep5 } from "./components/steps/Step5Retention";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingScreen from "../components/Loading";

type Option = {
  id: string;
  name: string;
  label: string;
  value: string;
};

type FormOptions = {
  activityNames: {
    id: string;
    name: string;
    label: string;
    value: string;
    department_id?: string | null;
  }[];
  purposes: Option[];
  dataCategories: Option[];
  dataTypes: Option[];
  acquisitionMethods: Option[];
  dataSources: Option[];
  legalBases: Option[];
  deletionMethods: Option[];
  transferMethods: Option[];
  protectionStandards: Option[];
  legalExemptions: Option[];
  retentionStorageTypes: Option[];
  retentionStorageMethods: Option[];
  usagePurposes: Option[];
  accessRights: Option[];
  securityMeasures: Option[];
  departments: {
    id: string;
    name: string;
    label: string;
    value: string;
    description?: string | null;
  }[];
};

type Errors<FormData> = {
  [K in keyof FormData]?: { [F in keyof FormData[K]]?: boolean };
};

export default function FormPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditingProcessor, setIsEditingProcessor] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nextAction, setNextAction] = useState<"prev" | "next" | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
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

  const OPTIONS_CACHE_KEY = "ropa_form_options_cache";
  const OPTIONS_CACHE_TTL = 10 * 60 * 1000; // 10 นาที

  const getCachedOptions = () => {
    try {
      const raw = sessionStorage.getItem(OPTIONS_CACHE_KEY);
      if (!raw) return null;

      const cached = JSON.parse(raw);
      if (!cached?.data || !cached?.savedAt) return null;

      const isExpired = Date.now() - cached.savedAt > OPTIONS_CACHE_TTL;
      if (isExpired) return null;

      return cached.data;
    } catch {
      return null;
    }
  };

  const setCachedOptions = (data: FormOptions) => {
    try {
      sessionStorage.setItem(
        OPTIONS_CACHE_KEY,
        JSON.stringify({
          data,
          savedAt: Date.now(),
        }),
      );
    } catch {
      // ถ้า browser block storage ก็ไม่ต้องพัง
    }
  };

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payloadPart = token.split(".")[1];

        if (payloadPart) {
          const payload = JSON.parse(
            atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")),
          );

          const id =
            payload?.user_id ||
            payload?.userId ||
            payload?.id ||
            payload?.uid ||
            payload?.sub;

          if (id) {
            localStorage.setItem("user_id", id);
            return id;
          }
        }
      } catch {
        // token decode ไม่ได้ก็ข้าม
      }
    }

    return localStorage.getItem("user_id") || "";
  };
  // ================= INITIAL LOAD: OPTIONS + OLD FORM =================
  useEffect(() => {
    let ignore = false;

    const loadInitialData = async () => {
      try {
        setLoadingOptions(true);
        setLoadingEdit(isEditMode);
        setOptionsError("");

        const token = localStorage.getItem("token");
        getCurrentUserId();

        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const cachedOptions = getCachedOptions();

        const optionsPromise = cachedOptions
          ? Promise.resolve({
              ok: true,
              fromCache: true,
              data: cachedOptions,
            })
          : fetch("http://localhost:8000/api/form/options", {
              headers,
            }).then(async (res) => {
              const data = await res.json();
              return {
                ok: res.ok,
                fromCache: false,
                data,
              };
            });

        const oldFormPromise = isEditMode
          ? fetch(`http://localhost:8000/api/form/activity/${activityId}`, {
              headers,
            })
          : Promise.resolve(null);

        const [optionsResult, oldFormRes] = await Promise.all([
          optionsPromise,
          oldFormPromise,
        ]);

        if (!optionsResult.ok) {
          throw new Error(
            optionsResult.data?.error ||
              optionsResult.data?.detail ||
              "Failed to fetch form options",
          );
        }

        if (ignore) return;

        setFormOptions(optionsResult.data);

        if (!optionsResult.fromCache) {
          setCachedOptions(optionsResult.data);
        }

        if (oldFormRes) {
          const oldFormData = await oldFormRes.json();

          if (!oldFormRes.ok) {
            throw new Error(
              oldFormData.error ||
                oldFormData.detail ||
                "โหลดข้อมูลเดิมไม่สำเร็จ",
            );
          }

          if (ignore) return;

          setFormData((prev) => ({
            ...prev,
            step1: { ...prev.step1, ...(oldFormData.step1 || {}) },
            step2: { ...prev.step2, ...(oldFormData.step2 || {}) },
            step3: {
              ...prev.step3,
              ...(oldFormData.step3 || {}),
              minorConsent: {
                ...prev.step3.minorConsent,
                ...(oldFormData.step3?.minorConsent || {}),
              },
            },
            step4: { ...prev.step4, ...(oldFormData.step4 || {}) },
            step5: { ...prev.step5, ...(oldFormData.step5 || {}) },
            step6: {
              selectedSecurity: oldFormData.step6?.selectedSecurity || {},
              securityDetails: oldFormData.step6?.securityDetails || {},
            },
            step7: {
              processors: oldFormData.step7?.processors || [],
            },
          }));
        }
      } catch (err: any) {
        console.error("loadInitialData error:", err);
        if (!ignore) {
          setOptionsError(err.message || "โหลดข้อมูลฟอร์มไม่สำเร็จ");
        }
      } finally {
        if (!ignore) {
          setLoadingOptions(false);
          setLoadingEdit(false);
        }
      }
    };

    loadInitialData();

    return () => {
      ignore = true;
    };
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

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      setLoadingSubmit(true);

      const token = localStorage.getItem("token");
      const userId = getCurrentUserId();
      if (!userId) {
  alert("ไม่พบ user id กรุณา login ใหม่");
  return;
}

      if (!token) {
        alert("Please login to proceed.");
        return;
      }

      const url = isEditMode
        ? `http://localhost:8000/api/form/activity/${activityId}`
        : "http://localhost:8000/api/form/submit";

      const payload = {
        step1: formData.step1,
        step2: formData.step2,
        step3: formData.step3,
        step4: formData.step4,
        step5: formData.step5,
        step6: formData.step6,
        step7: formData.step7,
      };

      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  "x-user-id": userId,
},
        body: JSON.stringify(payload),
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
        return;
      }

      alert(
        `Submission failed: ${
          data?.detail?.message ||
          data?.detail?.error ||
          data?.detail ||
          data?.error ||
          "Unknown error"
        }`,
      );
      console.error("SUBMIT ERROR:", data);
    } catch (err) {
      console.error("NETWORK ERROR:", err);
      alert("Unable to connect to the server.");
    } finally {
      setLoadingSubmit(false);
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
      if (currentStep === steps.length - 1) handleSubmit();
      else nextStep();
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

  const mappedOptions = useMemo(() => {
    if (!formOptions) return null;

    const toOption = (x: any) => ({
      id: x.id,
      name: x.name,
      label: x.label ?? x.name,
      value: x.value ?? x.id,
    });

    return {
      departments: formOptions.departments.map((d) => ({
        id: d.id,
        name: d.name,
        label: d.label ?? d.name,
        value: d.value ?? d.id,
      })),
      activityNames: formOptions.activityNames.map((a) => ({
        id: a.id,
        name: a.name,
        label: a.label ?? a.name,
        value: a.value ?? a.id,
        department_id: a.department_id,
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
      retentionStorageMethods:
        formOptions.retentionStorageMethods.map(toOption),
      usagePurposes: formOptions.usagePurposes.map(toOption),
      accessRights: formOptions.accessRights.map(toOption),
      securityMeasures: formOptions.securityMeasures.map(toOption),
    };
  }, [formOptions]);

  // ================= ERROR STATE =================
  if (optionsError) {
    return <div className="p-10 text-red-500">{optionsError}</div>;
  }

  // ตอน RENDER
  const isLoading = loadingOptions || loadingEdit;
  const loadingMessage = loadingEdit
    ? "กำลังโหลดข้อมูลเดิม..."
    : loadingOptions
      ? "กำลังโหลดฟอร์ม..."
      : "กำลังบันทึกข้อมูล...";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-8 min-h-screen">
        <div className="w-full max-w-[1000px] mb-10">
          <ProgressBar steps={steps} currentStep={currentStep} />
        </div>

        <div className="w-full max-w-[1100px] bg-white rounded-lg shadow-sm px-[160px] py-[60px]">
          <h2 className="text-[#1a3a8f] font-bold text-[22px] text-center mb-[28px] font-gabarito">
            {steps[currentStep]}
          </h2>

          {/* loading อยู่ในการ์ด น้า*/}
          {isLoading || loadingSubmit ? (
            <div className="flex items-center justify-center py-16">
              <LoadingScreen
                message={
                  loadingSubmit ? "กำลังบันทึกข้อมูล..." : loadingMessage
                }
                fullScreen={false}
              />
            </div>
          ) : mappedOptions ? (
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
          ) : null}
        </div>

        <div className="w-full max-w-[1100px] flex justify-between mt-6">
          {currentStep > 0 ? (
            <button
              onClick={handleBackClick}
              disabled={loadingSubmit}
              className="font-gabarito flex items-center gap-2 px-4 py-2 border border-BLUE rounded-[10px] text-BLUE hover:bg-gray-100 text-sm disabled:opacity-40"
            >
              <CircleArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNextClick}
            disabled={loadingSubmit}
            className={`border border-[#1a3a8f] font-gabarito flex items-center gap-2 px-5 py-2 rounded-[10px] text-sm ml-auto disabled:opacity-40 ${
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