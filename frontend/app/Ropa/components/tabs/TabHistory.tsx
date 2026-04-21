// app/Ropa/components/tabs/TabHistory.tsx
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
    return (
      <p className="text-[11px] italic text-[#A6A6A6]">
        ไม่มีประวัติ
      </p>
    );
  }

  // แยก Today / Yesterday (mock logic)
  const today = history.slice(0, 1);
  const yesterday = history.slice(1);

  const renderCard = (h: any, i: number) => {
    const isEdit = h.action === "edit";

    return (
      <div
        key={i}
        className="border border-gray-200 rounded-xl p-3 space-y-2 bg-white"
      >
        {/* edit/create */}
        <div className="flex items-center gap-2 text-[11px] text-[#1C1B1F]">
          {isEdit ? <Pencil size={12} /> : <Plus size={12} />}
          <span>
            {isEdit ? "Edit by:" : "Create by:"} {h.by}
          </span>
        </div>

        {/* date */}
        <div className="flex items-center gap-2 text-[11px] text-[#1C1B1F]">
          <Calendar size={12} />
          <span>Dated: {h.date}</span>
        </div>

        {/* time */}
        <div className="flex items-center gap-2 text-[11px] text-[#1C1B1F]">
          <Clock size={12} />
          <span>Time: {h.time}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">

      {/* Today */}
      {today.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-[#A6A6A6]">Today</p>
          {today.map(renderCard)}
        </div>
      )}

      {/* Yesterday */}
      {yesterday.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-[#A6A6A6]">Yesterday</p>
          {yesterday.map(renderCard)}
        </div>
      )}

    </div>
  );
}