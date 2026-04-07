// app/form/components/StepContent.tsx
import InputField from "./InputField";

interface StepContentProps {
  step: number;
}

export default function StepContent({ step }: StepContentProps) {
  switch (step) {
    case 0: // Stage แรก
      return (
        <div>
          <InputField label="ข้อมูลเกี่ยวกับผู้ควบคุมข้อมูลส่วนบุคคล" placeholder="บริษัท A" />
          <InputField label="กิจกรรมประมวลผล" placeholder="ชื่อกิจกรรม เช่น การเก็บข้อมูลลูกค้า, การสื่อสารการตลาด" />
          <InputField label="วัตถุประสงค์ของการประมวลผล" placeholder="เช่น การตลาด, การวิเคราะห์ข้อมูล" />
        </div>
      );
    case 1: // Stage 2
      return (
        <div>
          <InputField label="ข้อมูลส่วนบุคคลที่จัดเก็บ" placeholder="ชื่อ, เบอร์โทร, อีเมล ฯลฯ" />
  
        </div>
      );
    case 2: // Stage 3
      return (
        <div>
          <InputField label="ฐานในการประมวลผล สัญฐาบลาๆๆ" />
        </div>
      ); 
    case 3: // Stage 4
      return (
        <div>
          <InputField label="เทส" />
        </div>
      );
    case 4: // Stage 5
      return (
       <div>
          <InputField label="เทส" />
        </div>
      );
    case 5: // Stage 6
      return (
        <div>
          <InputField label="เทส" />
        </div>
      );
    default:
      return null;
  }
}