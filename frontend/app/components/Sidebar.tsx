// app/components/Sidebar.tsx
"use client";

import { LayoutDashboard, ShieldPlus, ShieldAlert, Scale, BriefcaseBusiness,
  UserLock, Settings, LogOut, User, UserRoundCog, UserStar
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

const menuItems = [
  { icon: LayoutDashboard, href: "/dashboard", label: "DASHBOARD" },
  { icon: ShieldPlus, href: "/form", label: "CREATE ROPA" },
  { icon: ShieldAlert, href: "/Ropa", label: "ROPA" },
  { icon: Scale, href: "/legal", label: "LEGAL" },
  { icon: UserRoundCog, href: "/admin", label: "ADMIN" },
  { icon: UserStar, href: "/dpo", label: "DPO" },
];

// ฟังก์ชันกรองเมนูตาม role
const getMenuByRole = (role?: string) => {
  switch (role) {
    case "Admin":
      return menuItems.filter(item =>
        ["/dashboard", "/Ropa", "/admin", "/legal"].includes(item.href)
      );
    case "User":
      return menuItems.filter(item =>
        ["/dashboard", "/Ropa", "/form", "/legal"].includes(item.href)
      );
    case "DPO":
      return menuItems.filter(item =>
        ["/dashboard", "/dpo", "/legal"].includes(item.href)
      );
    case "Viewer":
      return menuItems.filter(item =>
        ["/dashboard", "/Ropa", "/legal"].includes(item.href)
      );
    default:
      return []; // ถ้าไม่กำหนด role
  }
};

const userItems = [
  // { icon: BriefcaseBusiness, href: "/information", label: "INFORMATION" },
  // { icon: UserLock, href: "/auditlog", label: "AUDIT LOG" },
  // { icon: Settings, href: "/settings", label: "SETTING" },
  { icon: LogOut, href: "/login", label: "LOG OUT", rotate: true },
];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  role?: "Admin" | "User" | "DPO" | "Viewer";
}

export default function Sidebar({
  userName = "NAME SURNAME",
  userEmail = "USER EMAIL",
  role,
}: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const FiltermenuItems = getMenuByRole(role);
  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <div className="font-gabarito">
      {/* Overlay */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setExpanded(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 bottom-0 z-40 bg-[#4B5666] flex flex-col py-3
          transition-[width] duration-300 ease-in-out overflow-hidden
          ${expanded ? "w-52" : "w-16 cursor-pointer"}
        `}
        onClick={() => { if (!expanded) setExpanded(true); }}
      >
        {/* logo อยู่นิ่ง w-10 h-10 ตรงกลาง w-16 เสมอ */}
        {/* <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white mb-4 mx-auto flex-shrink-0">
          LOGO
        </div> */}
        <div
          className={`mx-auto flex-shrink-0 transition-all duration-300
    ${expanded ? "w-14 h-14 mb-1" : "w-10 h-10 mb-0.5"} 
  `}
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            width={64}
            height={64}
            className="object-contain w-full h-full"
          />
        </div>

        {/* MENU label */}
        <div className="flex items-center mb-1 h-5">
          {/* กล่อง icon-width นิ่ง */}
          <div className="w-16 flex-shrink-0 flex items-center justify-center">
            <span className={`text-gray-400 text-[10px] font-semibold whitespace-nowrap
            transition-all duration-300 overflow-hidden
          `}>
              MENU
            </span>
          </div>

        </div>

        {/* menu items */}
        <nav className="flex flex-col flex-1">
          {FiltermenuItems.map(({ icon: Icon, href, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center mb-1 rounded-md text-white
                hover:bg-white/10 transition-colors
                ${isActive(href) ? "bg-white/10" : ""}
              `}
              onClick={(e) => {
                if (!expanded) {
                  e.preventDefault();
                } else {
                  setExpanded(false);
                }
              }}
            >
              {/* icon zone */}
              <div className="w-16 flex-shrink-0 flex items-center justify-center py-4">
                <Icon size={26} />
              </div>
              {/* label slide ออกมา */}
              <span className={`text-sm whitespace-nowrap overflow-hidden
                transition-all duration-300
                ${expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"}
              `}>
                {label}
              </span>
            </Link>
          ))}

          <div className="h-px bg-white/20 my-2 mx-3" />
        </nav>

        {/* USER label */}
        <div className="flex items-center mb-1 h-5">
          <div className="w-16 flex-shrink-0 flex items-center justify-center">
            <span className={`text-gray-400 text-[10px] font-semibold whitespace-nowrap
            transition-all duration-300 overflow-hidden
          `}>
              USER
            </span>
          </div>
        </div>

        {/* user items */}
        <nav className="flex flex-col">
          {userItems.map(({ icon: Icon, href, label, rotate }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center mb-1 rounded-md text-white
                hover:bg-white/10 transition-colors
              `}
              onClick={(e) => {
                if (!expanded) {
                  e.preventDefault();
                } else {
                  setExpanded(false);
                }
              }}
            >
              <div className="w-16 flex-shrink-0 flex items-center justify-center py-2">
                <Icon size={26} className={rotate ? "rotate-180" : ""} />
              </div>
              <span className={`text-sm whitespace-nowrap overflow-hidden
                transition-all duration-300
                ${expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"}
              `}>
                {label}
              </span>
            </Link>
          ))}

          <div className="h-px bg-white/20 my-2 mx-3" />
        </nav>

        {/* profile */}
        <div className="flex items-center mt-2">
          <div className="w-16 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          </div>
          <div className={`overflow-hidden transition-all duration-300
            ${expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"}
          `}>
            <p className="text-white text-[11px] font-medium whitespace-nowrap">{userName}</p>
            <p className="text-gray-400 text-[10px] whitespace-nowrap">{userEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}