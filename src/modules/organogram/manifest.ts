import { Network } from "lucide-react";
import type { FrontendModuleManifest } from "../_types";

export const frontendManifest: FrontendModuleManifest = {
  id: "organogram",
  name: "Organogram",
  type: "visualization",
  description: "Bedrijfsstructuur — visualisatie van rollen en hiërarchie.",
  icon: Network,
  color: "#a855f7",
  panel: () => import("./Panel"),
  contextCard: () => import("./ContextCard"),
};
