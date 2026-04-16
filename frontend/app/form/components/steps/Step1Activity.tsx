// app/form/components/steps/Step1Activity
"use client";
import InputField from "../InputField";
import SingleSelect from "../../../components/SingleSelect";

const dataTypes = ["ชื่อ-นามสกุล", "เลขบัตรประชาชน", "เบอร์โทรศัพท์", "อีเมล"];

// Validation สำหรับ Step1
export function validateStep1({
  dataOwner,
  dataType,
  processingPurpose,
}: {
  dataOwner: string;
  dataType: string;
  processingPurpose: string;
}) {
  return {
    dataOwner: !dataOwner.trim(), // true = error
    dataType: !dataType,         
    processingPurpose: !processingPurpose.trim(), 
  };
}

interface StepProps {
  formData: {
    dataOwner: string;
    dataType: string;
    processingPurpose: string;
  };
  errors: {
    dataOwner?: boolean;
    dataType?: boolean;
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
          ประเภทของข้อมูลส่วนบุคคลที่จัดเก็บ <span className="text-red-500">*</span>
        </label>
        <SingleSelect
          options={dataTypes}
          value={formData.dataType}
          onChange={(v) => updateField("dataType", v)}
          placeholder="เลือกประเภทข้อมูล..."
          error={errors.dataType}
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