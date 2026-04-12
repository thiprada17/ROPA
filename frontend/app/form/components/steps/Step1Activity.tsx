// app/form/components/steps/Step1Activity
"use client";
import { useState } from "react";
import InputField from "../InputField";
import SingleSelect from "../../../components/SingleSelect";

const dataTypes = ["ชื่อ-นามสกุล", "เลขบัตรประชาชน", "เบอร์โทรศัพท์", "อีเมล"];
const processingPurposes = ["การตลาด", "การวิเคราะห์ข้อมูล", "ปรับปรุงบริการ", "วิจัยภายในองค์กร"];

export default function Step1Activity() {
  const [company, setCompany] = useState("บริษัท A"); // ตั้ง default มันพัง ไม่รุว่าเปนไร
  const [dataType, setDataType] = useState("");        
  const [processingPurpose, setProcessingPurpose] = useState("");

  return (
    <div className="space-y-6 font-prompt">
      <InputField
        id="company"
        label="ข้อมูลเกี่ยวกับผู้ควบคุมข้อมูลส่วนบุคคล"
        value={company}
        onChange={setCompany}
        placeholder="บริษัท A"
      />

      <div>
        <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
          กิจกรรมประมวลผล <span className="text-red-500">*</span>
        </label>
        <SingleSelect
          options={dataTypes}
          value={dataType}
          onChange={setDataType}
          placeholder="เลือกประเภทข้อมูล..."
        />
      </div>

      <div>
        <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
          วัตถุประสงค์ของการประมวลผล <span className="text-red-500">*</span>
        </label>
        <SingleSelect
          options={processingPurposes}
          value={processingPurpose}
          onChange={setProcessingPurpose}
          placeholder="เลือกวัตถุประสงค์..."
        />
      </div>

      <InputField
        id="dataOwners"
        label="รายชื่อเจ้าของข้อมูล"
        value="" 
        onChange={() => {}}
        placeholder="ชื่อ-นามสกุล เจ้าของข้อมูล"
      />
    </div>
  );
}