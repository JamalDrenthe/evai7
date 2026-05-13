import { useState } from "react";
import { Search, Shield } from "lucide-react";
import { trpc } from "@/providers/trpc";

type Tab = "module-runs" | "workflow-runs" | "sessions";

export default function Admin() {
  const [tab, setTab] = useState<Tab>("module-runs");
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/30">
            <Shield className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Console</h1>
            <p className="text-sm text-slate-400">Audit logs and system monitoring</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex border-b border-slate-800">
            <TabButton active={tab === "module-runs"} onClick={() => setTab("module-runs")}>
              Module Runs
            </TabButton>
            <TabButton active={tab === "workflow-runs"} onClick={() => setTab("workflow-runs")}>
              Workflow Runs
            </TabButton>
            <TabButton active={tab === "sessions"} onClick={() => setTab("sessions")}>
              Sessions
            </TabButton>
          </div>

          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            {tab === "module-runs" && <ModuleRunsTable search={search} />}
            {tab === "workflow-runs" && <WorkflowRunsTable search={search} />}
            {tab === "sessions" && <SessionsTable search={search} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
        active
          ? "text-cyan-300 border-b-2 border-cyan-400 bg-cyan-500/5"
          : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

function ModuleRunsTable({ search }: { search: string }) {
  const query = trpc.admin.listModuleRuns.useQuery({ search });

  if (query.isLoading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (!query.data?.length) {
    return <div className="text-center py-8 text-slate-500">No module runs found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
            <th className="pb-3 pr-4">ID</th>
            <th className="pb-3 pr-4">Session ID</th>
            <th className="pb-3 pr-4">Module</th>
            <th className="pb-3 pr-4">Capability</th>
            <th className="pb-3 pr-4">Duration</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 pr-4">Created</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {query.data.map((run) => (
            <tr key={run.id} className="border-b border-slate-800/50 hover:bg-slate-800/50">
              <td className="py-3 pr-4 font-mono text-slate-400">{run.id}</td>
              <td className="py-3 pr-4 font-mono text-slate-400">{run.sessionId}</td>
              <td className="py-3 pr-4 text-white">{run.moduleId}</td>
              <td className="py-3 pr-4 text-slate-300">{run.capability}</td>
              <td className="py-3 pr-4 text-slate-300">{run.durationMs}ms</td>
              <td className="py-3 pr-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    run.ok
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-rose-500/10 text-rose-300"
                  }`}
                >
                  {run.ok ? "Success" : "Error"}
                </span>
              </td>
              <td className="py-3 pr-4 text-slate-400">
                {run.createdAt ? new Date(run.createdAt).toLocaleString() : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WorkflowRunsTable({ search }: { search: string }) {
  const query = trpc.admin.listWorkflowRuns.useQuery({ search });

  if (query.isLoading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (!query.data?.length) {
    return <div className="text-center py-8 text-slate-500">No workflow runs found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
            <th className="pb-3 pr-4">ID</th>
            <th className="pb-3 pr-4">Session ID</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 pr-4">Steps</th>
            <th className="pb-3 pr-4">Created</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {query.data.map((run) => (
            <tr key={run.id} className="border-b border-slate-800/50 hover:bg-slate-800/50">
              <td className="py-3 pr-4 font-mono text-slate-400">{run.id}</td>
              <td className="py-3 pr-4 font-mono text-slate-400">{run.sessionId}</td>
              <td className="py-3 pr-4">
                <span className="px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-300">
                  {run.status}
                </span>
              </td>
              <td className="py-3 pr-4 text-slate-300">{Array.isArray(run.steps) ? run.steps.length : 0}</td>
              <td className="py-3 pr-4 text-slate-400">
                {run.createdAt ? new Date(run.createdAt).toLocaleString() : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SessionsTable({ search }: { search: string }) {
  const query = trpc.admin.listSessions.useQuery({ search });

  if (query.isLoading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (!query.data?.length) {
    return <div className="text-center py-8 text-slate-500">No sessions found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
            <th className="pb-3 pr-4">ID</th>
            <th className="pb-3 pr-4">User ID</th>
            <th className="pb-3 pr-4">Mode</th>
            <th className="pb-3 pr-4">Started</th>
            <th className="pb-3 pr-4">Ended</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {query.data.map((session) => (
            <tr key={session.id} className="border-b border-slate-800/50 hover:bg-slate-800/50">
              <td className="py-3 pr-4 font-mono text-slate-400">{session.id}</td>
              <td className="py-3 pr-4 font-mono text-slate-400">{session.userId}</td>
              <td className="py-3 pr-4 text-slate-300 capitalize">{session.mode}</td>
              <td className="py-3 pr-4 text-slate-400">
                {session.startedAt ? new Date(session.startedAt).toLocaleString() : "-"}
              </td>
              <td className="py-3 pr-4 text-slate-400">
                {session.endedAt ? new Date(session.endedAt).toLocaleString() : "Active"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
