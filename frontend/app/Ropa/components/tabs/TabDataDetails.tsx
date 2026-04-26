// app/Ropa/components/tabs/TabDataDetails.tsx
"use client";
import { RopaItem, display } from "../DetailCard";

export default function TabDataDetails({ item, RenderValue, BulletRow, InfoRowPlain }) {
  const step2 = item.step2;

  return (
    <div className="space-y-2">
      <InfoRowPlain label="ประเภทข้อมูลส่วนบุคคล">
        <RenderValue value={step2?.categories} />
      </InfoRowPlain>

      <div className="ml-4 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          <span className="text-[11px] text-[#A6A6A6]">รายละเอียดข้อมูลเพิ่มเติม</span>
        </div>
        <textarea
          readOnly
          value={item.dataDescription ?? ""}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 min-h-[80px] text-[#1C1B1F] bg-gray-50 text-[12px] resize-none"
        />
      </div>

      <InfoRowPlain label="ประเภทของข้อมูล">
        <RenderValue value={step2?.dataType ? [step2.dataType] : []} />
      </InfoRowPlain>

      <InfoRowPlain label="เจ้าของข้อมูล">
        <span className="text-[11px]">{item.dataOwner ?? item.step1?.dataOwner ?? "ไม่มีข้อมูล"}</span>
      </InfoRowPlain>

      <InfoRowPlain label="วิธีที่ได้มาซึ่งข้อมูล">
        <RenderValue value={step2?.methods} />
      </InfoRowPlain>

      <InfoRowPlain label="แหล่งที่ได้มาซึ่งข้อมูล">
        <RenderValue value={step2?.dataSource ? [step2.dataSource] : []} />
      </InfoRowPlain>
    </div>
  );
}