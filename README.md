# Fresh Pan Pizza

Ordering website for Fresh Pan Pizza, Garden Town, Taunsa Road, Multan.
Live at https://freshpanpizza.netlify.app/

Customers pick items and send the order to the shop on WhatsApp (0317-6702161). There is no backend: it is plain HTML, CSS and JavaScript.

## Changing the menu

Edit `menu-data.js`. It holds every category, item and price, plus the shop's phone numbers, address and opening hours. No other file needs to change.

## Files

| File | What it is |
|---|---|
| `index.html` | The page |
| `style.css` | Design |
| `app.js` | Menu, cart and WhatsApp ordering |
| `menu-data.js` | Menu, prices and shop details |
| `img/` | Logo and food photos (photos from Unsplash) |
| `_redirects` | Sends old `/menu.html` links to the new page (Netlify) |

## Running locally

```
python -m http.server 8080
```

Then open http://127.0.0.1:8080/

## Deploying

On Netlify, link the site to this repository (publish directory: the repository root, no build command). Every push to `main` then goes live automatically.
