/* Réception d'un message du formulaire de contact (même méthode qu'Orpheus).

   L'envoi passe par Resend (https://resend.com) : une clé dans les variables
   Vercel suffit, aucune dépendance à installer.

   L'adresse de destination ne vit QUE côté serveur (CONTACT_TO) : elle ne
   part jamais dans le code envoyé au navigateur. */

import { adresseDe, ENVOI, tropDeRequetes } from "./_limite.js";

const MAX = { name: 120, email: 180, message: 4000 };
const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Méthode non autorisée." });
    return;
  }

  const body = req.body || {};
  const say = (fr, en) => (body.lang === "en" ? en : fr);

  // Le piège à robots est rempli : on acquiesce sans rien envoyer
  if (clean(body.company, 80)) {
    res.status(200).json({ ok: true });
    return;
  }

  // Un envoi déclenche un e-mail : on limite avant tout le reste.
  if (tropDeRequetes("contact", adresseDe(req), ENVOI.max, ENVOI.fenetre)) {
    res.status(429).json({
      message: say(
        "Trop d'envois depuis cette connexion. Réessayez dans un quart d'heure.",
        "Too many submissions from this connection. Try again in fifteen minutes."
      ),
    });
    return;
  }

  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const message = clean(body.message, MAX.message);

  if (!name || !message || !looksLikeEmail(email)) {
    res.status(400).json({
      message: say(
        "Nom, e-mail valide et message sont nécessaires.",
        "A name, a valid email and a message are required."
      ),
    });
    return;
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!key || !to) {
    res.status(503).json({
      message: say(
        "L'envoi automatique n'est pas encore configuré. Écrivez-nous directement à l'adresse ci-dessus.",
        "Automatic sending is not configured yet. Please email us directly at the address above."
      ),
    });
    return;
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || "Site Adhara <onboarding@resend.dev>",
        to: [to],
        // répondre au message répond au visiteur, pas au site
        reply_to: email,
        subject: `Contact site Adhara — ${name}`,
        text: [`Nom : ${name}`, `E-mail : ${email}`, "", message].join("\n"),
      }),
    });
    if (!r.ok) {
      const detail = await r.text();
      res.status(502).json({ message: say("L'envoi a échoué : ", "Sending failed: ") + detail.slice(0, 200) });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: say("L'envoi a échoué : ", "Sending failed: ") + err.message });
  }
}
