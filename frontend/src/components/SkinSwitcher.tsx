type Props<T extends string> = {
  label: string;
  skins: readonly T[];
  names: Record<T, string>;
  active: T;
  onChange: (skin: T) => void;
};

const SkinSwitcher = <T extends string>({ label, skins, names, active, onChange }: Props<T>) => (
  <div className="skins" role="group" aria-label={label}>
    <span className="skins-label">{label}</span>
    {skins.map((skin) => (
      <button
        key={skin}
        type="button"
        className="skins-btn"
        aria-pressed={skin === active}
        onClick={() => onChange(skin)}
      >
        {names[skin]}
      </button>
    ))}
  </div>
);

export default SkinSwitcher;
