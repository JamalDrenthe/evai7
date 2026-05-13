export const TGC_WHITEPAPER = `
WHITEPAPER: Time Gap Cash Flow (TGC)
Een liquiditeitsstrategie gebaseerd op tijd, niet op bezit.

1. Inleiding
Traditionele financiële modellen zijn primair gebaseerd op bezit, waardegroei en lange termijn rendement. Time Gap Cash Flow (TGC) is een financieel concept waarbij waarde wordt gecreëerd door het tijdverschil tussen inkomende en uitgaande geldstromen strategisch te benutten. Het doel is het genereren van cashflow binnen de tijdsruimte, zonder afhankelijk te zijn van waardestijging of langdurige kapitaalvastzetting.

2. Definitie
TGC is het systematisch benutten van het tijdsverschil tussen ontvangst en verplichting van kapitaal om tijdelijke liquiditeit productief in te zetten. Het geld is tijdelijk beschikbaar, de verplichting is vast en bekend, de opbrengst ontstaat binnen de tijdsruimte. De winst is niet het kapitaal zelf, maar wat het kapitaal kan doen gedurende de tijd dat het beschikbaar is.

3. Kernvariabelen
3.1 Inkomende kasstroom: vast of voorspelbaar, direct beschikbaar, contractueel/operationeel geborgd.
3.2 Tijdsgat (Time Gap): de periode tussen ontvangst en verplichting. Bepaalt de maximale inzetbaarheid.
3.3 Uitgaande verplichting: vast bedrag, vast moment, niet afhankelijk van prestaties.
Formule: TGC-opbrengst = Productieve output binnen tijdsgat – operationele kosten.

4. TGC vs traditionele financiering
- Focus: Tijd (TGC) vs Bezit (Traditioneel)
- Rendement: Korte cycli vs Lange termijn
- Kapitaal: Tijdelijke liquiditeit vs Eigen vermogen
- Risico: Timingfouten vs Waardeschommelingen
- Groei: Cyclisch vs Lineair
TGC vereist geen groei van waarde, alleen efficiënt gebruik van tijd.

5. Waar TGC winst maakt
5.1 Liquiditeitsoptimalisatie: kapitaal dat anders stil zou staan, wordt tijdelijk actief ingezet.
5.2 Snelheid: de opbrengst ontstaat binnen de verplichtingsperiode.
5.3 Schaalbaarheid: zodra de structuur werkt kan deze herhaald, gecombineerd of parallel uitgevoerd worden.

6. Voorwaarden voor een valide TGC-structuur
- Voorspelbaarheid van inkomende en uitgaande stromen
- Tijdsmarge: output realiseert zich sneller dan verplichting
- Liquiditeit boven rendement: cashflow belangrijker dan winstpercentage
- Geen afhankelijkheid van instroom van nieuwe deelnemers
- Exit-moment ingebouwd per cyclus

7. Wat TGC NIET is
GEEN schuldenstrategie, GEEN hefboom op waardestijging, GEEN piramidemodel, GEEN speculatie, GEEN afhankelijkheid van toekomstige beloftes. TGC faalt zodra verplichtingen afhankelijk worden van onzekere opbrengsten.

8. Risico's
- Timing mismatch: opbrengsten later dan gepland
- Operationele vertraging verkleint de time gap
- Overoptimalisatie vergroot fragiliteit
- Psychologische valkuil: overschatting van wat haalbaar is in korte tijd

9. Filosofische onderlaag
Geld is geen bezit, maar een tijdelijk instrument. Van "Hoeveel heb ik?" naar "Wat kan dit geld doen zolang het hier is?".

10. Conclusie
TGC creëert waarde zonder waardegroei, gebruikt tijd als hefboom, hanteert korte cycli en eindigt zonder structurele verplichtingen. Het succes ligt in discipline, structuur en tijdsbewustzijn.
`;

const LANGUAGE_NAMES: Record<string, string> = {
  NL: "Nederlands",
  EN: "English",
  DE: "Deutsch",
  FR: "Français",
  ES: "Español",
};

const DETAIL_INSTRUCTIONS: Record<string, string> = {
  short: "Max 2 zinnen. Direct, geen omhaal.",
  normal: "Helder en bondig, gemiddelde lengte.",
  extensive: "Diepgaand, gestructureerd met kopjes en lijsten waar zinvol.",
};

export function buildTgcSystemPrompt(
  language: string,
  detailLevel: string,
): string {
  const langName = LANGUAGE_NAMES[language] ?? "Nederlands";
  const detail = DETAIL_INSTRUCTIONS[detailLevel] ?? DETAIL_INSTRUCTIONS.normal;
  return `Je bent de expert achter de Time Gap Cashflow Chatbot.
BELANGRIJK: Antwoord ALTIJD in ${langName}.
Toon: Professioneel, academisch, zakelijk.

Gebruik UITSLUITEND de volgende context:
${TGC_WHITEPAPER}

LENGTE/STIJL: ${detail}`;
}
