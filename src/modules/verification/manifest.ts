import { ShieldCheck } from "lucide-react";
import type { FrontendModuleManifest } from "../_types";

export const frontendManifest: FrontendModuleManifest = {
  id: "verification",
  name: "Verification",
  type: "verification",
  description: "Verification tool - source code pending from user",
  icon: ShieldCheck,
  color: "#64748b",
  panel: () => import("./Panel"),
  contextCard: () => import("./ContextCard"),
};
