// app/Ropa/components/tabs/TabTransfer.tsx
"use client";
import { RopaItem } from "../DetailCard";

export default function TabTransfer({
    item,
    RenderValue,
    BulletRow,
    InfoRow,
}: {
    item: RopaItem;
    RenderValue: any;
    BulletRow: any;
    InfoRow: any;
}) {
      const transfer = item.transfer;
  if (!transfer) {
    return <p className="text-[11px] text-[#A6A6A6] italic">ไม่มีข้อมูล</p>;
  }
    return (
        <div className="space-y-2">
        <p className="text-[11px] text-[#A6A6A6]">ส่งหรือโอนข้อมูลส่วนบุคคลไปต่างประเทศ</p>
      <BulletRow label="มีการส่งหรือโอนข้อมูลไปต่างประเทศหรือไม่" indent>
        <span>{transfer.is_transfer ?? "ไม่มีข้อมูล"}</span>
      </BulletRow>
    <BulletRow label="เป็นการส่งข้อมูลไปยังต่างประเทศของกลุ่มบริษัทในเครือหรือไม่" indent>
        <span>{transfer.destination_country ?? "ไม่มีข้อมูล"}</span>
      </BulletRow>
          <BulletRow label="วิธีการโอนข้อมูล" indent>
        <span>{transfer.transfer_method ?? "ไม่มีข้อมูล"}</span>
      </BulletRow>
                <BulletRow label="มาตรฐานการคุ้มครองข้อมูลส่วนบุคคลของประเทศปลายทาง" indent>
        <span>{transfer.transfer_method ?? "ไม่มีข้อมูล"}</span>
      </BulletRow>
                <BulletRow label="ข้อยกเว้นตามมาตรา 28" indent>
        <span>{transfer.transfer_method ?? "ไม่มีข้อมูล"}</span>
      </BulletRow>
        </div>
    );
}
