"use client";

export default function FormPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-[#F2F4F7]">
            <p className="text-2xl font-bold mb-8 font-gabarito">Process bar</p>

            <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
                <p className="text-BLUE font-gabarito text-xl text-center font-bold">
                    Activity Information
                </p>
                <div className="mt-[32px]">
                    <label className="text-BLUE font-prompt block text-sm font-bold mt-4 mb-2">
                        ข้อมูลเกี่ยวกับผู้ควบคุมข้อมูลส่วนบุคคล
                    </label>
                    <input
                        className="shadow appearance-none border rounded-lg w-full py-2 px-5 text-BLUE text-sm focus:outline-none focus:shadow-outline"
                        id="activity-name"
                        type="text"
                        placeholder="บริษัท A"
                    />
                </div>

                <div className="mt-[20px]">
                    <label className="text-BLUE font-prompt block text-sm font-bold mt-4 mb-2">
                        กิจกรรมประมวลผล
                    </label>
                    <input
                        className="shadow appearance-none border rounded-lg w-full py-2 px-5 text-BLUE text-sm focus:outline-none focus:shadow-outline"
                        id="activity-name"
                        type="text"
                        placeholder="ชื่อกิจกรรมประมวลผล"
                    />
                </div>

                <div className="mt-[20px]">
                    <label className="text-BLUE font-prompt block text-sm font-bold mt-4 mb-2">

                        วัตถุประสงค์ของการประมวลผล
                    </label>
                    <input
                        className="shadow appearance-none border rounded-lg w-full py-2 px-5 text-BLUE text-sm focus:outline-none focus:shadow-outline"
                        id="activity-name"
                        type="text"
                        placeholder="วัตถุประสงค์ของการประมวลผล"
                    />
                </div>
            </div>
        </div>
    );
}