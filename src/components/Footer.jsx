import { useLang } from "../i18n.jsx";
import Logo from "./Logo.jsx";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <div className="footer__brand">
          <Logo height={34} />
          <span className="footer__tag">{t.footer.tagline}</span>
        </div>
        <div className="footer__links">
          <a href="#services">{t.nav.services}</a>
          <a href="#apps">{t.nav.apps}</a>
          <a href="#about">{t.nav.about}</a>
          <a href="#contact">{t.nav.contact}</a>
        </div>
        <p className="footer__copy">© {new Date().getFullYear()} Adhara. {t.footer.rights}</p>
      </div>
    </footer>
  );
}
