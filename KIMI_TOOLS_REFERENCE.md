# KIMI TOOLS REFERENCE
## Source code for 4 of the 12 modules to integrate

> Companion file to `KIMI_PROMPT.md`. Each tool below is **production-tested** by the user. Port the logic verbatim into `src/modules/<id>/Panel.tsx` and wrap with the standard module manifest. Do **not** rewrite the math or UX patterns — they are intentional.

---

## Module 1 — ZZP Netto Calculator

**id:** `zzp-netto-calculator`  
**type:** `calculator`  
**capabilities:**
- `calculate-netto` — input: { revenue, costs, revenueVatRate, costsVatRate, revenueType, costsType, isStarter, meetsHourCriterion, mode } → output: full breakdown (profit, deductions, mkbAmount, taxableIncome, finalIncomeTax, zvw, netAnnual, netMonthly, netWeekly, netHourly, taxPressureProfit, taxPressureRevenue)

**Constants (2025 estimates) — keep exact:**
```ts
const ZELFSTANDIGENAFTREK = 2470;
const STARTERSAFTREK = 2123;
const MKB_WINSTVRIJSTELLING = 0.127;
const ZVW_PERCENTAGE = 0.0545;
const ZVW_MAX_INKOMEN = 71624;
const SCHIJF_1_GRENS = 76817;
const TARIEF_1 = 0.3697;
const TARIEF_2 = 0.4950;
```

**Core calculation logic (extract into pure function for skill):**
```ts
export function calculateZzpNetto(input: ZzpInput): ZzpOutput {
  const rawRevenue = input.mode === "year" ? input.revenue : input.revenue * 12;
  const rawCosts = input.mode === "year" ? input.costs : input.costs * 12;

  // VAT split
  const annualRevenueEx = input.revenueType === "incl"
    ? rawRevenue / (1 + input.revenueVatRate / 100)
    : rawRevenue;
  const annualRevenueVat = input.revenueType === "incl"
    ? rawRevenue - annualRevenueEx
    : rawRevenue * (input.revenueVatRate / 100);

  const annualCostsEx = input.costsType === "incl"
    ? rawCosts / (1 + input.costsVatRate / 100)
    : rawCosts;
  const annualCostsVat = input.costsType === "incl"
    ? rawCosts - annualCostsEx
    : rawCosts * (input.costsVatRate / 100);

  const netVatPayable = annualRevenueVat - annualCostsVat;
  const profit = Math.max(0, annualRevenueEx - annualCostsEx);

  let deductions = 0;
  if (input.meetsHourCriterion) {
    deductions += ZELFSTANDIGENAFTREK;
    if (input.isStarter) deductions += STARTERSAFTREK;
  }

  const profitAfterDeductions = Math.max(0, profit - deductions);
  const mkbAmount = profitAfterDeductions * MKB_WINSTVRIJSTELLING;
  const taxableIncome = profitAfterDeductions - mkbAmount;

  const rawTax = taxableIncome <= SCHIJF_1_GRENS
    ? taxableIncome * TARIEF_1
    : SCHIJF_1_GRENS * TARIEF_1 + (taxableIncome - SCHIJF_1_GRENS) * TARIEF_2;

  // Heffingskortingen
  let aHK = 0;
  if (taxableIncome < 24812) aHK = 3362;
  else if (taxableIncome < 76817) aHK = 3362 - 0.0668 * (taxableIncome - 24812);

  let arbeidskorting = 0;
  if (taxableIncome < 11000) arbeidskorting = taxableIncome * 0.08;
  else if (taxableIncome < 23000) arbeidskorting = 880 + (taxableIncome - 11000) * 0.29;
  else if (taxableIncome < 39000) arbeidskorting = 4400 + (taxableIncome - 23000) * 0.03;
  else if (taxableIncome < 120000) arbeidskorting = 5532 - 0.0651 * (taxableIncome - 39000);

  const totalKorting = Math.max(0, aHK + arbeidskorting);
  const finalIncomeTax = Math.max(0, rawTax - totalKorting);
  const zvw = Math.min(profitAfterDeductions, ZVW_MAX_INKOMEN) * ZVW_PERCENTAGE;
  const totalIncomeTaxAndZvw = finalIncomeTax + zvw;
  const netAnnual = profit - totalIncomeTaxAndZvw;
  const annualRevenueTotal = annualRevenueEx + annualRevenueVat;
  const reservationTotal = totalIncomeTaxAndZvw + Math.max(0, netVatPayable);

  return {
    annualRevenueEx, annualRevenueVat, annualCostsEx, annualCostsVat, netVatPayable,
    profit, deductions, mkbAmount, taxableIncome, finalIncomeTax, zvw, totalIncomeTaxAndZvw,
    netAnnual,
    netMonthly: netAnnual / 12,
    netWeekly: netAnnual / 52,
    netHourly: netAnnual / (40 * 52),
    reservationTotal,
    taxPressureProfit: profit > 0 ? (totalIncomeTaxAndZvw / profit) * 100 : 0,
    taxPressureRevenue: annualRevenueTotal > 0 ? (reservationTotal / annualRevenueTotal) * 100 : 0,
  };
}
```

**UI features (preserve in Panel.tsx):**
- Toggle month/year input mode
- BTW rate selector per side (21 / 9 / 0)
- Incl/Excl toggle per side
- Starter checkbox + hour criterion checkbox
- Animated currency display (`AnimatedValue` component)
- StatCards with tooltips for each result
- Reset button
- Dark/light mode

Full reference React source previously provided by the user — paste into `src/modules/zzp-netto-calculator/Panel.tsx` and **extract `calculateZzpNetto` into `skill.ts` so the orchestrator can call it without rendering**.

---

## Module 2 — Organogram

**id:** `organogram`  
**type:** `visualization`  
**capabilities:**
- `render-tree` — input: optional `{ rootOverride }` → output: tree structure
- `query-role` — input: `{ roleName }` → output: path from root to role + hierarchy info

**Data structure (preserve exactly):**
```ts
export const organizationData: OrgNode = {
  role: "Founder",
  type: "founder",
  children: [
    {
      role: "Co-founder",
      type: "cofounder",
      left: [{ role: "Co-founder", type: "cofounder" }],
      right: [{ role: "Co-founder", type: "cofounder" }],
      children: [
        {
          role: "Partner",
          type: "partner",
          left: [{ role: "Senior Partner", type: "partner" }],
          right: [{ role: "Passive Partner", type: "partner" }],
          children: [
            {
              role: "CEO",
              type: "csuite",
              left: [{ role: "CTO", type: "csuite" }],
              right: [{ role: "COO", type: "csuite" }],
              children: [/* ...director chain → manager → senior → recruitment ladder */]
            }
          ]
        }
      ]
    }
  ]
};
```

**Type-to-style map (preserve):**
- `founder` — slate gradient with star
- `cofounder` — slate
- `partner` — amber accent
- `csuite` — blue accent
- `director` — indigo accent
- `manager` — teal accent
- `senior` — rose accent
- `recruitment` — muted slate (entry tier)

**Component recipe:**
```tsx
// Recursive node with collapsible children + left/right siblings
function RecursiveNode({ node }: { node: OrgNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = !!node.children?.length;
  const leftSiblings = node.left ?? [];
  const rightSiblings = node.right ?? [];
  // ...render NodeCard centered, siblings flanking, vertical line down to children when open
}
```

Preserve the legend, sun/moon dark-mode toggle, and the "click to expand" affordance with `+`/`–` button on the bottom edge of nodes that have children.

Full reference React source previously provided — paste into `src/modules/organogram/Panel.tsx`.

---

## Module 3 — TGC Chatbot

**id:** `tgc-chatbot`  
**type:** `chatbot` (agent)  
**capabilities:**
- `ask` — input: `{ question, language, detailLevel }` → output: `{ answer, language, citations? }`

**Languages supported:** NL, EN, DE, FR, ES (with localized welcome, placeholder, loading, error strings — table in source).

**Detail levels:**
- `short` → "Max 2 sentences."
- `normal` → "Clear and concise, medium length."
- `extensive` → "In-depth, structured with headers and lists."

**Knowledge base — Time Gap Cash Flow whitepaper (must be embedded as system context):**

```
WHITEPAPER: Time Gap Cash Flow (TGC)
Een liquiditeitsstrategie gebaseerd op tijd, niet op bezit.

1. Inleiding
Traditionele financiële modellen zijn primair gebaseerd op bezit, waardegroei en lange termijn rendement. Time Gap Cash Flow (TGC) is een financieel concept waarbij waarde wordt gecreëerd door het tijdverschil tussen inkomende en uitgaande geldstromen strategisch te benutten.

2. Definitie
TGC is het systematisch benutten van het tijdsverschil tussen ontvangst en verplichting van kapitaal om tijdelijke liquiditeit productief in te zetten.

3. Kernvariabelen
3.1 Inkomende kasstroom — vast of voorspelbaar
3.2 Tijdsgat (Time Gap) — periode tussen ontvangst en verplichting
3.3 Uitgaande verplichting — vast bedrag, vast moment

Formule: TGC-opbrengst = Productieve output binnen tijdsgat – operationele kosten.

4. TGC vs traditionele financiering
- Focus: Tijd vs Bezit
- Rendement: Korte cycli vs Lange termijn
- Kapitaal: Tijdelijke liquiditeit vs Eigen vermogen
- Risico: Timingfouten vs Waardeschommelingen
- Groei: Cyclisch vs Lineair

5. Waar TGC winst maakt
- Liquiditeitsoptimalisatie
- Snelheid (opbrengst binnen verplichtingsperiode)
- Schaalbaarheid (cycli herhaal-/parallelliseerbaar)

6. Voorwaarden voor valide TGC-structuur
- Voorspelbaarheid van stromen
- Tijdsmarge: output sneller dan verplichting
- Liquiditeit boven rendement
- Geen afhankelijkheid van instroom
- Exit-moment ingebouwd per cyclus

7. Wat TGC niet is
GEEN schuldenstrategie, GEEN hefboom op waardestijging, GEEN piramidemodel, GEEN speculatie.

8. Risico's
- Timing mismatch
- Operationele vertraging
- Overoptimalisatie
- Psychologische valkuil

9. Filosofische onderlaag
Geld is geen bezit, maar een tijdelijk instrument. "Hoeveel heb ik?" → "Wat kan dit geld doen zolang het hier is?"

10. Conclusie
TGC creëert waarde zonder waardegroei, gebruikt tijd als hefboom, hanteert korte cycli, eindigt zonder structurele verplichtingen.
```

**System prompt template:**
```
You are the expert behind the Time Gap Cashflow Chatbot.
IMPORTANT: Respond ALWAYS in {{language}}.
Tone: Professional, academic, business-like.
Use ONLY the following context: {{TGC_WHITEPAPER}}
LENGTH/STYLE: {{detailInstruction}}
```

**Integration notes:**
- Original code uses Gemini API directly. **In the platform, route through the orchestrator's `LLMClient` instead** so model choice is global.
- Retain the language selector + detail-level toggle in `Panel.tsx`.
- When invoked as a skill from another agent, return `{ answer, language }` — no streaming required for skill mode.

Full reference React source previously provided — paste into `src/modules/tgc-chatbot/Panel.tsx`.

---

## Module 4 — VVC Calculator (Verdienende Vrienden Club)

**id:** `vvc-calculator`  
**type:** `calculator`  
**capabilities:**
- `project-earnings` — input: `{ hoursPerWeek, placementsPerMonth }` → output: `{ monthlyBaseSalary, monthlyBonus, yearEndMonthlyIncome, totalYearEarnings, totalVrienden, monthByMonth: ChartPoint[] }`

**Constants (preserve exactly):**
```ts
const HOURLY_RATE = 30;          // €/uur tijdens bellen
const PLACEMENT_BONUS = 300;     // € per plaatsing
const PASSIVE_INCOME_PER_USER = 25; // € per maand passief per geplaatste vriend
```

**Core calculation (extract for skill):**
```ts
export function projectVvcEarnings(input: VvcInput): VvcOutput {
  const monthlyBaseSalary = input.hoursPerWeek * 4 * HOURLY_RATE;
  const monthlyBonus = input.placementsPerMonth * PLACEMENT_BONUS;

  const monthByMonth = [];
  let accumulatedPlacements = 0;

  for (let month = 1; month <= 12; month++) {
    accumulatedPlacements += input.placementsPerMonth;
    const passiveIncome = accumulatedPlacements * PASSIVE_INCOME_PER_USER;
    const total = monthlyBaseSalary + monthlyBonus + passiveIncome;
    monthByMonth.push({
      name: `Mnd ${month}`,
      Uurloon: monthlyBaseSalary,
      Bonussen: monthlyBonus,
      Passief: passiveIncome,
      Totaal: total,
      Accumulated: accumulatedPlacements,
    });
  }

  const yearEndMonthlyIncome = monthByMonth[11].Totaal;
  const totalYearEarnings = monthByMonth.reduce((acc, m) => acc + m.Totaal, 0);
  const totalVrienden = input.placementsPerMonth * 12;

  return {
    monthlyBaseSalary,
    monthlyBonus,
    yearEndMonthlyIncome,
    totalYearEarnings,
    totalVrienden,
    monthByMonth,
  };
}
```

**UI features (preserve in Panel.tsx):**
- Two sliders: hours/week (0–40), placements/month (0–100)
- Yellow accent (`#EAB308`) on dark slate (`#0F172A` / `#1E293B`) — distinct visual identity
- Recharts `AreaChart` with stacked: Uurloon (slate) / Bonussen (cyan) / Passief (yellow gradient)
- Two top cards: yellow "Inkomen Maand 12" + dark "Jaartotaal"
- Footer info card explaining the model

Full reference React source previously provided — paste into `src/modules/vvc-calculator/Panel.tsx`.

---

## Tools awaiting source from user

The following 8 modules need source code from the user before integration:

| id | type | priority |
|---|---|---|
| `mining-calculator` | calculator | Phase 2 |
| `estate-calculator` | calculator | Phase 2 |
| `takenblok` | tool | Phase 3 |
| `hellings-delivery-chatbot` | chatbot | Phase 3 |
| `loep-services-chatbot` | chatbot | Phase 3 |
| `vvc-chatbot` | chatbot | Phase 3 |
| `voice-verification` | verification (Python sidecar) | Phase 4 |
| `ecosysteem-chatbot` | chatbot (meta) | Phase 3 |

**Architectural promise:** with the manifest + skill contract from `KIMI_PROMPT.md` Section 4.3–4.4, each new module is a **single-folder drop** into `api/modules/<id>/` + `src/modules/<id>/`. No core changes. No orchestrator changes. The auto-discovery registry picks them up at boot.

---

## Module porting checklist (for each tool)

- [ ] Create `api/modules/<id>/manifest.ts` — manifest with capabilities + JSON schemas for LLM
- [ ] Create `api/modules/<id>/skill.ts` — pure function(s), invokable by orchestrator, no React
- [ ] Create `api/modules/<id>/schema.ts` — Zod input/output schemas (shared with frontend via tRPC)
- [ ] Create `src/modules/<id>/Panel.tsx` — full UI (port from reference)
- [ ] Create `src/modules/<id>/ContextCard.tsx` — compact summary for timeline
- [ ] Create `src/modules/<id>/manifest.ts` — frontend manifest (icon, panel import path)
- [ ] Add to `src/modules/_registry.ts` — dynamic import map
- [ ] Add to `api/modules/_registry.ts` — auto-discovered, just verify
- [ ] Smoke test: invoke skill via tRPC, verify output matches Zod schema
- [ ] AI test: ask the orchestrator to use the tool, verify it appears in tool list and invokes correctly
