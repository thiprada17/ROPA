// app/form/components/steps/Step1Activity
"use client";
import InputField from "../InputField";
import SingleSelect from "../../../components/SingleSelect";

const processingActivities = [
  "การจัดการลูกค้า",
  "การบริหารทรัพยากรบุคคล",
  "การตลาดและโฆษณา",
  "การวิเคราะห์ข้อมูล",
  "การปรับปรุงบริการ",
  "การปฏิบัติตามกฎหมาย",
];

// Validation สำหรับ Step1
export function validateStep1({
  dataOwner,
  processActivity,
  processingPurpose,
}: {
  dataOwner: string;
  processActivity: string;
  processingPurpose: string;
}) {
  return {
    dataOwner: !dataOwner.trim(), // true = error
    processActivity: !processActivity.trim(),
    processingPurpose: !processingPurpose.trim(), 
  };
}

interface StepProps {
  formData: {
    dataOwner: string;
    processActivity: string;
    processingPurpose: string;
  };
  errors: {
    dataOwner?: boolean;
    processActivity?: boolean;
    processingPurpose?: boolean;
  };
  updateField: (field: string, value: any) => void;
}

export default function Step1Activity({ formData, errors, updateField }: StepProps) {
  return (
    <div className="space-y-6 font-prompt">
      <InputField
        id="dataOwner"
        label="ชื่อเจ้าของข้อมูลส่วนบุคคล"
        value={formData.dataOwner}
        onChange={(v) => updateField("dataOwner", v)}
        placeholder="ชื่อ-นามสกุล เจ้าของข้อมูล"
        error={errors.dataOwner}
      />

      <div>
        <label className="text-[14px] text-BLUE block mb-[5px] px-2">
          กิจกรรมการประมวลผล <span className="text-red-500">*</span>
        </label>
        <SingleSelect
          options={processingActivities}
          value={formData.processActivity}
          onChange={(v) => updateField("processActivity", v)}
          placeholder="เลือกกิจกรรมการประมวลผล..."
          error={errors.processActivity}
          required
        />
      </div>

      <div>
        <InputField
          id="processingPurpose"
          label="วัตถุประสงค์ของการประมวลผล"
          value={formData.processingPurpose}
          onChange={(v) => updateField("processingPurpose", v)}
          placeholder="ระบุวัตถุประสงค์ของการประมวลผลข้อมูลส่วนบุคคล"
          error={errors.processingPurpose}
        />
      </div>
    </div>
  );
}