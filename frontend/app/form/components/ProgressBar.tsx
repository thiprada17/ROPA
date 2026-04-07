// ProgressBar.tsx
"use client";
import React from "react";

type ProgressBarProps = {
    steps: string[];
    currentStep: number;
};

export default function ProgressBar({ steps, currentStep }: ProgressBarProps) {
    return (
        <div className="w-full max-w-4xl relative flex justify-between items-center mb-[50px]">
            {/* เส้นยากๆ ทำไงเน้อ */}
            <div className="absolute top-3.5 left-0 right-0 h-[2px] bg-gray-300 z-0"></div>
            <div
                className="absolute top-3.5 left-0 h-[2px] bg-BLUE z-0 transition-all duration-300"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />

            {/* วงกลมกับ label */}
            {steps.map((title, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                return (
                    <div key={index} className="flex flex-col items-center relative z-10 font-gabarito">
                        <div
                            className={`w-7 h-7 flex items-center justify-center rounded-full border-2 text-sm font-bold 
                ${isActive || isCompleted ? "bg-BLUE text-white border-BLUE" : "bg-white text-gray-300 border-gray-300"}`}
                        >
                            {index + 1}
                        </div>
                        <p
                            className={`mt-2 text-[11px] text-center leading-tight w-24 font-gabarito
                ${isActive || isCompleted ? "text-BLUE font-medium" : "text-gray-400"}`}
                        >
                            {title}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}