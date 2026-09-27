import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import confetti from "canvas-confetti";
import {
  Home,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Timer,
  PartyPopper,
  Sparkles,
  HeartHandshake,
  Users,
  MessageSquare,
  Wind,
  Gem,
  Trophy,
  ArrowRight,
  Flame,
  Snowflake,
  Award,
  Lightbulb,
  Hand,
  Smile,
} from "lucide-react";

class SoundEngine {
  constructor() {
    this.ctx = null;
  }
  getCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }
  tone({
    freq = 440,
    type = "sine",
    duration = 0.3,
    gain = 0.25,
    delay = 0,
    freqEnd = null,
    filterFreq = null,
  } = {}) {
    const ctx = this.getCtx();
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t0 + duration);
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.02, duration / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    if (filterFreq) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = filterFreq;
      osc.connect(filter);
      filter.connect(g);
    } else {
      osc.connect(g);
    }
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }
  noise({
    duration = 0.4,
    gain = 0.2,
    delay = 0,
    filterFreq = 1200,
    type = "lowpass",
  } = {}) {
    const ctx = this.getCtx();
    const t0 = ctx.currentTime + delay;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = filterFreq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + duration + 0.05);
  }
  click() {
    this.tone({ freq: 820, type: "square", duration: 0.06, gain: 0.18 });
  }
  connect() {
    this.tone({ freq: 300, freqEnd: 900, type: "sine", duration: 0.25, gain: 0.2 });
  }
  popBalloon() {
    this.noise({ duration: 0.12, gain: 0.3, filterFreq: 2200 });
    this.tone({ freq: 700, freqEnd: 120, type: "sine", duration: 0.18, gain: 0.25, delay: 0.02 });
  }
  wind() {
    this.noise({ duration: 1.1, gain: 0.16, filterFreq: 600, type: "bandpass" });
  }
  carve() {
    for (let i = 0; i < 4; i++) {
      this.noise({ duration: 0.09, gain: 0.22, filterFreq: 2800, type: "highpass", delay: i * 0.11 });
    }
    this.tone({ freq: 110, type: "sine", duration: 0.4, gain: 0.2, delay: 0.3 });
  }
  alarm() {
    this.tone({ freq: 880, type: "sawtooth", duration: 0.25, gain: 0.2 });
    this.tone({ freq: 660, type: "sawtooth", duration: 0.25, gain: 0.2, delay: 0.28 });
  }
  cooldown() {
    this.tone({ freq: 500, freqEnd: 180, type: "sine", duration: 0.9, gain: 0.2 });
  }
  countdownTick() {
    this.tone({ freq: 1000, type: "sine", duration: 0.08, gain: 0.16 });
  }
  fanfare() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.tone({ freq: f, type: "triangle", duration: 0.35, gain: 0.22, delay: i * 0.1 });
    });
    this.noise({ duration: 0.6, gain: 0.12, filterFreq: 4000, delay: 0.15 });
  }
  wrong() {
    this.tone({ freq: 300, freqEnd: 150, type: "sawtooth", duration: 0.3, gain: 0.2 });
  }
  correctDing() {
    this.tone({ freq: 1046.5, type: "sine", duration: 0.25, gain: 0.22 });
    this.tone({ freq: 1568, type: "sine", duration: 0.25, gain: 0.18, delay: 0.08 });
  }
}

const SoundContext = createContext(null);

function SoundProvider({ children }) {
  const engineRef = useRef(null);
  const soundOnRef = useRef(true);
  const [soundOn, setSoundOn] = useState(true);
  if (!engineRef.current) engineRef.current = new SoundEngine();
  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);
  const play = useCallback((name) => {
    if (!soundOnRef.current) return;
    const engine = engineRef.current;
    try {
      switch (name) {
        case "click":
          engine.click();
          break;
        case "connect":
          engine.connect();
          break;
        case "pop":
          engine.popBalloon();
          break;
        case "wind":
          engine.wind();
          break;
        case "carve":
          engine.carve();
          break;
        case "alarm":
          engine.alarm();
          break;
        case "cooldown":
          engine.cooldown();
          break;
        case "tick":
          engine.countdownTick();
          break;
        case "fanfare":
          engine.fanfare();
          break;
        case "wrong":
          engine.wrong();
          break;
        case "ding":
          engine.correctDing();
          break;
        default:
          break;
      }
    } catch (err) {
      // AudioContext might be blocked before first gesture; ignore.
    }
  }, []);
  const toggleSound = useCallback(() => setSoundOn((v) => !v), []);
  const value = useMemo(() => ({ soundOn, toggleSound, play }), [soundOn, toggleSound, play]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

function useSound() {
  return useContext(SoundContext);
}

function burstConfetti(x = 0.5, y = 0.5) {
  confetti({ particleCount: 90, spread: 70, origin: { x, y }, startVelocity: 45 });
}

function grandFinaleConfetti() {
  const end = Date.now() + 2200;
  const colors = ["#FFD700", "#FF69B4", "#00BFFF", "#7CFC00", "#FF8C00"];
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({ particleCount: 160, spread: 110, origin: { y: 0.5 }, colors });
}

function useCountdown(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return undefined;
    if (seconds <= 0) {
      setRunning(false);
      return undefined;
    }
    const id = setTimeout(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [running, seconds]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(
    (val) => {
      setSeconds(val === undefined ? initialSeconds : val);
      setRunning(false);
    },
    [initialSeconds]
  );

  return { seconds, running, start, pause, reset, setSeconds };
}

function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function TimerWidget({ label, countdown, dangerAt = 10, className = "" }) {
  const { seconds, running, start, pause, reset } = countdown;
  const isDanger = seconds <= dangerAt && seconds > 0;
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-2 shadow-lg ring-2 ring-slate-200 ${className}`}
    >
      <Timer className={`h-6 w-6 ${isDanger ? "text-red-500 animate-wiggle-hint" : "text-slate-500"}`} />
      <div className="flex flex-col leading-none">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
        <span className={`text-2xl font-black tabular-nums ${isDanger ? "text-red-500" : "text-slate-700"}`}>
          {formatClock(seconds)}
        </span>
      </div>
      <div className="flex gap-1">
        <button
          onClick={running ? pause : start}
          className="rounded-xl bg-emerald-500 p-2 text-white shadow hover:bg-emerald-600 active:scale-95"
        >
          {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button
          onClick={() => reset()}
          className="rounded-xl bg-slate-400 p-2 text-white shadow hover:bg-slate-500 active:scale-95"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function useTickAlarm(countdown) {
  const { seconds, running } = countdown;
  const { play } = useSound();
  const prevRef = useRef(seconds);
  useEffect(() => {
    if (running && seconds <= 5 && seconds > 0 && prevRef.current !== seconds) {
      play("tick");
    }
    if (running && seconds === 0 && prevRef.current !== 0) {
      play("alarm");
    }
    prevRef.current = seconds;
  }, [seconds, running, play]);
}

function BigNavButton({ active, onClick, icon: Icon, label, sub, colorClass }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-4 py-2 transition-all active:scale-95 ${
        active
          ? `bg-gradient-to-br ${colorClass} text-white shadow-xl scale-105`
          : "bg-white/70 text-slate-600 hover:bg-white shadow"
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs font-bold leading-none">{label}</span>
      {sub ? <span className="text-[10px] opacity-80 leading-none">{sub}</span> : null}
    </button>
  );
}

const STAGES = [
  {
    key: "game1",
    label: "Khởi động",
    sub: "5 phút",
    title: "Thử tài Gỡ rối",
    emoji: "🧶",
    icon: Sparkles,
    color: "from-sky-400 to-blue-600",
  },
  {
    key: "game2",
    label: "Khám phá",
    sub: "10 phút",
    title: "Bóng bay Ghép từ",
    emoji: "🎈",
    icon: PartyPopper,
    color: "from-pink-400 to-fuchsia-600",
  },
  {
    key: "game3a",
    label: "Thực hành 1",
    sub: "15 phút",
    title: "Viết lên Cát – Khắc lên Đá",
    emoji: "🏖️",
    icon: Wind,
    color: "from-amber-400 to-orange-600",
  },
  {
    key: "game3b",
    label: "Thực hành 2",
    sub: "15 phút",
    title: "Biệt đội Hòa Giải",
    emoji: "🧯",
    icon: Flame,
    color: "from-red-400 to-rose-600",
  },
  {
    key: "game4",
    label: "Tổng kết",
    sub: "5 phút",
    title: "Góc Chia sẻ & Thông điệp",
    emoji: "🕊️",
    icon: HeartHandshake,
    color: "from-emerald-400 to-teal-600",
  },
];

function TopNav({ screen, setScreen, isFullscreen, toggleFullscreen }) {
  const { soundOn, toggleSound } = useSound();
  return (
    <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 border-b-4 border-white/40 bg-slate-900/80 px-3 py-2 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-2">
        <BigNavButton
          active={screen === "lobby"}
          onClick={() => setScreen("lobby")}
          icon={Home}
          label="Sảnh chính"
          colorClass="from-violet-400 to-indigo-600"
        />
        {STAGES.map((s) => (
          <BigNavButton
            key={s.key}
            active={screen === s.key}
            onClick={() => setScreen(s.key)}
            icon={s.icon}
            label={s.label}
            sub={s.sub}
            colorClass={s.color}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSound}
          className="rounded-2xl bg-white/80 p-3 text-slate-700 shadow hover:bg-white active:scale-95"
        >
          {soundOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
        </button>
        <button
          onClick={toggleFullscreen}
          className="rounded-2xl bg-white/80 p-3 text-slate-700 shadow hover:bg-white active:scale-95"
        >
          {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
}

function Lobby({ setScreen }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10 text-center">
        <p className="text-lg font-bold text-indigo-500">Kỹ năng sống · Khối 4 · Tiết 2</p>
        <h1 className="mt-2 text-4xl font-black text-slate-800 md:text-5xl">
          🤝 Giải quyết mâu thuẫn với bạn bè
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-500">
          Cùng bước qua 5 chặng vui nhộn để trở thành những người bạn biết lắng nghe, thấu hiểu,
          bày tỏ và tôn trọng lẫn nhau nhé!
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STAGES.map((s, idx) => (
          <button
            key={s.key}
            onClick={() => setScreen(s.key)}
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${s.color} p-6 text-left text-white shadow-2xl transition-transform hover:-translate-y-1 active:scale-95`}
          >
            <div className="absolute -right-4 -top-4 text-8xl opacity-20 transition-transform group-hover:scale-110">
              {s.emoji}
            </div>
            <div className="relative z-10">
              <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                Chặng {idx + 1} · {s.sub}
              </span>
              <h2 className="mt-4 text-2xl font-black">{s.label}</h2>
              <p className="mt-1 text-lg font-semibold opacity-95">{s.title}</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-bold opacity-90">
                Bắt đầu <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScreenShell({ title, emoji, subtitle, children, accent = "from-sky-100 to-blue-200" }) {
  return (
    <div className={`min-h-full bg-gradient-to-b ${accent} pb-16`}>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-black text-slate-800 md:text-4xl">
              <span className="text-4xl">{emoji}</span> {title}
            </h1>
            {subtitle ? <p className="mt-1 text-lg font-semibold text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

const GIRAFFE_LEVEL = {
  id: "huou",
  title: "Màn 1 · Đàn Hươu Cao Cổ",
  emoji: "🦒",
  pairs: { A: 3, B: 1, C: 5, D: 2, E: 4 },
};

const OSTRICH_LEVEL = {
  id: "dadieu",
  title: "Màn 2 · Đàn Đà Điểu",
  emoji: "🦤",
  pairs: { A: 4, B: 2, C: 5, D: 1, E: 3 },
};

const NECK_VIEWBOX = { width: 760, height: 400 };
const SLOT_XS = [70, 225, 380, 535, 690];

function neckPath(headX, headY, bodyX, bodyY) {
  return `M ${headX} ${headY} C ${headX} ${headY + 130}, ${bodyX} ${bodyY - 130}, ${bodyX} ${bodyY}`;
}

function TangledNeckBoard({ level, guesses, onPickHead, onPickBody, selectedHead, checked, results }) {
  const heads = ["A", "B", "C", "D", "E"];
  const bodies = [1, 2, 3, 4, 5];
  const headPos = Object.fromEntries(heads.map((h, i) => [h, SLOT_XS[i]]));
  const bodyPos = Object.fromEntries(bodies.map((b, i) => [b, SLOT_XS[i]]));
  const headY = 46;
  const bodyY = 360;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-50 to-lime-100 p-4 shadow-inner">
      <svg viewBox={`0 0 ${NECK_VIEWBOX.width} ${NECK_VIEWBOX.height}`} className="w-full" style={{ height: 340 }}>
        {heads.map((h) => {
          const realBody = level.pairs[h];
          const isGuessedForThisBody = guesses[realBody] === h;
          let stroke = "#a16207";
          let opacity = 0.45;
          let width = 6;
          let extraClass = "";
          if (checked) {
            if (isGuessedForThisBody) {
              stroke = "#16a34a";
              opacity = 1;
              width = 10;
              extraClass = "path-travel";
            } else if (guesses[realBody] && guesses[realBody] !== h) {
              stroke = "#dc2626";
              opacity = 0.95;
              width = 8;
              extraClass = "path-travel";
            } else {
              opacity = 0.15;
            }
          }
          return (
            <path
              key={h}
              d={neckPath(headPos[h], headY, bodyPos[realBody], bodyY)}
              fill="none"
              stroke={stroke}
              strokeOpacity={opacity}
              strokeWidth={width}
              strokeLinecap="round"
              className={extraClass}
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-2 flex justify-between px-6">
          {heads.map((h) => (
            <button
              key={h}
              onClick={() => onPickHead(h)}
              className={`pointer-events-auto flex h-16 w-16 flex-col items-center justify-center rounded-2xl text-2xl font-black shadow-xl ring-4 transition-transform active:scale-95 ${
                selectedHead === h
                  ? "bg-yellow-300 ring-yellow-500 scale-110"
                  : "bg-white ring-amber-300 hover:scale-105"
              }`}
            >
              <span>{level.emoji}</span>
              <span className="text-sm">{h}</span>
            </button>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-2 flex justify-between px-6">
          {bodies.map((b) => {
            const result = checked ? results[b] : null;
            return (
              <button
                key={b}
                onClick={() => onPickBody(b)}
                className={`pointer-events-auto relative flex h-16 w-16 flex-col items-center justify-center rounded-2xl text-2xl font-black shadow-xl ring-4 transition-transform active:scale-95 ${
                  guesses[b]
                    ? "bg-sky-200 ring-sky-500"
                    : "bg-white ring-emerald-300 hover:scale-105"
                }`}
              >
                <span className="scale-x-[-1]">{level.emoji}</span>
                <span className="text-sm">
                  {b}
                  {guesses[b] ? ` · ${guesses[b]}` : ""}
                </span>
                {result === true && (
                  <CheckCircle2 className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-white text-emerald-500" />
                )}
                {result === false && (
                  <XCircle className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-white text-red-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Game1ThuTaiGoRoi() {
  const [levelId, setLevelId] = useState("huou");
  const level = levelId === "huou" ? GIRAFFE_LEVEL : OSTRICH_LEVEL;
  const [guesses, setGuesses] = useState({});
  const [selectedHead, setSelectedHead] = useState(null);
  const [checked, setChecked] = useState(false);
  const countdown = useCountdown(90);
  const { play } = useSound();
  useTickAlarm(countdown);

  const switchLevel = (id) => {
    setLevelId(id);
    setGuesses({});
    setSelectedHead(null);
    setChecked(false);
    countdown.reset(90);
    play("click");
  };

  const onPickHead = (h) => {
    play("click");
    setSelectedHead((prev) => (prev === h ? null : h));
    setChecked(false);
  };

  const onPickBody = (b) => {
    if (!selectedHead) return;
    play("connect");
    setGuesses((prev) => ({ ...prev, [b]: selectedHead }));
    setSelectedHead(null);
    setChecked(false);
  };

  const results = useMemo(() => {
    const inv = {};
    Object.entries(level.pairs).forEach(([h, b]) => {
      inv[b] = h;
    });
    const r = {};
    Object.keys(guesses).forEach((b) => {
      r[b] = guesses[b] === inv[b];
    });
    return r;
  }, [guesses, level]);

  const allAssigned = Object.keys(guesses).length === 5;
  const allCorrect = allAssigned && Object.values(results).every(Boolean);

  const handleCheck = () => {
    setChecked(true);
    if (allCorrect) {
      play("fanfare");
      burstConfetti(0.5, 0.3);
    } else {
      play("connect");
    }
  };

  const handleClear = () => {
    setGuesses({});
    setSelectedHead(null);
    setChecked(false);
    play("click");
  };

  return (
    <ScreenShell
      title="Thử tài Gỡ rối"
      emoji="🧶"
      subtitle="Chọn 1 đầu, rồi chọn 1 thân để nối — trông theo đường cổ để gỡ đúng cặp nhé!"
      accent="from-sky-100 to-indigo-200"
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => switchLevel("huou")}
          className={`rounded-2xl px-5 py-3 text-lg font-black shadow ${
            levelId === "huou" ? "bg-blue-600 text-white" : "bg-white text-slate-600"
          }`}
        >
          🦒 Màn 1 · Hươu Cao Cổ
        </button>
        <button
          onClick={() => switchLevel("dadieu")}
          className={`rounded-2xl px-5 py-3 text-lg font-black shadow ${
            levelId === "dadieu" ? "bg-blue-600 text-white" : "bg-white text-slate-600"
          }`}
        >
          🦤 Màn 2 · Đà Điểu
        </button>
        <TimerWidget label="Đồng hồ thi đua" countdown={countdown} />
      </div>

      <TangledNeckBoard
        level={level}
        guesses={guesses}
        onPickHead={onPickHead}
        onPickBody={onPickBody}
        selectedHead={selectedHead}
        checked={checked}
        results={results}
      />

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          onClick={handleCheck}
          disabled={!allAssigned}
          className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-xl font-black text-white shadow-xl transition-transform enabled:hover:bg-emerald-600 enabled:active:scale-95 disabled:opacity-40"
        >
          <Sparkles className="h-6 w-6" /> Kiểm tra & Gỡ rối
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 rounded-2xl bg-slate-500 px-6 py-4 text-lg font-bold text-white shadow-xl hover:bg-slate-600 active:scale-95"
        >
          <RotateCcw className="h-5 w-5" /> Xóa hết
        </button>
        {checked && allCorrect && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-100 px-5 py-3 text-xl font-black text-emerald-700 animate-pop-in">
            <Trophy className="h-7 w-7" /> Tuyệt vời! Gỡ rối thành công!
          </div>
        )}
      </div>
    </ScreenShell>
  );
}

const BALLOON_WORDS = [
  { id: 0, text: "CỰC", pairId: "tich_cuc" },
  { id: 1, text: "HIỂU", pairId: "thau_hieu" },
  { id: 2, text: "TRỌNG", pairId: "ton_trong" },
  { id: 3, text: "THẤU", pairId: "thau_hieu" },
  { id: 4, text: "TỎ", pairId: "bay_to" },
  { id: 5, text: "LẮNG", pairId: "lang_nghe" },
  { id: 6, text: "BÀY", pairId: "bay_to" },
  { id: 7, text: "TÍCH", pairId: "tich_cuc" },
  { id: 8, text: "NGHE", pairId: "lang_nghe" },
  { id: 9, text: "TÔN", pairId: "ton_trong" },
];

const PAIR_LABELS = {
  tich_cuc: "Tích cực",
  lang_nghe: "Lắng nghe",
  thau_hieu: "Thấu hiểu",
  bay_to: "Bày tỏ",
  ton_trong: "Tôn trọng",
};

const BALLOON_COLORS = [
  "from-rose-400 to-rose-600",
  "from-amber-400 to-amber-600",
  "from-lime-400 to-lime-600",
  "from-cyan-400 to-cyan-600",
  "from-violet-400 to-violet-600",
  "from-pink-400 to-pink-600",
  "from-orange-400 to-orange-600",
  "from-emerald-400 to-emerald-600",
  "from-sky-400 to-sky-600",
  "from-fuchsia-400 to-fuchsia-600",
];

const BALLOON_LAYOUT = [
  { left: "6%", top: "8%", delay: "0s", duration: "4.2s" },
  { left: "22%", top: "42%", delay: "0.4s", duration: "3.6s" },
  { left: "38%", top: "6%", delay: "0.8s", duration: "4.8s" },
  { left: "54%", top: "36%", delay: "1.2s", duration: "3.9s" },
  { left: "70%", top: "4%", delay: "0.2s", duration: "4.4s" },
  { left: "86%", top: "40%", delay: "0.6s", duration: "4.0s" },
  { left: "14%", top: "70%", delay: "1.0s", duration: "3.7s" },
  { left: "46%", top: "68%", delay: "1.4s", duration: "4.6s" },
  { left: "62%", top: "72%", delay: "0.3s", duration: "3.8s" },
  { left: "80%", top: "68%", delay: "0.9s", duration: "4.3s" },
];

const PRINCIPLES = [
  {
    title: "Suy nghĩ theo chiều hướng tích cực",
    emoji: "🌞",
    text: "Tin tưởng vào bản thân, giữ tâm trạng tốt giúp giải quyết vấn đề đơn giản hơn.",
  },
  {
    title: "Lắng nghe và thấu hiểu",
    emoji: "👂",
    text: 'Tránh biến chuyện "nhỏ như con kiến thành to như con voi" do truyền đạt sai; hãy cùng ngồi lại lắng nghe để "cơn thịnh nộ" xẹp xuống.',
  },
  {
    title: "Thẳng thắn bày tỏ quan điểm",
    emoji: "💬",
    text: "Khác biệt sở thích (như thích màu vàng hay màu hồng) là bình thường; hãy bày tỏ trong hòa bình và đón nhận góp ý để tốt hơn.",
  },
  {
    title: "Tôn trọng bạn bè",
    emoji: "🤝",
    text: "Không động tay chân hay dùng lời xúc phạm; xung đột ồn ào là hạ sách, giải quyết trong hòa bình mới là thượng sách.",
  },
];

function Balloon({ word, layout, colorClass, state, onClick }) {
  const isMatched = state === "matched";
  const isSelected = state === "selected";
  const isShaking = state === "shaking";
  return (
    <button
      onClick={onClick}
      disabled={isMatched}
      style={{
        left: layout.left,
        top: layout.top,
        animationDelay: layout.delay,
        animationDuration: layout.duration,
      }}
      className={`absolute flex h-28 w-28 md:h-32 md:w-32 items-center justify-center rounded-full bg-gradient-to-br ${colorClass} text-center text-lg font-black text-white shadow-2xl transition-all animate-bob ${
        isMatched ? "pointer-events-none scale-0 opacity-0" : ""
      } ${isSelected ? "ring-8 ring-yellow-300 scale-110" : ""} ${isShaking ? "animate-shake" : ""}`}
    >
      <span className="drop-shadow">{word}</span>
      <span
        className="absolute -bottom-6 left-1/2 h-6 w-0.5 -translate-x-1/2 bg-slate-400"
        aria-hidden="true"
      />
    </button>
  );
}

function Game2BongBayGhepTu() {
  const countdown = useCountdown(60);
  const { play } = useSound();
  useTickAlarm(countdown);
  const [balloonState, setBalloonState] = useState({});
  const [selected, setSelected] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [phase, setPhase] = useState("play");
  const [expanded, setExpanded] = useState({});

  const stateFor = (id) => {
    if (balloonState[id]) return balloonState[id];
    if (selected === id) return "selected";
    return "idle";
  };

  const resetGame = () => {
    setBalloonState({});
    setSelected(null);
    setMatchedPairs([]);
    setPhase("play");
    countdown.reset(60);
    play("click");
  };

  const handleBalloonClick = (id) => {
    if (balloonState[id] === "matched") return;
    play("click");
    if (selected === null) {
      setSelected(id);
      return;
    }
    if (selected === id) {
      setSelected(null);
      return;
    }
    const first = BALLOON_WORDS.find((w) => w.id === selected);
    const second = BALLOON_WORDS.find((w) => w.id === id);
    if (first.pairId === second.pairId) {
      play("ding");
      setBalloonState((prev) => ({ ...prev, [first.id]: "matched", [second.id]: "matched" }));
      setMatchedPairs((prev) => {
        const next = [...prev, first.pairId];
        if (next.length === 5) {
          setTimeout(() => {
            play("fanfare");
            burstConfetti(0.5, 0.4);
            setPhase("principles");
          }, 500);
        }
        return next;
      });
      burstConfetti(0.5, 0.5);
      setSelected(null);
    } else {
      play("wrong");
      setBalloonState((prev) => ({ ...prev, [first.id]: "shaking", [second.id]: "shaking" }));
      setTimeout(() => {
        setBalloonState((prev) => {
          const next = { ...prev };
          delete next[first.id];
          delete next[second.id];
          return next;
        });
      }, 550);
      setSelected(null);
    }
  };

  const toggleExpand = (idx) => {
    play("click");
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <ScreenShell
      title="Bóng bay Ghép từ"
      emoji="🎈"
      subtitle="Chạm chọn 2 quả bóng để ghép thành cặp từ có nghĩa trong 60 giây!"
      accent="from-pink-100 to-fuchsia-200"
    >
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <TimerWidget label="Đếm ngược" countdown={countdown} dangerAt={10} />
        <button
          onClick={resetGame}
          className="flex items-center gap-2 rounded-2xl bg-slate-500 px-5 py-3 text-lg font-bold text-white shadow-xl hover:bg-slate-600 active:scale-95"
        >
          <RotateCcw className="h-5 w-5" /> Chơi lại
        </button>
        <button
          onClick={() => {
            play("fanfare");
            setPhase("principles");
          }}
          disabled={matchedPairs.length < 5 && countdown.seconds > 0}
          className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 text-lg font-bold text-white shadow-xl enabled:hover:bg-indigo-600 enabled:active:scale-95 disabled:opacity-40"
        >
          <Award className="h-5 w-5" /> Xem 4 Nguyên tắc Vàng
        </button>
        <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 text-lg font-bold text-slate-600 shadow">
          Đã ghép: {matchedPairs.length}/5
        </div>
      </div>

      {phase === "play" && (
        <div className="relative h-[560px] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-sky-200 to-sky-50 shadow-inner">
          {BALLOON_WORDS.map((w) => (
            <Balloon
              key={w.id}
              word={w.text}
              layout={BALLOON_LAYOUT[w.id]}
              colorClass={BALLOON_COLORS[w.id]}
              state={stateFor(w.id)}
              onClick={() => handleBalloonClick(w.id)}
            />
          ))}
          <div className="absolute inset-x-0 bottom-3 flex flex-wrap justify-center gap-2 px-3">
            {matchedPairs.map((pid, i) => (
              <span
                key={i}
                className="animate-pop-in rounded-full bg-white px-4 py-2 text-base font-black text-fuchsia-600 shadow-lg"
              >
                {PAIR_LABELS[pid]}
              </span>
            ))}
          </div>
        </div>
      )}

      {phase === "principles" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PRINCIPLES.map((p, idx) => (
            <button
              key={idx}
              onClick={() => toggleExpand(idx)}
              className="rounded-3xl bg-white p-6 text-left shadow-xl transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3 text-xl font-black text-slate-700">
                  <span className="text-3xl">{p.emoji}</span> {p.title}
                </span>
                {expanded[idx] ? (
                  <ChevronUp className="h-6 w-6 text-slate-400" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-slate-400" />
                )}
              </div>
              {expanded[idx] && (
                <p className="mt-3 animate-pop-in text-lg leading-relaxed text-slate-500">{p.text}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </ScreenShell>
  );
}

const STORY_CARDS = [
  { id: 0, correctOrder: 1, emoji: "🚶‍♂️🚶‍♀️🏜️", text: "Đôi bạn cùng đi qua sa mạc." },
  { id: 1, correctOrder: 2, emoji: "😠✋😢", text: 'Hai bạn cãi nhau, một bạn tức giận tát bạn mình: "AAA...".' },
  {
    id: 2,
    correctOrder: 3,
    emoji: "✍️🏖️",
    text: 'Bạn bị đánh viết lên cát: "Hôm nay người bạn tốt nhất của tôi đã tát tôi".',
  },
  {
    id: 3,
    correctOrder: 4,
    emoji: "😱🕳️",
    text: 'Bạn bị đánh trượt chân lún xuống "Cát lún" và hét lên: "Cứu tôi vớiiii".',
  },
  { id: 4, correctOrder: 5, emoji: "🏃‍♂️🤝", text: "Người bạn kia lao tới kéo bạn thoát khỏi cát lún." },
  {
    id: 5,
    correctOrder: 6,
    emoji: "🪨✨",
    text: 'Sau khi được cứu, người bạn khắc lên đá: "Hôm nay người bạn tốt nhất của tôi đã cứu sống tôi".',
  },
];

const STORY_DISPLAY_ORDER = [3, 0, 5, 1, 4, 2];

const SAND_ROCK_ITEMS = [
  { id: 0, text: "Bạn vô tình làm rơi và làm hỏng hộp bút của em." },
  { id: 1, text: "Bạn luôn động viên, an ủi em mỗi khi em buồn." },
  { id: 2, text: "Bạn mượn cuốn truyện của em nhưng quên trả." },
  { id: 3, text: "Bạn nhường phần quà của mình cho em lúc em không có." },
  { id: 4, text: "Bạn trêu chọc ngoại hình khiến em cảm thấy buồn." },
  { id: 5, text: "Bạn kiên nhẫn giảng lại bài khó lúc em không hiểu." },
];

function StoryCard({ card, order, status, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex h-52 flex-col items-center justify-center rounded-3xl border-4 p-4 text-center shadow-xl transition-transform hover:-translate-y-1 active:scale-95 ${
        status === "correct"
          ? "border-emerald-500 bg-emerald-50"
          : status === "wrong"
          ? "border-red-500 bg-red-50"
          : order
          ? "border-sky-400 bg-sky-50"
          : "border-slate-200 bg-white"
      }`}
    >
      {order && (
        <span className="absolute -top-4 -left-4 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-lg font-black text-white shadow-lg">
          {order}
        </span>
      )}
      <div className="text-4xl">{card.emoji}</div>
      <p className="mt-2 text-sm font-semibold leading-snug text-slate-600">{card.text}</p>
      {status === "correct" && <CheckCircle2 className="absolute top-2 right-2 h-6 w-6 text-emerald-500" />}
      {status === "wrong" && <XCircle className="absolute top-2 right-2 h-6 w-6 text-red-500" />}
    </button>
  );
}

function Game3AVietLenCatKhacLenDa() {
  const { play } = useSound();
  const [part, setPart] = useState("story");
  const [assignment, setAssignment] = useState({});
  const [checked, setChecked] = useState(false);
  const discussTimer = useCountdown(180);
  useTickAlarm(discussTimer);
  const [categories, setCategories] = useState({});
  const [animKey, setAnimKey] = useState({});
  const [showMessage, setShowMessage] = useState(false);

  const nextOrder = Object.keys(assignment).length + 1;
  const allAssigned = Object.keys(assignment).length === 6;
  const allCorrect =
    allAssigned && STORY_CARDS.every((c) => assignment[c.id] === c.correctOrder);

  const handleCardClick = (id) => {
    play("click");
    setChecked(false);
    setAssignment((prev) => {
      if (prev[id]) {
        const removedOrder = prev[id];
        const next = {};
        Object.entries(prev).forEach(([cid, ord]) => {
          if (Number(cid) === id) return;
          next[cid] = ord > removedOrder ? ord - 1 : ord;
        });
        return next;
      }
      if (Object.keys(prev).length >= 6) return prev;
      return { ...prev, [id]: nextOrder };
    });
  };

  const handleCheck = () => {
    setChecked(true);
    if (allCorrect) {
      play("fanfare");
      burstConfetti(0.5, 0.3);
    } else {
      play("connect");
    }
  };

  const handleResetStory = () => {
    setAssignment({});
    setChecked(false);
    play("click");
  };

  const handleClassify = (id, category) => {
    play(category === "sand" ? "wind" : "carve");
    setCategories((prev) => ({ ...prev, [id]: category }));
    setAnimKey((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <ScreenShell
      title="Viết lên Cát – Khắc lên Đá"
      emoji="🏖️"
      subtitle="Sắp xếp câu chuyện đôi bạn qua sa mạc, rồi phân loại điều nên bỏ qua hay ghi nhớ."
      accent="from-amber-100 to-orange-200"
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setPart("story")}
          className={`rounded-2xl px-5 py-3 text-lg font-black shadow ${
            part === "story" ? "bg-orange-600 text-white" : "bg-white text-slate-600"
          }`}
        >
          Phần 1 · Sắp xếp câu chuyện
        </button>
        <button
          onClick={() => setPart("sort")}
          className={`rounded-2xl px-5 py-3 text-lg font-black shadow ${
            part === "sort" ? "bg-orange-600 text-white" : "bg-white text-slate-600"
          }`}
        >
          Phần 2 · Cát hay Đá?
        </button>
        {part === "story" && <TimerWidget label="Thảo luận" countdown={discussTimer} />}
      </div>

      {part === "story" && (
        <div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {STORY_DISPLAY_ORDER.map((id) => {
              const card = STORY_CARDS[id];
              const order = assignment[id];
              let status = null;
              if (checked && order) status = order === card.correctOrder ? "correct" : "wrong";
              return (
                <StoryCard
                  key={id}
                  card={card}
                  order={order}
                  status={status}
                  onClick={() => handleCardClick(id)}
                />
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={handleCheck}
              disabled={!allAssigned}
              className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-xl font-black text-white shadow-xl enabled:hover:bg-emerald-600 enabled:active:scale-95 disabled:opacity-40"
            >
              <Sparkles className="h-6 w-6" /> Kiểm tra thứ tự
            </button>
            <button
              onClick={handleResetStory}
              className="flex items-center gap-2 rounded-2xl bg-slate-500 px-6 py-4 text-lg font-bold text-white shadow-xl hover:bg-slate-600 active:scale-95"
            >
              <RotateCcw className="h-5 w-5" /> Xếp lại
            </button>
            {checked && allCorrect && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-100 px-5 py-3 text-xl font-black text-emerald-700 animate-pop-in">
                <Trophy className="h-7 w-7" /> Kể chuyện chính xác!
              </div>
            )}
          </div>
          {checked && (
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-xl">
              <h3 className="mb-3 text-xl font-black text-slate-700">Câu chuyện theo đúng thứ tự</h3>
              <ol className="list-decimal space-y-2 pl-6 text-lg text-slate-600">
                {STORY_CARDS.map((c) => (
                  <li key={c.id}>
                    <span className="mr-2">{c.emoji}</span>
                    {c.text}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {part === "sort" && (
        <div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {SAND_ROCK_ITEMS.map((item) => {
              const cat = categories[item.id];
              return (
                <div key={item.id} className="rounded-3xl bg-white p-5 shadow-xl">
                  <p className="min-h-[3.5rem] text-lg font-semibold text-slate-700">{item.text}</p>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => handleClassify(item.id, "sand")}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-black shadow ${
                        cat === "sand" ? "bg-amber-400 text-white" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      🏖️ Đồi Cát
                    </button>
                    <button
                      onClick={() => handleClassify(item.id, "rock")}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-black shadow ${
                        cat === "rock" ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      🪨 Tảng Đá
                    </button>
                  </div>
                  {cat === "sand" && (
                    <p key={`sand-${animKey[item.id]}`} className="mt-3 animate-blow-away text-base font-bold text-amber-600">
                      🌬️ Đã thả trôi theo cát... tha thứ và bỏ qua!
                    </p>
                  )}
                  {cat === "rock" && (
                    <p key={`rock-${animKey[item.id]}`} className="mt-3 text-base font-bold text-yellow-600 animate-carve-in">
                      ✨ Đã khắc ghi vào tim — luôn biết ơn!
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setShowMessage(true);
                play("fanfare");
                burstConfetti(0.5, 0.4);
              }}
              className="flex items-center gap-2 rounded-2xl bg-orange-600 px-8 py-4 text-xl font-black text-white shadow-xl hover:bg-orange-700 active:scale-95"
            >
              <Gem className="h-6 w-6" /> Chốt thông điệp
            </button>
          </div>
          {showMessage && (
            <div className="mx-auto mt-6 max-w-3xl animate-fade-scale-in rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-center text-2xl font-black text-white shadow-2xl">
              "Khi ai đó làm ta tổn thương, hãy rộng lòng tha thứ để chính bản thân chúng ta cũng
              được vui vẻ. Khi nhận điều tốt đẹp từ người khác, hãy luôn khắc ghi trong lòng. Đó là
              nghệ thuật xử lý mâu thuẫn khéo léo để giữ gìn tình bạn đẹp."
            </div>
          )}
        </div>
      )}
    </ScreenShell>
  );
}

const SCENARIOS = [
  {
    id: 0,
    title: "Tình huống 1 · Đi dã ngoại",
    emoji: "🏕️🏖️",
    text: 'Lớp bàn đi dã ngoại, nhóm nam muốn đi cắm trại ở vùng núi, nhóm nữ muốn đi biển để tắm biển và nghịch cát. Khi em nêu ý kiến thì bị các bạn nữ phản bác và nói em ích kỷ.',
    options: [
      { text: "Cãi to tiếng để bảo vệ ý kiến của nhóm mình đến cùng.", correct: false },
      { text: "Lắng nghe lý do của các bạn, thẳng thắn bày tỏ mong muốn của mình và cùng nhau bỏ phiếu hoặc tìm phương án dung hòa.", correct: true },
      { text: "Giận dỗi, không tham gia dã ngoại cùng lớp nữa.", correct: false },
    ],
    roles: [
      { name: "Bạn A (đại diện nhóm muốn đi núi)", line: "Mình nghĩ đi cắm trại ở núi sẽ được đốt lửa trại, rất vui đó!" },
      { name: "Bạn B (đại diện nhóm muốn đi biển)", line: "Mình rất muốn nghe ý kiến của các bạn, mình cũng thích tắm biển lắm, có cách nào để cả hai nhóm đều vui không?" },
      { name: "Người dẫn chuyện", line: "Cả lớp cùng lắng nghe, bỏ phiếu và chọn ra phương án mà mọi người đều đồng ý." },
    ],
  },
  {
    id: 1,
    title: "Tình huống 2 · Va chạm giờ ra chơi",
    emoji: "🏃‍♂️💥",
    text: "Giờ ra chơi em đùa giỡn với bạn trong lớp và vô tình va vào một bạn lớp khác. Bạn ấy rất tức giận và muốn đánh em.",
    options: [
      { text: "Bỏ chạy hoặc đánh trả lại ngay lập tức.", correct: false },
      { text: "Bình tĩnh xin lỗi ngay, giải thích rằng mình vô tình và hỏi thăm xem bạn có sao không.", correct: true },
      { text: "Im lặng bỏ đi, mặc kệ bạn ấy tức giận.", correct: false },
    ],
    roles: [
      { name: "Em", line: "Mình xin lỗi bạn, mình không cố ý va vào bạn đâu. Bạn có bị đau không?" },
      { name: "Bạn lớp khác", line: "Tại bạn không nhìn đường nên mình mới bị va vào đó!" },
      { name: "Em", line: "Mình biết lỗi rồi, lần sau mình sẽ chú ý hơn. Mình xin lỗi bạn nhé." },
    ],
  },
  {
    id: 2,
    title: "Tình huống 3 · Xì xầm trong lớp",
    emoji: "🤫😤",
    text: "Đang ngồi học bài thì có nhiều bạn ngồi đằng sau xì xầm to nhỏ chê em học không giỏi và ngồi cười với nhau. Em rất tức giận nhưng không muốn gây xung đột trong lớp.",
    options: [
      { text: "Quay xuống lớn tiếng mắng lại các bạn ngay giữa giờ học.", correct: false },
      { text: "Giữ bình tĩnh, sau giờ học nhẹ nhàng nói chuyện riêng để bày tỏ cảm xúc của mình với các bạn.", correct: true },
      { text: "Buồn bã, giấu kín trong lòng và xa lánh các bạn từ đó.", correct: false },
    ],
    roles: [
      { name: "Em", line: "Mình nghe thấy các bạn nói về việc học của mình, điều đó làm mình buồn lắm." },
      { name: "Nhóm bạn", line: "Bọn mình xin lỗi, bọn mình chỉ đùa thôi chứ không có ý gì đâu." },
      { name: "Em", line: "Lần sau nếu có góp ý gì, các bạn nói thẳng với mình nhé, mình sẽ cố gắng hơn." },
    ],
  },
  {
    id: 3,
    title: "Tình huống 4 · Quên hẹn đá bóng",
    emoji: "⚽⏰",
    text: "Em hẹn bạn đi đá bóng nhưng quên mất, để bạn đợi khá lâu. Khi em đến, bạn rất giận và không muốn nói chuyện với em.",
    options: [
      { text: "Cho rằng chuyện nhỏ, không cần giải thích hay xin lỗi.", correct: false },
      { text: "Thành thật xin lỗi vì đã để bạn chờ lâu, giải thích lý do và hứa sẽ cẩn thận hơn lần sau.", correct: true },
      { text: "Trách ngược lại bạn là đã không nhắc mình trước.", correct: false },
    ],
    roles: [
      { name: "Em", line: "Mình xin lỗi vì đã để bạn chờ lâu, mình quên mất giờ hẹn, mình thật sự có lỗi." },
      { name: "Bạn", line: "Mình đợi bạn lâu lắm, mình cứ tưởng bạn không muốn chơi với mình nữa." },
      { name: "Em", line: "Không phải vậy đâu, mình rất trân trọng tình bạn của chúng ta. Lần sau mình sẽ đặt báo thức để không quên nữa." },
    ],
  },
];

function Thermometer({ value }) {
  const color = value > 66 ? "#dc2626" : value > 33 ? "#f59e0b" : "#0ea5e9";
  const Icon = value > 66 ? Flame : value > 33 ? Flame : Snowflake;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-56 w-14 overflow-hidden rounded-full bg-slate-200 shadow-inner">
        <div
          className="absolute bottom-0 left-0 w-full rounded-full transition-all duration-700 ease-out"
          style={{ height: `${value}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex items-center gap-1 text-2xl font-black" style={{ color }}>
        <Icon className="h-6 w-6" /> {value}°C
      </div>
    </div>
  );
}

function ScenarioPanel({ scenario, state, onAnswer, onResolve }) {
  const roleTimer = useCountdown(90);
  useTickAlarm(roleTimer);
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
      <div className="flex justify-center">
        <Thermometer value={state.temp} />
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-3 flex items-center gap-3 text-2xl font-black text-slate-700">
          <span className="text-3xl">{scenario.emoji}</span> {scenario.title}
        </div>
        <p className="mb-4 text-lg font-semibold text-slate-600">{scenario.text}</p>

        {state.phase === "quiz" && (
          <div className="space-y-3">
            {scenario.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => onAnswer(idx)}
                className={`block w-full rounded-2xl border-2 p-4 text-left text-lg font-semibold shadow transition-transform hover:-translate-y-0.5 active:scale-95 ${
                  state.wrongIndex === idx
                    ? "animate-shake border-red-400 bg-red-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                {opt.text}
              </button>
            ))}
            {state.wrongIndex !== null && state.wrongIndex !== undefined && (
              <p className="font-bold text-red-500">Chưa phù hợp lắm, hãy thử lại nhé!</p>
            )}
          </div>
        )}

        {state.phase === "roleplay" && (
          <div>
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 font-bold text-emerald-600">
              <CheckCircle2 className="h-6 w-6" /> Đã chọn đúng nguyên tắc! Giờ hãy sắm vai xử lý tình
              huống trước lớp.
            </div>
            <div className="mb-4 space-y-2">
              {scenario.roles.map((r, idx) => (
                <div key={idx} className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-sm font-black uppercase text-indigo-500">{r.name}</p>
                  <p className="text-lg italic text-slate-600">"{r.line}"</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <TimerWidget label="Thời gian sắm vai" countdown={roleTimer} />
              <button
                onClick={onResolve}
                className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-black text-white shadow-xl hover:bg-emerald-600 active:scale-95"
              >
                <HeartHandshake className="h-6 w-6" /> Hòa giải thành công! 🤝
              </button>
            </div>
          </div>
        )}

        {state.phase === "done" && (
          <div className="flex items-center gap-3 rounded-2xl bg-sky-50 px-5 py-4 text-xl font-black text-sky-600 animate-pop-in">
            <Snowflake className="h-7 w-7" /> Đã hạ nhiệt hoàn toàn — tình bạn được giữ gìn!
          </div>
        )}
      </div>
    </div>
  );
}

function Game3BBietDoiHoaGiai() {
  const { play } = useSound();
  const [activeIndex, setActiveIndex] = useState(0);
  const [states, setStates] = useState(() =>
    Object.fromEntries(SCENARIOS.map((s) => [s.id, { temp: 100, phase: "quiz", wrongIndex: null }]))
  );

  const active = SCENARIOS[activeIndex];
  const activeState = states[active.id];

  const handleAnswer = (idx) => {
    const opt = active.options[idx];
    if (opt.correct) {
      play("cooldown");
      setStates((prev) => ({ ...prev, [active.id]: { ...prev[active.id], temp: 50, phase: "roleplay", wrongIndex: null } }));
    } else {
      play("alarm");
      setStates((prev) => ({ ...prev, [active.id]: { ...prev[active.id], wrongIndex: idx } }));
      setTimeout(() => {
        setStates((prev) => ({ ...prev, [active.id]: { ...prev[active.id], wrongIndex: null } }));
      }, 900);
    }
  };

  const handleResolve = () => {
    play("fanfare");
    burstConfetti(0.5, 0.4);
    setStates((prev) => ({ ...prev, [active.id]: { ...prev[active.id], temp: 0, phase: "done" } }));
  };

  const allDone = SCENARIOS.every((s) => states[s.id].phase === "done");

  return (
    <ScreenShell
      title="Biệt đội Hòa Giải"
      emoji="🧯"
      subtitle="Chọn cách xử lý hòa bình để hạ nhiệt, sau đó sắm vai giải quyết tình huống trước lớp."
      accent="from-red-100 to-rose-200"
    >
      <div className="mb-6 flex flex-wrap gap-3">
        {SCENARIOS.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setActiveIndex(idx)}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-black shadow ${
              activeIndex === idx ? "bg-rose-600 text-white" : "bg-white text-slate-600"
            }`}
          >
            {states[s.id].phase === "done" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <Flame className="h-5 w-5 text-red-400" />
            )}
            {`Tình huống ${idx + 1}`}
          </button>
        ))}
      </div>

      <ScenarioPanel scenario={active} state={activeState} onAnswer={handleAnswer} onResolve={handleResolve} />

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {activeIndex < SCENARIOS.length - 1 && activeState.phase === "done" && (
          <button
            onClick={() => setActiveIndex((i) => i + 1)}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-black text-white shadow-xl hover:bg-indigo-700 active:scale-95"
          >
            Tình huống tiếp theo <ArrowRight className="h-5 w-5" />
          </button>
        )}
        {allDone && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-100 px-6 py-4 text-xl font-black text-emerald-700 animate-pop-in">
            <Trophy className="h-7 w-7" /> Biệt đội Hòa Giải đã hoàn thành xuất sắc nhiệm vụ!
          </div>
        )}
      </div>
    </ScreenShell>
  );
}

function Game4TongKet({ setScreen }) {
  const { play } = useSound();
  const [note, setNote] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const handleReveal = () => {
    play("fanfare");
    setShowMessage(true);
    grandFinaleConfetti();
  };

  return (
    <ScreenShell
      title="Góc Chia sẻ & Thông điệp Hòa bình"
      emoji="🕊️"
      subtitle="Cùng nhìn lại và vận dụng 4 nguyên tắc vàng vào cuộc sống của em."
      accent="from-emerald-100 to-teal-200"
    >
      <div className="rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex items-center gap-3 text-2xl font-black text-slate-700">
          <Lightbulb className="h-8 w-8 text-amber-400" /> Câu hỏi gợi mở
        </div>
        <p className="mt-3 text-xl font-semibold text-slate-600">
          Mâu thuẫn em đã từng gặp là gì? Nếu như được xử lý lại dựa trên 4 nguyên tắc hôm nay, em sẽ
          làm thế nào?
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Học sinh chia sẻ trực tiếp trên bảng tương tác..."
          className="mt-4 h-32 w-full resize-none rounded-2xl border-2 border-slate-200 p-4 text-lg text-slate-700 outline-none focus:border-emerald-400"
        />
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleReveal}
          className="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 px-10 py-6 text-2xl font-black text-white shadow-2xl hover:-translate-y-1 active:scale-95"
        >
          <HeartHandshake className="h-8 w-8" /> Mở Thông điệp Tổng kết
        </button>
      </div>

      {showMessage && (
        <div className="mx-auto mt-8 max-w-3xl animate-fade-scale-in rounded-3xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 p-10 text-center shadow-2xl">
          <Smile className="mx-auto mb-4 h-12 w-12 text-white" />
          <p className="text-2xl font-black leading-relaxed text-white md:text-3xl">
            "Mọi mâu thuẫn sẽ dễ dàng được giải quyết nếu chúng ta đừng chỉ ích kỷ cho riêng mình."
          </p>
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <button
          onClick={() => setScreen("lobby")}
          className="flex items-center gap-2 rounded-2xl bg-slate-600 px-6 py-4 text-lg font-bold text-white shadow-xl hover:bg-slate-700 active:scale-95"
        >
          <Home className="h-5 w-5" /> Trở về Sảnh chính
        </button>
      </div>
    </ScreenShell>
  );
}

function AppContent() {
  const [screen, setScreen] = useState("lobby");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <TopNav
        screen={screen}
        setScreen={setScreen}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />
      {screen === "lobby" && <Lobby setScreen={setScreen} />}
      {screen === "game1" && <Game1ThuTaiGoRoi />}
      {screen === "game2" && <Game2BongBayGhepTu />}
      {screen === "game3a" && <Game3AVietLenCatKhacLenDa />}
      {screen === "game3b" && <Game3BBietDoiHoaGiai />}
      {screen === "game4" && <Game4TongKet setScreen={setScreen} />}
    </div>
  );
}

export default function App() {
  return (
    <SoundProvider>
      <AppContent />
    </SoundProvider>
  );
}
