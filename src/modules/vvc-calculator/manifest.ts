import { Calculator } from "lucide-react";
import type { FrontendModuleManifest } from "../_types";

export const frontendManifest: FrontendModuleManifest = {
  id: "vvc-calculator",
  name: "VVC Calculator",
  type: "calculator",
  description: "Bereken inkomsten voor de Verdienende Vrienden Club",
  icon: Calculator,
  color: "#EAB308",
  panel: () => import("./Panel"),
  contextCard: () => import("./ContextCard"),
};
