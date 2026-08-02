import { useLang } from "../i18n.jsx";

export default function About() {
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
        <div className="about__mark reveal" aria-hidden="true">
          <span className="about__star">✦</span>
        </div>
      </div>
    </section>
  );
}
