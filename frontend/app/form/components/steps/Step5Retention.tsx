// app/form/components/steps/Step5Retention
"use client";
import SingleSelect from "../../../components/SingleSelect";
import MultiSelect from "../../../components/MultiSelect";

const dataTypes = ["เอกสาร", "ข้อมูลอิเล็กทรอนิกส์", "ภาพถ่าย", "เสียง"];
const storageMethods = ["เข้ารหัส", "Cloud", "Server ภายใน", "กระดาษ"];
const accessRights = ["ผู้มีสิทธิ", "ฝ่าย HR", "ผู้บริหาร", "IT"];
const destructionMethods = ["ลบถาวร", "ทำลายเอกสาร", "Anonymization"];
const usageStatus = ["มีการใช้", "ไม่มีการใช้"];
const usagePurposes = ["การตลาด", "การวิเคราะห์", "การปรับปรุงบริการ", "การปฏิบัติตามกฎหมาย"];

const SpinnerInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div className="flex items-center border border-BLUE rounded-md px-2 h-[45px] w-[72px] justify-between bg-white">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={2}
      className="w-full text-center text-sm text-[#1a3a8f] outline-none font-prompt"
    />
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() =>
          onChange(String(Math.min(99, Number(value || 0) + 1)).padStart(2, "0"))
        }
        className="text-[#1a3a8f] leading-none text-[10px]"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={() =>
          onChange(String(Math.max(0, Number(value || 0) - 1)).padStart(2, "0"))
        }
        className="text-[#1a3a8f] leading-none text-[10px]"
      >
        ▼
      </button>
    </div>
  </div>
);

// Validation Step5
export function validateStep5(formData: any) {
  const hasRetention =
    (formData.retentionDD && formData.retentionDD !== "00") ||
    (formData.retentionMM && formData.retentionMM !== "00") ||
    (formData.retentionYY && formData.retentionYY !== "00");

  return {
    dataType: formData.dataType.length === 0,
    storageMethod: formData.storageMethod.length === 0,
    retention: !hasRetention, // error เดียวแทนสามช่อง นา
    accessRight: formData.accessRight.length === 0,
    usageStatus: !formData.usageStatus,
    usagePurpose: !formData.usagePurpose,
  };
}

interface StepProps {
  formData: any;
  errors: Record<string, boolean>;
  updateField: (field: string, value: any) => void;
}

export default function Step5Retention({ formData, errors, updateField }: StepProps) {
  return (
    <div className="space-y-6 font-prompt">
      <div>
        <p className="text-[14px] font-semibold text-BLUE mb-2">
          นโยบายการเก็บรักษาข้อมูลส่วนบุคคล<span className="text-red-500">*</span>
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[12px] font-medium text-[#1a3a8f] block mb-1">
              ประเภทของข้อมูลที่จัดเก็บ<span className="text-red-500">*</span>
            </label>
            <MultiSelect
              options={dataTypes}
              selected={formData.dataType}
              onChange={(v) => updateField("dataType", v)}
              placeholder="เลือกประเภท"
              error={errors.dataType}
              required
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#1a3a8f] block mb-1">
              วิธีการเก็บรักษาข้อมูล<span className="text-red-500">*</span>
            </label>
            <MultiSelect
              options={storageMethods}
              selected={formData.storageMethod}
              onChange={(v) => updateField("storageMethod", v)}
              placeholder="เลือกวิธีการ"
              error={errors.storageMethod}
              required
            />
          </div>
        </div>

        {/* แถวกลาง มันชอบดันแยกกัน*/}
        <div>
          <div className="flex items-start gap-4">
            {/* ระยะเวลา */}
            <div className="shrink-0">
              <label className="text-[12px] font-medium text-[#1a3a8f] block mb-1">
                ระยะเวลาการเก็บข้อมูล<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                <SpinnerInput value={formData.retentionDD} onChange={(v) => updateField("retentionDD", v)} placeholder="dd" />
                <SpinnerInput value={formData.retentionMM} onChange={(v) => updateField("retentionMM", v)} placeholder="mm" />
                <SpinnerInput value={formData.retentionYY} onChange={(v) => updateField("retentionYY", v)} placeholder="yy" />
              </div>
              <div className="h-4 mt-1">
                {errors.retention && (
                  <p className="text-red-500 text-[10px]">กรุณาระบุระยะเวลาเก็บข้อมูล</p>
                )}
              </div>
            </div>

            {/* สิทธิ์ */}
            <div className="flex-1">
              <label className="text-[12px] font-medium text-[#1a3a8f] block mb-1">
                สิทธิและวิธีการเข้าถึงข้อมูลส่วนบุคคล<span className="text-red-500">*</span>
              </label>
              <MultiSelect
                options={accessRights}
                selected={formData.accessRight}
                onChange={(v) => updateField("accessRight", v)}
                placeholder="เลือกสิทธิ์"
                error={errors.accessRight}
                required
              />
              <div className="h-4 mt-1" />
            </div>
            {/* วิธีทำลาย */}
            <div className="w-36">
              <label className="text-[12px] font-medium text-[#1a3a8f] block mb-1">
                วิธีการทำลายข้อมูล
              </label>
              <SingleSelect
                options={destructionMethods}
                value={formData.destructionMethod}
                onChange={(v) => updateField("destructionMethod", v)}
                placeholder="ตัวเลือก"
              />
              <div className="h-4 mt-1" />
            </div>

          </div>
        </div>

        <div className="mb-[10px]">
          <p className="text-[12px] font-medium text-[#1a3a8f] mb-2">
            การใช้หรือเปิดเผยข้อมูลส่วนบุคคลที่ได้รับยกเว้นไม่ต้องขอความยินยอม{" "}
            <span className="text-red-500">*</span>
          </p>
          <div className={`flex items-center border rounded-lg overflow-hidden h-[45px] ${(errors.usageStatus || errors.usagePurpose)
              ? "border-red-400"
              : "border-BLUE"
            }`}>
            <div className={`border-r px-2 h-full flex items-center shrink-0 ${(errors.usageStatus || errors.usagePurpose)
                ? "border-red-400"
                : "border-BLUE"
              }`}>
              <select
                value={formData.usageStatus}
                onChange={(e) => updateField("usageStatus", e.target.value)}
                className="text-sm text-[#1a3a8f] font-medium outline-none bg-transparent cursor-pointer pr-1"
              >
                <option value="">เลือก</option>
                {usageStatus.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 px-3 h-full flex items-center">
              <select
                value={formData.usagePurpose}
                onChange={(e) => updateField("usagePurpose", e.target.value)}
                className="w-full text-sm text-gray-500 outline-none bg-transparent cursor-pointer"
              >
                <option value="">ตัวเลือก</option>
                {usagePurposes.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

      {/* แยก error message ถ้าเค้าำม่เลือกทั้งสอง */}
          <div className="h-4 mt-1">
            {errors.usageStatus && !formData.usageStatus && (
              <p className="text-red-500 text-[10px]">กรุณาเลือกสถานะการใช้งาน</p>
            )}
            {!errors.usageStatus && errors.usagePurpose && (
              <p className="text-red-500 text-[10px]">กรุณาเลือกวัตถุประสงค์</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-[12px] font-medium text-[#1a3a8f] mb-2">
            การปฏิเสธคำขอหรือคัดค้านการใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล
          </p>
          <textarea
            value={formData.refusalNote}
            onChange={(e) => updateField("refusalNote", e.target.value)}
            placeholder="หมายเหตุ : (*ลงข้อมูลเมื่อมีการปฏิเสธการใช้สิทธิ)"
            rows={3}
            className="w-full border border-BLUE rounded-lg px-4 py-3 text-sm text-gray-500 font-prompt outline-none focus:ring-2 focus:ring-blue-200 resize-none"
          />
        </div>
      </div>
    </div>
  );
}