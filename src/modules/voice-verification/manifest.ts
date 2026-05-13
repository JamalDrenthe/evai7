import { Mic } from "lucide-react";
import type { FrontendModuleManifest } from "../_types";

export const frontendManifest: FrontendModuleManifest = {
  id: "voice-verification",
  name: "Voice Verification",
  type: "verification",
  description: "Voice verification via Python sidecar - source code pending from user",
  icon: Mic,
  color: "#64748b",
  panel: () => import("./Panel"),
  contextCard: () => import("./ContextCard"),
};
