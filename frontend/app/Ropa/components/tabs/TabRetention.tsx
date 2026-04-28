// app/Ropa/components/tabs/TabRetention.tsx
"use client";
import { RopaItem } from "../../types/ropa";

// tab: retention
export default function TabRetention({
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
  const retention = item.retention;

  if (!retention) {
    return <p className="text-[11px] text-[#A6A6A6] italic">ไม่มีข้อมูล</p>;
  }

  // usage logic
  const usageList = retention.usage_purpose || [];
  const hasUsage = usageList.length > 0;

  const Tag = ({ label }: { label: string }) => (
  <span className="bg-[#DFE9FF] text-[#03369D] px-2.5 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap">
    {label}
  </span>
);

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-[#A6A6A6]">
        นโยบายการเก็บรักษาข้อมูลส่วนบุคคล
      </p>

      {/* storage type */}
      <BulletRow label="ประเภทของข้อมูลที่จัดเก็บ" indent>
        <RenderValue value={retention.storageType} />
      </BulletRow>

      {/* storage method */}
      <BulletRow label="วิธีการเก็บรักษาข้อมูล" indent>
        <RenderValue value={retention.storageMethod} />
      </BulletRow>

      {/* retention period */}
      <BulletRow label="ระยะเวลาการเก็บข้อมูล" indent>
        <span>
          {retention.retentionPeriod
            ? retention.retentionPeriod.replace(/\b0+(\d)/g, "$1")
            : "ไม่มีข้อมูล"}
        </span>
      </BulletRow>

      {/* department */}
      <BulletRow label="สิทธิและวิธีการเข้าถึงข้อมูลส่วนบุคคล" indent>
        {(item.retention?.department ?? retention.department ?? []).length > 0 ? (
          (item.retention?.department ?? retention.department ?? []).map(
            (d: string, i: number) => <Tag key={i} label={d} />,
          )
        ) : (
          <span className="text-[11px] text-[#A6A6A6] italic">ไม่มีข้อมูล</span>
        )}
      </BulletRow>

      {/* deletion */}
      <BulletRow label="วิธีการทำลายข้อมูล" indent>
        <span>{retention.deletionMethod ?? "ไม่มีข้อมูล"}</span>
      </BulletRow>

      {/* Usage */}
      <InfoRowPlain label="การใช้หรือเปิดเผยข้อมูลส่วนบุคคลที่ได้รับยกเว้นไม่ต้องขอความยินยอม">
        {hasUsage ? (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span>มีการใช้:</span>
            {usageList.map((u: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 rounded-md text-[#1C1B1F] text-[11px]"
              >
                {u}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[#A6A6A6]">ไม่มีการใช้</span>
        )}
      </InfoRowPlain>

      {/* denial */}
      <InfoRowPlain label="การปฏิเสธคำขอหรือคำคัดค้านการใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล">
        {retention.denialNote ? (
          <span className="text-[11px] text-[#1C1B1F]">
            {retention.denialNote}
          </span>
        ) : (
          <span className="text-[11px] text-[#A6A6A6] italic">ไม่มีข้อมูล</span>
        )}
      </InfoRowPlain>
    </div>
  );
}