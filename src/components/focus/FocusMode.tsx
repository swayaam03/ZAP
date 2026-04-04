import React, { useEffect, useState } from 'react';
import { useFocusSession } from '../../hooks/useFocusSession';

const PRESETS = [
  { label: 'Short', minutes: 15, icon: '🌱' },
  { label: 'Pomodoro', minutes: 25, icon: '🍅' },
  { label: 'Deep Work', minutes: 50, icon: '🔥' },
  { label: 'Custom', minutes: 0, icon: '⚙️' },
];

const BREAKS = [
  { label: 'Short Break', minutes: 5, icon: '☕' },
  { label: 'Long Break', minutes: 15, icon: '🧘' },
];

type Mode = 'focus' | 'shortBreak' | 'longBreak';

export default function FocusMode({ onXPEarned, onExit }: { onXPEarned: () => void; onExit: () => void }) {
  const [mode, setMode] = useState<Mode>('focus');
  const [preset, setPreset] = useState('Pomodoro');
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [started, setStarted] = useState(false);

  const breakMinutes = mode === 'shortBreak' ? 5 : 15;
  const activeDuration = mode === 'focus' ? selectedMinutes : breakMinutes;

  const { timer, isActive, start, pause, reset } = useFocusSession(
    mode === 'focus' ? onXPEarned : () => {},
    activeDuration
  );

  useEffect(() => {
    if (isActive) document.body.classList.add('zap-focus-mode');
    return () => document.body.classList.remove('zap-focus-mode');
  }, [isActive]);

  const handlePreset = (p: typeof PRESETS[0]) => {
    if (isActive) return;
    setPreset(p.label);
    if (p.minutes) setSelectedMinutes(p.minutes);
    setStarted(false);
  };

  const handleCustomChange = (hrs: string, mins: string) => {
    const h = parseInt(hrs) || 0;
    const m = parseInt(mins) || 0;
    const total = h * 60 + m;
    if (total > 0 && total <= 480) setSelectedMinutes(total);
  };

  const handleMode = (m: Mode) => {
    if (isActive) return;
    setMode(m);
    setStarted(false);
    reset();
  };

  const handleStart = () => { start(); setStarted(true); };
  const handleReset = () => { reset(); setStarted(false); };

  const isBreak = mode !== 'focus';
  const bgColor = isBreak ? 'bg-emerald-50' : 'bg-[#faf9f6]';
  const accentColor = isBreak ? 'text-emerald-500' : 'text-teal-600';
  const btnColor = isBreak ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-teal-500 hover:bg-teal-600';

  return (
    <div className={`flex flex-col items-center justify-center h-screen ${bgColor} relative`}>

      {/* Back button */}
      <button
        onClick={onExit}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-100 transition-colors duration-200"
      >
        ← Back to Notes
      </button>

      <div className="text-center">
        <h1 className="font-serif text-4xl text-gray-800 mb-2">⚡ Focus Mode</h1>
        <p className="text-gray-400 mb-6">Stay present. Stay productive.</p>

        {/* Mode switcher */}
        <div className="flex gap-2 justify-center mb-8">
          <button
            onClick={() => handleMode('focus')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              mode === 'focus' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            🎯 Focus
          </button>
          {BREAKS.map((b) => (
            <button
              key={b.label}
              onClick={() => handleMode(b.label === 'Short Break' ? 'shortBreak' : 'longBreak')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                (mode === 'shortBreak' && b.label === 'Short Break') || (mode === 'longBreak' && b.label === 'Long Break')
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {b.icon} {b.label} ({b.minutes}m)
            </button>
          ))}
        </div>

        {/* Focus presets */}
        {mode === 'focus' && !started && (
          <div className="flex gap-2 justify-center mb-6">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePreset(p)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  preset === p.label
                    ? 'bg-teal-100 text-teal-700 border border-teal-300'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {p.icon} {p.label}{p.minutes ? ` (${p.minutes}m)` : ''}
              </button>
            ))}
          </div>
        )}

        {/* Custom input */}
        {mode === 'focus' && preset === 'Custom' && !started && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={customHours}
                onChange={e => { setCustomHours(e.target.value); handleCustomChange(e.target.value, customMinutes); }}
                placeholder="0"
                min={0} max={8}
                className="w-16 text-center px-2 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-400"
              />
              <span className="text-gray-400 text-sm">hr</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={customMinutes}
                onChange={e => { setCustomMinutes(e.target.value); handleCustomChange(customHours, e.target.value); }}
                placeholder="0"
                min={0} max={59}
                className="w-16 text-center px-2 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-400"
              />
              <span className="text-gray-400 text-sm">min</span>
            </div>
          </div>
        )}

        {/* Timer */}
        <div className={`font-mono text-8xl ${accentColor} mb-12 tracking-wider`}>
          {timer}
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          {!isActive ? (
            <button
              onClick={handleStart}
              className={`px-8 py-4 ${btnColor} text-white rounded-xl text-lg font-medium transition-colors duration-200 shadow-sm`}
            >
              {isBreak ? '😌 Start Break' : 'Start Session'}
            </button>
          ) : (
            <button
              onClick={pause}
              className="px-8 py-4 bg-amber-400 hover:bg-amber-500 text-white rounded-xl text-lg font-medium transition-colors duration-200"
            >
              Pause
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-lg font-medium transition-colors duration-200"
          >
            Reset
          </button>
        </div>

        <p className="mt-8 text-gray-400 text-sm">
          {isBreak
            ? '🧘 Take a breather — you earned it!'
            : <>Complete the session to earn <span className="text-teal-600 font-medium">XP</span> ⭐</>
          }
        </p>
      </div>
    </div>
  );
}