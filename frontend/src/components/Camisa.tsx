import { FaShirt } from "react-icons/fa6";

type Props = { numero: number };

const Camisa = ({ numero }: Props) => (
  <span className="camisa">
    <FaShirt className="camisa-corpo" aria-hidden="true" />
    <span className="camisa-numero" aria-hidden="true">
      {numero}
    </span>
  </span>
);

export default Camisa;
