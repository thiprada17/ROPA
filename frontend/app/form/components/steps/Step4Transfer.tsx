// app/form/components/steps/Step4Transfer
"use client";
import { useState } from "react";
import InputField from "../InputField";
import SingleSelect from "../../../components/SingleSelect";
import MultiSelect from "../../../components/MultiSelect";

const countries = ["สหรัฐอเมริกา", "สหราชอาณาจักร", "ญี่ปุ่น", "สิงคโปร์", "เยอรมนี"];
const methods = ["เอกสาร", "API", "FTP", "อีเมล", "ระบบดิจิทัล"];
const standards = ["GDPR", "PDPA", "APEC Privacy Framework", "ISO 27001"];
const exemptions = ["ความยินยอม", "สัญญา", "ประโยชน์สาธารณะ", "ข้อยกเว้นอื่น ๆ บลา ๆ"];

export default function Step4Transfer() {
    const [hasTransferAbroad, setHasTransferAbroad] = useState("");
    const [transferCountry, setTransferCountry] = useState("");
    const [isToSubsidiary, setIsToSubsidiary] = useState("");
    const [subsidiaryName, setSubsidiaryName] = useState("");
    const [transferMethod, setTransferMethod] = useState("");
    const [dataProtectionStandard, setDataProtectionStandard] = useState<string[]>([]);
    const [legalExemption, setLegalExemption] = useState<string[]>([]);

    return (
        <div className="space-y-6 font-prompt">
            <p className="text-[14px] font-semibold text-BLUE mb-[10px]">ส่งหรือโอนข้อมูลส่วนบุคคลไปต่างประเทศ <span className="text-red-500">*</span></p>
            <div>
                <p className="text-sm font-medium text-BLUE mb-3">
                    มีการส่งหรือโอนข้อมูลไปต่างประเทศหรือไม่? <span className="text-red-500">*</span>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                    {/* ไม่มี */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="hasTransferAbroad"
                            value="ไม่มี"
                            checked={hasTransferAbroad === "ไม่มี"}
                            onChange={() => setHasTransferAbroad("ไม่มี")}
                            className="accent-[#1a3a8f]"
                        />
                        <span className={hasTransferAbroad === "ไม่มี" ? "text-[#1a3a8f] font-medium" : "text-gray-600"}>
                            ไม่มี
                        </span>
                    </label>

                    {/* มี + label + dropdown */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="hasTransferAbroad"
                            value="มี"
                            checked={hasTransferAbroad === "มี"}
                            onChange={() => setHasTransferAbroad("มี")}
                            className="accent-[#1a3a8f]"
                        />
                        <span className={hasTransferAbroad === "มี" ? "text-[#1a3a8f] font-medium" : "text-gray-600"}>
                            มี
                        </span>
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] text-gray-600 whitespace-nowrap">โปรดระบุประเทศปลายทาง :</span>
                        <div className="w-44">
                            <SingleSelect
                                options={countries}
                                value={transferCountry}
                                onChange={setTransferCountry}
                                placeholder="เลือกประเทศ"
                                disabled={hasTransferAbroad !== "มี"}
                                className="!h-[25px] !text-[10px] !py-0 !mb-0"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* บริษัทในเครือ */}
            <div>
                <p className="text-sm font-medium text-[#1a3a8f] mb-3">
                    เป็นการส่งข้อมูลไปยังต่างประเทศของกลุ่มบริษัทในเครือหรือไม่? <span className="text-red-500">*</span>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                    {/* ไม่ใช่ */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="isToSubsidiary"
                            value="ไม่ใช่"
                            checked={isToSubsidiary === "ไม่ใช่"}
                            onChange={() => setIsToSubsidiary("ไม่ใช่")}
                            className="accent-[#1a3a8f]"
                        />
                        <span className={isToSubsidiary === "ไม่ใช่" ? "text-[#1a3a8f] font-medium" : "text-gray-600"}>
                            ไม่ใช่
                        </span>
                    </label>

                    {/* ใช่ + label + input */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="isToSubsidiary"
                            value="ใช่"
                            checked={isToSubsidiary === "ใช่"}
                            onChange={() => setIsToSubsidiary("ใช่")}
                            className="accent-[#1a3a8f]"
                        />
                        <span className={isToSubsidiary === "ใช่" ? "text-[#1a3a8f] font-medium" : "text-gray-600"}>
                            ใช่
                        </span>
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] text-gray-600 whitespace-nowrap">โปรดระบุชื่อบริษัท :</span>
                        <div className="w-56">
                            <InputField
                                label=""
                                placeholder="ชื่อบริษัท"
                                value={subsidiaryName}
                                onChange={setSubsidiaryName}
                                disabled={isToSubsidiary !== "ใช่"}
                                required={false}
                                className="!h-[22px] !text-[10px] !mb-0 !w-[90px]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* วิธีโอน + คุ้มครอง */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
                        วิธีการโอนข้อมูล
                    </label>
                    <SingleSelect
                        options={methods}
                        value={transferMethod}
                        onChange={setTransferMethod}
                        placeholder="เลือกวิธีการโอนข้อมูล"
                        
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
                        มาตรฐานการคุ้มครองข้อมูลส่วนบุคคลของประเทศปลายทาง
                    </label>
                    <MultiSelect
                        options={standards}
                        selected={dataProtectionStandard}
                        onChange={setDataProtectionStandard}
                        placeholder="เลือกมาตรฐาน"
                    />
                </div>
            </div>

            {/* ข้อยกเว้น */}
            <div>
                <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
                    ข้อยกเว้นตามมาตรา 28
                </label>
                <MultiSelect
                    options={exemptions}
                    selected={legalExemption}
                    onChange={setLegalExemption}
                    placeholder="เลือกข้อยกเว้น"
                />
            </div>

        </div>
    );
}