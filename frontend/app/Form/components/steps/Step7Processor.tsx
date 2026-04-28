// app/form/components/steps/Step7Precessor
"use client";
import { useState, useEffect } from "react";
import { PlusCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import InputField from "../InputField";

const securityMeasures = [
  "มาตรการเชิงองค์กร",
  "มาตรการเชิงเทคนิค",
  "มาตรการทางกายภาพ",
  "การควบคุมการเข้าถึงข้อมูล",
  "การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน",
  "มาตรการตรวจสอบย้อนหลัง",
];

export interface ProcessorData {
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

// check if draft is empty
function isDraftEmpty(draft: Draft) {
  return !draft.name.trim() && draft.address.length === 0;
}

// // ขโมยขั้นหกมาใช้ SecuritySection
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

interface Step7ProcessorProps {
  processors: ProcessorData[];
  updateProcessors: (v: ProcessorData[]) => void;
  setIsEditingProcessor: (v: boolean) => void;
}

export default function Step7Processor(props: Step7ProcessorProps) {
  // const [processors, setProcessors] = useState<ProcessorData[]>([]);
  const { processors, updateProcessors } = props;
  const setProcessors = updateProcessors;
  // const setProcessors = (v: ProcessorData[]) => updateField("processors", v);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Draft | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [draftErrors, setDraftErrors] = useState<{ name?: boolean; address?: boolean }>({});

  const handleAddNew = () => {
    setDraft(emptyDraft());
    setExpandedId(null);
    setEditDraft(null);
    setDraftErrors({});
  };
  const validateRequiredFields = (d: Draft) => {
    const nonEmptyAddresses = d.address.filter(line => line.trim() !== "");
    return {
      name: !d.name.trim(),
      address: nonEmptyAddresses.length === 0,
    };
  };
  // ตรวจสอบว่ามีการแก้ไขจริงหรือไม่
  function isDraftModified(draft: Draft, original?: Draft) {
    if (!draft) return false;
    if (!original) return !isDraftEmpty(draft); // เพิ่มใหม่ consider modified ถ้าไม่ว่าง
    // เปรียบเทียบ field ทั้งหมด
    if (draft.name.trim() !== original.name.trim()) return true;
    if (draft.address.join("\n") !== original.address.join("\n")) return true;
    for (const key of securityMeasures) {
      if ((draft.securitySelected[key] || false) !== (original.securitySelected[key] || false)) return true;
      if ((draft.securityDetails[key] || "") !== (original.securityDetails[key] || "")) return true;
    }
    return false;
  }

  const handleSaveDraft = () => {
    if (!draft) return;
    // validate required fields (มีดอกจัน)
    const errors = {
      name: !draft.name.trim(),
      address: draft.address.length === 0,
    };
    setDraftErrors(errors);
    // ถ้า field required ยังไม่ครบ return
    if (errors.name || errors.address) return;
    // บันทึก draft
    const name = draft.name.trim() || "Processor สักคน";
    const cleanedAddress = draft.address.map(line => line.trim()).filter(line => line !== "");
    setProcessors([...processors, { id: Date.now(), ...draft, name, address: cleanedAddress }]);    // reset
    setDraft(null);
    setDraftErrors({});
  };

  const handleCloseDraft = () => {
    if (!draft) return;

    if (isDraftModified(draft)) {
      // draft ว่าง ปิดเลย
      setDraft(null);
      setDraftErrors({});
    } else {
      // draft มีข้อมูล แสดง confirm
      setShowConfirm(true);
    }
  };

  // confirm popup "ออกโดยไม่บันทึก" ปิด draft เลย ไม่ validate
  const handleDiscardDraft = () => {
    setDraft(null);
    setShowConfirm(false);
    setDraftErrors({});
  };

  const handleToggleExpand = (p: ProcessorData) => {
    if (expandedId === p.id) {
      if (!editDraft || !isDraftModified(editDraft, p)) {
        // ถ้าไม่มีการแก้ไข หรือ draft ว่าง ปิดได้เลย
        setExpandedId(null);
        setEditDraft(null);
      } else {
        // ถ้ามีการแก้ไข แสดง confirm
        setShowConfirm(true);
      }
    } else {
      setExpandedId(p.id);
      setEditDraft({ ...p }); // load ข้อมูลเดิมเข้า draft
    }
  };


  const handleSaveEdit = (id: number) => {
    if (!editDraft) return;

    const errors = validateRequiredFields(editDraft);
    if (errors.name || errors.address) {
      setDraftErrors(errors);
      return;
    }

    const name = editDraft.name.trim() || "Processor สักคน";
    const cleanedAddress = editDraft.address.map(line => line.trim()).filter(line => line !== "");

    setProcessors(processors.map(p => p.id === id ? { ...p, ...editDraft, name, address: cleanedAddress } : p)); setExpandedId(null);
    setEditDraft(null);
    setDraftErrors({});
  };

  const handleDeleteProcessor = (id: number) => {
    setProcessors(processors.filter(p => p.id !== id));
    if (expandedId === id) { setExpandedId(null); setEditDraft(null); }
    setDeleteTargetId(null);
  };

  useEffect(() => {
    props.setIsEditingProcessor?.(!!draft || !!editDraft);
  }, [draft, editDraft, props.setIsEditingProcessor]);

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

      {/* empty processor ปุ่มใหญ่กลางจอ */}
      {processors.length === 0 && !draft && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
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

      {/* draft card */}
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
              <Trash2 size={20} />
            </button>
            <button
              type="button"
              onClick={handleCloseDraft}
              className="text-gray-400 hover:text-[#1a3a8f] transition"
            >
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-[30px] pb-5 space-y-4">
            <InputField
              label="ชื่อผู้ประมวลผลข้อมูลส่วนบุคคล"
              placeholder="ชื่อผู้ประมวลผล"
              value={draft.name}
              onChange={(v) => {
                setDraft({ ...draft, name: v });
                if (draftErrors.name) setDraftErrors({ ...draftErrors, name: false });
              }}
              error={draftErrors.name}
            />
            <div>
              <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
                ที่อยู่ผู้ประมวลผลข้อมูลส่วนบุคคล <span className="text-red-500">*</span>
              </label>
              <textarea
                value={draft.address.join("\n")}
                onChange={(e) => {
                  setDraft({ ...draft, address: e.target.value.split("\n") });
                  if (draftErrors.address) setDraftErrors({ ...draftErrors, address: false });
                }}
                placeholder="กรอกที่อยู่แต่ละบรรทัด"
                rows={4}
                className={`h-[60px] w-full border rounded-lg px-3 py-2 text-sm text-gray-500 outline-none focus:ring-2 focus:ring-blue-200 resize-none ${draftErrors.address ? "border-red-500" : "border-BLUE"
                  }`}
              />
              {draftErrors.address && <p className="text-red-500 text-xs mt-1">กรุณากรอกที่อยู่</p>}
            </div>
            <hr className="border-gray-200" />
            <SecuritySection d={draft} setD={setDraft} />
          </div>
        </div>
      )}

      {/* processor list */}
      {processors.map((p) => {
        const isOpen = expandedId === p.id;
        return (
          <div key={p.id} className="border border-BLUE rounded-xl overflow-hidden shadow-md">
            <div
              className="flex items-center justify-between px-5 py-3 bg-[#ECF0F9] cursor-pointer hover:bg-[#f8f9ff]"
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
                    className="text-red-400 hover:bg-red-100 m-1 rounded-[5px] text-red-500 transition"
                    title="ลบ processor นี้"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
                  <InputField
                    label="ชื่อผู้ประมวลผลข้อมูลส่วนบุคคล"
                    placeholder="ชื่อผู้ประมวลผล"
                    value={editDraft.name}
                    onChange={(v) => {
                      setEditDraft({ ...editDraft, name: v });
                      if (draftErrors.name) setDraftErrors({ ...draftErrors, name: !v.trim() }); // check real-time
                    }}
                    error={draftErrors.name}
                  />

                  <div>
                    <label className="text-sm font-medium text-[#1a3a8f] block mb-1">
                      ที่อยู่ผู้ประมวลผลข้อมูลส่วนบุคคล <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editDraft.address.join("\n")}
                      onChange={(e) => {
                        const addressArr = e.target.value.split("\n");
                        setEditDraft({ ...editDraft, address: addressArr });
                        setDraftErrors({ ...draftErrors, address: addressArr.length === 0 });
                      }}
                      placeholder="กรอกที่อยู่แต่ละบรรทัด"
                      rows={4}
                      className={`h-[60px] w-full border rounded-lg px-3 py-2 text-sm text-gray-500 outline-none focus:ring-2 focus:ring-blue-200 resize-none ${draftErrors.address ? "border-red-500" : "border-BLUE"}`}
                    />
                    {draftErrors.address && <p className="text-red-500 text-xs mt-1">กรุณากรอกที่อยู่</p>}
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
                onClick={handleDiscardDraft}
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