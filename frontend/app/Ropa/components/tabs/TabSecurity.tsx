"use client";
<<<<<<< Updated upstream
import { Shield } from "lucide-react";
import { RopaItem, display } from "../DetailCard";
=======
import { RopaItem } from "../../types/ropa";
>>>>>>> Stashed changes

export default function TabSecurity({
  item,
  BulletRow,
}: {
  item: RopaItem;
  BulletRow: any;
}) {
  const securityRows: any[] = Array.isArray(item.security) ? item.security : [];
  const step6Rows: any[] = Array.isArray(item.step6?.securityRows)
    ? item.step6.securityRows
    : [];
  const allRows = step6Rows.length > 0 ? step6Rows : securityRows;

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