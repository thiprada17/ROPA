// app/form/components/steps/Step4Transfer
"use client";
import InputField from "../InputField";
import SingleSelect from "../../../components/SingleSelect";
import MultiSelect from "../../../components/MultiSelect";

type Option = {
  label: string;
  value: string;
};

const countries = ["สหรัฐอเมริกา", "สหราชอาณาจักร", "ญี่ปุ่น", "สิงคโปร์", "เยอรมนี"];
const methods = ["เอกสาร", "API", "FTP", "อีเมล", "ระบบดิจิทัล"];
const standards = ["GDPR", "PDPA", "APEC Privacy Framework", "ISO 27001"];
const exemptions = ["ความยินยอม", "สัญญา", "ประโยชน์สาธารณะ", "ข้อยกเว้นอื่น ๆ"];

// Validation Step4
export function validateStep4({
    hasTransferAbroad,
    isToSubsidiary,
    transferCountry,
    subsidiaryName,
    transferMethod,
}: {
    hasTransferAbroad: string;
    isToSubsidiary: string;
    transferCountry: string;
    subsidiaryName: string;
    transferMethod: string;
}) {
    return {
        hasTransferAbroad: !hasTransferAbroad,
        transferCountry: hasTransferAbroad === "มี" && !transferCountry,
        isToSubsidiary: !isToSubsidiary,
        subsidiaryName: isToSubsidiary === "ใช่" && !subsidiaryName.trim(),
        transferMethod: !transferMethod,
    };
}

interface StepProps {
    formData: {
        hasTransferAbroad: string;
        transferCountry: string;
        isToSubsidiary: string;
        subsidiaryName: string;
        transferMethod: string;
        dataProtectionStandard: string[];
        legalExemption: string[];
    };
    errors: Record<string, boolean>;
    options: {
        transferMethods: Option[];
        protectionStandards: Option[];
        legalExemptions: Option[];
    };
    updateField: (field: string, value: any) => void;
}

export default function Step4Transfer({ formData, errors, updateField, options }: StepProps) {
    return (
        <div className="space-y-6 font-prompt">
            {/* มีการโอนข้อมูลต่างประเทศ */}
            <div>
                <p className="text-sm font-medium text-BLUE mb-3">
                    มีการส่งหรือโอนข้อมูลไปต่างประเทศหรือไม่? <span className="text-red-500">*</span>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                    {["ไม่มี", "มี"].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="hasTransferAbroad"
                                value={opt}
                                checked={formData.hasTransferAbroad === opt}
                                onChange={() => updateField("hasTransferAbroad", opt)}
                                className="accent-[#1a3a8f]"
                            />
                            <span className={formData.hasTransferAbroad === opt ? "text-[#1a3a8f] font-medium" : "text-gray-600"}>
                                {opt}
                            </span>
                        </label>
                    ))}

                    {/* country = text เหมือนเดิม (backend เก็บ text) */}
                    {formData.hasTransferAbroad === "มี" && (
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] text-gray-600 whitespace-nowrap">โปรดระบุประเทศปลายทาง :</span>
                            <div className="w-44">
                                <SingleSelect
                                    options={countries}
                                    value={formData.transferCountry}
                                    onChange={(v) => updateField("transferCountry", v)}
                                    placeholder="เลือกประเทศ"
                                    className="!h-[25px] !text-[10px] !py-0 !mb-0"
                                    error={errors.transferCountry}
                                    required
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* บริษัทในเครือ */}
            <div>
                <p className="text-sm font-medium text-[#1a3a8f] mb-3">
                    เป็นการส่งข้อมูลไปยังต่างประเทศของกลุ่มบริษัทในเครือหรือไม่? <span className="text-red-500">*</span>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                    {["ไม่ใช่", "ใช่"].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="isToSubsidiary"
                                value={opt}
                                checked={formData.isToSubsidiary === opt}
                                onChange={() => updateField("isToSubsidiary", opt)}
                                className="accent-[#1a3a8f]"
                            />
                            <span className={formData.isToSubsidiary === opt ? "text-[#1a3a8f] font-medium" : "text-gray-600"}>
                                {opt}
                            </span>
                        </label>
                    ))}

                    {formData.isToSubsidiary === "ใช่" && (
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] text-gray-600 whitespace-nowrap">โปรดระบุชื่อบริษัท :</span>
                            <div className="w-56">
                                <InputField
                                    label=""
                                    placeholder="ชื่อบริษัท"
                                    value={formData.subsidiaryName}
                                    onChange={(v) => updateField("subsidiaryName", v)}
                                    className="!h-[25px] !text-[10px] !mb-1 "
                                    error={errors.subsidiaryName}
                                    required={false}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* วิธีโอน */}
            <div className="grid grid-cols-2 gap-4">
                <div className="mt-[18px]">
                    <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
                        วิธีการโอนข้อมูล <span className="text-red-500">*</span>
                    </label>

                    <SingleSelect
                        options={options.transferMethods}
                        value={formData.transferMethod}
                        onChange={(v) => updateField("transferMethod", v)}
                        placeholder="เลือกวิธีการโอนข้อมูล"
                        error={errors.transferMethod}
                        required
                    />
                </div>

                <div className="mt-[16px]">
                    <MultiSelect
                        label="มาตรฐานการคุ้มครองข้อมูลส่วนบุคคลของประเทศปลายทาง"
                        options={options.protectionStandards}
                        selected={formData.dataProtectionStandard}
                        onChange={(v) => updateField("dataProtectionStandard", v)}
                        placeholder="เลือกมาตรฐาน"
                    />
                </div>
            </div>

            {/* ข้อยกเว้น */}
            <div>
                <MultiSelect
                    label="ข้อยกเว้นตามมาตรา 28"
                    options={options.legalExemptions}
                    selected={formData.legalExemption}
                    onChange={(v) => updateField("legalExemption", v)}
                    placeholder="เลือกข้อยกเว้น"
                />
            </div>
        </div>
    );
}