import { BarChart } from "lucide-react";
import type { FrontendModuleManifest } from "../_types";

export const frontendManifest: FrontendModuleManifest = {
  id: "visualization",
  name: "Visualization",
  type: "visualization",
  description: "Visualization tool - source code pending from user",
  icon: BarChart,
  color: "#64748b",
  panel: () => import("./Panel"),
  contextCard: () => import("./ContextCard"),
};
