import { Disc } from "lucide-react";
import type { FrontendModuleManifest } from "../_types";

export const frontendManifest: FrontendModuleManifest = {
  id: "mining-calculator",
  name: "Mining Calculator",
  type: "calculator",
  description: "Streaming inkomsten: catalogus-doelen, platform-verdeling én stream-farm opbrengsten.",
  icon: Disc,
  color: "#d68706",
  panel: () => import("./Panel"),
  contextCard: () => import("./ContextCard"),
};
