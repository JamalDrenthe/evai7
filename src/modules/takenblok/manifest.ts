import { ListTodo } from "lucide-react";
import type { FrontendModuleManifest } from "../_types";

export const frontendManifest: FrontendModuleManifest = {
  id: "takenblok",
  name: "Takenblok",
  type: "tool",
  description: "Takenblok task management tool - source code pending from user",
  icon: ListTodo,
  color: "#64748b",
  panel: () => import("./Panel"),
  contextCard: () => import("./ContextCard"),
};
