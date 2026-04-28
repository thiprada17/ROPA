// app/Ropa/components/tabs/TabLegal.tsx
"use client";
import { RopaItem } from "../../types/ropa";

export default function TabLegal({
  item,
  RenderValue,
  BulletRow,
}: {
  item: RopaItem;
  RenderValue: any;
  BulletRow: any;
}) {
  const legal = item.legal;

  if (!legal) {
    return <p className="text-[11px] text-[#A6A6A6] italic">ไม่มีข้อมูล</p>;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-[140px_1fr] gap-2 pt-2">
        <p className="text-[11px] text-[#A6A6A6]">ฐานในการประมวลผล</p>
        <span />
      </div>

      <BulletRow label="หมวดหมู่หลัก" indent>
        <RenderValue value={legal.basis} />
      </BulletRow>

      <BulletRow label="หมวดหมู่เสริม" indent>
        <RenderValue value={legal.secondaryCategory} />
      </BulletRow>

      {/* consent */}
      <div className="grid grid-cols-[140px_1fr] gap-2 pt-2">
        <p className="text-[11px] text-[#A6A6A6]">
          การขอความยินยอมของผู้เยาว์
        </p>
        <span />
      </div>

      <BulletRow label="อายุไม่เกิน 10 ปี" indent>
        <span>{legal.minorConsent?.under10 ?? "ไม่มีข้อมูล"}</span>
      </BulletRow>

      <BulletRow label="อายุ 10 - 20 ปี" indent>
        <span>{legal.minorConsent?.age10to20 ?? "ไม่มีข้อมูล"}</span>
      </BulletRow>
    </div>
  );
}
