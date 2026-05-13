import { lazy } from "react";
import type { ComponentType } from "react";
import type { FrontendModuleManifest, PanelProps, ContextCardProps } from "./_types";
import { frontendManifest as zzpManifest } from "./zzp-netto-calculator/manifest";
import { frontendManifest as tgcManifest } from "./tgc-chatbot/manifest";
import { frontendManifest as orgManifest } from "./organogram/manifest";
import { frontendManifest as vvcManifest } from "./vvc-calculator/manifest";
import { frontendManifest as miningManifest } from "./mining-calculator/manifest";
import { frontendManifest as estateManifest } from "./estate-calculator/manifest";
import { frontendManifest as takenblokManifest } from "./takenblok/manifest";
import { frontendManifest as vvcChatbotManifest } from "./vvc-chatbot/manifest";
import { frontendManifest as ecosysteemManifest } from "./ecosysteem-chatbot/manifest";
import { frontendManifest as visualizationManifest } from "./visualization/manifest";
import { frontendManifest as verificationManifest } from "./verification/manifest";
import { frontendManifest as voiceVerificationManifest } from "./voice-verification/manifest";

const all: FrontendModuleManifest[] = [zzpManifest, tgcManifest, orgManifest, vvcManifest, miningManifest, estateManifest, takenblokManifest, vvcChatbotManifest, ecosysteemManifest, visualizationManifest, verificationManifest, voiceVerificationManifest];

// Pre-create lazy components at module init so React keeps stable references
// across renders. Recreating lazy() during render resets state.
const panelCache: Record<string, ComponentType<PanelProps>> = {};
const cardCache: Record<string, ComponentType<ContextCardProps>> = {};

for (const m of all) {
  panelCache[m.id] = lazy(m.panel) as unknown as ComponentType<PanelProps>;
  if (m.contextCard) {
    cardCache[m.id] = lazy(m.contextCard) as unknown as ComponentType<ContextCardProps>;
  }
}

export function listFrontendModules(): FrontendModuleManifest[] {
  return all;
}

export function getFrontendModule(id: string): FrontendModuleManifest | null {
  return all.find((m) => m.id === id) ?? null;
}

export function getModulePanel(id: string): ComponentType<PanelProps> | null {
  return panelCache[id] ?? null;
}

export function getModuleContextCard(
  id: string,
): ComponentType<ContextCardProps> | null {
  return cardCache[id] ?? null;
}
