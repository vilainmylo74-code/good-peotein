// =============================================
// BACKEND STRIPE — server.js
// Node.js + Express + stripe
//
// Installation :
//   npm install express stripe cors dotenv
//
// Fichier .env à créer :
//   STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE
//   STRIPE_WEBHOOK_SECRET=whsec_...  (après avoir créé un webhook dans Stripe Dashboard)
//   BASE_URL=https://votresite.fr
// =============================================

require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();

// Webhook Stripe doit recevoir le body brut (avant JSON parse)
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(cors());
app.use(express.json());

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// =============================================
// ROUTE 1 — Commande du midi
// =============================================
app.post('/api/create-checkout-session', async (req, res) => {
  const { client, mode_livraison, adresse, remarques, plats, type, mode, formule, formule_nom, prix_cents, allergenes } = req.body;

  try {
    let sessionParams;

    // --- COMMANDE MIDI ---
    if (!type || type === 'midi') {
      const line_items = plats.map(plat => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: plat.nom,
            metadata: { plat_id: plat.id }
          },
          unit_amount: plat.prix_cents,
        },
        quantity: plat.quantite,
      }));

      // Frais de livraison si livraison à domicile
      if (mode_livraison === 'livraison') {
        line_items.push({
          price_data: {
            currency: 'eur',
            product_data: { name: 'Frais de livraison' },
            unit_amount: 200, // 2,00 € — modifiez selon votre tarif
          },
          quantity: 1,
        });
      }

      sessionParams = {
        payment_method_types: ['card'],
        mode: 'payment', // Paiement unique
        line_items,
        customer_email: client.email,
        metadata: {
          type: 'commande_midi',
          client_nom: `${client.prenom} ${client.nom}`,
          client_tel: client.tel,
          mode_livraison,
          adresse: adresse || 'Retrait sur place',
          remarques: remarques || '',
        },
        success_url: `${BASE_URL}/merci-midi.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/gpcommandemidi.html`,
        locale: 'fr',
        // Expiration après 30 min (délai commande)
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      };

    // --- MEAL PREP ---
    } else if (type === 'mealprep') {

      if (mode === 'abonnement') {
        // Abonnement hebdomadaire → Stripe Subscription
        // Il faut d'abord créer un Price récurrent dans Stripe Dashboard
        // ou via l'API. Ici on crée le price à la volée :
        const price = await stripe.prices.create({
          unit_amount: prix_cents,
          currency: 'eur',
          recurring: { interval: 'week' },
          product_data: { name: `Meal Prep · Formule ${formule_nom} (abonnement hebdo)` },
        });

        sessionParams = {
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [{ price: price.id, quantity: 1 }],
          customer_email: client.email,
          metadata: {
            type: 'mealprep_abonnement',
            formule,
            formule_nom,
            client_nom: `${client.prenom} ${client.nom}`,
            client_tel: client.tel,
            adresse: adresse || 'Retrait sur place',
            allergenes: (allergenes || []).join(', '),
          },
          success_url: `${BASE_URL}/merci-mealprep.html?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${BASE_URL}/gpmealprep.html`,
          locale: 'fr',
          subscription_data: {
            trial_period_days: 0,
            metadata: {
              formule,
              client_tel: client.tel,
            }
          }
        };

      } else {
        // Commande unique meal prep
        sessionParams = {
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [{
            price_data: {
              currency: 'eur',
              product_data: { name: `Meal Prep · Formule ${formule_nom}` },
              unit_amount: prix_cents,
            },
            quantity: 1,
          }],
          customer_email: client.email,
          metadata: {
            type: 'mealprep_unitaire',
            formule,
            formule_nom,
            client_nom: `${client.prenom} ${client.nom}`,
            client_tel: client.tel,
            adresse: adresse || 'Retrait sur place',
            allergenes: (allergenes || []).join(', '),
          },
          success_url: `${BASE_URL}/merci-mealprep.html?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${BASE_URL}/gpmealprep.html`,
          locale: 'fr',
        };
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// ROUTE 2 — Webhook Stripe (confirmations)
// Créez le webhook sur : dashboard.stripe.com/webhooks
// URL : https://votresite.fr/api/webhook
// Événements à écouter :
//   - checkout.session.completed
//   - invoice.payment_succeeded  (abonnements)
//   - customer.subscription.deleted (résiliation)
// =============================================
app.post('/api/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object;
      const meta = session.metadata;
      console.log('✅ Paiement confirmé:', meta);

      // TODO : Envoyez ici un email de confirmation au client
      // et une notification à votre équipe cuisine
      // Ex : avec Nodemailer, SendGrid, Resend...
      //
      // Pour commande midi :
      if (meta.type === 'commande_midi') {
        console.log(`📦 COMMANDE MIDI
  Client  : ${meta.client_nom} (${meta.client_tel})
  Mode    : ${meta.mode_livraison}
  Adresse : ${meta.adresse}
  Remarques: ${meta.remarques}
  Total   : ${(session.amount_total / 100).toFixed(2)} €`);
        // → Envoyer email cuisine + email client
      }

      // Pour meal prep unitaire :
      if (meta.type === 'mealprep_unitaire') {
        console.log(`🥗 MEAL PREP (unitaire)
  Client    : ${meta.client_nom} (${meta.client_tel})
  Formule   : ${meta.formule_nom}
  Adresse   : ${meta.adresse}
  Allergènes: ${meta.allergenes}`);
      }

      // Pour abonnement meal prep :
      if (meta.type === 'mealprep_abonnement') {
        console.log(`🔄 ABONNEMENT MEAL PREP activé
  Client    : ${meta.client_nom}
  Formule   : ${meta.formule_nom}
  Allergènes: ${meta.allergenes}`);
      }

      break;
    }

    case 'invoice.payment_succeeded': {
      // Renouvellement hebdomadaire d'un abonnement
      const invoice = event.data.object;
      console.log(`🔄 Renouvellement abonnement — Client Stripe: ${invoice.customer}`);
      // TODO : Préparer la commande de la semaine suivante
      break;
    }

    case 'customer.subscription.deleted': {
      // Client a résilié
      const sub = event.data.object;
      console.log(`❌ Résiliation abonnement — ${sub.id}`);
      // TODO : Envoyer email de confirmation de résiliation
      break;
    }

    default:
      // Ignorer les autres événements
  }

  res.json({ received: true });
});

// =============================================
// DÉMARRAGE
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur Stripe lancé sur http://localhost:${PORT}`);
  console.log(`   Clé Stripe : ${process.env.STRIPE_SECRET_KEY?.slice(0, 12)}...`);
});
