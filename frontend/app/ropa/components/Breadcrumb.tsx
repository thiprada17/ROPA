"use client";

import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

type BreadcrumbItem = {
    label: string;
    href?: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    return (
        <div className="flex items-center text-sm text-gray-500">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <div key={index} className="flex items-center">

                        {/* 👉 link / current */}
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="hover:text-gray-700 transition"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-gray-800 font-medium">
                                {item.label}
                            </span>
                        )}

                        {!isLast && (
                            <ChevronRight size={14} className="mx-2 text-gray-400" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}