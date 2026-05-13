import type { ComponentType, LazyExoticComponent } from "react";
import type { LucideIcon } from "lucide-react";
import type { ModuleType } from "../../contracts/module-manifest";

export type FrontendModuleManifest = {
  id: string;
  name: string;
  type: ModuleType;
  description: string;
  icon: LucideIcon;
  color?: string;
  panel: () => Promise<{ default: ComponentType<PanelProps> }>;
  contextCard?: () => Promise<{ default: ComponentType<ContextCardProps> }>;
};

export type PanelProps = {
  initialInput?: unknown;
  onResult?: (result: { capability: string; output: unknown }) => void;
};

export type ContextCardProps = {
  payload: unknown;
  ts: number;
};

export type LoadedFrontendModule = FrontendModuleManifest & {
  loadedPanel?: ComponentType<PanelProps>;
  loadedContextCard?: ComponentType<ContextCardProps>;
};

export type LazyComponent<P> = LazyExoticComponent<ComponentType<P>>;
