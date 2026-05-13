import { Calculator } from "lucide-react";
import type { FrontendModuleManifest } from "../_types";

export const frontendManifest: FrontendModuleManifest = {
  id: "zzp-netto-calculator",
  name: "ZZP Netto Calculator",
  type: "calculator",
  description: "Bereken je netto inkomen als ZZP'er.",
  icon: Calculator,
  color: "#6366f1",
  panel: () => import("./Panel"),
  contextCard: () => import("./ContextCard"),
};
