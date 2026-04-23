"use client";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

interface TabApproveProps {
  itemId: string; // id ของกิจกรรม
  currentStatus: string;
  onUpdateStatus: (status: string, comments?: string[]) => void;
}

export default function TabApprove({ itemId, currentStatus, onUpdateStatus }: TabApproveProps) {
  const [status, setStatus] = useState(currentStatus); // Pending, Approved, Revision
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    setComments([...comments, newComment.trim()]);
    setNewComment("");
  };

  const handleUpdate = () => {
    // ถ้า Revision ต้องมี comment อย่างน้อย 1 อัน
    if (status === "Revision" && comments.length === 0) {
      alert("กรุณาเพิ่ม comment อย่างน้อย 1 อันก่อนอัปเดตสถานะ");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onUpdateStatus(status, comments);
    setShowConfirm(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[12px] font-medium">สถานะ</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-[12px]"
      >
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Revision">Revision</option>
      </select>

      {status === "Revision" && (
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium">Comment</label>
          {comments.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px]">
              <span className="flex-1 bg-gray-100 px-2 py-1 rounded">{c}</span>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-[12px]"
            />
            <button
              onClick={handleAddComment}
              className="bg-[#03369D] text-white px-3 py-1 rounded text-[12px]"
            >
              +
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleUpdate}
        className="bg-[#03369D] text-white px-4 py-2 rounded text-[12px]"
      >
        Update
      </button>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-4 rounded shadow-lg w-[320px] flex flex-col gap-3">
            <h3 className="text-[14px] font-bold">ยืนยันสถานะ</h3>
            <p className="text-[12px]">
              คุณต้องการเปลี่ยนสถานะเป็น <b>{status}</b> ใช่หรือไม่?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1 text-[12px] border rounded"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                className="px-3 py-1 text-[12px] bg-[#03369D] text-white rounded flex items-center gap-1"
              >
                <CheckCircle size={14} /> ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}