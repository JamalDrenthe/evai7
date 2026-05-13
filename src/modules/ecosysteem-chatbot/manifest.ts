import { MessageSquare } from "lucide-react";
import type { FrontendModuleManifest } from "../_types";

export const frontendManifest: FrontendModuleManifest = {
  id: "ecosysteem-chatbot",
  name: "Ecosysteem Chatbot",
  type: "chatbot",
  description: "Ecosysteem meta chatbot - source code pending from user",
  icon: MessageSquare,
  color: "#64748b",
  panel: () => import("./Panel"),
  contextCard: () => import("./ContextCard"),
};
