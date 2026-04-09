// ProgressBar.tsx
"use client";
import React from "react";

type ProgressBarProps = {
    steps: string[];
    currentStep: number;
};

export default function ProgressBar({ steps, currentStep }: ProgressBarProps) {
    return (
        <div className="w-full relative flex justify-between items-start font-gabarito ">
            {steps.map((title, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const isLast = index === steps.length - 1;

                return (
                    <div key={index} className="flex flex-col items-center relative flex-1">
                        {/* เส้นซ้าย */}
                        {index > 0 && (
                            <div className="absolute top-3.5 right-1/2 left-0 h-[2px] -translate-y-1/2"
                                style={{ backgroundColor: isCompleted || isActive ? "#1a3a8f" : "#d1d5db" }}
                            />
                        )}
                        {/* เส้นขวา */}
                        {!isLast && (
                            <div className="absolute top-3.5 left-1/2 right-0 h-[2px] -translate-y-1/2"
                                style={{ backgroundColor: isCompleted ? "#1a3a8f" : "#d1d5db" }}
                            />
                        )}

                        {/* วงกลม */}
                        <div className={`w-7 h-7 flex items-center font-gabarito justify-center rounded-full border-2 text-sm font-bold z-10 relative
                            ${isActive || isCompleted
                                ? "bg-[#1a3a8f] text-white border-[#1a3a8f]"
                                : "bg-white text-gray-400 border-gray-300"}`}
                        >
                            {index + 1}
                        </div>

                        {/* Label */}
                        <p className={`mt-2 text-[11px] text-center leading-tight px-1 
                            ${isActive || isCompleted ? "text-[#1a3a8f] font-medium font-gabarito" : "text-gray-400 font-gabarito"}`}>
                            {title}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}