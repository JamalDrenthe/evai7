import { TrendingUp } from "lucide-react";
import type { FrontendModuleManifest } from "../_types";

export const frontendManifest: FrontendModuleManifest = {
  id: "estate-calculator",
  name: "Estate Calculator",
  type: "calculator",
  description: "Vastgoed Vliegwiel — bereken acquisitiekracht met inkomende/uitgaande huur en borg.",
  icon: TrendingUp,
  color: "#2563eb",
  panel: () => import("./Panel"),
  contextCard: () => import("./ContextCard"),
};
