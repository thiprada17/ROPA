"use client";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({
  message = "กำลังโหลดข้อมูล...",
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 ${
        fullScreen ? "min-h-screen" : "min-h-[240px]"
      }`}
    >
      {/* Shield icon */}
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#03369D" opacity="0.18">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
      </svg>

      {/* Progress bar */}
      <div className="w-[220px] h-[2px] bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#03369D] rounded-full animate-loading-bar" />
      </div>

      {/* Dots */}
      <div className="flex gap-[6px]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-[6px] h-[6px] rounded-full bg-[#03369D] animate-loading-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      {/* Label */}
      <span className="text-[13px] text-gray-400 tracking-wide font-prompt">
        {message}
      </span>
    </div>
  );
}