import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { trpc } from "@/providers/trpc";
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Video,
  Briefcase,
  AlertCircle,
} from "lucide-react";

const typeIcons: Record<string, React.ReactNode> = {
  meeting: <Video size={14} />,
  deadline: <AlertCircle size={14} />,
  reminder: <Clock size={14} />,
  task: <Briefcase size={14} />,
};

const typeColors: Record<string, string> = {
  meeting: "#3b82f6",
  deadline: "#ef4444",
  reminder: "#f59e0b",
  task: "#10b981",
};

function RightPanel() {
  const today = new Date();
  const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
  const monthNames = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];

  // Mini calendar
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < startingDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#3b82f6]/10 to-[#3b82f6]/5 rounded-2xl p-5 border border-[#3b82f6]/20">
        <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] mb-2 flex items-center gap-2">
          <CalendarDays size={16} className="text-[#3b82f6]" /> Agenda
        </h3>
        <p className="text-[12px] text-[var(--eva-text-secondary)]">
          {monthNames[today.getMonth()]} {today.getFullYear()}
        </p>

        {/* Mini calendar grid */}
        <div className="grid grid-cols-7 gap-1 mt-3">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-[var(--eva-text-muted)] py-1">{d}</div>
          ))}
          {calendarDays.map((day, i) => (
            <div
              key={i}
              className={`text-center text-[11px] py-1.5 rounded-lg ${
                day === today.getDate()
                  ? "bg-[#3b82f6] text-white font-semibold"
                  : day
                  ? "text-[var(--eva-text-secondary)] hover:bg-[var(--eva-canvas)]"
                  : ""
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
        <h3 className="text-[11px] font-semibold text-[var(--eva-text-muted)] uppercase tracking-wider mb-3">Komende</h3>
        <div className="space-y-2">
          {[
            { title: "Teamoverleg", time: "14:00 - 15:00", type: "meeting" as const },
            { title: "Eva Launch", time: "23:59", type: "deadline" as const },
          ].map((event, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--eva-canvas)] transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: typeColors[event.type] }}>
                {typeIcons[event.type]}
              </div>
              <div>
                <p className="text-[12px] font-medium text-[var(--eva-text-primary)]">{event.title}</p>
                <p className="text-[11px] text-[var(--eva-text-muted)]">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Agenda() {
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    type: "meeting" as const,
    location: "",
  });

  const eventsQuery = trpc.agenda.list.useQuery();
  const createEvent = trpc.agenda.create.useMutation({
    onSuccess: () => {
      eventsQuery.refetch();
      setShowAdd(false);
      setNewEvent({ title: "", start: "", end: "", type: "meeting", location: "" });
    },
  });

  const events = eventsQuery.data ?? [];

  return (
    <AppLayout rightPanel={<RightPanel />}>
      <div className="flex items-center justify-between mb-6">
        <nav className="text-[12px] text-[var(--eva-text-muted)]">
          <span className="text-[var(--eva-text-secondary)]">Agenda</span>
          <span className="mx-2">/</span>
          <span>Overzicht</span>
        </nav>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-[var(--eva-primary)] text-white text-[12px] font-medium rounded-xl hover:bg-[var(--eva-primary-hover)] transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> Event toevoegen
        </button>
      </div>

      <h1 className="text-xl font-semibold text-[var(--eva-text-primary)] mb-6">Agenda</h1>

      {/* Add Event Form */}
      {showAdd && (
        <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5 mb-6">
          <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] mb-3">Nieuw event</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Titel"
              className="px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
            />
            <input
              type="datetime-local"
              value={newEvent.start}
              onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
              className="px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
            />
            <input
              type="datetime-local"
              value={newEvent.end}
              onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
              className="px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
            />
            <select
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
              className="px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px]"
            >
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="reminder">Herinnering</option>
              <option value="task">Taak</option>
            </select>
            <input
              type="text"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="Locatie"
              className="px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
            />
            <button
              onClick={() => newEvent.title && newEvent.start && newEvent.end && createEvent.mutate(newEvent)}
              className="px-4 py-2.5 bg-[var(--eva-primary)] text-white rounded-xl text-[13px] font-medium hover:bg-[var(--eva-primary-hover)] transition-colors"
            >
              Opslaan
            </button>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4 flex items-center gap-4 hover:border-[var(--eva-accent)]/30 transition-all"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: typeColors[event.type] || "#3b82f6" }}
              >
                {typeIcons[event.type] || <CalendarDays size={18} />}
              </div>
              <div className="flex-1">
                <h3 className="text-[14px] font-semibold text-[var(--eva-text-primary)]">{event.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-[var(--eva-text-muted)] flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(event.start).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {event.location && (
                    <span className="text-[11px] text-[var(--eva-text-muted)] flex items-center gap-1">
                      <MapPin size={11} /> {event.location}
                    </span>
                  )}
                </div>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  backgroundColor: `${typeColors[event.type] || "#3b82f6"}20`,
                  color: typeColors[event.type] || "#3b82f6",
                }}
              >
                {event.type}
              </span>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-8 text-center">
            <CalendarDays size={32} className="mx-auto text-[var(--eva-text-muted)] mb-2" />
            <p className="text-sm text-[var(--eva-text-muted)]">Geen events gepland</p>
            <p className="text-[11px] text-[var(--eva-text-secondary)] mt-1">Voeg je eerste event toe</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
