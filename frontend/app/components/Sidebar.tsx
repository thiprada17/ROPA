// app/components/Sidebar.tsx
"use client";

import { LayoutDashboard, Shield, Scale, Settings, LogOut, User, Briefcase, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { icon: LayoutDashboard, href: "/dashboard" },
  { icon: Shield, href: "/shield" },
  { icon: Scale, href: "/scale" },
  { icon: Briefcase, href: "/form" },
  { icon: Users, href: "/users" },
  { icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-16 bg-[#2d3748] flex flex-col items-center py-4 fixed left-0 top-0 bottom-0 z-20">
      {/* Logo */}
      <div className="w-10 h-10 bg-gray-500 rounded-md flex items-center justify-center text-white text-[10px] font-bold mb-4">
        LOGO
      </div>

      <span className="text-gray-500 text-[8px] uppercase tracking-widest mb-3">MENU</span>

      {/* Nav Icons */}
      <nav className="flex flex-col gap-5 flex-1">
        {menuItems.map(({ icon: Icon, href }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`transition-colors ${isActive ? "text-white" : "text-gray-400 hover:text-white"}`}
            >
              <Icon size={20} />
            </Link>
          );
        })}
        <button className="text-gray-400 hover:text-white transition-colors mt-auto">
          <LogOut size={20} />
        </button>
      </nav>

      {/* User */}
      <div className="flex flex-col items-center gap-1 mt-4">
        <span className="text-gray-500 text-[8px] uppercase tracking-widest">USER</span>
        <button className="text-gray-400 hover:text-white transition-colors mt-1">
          <User size={20} />
        </button>
      </div>
    </div>
  );
}