// app/form/components/steps/Step5Retention
"use client";
import { useState } from "react";
import SingleSelect from "../../../components/SingleSelect";
import MultiSelect from "../../../components/MultiSelect";

const dataTypes = ["เอกสาร", "ข้อมูลอิเล็กทรอนิกส์", "ภาพถ่าย", "เสียง"];
const storageMethods = ["เข้ารหัส", "Cloud", "Server ภายใน", "กระดาษ"];
const accessRights = ["ผู้มีสิทธิ", "ฝ่าย HR", "ผู้บริหาร", "IT"];
const destructionMethods = ["ลบถาวร", "ทำลายเอกสาร", "Anonymization"];
const disclosureOptions = ["มีการใช้", "ไม่มีการใช้"];
const disclosurePurposes = ["การตลาด", "การวิเคราะห์", "การปรับปรุงบริการ", "การปฏิบัติตามกฎหมาย"];

export default function Step5Retention() {
  const [dataType, setDataType] = useState<string[]>([]);
  const [storageMethod, setStorageMethod] = useState<string[]>([]);
  const [retentionDD, setRetentionDD] = useState("00");
  const [retentionMM, setRetentionMM] = useState("00");
  const [retentionYY, setRetentionYY] = useState("00");
  const [accessRight, setAccessRight] = useState<string[]>([]);
  const [destructionMethod, setDestructionMethod] = useState("");
  const [disclosureStatus, setDisclosureStatus] = useState("");
  const [disclosurePurpose, setDisclosurePurpose] = useState("");
  const [refusalNote, setRefusalNote] = useState("");

  const SpinnerInput = ({
    value, onChange, placeholder,
  }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
    <div className="flex items-center border border-BLUE rounded-md px-2 h-[38px] w-[72px] justify-between bg-white">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={2}
        className="w-full text-center text-sm text-[#1a3a8f] outline-none font-prompt"
      />
      <div className="flex flex-col gap-0.5">
        <button type="button" onClick={() => onChange(String(Math.min(99, Number(value || 0) + 1)).padStart(2, "0"))}
          className="text-[#1a3a8f] leading-none text-[10px]">▲</button>
        <button type="button" onClick={() => onChange(String(Math.max(0, Number(value || 0) - 1)).padStart(2, "0"))}
          className="text-[#1a3a8f] leading-none text-[10px]">▼</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 font-prompt">
      <div>
        <p className="text-[14px] font-semibold text-BLUE mb-[10px]">นโยบายการเก็บรักษาข้อมูลส่วนบุคคล</p>

        {/* ประเภทข้อมูล + วิธีการเก็บ */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[12px] font-medium text-[#1a3a8f] block mb-1">ประเภทของข้อมูลที่จัดเก็บ</label>
            <MultiSelect options={dataTypes} selected={dataType} onChange={setDataType} placeholder="เลือกประเภท" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#1a3a8f] block mb-1">วิธีการเก็บรักษาข้อมูล</label>
            <MultiSelect options={storageMethods} selected={storageMethod} onChange={setStorageMethod} placeholder="เลือกวิธีการ" />
          </div>
        </div>

        {/*ระยะเวลา + สิทธิเข้าถึง + วิธีทำลาย */}
        <div className="flex items-end gap-4">
          <div>
            <label className="text-[12px] font-medium text-[#1a3a8f] block mb-1">ระยะเวลาการเก็บข้อมูล</label>
            <div className="flex gap-1">
              <SpinnerInput value={retentionDD} onChange={setRetentionDD} placeholder="dd" />
              <SpinnerInput value={retentionMM} onChange={setRetentionMM} placeholder="mm" />
              <SpinnerInput value={retentionYY} onChange={setRetentionYY} placeholder="yy" />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-[12px] font-medium text-[#1a3a8f] block mb-1">สิทธิและวิธีการเข้าถึงข้อมูลส่วนบุคคล</label>
            <MultiSelect options={accessRights} selected={accessRight} onChange={setAccessRight} placeholder="เลือกสิทธิ์" />
          </div>
          <div className="w-36">
            <label className="text-[12px] font-medium text-[#1a3a8f] block mb-1">วิธีการทำลายข้อมูล</label>
            <SingleSelect options={destructionMethods} value={destructionMethod} onChange={setDestructionMethod} placeholder="ตัวเลือก" />
          </div>
        </div>
      </div>

      {/* การใช้หรือเปิดเผยข้อมูล */}
      <div>
        <p className="text-[12px] font-medium text-[#1a3a8f] mb-2">
          การใช้หรือเปิดเผยข้อมูลส่วนบุคคลที่ได้รับยกเว้นไม่ต้องขอความยินยอม
        </p>
        <div className="flex items-center border border-BLUE rounded-lg overflow-hidden h-[45px]">
          {/* ส่วนซ้ายใช้ dropdown */}
          <div className="border-r border-BLUE px-2 h-full flex items-center shrink-0">
            <select
              value={disclosureStatus}
              onChange={(e) => setDisclosureStatus(e.target.value)}
              className="text-sm text-[#1a3a8f] font-medium outline-none bg-transparent cursor-pointer pr-1"
            >
              <option value="">เลือก</option>
              {disclosureOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          {/* purpose dropdown */}
          <div className="flex-1 px-3 h-full flex items-center">
            <select
              value={disclosurePurpose}
              onChange={(e) => setDisclosurePurpose(e.target.value)}
              className="w-full text-sm text-gray-500 outline-none bg-transparent cursor-pointer"
            >
              <option value="">ตัวเลือก</option>
              {disclosurePurposes.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          {/* arrow */}
          <div className="px-3">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[12px] font-medium text-[#1a3a8f] mb-2">
          การปฏิเสธคำขอหรือคัดค้านการใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล
        </p>
        <textarea
          value={refusalNote}
          onChange={(e) => setRefusalNote(e.target.value)}
          placeholder="หมายเหตุ : (*ลงข้อมูลเมื่อมีการปฏิเสธการใช้สิทธิ)"
          rows={3}
          className="w-full border border-BLUE rounded-lg px-4 py-3 text-sm text-gray-500 font-prompt outline-none focus:ring-2 focus:ring-blue-200 resize-none"
        />
      </div>

    </div>
  );
}