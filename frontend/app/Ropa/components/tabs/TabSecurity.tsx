// app/Ropa/components/tabs/TabSecurity.tsx
"use client";
import { Shield } from "lucide-react";
import { display } from "../DetailCard";
import { RopaItem } from "../../types/ropa";

// tab: security

export default function TabSecurity({
    item,
    RenderValue,
    BulletRow,
    InfoRow,
}: {
    item: RopaItem;
    RenderValue: any;
    BulletRow: any;
    InfoRow: any;
}
) {
    const security = item.security;

    if (!security || security == null) {
        return <p className="text-[11px] text-[#A6A6A6] italic">ไม่มีข้อมูล</p>;
    }

    
    return (
        <div className="space-y-3">
            {/* หัวข้อ */}
            <p className="text-[11px] text-[#A6A6A6]">นโยบายการเก็บรักษาข้อมูลส่วนบุคคล</p>

            <BulletRow label="มาตรการเชิงองค์กร" indent>
                 <span>{display(security.organizational)}</span>
            </BulletRow>

            <BulletRow label="มาตรการเชิงเทคนิค" indent>
                <span>{display(security.technical)}</span>
            </BulletRow>

            <BulletRow label="มาตรการทางกายภาพ" indent>
                <span>{display(security.physical)}</span>
            </BulletRow>

            <BulletRow label="การควบคุมการเข้าถึงข้อมูล" indent>
                <span>{display(security.accessType)}</span>
            </BulletRow>

            <BulletRow label="การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน" indent>
                <span>{display(security.responsibility_def)}</span>
            </BulletRow>

            <BulletRow label="มาตรการตรวจสอบย้อนหลัง" indent>
                <span>{display(security.audit_trail)}</span>
            </BulletRow>


        </div>
    );
}
