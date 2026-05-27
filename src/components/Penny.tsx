"use client";

export type PennyAnimation = "idle" | "thinking" | "talking";

interface PennyCharacterProps {
  animation: PennyAnimation;
}

export function PennyCharacter({ animation }: PennyCharacterProps) {
  return (
    <div
      className={`penny-character penny-${animation}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 120 160"
        width="120"
        height="160"
        className="drop-shadow-lg"
      >
        {/* Hair */}
        <ellipse cx="60" cy="32" rx="34" ry="28" fill="#5c3d2e" />
        <path
          d="M26 38 Q60 8 94 38 Q88 55 60 52 Q32 55 26 38"
          fill="#6b4a38"
        />

        {/* Face */}
        <ellipse cx="60" cy="52" rx="28" ry="30" fill="#f5d0b5" />

        {/* Glasses */}
        <rect x="36" y="46" width="18" height="12" rx="3" fill="none" stroke="#334155" strokeWidth="2" />
        <rect x="66" y="46" width="18" height="12" rx="3" fill="none" stroke="#334155" strokeWidth="2" />
        <line x1="54" y1="52" x2="66" y2="52" stroke="#334155" strokeWidth="2" />

        {/* Eyes */}
        <g className="penny-eyes">
          <circle cx="45" cy="52" r="3" fill="#1e293b" />
          <circle cx="75" cy="52" r="3" fill="#1e293b" />
        </g>

        {/* Mouth */}
        <path
          className="penny-mouth"
          d="M50 66 Q60 72 70 66"
          fill="none"
          stroke="#be123c"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Blazer */}
        <path
          d="M30 78 Q60 70 90 78 L95 130 Q60 138 25 130 Z"
          fill="#1d4ed8"
        />
        <path d="M60 78 L60 130" stroke="#1e40af" strokeWidth="1" />

        {/* Shirt */}
        <path d="M48 78 L60 95 L72 78" fill="#f8fafc" />

        {/* Arms holding clipboard */}
        <ellipse cx="28" cy="100" rx="8" ry="10" fill="#f5d0b5" />
        <ellipse cx="92" cy="100" rx="8" ry="10" fill="#f5d0b5" />

        {/* Clipboard */}
        <rect x="38" y="88" width="44" height="52" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x="42" y="94" width="36" height="4" rx="1" fill="#1d4ed8" opacity="0.6" />
        <rect x="42" y="102" width="28" height="3" rx="1" fill="#94a3b8" />
        <rect x="42" y="109" width="32" height="3" rx="1" fill="#94a3b8" />
        <rect x="42" y="116" width="24" height="3" rx="1" fill="#94a3b8" />
        {/* Mini chart on clipboard */}
        <rect x="44" y="122" width="6" height="12" fill="#0f766e" rx="1" />
        <rect x="52" y="126" width="6" height="8" fill="#1d4ed8" rx="1" />
        <rect x="60" y="120" width="6" height="14" fill="#b45309" rx="1" />
        <rect x="68" y="124" width="6" height="10" fill="#7c3aed" rx="1" />

        {/* Skirt/pants */}
        <path d="M38 130 L82 130 L78 155 L42 155 Z" fill="#334155" />

        {/* Shoes */}
        <ellipse cx="48" cy="156" rx="10" ry="4" fill="#0f172a" />
        <ellipse cx="72" cy="156" rx="10" ry="4" fill="#0f172a" />
      </svg>

    </div>
  );
}
