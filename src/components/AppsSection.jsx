import { useLang } from "../content-and-translations.jsx";

/* Proserpine, notre produit phare = le point rouge du logo (nœud S,
   relié au triangle des offres par LogoTrail). Autour : les organismes
   qui l'accompagnent, reliés au point par de fins rayons lumineux. */
export default function AppsSection() {
  const { t } = useLang();
  const a = t.apps.featured;
  return (
    <section className="section section--alt" id="apps">
      <div className="wrap feature">
        <div className="feature__text">
          <p className="eyebrow reveal">{t.apps.label}</p>
          <h2 className="section__title reveal">{t.apps.title}</h2>
          <p className="feature__desc reveal">{a.desc}</p>
          <a href="#contact" className="btn btn--primary feature__cta reveal">{t.apps.store} →</a>
          <p className="section__note reveal">{t.apps.note}</p>
        </div>

        <div className="feature__stage reveal">
          <div className="feature__orb" data-logo-node="S">
            <img className="feature__logo" src={a.logo} alt={`Logo ${a.name}`} />
            <h3>{a.name}</h3>
            <span className="feature__tag">{a.tag}</span>
          </div>
          <svg className="feature__links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line x1="50" y1="50" x2="13" y2="8" />
            <line x1="50" y1="50" x2="87" y2="8" />
            <line x1="50" y1="50" x2="13" y2="92" />
            <line x1="50" y1="50" x2="87" y2="92" />
          </svg>
          <p className="feature__partners-label">{t.apps.partnersLabel}</p>
          {t.apps.partners.map((p, i) => (
            <span className={`partner partner--${i + 1}`} key={i}>{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
