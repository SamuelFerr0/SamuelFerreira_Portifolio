const Peixe = ({ size = 40 }: { size?: number }) => (
  <svg
    className="peixe"
    viewBox="0 0 64 40"
    width={size}
    height={size * 0.625}
    role="img"
    aria-label="Peixe"
  >
    <path
      d="M4 20 C14 6 36 4 48 18 L60 8 L58 20 L60 32 L48 22 C36 36 14 34 4 20 Z"
      fill="currentColor"
    />
    <circle cx="16" cy="17" r="2.5" fill="var(--bg)" />
    <path d="M28 12 C31 17 31 23 28 28" stroke="var(--bg)" strokeWidth="2" fill="none" />
  </svg>
);

export default Peixe;
