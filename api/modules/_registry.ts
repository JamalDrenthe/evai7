import type { Skill } from "../../contracts/skill";
import type { ModuleManifest } from "../../contracts/module-manifest";
import { ModuleManifestSchema } from "../../contracts/module-manifest";

import { skill as zzpSkill } from "./zzp-netto-calculator/skill";
import { skill as tgcSkill } from "./tgc-chatbot/skill";
import { skill as orgSkill } from "./organogram/skill";
import { skill as vvcSkill } from "./vvc-calculator/skill";
import { skill as miningSkill } from "./mining-calculator/skill";
import { skill as estateSkill } from "./estate-calculator/skill";
import { skill as takenblokSkill } from "./takenblok/skill";
import { skill as vvcChatbotSkill } from "./vvc-chatbot/skill";
import { skill as ecosysteemSkill } from "./ecosysteem-chatbot/skill";
import { skill as visualizationSkill } from "./visualization/skill";
import { skill as verificationSkill } from "./verification/skill";
import { skill as voiceVerificationSkill } from "./voice-verification/skill";

const allSkills: Skill[] = [
  zzpSkill as unknown as Skill,
  tgcSkill as unknown as Skill,
  orgSkill as unknown as Skill,
  vvcSkill as unknown as Skill,
  miningSkill as unknown as Skill,
  estateSkill as unknown as Skill,
  takenblokSkill as unknown as Skill,
  vvcChatbotSkill as unknown as Skill,
  ecosysteemSkill as unknown as Skill,
  visualizationSkill as unknown as Skill,
  verificationSkill as unknown as Skill,
  voiceVerificationSkill as unknown as Skill,
];

class ModuleRegistry {
  private skills = new Map<string, Skill>();
  private manifests = new Map<string, ModuleManifest>();

  constructor(skills: Skill[]) {
    for (const skill of skills) {
      const parsed = ModuleManifestSchema.safeParse(skill.manifest);
      if (!parsed.success) {
        console.error(
          `[registry] Invalid manifest for ${skill.manifest?.id ?? "unknown"}:`,
          parsed.error.message,
        );
        continue;
      }
      this.skills.set(skill.manifest.id, skill);
      this.manifests.set(skill.manifest.id, skill.manifest);
      console.log(`[registry] Registered module: ${skill.manifest.id} (${skill.manifest.type})`);
    }
  }

  list(): ModuleManifest[] {
    return Array.from(this.manifests.values());
  }

  get(moduleId: string): { skill: Skill; manifest: ModuleManifest } | null {
    const skill = this.skills.get(moduleId);
    const manifest = this.manifests.get(moduleId);
    if (!skill || !manifest) return null;
    return { skill, manifest };
  }

  filterByType(type: ModuleManifest["type"]): ModuleManifest[] {
    return this.list().filter((m) => m.type === type);
  }
}

let _registry: ModuleRegistry | null = null;

export function getModuleRegistry(): ModuleRegistry {
  if (!_registry) {
    _registry = new ModuleRegistry(allSkills);
  }
  return _registry;
}
