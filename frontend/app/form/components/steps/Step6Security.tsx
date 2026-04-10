// app/form/components/steps/Step6Security
"use client";
import { useState } from "react";

const securityMeasures = [
  "มาตรการเชิงองค์กร",
  "มาตรการเชิงเทคนิค",
  "มาตรการทางกายภาพ",
  "การควบคุมการเข้าถึงข้อมูล",
  "การทำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน",
  "มาตรการตรวจสอบย้อนหลัง",
];

export default function Step6Security() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [details, setDetails] = useState<Record<string, string>>({});

  const toggle = (item: string) => {
    setSelected((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    // maybe pt-28px เดะมาเช้คอีกครั้งนะคัย
    <div className="font-prompt space-y-6">
      <p className="text-[14px] font-semibold text-BLUE">นโยบายการเก็บรักษาข้อมูลส่วนบุคคล</p>

      <div className="grid grid-cols-3 gap-x-8 gap-y-4">
        {securityMeasures.map((item) => (
          <div key={item} className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!selected[item]}
                onChange={() => toggle(item)}
                className="accent-[#1a3a8f] w-4 h-4"
              />
              <span className={`text-sm ${selected[item] ? "text-[#1a3a8f] font-medium" : "text-gray-500"}`}>
                {item}
              </span>
            </label>

            {selected[item] && (
              <textarea
                value={details[item] || ""}
                onChange={(e) => setDetails((prev) => ({ ...prev, [item]: e.target.value }))}
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