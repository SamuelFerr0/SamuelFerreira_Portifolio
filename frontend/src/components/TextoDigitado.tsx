import { TypeAnimation } from "react-type-animation";

type Props = { texto: string; className?: string };

const TextoDigitado = ({ texto, className }: Props) => {
  const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (menosMovimento) return <p className={className}>{texto}</p>;

  return (
    <p className={className}>
      <span className="so-leitor">{texto}</span>
      <span className="digitado" aria-hidden="true">
        <span className="digitado-reserva">{texto}</span>
        <TypeAnimation key={texto} sequence={[500, texto]} speed={60} repeat={0} wrapper="span" />
      </span>
    </p>
  );
};

export default TextoDigitado;
