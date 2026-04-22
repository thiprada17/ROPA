// app/form/components/steps/Step2DataType
"use client";
import MultiSelect from "../../../components/MultiSelect";
import SingleSelect from "../../../components/SingleSelect";

const dataCategories = ["ข้อมูลระบุตัวตน", "ข้อมูลการติดต่อ", "ข้อมูลทางการเงิน", "ข้อมูลสุขภาพ", "ข้อมูลการศึกษา"];
const dataTypes = ["ชื่อ-นามสกุล", "เลขบัตรประชาชน", "ที่อยู่", "เบอร์โทรศัพท์", "อีเมล"];
const collectMethods = ["เก็บโดยตรง", "จากบุคคลที่สาม", "จากระบบอัตโนมัติ", "จากแบบฟอร์ม"];
const dataSources = ["ลูกค้า", "พนักงาน", "ระบบ IT", "หน่วยงานภายนอก"];

// Validation สำหรับ Step2
export function validateStep2(formData: Step2FormData) {
  return {
    dataClass: !formData.dataClass || (formData.dataClass === "อื่นๆ" && !formData.otherText.trim()),
    categories: formData.categories.length === 0,
    dataType: !formData.dataType,
    methods: formData.methods.length === 0,
    dataSource: !formData.dataSource,
  };
}

export interface Step2FormData {
  dataClass: string;
  otherText: string;
  categories: string[];
  dataType: string;
  methods: string[];
  dataSource: string;
}

interface StepProps {
  formData: Step2FormData;
  errors: Record<string, boolean>;
  updateField: (field: keyof Step2FormData, value: any) => void;
}

export default function Step2DataType({ formData, errors, updateField }: StepProps) {
  
  return (
    <div className="space-y-6 font-prompt">
      {/* ข้อมูลประเภท */}
      <div>
        <label className="text-[14px] font-semibold text-BLUE block mb-[10px]">
          ข้อมูลส่วนบุคคลที่จัดเก็บ <span className="text-red-500">*</span>
        </label>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="text-gray-500">ประเภทข้อมูล <span className="text-red-500">*</span> :</span>
          {["ข้อมูลผู้สมัครงาน", "ข้อมูลบุคลากรใหม่", "ข้อมูลบุคลากร", "อื่นๆ"].map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="dataClass"
                value={opt}
                checked={formData.dataClass === opt}
                onChange={() => updateField("dataClass", opt)}
                className="accent-[#1a3a8f]"
              />
              <span className={formData.dataClass === opt ? "text-[#1a3a8f] font-medium" : "text-gray-600"}>
                {opt}
              </span>
            </label>
          ))}

          {formData.dataClass === "อื่นๆ" && (
            <input
              type="text"
              value={formData.otherText}
              onChange={(e) => updateField("otherText", e.target.value)}
              className="border border-gray-200 rounded-md px-2 py-1 text-sm w-[140px] outline-none focus:border-[#1a3a8f]"
              placeholder="ระบุประเภทอื่น..."
            />
          )}
        </div>
        {errors.dataClass && <p className="text-red-500 text-[10px] mt-1">กรุณาเลือกประเภทข้อมูล</p>}
      </div>

      {/* หมวดหมู่และประเภท */}
      <div className="grid grid-cols-2 gap-4">
        <div className="mt-[16px]">
          <MultiSelect
            label="หมวดหมู่ข้อมูล"
            options={dataCategories}
            selected={formData.categories}
            onChange={(v) => updateField("categories", v)}
            placeholder="เลือกหมวดหมู่ข้อมูล..."
            error={errors.categories}
            required
          />
        </div>
        <div className="mt-[18px]">
          <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
            ประเภทข้อมูล <span className="text-red-500">*</span>
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
      </div>

      {/* วิธีและแหล่ง */}
      <div className="grid grid-cols-2 gap-4">
        <div className="mt-[16px]">
          <MultiSelect
            label="วิธีได้มาซึ่งข้อมูล"
            options={collectMethods}
            selected={formData.methods}
            onChange={(v) => updateField("methods", v)}
            placeholder="เลือกวิธีได้มาซึ่งข้อมูล..."
            error={errors.methods}
            required
          />
        </div>
        <div className="mt-[18px]">
          <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
            แหล่งที่ได้มาซึ่งข้อมูล <span className="text-red-500">*</span>
          </label>
          <SingleSelect
            options={dataSources}
            value={formData.dataSource}
            onChange={(v) => updateField("dataSource", v)}
            placeholder="เลือกแหล่งที่ได้มาซึ่งข้อมูล..."
            error={errors.dataSource}
            required
          />
        </div>
      </div>
    </div>
  );
}