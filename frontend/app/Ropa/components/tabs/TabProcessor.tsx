// app/Ropa/components/tabs/TabProcessor.tsx
"use client";
import { display } from "../DetailCard";
import { RopaItem } from "../../types/ropa"

export default function TabProcessor({ item, BulletRow, InfoRowPlain }: {
  item: RopaItem; BulletRow: any; InfoRowPlain: any; RenderValue?: any; InfoRow?: any;
}) {
  const processors: any[] = Array.isArray(item.processors) ? item.processors : [];

  if (processors.length === 0) {
    return <p className="text-[11px] text-[#A6A6A6] italic">ไม่มีข้อมูล</p>;
  }

  const securityLabels = [
    "มาตรการเชิงองค์กร",
    "มาตรการเชิงเทคนิค",
    "มาตรการทางกายภาพ",
    "การควบคุมการเข้าถึงข้อมูล",
    "การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน",
    "มาตรการตรวจสอบย้อนหลัง",
  ];

  return (
    <div className="space-y-4">
      {processors.map((p, i) => {
        const info = p.processors || p;
        const secRows: any[] = p.processor_security_measures || [];

        return (
          <div key={i} className="space-y-1">
            <InfoRowPlain label="ชื่อผู้ประมวลผลข้อมูลส่วนบุคคล">
              <span className="text-[11px]">{display(info.name)}</span>
            </InfoRowPlain>
            <InfoRowPlain label="ที่อยู่ผู้ประมวลผลข้อมูลส่วนบุคคล">
              <span className="text-[11px]">{display(info.address)}</span>
            </InfoRowPlain>

            <p className="text-[11px] text-[#A6A6A6] pt-1">นโยบายการเก็บรักษาข้อมูลส่วนบุคคล</p>
            <div className="space-y-2">
              {securityLabels.map((label) => {
                const found = secRows.find((r) => r.type === label);
                return (
                  <BulletRow
                    key={label}
                    label={label}
                    labelClassName={found ? "text-[#1C1B1F]" : "text-[#A6A6A6]"}
                  >
                    {found ? (
                      found.detail
                        ? <span className="text-[11px] text-[#1C1B1F]">{found.detail}</span>
                        : null
                    ) : (
                      <span className="text-[11px] text-[#A6A6A6] italic">ไม่มีข้อมูล</span>
                    )}
                  </BulletRow>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}