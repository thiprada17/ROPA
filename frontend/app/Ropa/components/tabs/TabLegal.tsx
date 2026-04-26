// app/Ropa/components/tabs/TabLegal.tsx
"use client";
import { RopaItem } from "../DetailCard";

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

  const Tag = ({ label }: { label: string }) => (
    <span className="bg-[#DFE9FF] text-[#03369D] px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap">
      {label}
    </span>
  );

  const minorConsent = item.step3?.minorConsent ?? item.legal?.minorConsent;

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
        {legal.secondaryCategory?.length ? (
          legal.secondaryCategory.map((s, i) => <Tag key={i} label={s} />)
        ) : (
          <span className="text-[#A6A6A6] text-[11px] italic">ไม่มีข้อมูล</span>
        )}
      </BulletRow>
      {/* consent */}
      <BulletRow label="อายุไม่เกิน 10 ปี" indent>
        <span className="text-[11px] text-[#1C1B1F]">
          {minorConsent?.under10 || "ไม่มีข้อมูล"}
        </span>
      </BulletRow>
      <BulletRow label="อายุ 10 - 20 ปี" indent>
        <span className="text-[11px] text-[#1C1B1F]">
          {minorConsent?.age10to20 || "ไม่มีข้อมูล"}
        </span>
      </BulletRow>
    </div>
  );
}