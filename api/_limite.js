/* Garde-fou commun aux points d'entrée qui envoient un e-mail.

   Pourquoi c’est nécessaire : /api/contact est ouvert à tous et déclenche un
   envoi. L’offre gratuite de Resend plafonne à 100 messages par jour — sans
   limite, n’importe qui épuise le quota en quelques secondes, et plus aucun
   vrai message ne te parvient. Le
   déni de service coûte ici moins cher à l'attaquant qu'à toi.

   La mémoire est celle du processus. Sur un hébergement sans état comme
   Vercel, chaque instance compte pour elle : ça ralentit fortement sans
   bloquer absolument. Pour un site de cette taille, c'est la bonne mesure —
   une vraie limite partagée demanderait une base de données. */

const SEAUX = new Map();

export const adresseDe = (req) =>
  String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "?")
    .split(",")[0]
    .trim();

/* Renvoie true quand la requête doit être refusée. */
export function tropDeRequetes(seau, ip, max, fenetre) {
  const maintenant = Date.now();
  const cle = `${seau}:${ip}`;
  const vus = (SEAUX.get(cle) || []).filter((t) => maintenant - t < fenetre);
  vus.push(maintenant);
  SEAUX.set(cle, vus);

  /* Ménage grossier : sans lui la carte grandirait indéfiniment sur une
     instance de longue durée. */
  if (SEAUX.size > 5000) {
    for (const [k, v] of SEAUX) if (v.every((t) => maintenant - t >= fenetre)) SEAUX.delete(k);
    if (SEAUX.size > 5000) SEAUX.clear();
  }

  return vus.length > max;
}

/* Cinq envois par quart d'heure : large pour une personne qui se trompe et
   recommence, étroit pour un robot. */
export const ENVOI = { max: 5, fenetre: 15 * 60 * 1000 };
