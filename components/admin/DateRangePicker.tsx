'use client';

import { useState, useRef, useEffect } from 'react';
import {
  format, subDays, startOfDay, endOfDay, isSameDay,
  isToday, isWithinInterval, isBefore, isAfter,
  addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay, setMonth, setYear, getYear, getMonth,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DateRangePickerProps {
  onRangeChange: (range: { from: Date; to: Date } | null, label: string) => void;
  initialLabel?: string;
}

interface DateRange {
  from: Date | null;
  to: Date | null;
}

const TODAY = startOfDay(new Date());

const PRESETS = [
  { label: "Aujourd'hui", getValue: () => ({ from: TODAY, to: endOfDay(new Date()) }) },
  {
    label: 'Hier', getValue: () => {
      const d = subDays(new Date(), 1);
      return { from: startOfDay(d), to: endOfDay(d) };
    }
  },
  { label: '7 derniers jours', getValue: () => ({ from: startOfDay(subDays(new Date(), 7)), to: endOfDay(new Date()) }) },
  { label: '30 derniers jours', getValue: () => ({ from: startOfDay(subDays(new Date(), 30)), to: endOfDay(new Date()) }) },
  {
    label: 'Ce mois', getValue: () => {
      const now = new Date();
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
    }
  },
  {
    label: 'Mois dernier', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: startOfDay(start), to: endOfDay(end) };
    }
  },
];

const DAYS_SHORT = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

// ── Month/Year quick picker ──────────────────────────────────────────────────
function MonthYearPicker({
  current,
  onChange,
  onClose,
}: {
  current: Date;
  onChange: (d: Date) => void;
  onClose: () => void;
}) {
  const currentYear = getYear(new Date());
  const [pickerYear, setPickerYear] = useState(getYear(current));

  const years = Array.from({ length: currentYear - 2022 + 1 }, (_, i) => 2023 + i).reverse();

  return (
    <div className="absolute inset-0 bg-zinc-950 z-10 p-4 flex flex-col gap-4">
      {/* Year row */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <button onClick={() => setPickerYear(y => Math.max(2023, y - 1))}
          className="h-7 w-7 flex items-center justify-center text-white/30 hover:text-gold transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-black text-gold tracking-widest">{pickerYear}</span>
        <button onClick={() => setPickerYear(y => Math.min(currentYear, y + 1))}
          disabled={pickerYear >= currentYear}
          className="h-7 w-7 flex items-center justify-center text-white/30 hover:text-gold transition-colors disabled:opacity-20">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {MONTHS_SHORT.map((m, idx) => {
          const target = new Date(pickerYear, idx, 1);
          const isFuture = isAfter(target, endOfMonth(new Date()));
          const isActive = getMonth(current) === idx && getYear(current) === pickerYear;
          return (
            <button
              key={m}
              disabled={isFuture}
              onClick={() => { onChange(setYear(setMonth(current, idx), pickerYear)); onClose(); }}
              className={`py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all
                ${isActive ? 'bg-gold text-black' : ''}
                ${isFuture ? 'opacity-15 cursor-not-allowed' : 'hover:bg-white/5 text-white/50 hover:text-white'}
              `}
            >
              {m}
            </button>
          );
        })}
      </div>

      <button onClick={onClose}
        className="text-[9px] uppercase tracking-widest text-white/20 hover:text-white transition-colors mt-auto">
        ← Retour
      </button>
    </div>
  );
}

// ── Single month calendar ─────────────────────────────────────────────────────
function CalendarMonth({
  month, range, hoverDate,
  onDayClick, onDayHover,
  showPrev, showNext, onPrev, onNext,
  onTitleClick,
}: {
  month: Date; range: DateRange; hoverDate: Date | null;
  onDayClick: (d: Date) => void; onDayHover: (d: Date | null) => void;
  showPrev: boolean; showNext: boolean; onPrev: () => void; onNext: () => void;
  onTitleClick: () => void;
}) {
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const firstDayOfWeek = (getDay(startOfMonth(month)) + 6) % 7;

  const effectiveEnd = range.to ?? hoverDate;

  const isInRange = (d: Date) => {
    if (!range.from || !effectiveEnd) return false;
    const [s, e] = isBefore(range.from, effectiveEnd)
      ? [range.from, effectiveEnd] : [effectiveEnd, range.from];
    return isWithinInterval(d, { start: s, end: e });
  };

  const isStart = (d: Date) => !!range.from && isSameDay(d, range.from);
  const isEnd = (d: Date) => !!effectiveEnd && isSameDay(d, effectiveEnd);
  const isFuture = (d: Date) => isAfter(d, TODAY);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 h-8 gap-2">
        <div className="w-8 shrink-0">
          {showPrev && (
            <button onClick={onPrev}
              className="h-8 w-8 flex items-center justify-center border border-white/10 hover:border-gold/40 hover:text-gold text-white/30 transition-all">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={onTitleClick}
          className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-white hover:text-gold transition-colors group px-2 min-w-0"
        >
          <span className="truncate">{format(month, 'MMMM yyyy', { locale: fr })}</span>
          <ChevronDown className="h-3 w-3 text-white/30 group-hover:text-gold transition-colors shrink-0" />
        </button>

        <div className="w-8 shrink-0">
          {showNext && (
            <button onClick={onNext}
              className="h-8 w-8 flex items-center justify-center border border-white/10 hover:border-gold/40 hover:text-gold text-white/30 transition-all">
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[8px] font-black uppercase tracking-widest text-white/15 py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
        {days.map(day => {
          const future = isFuture(day);
          const start = isStart(day);
          const end = isEnd(day);
          const inRange = isInRange(day);
          const middle = inRange && !start && !end;
          const todayFlag = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`relative flex items-center justify-center h-9 ${middle ? 'bg-gold/[0.08]' : ''} ${future ? 'pointer-events-none' : 'cursor-pointer'}`}
              onClick={() => !future && onDayClick(day)}
              onMouseEnter={() => !future && onDayHover(day)}
              onMouseLeave={() => onDayHover(null)}
            >
              <span className={`
                h-8 w-8 flex items-center justify-center text-[11px] font-bold transition-all select-none
                ${future ? 'text-white/10' : ''}
                ${(start || end) ? 'bg-gold text-black font-black shadow-[0_0_14px_rgba(238,177,73,0.35)] rounded-sm' : ''}
                ${todayFlag && !start && !end ? 'text-gold border border-gold/30 rounded-sm' : ''}
                ${!start && !end && !future && !todayFlag ? 'text-white/40 hover:text-white hover:bg-white/5 rounded-sm' : ''}
              `}>
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DateRangePicker({ onRangeChange, initialLabel = '7 derniers jours' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState<DateRange>({ from: subDays(new Date(), 7), to: new Date() });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [activeLabel, setActiveLabel] = useState(initialLabel);
  const [currentMonth, setCurrentMonth] = useState(subMonths(new Date(), 1));
  const [showPickerLeft, setShowPickerLeft] = useState(false);
  const [showPickerRight, setShowPickerRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextMonth = addMonths(currentMonth, 1);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleDayClick = (day: Date) => {
    if (!range.from || (range.from && range.to)) {
      setRange({ from: day, to: null });
    } else {
      if (isBefore(day, range.from)) setRange({ from: day, to: range.from });
      else setRange({ from: range.from, to: day });
    }
  };

  const handleApply = () => {
    if (range.from && range.to) {
      const label = isSameDay(range.from, range.to)
        ? format(range.from, 'dd MMM yyyy', { locale: fr })
        : `${format(range.from, 'dd MMM', { locale: fr })} → ${format(range.to, 'dd MMM yyyy', { locale: fr })}`;
      setActiveLabel(label);
      onRangeChange({ from: range.from, to: range.to }, label);
      setIsOpen(false);
    }
  };

  const selectPreset = (preset: typeof PRESETS[0]) => {
    const val = preset.getValue();
    setRange({ from: val.from, to: val.to });
    setActiveLabel(preset.label);
    onRangeChange({ from: val.from, to: val.to }, preset.label);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* ── Trigger ── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center gap-2.5 px-4 h-[38px] border border-white/10 bg-zinc-950 hover:border-gold/40 transition-all group"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-gold/50 group-hover:text-gold transition-colors shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white whitespace-nowrap">
          {activeLabel}
        </span>
        <ChevronDown className={`w-3 h-3 text-white/15 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 z-[200] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.9)] overflow-hidden"
            style={{ minWidth: 'min(860px, 90vw)' }}
          >
            <div className="flex bg-zinc-950">

              {/* ── Calendars ── */}
              <div className="flex-1 p-6">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">
                  {!range.from ? 'Cliquez pour choisir le début' : !range.to ? 'Cliquez pour choisir la fin' : 'Période sélectionnée'}
                </p>

                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left month */}
                  <div className="flex-1 relative">
                    {showPickerLeft && (
                      <MonthYearPicker
                        current={currentMonth}
                        onChange={(d) => setCurrentMonth(startOfMonth(d))}
                        onClose={() => setShowPickerLeft(false)}
                      />
                    )}
                    <CalendarMonth
                      month={currentMonth}
                      range={range}
                      hoverDate={hoverDate}
                      onDayClick={handleDayClick}
                      onDayHover={setHoverDate}
                      showPrev={true}
                      showNext={false}
                      onPrev={() => setCurrentMonth(m => subMonths(m, 1))}
                      onNext={() => setCurrentMonth(m => addMonths(m, 1))}
                      onTitleClick={() => { setShowPickerLeft(v => !v); setShowPickerRight(false); }}
                    />
                  </div>

                  <div className="hidden lg:block w-px bg-white/5" />

                  {/* Right month */}
                  <div className="flex-1 relative">
                    {showPickerRight && (
                      <MonthYearPicker
                        current={nextMonth}
                        onChange={(d) => setCurrentMonth(startOfMonth(subMonths(d, 1)))}
                        onClose={() => setShowPickerRight(false)}
                      />
                    )}
                    <CalendarMonth
                      month={nextMonth}
                      range={range}
                      hoverDate={hoverDate}
                      onDayClick={handleDayClick}
                      onDayHover={setHoverDate}
                      showPrev={false}
                      showNext={true}
                      onPrev={() => setCurrentMonth(m => subMonths(m, 1))}
                      onNext={() => setCurrentMonth(m => addMonths(m, 1))}
                      onTitleClick={() => { setShowPickerRight(v => !v); setShowPickerLeft(false); }}
                    />
                  </div>
                </div>

                {/* Footer — selected interval + actions */}
                <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">Du</span>
                      <span className="text-[11px] font-black font-mono text-white bg-black/50 border border-white/5 px-3 py-1.5">
                        {range.from ? format(range.from, 'dd/MM/yyyy') : '—— / —— / ————'}
                      </span>
                    </div>
                    <div className="w-4 h-px bg-white/10" />
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">Au</span>
                      <span className="text-[11px] font-black font-mono text-white bg-black/50 border border-white/5 px-3 py-1.5">
                        {range.to ? format(range.to, 'dd/MM/yyyy') : '—— / —— / ————'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setRange({ from: null, to: null }); }}
                      className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                    >
                      Effacer
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white border border-white/10 hover:border-white/30 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleApply}
                      disabled={!range.from || !range.to}
                      className="px-6 py-2 bg-gold text-black text-[9px] font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                    >
                      Appliquer
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Presets sidebar ── */}
              <div className="w-44 border-l border-white/5 bg-black/20 flex flex-col shrink-0">
                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/15 px-4 pt-5 pb-3">
                  Raccourcis
                </div>
                <div className="flex flex-col gap-0.5 px-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => selectPreset(preset)}
                      className={`text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all
                        ${activeLabel === preset.label
                          ? 'bg-gold text-black'
                          : 'text-white/35 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
