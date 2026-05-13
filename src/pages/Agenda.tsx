import { useMemo, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Trash2,
} from "lucide-react";

type EventType = "meeting" | "deadline" | "reminder" | "task";

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

const typeLabels: Record<string, string> = {
  meeting: "Meeting",
  deadline: "Deadline",
  reminder: "Herinnering",
  task: "Taak",
};

const monthNames = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];
const dayNamesShort = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

type AgendaEvent = {
  id: number;
  title: string;
  start: string | Date;
  end: string | Date;
  type: string;
  location?: string | null;
};

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toDate(v: string | Date): Date {
  return v instanceof Date ? v : new Date(v);
}

function RightPanel({ events, today, selectedDate, onSelectDate }: {
  events: AgendaEvent[];
  today: Date;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}) {
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  // ISO week starts Monday
  const startingDay = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const daysWithEvents = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) {
      const d = toDate(e.start);
      if (d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === selectedDate.getMonth()) {
        set.add(`${d.getDate()}`);
      }
    }
    return set;
  }, [events, selectedDate]);

  const upcoming = useMemo(() => {
    const now = today.getTime();
    return events
      .map((e) => ({ ...e, _ts: toDate(e.start).getTime() }))
      .filter((e) => e._ts >= now - 3600_000)
      .sort((a, b) => a._ts - b._ts)
      .slice(0, 5);
  }, [events, today]);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#3b82f6]/10 to-[#3b82f6]/5 rounded-2xl p-5 border border-[#3b82f6]/20">
        <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] mb-2 flex items-center gap-2">
          <CalendarDays size={16} className="text-[#3b82f6]" /> Agenda
        </h3>
        <p className="text-[12px] text-[var(--eva-text-secondary)]">
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </p>

        <div className="grid grid-cols-7 gap-1 mt-3">
          {dayNamesShort.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-[var(--eva-text-muted)] py-1">{d}</div>
          ))}
          {calendarDays.map((day, i) => {
            if (!day) return <div key={i} />;
            const dayDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
            const isToday = sameDay(dayDate, today);
            const isSelected = sameDay(dayDate, selectedDate);
            const hasEvent = daysWithEvents.has(`${day}`);
            return (
              <button
                key={i}
                onClick={() => onSelectDate(dayDate)}
                className={`relative text-center text-[11px] py-1.5 rounded-lg transition-colors ${
                  isSelected
                    ? "bg-[#3b82f6] text-white font-semibold"
                    : isToday
                      ? "bg-[#3b82f6]/15 text-[#3b82f6] font-semibold"
                      : "text-[var(--eva-text-secondary)] hover:bg-[var(--eva-canvas)]"
                }`}
              >
                {day}
                {hasEvent && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#3b82f6]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
        <h3 className="text-[11px] font-semibold text-[var(--eva-text-muted)] uppercase tracking-wider mb-3">Komende</h3>
        {upcoming.length === 0 ? (
          <p className="text-[12px] text-[var(--eva-text-muted)] py-2 text-center">Geen geplande events</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((event) => {
              const d = toDate(event.start);
              return (
                <div key={event.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--eva-canvas)] transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: typeColors[event.type] }}>
                    {typeIcons[event.type]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-[var(--eva-text-primary)] truncate">{event.title}</p>
                    <p className="text-[11px] text-[var(--eva-text-muted)]">
                      {d.toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function Agenda() {
  const today = useMemo(() => new Date(), []);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    type: "meeting" as EventType,
    location: "",
  });

  const eventsQuery = trpc.agenda.list.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const createEvent = trpc.agenda.create.useMutation({
    onSuccess: () => {
      utils.agenda.list.invalidate();
      setShowAdd(false);
      setNewEvent({ title: "", start: "", end: "", type: "meeting", location: "" });
    },
  });
  const deleteEvent = trpc.agenda.delete.useMutation({
    onSuccess: () => utils.agenda.list.invalidate(),
  });

  const events: AgendaEvent[] = (eventsQuery.data ?? []) as AgendaEvent[];

  // Calendar grid for the viewMonth (Mon-Sun)
  const monthGrid = useMemo(() => {
    const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const startingDay = (firstDay.getDay() + 6) % 7; // 0 = Monday
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const cells: ({ date: Date; inMonth: boolean })[] = [];
    // Leading days from previous month
    for (let i = startingDay; i > 0; i--) {
      const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1 - i);
      cells.push({ date: d, inMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ date: new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i), inMonth: true });
    }
    // Trailing days to complete the last row
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1].date;
      const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
      cells.push({ date: d, inMonth: false });
    }
    return cells;
  }, [viewMonth]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    for (const e of events) {
      const d = toDate(e.start);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [events]);

  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const selectedEvents = useMemo(() => {
    return (eventsByDay.get(dayKey(selectedDate)) ?? []).sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime());
  }, [eventsByDay, selectedDate]);

  const goPrevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const goNextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  const goToday = () => {
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const openAddForDate = (d: Date) => {
    const iso = (date: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    const startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0);
    const endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 10, 0);
    setNewEvent({ title: "", start: iso(startDate), end: iso(endDate), type: "meeting", location: "" });
    setShowAdd(true);
  };

  return (
    <AppLayout rightPanel={<RightPanel events={events} today={today} selectedDate={selectedDate} onSelectDate={(d) => { setSelectedDate(d); setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1)); }} />}>
      <div className="flex items-center justify-between mb-6">
        <nav className="text-[12px] text-[var(--eva-text-muted)]">
          <span className="text-[var(--eva-text-secondary)]">Agenda</span>
          <span className="mx-2">/</span>
          <span>Overzicht</span>
        </nav>
        <button
          onClick={() => openAddForDate(selectedDate)}
          className="px-4 py-2 bg-[var(--eva-primary)] text-white text-[12px] font-medium rounded-xl hover:bg-[var(--eva-primary-hover)] transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> Event toevoegen
        </button>
      </div>

      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[var(--eva-text-primary)]">Agenda</h1>
          <p className="text-[12px] text-[var(--eva-text-muted)] mt-1">
            {events.length} {events.length === 1 ? "event" : "events"} totaal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goPrevMonth} className="w-9 h-9 rounded-xl bg-white border border-[var(--eva-border-subtle)] flex items-center justify-center hover:bg-[var(--eva-canvas)] transition-colors" aria-label="Vorige maand">
            <ChevronLeft size={16} />
          </button>
          <button onClick={goToday} className="px-3 h-9 rounded-xl bg-white border border-[var(--eva-border-subtle)] text-[12px] font-medium hover:bg-[var(--eva-canvas)] transition-colors">Vandaag</button>
          <span className="text-[13px] font-medium text-[var(--eva-text-primary)] min-w-[110px] text-center">
            {monthNames[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </span>
          <button onClick={goNextMonth} className="w-9 h-9 rounded-xl bg-white border border-[var(--eva-border-subtle)] flex items-center justify-center hover:bg-[var(--eva-canvas)] transition-colors" aria-label="Volgende maand">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Add Event Form */}
      {showAdd && (
        <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--eva-text-primary)]">Nieuw event</h3>
            <button onClick={() => setShowAdd(false)} className="text-[var(--eva-text-muted)] hover:text-[var(--eva-text-primary)]" aria-label="Sluiten">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Titel"
              autoFocus
              className="px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
            />
            <input
              aria-label="Locatie"
              type="text"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="Locatie (optioneel)"
              className="px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
            />
            <input
              aria-label="Start"
              type="datetime-local"
              value={newEvent.start}
              onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
              className="px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
            />
            <input
              aria-label="Einde"
              type="datetime-local"
              value={newEvent.end}
              onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
              className="px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
            />
            <select
              aria-label="Type"
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as EventType })}
              className="px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px]"
            >
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="reminder">Herinnering</option>
              <option value="task">Taak</option>
            </select>
            <button
              disabled={!newEvent.title || !newEvent.start || !newEvent.end || createEvent.isPending}
              onClick={() => createEvent.mutate(newEvent)}
              className="px-4 py-2.5 bg-[var(--eva-primary)] text-white rounded-xl text-[13px] font-medium hover:bg-[var(--eva-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {createEvent.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Opslaan
            </button>
          </div>
          {createEvent.error && (
            <p className="mt-3 text-[11px] text-red-600">Kon event niet opslaan: {createEvent.error.message}</p>
          )}
        </div>
      )}

      {/* Monthly calendar grid */}
      <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] overflow-hidden mb-6">
        <div className="grid grid-cols-7 border-b border-[var(--eva-border-subtle)]">
          {dayNamesShort.map((d) => (
            <div key={d} className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--eva-text-muted)]">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {monthGrid.map((cell, idx) => {
            const dayEvents = eventsByDay.get(dayKey(cell.date)) ?? [];
            const isToday = sameDay(cell.date, today);
            const isSelected = sameDay(cell.date, selectedDate);
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(cell.date)}
                onDoubleClick={() => openAddForDate(cell.date)}
                className={`min-h-[88px] p-2 text-left border-r border-b border-[var(--eva-border-subtle)] last:border-r-0 transition-colors ${
                  isSelected
                    ? "bg-[var(--eva-canvas)] ring-2 ring-inset ring-[var(--eva-accent)]/30"
                    : "hover:bg-[var(--eva-canvas)]"
                } ${cell.inMonth ? "" : "opacity-40"}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[12px] font-medium ${isToday ? "inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--eva-accent)] text-white" : "text-[var(--eva-text-primary)]"}`}>
                    {cell.date.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--eva-canvas)] text-[var(--eva-text-muted)]">{dayEvents.length}</span>
                  )}
                </div>
                <div className="mt-1.5 space-y-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded truncate"
                      style={{ backgroundColor: `${typeColors[ev.type] ?? "#3b82f6"}20`, color: typeColors[ev.type] ?? "#3b82f6" }}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-[var(--eva-text-muted)] pl-1.5">+{dayEvents.length - 3} meer</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--eva-text-primary)]">
            {selectedDate.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
          </h3>
          <button
            onClick={() => openAddForDate(selectedDate)}
            className="text-[11px] font-medium text-[var(--eva-accent)] hover:underline flex items-center gap-1"
          >
            <Plus size={12} /> Toevoegen op deze dag
          </button>
        </div>

        {eventsQuery.isLoading ? (
          <div className="py-6 text-center text-[12px] text-[var(--eva-text-muted)] flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Events laden…
          </div>
        ) : selectedEvents.length > 0 ? (
          <div className="space-y-2">
            {selectedEvents.map((event) => {
              const d = toDate(event.start);
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--eva-canvas)] transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: typeColors[event.type] || "#3b82f6" }}
                  >
                    {typeIcons[event.type] || <CalendarDays size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[var(--eva-text-primary)] truncate">{event.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-[var(--eva-text-muted)] flex items-center gap-1">
                        <Clock size={11} />
                        {d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
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
                    {typeLabels[event.type] ?? event.type}
                  </span>
                  <button
                    onClick={() => deleteEvent.mutate({ id: event.id })}
                    className="opacity-0 group-hover:opacity-100 text-[var(--eva-text-muted)] hover:text-red-500 transition-all"
                    aria-label="Event verwijderen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[var(--eva-canvas)] flex items-center justify-center">
              <CalendarDays size={20} className="text-[var(--eva-text-muted)]" />
            </div>
            <p className="text-sm text-[var(--eva-text-primary)] font-medium">Geen events op deze dag</p>
            <p className="text-[11px] text-[var(--eva-text-muted)] mt-1">Dubbelklik op een dag in de kalender om snel een event toe te voegen.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
