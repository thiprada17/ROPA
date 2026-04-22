// app/form/components/steps/Step1Activity
"use client";
import InputField from "../InputField";
import SingleSelect from "../../../components/SingleSelect";

type Option = {
  label: string;
  value: string;
};

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
  departmentId,
  processActivity,
  processingPurpose,
}: {
  dataOwner: string;
  departmentId: string;
  processActivity: string;
  processingPurpose: string;
}) {
  return {
    dataOwner: !dataOwner.trim(), // true = error
    departmentId: !departmentId.trim(),
    processActivity: !processActivity.trim(),
    processingPurpose: !processingPurpose.trim(), 
  };
}

interface StepProps {
  formData: {
    dataOwner: string;
    departmentId: string;
    processActivity: string;
    processingPurpose: string;
  };
  errors: {
    dataOwner?: boolean;
    departmentId?: boolean;
    processActivity?: boolean;
    processingPurpose?: boolean;
  };
  options: {
    activityNames: Option[];
    purposes: Option[];
    departments: Option[];
  };
  updateField: (field: string, value: any) => void;
}

export default function Step1Activity({ formData, errors, updateField, options }: StepProps) {
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
          หน่วยงาน <span className="text-red-500">*</span>
        </label>
        <SingleSelect
          options={options.departments}
          value={formData.departmentId}
          onChange={(v) => updateField("departmentId", v)}
          placeholder="เลือกหน่วยงาน..."
          error={errors.departmentId}
          required
        />
      </div>

      <div>
        <label className="text-[14px] text-BLUE block mb-[5px] px-2">
          กิจกรรมการประมวลผล <span className="text-red-500">*</span>
        </label>
        <SingleSelect
          options={options.activityNames}
          value={formData.processActivity}
          onChange={(v) => updateField("processActivity", v)}
          placeholder="เลือกกิจกรรมการประมวลผล..."
          error={errors.processActivity}
          required
        />
      </div>

      <div>
        <label className="text-[14px] text-BLUE block mb-[5px] px-2">
          วัตถุประสงค์ของการประมวลผล <span className="text-red-500">*</span>
        </label>
        <SingleSelect
          options={options.purposes}
          value={formData.processingPurpose}
          onChange={(v) => updateField("processingPurpose", v)}
          placeholder="เลือกวัตถุประสงค์ของการประมวลผล..."
          error={errors.processingPurpose}
          required
        />
      </div>
    </div>
  );
}