"use client";
import { useState, useRef, useEffect } from "react";
import { Search, Filter, Plus, Calendar, ChevronDown, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function DpoPage() {
    
    return (
        <div className="flex h-screen bg-gray-100 font-prompt text-[12px] overflow-hidden">
            {/* Sidebar placeholder */}
            <aside className="w-16 bg-gray-700 flex-shrink-0" />
            < Sidebar userName="txt" userEmail="testt@mail.com"/>

        </div>
    );
}
