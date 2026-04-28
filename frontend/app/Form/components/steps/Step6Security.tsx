// app/form/components/steps/Step6Security
"use client";
const securityMeasures = [
  "มาตรการเชิงองค์กร",
  "มาตรการเชิงเทคนิค",
  "มาตรการทางกายภาพ",
  "การควบคุมการเข้าถึงข้อมูล",
  "การทำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน",
  "มาตรการตรวจสอบย้อนหลัง",
];


interface StepProps {
  formData: any;
  errors: Record<string, boolean>;
  updateField: (field: string, value: any) => void;
}

export default function Step6Security({ formData, errors, updateField }: StepProps) {
  const toggle = (item: string) => {
    const prev = formData.selectedSecurity || {};
    updateField("selectedSecurity", { ...prev, [item]: !prev[item] });
  };

  const setDetail = (item: string, value: string) => {
    const prev = formData.securityDetails || {};
    updateField("securityDetails", { ...prev, [item]: value });
  };

  return (
    <div className="font-prompt space-y-6">
      <p className="text-[14px] font-semibold text-BLUE">มาตรการรักษาความปลอดภัยข้อมูลส่วนบุคคล</p>
      <div className="grid grid-cols-3 gap-x-8 gap-y-4">
        {securityMeasures.map((item) => (
          <div key={item} className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!(formData.selectedSecurity?.[item])}
                onChange={() => toggle(item)}
                className="accent-[#1a3a8f] w-4 h-4"
              />
              <span className={`text-sm ${formData.selectedSecurity?.[item] ? "text-[#1a3a8f] font-medium" : "text-gray-500"}`}>
                {item}
              </span>
            </label>

            {formData.selectedSecurity?.[item] && (
              <textarea
                value={formData.securityDetails?.[item] || ""}
                onChange={(e) => setDetail(item, e.target.value)}
                placeholder="รายละเอียด(ถ้ามี)"
                rows={3}
                className="w-full border border-BLUE rounded-lg px-3 py-2 text-sm text-gray-500 font-prompt outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}