import { Clock } from "lucide-react";
import type { FrontendModuleManifest } from "../_types";

export const frontendManifest: FrontendModuleManifest = {
  id: "tgc-chatbot",
  name: "TGC Chatbot",
  type: "chatbot",
  description: "Time Gap Cash Flow expert. Vraag over liquiditeit-strategieën.",
  icon: Clock,
  color: "#6366f1",
  panel: () => import("./Panel"),
  contextCard: () => import("./ContextCard"),
};
