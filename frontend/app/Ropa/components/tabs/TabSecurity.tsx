// app/Ropa/components/tabs/TabSecurity.tsx
"use client";

import { RopaItem } from "../../types/ropa";

// tab: security
export default function TabSecurity({
  item,
  BulletRow,
}: {
  item: RopaItem;
  RenderValue: any;
  BulletRow: any;
  InfoRow: any;
  InfoRowPlain: any;
}) {
  const securityRows: any[] = Array.isArray(item.security) ? item.security : [];

  const labels = [
    "มาตรการเชิงองค์กร",
    "มาตรการเชิงเทคนิค",
    "มาตรการทางกายภาพ",
    "การควบคุมการเข้าถึงข้อมูล",
    "การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน",
    "มาตรการตรวจสอบย้อนหลัง",
  ];

  const normalize = (text?: string | null) =>
    String(text || "")
      .trim()
      .replace(/\s+/g, "");

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-[#A6A6A6]">
        นโยบายการเก็บรักษาข้อมูลส่วนบุคคล
      </p>

      {labels.map((label) => {
        const found = securityRows.find((r: any) => {
          const rowName = normalize(r.name || r.type || "");
          const labelName = normalize(label);

          return rowName === labelName;
        });

        const detail = (found?.detail || "").trim();

        return (
          <BulletRow
            key={label}
            label={label}
            indent
            labelClassName={found ? "text-[#1C1B1F]" : "text-[#A6A6A6]"}
          >
            {found ? (
              detail ? (
                <span className="text-[11px] text-[#1C1B1F]">{detail}</span>
              ) : null
            ) : (
              <span className="text-[11px] text-[#A6A6A6] italic">
                ไม่มีข้อมูล
              </span>
            )}
          </BulletRow>
        );
      })}
    </div>
  );
}
