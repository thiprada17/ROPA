// app/form/components/steps/Step2DataType
"use client";
import { useState } from "react";
import MultiSelect from "../../../components/MultiSelect";
import SingleSelect from "../../../components/SingleSelect";

const dataCategories = ["ข้อมูลระบุตัวตน", "ข้อมูลการติดต่อ", "ข้อมูลทางการเงิน", "ข้อมูลสุขภาพ", "ข้อมูลการศึกษา"];
const dataTypes = ["ชื่อ-นามสกุล", "เลขบัตรประชาชน", "ที่อยู่", "เบอร์โทรศัพท์", "อีเมล"];
const collectMethods = ["เก็บโดยตรง", "จากบุคคลที่สาม", "จากระบบอัตโนมัติ", "จากแบบฟอร์ม"];
const dataSources = ["ลูกค้า", "พนักงาน", "ระบบ IT", "หน่วยงานภายนอก"];

export default function Step2DataType() {
  const [dataClass, setDataClass] = useState("ข้อมูลบุคลากรใหม่");
  const [otherText, setOtherText] = useState("");
  const [detail, setDetail] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [dataType, setDataType] = useState("");
  const [methods, setMethods] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState("");

  return (
    <div className="space-y-6 font-prompt">
      <div>
        <label className="text-[14px] font-semibold text-BLUE block mb-[10px]">
          ข้อมูลส่วนบุคคลที่จัดเก็บ <span className="text-red-500">*</span>
        </label>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="text-gray-500">ประเภทข้อมูล :</span>
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
            className="border border-gray-200 rounded-md px-2 py-1 text-sm w-[140px] outline-none focus:border-[#1a3a8f] disabled:bg-gray-50 disabled:text-gray-300"
          />
        </div>

        <div className="mt-3">
          <label className="text-sm text-[#1a3a8f] block mb-1">
            รายละเอียดข้อมูล(ถ้ามี)
          </label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-700 outline-none focus:border-[#1a3a8f] resize-none"
            placeholder="ระบุรายละเอียด..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
            หมวดหมู่ข้อมูล <span className="text-red-500">*</span>
          </label>
          <MultiSelect options={dataCategories} selected={categories} onChange={setCategories} placeholder="เลือกประเภท..." />
        </div>
        <div>
          <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
            ประเภทของข้อมูล <span className="text-red-500">*</span>
          </label>
          <SingleSelect options={dataTypes} value={dataType} onChange={setDataType} placeholder="เลือกหมวดหมู่..." />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
            วิธีได้มาซึ่งข้อมูล <span className="text-red-500">*</span>
          </label>
          <MultiSelect options={collectMethods} selected={methods} onChange={setMethods} placeholder="เลือกประเภท..." />
        </div>
        <div>
          <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
            แหล่งที่ได้มาซึ่งข้อมูล <span className="text-red-500">*</span>
          </label>
          <SingleSelect options={dataSources} value={dataSource} onChange={setDataSource} placeholder="เลือกหมวดหมู่..." />
        </div>
      </div>
    </div>
  );
}