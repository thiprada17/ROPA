"use client";
import { useEffect, useState, useRef } from "react";
import { CheckCircle, MessageSquareText } from "lucide-react";

interface Comment {
  username: string;
  text: string;
}

interface TabApproveProps {
  itemId: string; // id ของกิจกรรม
  currentStatus: string;
  currentUser?: { username?: string; email?: string };
  existingComments?: Comment[];
  isEditingFromParent?: boolean;
  onEditingChange?: (v: boolean) => void;
  onUpdateStatus: (status: string, comments?: Comment[]) => void;
  onAddComment?: (itemId: string, comment: Comment) => void;
}

export default function TabApprove({ 
  itemId, 
  currentStatus, 
  currentUser,
  existingComments = [],
  isEditingFromParent = false,
  onEditingChange,
  onAddComment,
  onUpdateStatus }: TabApproveProps) {
  const [isEditing, setIsEditing] = useState(isEditingFromParent);
  const [status, setStatus] = useState(currentStatus); // Pending, Approved, Revision
  const [comments, setComments] = useState<Comment[]>(existingComments);
  const [showInput, setShowInput] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userLabel = currentUser?.username || currentUser?.email || "ผู้ใช้";
  
  useEffect(() => {
    setIsEditing(isEditingFromParent);
  }, [isEditingFromParent]);

  const setEditing = (v: boolean) => {
    setIsEditing(v);
    onEditingChange?.(v);
  };

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    const comment = { username: userLabel, text: newComment.trim() };
    setComments((prev) => [...prev, comment]);
    onAddComment?.(itemId, comment);
    setNewComment("");
    setShowInput(false);
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
    setEditing(false);
  };

  return (
    <div className="space-y-2">

      {/* สถานะ */}
      <div className="grid grid-cols-[180px_1fr] gap-2 py-1">
        <span className="text-[12px] text-[#A6A6A6] font-medium">สถานะ</span>
        {isEditing ? (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="custom-select border-[1.5px] border-[#03369D] rounded-md px-2 py-1 text-[12px] text-gray-400 outline-none min-w-[80px]"
          >
            <option value="Pending">Pending</option>
            <option value="Complete">Complete</option>
            <option value="Revision">Revision</option>
          </select>
        ) : (
          <span className="text-[11px] text-[#1C1B1F] py-0.5">{status}</span>
        )}
      </div>

      {/* Comments — แสดงเฉพาะตอน Revision */}
      {status === "Revision" && (
        <div className="flex flex-col gap-1 min-h-[40px]">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#A6A6A6]">
              <MessageSquareText size={13} className="text-[#656565]"/>
              Comments
            </span>
            <button
              onClick={() => {
                setShowInput(true);
                setTimeout(() => inputRef.current?.focus(), 30);
              }}
              className="w-6 h-6 flex items-center justify-center text-[20px] leading-none text-gray-500 rounded hover:bg-gray-200 transition-colors"
            >
              +
            </button>
          </div>

          {comments.map((c, i) => (
            <div key={i} className="flex items-start gap-2 bg-[#EEF2FF] rounded-lg px-3 py-1.5">
              <span className="text-[11px] font-semibold text-[#03369D] shrink-0">{c.username}</span>
              <span className="text-[11px] text-gray-600 whitespace-pre-wrap break-all">{c.text}</span>
            </div>
          ))}

          {showInput && (
            <div className="flex items-start gap-2 bg-[#EEF2FF] rounded-lg px-3 py-1.5 mt-1">
              <span className="text-[11px] font-semibold text-[#03369D] shrink-0 mt-0.5">{userLabel}</span>
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                onBlur={() => { if (!newComment.trim()) setShowInput(false); }}
                placeholder="คอมเมนต์"
                rows={1}
                className="flex-1 bg-transparent border-none outline-none text-[11px] text-[#767A8C] placeholder-gray-400 resize-none overflow-hidden"
              />
            </div>
          )}
        </div>
      )}

      {/* Update button */}
      {isEditing && (
        <button
          onClick={handleUpdate}
          className="bg-[#03369D] text-white px-4 py-2 rounded text-[12px] w-full"
        >
          Update
        </button>
      )}

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