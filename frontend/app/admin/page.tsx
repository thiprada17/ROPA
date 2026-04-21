"use client";
import { useState, useRef, useEffect } from "react";
import { Search, Filter, Plus, Calendar, ChevronDown, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { userMock, UserData, UserRole, UserStatus, LockStatus } from "./data/userMock";
import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";
import AdminFilterModal from "./components/AdminFilterModal";
import Sidebar from "../components/Sidebar";

export default function AdminPage() {
    const [users, setUsers] = useState<UserData[]>(userMock);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [openDate, setOpenDate] = useState(false);
    const [openFilter, setOpenFilter] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
    const [modal, setModal] = useState<{ mode: "create" | "edit"; user?: UserData } | null>(null);
    const dateRef = useRef<HTMLDivElement>(null);

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dateRef.current && !dateRef.current.contains(e.target as Node)) setOpenDate(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => { setPage(1); }, [search, selectedRoles, selectedDepts]);

    const filtered = users.filter(u => {
        const kw = search.toLowerCase();
        const matchSearch = u.fullName.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw);
        const matchRole = selectedRoles.length === 0 || selectedRoles.includes(u.role);
        const matchDept = selectedDepts.length === 0 || selectedDepts.includes(u.department);
        const matchDate = (!startDate && !endDate) || (u.createdAt >= (startDate || "0000") && u.createdAt <= (endDate || "9999"));
        return matchSearch && matchRole && matchDept && matchDate;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const filterCount = selectedRoles.length + selectedDepts.length;

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

    const handleSave = (data: Partial<UserData>) => {
        if (modal?.mode === "create") {
            const newUser: UserData = { id: Date.now().toString(), fullName: "", email: "", password: "", phone: "", position: "", department: "", team: "", role: "User", accountStatus: "Active", lockStatus: "Unlocked", createdAt: new Date().toISOString().split("T")[0], ...data } as UserData;
            setUsers(prev => [newUser, ...prev]);
        } else if (modal?.user) {
            setUsers(prev => prev.map(u => u.id === modal.user!.id ? { ...u, ...data } : u));
        }
    };

    const handleDelete = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

    return (
        <div className="flex h-screen bg-gray-100 font-prompt text-[12px] overflow-hidden">
            {/* Sidebar placeholder */}
            <aside className="w-16 bg-gray-700 flex-shrink-0" />
            < Sidebar userName="txt" userEmail="testt@mail.com"/>

            {/* Main */}
            <main className="flex-1 overflow-y-auto px-4 md:px-[40px] xl:px-[80px] py-6">
                <div className="max-w-[1440px] mx-auto">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-3">
                        <span><ShieldAlert size={18}/></span>
                        <span><ChevronRight size={15}/> </span>
                        <span className="text-gray-700 font-gabarito text-[12px]">ADMIN</span>
                    </div>

                    <div className="border-b border-gray-200 mb-5" />

                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 mb-6">
                        {/* Date picker */}
                        <div className="flex flex-wrap gap-3 items-center justify-between">

                            <div className="relative w-full sm:w-[274px]" ref={dateRef}>
                                <button
                                    onClick={() => setOpenDate(!openDate)}
                                    className="flex items-center justify-between gap-2 bg-white border rounded-lg px-4 h-[40px] w-full shadow-sm hover:border-gray-400 transition text-sm text-gray-700"
                                >
                                    <span className="flex items-center gap-2">
                                        <Calendar size={15} className="shrink-0" />
                                        <span className="truncate text-[12px]">
                                            {startDate && endDate ? `${formatDate(startDate)} — ${formatDate(endDate)}` : <span className="text-gray-400">เลือกช่วงวันที่</span>}
                                        </span>
                                    </span>
                                    <ChevronDown size={14} className="text-gray-400" />
                                </button>

                                {openDate && (
                                    <div className="absolute mt-2 w-[264px] bg-white border rounded-xl shadow-lg p-4 z-20">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[13px] font-semibold text-gray-800">เลือกช่วงวันที่</span>
                                            <button onClick={() => { setStartDate(""); setEndDate(""); }} className="text-[11px] text-blue-600 hover:underline">Clear all</button>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <label className="text-[11px] text-gray-500 block mb-1">วันเริ่มต้น</label>
                                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded-md px-2 py-1.5 text-[12px] w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] text-gray-500 block mb-1">วันสิ้นสุด</label>
                                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded-md px-2 py-1.5 text-[12px] w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button onClick={() => setOpenDate(false)} className="text-[12px] bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700">Apply</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                                <button
                                    onClick={() => setModal({ mode: "create" })}
                                    className="flex items-center gap-1.5 h-[40px] px-4 bg-[#03369D] text-white rounded-lg text-[12px] hover:bg-[#02287d] transition whitespace-nowrap">
                                    <Plus size={15} /> ผู้ใช้งาน
                                </button>

                                <div className="flex items-center gap-2 border rounded-lg px-3 h-[40px] bg-white flex-1 min-w-[160px]">
                                    <Search size={15} className="text-gray-400 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาชื่อ หรืออีเมล"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full outline-none text-[12px] text-gray-700" />
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setOpenFilter(!openFilter)}
                                        className="flex items-center gap-2 w-[88px] h-[40px] border bg-white rounded-lg relative text-[12px] justify-center">
                                        <Filter size={15} />
                                        <span>Filters</span>
                                        {filterCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                                {filterCount}
                                            </span>
                                        )}
                                    </button>
                                    <AdminFilterModal
                                        open={openFilter}
                                        onClose={() => setOpenFilter(false)}
                                        selectedRoles={selectedRoles}
                                        setSelectedRoles={setSelectedRoles}
                                        selectedDepts={selectedDepts}
                                        setSelectedDepts={setSelectedDepts}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <UserTable data={paginated} onRowClick={(u) => setModal({ mode: "edit", user: u })} />

                    {/* Pagination */}
                    <div className="mt-4 flex justify-between items-center text-[12px]">
                        <span className="text-gray-500">{filtered.length} items</span>
                        <div className="flex items-center gap-2">
                            <ChevronLeft
                                size={18}
                                className={`cursor-pointer ${page === 1 ? "opacity-30 pointer-events-none" : "hover:text-blue-600"}`}
                                onClick={() => setPage(p => p - 1)}
                            />
                            <span>Page</span>
                            <input
                                type="number"
                                value={page}
                                min={1}
                                max={totalPages}
                                onChange={e => { const v = Number(e.target.value); if (v >= 1 && v <= totalPages) setPage(v); }}
                                className="w-12 border rounded px-2 py-1 text-center"
                            />
                            <span>of {totalPages}</span>
                            <ChevronRight
                                size={18}
                                className={`cursor-pointer ${page === totalPages ? "opacity-30 pointer-events-none" : "hover:text-blue-600"}`}
                                onClick={() => setPage(p => p + 1)}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {modal && (
                <UserFormModal
                    mode={modal.mode}
                    user={modal.user}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
