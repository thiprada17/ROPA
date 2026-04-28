"use client";
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Menu, X } from "lucide-react";

const sections = [
    {
        id: "legal-bases",
        title: "ฐานทางกฎหมาย (มาตรา 24)",
        items: [
            {
                id: "research-statistic",
                titleTH: "ฐานเพื่อการศึกษาวิจัยหรือสถิติ",
                titleEN: "Research or Statistic",
                description: [
                    "เก็บเพื่อจัดทำเอกสารประวัติศาสตร์หรือจดหมายเหตุเพื่อประโยชน์สาธารณะ",
                    "เกี่ยวกับการศึกษาวิจัยหรือสถิติ",
                    "ต้องมีมาตรการปกป้องข้อมูลส่วนบุคคลที่เหมาะสม",
                ],
            },
            {
                id: "vital-interest",
                titleTH: "ฐานป้องกันหรือระงับอันตรายต่อชีวิต",
                titleEN: "Vital Interest",
                description: [
                    "ป้องกันหรือระงับอันตรายต่อชีวิต ร่างกาย หรือสุขภาพ",
                    "ตัวอย่าง: โรงพยาบาลเข้าถึงประวัติการแพ้ยา/กรุ๊ปเลือดผู้ป่วยฉุกเฉิน",
                    "ไม่ต้องรอผู้ป่วยให้ความยินยอม",
                ],
            },
            {
                id: "contract",
                titleTH: "ฐานการปฏิบัติตามสัญญา",
                titleEN: "Contract",
                description: [
                    "จำเป็นเพื่อการปฏิบัติตามสัญญา",
                    "ใช้ในการดำเนินการตามคำขอก่อนเข้าทำสัญญา",
                    "ตัวอย่าง: ส่งสินค้าที่ลูกค้าสั่ง, จ่ายเงินเดือนพนักงาน",
                ],
            },
            {
                id: "public Task",
                titleTH: "ฐานภารกิจของรัฐ",
                titleEN: "Public Task",
                description: [
                    "จำเป็นเพื่อการปฏิบัติหน้าที่ของรัฐเพื่อประโยชน์สาธารณะ",
                    "ตัวอย่าง: เก็บภาษี, ตรวจสอบสวัสดิการแห่งรัฐ",
                ],
            },
            {
                id: "legitimate interest",
                titleTH: "ฐานประโยชน์โดยชอบด้วยกฎหมาย",
                titleEN: "Legitimate Interest",
                description: [
                    "จำเป็นเพื่อประโยชน์โดยชอบด้วยกฎหมาย",
                    "ไม่ละเมิดสิทธิขั้นพื้นฐานเกินสมควร",
                    "ตัวอย่าง: กล้อง CCTV, บันทึก Log การใช้งานคอมพิวเตอร์",
                ],
            },
            {
                id: "legal obligation",
                titleTH: "ฐานการปฏิบัติตามกฎหมาย",
                titleEN: "Legal Obligation",
                description: [
                    "ปฏิบัติตามกฎหมายของผู้ควบคุมข้อมูล",
                    "ตัวอย่าง: ธนาคารเก็บข้อมูลธุรกรรมตามกฎหมาย, ส่งรายได้พนักงานให้กรมสรรพากร",
                ],
            },
        ],
    },
    {
        id: "pdpa-gdpr",
        title: "PDPA & GDPR",
        items: [
            {
                id: "pdpa",
                titleTH: "PDPA (Personal Data Protection Act)",
                titleEN: "PDPA",
                description: [
                    "พรบ.ควบคุมข้อมูลส่วนบุคคล กำหนดมาตรการและหน้าที่ขององค์กรในการควบคุมข้อมูลผู้บริโภค/ผู้ใช้บริการ",
                    "มาตรา 39: ผู้ควบคุมข้อมูลต้องบันทึกรายการกิจกรรม (RoPA)",
                    "มาตรา 40: ผู้ประมวลผลต้องจัดทำ เก็บ บันทึกรายการกิจกรรม",
                ],
            },
            {
                id: "gdpr",
                titleTH: "GDPR (General Data Protection Regulation)",
                titleEN: "GDPR",
                description: [
                    "กฎหมายคุ้มครองข้อมูลส่วนบุคคลของสหภาพยุโรป เป็นต้นแบบ PDPA",
                    "คุ้มครองสิทธิความเป็นส่วนตัวของเจ้าของข้อมูล และกำหนดมาตรฐานการจัดการข้อมูลเข้มงวด",
                ],
            },
        ],
    },
    {
        id: "controller-processor",
        title: "Controller & Processor",
        items: [
            {
                id: "controller",
                titleTH: "Controller – ผู้ควบคุมข้อมูล",
                titleEN: "Controller",
                description: [
                    "PDPA มาตรา 39 / GDPR Article 30",
                    "Data Controller ต้องบันทึกใน RoPA:",
                    "ชื่อและข้อมูลติดต่อของผู้ควบคุมข้อมูล, ตัวแทน, DPO (ถ้ามี)",
                    "- วัตถุประสงค์ในการประมวลผลข้อมูล",
                    "- ประเภทเจ้าของข้อมูล และประเภทข้อมูลส่วนบุคคล",
                    "- รายการผู้รับข้อมูล รวมถึงการโอนข้อมูลข้ามประเทศ (ถ้ามี)",
                    "- ระยะเวลาลบข้อมูลในแต่ละประเภท (ถ้าเป็นไปได้)",
                    "- มาตรการด้านความปลอดภัยทางเทคนิคและองค์กร (Article 32)",
                ],
            },
            {
                id: "processor",
                titleTH: "Processor – ผู้ประมวลผลข้อมูล",
                titleEN: "Processor",
                description: [
                    "PDPA มาตรา 40 / GDPR Article 30",
                    "Data Processor ต้องบันทึก:",
                    "- รายชื่อผู้ควบคุมข้อมูลที่ให้บริการ และรายละเอียดการประมวลผล",
                    "- การโอนข้อมูลข้ามประเทศ (ถ้ามี) และมาตรการป้องกันข้อมูล",
                    "- มาตรการด้านความมั่นคงปลอดภัย",
                ],
            },
        ],
    },
];

export default function LegalPage() {
    const [navOpen, setNavOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 font-prompt text-sm relative scroll-smooth">
            <aside className="w-20 flex-shrink-0 p-6">
                <Sidebar userName="User Legal" userEmail="legal@mail.com" />
            </aside>

            {/* main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {sections.map((sec) => (
                    <section key={sec.id} id={sec.id} className="mb-8">
                        <h1 className="text-2xl font-semibold mb-4 text-BLUE">{sec.title}</h1>
                        {sec.items.map((item) => (
                            <div
                                key={item.id}
                                id={item.id}
                                className="bg-white rounded-xl shadow p-5 mb-4 hover:shadow-md transition scroll-mt-[100px]"
                            >
                                <h2 className="font-medium text-lg mb-2 text-BLUE">
                                    {item.titleTH} <span className="text-gray-500 text-sm">({item.titleEN})</span>
                                </h2>

                                {item.description.map((line, idx) =>
                                    line.trimStart().startsWith("-") ? (
                                        <p key={idx} className="text-gray-700 mb-1">{line}</p>
                                    ) : (
                                        <ul key={idx} className="list-disc list-inside text-gray-700 space-y-1">
                                            <li>{line}</li>
                                        </ul>
                                    )
                                )}
                            </div>
                        ))}
                    </section>
                ))}
            </main>

            {/* naviga drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 p-4 transform transition-transform duration-300 shadow-lg z-40 rounded-l-lg ${navOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <h2 className="font-semibold font-gabarito mb-2 text-BLUE text-[18px]">Navigation</h2>
                <ul className="space-y-1 text-sm">
                    {sections.map((sec) => (
                        <li key={sec.id}>
                            <a
                                href={`#${sec.id}`}
                                className="text-BLUE hover:underline transition-colors"
                                onClick={() => setNavOpen(false)}
                            >
                                {sec.title}
                            </a>
                            <ul className="ml-4 mt-1 space-y-1">
                                {sec.items.map((item) => (
                                    <li key={item.id}>
                                        <a
                                            href={`#${item.id}`}
                                            className="text-gray-700 text-xs block px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                                            onClick={() => setNavOpen(false)}
                                        >
                                            {item.titleTH}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>

            {/* mminimal drawer */}
            <div
                onClick={() => setNavOpen(!navOpen)}
                className="fixed top-1/2 -translate-y-1/2 right-0 w-6 h-16 bg-white border border-gray-300 rounded-l-lg shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-100 z-50"
            >
                {navOpen ? <X size={16} /> : <Menu size={16} />}
            </div>
        </div>
    );
}