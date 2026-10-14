type Props = { numero: number };

const LISTRAS = [13, 17, 21, 25, 29, 33];

const Camisa = ({ numero }: Props) => (
  <svg className="camisa" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <defs>
      <clipPath id="camisa-corte">
        <path d="M16 4 L4 10 L8 20 L13 18 L13 44 L35 44 L35 18 L40 20 L44 10 L32 4 C30 8 18 8 16 4 Z" />
      </clipPath>
    </defs>
    <path
      className="camisa-corpo"
      d="M16 4 L4 10 L8 20 L13 18 L13 44 L35 44 L35 18 L40 20 L44 10 L32 4 C30 8 18 8 16 4 Z"
    />
    <g clipPath="url(#camisa-corte)">
      {LISTRAS.map((x) => (
        <rect key={x} className="camisa-listra" x={x} y="0" width="2" height="48" />
      ))}
    </g>
    <path
      className="camisa-borda"
      d="M16 4 L4 10 L8 20 L13 18 L13 44 L35 44 L35 18 L40 20 L44 10 L32 4 C30 8 18 8 16 4 Z"
    />
    <text className="camisa-numero" x="24" y="34" textAnchor="middle">
      {numero}
    </text>
  </svg>
);

export default Camisa;
