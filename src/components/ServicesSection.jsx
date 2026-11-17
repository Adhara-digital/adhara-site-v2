import { useLang } from "../content-and-translations.jsx";

/* Les 3 offres forment le triangle du haut du logo (première étape
   du tracé, voir LogoTrail.jsx). Chaque rond lumineux porte un nœud
   data-logo-node (A = sommet, B = gauche, C = bas du triangle). */
const NODES = ["A", "B", "C"];

export default function ServicesSection() {
  const { t } = useLang();
  return (
    <section className="section" id="services">
      <div className="wrap">
        <div className="sec-head">
          <p className="eyebrow reveal">{t.services.label}</p>
          <h2 className="section__title reveal">{t.services.title}</h2>
        </div>
        <ul className="tri-legend">
          {t.services.items.map((it, i) => (
            <li className="reveal" style={{ "--d": `${i * 0.08}s` }} key={i}>
              <h3>{it.name}</h3>
              <p>{it.desc}</p>
            </li>
          ))}
        </ul>
        <div className="tri">
          {t.services.items.map((it, i) => (
            <article className={`trinode trinode--${NODES[i]} reveal`} style={{ "--d": `${i * 0.12}s` }} key={i}>
              <div className="trinode__orb" data-logo-node={NODES[i]}>
                <span className="trinode__icon" aria-hidden="true">{it.icon}</span>
                <h3>{it.name}</h3>
              </div>
              <div className="trinode__info">
                <p>{it.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
