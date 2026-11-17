"use client";

export default function PeekingPets() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-end",
        gap: "14px",
      }}
      className="pointer-events-none select-none"
    >
      {/* Perrito */}
      <div className="pointer-events-auto cursor-pointer animate-peek-dog hover:!-translate-y-3 transition-transform duration-300">
        <svg width="80" height="92" viewBox="0 0 80 92" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="16" cy="44" rx="10" ry="20" transform="rotate(14 16 44)" fill="#B45309" />
          <ellipse cx="64" cy="44" rx="10" ry="20" transform="rotate(-14 64 44)" fill="#B45309" />
          <rect x="16" y="18" width="48" height="58" rx="24" fill="#F59E0B" />
          <ellipse cx="40" cy="52" rx="15" ry="12" fill="#FEF3C7" />
          <circle cx="30" cy="38" r="3.8" fill="#1F2937" />
          <circle cx="50" cy="38" r="3.8" fill="#1F2937" />
          <circle cx="31.2" cy="36.8" r="1.2" fill="#FFFFFF" />
          <circle cx="51.2" cy="36.8" r="1.2" fill="#FFFFFF" />
          <ellipse cx="40" cy="47" rx="4.5" ry="3.2" fill="#1F2937" />
          <path d="M34 54C36.5 57 43.5 57 46 54" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" />
          {/* Patitas apoyadas */}
          <ellipse cx="24" cy="84" rx="8.5" ry="5" fill="#D97706" />
          <ellipse cx="56" cy="84" rx="8.5" ry="5" fill="#D97706" />
        </svg>
      </div>

      {/* Conejito */}
      <div className="pointer-events-auto cursor-pointer animate-peek-cat hover:!-translate-y-3 transition-transform duration-300">
        <svg width="76" height="92" viewBox="0 0 76 92" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Orejas largas */}
          <ellipse cx="27" cy="22" rx="7.5" ry="20" transform="rotate(-8 27 22)" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" />
          <ellipse cx="27" cy="23" rx="4" ry="14" transform="rotate(-8 27 23)" fill="#FBCFE8" />
          <ellipse cx="49" cy="22" rx="7.5" ry="20" transform="rotate(8 49 22)" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" />
          <ellipse cx="49" cy="23" rx="4" ry="14" transform="rotate(8 49 23)" fill="#FBCFE8" />
          {/* Cabeza */}
          <rect x="14" y="34" width="48" height="50" rx="24" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
          {/* Mejillas rosadas */}
          <ellipse cx="23" cy="60" rx="4.5" ry="3" fill="#FECDD3" opacity="0.85" />
          <ellipse cx="53" cy="60" rx="4.5" ry="3" fill="#FECDD3" opacity="0.85" />
          {/* Ojos */}
          <circle cx="29" cy="52" r="3.8" fill="#1F2937" />
          <circle cx="47" cy="52" r="3.8" fill="#1F2937" />
          <circle cx="30.2" cy="50.8" r="1.2" fill="#FFFFFF" />
          <circle cx="48.2" cy="50.8" r="1.2" fill="#FFFFFF" />
          {/* Nariz rosada, boquita y dientes */}
          <ellipse cx="38" cy="59" rx="3.5" ry="2.5" fill="#F472B6" />
          <rect x="36.2" y="64.5" width="3.6" height="3.2" rx="1" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.8" />
          <path d="M33 64C35 66 37 65 38 63.5C39 65 41 66 43 64" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          {/* Patitas apoyadas */}
          <ellipse cx="23" cy="85" rx="8" ry="4.5" fill="#E5E7EB" />
          <ellipse cx="53" cy="85" rx="8" ry="4.5" fill="#E5E7EB" />
        </svg>
      </div>
    </div>
  );
}