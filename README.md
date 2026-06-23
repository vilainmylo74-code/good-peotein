# Good Protein 🥗

Site de **Good Protein** : commande du midi (livraison 12h) et meal prep hebdomadaire, avec paiement en ligne par **Stripe**.

## Contenu du dépôt

| Fichier | Description |
|---|---|
| `gp-commande-midi.html` | Page de commande du midi (choix des plats, livraison ou retrait) |
| `gp-meal-prep.html` | Page meal prep (formules de la semaine, à l'unité ou en abonnement) |
| `server.js` | Backend Node.js / Express : création des paiements Stripe + webhooks |

## Mise en route du backend

```bash
npm install express stripe cors dotenv
node server.js
```

Créer un fichier `.env` (NE PAS le mettre sur GitHub) :

```
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_...
BASE_URL=https://votresite.fr
```

Le serveur démarre par défaut sur `http://localhost:3000`.

## À faire plus tard

- [ ] Pages de remerciement (`merci-midi.html`, `merci-mealprep.html`)
- [ ] Envoi d'e-mails de confirmation (client + cuisine)
- [ ] Harmoniser les noms de fichiers entre les pages et `server.js`
