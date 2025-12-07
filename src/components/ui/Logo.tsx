"use client";

import Link from "next/link";
import clsx from "clsx";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ variant = "full", size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  return (
    <Link href="/" className={clsx("flex items-center gap-2", className)}>
      {/* Logo Icon - Blue circle with 'C' */}
      <div
        className={clsx(
          "flex items-center justify-center rounded-full bg-primary-600",
          size === "sm" && "w-6 h-6",
          size === "md" && "w-8 h-8",
          size === "lg" && "w-10 h-10"
        )}
      >
        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Blue circular background */}
          <circle cx={100} cy={100} r={95} fill="#1976D2" />

          {/* White shopping cart */}
          <g
            fill="none"
            stroke="white"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Cart basket */}
            <path d="M 50 60 L 60 60 L 70 120 L 140 120" />

            {/* Cart handle bars */}
            <path d="M 60 60 L 65 80" />
            <path d="M 140 120 L 145 100 L 150 80" />

            {/* Briefcase/Career symbol integrated into cart */}
            <rect x={75} y={75} width={50} height={35} rx={3} fill="white" />
            <rect x={75} y={75} width={50} height={8} fill="#1976D2" />
            <rect x={95} y={75} width={10} height={8} fill="white" />
            <path
              d="M 95 75 L 95 70 Q 100 65 105 70 L 105 75"
              stroke="white"
              strokeWidth={3}
              fill="none"
            />
          </g>

          {/* Cart wheels */}
          <circle cx={85} cy={145} r={8} fill="white" />
          <circle cx={125} cy={145} r={8} fill="white" />

          {/* Inner wheel details */}
          <circle cx={85} cy={145} r={3} fill="#1976D2" />
          <circle cx={125} cy={145} r={3} fill="#1976D2" />

          {/* "CK" letters stylized */}
          <text
            x={100}
            y={115}
            fontFamily="Arial, sans-serif"
            fontSize={32}
            fontWeight="bold"
            fill="#1976D2"
            textAnchor="middle"
          >
            CK
          </text>
        </svg>
      </div>

      {/* Logo Text */}
      {variant === "full" && (
        <div className="flex flex-col">
          <span
            className={clsx(
              "font-bold text-primary-600 leading-none",
              size === "sm" && "text-sm",
              size === "md" && "text-lg",
              size === "lg" && "text-xl"
            )}
          >
            CAREERKART
          </span>
          <span
            className={clsx(
              "text-grey-500 leading-none",
              size === "sm" && "text-[8px]",
              size === "md" && "text-[10px]",
              size === "lg" && "text-xs"
            )}
          >
            Your Job. Our Guidance.
          </span>
        </div>
      )}
    </Link>
  );
}
