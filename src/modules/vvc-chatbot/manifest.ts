import { MessageSquare } from "lucide-react";
import type { FrontendModuleManifest } from "../_types";

export const frontendManifest: FrontendModuleManifest = {
  id: "vvc-chatbot",
  name: "VVC Chatbot",
  type: "chatbot",
  description: "Verdienende Vrienden Club — live support over verdienmodel, Double Team en cultuur.",
  icon: MessageSquare,
  color: "#ec1a89",
  panel: () => import("./Panel"),
  contextCard: () => import("./ContextCard"),
};
