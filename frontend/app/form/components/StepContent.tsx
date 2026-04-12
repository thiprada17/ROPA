// app/form/components/StepContent.tsx
import Step1Activity from "./steps/Step1Activity";
import Step2DataType from "./steps/Step2DataType";
import Step3LegalBasis from "./steps/Step3LegalBasis";
import Step4Transfer from "./steps/Step4Transfer";
import Step5Retention from "./steps/Step5Retention";
import Step6Security from "./steps/Step6Security";
import Step7Processor from "./steps/Step7Precessor";

export default function StepContent({ step }: { step: number }) {
  switch (step) {
    case 0: return <Step1Activity />;
    case 1: return <Step2DataType />;
    case 2: return <Step3LegalBasis />;
    case 3: return <Step4Transfer />;
    case 4: return <Step5Retention />;
    case 5: return <Step6Security />;
    case 6: return <Step7Processor />;
    default: return null;
  }
}