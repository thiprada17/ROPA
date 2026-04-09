// app/form/components/StepContent.tsx
import InputField from "./InputField";
import DataTypeStep from "./DataTypeStep";

interface StepContentProps {
  step: number;
}

export default function StepContent({ step }: StepContentProps) {
  switch (step) {
    case 0:
      return (
        <div>
          <InputField label="ข้อมูลเกี่ยวกับผู้ควบคุมข้อมูลส่วนบุคคล" placeholder="บริษัท A" />
          <InputField label="กิจกรรมประมวลผล" placeholder="ชื่อกิจกรรม เช่น การเก็บข้อมูลลูกค้า, การสื่อสารการตลาด" />
          <InputField label="วัตถุประสงค์ของการประมวลผล" placeholder="เช่น การตลาด, การวิเคราะห์ข้อมูล" />
        </div>
      );
    case 1:
      return <DataTypeStep />;
    case 2:
      return (
        <div>
          <InputField label="ฐานในการประมวลผล สัญฐาบลาๆๆ" />
        </div>
      );
    case 3:
      return (
        <div>
          <InputField label="เทส" />
        </div>
      );
    case 4:
      return (
        <div>
          <InputField label="เทส" />
        </div>
      );
    case 5:
      return (
        <div>
          <InputField label="เทส" />
        </div>
      );
    default:
      return null;
  }
}