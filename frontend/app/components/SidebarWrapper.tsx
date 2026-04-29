"use client";

import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

export default function SidebarWrapper() {
    const pathname = usePathname();
    const showSidebar = pathname !== "/login";

    if (!showSidebar) return null;
    return (
        <div className="w-20 flex-shrink-0 bg-gray-100">
            <Sidebar />
        </div>
    );
}