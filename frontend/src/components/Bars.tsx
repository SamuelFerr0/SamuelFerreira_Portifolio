import type { Share } from "../lib/githubTypes";

const Bars = ({ items }: { items: Share[] }) => (
  <ul className="bars">
    {items.map((item) => (
      <li key={item.name}>
        <span>{item.name}</span>
        <span className="bar">
          <span style={{ width: `${item.percent}%` }} />
        </span>
        <span className="pct">{item.percent.toFixed(1)}%</span>
      </li>
    ))}
  </ul>
);

export default Bars;
