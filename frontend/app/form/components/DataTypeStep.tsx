// app/form/components/DataTypeStep.tsx
"use client";

import { useState } from "react";
import MultiSelect from "../components/MultiSelect";
import SingleSelect from "../components/SingleSelect";

const dataCategories = ["ข้อมูลระบุตัวตน", "ข้อมูลการติดต่อ", "ข้อมูลทางการเงิน", "ข้อมูลสุขภาพ", "ข้อมูลการศึกษา"];
const dataTypes = ["ชื่อ-นามสกุล", "เลขบัตรประชาชน", "ที่อยู่", "เบอร์โทรศัพท์", "อีเมล"];
const collectMethods = ["เก็บโดยตรง", "จากบุคคลที่สาม", "จากระบบอัตโนมัติ", "จากแบบฟอร์ม"];
const dataSources = ["ลูกค้า", "พนักงาน", "ระบบ IT", "หน่วยงานภายนอก"];

const radioOptions = [
  { value: "ประเภทข้อมูล", label: "ประเภทข้อมูล :" },
  { value: "ข้อมูลผู้สมัครงาน", label: "ข้อมูลผู้สมัครงาน" },
  { value: "ข้อมูลบุคลากรใหม่", label: "ข้อมูลบุคลากรใหม่" },
  { value: "ข้อมูลบุคลากร", label: "ข้อมูลบุคลากร" },
  { value: "อื่นๆ", label: "อื่นๆ โปรดระบุ :" },
];

export default function DataTypeStep() {
  const [dataClass, setDataClass] = useState("ข้อมูลบุคลากรใหม่");
  const [otherText, setOtherText] = useState("");
  const [detail, setDetail] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [dataType, setDataType] = useState("");
  const [methods, setMethods] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState("");

  return (
    <div className="space-y-6">

      {/* ข้อมูลส่วนบุคคลที่จัดเก็บ */}
      <div>
        <label className="text-sm font-medium text-[#1a3a8f] block mb-3 font-prompt">
          ข้อมูลส่วนบุคคลที่จัดเก็บ <span className="text-red-500">*</span>
        </label>

        {/* Radio row inline */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-prompt">
          <span className="text-gray-500 text-sm">ประเภทข้อมูล :</span>

          {["ข้อมูลผู้สมัครงาน", "ข้อมูลบุคลากรใหม่", "ข้อมูลบุคลากร"].map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="dataClass"
                value={opt}
                checked={dataClass === opt}
                onChange={() => setDataClass(opt)}
                className="accent-[#1a3a8f]"
              />
              <span className={dataClass === opt ? "text-[#1a3a8f] font-medium" : "text-gray-600"}>
                {opt}
              </span>
            </label>
          ))}

          {/* อื่นๆ + input inline */}
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="dataClass"
              value="อื่นๆ"
              checked={dataClass === "อื่นๆ"}
              onChange={() => setDataClass("อื่นๆ")}
              className="accent-[#1a3a8f]"
            />
            <span className={dataClass === "อื่นๆ" ? "text-[#1a3a8f] font-medium" : "text-gray-600"}>
              อื่นๆ โปรดระบุ :
            </span>
          </label>
          <input
            type="text"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            disabled={dataClass !== "อื่นๆ"}
            className="border border-gray-200 rounded-md px-2 py-1 text-sm w-[140px] outline-none focus:border-[#1a3a8f] disabled:bg-gray-50 disabled:text-gray-300 font-prompt"
            placeholder=""
          />
        </div>

        {/* รายละเอียดข้อมูล อยู่ใต้ radio แต่ยังอยู่ใน section เดียวกัน */}
        <div className="mt-3">
          <label className="text-sm text-[#1a3a8f] block mb-1 font-prompt">
            รายละเอียดข้อมูล(ถ้ามี)
          </label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            className="w-full font-prompt border border-gray-200 rounded-md p-2.5 text-sm text-gray-700 outline-none focus:border-[#1a3a8f] resize-none"
            placeholder="ระบุรายละเอียด..."
          />
        </div>
      </div>

      {/* Row: หมวดหมู่ + ประเภท */}
      <div className="grid grid-cols-2 gap-4">
        <div className="font-prompt">
          <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
            หมวดหมู่ข้อมูล <span className="text-red-500">*</span>
          </label>
          <MultiSelect
            options={dataCategories}
            selected={categories}
            onChange={setCategories}
            placeholder="เลือกประเภท..."
          />
        </div>
        <div className="font-prompt">
          <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
            ประเภทของข้อมูล <span className="text-red-500">*</span>
          </label>
          <SingleSelect
            options={dataTypes}
            value={dataType}
            onChange={setDataType}
            placeholder="เลือกหมวดหมู่..."
          />
        </div>
      </div>

      {/* Row: วิธีได้มา + แหล่งที่ได้มา */}
      <div className="grid grid-cols-2 gap-4">
        <div className="font-prompt">
          <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
            วิธีได้มาซึ่งข้อมูล <span className="text-red-500">*</span>
          </label>
          <MultiSelect
            options={collectMethods}
            selected={methods}
            onChange={setMethods}
            placeholder="เลือกประเภท..."
          />
        </div>
        <div className="font-prompt">
          <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
            แหล่งที่ได้มาซึ่งข้อมูล <span className="text-red-500">*</span>
          </label>
          <SingleSelect
            options={dataSources}
            value={dataSource}
            onChange={setDataSource}
            placeholder="เลือกหมวดหมู่..."
          />
        </div>
      </div>

    </div>
  );
}