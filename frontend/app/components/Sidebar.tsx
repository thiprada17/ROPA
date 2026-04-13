// app/components/Sidebar.tsx
"use client";

import { LayoutDashboard, ShieldPlus, ShieldAlert, Scale, BriefcaseBusiness, UserLock, Settings, LogOut, User} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, href: "/dashboard", label: "DASHBOARD" },
  { icon: ShieldPlus, href: "/form", label: "CREATE ROPA" },
  { icon: ShieldAlert, href: "/ropa", label: "ROPA" },
  { icon: Scale, href: "/legal", label: "LEGAL" },
];

const userItems = [
  { icon: BriefcaseBusiness, href: "/information", label: "INFORMATION" },
  { icon: UserLock, href: "/auditlog", label: "AUDIT LOG" },
  { icon: Settings, href: "/settings", label: "SETTING" },
  { icon: LogOut, href: "/logout", label: "LOG OUT", rotate: true },
];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({
  userName = "NAME SURNAME",
  userEmail = "USER EMAIL",
}: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  const isActive = (href: string) => pathname?.startsWith(href);

  // กด icon / logo / profile ตอน collapsed จะเปิด expand นะคับ อันนี้มั้ยไม่รุ
  const handleOpen = () => {
    if (!expanded) setExpanded(true);
  };

  return (
    <div className="font-gabarito">
      {/* Overlay */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-40 bg-[#4B5666] flex flex-col py-3
          transition-all duration-300 ease-in-out
          ${expanded ? "w-52" : "w-16"}
        `}
      >
        {/* Logo */}
        <button
          onClick={handleOpen}
          className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white mb-4 mx-auto"
        >
          LOGO
        </button>

        {/* ส่วน MENU */}
        <span className="text-gray-400 text-[10px] font-semibold px-5 mb-1">
          MENU
        </span>

        {/* Menu items */}
        <nav className="flex flex-col flex-1">
          {menuItems.map(({ icon: Icon, href, label }) => (
            <Link
              key={href}
              href={expanded ? href : "#"} 
              className={`flex items-center px-3 py-2 rounded-md text-white hover:bg-white/5 transition-colors ${expanded ? "justify-start gap-3 mb-3" : "justify-center gap-3 mb-3"
                } ${isActive(href) ? "bg-white/10" : ""}`}
              onClick={() => expanded && setExpanded(false)}
            >
              <Icon size={20} onClick={handleOpen} />
              {expanded && <span>{label}</span>}
            </Link>
          ))}

          {/* ไอเส้น */}
          <div className="h-px bg-[#E7E7E7] my-2 mx-3" />
        </nav>

        {/* ส่วน USER */}
        <span className="text-gray-400 text-[10px] font-semibold px-5 mb-1">
          USER
        </span>

        {/* User items */}
        <nav className="flex flex-col px-0">
          {userItems.map(({ icon: Icon, href, label, rotate }) => (
            <Link
              key={href}
              href={expanded ? href : "#"} // navigation only when expanded
              className={`flex items-center px-3 py-2 rounded-md text-white hover:bg-white/5 transition-colors ${expanded ? "justify-start gap-3 mb-3" : "justify-center gap-3 mb-3"
                }`}
              onClick={() => expanded && setExpanded(false)}
            >
              <Icon size={20} className={rotate ? "rotate-180" : ""} onClick={handleOpen} />
              {expanded && <span>{label}</span>}
            </Link>
          ))}

          {/* เส้นอีกแล้ว */}
          <div className="h-px bg-[#E7E7E7] my-2 mx-3" />
        </nav>

        {/* Profile */}
        <div
          className={`flex items-center mt-2 ${expanded ? "justify-start gap-3 px-3" : "justify-center"
            }`}
        >
          <div
            className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0"
            onClick={handleOpen}
          >
            <User size={20} className="text-white" />
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <p className="text-white text-[11px] font-medium truncate">
                {userName}
              </p>
              <p className="text-gray-400 text-[10px] truncate">
                {userEmail}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}