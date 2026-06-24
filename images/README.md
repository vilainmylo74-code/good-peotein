# 📸 Photos des produits

Dépose ici les vraies photos des produits Good Protein.

**Important :** le nom du fichier doit être **exactement** celui indiqué ci-dessous
(en `.jpg`). Dès qu'une photo est présente, elle s'affiche automatiquement
sur la page commande.

Format conseillé : carré (ex. 600 × 600 px), `.jpg` léger (< 200 Ko).

### Comment l'affichage choisit l'image (cascade automatique)

1. **`images/<nom>.jpg`** — ta vraie photo (priorité absolue).
2. **`images/ph/<nom>.svg`** — image de marque générée (déjà présente, sert de
   visuel en attendant les vraies photos).
3. **emoji** — dernier recours si rien n'est trouvé.

> Tu n'as donc **rien à supprimer** : pose simplement ton `.jpg` dans `images/`
> et il remplace automatiquement le visuel de marque correspondant.
> Les visuels de marque sont dans `images/ph/` (ne pas y toucher sauf envie).

## Page commande (`gpcommandemidi.html`)

### 🍔 Burgers
| Produit | Fichier attendu |
|---|---|
| Good Bœuf | `good-boeuf.jpg` |
| Le Boss | `le-boss.jpg` |
| Poulet Pané Avoine | `poulet-pane.jpg` |
| Saumon Protéiné | `saumon.jpg` |
| Burger Végé | `burger-vege.jpg` |

### 🥗 Salades
| Produit | Fichier attendu |
|---|---|
| Salade Sport | `salade-sport.jpg` |
| Sport Bowl | `sport-bowl.jpg` |

### 🍟 Accompagnements
| Produit | Fichier attendu |
|---|---|
| Frites Airfryer | `frites.jpg` |

### 🍪 Desserts
| Produit | Fichier attendu |
|---|---|
| Cookie Cacahuètes | `cookie-cacahuetes.jpg` |
| Cookie Noisette | `cookie-noisette.jpg` |
| Açaï Bowl | `acai-bowl.jpg` |

### 🥤 Boissons
| Produit | Fichier attendu |
|---|---|
| Vitamin Well | `vitamin-well.jpg` |
| Smoothie Maison | `smoothie.jpg` |
| Kombucha | `kombucha.jpg` |

## Page meal prep (`gpmealprep.html`)

### 📦 Formules
| Formule | Fichier attendu |
|---|---|
| Starter | `formule-starter.jpg` |
| La Semaine | `formule-semaine.jpg` |
| Full Week | `formule-full.jpg` |

---

> Si tu veux utiliser un autre nom de fichier (ou une URL d'image en ligne),
> modifie le champ `img:` du produit concerné dans `gpcommandemidi.html`
> (bloc `const MENU = [...]`).
