import { nanoid } from "nanoid";
import type { Skill, SkillResult } from "../../../contracts/skill";
import type { ContextEntry } from "../../../contracts/session-context";
import { VerificationInputSchema, type VerificationInput, type VerificationOutput } from "./schema";

const DOC_FORMATS: Record<string, RegExp> = {
  passport: /^[A-Z0-9]{6,12}$/i,
  id_card: /^[A-Z0-9]{6,12}$/i,
  drivers_license: /^[A-Z0-9]{6,15}$/i,
  residence_permit: /^[A-Z0-9]{6,12}$/i,
};

export function verifyIdentity(input: VerificationInput): VerificationOutput {
  const checks: VerificationOutput["checks"] = [];

  // Document number format
  const formatRe = DOC_FORMATS[input.documentType];
  const formatOk = formatRe.test(input.documentNumber);
  checks.push({
    name: "Documentnummer formaat",
    passed: formatOk,
    detail: formatOk ? "Geldig formaat" : "Documentnummer voldoet niet aan formaat",
  });

  // Age check (must be >= 18)
  let ageOk = false;
  try {
    const dob = new Date(input.dateOfBirth);
    if (!isNaN(dob.getTime())) {
      const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 3600_000);
      ageOk = age >= 18 && age < 120;
      checks.push({
        name: "Leeftijd \u2265 18",
        passed: ageOk,
        detail: ageOk ? `Ongeveer ${Math.floor(age)} jaar` : "Geboortedatum buiten geldig bereik",
      });
    } else {
      checks.push({ name: "Leeftijd \u2265 18", passed: false, detail: "Ongeldige geboortedatum" });
    }
  } catch {
    checks.push({ name: "Leeftijd \u2265 18", passed: false, detail: "Geboortedatum parsing faalde" });
  }

  // Name plausibility
  const nameOk = /^[\p{L}\s'-]{2,}$/u.test(input.fullName) && input.fullName.trim().split(/\s+/).length >= 2;
  checks.push({
    name: "Naam plausibel",
    passed: nameOk,
    detail: nameOk ? "Voor- en achternaam gevonden" : "Vul een volledige naam in",
  });

  // Country whitelist (demo)
  const country = input.country.toUpperCase();
  const countryOk = ["NL", "BE", "DE", "FR", "ES", "IT", "PT", "PL"].includes(country);
  checks.push({
    name: "Land toegestaan",
    passed: countryOk,
    detail: countryOk ? `${country} ondersteund` : `${country} niet in toegestane landen`,
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const confidence = passedCount / checks.length;
  const status: VerificationOutput["status"] =
    confidence >= 0.85 ? "approved" : confidence >= 0.5 ? "review" : "rejected";

  return {
    status,
    confidence,
    checks,
    reference: `EV-${Date.now().toString(36).toUpperCase().slice(-8)}`,
  };
}

export const skill: Skill<VerificationInput, VerificationOutput> = {
  manifest: {
    id: "verification",
    name: "Verification",
    type: "verification",
    version: "1.0.0",
    description:
      "KYC-style identity verification: documentnummer-format, leeftijd, naam-plausibiliteit, land-whitelist. Demo implementatie zonder externe KYC-provider.",
    tags: ["verification", "kyc", "identity", "security"],
    capabilities: [
      {
        name: "verify",
        description:
          "Controleer een identiteit met naam, geboortedatum, documenttype en documentnummer. Geeft approved/review/rejected status met confidence en deelchecks terug.",
        inputSchema: {
          type: "object",
          required: ["fullName", "documentType", "documentNumber", "dateOfBirth"],
          properties: {
            fullName: { type: "string" },
            documentType: {
              type: "string",
              enum: ["passport", "id_card", "drivers_license", "residence_permit"],
            },
            documentNumber: { type: "string" },
            dateOfBirth: { type: "string", description: "YYYY-MM-DD" },
            country: { type: "string", description: "ISO-2 land, default NL" },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            status: { type: "string" },
            confidence: { type: "number" },
            reference: { type: "string" },
          },
        },
      },
    ],
    contextRequirements: [],
    contextOutputs: ["lastVerification"],
    dependencies: [],
    ui: {
      panel: "@/modules/verification/Panel",
      icon: "ShieldCheck",
    },
    requiresAuth: true,
    permissions: [],
    runtime: "typescript",
  },
  capabilities: {
    verify: async (rawInput, ctx): Promise<SkillResult<VerificationOutput>> => {
      const ts = Date.now();
      const parsed = VerificationInputSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          ok: false,
          error: { code: "INVALID_INPUT", message: parsed.error.message },
          trace: [{ step: "validate", ts }],
        };
      }
      const output = verifyIdentity(parsed.data);
      const endTs = Date.now();
      ctx.emit({
        type: "skill.end",
        moduleId: "verification",
        capability: "verify",
        ts: endTs,
        durationMs: endTs - ts,
      });

      const entry: ContextEntry = {
        id: nanoid(),
        ts: endTs,
        source: "skill",
        moduleId: "verification",
        capability: "verify",
        kind: "output",
        payload: { input: parsed.data, output },
        refs: [],
        summary: `Verificatie ${output.status} (${(output.confidence * 100).toFixed(0)}%) · ${output.reference}`,
      };

      return {
        ok: true,
        data: output,
        contextDelta: {
          history: [entry],
          variables: {
            lastVerification: {
              name: "lastVerification",
              value: { status: output.status, confidence: output.confidence, reference: output.reference },
              sourceEntryId: entry.id,
              ts: endTs,
            },
          },
        },
        trace: [
          { step: "validate", ts },
          { step: "checks", ts: endTs },
        ],
      };
    },
  },
};
