// app/Ropa/components/tabs/TabProcessor.tsx
"use client";
import { display } from "../DetailCard";
import { RopaItem } from "../../types/ropa";

export default function TabProcessor({
    item,
    RenderValue,
    BulletRow,
    InfoRowPlain,
    InfoRow,
}: {
    item: RopaItem;
    RenderValue: any;
    BulletRow: any;
    InfoRowPlain: any;
    InfoRow: any;
}) {
    const processor = item.processors
    if (!processor || processor.length === 0) {
        return <p className="text-[11px] text-[#A6A6A6] italic">ไม่มีข้อมูล</p>;
    }

    return (
        <div className="space-y-1">
            {processor.map((p, i) => (
                <div key={i} className="space-y-1">

                    {/* header */}
                    <InfoRowPlain label="ชื่อผู้ประมวลผลข้อมูลส่วนบุคคล">
                        <span className="text-[11px]">{display(p.name)}</span>
                    </InfoRowPlain>

                    <InfoRowPlain label="ที่อยู่ผู้ประมวลผลข้อมูลส่วนบุคคล">
                        <span className="text-[11px]">{display(p.address)}</span>
                    </InfoRowPlain>

                    {/* section title */}
                    <p className="text-[11px] text-[#A6A6A6]">นโยบายการเก็บรักษาข้อมูลส่วนบุคคล</p>

                    {/* bullets */}
                    <div className="space-y-2">
                        <BulletRow label="มาตรการเชิงองค์กร">
                            <span className="text-[11px]">{display(p.security?.organizational)}</span>
                        </BulletRow>

                        <BulletRow label="มาตรการเชิงเทคนิค">
                            <span className="text-[11px]">{display(p.security?.technical)}</span>
                        </BulletRow>

                        <BulletRow label="มาตรการทางกายภาพ">
                            <span className="text-[11px]">{display(p.security?.physical)}</span>
                        </BulletRow>

                        <BulletRow label="การควบคุมการเข้าถึงข้อมูล">
                            <span className="text-[11px]">{display(p.security?.accessType)}</span>
                        </BulletRow>

                        <BulletRow label="การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน">
                            <span className="text-[11px]">{display(p.security?.responsibility_def)}</span>
                        </BulletRow>

                        <BulletRow label="มาตรการตรวจสอบย้อนหลัง">
                            <span className="text-[11px]">{display(p.security?.audit_trail)}</span>
                        </BulletRow>
                    </div>
                </div>
            ))}
        </div>
    );
}