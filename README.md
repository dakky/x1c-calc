# X1C-Calc

Transparenter Kostenkalkulator für 3D-Druck-Aufträge mit dem Bambu Lab X1C.

**[→ Live Demo](https://dakky.github.io/x1c-calc/)**

## Features

- **Kostenberechnung** — Materialkosten, Verschleiß, Strom und Setup-Pauschale auf einen Blick
- **Freunde / Kunden** — Zwei Modi: Freunde zahlen nur Betriebskosten, Kunden einen Aufschlag
- **Teilbare Links** — Alle Parameter in der URL, Kalkulation per Link verschicken
- **Dark Mode** — Automatisch nach System-Präferenz

## Formel

```
Preis = Setup + (Druckzeit × Verschleiß/h) + (Druckzeit × Verbrauch × Strompreis) + (Gewicht/1000 × Filamentpreis/kg)
```

Im Kunden-Modus wird auf die Summe ein Aufschlag von 25 % berechnet.

## Development

```bash
npm install
npm run dev
```

Build: `npm run build` · Lint: `npm run lint`

**Stack:** React, Vite, Tailwind CSS v4

## Deployment

Automatisch via GitHub Actions auf GitHub Pages bei Push auf `main`.
