import { FaFish } from "react-icons/fa6";

const Peixe = ({ size = 40 }: { size?: number }) => (
  <FaFish className="peixe" size={size} role="img" aria-label="Peixe" />
);

export default Peixe;
