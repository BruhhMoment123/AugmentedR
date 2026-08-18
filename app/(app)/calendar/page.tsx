'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import { MOCK_EVENTS } from '@/lib/mockData';
import { getUser } from '@/lib/auth';
import { getCustomEvents, saveEvent, deleteEvent } from '@/lib/teacherStore';
import type { CalendarEvent, User } from '@/lib/mockData';
import {
  CalendarBlank, Plus, X, CalendarCheck, ChalkboardTeacher,
  BookOpen, PencilSimple, Flask, ClipboardText, CheckCircle,
  Trash, SmileyMeh, CaretLeft, CaretRight,
} from '@phosphor-icons/react';

// Map each event type to a Phosphor icon
const TYPE_ICONS: Record<CalendarEvent['type'], React.ReactNode> = {
  lesson:     <BookOpen     weight="fill" size={22} />,
  quiz:       <PencilSimple weight="fill" size={22} />,
  lab:        <Flask        weight="fill" size={22} />,
  assignment: <ClipboardText weight="fill" size={22} />,
};

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const TYPE_COLORS: Record<CalendarEvent['type'], string> = {
  lesson:     '#60a5fa',
  quiz:       '#f87171',
  lab:        '#4ade80',
  assignment: '#fbbf24',
};
// Keep emoji for data stored in events (used in saved CalendarEvent objects)
const TYPE_EMOJIS: Record<CalendarEvent['type'], string> = {
  lesson: '📖', quiz: '📝', lab: '🔬', assignment: '📋',
};

// ─── Add Event Modal (teacher only) ──────────────────────────────────────────
function AddEventModal({ teacher, selectedDate, onClose, onAdd }: {
  teacher: User;
  selectedDate: string;
  onClose: () => void;
  onAdd: (e: CalendarEvent) => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState('10:00');
  const [type, setType] = useState<CalendarEvent['type']>('lesson');

  function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  function handleSave() {
    if (!title.trim()) return;
    const event: CalendarEvent = {
      id: `ev_${Date.now()}`,
      title: title.trim(),
      subject: 'Biology',
      emoji: TYPE_EMOJIS[type],
      color: TYPE_COLORS[type],
      date,
      time: formatTime(time),
      type,
      teacher: teacher.name,
    };
    saveEvent(event);
    onAdd(event);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end p-4 animate-fade-in"
      onClick={onClose}>
      <div className="kid-card w-full p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarCheck weight="fill" size={22} color="#60a5fa" />
            <h2 className="text-xl font-black text-white">Schedule a Class</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors">
            <X weight="bold" size={20} color="rgba(255,255,255,0.5)" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Event type */}
          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {(['lesson','quiz','lab','assignment'] as const).map((t) => (
                <button key={t} type="button"
                  id={`event-type-${t}`}
                  onClick={() => setType(t)}
                  className="py-2.5 rounded-2xl font-bold text-xs flex flex-col items-center gap-1 transition-all"
                  style={{
                    background: type === t ? `${TYPE_COLORS[t]}20` : 'rgba(255,255,255,0.04)',
                    color: type === t ? TYPE_COLORS[t] : 'rgba(255,255,255,0.4)',
                    border: `2px solid ${type === t ? TYPE_COLORS[t] : 'transparent'}`,
                    fontFamily: 'var(--font-nunito)',
                  }}>
                  <span style={{ color: type === t ? TYPE_COLORS[t] : 'rgba(255,255,255,0.35)' }}>
                    {TYPE_ICONS[t]}
                  </span>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Title *</label>
            <input id="new-event-title" className="kid-input"
              placeholder={`e.g. ${type === 'quiz' ? 'Cell Organelles Quiz' : type === 'lab' ? 'AR Lab Session' : type === 'assignment' ? 'Chapter Summary Due' : 'Introduction to DNA'}`}
              value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Date</label>
              <input id="new-event-date" type="date" className="kid-input"
                value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Time</label>
              <input id="new-event-time" type="time" className="kid-input"
                value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-2xl flex items-center gap-3"
            style={{ background: `${TYPE_COLORS[type]}10`, border: `1px solid ${TYPE_COLORS[type]}30` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${TYPE_COLORS[type]}20`, color: TYPE_COLORS[type] }}>
              {TYPE_ICONS[type]}
            </div>
            <div>
              <p className="font-black text-white text-sm">{title || 'Event Title'}</p>
              <p className="text-white/40 text-xs">{date} · {formatTime(time)} · {teacher.name}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" className="kid-btn kid-btn--ghost flex-1" onClick={onClose}>Cancel</button>
            <button id="new-event-save" type="button"
              className="kid-btn flex-1 flex items-center justify-center gap-2"
              disabled={!title.trim()}
              style={{
                background: TYPE_COLORS[type],
                color: '#fff',
                boxShadow: `0 4px 0 ${TYPE_COLORS[type]}88`,
                opacity: title.trim() ? 1 : 0.4,
                fontFamily: 'var(--font-nunito)',
              }}
              onClick={handleSave}>
              <CheckCircle weight="fill" size={18} />
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [user, setUser] = useState<User | null>(null);
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);

  useEffect(() => {
    setUser(getUser());
    setCustomEvents(getCustomEvents());
  }, []);

  const isTeacher = user?.role === 'teacher';
  const allEvents = [...MOCK_EVENTS, ...customEvents];

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  function prevMonth() { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); }
  function dateStr(day: number) { return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }
  function eventsOnDay(day: number) { return allEvents.filter((e) => e.date === dateStr(day)); }

  const selectedEvents = allEvents.filter((e) => e.date === selectedDate);

  function handleDeleteEvent(id: string) {
    deleteEvent(id);
    setCustomEvents(getCustomEvents());
  }

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in" style={{ fontFamily: 'var(--font-nunito)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/50 text-sm font-semibold">{isTeacher ? 'Manage Schedule' : 'Your Schedule'}</p>
          <div className="flex items-center gap-2">
            <CalendarBlank weight="fill" size={26} color="#ce82ff" />
            <h1 className="text-2xl font-black text-white">Calendar</h1>
          </div>
        </div>
        {isTeacher && (
          <button id="cal-add-event-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm"
            style={{ background: '#60a5fa22', color: '#60a5fa', border: '1.5px solid #60a5fa44' }}>
            <Plus weight="bold" size={16} />
            Schedule
          </button>
        )}
      </div>

      {/* Teacher banner */}
      {isTeacher && (
        <div className="mb-5 p-3 rounded-2xl flex items-center gap-3"
          style={{ background: '#60a5fa12', border: '1px solid #60a5fa30' }}>
          <ChalkboardTeacher weight="fill" size={22} color="#60a5fa" />
          <p className="text-xs font-bold text-[#60a5fa]">
            Teacher Mode — tap “Schedule” to add lessons, quizzes or labs for your class.
          </p>
        </div>
      )}

      {/* Calendar Card */}
      <div className="kid-card p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <button id="cal-prev" onClick={prevMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <CaretLeft weight="bold" size={18} />
          </button>
          <h2 className="font-black text-white text-lg">{MONTH_NAMES[month]} {year}</h2>
          <button id="cal-next" onClick={nextMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <CaretRight weight="bold" size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-black text-white/30 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const ds = dateStr(day);
            const isToday = ds === today.toISOString().split('T')[0];
            const isSelected = ds === selectedDate;
            const dayEvents = eventsOnDay(day);

            return (
              <button key={day} id={`cal-day-${day}`}
                onClick={() => setSelectedDate(ds)}
                className="relative flex flex-col items-center justify-center rounded-xl py-2 transition-all"
                style={{
                  background: isSelected ? '#4ade80' : isToday ? '#4ade8020' : 'transparent',
                  color: isSelected ? '#0d2d1a' : isToday ? '#4ade80' : 'rgba(255,255,255,0.8)',
                  fontWeight: isToday || isSelected ? 900 : 600,
                  fontSize: 14,
                }}>
                {day}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div key={ev.id} className="w-1.5 h-1.5 rounded-full"
                        style={{ background: isSelected ? '#0d2d1a66' : TYPE_COLORS[ev.type] }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events for selected date */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black text-white">
            {selectedDate === today.toISOString().split('T')[0] ? "Today's Events" : `Events — ${selectedDate}`}
          </h2>
          {isTeacher && (
            <button onClick={() => { setShowAddModal(true); }}
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: '#60a5fa15', color: '#60a5fa' }}>
              + Add here
            </button>
          )}
        </div>

        {selectedEvents.length === 0 ? (
          <div className="kid-card p-8 flex flex-col items-center gap-3">
            {isTeacher
              ? <ClipboardText weight="fill" size={52} color="rgba(255,255,255,0.15)" />
              : <SmileyMeh    weight="fill" size={52} color="rgba(255,255,255,0.15)" />
            }
            <p className="text-white/40 font-bold text-sm text-center">
              {isTeacher
                ? 'No classes here yet.\nTap "Schedule" to add one.'
                : 'Nothing on this day.\nEnjoy the free time!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedEvents.map((event, i) => {
              const isCustom = customEvents.find((e) => e.id === event.id);
              return (
                <div key={event.id} id={`event-${event.id}`}
                  className="kid-card p-4 flex items-center gap-4 animate-slide-up"
                  style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="w-1.5 self-stretch rounded-full flex-shrink-0"
                    style={{ background: TYPE_COLORS[event.type] }} />
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${event.color}20`, color: event.color }}>
                    {TYPE_ICONS[event.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-sm">{event.title}</p>
                    <p className="text-white/40 text-xs font-semibold">{event.time}</p>
                    <p className="text-white/30 text-xs">{event.teacher}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="pill" style={{ background: `${TYPE_COLORS[event.type]}20`, color: TYPE_COLORS[event.type] }}>
                      {event.type}
                    </span>
                    {isTeacher && isCustom && (
                      <button id={`event-${event.id}-delete`}
                        onClick={() => handleDeleteEvent(event.id)}
                        className="flex items-center gap-1 text-xs font-bold"
                        style={{ color: 'rgba(255,75,75,0.5)' }}>
                        <Trash weight="fill" size={13} />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && user && (
        <AddEventModal
          teacher={user}
          selectedDate={selectedDate}
          onClose={() => setShowAddModal(false)}
          onAdd={(e) => setCustomEvents((prev) => [...prev, e])}
        />
      )}
    </div>
  );
}
