// app/form/components/steps/Step7Precessor
"use client";
import { useState } from "react";
import { PlusCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import InputField from "../InputField";
import MultiSelect from "../../../components/MultiSelect";

const addressOptions = ["บริษัทคู่ค้า", "สำนักงานใหญ่", "สาขา", "ต่างประเทศ"];
const securityMeasures = [
  "มาตรการเชิงองค์กร",
  "มาตรการเชิงเทคนิค",
  "มาตรการทางกายภาพ",
  "การควบคุมการเข้าถึงข้อมูล",
  "การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน",
  "มาตรการตรวจสอบย้อนหลัง",
];

interface ProcessorData {
  id: number;
  name: string;
  address: string[];
  securitySelected: Record<string, boolean>;
  securityDetails: Record<string, string>;
}

const emptyDraft = () => ({
  name: "",
  address: [] as string[],
  securitySelected: {} as Record<string, boolean>,
  securityDetails: {} as Record<string, string>,
});

type Draft = ReturnType<typeof emptyDraft>;

function isDraftEmpty(draft: Draft) {
  return !draft.name && draft.address.length === 0;
}

// ขโมยขั้นหกมาใช้
function SecuritySection({ d, setD }: { d: Draft; setD: (v: Draft) => void }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#1a3a8f] mb-[20px] text-center">
        นโยบายการเก็บรักษาข้อมูลส่วนบุคคล :
      </p>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        {securityMeasures.map((item) => (
          <div key={item} className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!d.securitySelected[item]}
                onChange={() =>
                  setD({ ...d, securitySelected: { ...d.securitySelected, [item]: !d.securitySelected[item] } })
                }
                className="accent-[#1a3a8f] w-4 h-4"
              />
              <span className={`text-sm ${d.securitySelected[item] ? "text-[#1a3a8f] font-medium" : "text-gray-500"}`}>
                {item}
              </span>
            </label>
            {d.securitySelected[item] && (
              <textarea
                value={d.securityDetails[item] || ""}
                onChange={(e) =>
                  setD({ ...d, securityDetails: { ...d.securityDetails, [item]: e.target.value } })
                }
                placeholder="รายละเอียด(ถ้ามี)"
                rows={3}
                className="w-full border border-BLUE rounded-lg px-3 py-2 text-sm text-gray-500 outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Step7Processor() {
  const [processors, setProcessors] = useState<ProcessorData[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Draft | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleAddNew = () => {
    setDraft(emptyDraft());
    setExpandedId(null);
    setEditDraft(null);
  };

  const handleSaveDraft = () => {
    if (!draft) return;
    const name = draft.name.trim() || "Processor สักคน";
    setProcessors((prev) => [...prev, { id: Date.now(), ...draft, name }]);
    setDraft(null);
  };

  const handleCloseDraft = () => {
    if (!draft) return;
    if (isDraftEmpty(draft)) {
      setDraft(null);
    } else {
      setShowConfirm(true);
    }
  };

  const handleToggleExpand = (p: ProcessorData) => {
    if (expandedId === p.id) {
      setExpandedId(null);
      setEditDraft(null);
    } else {
      setExpandedId(p.id);
      setEditDraft({ ...p });
    }
  };

  const handleSaveEdit = (id: number) => {
    if (!editDraft) return;
    const name = editDraft.name.trim() || "Processor สักคน";
    setProcessors((prev) => prev.map((p) => (p.id === id ? { ...p, ...editDraft, name } : p)));
    setExpandedId(null);
    setEditDraft(null);
  };

  const handleDeleteProcessor = (id: number) => {
    setProcessors((prev) => prev.filter((p) => p.id !== id));
    if (expandedId === id) { setExpandedId(null); setEditDraft(null); }
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-4 font-prompt">

{/* ปุ่ม Add */}
{(processors.length > 0 || draft) && (
  <div className="flex justify-end">
    <button
      type="button"
      onClick={handleAddNew}
      className="flex items-center gap-1.5 bg-[#5E84DB] text-white text-xs px-4 py-2 rounded-full hover:bg-[#1a3a8f] transition"
    >
      <PlusCircle size={14} /> Add New Processor
    </button>
  </div>
)}

{/* Empty processor ปุ่มใหญ่กลางจอ */}
{processors.length === 0 && !draft && (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <button
      type="button"
      onClick={handleAddNew}
      className="flex items-center gap-2 bg-[#5E84DB] text-white text-base px-8 py-4 rounded-full hover:bg-[#1a3a8f] transition shadow-md"
    >
      <PlusCircle size={22} /> Add New Processor
    </button>
    <p className="text-gray-400 text-sm">ยังไม่มีผู้ประมวลผล</p>
  </div>
)}

      {/* Draft card */}
      {draft && (
        <div className="border border-BLUE rounded-xl flex flex-col h-[420px]">
          <div className="flex justify-end items-center gap-2 px-5 pt-4 pb-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="border border-[#1a3a8f] text-[#1a3a8f] text-xs px-4 py-1.5 rounded-lg hover:bg-[#f0f4ff] transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCloseDraft}
              className="text-gray-400 hover:text-red-500 transition"
              title="ยกเลิก"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              onClick={handleCloseDraft}
              className="text-gray-400 hover:text-[#1a3a8f] transition"
            >
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
            <InputField
              label="ชื่อผู้ประมวลผลข้อมูลส่วนบุคคล"
              placeholder="ชื่อผู้ประมวลผล"
              value={draft.name}
              onChange={(v) => setDraft({ ...draft, name: v })}
            />
            <div>
              <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
                ที่อยู่ผู้ประมวลผลข้อมูลส่วนบุคคล <span className="text-red-500">*</span>
              </label>
              <MultiSelect
                options={addressOptions}
                selected={draft.address}
                onChange={(v) => setDraft({ ...draft, address: v })}
                placeholder="เลือกที่อยู่"
              />
            </div>
            <hr className="border-gray-200" />
            <SecuritySection d={draft} setD={setDraft} />
          </div>
        </div>
      )}

      {/* Processor list */}
      {processors.map((p) => {
        const isOpen = expandedId === p.id;
        return (
          <div key={p.id} className="border border-BLUE rounded-xl overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-3 bg-[#ECF0F9]  cursor-pointer hover:bg-[#f8f9ff]"
              onClick={() => handleToggleExpand(p)}
            >
              <span className="text-sm font-medium text-[#1a3a8f]">{p.name}</span>
              {isOpen
                ? <ChevronUp size={18} className="text-[#1a3a8f]" />
                : <ChevronDown size={18} className="text-gray-400" />}
            </div>

            {isOpen && editDraft && (
              <div className="border-t border-BLUE flex flex-col h-[380px]">
                <div className="flex justify-end items-center gap-2 px-5 pt-3 pb-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(p.id)}
                    className="border border-[#1a3a8f] text-[#1a3a8f] text-xs px-4 py-1.5 rounded-lg hover:bg-[#f0f4ff] transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(p.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="ลบ processor นี้"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setExpandedId(null); setEditDraft(null); }}
                    className="text-gray-400 hover:text-[#1a3a8f] transition"
                  >
                    <ChevronUp size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
                  <InputField
                    label="ชื่อผู้ประมวลผลข้อมูลส่วนบุคคล"
                    placeholder="ชื่อผู้ประมวลผล"
                    value={editDraft.name}
                    onChange={(v) => setEditDraft({ ...editDraft, name: v })}
                  />
                  <div>
                    <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
                      ที่อยู่ผู้ประมวลผลข้อมูลส่วนบุคคล <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={addressOptions}
                      selected={editDraft.address}
                      onChange={(v) => setEditDraft({ ...editDraft, address: v })}
                      placeholder="เลือกที่อยู่"
                    />
                  </div>
                  <hr className="border-gray-200" />
                  <SecuritySection d={editDraft} setD={setEditDraft} />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* confirm discard draft */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl space-y-4 w-80">
            <p className="text-sm font-medium text-[#1a3a8f] text-center">
              คุณยังไม่ได้กด Save<br />ต้องการออกโดยไม่บันทึกหรือไม่?
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => { setDraft(null); setShowConfirm(false); }}
                className="bg-red-500 text-white text-sm px-5 py-2 rounded-lg hover:bg-red-600 transition"
              >
                ออกโดยไม่บันทึก
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="border border-[#1a3a8f] text-[#1a3a8f] text-sm px-5 py-2 rounded-lg hover:bg-[#f0f4ff] transition"
              >
                กลับไปแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* confirm delete processor */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl space-y-4 w-80">
            <p className="text-sm font-medium text-[#1a3a8f] text-center">
              ต้องการลบ Processor นี้ออกหรือไม่?
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => handleDeleteProcessor(deleteTargetId)}
                className="bg-red-500 text-white text-sm px-5 py-2 rounded-lg hover:bg-red-600 transition"
              >
                ลบ
              </button>
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="border border-[#1a3a8f] text-[#1a3a8f] text-sm px-5 py-2 rounded-lg hover:bg-[#f0f4ff] transition"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}