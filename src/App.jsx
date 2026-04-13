import { useState, useMemo, useEffect, useCallback } from 'react'

const SETUP_FEE = 2.5
const DEFAULT_PRICE_KG = 20.0
const ELECTRICITY_PRICE = 0.28 // €/kWh
const WEAR_RATE = 0.25 // €/h
const POWER_CONSUMPTION = 0.15 // kWh (avg. X1C bei PETG)
const ELECTRICITY_COST_PER_HOUR = POWER_CONSUMPTION * ELECTRICITY_PRICE
const HOURLY_RATE = ELECTRICITY_COST_PER_HOUR + WEAR_RATE
const CUSTOMER_MARKUP = 0.25 // 25%

function getInitialParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    t: params.get('t') !== null ? parseFloat(params.get('t')) || 0 : '',
    g: params.get('g') !== null ? parseFloat(params.get('g')) || 0 : '',
    p:
      params.get('p') !== null
        ? parseFloat(params.get('p')) || DEFAULT_PRICE_KG
        : DEFAULT_PRICE_KG,
    m: params.get('m') === 'k' ? 'k' : 'f',
  }
}

function formatEuro(value) {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

function App() {
  const initial = getInitialParams()
  const [time, setTime] = useState(initial.t)
  const [weight, setWeight] = useState(initial.g)
  const [priceKg, setPriceKg] = useState(initial.p)
  const [mode, setMode] = useState(initial.m) // 'f' = Freunde, 'k' = Kunden
  const [copied, setCopied] = useState(false)
  const isCustomer = mode === 'k'

  // Sync state → URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (time !== '') params.set('t', time)
    if (weight !== '') params.set('g', weight)
    if (priceKg !== DEFAULT_PRICE_KG) params.set('p', priceKg)
    if (mode === 'k') params.set('m', 'k')
    const qs = params.toString()
    const url = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname
    window.history.replaceState(null, '', url)
  }, [time, weight, priceKg, mode])

  const t = parseFloat(time) || 0
  const g = parseFloat(weight) || 0
  const p = parseFloat(priceKg) || 0

  const costs = useMemo(() => {
    const wearCost = t * WEAR_RATE
    const electricityCost = t * ELECTRICITY_COST_PER_HOUR
    const materialCost = (g / 1000) * p
    const subtotal = wearCost + electricityCost + SETUP_FEE + materialCost
    const markup = isCustomer ? subtotal * CUSTOMER_MARKUP : 0
    const total = subtotal + markup
    return { wearCost, electricityCost, materialCost, subtotal, markup, total }
  }, [t, g, p, isCustomer])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = window.location.href
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      {/* Mode accent bar */}
      <div className={`h-1 ${isCustomer ? 'bg-amber-500' : 'bg-indigo-500'}`} />

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              X1C-Calc
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Transparente Kostenberechnung für 3D-Druck-Aufträge
            </p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isCustomer
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
          }`}>
            {isCustomer ? 'Kunden-Tarif' : 'Freunde-Tarif'}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Calculator */}
          <div className="lg:col-span-3 space-y-6">
            {/* Input Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Druckparameter</h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium mb-1"
                  >
                    Druckzeit (Stunden)
                  </label>
                  <input
                    id="time"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="z.B. 4.5"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium mb-1"
                  >
                    Materialgewicht inkl. Support (Gramm)
                  </label>
                  <input
                    id="weight"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="z.B. 120"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="priceKg"
                    className="block text-sm font-medium mb-1"
                  >
                    Filamentpreis (€/kg)
                  </label>
                  <input
                    id="priceKg"
                    type="number"
                    min="0"
                    step="0.5"
                    value={priceKg}
                    onChange={(e) => setPriceKg(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>


              </div>
            </div>

            {/* Result Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Kalkulation</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Setup-Pauschale
                  </span>
                  <span className="font-medium">{formatEuro(SETUP_FEE)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Verschleiß ({t.toLocaleString('de-DE')} h ×{' '}
                    {formatEuro(WEAR_RATE)}/h)
                  </span>
                  <span className="font-medium">
                    {formatEuro(costs.wearCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Strom ({t.toLocaleString('de-DE')} h × {POWER_CONSUMPTION} kWh ×{' '}
                    {formatEuro(ELECTRICITY_PRICE)}/kWh)
                  </span>
                  <span className="font-medium">
                    {formatEuro(costs.electricityCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Material ({g.toLocaleString('de-DE')} g ×{' '}
                    {formatEuro(p)}/kg)
                  </span>
                  <span className="font-medium">
                    {formatEuro(costs.materialCost)}
                  </span>
                </div>
                <div className={isCustomer ? '' : 'invisible'}>
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Zwischensumme
                    </span>
                    <span className="font-medium">
                      {formatEuro(costs.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-3">
                    <span className="text-gray-500 dark:text-gray-400">
                      Aufwand &amp; Marge ({(CUSTOMER_MARKUP * 100).toFixed(0)} %)
                    </span>
                    <span className="font-medium">
                      {formatEuro(costs.markup)}
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between text-base">
                  <span className="font-semibold">Gesamtpreis</span>
                  <span className={`font-bold text-xl ${isCustomer ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                    {formatEuro(costs.total)}
                  </span>
                </div>
              </div>

              {/* Copy URL */}
              <button
                onClick={handleCopy}
                className={`mt-5 w-full cursor-pointer rounded-lg text-white text-sm font-medium py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                  isCustomer
                    ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                }`}
              >
                {copied ? '✓ Link kopiert!' : 'Kalkulation als Link kopieren'}
              </button>
            </div>
          </div>

          {/* Right: Transparency */}
          <aside className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Warum diese Kosten?
              </h2>

              <div className="space-y-5 text-sm leading-relaxed">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Setup-Pauschale ({formatEuro(SETUP_FEE)})
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Deckt Slicing, Druckbett-Vorbereitung und das Risiko von
                    Fehldrucken.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Verschleiß ({formatEuro(WEAR_RATE)}/h)
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Rücklage für Nozzles, Riemen, Lager und den regelmäßigen
                    Austausch der Kohlefilter.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Strom ({formatEuro(ELECTRICITY_COST_PER_HOUR)}/h)
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {POWER_CONSUMPTION} kWh × {formatEuro(ELECTRICITY_PRICE)}/kWh.
                    Basierend auf dem gemessenen Durchschnittsverbrauch des X1C
                    bei PETG-Temperaturen.
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Kombinierter Stundensatz: {formatEuro(HOURLY_RATE)}/h
                    (Verschleiß + Strom).{' '}
                    {isCustomer
                      ? `Zusätzlich werden ${(CUSTOMER_MARKUP * 100).toFixed(0)} % für Arbeitszeit und Marge berechnet.`
                      : 'Die Berechnung enthält keinen Aufschlag für Arbeitszeit oder Gewinn — es werden nur die tatsächlichen Betriebskosten weitergegeben. Wenn du magst, runde gerne auf — oder gib ein Bier aus. 🍺'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl border p-6 shadow-sm ${
              isCustomer
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
                : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900'
            }`}>
              <h3 className={`text-sm font-semibold mb-2 ${
                isCustomer
                  ? 'text-amber-800 dark:text-amber-300'
                  : 'text-indigo-800 dark:text-indigo-300'
              }`}>
                Formel
              </h3>
              <p className={`text-xs font-mono leading-relaxed ${
                isCustomer
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-indigo-700 dark:text-indigo-400'
              }`}>
                Preis = (t × Verschleiß/h) + (t × {POWER_CONSUMPTION} kWh × Strom/kWh) + {formatEuro(SETUP_FEE)} + (g ÷ 1000 × p){isCustomer && ` × ${(1 + CUSTOMER_MARKUP).toFixed(2)}`}
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            X1C-Calc · Bambu Lab X1C · PETG
          </span>
          <button
            onClick={() => setMode(isCustomer ? 'f' : 'k')}
            className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <span className={isCustomer ? '' : 'font-semibold'}>Freunde</span>
            <div className={`relative w-9 h-5 rounded-full transition-colors ${
              isCustomer ? 'bg-amber-500' : 'bg-indigo-500'
            }`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                isCustomer ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </div>
            <span className={isCustomer ? 'font-semibold' : ''}>Kunden</span>
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App
