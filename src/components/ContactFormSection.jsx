import { useState } from "react";
import { useLang } from "../content-and-translations.jsx";

/* Formulaire de contact (même méthode qu'Orpheus) : le message part vers
   /api/contact, la fonction Vercel qui l'envoie par Resend et connaît
   seule l'adresse de destination (variable CONTACT_TO). */
export default function ContactFormSection() {
  const { t, lang } = useLang();
  const f = t.contact.fields;
  const empty = { name: "", email: "", message: "", company: "" };
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lang })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || f.error);
      setStatus("sent");
      setForm(empty);
    } catch (err) {
      setError(err.message || f.error);
      setStatus("error");
    }
  };

  return (
    <section className="section section--alt contact" id="contact">
      <div className="wrap contact__inner">
        <div className="contact__head">
          <p className="eyebrow reveal">{t.contact.label}</p>
          <h2 className="section__title reveal">{t.contact.title}</h2>
          <p className="contact__lead reveal">{t.contact.lead}</p>
          <a href={`mailto:${t.contact.email}`} className="contact__email reveal">{t.contact.email}</a>
        </div>
        <form className="contact__form reveal" onSubmit={onSubmit}>
          <input type="text" required placeholder={f.name} value={form.name} onChange={set("name")} />
          <input type="email" required placeholder={f.email} value={form.email} onChange={set("email")} />
          <textarea required rows="4" placeholder={f.message} value={form.message} onChange={set("message")} />
          {/* piège à robots : invisible pour les humains */}
          <input type="text" name="company" value={form.company} onChange={set("company")} tabIndex={-1} autoComplete="off" aria-hidden="true" className="contact__trap" />
          <button type="submit" className="btn btn--primary" disabled={status === "sending"}>
            {status === "sending" ? f.sending : f.send}
          </button>
          {status === "sent" && <p className="contact__status" role="status">{f.sent}</p>}
          {status === "error" && <p className="contact__status contact__status--error" role="alert">{error}</p>}
        </form>
      </div>
    </section>
  );
}
