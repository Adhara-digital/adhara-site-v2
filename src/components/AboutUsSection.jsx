import { useLang } from "../content-and-translations.jsx";
import AboutNeuralOrb from "./AboutNeuralOrb.jsx";

export default function AboutUsSection() {
  const { t } = useLang();
  return (
    <section className="section about" id="about">
      <div className="wrap about__inner">
        <div className="about__text">
          <p className="eyebrow reveal">{t.about.label}</p>
          <h2 className="section__title reveal">{t.about.title}</h2>
          {t.about.body.map((p, i) => (
            <p className="about__p reveal" style={{ "--d": `${0.1 + i * 0.08}s` }} key={i}>{p}</p>
          ))}
        </div>
        {/* 5e point du logo : l'embranchement (nœud J), relié à Proserpine */}
        <div className="about__mark reveal" aria-hidden="true">
          <div className="about__node" data-logo-node="J">
            <AboutNeuralOrb />
          </div>
        </div>
      </div>
    </section>
  );
}
