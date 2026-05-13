import { Routes, Route } from "react-router";
import { TRPCProvider } from "@/providers/trpc";
import AuthLayout from "@/components/AuthLayout";
import { Login } from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import { Dashboard } from "@/pages/Dashboard";
import { Workspace } from "@/pages/Workspace";
import { Tools } from "@/pages/Tools";
import { ToolDetail } from "@/pages/ToolDetail";
import { Shortcuts } from "@/pages/Shortcuts";
import { Organigram } from "@/pages/Organigram";
import { Work } from "@/pages/Work";
import { Agenda } from "@/pages/Agenda";
import { Account } from "@/pages/Account";
import { Security } from "@/pages/Security";

function App() {
  return (
    <TRPCProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/workspace/docs" element={<Workspace />} />
          <Route path="/workspace/brainstorm" element={<Workspace />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/shortcuts" element={<Shortcuts />} />
          <Route path="/tools/:slug" element={<ToolDetail />} />
          <Route path="/organigram" element={<Organigram />} />
          <Route path="/werk" element={<Work />} />
          <Route path="/werk/team" element={<Work />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/password" element={<Account />} />
          <Route path="/account/notifications" element={<Account />} />
          <Route path="/veiligheid" element={<Security />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TRPCProvider>
  );
}

export default App;
