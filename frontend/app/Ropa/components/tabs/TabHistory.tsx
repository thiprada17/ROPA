"use client";
import { display } from "../DetailCard";
import { RopaItem } from "../../types/ropa";
import { Pencil, Plus , Calendar, Clock} from "lucide-react";

export default function TabHistory({
  item,
  RenderValue,
  BulletRow,
  InfoRowPlain,
  InfoRow,
}: {
  item: RopaItem;
  RenderValue: any;
  BulletRow: any;
  InfoRowPlain: any;
  InfoRow: any;
}) {
  const history = item.history;
  if (!history || history.length === 0) {
    return <p className="text-[11px] italic text-[#A6A6A6]">ไม่มีประวัติ</p>;
  }

  const formatDate = (raw: string) => {
    if (!raw || raw === "-") return "-";
    const d = new Date(raw);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatTime = (raw: string) => {
    if (!raw || raw === "-") return "-";
    const d = new Date(raw);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  // แยก Today / Yesterday / Earlier ตาม date จริง
  const getGroup = (raw: string) => {
    if (!raw || raw === "-") return "Earlier";
    const d = new Date(raw);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return "Earlier";
  };

  const grouped: Record<string, any[]> = {};
  history.forEach((h) => {
    const group = getGroup(h.date);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(h);
  });

  const groupOrder = ["Today", "Yesterday", "Earlier"];

  const renderCard = (h: any, i: number) => {
    const isEdit = h.action === "edit";
    return (
      <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2 bg-white">
        {/* edit/create */}
        <div className="flex items-center gap-2 text-[11px] text-[#1C1B1F]">
          {isEdit ? <Pencil size={12} /> : <Plus size={12} />}
          <span>{isEdit ? "Edit by:" : "Create by:"} {h.by}</span>
        </div>
        {/* date */}
        <div className="flex items-center gap-2 text-[11px] text-[#1C1B1F]">
          <Calendar size={12} />
          <span>Dated: {formatDate(h.date)}</span>
        </div>
        {/* time */}
        <div className="flex items-center gap-2 text-[11px] text-[#1C1B1F]">
          <Clock size={12} />
          <span>Time: {formatTime(h.time)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {groupOrder.map((group) =>
        grouped[group]?.length ? (
          <div key={group} className="space-y-2">
            {/* Today / Yesterday / Earlier */}
            <p className="text-[11px] text-[#A6A6A6]">{group}</p>
            {grouped[group].map(renderCard)}
          </div>
        ) : null
      )}
    </div>
  );
}