import { useLang } from "../content-and-translations.jsx";

/* Les fondateurs = les deux « jambes » du logo, qui partent de
   l'embranchement (nœud J, l'orbe d'À propos) :
   R = la jambe de droite (plus haute), D = la jambe du bas. */
const NODES = ["R", "D"];

export default function FoundersSection() {
  const { t } = useLang();
  const f = t.founders;
  return (
    <section className="section founders" id="founders">
      <div className="wrap founders__inner">
        <div className="founders__head">
          <p className="eyebrow reveal">{f.label}</p>
          <h2 className="section__title reveal">{f.title}</h2>
          <p className="founders__intro reveal">{f.intro}</p>
        </div>
        <div className="founders__people">
          {f.people.map((p, i) => (
            <article className={`founder founder--${NODES[i]} reveal`} style={{ "--d": `${i * 0.12}s` }} key={i}>
              <div className="founder__orb" data-logo-node={NODES[i]}>
                {p.photo ? (
                  <img src={p.photo} alt={p.name} />
                ) : (
                  <span aria-hidden="true">{p.initials}</span>
                )}
              </div>
              <h3>{p.name}</h3>
              <span className="founder__role">{p.role}</span>
              {p.title && <span className="founder__title">{p.title}</span>}
              <p>{p.story}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
