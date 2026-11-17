import { createContext, useContext, useEffect, useState } from "react";

/* ============================================================
   Contenu bilingue FR / EN — une seule source de vérité.
   Pour éditer le site : modifier les textes ici.
   ============================================================ */
export const CONTENT = {
  fr: {
    nav: { services: "Services", apps: "Applications", about: "À propos", founders: "Fondateurs", contact: "Contact", cta: "Nous contacter" },
    hero: {
      eyebrow: "Studio high-tech · logiciels & applications",
      title: ["On vous aide à", "toucher les étoiles."],
      // Slogan à définir plus tard — accroche provisoire
      lead: "Adhara est un jeune studio qui crée des logiciels et des applications mobiles pour le monde entier. De l'idée au Play Store, avec audace.",
      ctaPrimary: "Découvrir nos apps",
      ctaSecondary: "Démarrer un projet"
    },
    services: {
      label: "Ce que nous faisons",
      title: "Trois savoir-faire, un seul niveau d'exigence.",
      items: [
        { icon: "▲", name: "Applications et logiciels", desc: "Des logiciels et applications conçus pour répondre à un vrai besoin, et vous simplifier la vie." },
        { icon: "◆", name: "Sites web et branding", desc: "Des sites qui marquent les esprits, une identité visuelle forte — du logo jusqu'à la mise en ligne." },
        { icon: "●", name: "Services promotionnels & réseaux sociaux", desc: "Contenus, campagnes et présence sociale pour faire rayonner votre marque là où ça compte." }
      ]
    },
    apps: {
      label: "Notre produit phare",
      title: "Proserpine,\nnotre étoile.",
      note: "Notre seule application disponible aujourd'hui — les suivantes sont en préparation.",
      featured: {
        name: "Proserpine", tag: "Écologie · Scan", logo: "/proserpine-app-logo.png",
        desc: "Triez vos déchets en un scan : Proserpine reconnaît l'objet et vous indique la bonne poubelle."
      },
      partnersLabel: "À nos côtés",
      partners: ["Ministre de l'Environnement", "Les communes", "Intradel", "Fost Plus"],
      store: "Bientôt disponible"
    },
    // Fondateurs — histoires et photos encore provisoires.
    // photo : chemin d'une image dans public/ (ex. "/fondateur-1.jpg"), sinon les initiales s'affichent.
    founders: {
      label: "Les fondateurs",
      title: "Deux parcours,\nune même étoile.",
      intro: "Adhara, c'est d'abord une histoire d'associés. Voici les deux personnes derrière le studio.",
      people: [
        { name: "Nicolas Scalais", role: "Cofondateur & co-CEO", title: "Directeur Marketing & Communication (CMO)", initials: "NS", photo: "", story: "Créer a toujours été mon moteur. Enfant, j'inventais des histoires ; adulte, je voulais porter un projet qui me ressemble : une entreprise dont je serais fier de parler, pas une de plus. Après une reconversion en infographie et en publicité, j'ai lancé ma boutique d'art digital. C'est pendant mes études que j'ai rencontré Maxime. Quand il m'a présenté son projet, je n'ai pas hésité une seconde." },
        { name: "Maxime Cavallari", role: "Cofondateur & co-CEO", title: "Directeur Technique (CTO)", initials: "MC", photo: "", story: "L'histoire de ton associé ici : son parcours, sa rencontre avec toi, son rôle dans le studio." }
      ]
    },
    stats: {
      label: "En chiffres",
      items: [
        { value: "45 k+", label: "Téléchargements" },
        { value: "4.8", label: "Note moyenne" },
        { value: "1", label: "App publiée" }
      ]
    },
    about: {
      label: "À propos",
      title: "Une étoile montante\ndu logiciel.",
      body: [
        "Adhara — comme l'étoile — est né d'une conviction simple : le logiciel de qualité ne devrait pas être réservé aux grands groupes.",
        "Nous sommes un studio jeune et ambitieux, basé sur l'audace et la vitesse d'exécution. Nous transformons des idées en produits que des utilisateurs du monde entier ouvrent chaque jour."
      ]
    },
    contact: {
      label: "Contact",
      // tiret insécable (‑) : empêche la césure "Parlons-/en." — si la
      // ligne doit se couper, ce sera après "Un projet ?" (seul point
      // de coupure restant), jamais au milieu du mot.
      title: "Un projet ? Parlons‑en.",
      lead: "Écrivez-nous, on répond vite. C'est notre truc.",
      fields: { name: "Votre nom", email: "Votre e-mail", message: "Votre message", send: "Envoyer", sending: "Envoi…", sent: "Merci ! Votre message est bien parti, on vous répond vite.", error: "L’envoi a échoué. Écrivez-nous directement à l’adresse ci-dessus." },
      email: "adhara.information@gmail.com"
    },
    footer: { rights: "Tous droits réservés.", tagline: "Studio de création logicielle.", brand: "Charte graphique" }
  },

  en: {
    nav: { services: "Services", apps: "Apps", about: "About", founders: "Founders", contact: "Contact", cta: "Get in touch" },
    hero: {
      eyebrow: "High-tech studio · software & apps",
      title: ["We help you", "reach for the stars."],
      lead: "Adhara is a young studio crafting software and mobile apps for the whole world. From idea to the Play Store, boldly.",
      ctaPrimary: "See our apps",
      ctaSecondary: "Start a project"
    },
    services: {
      label: "What we do",
      title: "Three crafts, one standard.",
      items: [
        { icon: "▲", name: "Apps & software", desc: "Software and apps designed to solve a real need, and make your life easier." },
        { icon: "◆", name: "Websites & branding", desc: "Sites that make an impression, a visual identity that's truly yours — from logo to launch." },
        { icon: "●", name: "Promotion & social media", desc: "Content, campaigns, and social presence to put your brand where it matters." }
      ]
    },
    apps: {
      label: "Our flagship product",
      title: "Proserpine,\nour star.",
      note: "Our only app available today — the next ones are in the works.",
      featured: {
        name: "Proserpine", tag: "Ecology · Scan", logo: "/proserpine-app-logo.png",
        desc: "Sort your waste in a single scan: Proserpine recognises the item and tells you which bin it goes in."
      },
      partnersLabel: "Alongside us",
      partners: ["Minister for the Environment", "Local municipalities", "Intradel", "Fost Plus"],
      store: "Coming soon"
    },
    founders: {
      label: "The founders",
      title: "Two paths,\none star.",
      intro: "Adhara starts as a story of partners. Meet the two people behind the studio.",
      people: [
        { name: "Nicolas Scalais", role: "Co-founder & Co-CEO", title: "Chief Marketing Officer (CMO)", initials: "NS", photo: "", story: "Creating has always driven me. As a kid, I made up stories; as an adult, I wanted to build something that truly felt like mine: a company I'd be proud to talk about, not just another one. After retraining in graphic design and advertising, I launched my own digital art shop. During my studies, I met Maxime. When he told me about his project, I didn't hesitate for a second." },
        { name: "Maxime Cavallari", role: "Co-founder & Co-CEO", title: "Chief Technology Officer (CTO)", initials: "MC", photo: "", story: "Your partner's story here: their background, how you met, their role in the studio." }
      ]
    },
    stats: {
      label: "By the numbers",
      items: [
        { value: "45k+", label: "Downloads" },
        { value: "4.8", label: "Avg. rating" },
        { value: "1", label: "App shipped" }
      ]
    },
    about: {
      label: "About",
      title: "A rising star in software.",
      body: [
        "Adhara — like the star — was born from a simple belief: great software shouldn't be reserved for big corporations.",
        "We're a young, ambitious studio built on boldness and speed of execution. We turn ideas into products that people around the world open every day."
      ]
    },
    contact: {
      label: "Contact",
      title: "Got a project? Let's talk.",
      lead: "Drop us a line, we reply fast. It's kind of our thing.",
      fields: { name: "Your name", email: "Your email", message: "Your message", send: "Send", sending: "Sending…", sent: "Thanks! Your message is on its way — we will get back to you soon.", error: "Sending failed. Please email us directly at the address above." },
      email: "adhara.information@gmail.com"
    },
    footer: { rights: "All rights reserved.", tagline: "Software creation studio.", brand: "Brand guidelines (FR)" }
  }
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = typeof localStorage !== "undefined" && localStorage.getItem("adhara-lang");
    if (saved) return saved;
    const nav = typeof navigator !== "undefined" ? navigator.language : "fr";
    return nav && nav.toLowerCase().startsWith("en") ? "en" : "fr";
  });

  useEffect(() => {
    localStorage.setItem("adhara-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = () => setLang((l) => (l === "fr" ? "en" : "fr"));
  return (
    <LangContext.Provider value={{ lang, setLang, toggle, t: CONTENT[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
