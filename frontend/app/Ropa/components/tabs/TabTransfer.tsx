"use client";
<<<<<<< Updated upstream
import { RopaItem } from "../DetailCard";
=======

import { display } from "../DetailCard";
import { RopaItem } from "../../types/ropa";
>>>>>>> Stashed changes

export default function TabTransfer({
  item,
  BulletRow,
}: {
  item: RopaItem;
  BulletRow: any;
  RenderValue?: any;
  InfoRow?: any;
}) {
  const transfer = item.transfer;

  if (!transfer) {
    return <p className="text-[11px] text-[#A6A6A6] italic">ไม่มีข้อมูล</p>;
  }

  const isTransferText =
    transfer.is_transfer === true
      ? "มี"
      : transfer.is_transfer === false
        ? "ไม่มี"
        : null;
  const isSubsidiaryText = transfer.affiliated_company
    ? "ใช่"
    : transfer.affiliated_company === null && transfer.is_transfer !== undefined
      ? "ไม่ใช่"
      : null;

  const black = "text-[11px] text-[#1C1B1F]";
  const empty = (
    <span className="text-[11px] text-[#A6A6A6] italic">ไม่มีข้อมูล</span>
  );
  const none = <span className="text-[11px] text-[#A6A6A6] italic">ไม่มี</span>;

  const protectionStandards = transfer.protection_standard || null;
  const exceptions = transfer.exceptions || null;

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-[#A6A6A6]">
        ส่งหรือโอนข้อมูลส่วนบุคคลไปต่างประเทศ
      </p>

      <BulletRow label="มีการส่งหรือโอนข้อมูลไปต่างประเทศหรือไม่" indent>
        {isTransferText ? (
          <span className={black}>{isTransferText}</span>
        ) : (
          empty
        )}
      </BulletRow>

      <BulletRow label="ประเทศปลายทาง" indent>
        {transfer.destination_country ? (
          <span className={black}>{transfer.destination_country}</span>
        ) : transfer.is_transfer === false ? (
          none
        ) : (
          empty
        )}
      </BulletRow>

      <BulletRow
        label="เป็นการส่งข้อมูลไปยังต่างประเทศของกลุ่มบริษัทในเครือหรือไม่"
        indent
      >
        {isSubsidiaryText ? (
          <span className={black}>{isSubsidiaryText}</span>
        ) : (
          empty
        )}
      </BulletRow>

      {transfer.affiliated_company && (
        <BulletRow label="ชื่อบริษัทในเครือ" indent>
          <span className={black}>{transfer.affiliated_company}</span>
        </BulletRow>
      )}

      <BulletRow label="วิธีการโอนข้อมูล" indent>
        {transfer.transfer_method ? (
          <span className={black}>{transfer.transfer_method}</span>
        ) : (
          empty
        )}
      </BulletRow>

      <BulletRow
        label="มาตรฐานการคุ้มครองข้อมูลส่วนบุคคลของประเทศปลายทาง"
        indent
      >
        {protectionStandards ? (
          <span className={black}>{protectionStandards}</span>
        ) : (
          empty
        )}
      </BulletRow>

      <BulletRow label="ข้อยกเว้นตามมาตรา 28" indent>
        {exceptions?.length ? (
          <span className={black}>{exceptions.join(", ")}</span>
        ) : (
          empty
        )}
      </BulletRow>
    </div>
  );
}
