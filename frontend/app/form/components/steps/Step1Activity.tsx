// app/form/components/steps/Step1Activity
"use client";

import InputField from "../InputField";
import SingleSelect from "../../../components/SingleSelect";

type Option = {
  label: string;
  value: string;
};

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
  options: {
    activityNames: Option[];
    purposes: Option[];
  };
  updateField: (field: string, value: any) => void;
}

export default function Step1Activity({
  formData,
  errors,
  updateField,
  options,
}: StepProps) {
  return (
    <div className="space-y-6 font-prompt">
      <InputField
        id="dataOwner"
        label="ชื่อเจ้าของข้อมูลส่วนบุคคล"
        value={formData.dataOwner}
        onChange={(v) => updateField("dataOwner", v)}
        placeholder="ชื่อ-นามสกุล เจ้าของข้อมูล"
        error={errors.dataOwner}
        required
      />

      <div>
        <label className="text-[14px] text-BLUE block mb-[5px] px-2">
          กิจกรรมประมวลผล <span className="text-red-500">*</span>
        </label>
        <SingleSelect
          options={options.activityNames}
          value={formData.processActivity}
          onChange={(v) => updateField("processActivity", v)}
          placeholder="เลือกกิจกรรมประมวลผล..."
          error={errors.processActivity}
          required
        />
      </div>

      <InputField
        id="processingPurpose"
        label="วัตถุประสงค์ของการประมวลผล"
        value={formData.processingPurpose}
        onChange={(v) => updateField("processingPurpose", v)}
        placeholder="วัตถุประสงค์"
        error={errors.processingPurpose}
        required
      />
    </div>
  );
}