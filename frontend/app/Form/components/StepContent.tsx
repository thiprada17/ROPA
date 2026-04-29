// app/form/components/StepContent.tsx
import Step1Activity from "./steps/Step1Activity";
import Step2DataType from "./steps/Step2DataType";
import Step3LegalBasis from "./steps/Step3LegalBasis";
import Step4Transfer from "./steps/Step4Transfer";
import Step5Retention from "./steps/Step5Retention";
import Step6Security from "./steps/Step6Security";
import Step7Processor from "./steps/Step7Processor";
import { ProcessorData } from "./steps/Step7Processor";

type Option = {
  label: string;
  value: string;
};

interface StepContentProps<FormDataType extends Record<string, any>> {
  step: number;
  formData: FormDataType;
  errors: Partial<{ [K in keyof FormDataType]: Partial<Record<keyof FormDataType[K], boolean>> }>;

  options: {
  activityNames: Option[];
  purposes: Option[];
  dataCategories: Option[];
  dataTypes: Option[];
  acquisitionMethods: Option[];
  dataSources: Option[];
  legalBases: Option[];
  departments: Option[];
  transferMethods: Option[];
  protectionStandards: Option[];
  legalExemptions: Option[];
  retentionStorageTypes: Option[];
  retentionStorageMethods: Option[];
  deletionMethods: Option[];
  usagePurposes: Option[];
  accessRights: Option[];
  securityMeasures?: Option[];
};

  updateField: <K extends keyof FormDataType, F extends keyof FormDataType[K]>(
    stepKey: K,
    field: F,
    value: FormDataType[K][F]
  ) => void;

  step7Props?: {
    processors: ProcessorData[];
    updateProcessors: (processors: ProcessorData[]) => void;
    setIsEditingProcessor: (v: boolean) => void;
  };
}

function normalizeStepErrors<T extends Record<string, any>>(
  errors?: Partial<Record<keyof T, boolean>>
): Record<keyof T, boolean> {
  const result: Record<string, boolean> = {};
  if (errors) {
    for (const key in errors) {
      result[key] = errors[key] ?? false;
    }
  }
  return result as Record<keyof T, boolean>;
}

export default function StepContent<FormDataType extends Record<string, any>>({
  step,
  formData,
  errors,
  updateField,
  step7Props,
  options,
}: StepContentProps<FormDataType>) {
  switch (step) {
    case 0:
      return (
        <Step1Activity
          formData={formData["step1"]}
          errors={errors["step1"] || {}}
          options={{
            activityNames: options.activityNames,
            purposes: options.purposes,
            departments: options.departments,
          }}
          updateField={(f, v) => updateField("step1" as keyof FormDataType, f, v)}
        />
      );

   case 1:
  return (
    <Step2DataType
      formData={formData["step2"]}
      errors={normalizeStepErrors(errors["step2"])}
      dataCategories={options.dataCategories}
      dataTypes={options.dataTypes}
      acquisitionMethods={options.acquisitionMethods}
      dataSources={options.dataSources}
      updateField={(f, v) => updateField("step2" as keyof FormDataType, f, v)}
    />
  );

    case 2:
      return (
        <Step3LegalBasis
          formData={formData["step3"]}
          errors={normalizeStepErrors(errors["step3"])}
          options={{
            legalBases: options.legalBases,
          }}
          updateField={(f, v) => updateField("step3" as keyof FormDataType, f, v)}
        />
      );

    case 3:
      return (
        <Step4Transfer
          formData={formData["step4"]}
          errors={normalizeStepErrors(errors["step4"])}
          options={{
            transferMethods: options.transferMethods,
            protectionStandards: options.protectionStandards,
            legalExemptions: options.legalExemptions,
          }}
          updateField={(f, v) => updateField("step4" as keyof FormDataType, f, v)}
        />
      );

    case 4:
      return (
        <Step5Retention
          formData={formData["step5"]}
          errors={normalizeStepErrors(errors["step5"])}
          options={{
            retentionStorageTypes: options.retentionStorageTypes,
            retentionStorageMethods: options.retentionStorageMethods,
            deletionMethods: options.deletionMethods,
            usagePurposes: options.usagePurposes,
            accessRights: options.accessRights,
          }}
          updateField={(f, v) => updateField("step5" as keyof FormDataType, f, v)}
        />
      );

    case 5:
      return (
        <Step6Security
          formData={formData["step6"]}
          errors={normalizeStepErrors(errors["step6"])}
          updateField={(f, v) => updateField("step6" as keyof FormDataType, f, v)}
        />
      );

    case 6:
      return step7Props ? (
        <Step7Processor
          processors={step7Props.processors}
          updateProcessors={step7Props.updateProcessors}
          setIsEditingProcessor={step7Props.setIsEditingProcessor}
        />
      ) : null;

    default:
      return null;
  }
}