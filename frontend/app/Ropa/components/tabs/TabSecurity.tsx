// app\Ropa\components\tabs\TabSecurity.tsx
"use client";
import { Shield } from "lucide-react";
import { RopaItem } from "../../types/ropa";

// tab: security
export default function TabSecurity({
  item,
  RenderValue,
  BulletRow,
  InfoRow,
  InfoRowPlain,
}: {
  item: RopaItem;
  RenderValue: any;
  BulletRow: any;
  InfoRow: any;
  InfoRowPlain: any;
}) {
  // security ของ item
  const securityRows: any[] = Array.isArray(item.security) ? item.security : [];

  const allRows = securityRows; 

  const labels = [
    "มาตรการเชิงองค์กร",
    "มาตรการเชิงเทคนิค",
    "มาตรการทางกายภาพ",
    "การควบคุมการเข้าถึงข้อมูล",
    "การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน",
    "มาตรการตรวจสอบย้อนหลัง",
  ];

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-[#A6A6A6]">
        นโยบายการเก็บรักษาข้อมูลส่วนบุคคล
      </p>
      {labels.map((label) => {
        const found = allRows.find((r) => r.name === label || r.type === label);
        return (
          <BulletRow
            key={label}
            label={label}
            indent
            labelClassName={found ? "text-[#1C1B1F]" : "text-[#A6A6A6]"}
          >
            {found ? (
              found.detail ? (
                <span className="text-[11px] text-[#1C1B1F]">
                  {found.detail}
                </span>
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