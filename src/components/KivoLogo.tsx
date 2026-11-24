export default function KivoLogo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#0F172A" />
        <path
          d="M10.5 8.5V23.5M10.5 16L18.5 8.5M14 13L20 23.5"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M22 6H26V10L22 6Z" fill="#4338CA" />
      </svg>
      <span
        className={`text-[20px] font-semibold tracking-tight ${
          dark ? "text-white" : "text-[#0F172A]"
        }`}
      >
        Kivo<span className="text-[#4338CA]">PDF</span>
      </span>
    </span>
  );
}
