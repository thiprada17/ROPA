// app/form/components/steps/Step3LegalBasis
"use client";
import MultiSelect from "../../../components/MultiSelect";

type Option = {
  label: string;
  value: string;
};

const legalBases = [
  "ความยินยอม (Consent)",
  "สัญญา (Contract)",
  "หน้าที่ตามกฎหมาย (Legal Obligation)",
  "ประโยชน์สำคัญ (Vital Interests)",
  "ภารกิจสาธารณะ (Public Task)",
  "ประโยชน์โดยชอบด้วยกฎหมาย (Legitimate Interests)",
];

const dataCategories = ["ข้อมูลระบุตัวตน", "ข้อมูลการติดต่อ", "ข้อมูลทางการเงิน", "ข้อมูลสุขภาพ", "ข้อมูลการศึกษา"];

// Validation สำหรับ Step3
export function validateStep3({
  primaryBases,
  minorConsent,
}: {
  primaryBases: string[];
  minorConsent: { under10: string; age10to20: string };
}) {
  return {
    primaryBases: primaryBases.length === 0,
    minorConsentUnder10: !minorConsent.under10,
    minorConsent10to20: !minorConsent.age10to20,
  };
}

interface StepProps {
  formData: {
    primaryBases: string[];
    supplementaryBases: string[];
    minorConsent: { under10: string; age10to20: string };
  };
  errors: Record<string, boolean>;
  options: {
    legalBases: Option[];
  };
  updateField: (field: string, value: any) => void;
}

export default function Step3LegalBasis({ formData, errors, updateField, options }: StepProps) {
  return (
    <div className="space-y-6 font-prompt">

      <div>
        <p className="text-[14px] font-semibold text-BLUE mb-[10px]">ฐานในการประมวลผล <span className="text-red-500">*</span></p>

        <div className="space-y-3">
          <div>
            <MultiSelect
              label="หมวดหมู่หลัก"
              options={options.legalBases}
              selected={formData.primaryBases}
              onChange={(v) => updateField("primaryBases", v)}
              placeholder="เลือกฐานหลัก..."
              error={errors.primaryBases}
              required
            />
          </div>

          <div>
            <MultiSelect
              label="หมวดหมู่เสริม (ถ้ามี)"
              options={[]}
              selected={formData.supplementaryBases}
              onChange={(v) => updateField("supplementaryBases", v)}
              placeholder="เลือกประเภทเสริม..."
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-[14px] font-medium text-BLUE mb-[10px]">การขอความยินยอมของผู้เยาว์ <span className="text-red-500">*</span></p>

        <div className="space-y-3 ml-4">
          {[
            { label: "อายุไม่เกิน 10 ปี", key: "under10" },
            { label: "อายุ 10 – 20 ปี", key: "age10to20" },
          ].map(({ label, key }) => (
            <div key={key} className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="text-BLUE text-[14px] w-36">{label} :</span>
              {["ต้องมีการขอความยินยอม", "ไม่ต้องมีการขอความยินยอม"].map((opt) => (
                <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-[12px]">
                  <input
                    type="radio"
                    name={key}
                    value={opt}
                    checked={formData.minorConsent[key as keyof typeof formData.minorConsent] === opt}
                    onChange={() => updateField("minorConsent", { ...formData.minorConsent, [key]: opt })}
                    className="accent-[#1a3a8f]"
                  />
                  <span className={formData.minorConsent[key as keyof typeof formData.minorConsent] === opt ? "text-[#1a3a8f] font-medium" : "text-gray-600"}>
                    {opt}
                  </span>
                </label>
              ))}
              {key === "under10" && errors.minorConsentUnder10 && <p className="text-red-500 text-sm mt-1">กรุณาเลือกตัวเลือก</p>}
              {key === "age10to20" && errors.minorConsent10to20 && <p className="text-red-500 text-sm mt-1">กรุณาเลือกตัวเลือก</p>}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}