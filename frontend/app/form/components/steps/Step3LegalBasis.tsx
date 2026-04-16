// app/form/components/steps/Step3LegalBasis
"use client";
import { useState } from "react";
import MultiSelect from "../../../components/MultiSelect";

const legalBases = [
  "ความยินยอม (Consent)",
  "สัญญา (Contract)",
  "หน้าที่ตามกฎหมาย (Legal Obligation)",
  "ประโยชน์สำคัญ (Vital Interests)",
  "ภารกิจสาธารณะ (Public Task)",
  "ประโยชน์โดยชอบด้วยกฎหมาย (Legitimate Interests)",
];

const dataCategories = ["ข้อมูลระบุตัวตน", "ข้อมูลการติดต่อ", "ข้อมูลทางการเงิน", "ข้อมูลสุขภาพ", "ข้อมูลการศึกษา"];

export default function Step3LegalBasis() {
  const [primaryBases, setPrimaryBases] = useState<string[]>([]);
  const [supplementaryBases, setSupplementaryBases] = useState<string[]>([]);
  const [minorConsent, setMinorConsent] = useState<{ under10: string; age10to20: string }>({
    under10: "",
    age10to20: "",
  });

  return (
    <div className="space-y-6 font-prompt">

      <div>
        <p className="text-[14px] font-semibold text-BLUE mb-[10px]">ฐานในการประมวลผล <span className="text-red-500">*</span></p>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-[#1a3a8f] block mb-1">
              หมวดหมู่หลัก <span className="text-red-500">*</span>
            </label>
            <MultiSelect
              options={legalBases}
              selected={primaryBases}
              onChange={setPrimaryBases}
              placeholder="เลือกฐานหลัก..."
            />
          </div>

          <div>
            <label className="text-sm text-[#1a3a8f] block mb-1">
              หมวดหมู่เสริม (ถ้ามี)
            </label>
            <MultiSelect
              options={dataCategories}
              selected={supplementaryBases}
              onChange={setSupplementaryBases}
              placeholder="เลือกประเภทเสริม..."
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-[14px] font-medium text-BLUE mb-[10px]">การขอความยินยอมของผู้เยาว์</p>

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
                    checked={minorConsent[key as keyof typeof minorConsent] === opt}
                    onChange={() => setMinorConsent((prev) => ({ ...prev, [key]: opt }))}
                    className="accent-[#1a3a8f]"
                  />
                  <span className={minorConsent[key as keyof typeof minorConsent] === opt ? "text-[#1a3a8f] font-medium" : "text-gray-600"}>
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}