import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => (
  <header className="site-header">
    <a className="brand" href="#/">
      Samuel F. Guimarães
    </a>
    <div className="controls">
      <LanguageSwitcher />
    </div>
  </header>
);

export default Header;
