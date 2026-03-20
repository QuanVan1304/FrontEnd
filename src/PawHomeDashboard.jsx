/**
 * PawHomeDashboard.jsx
 * UI hoàn chỉnh — chỉ cần 1 file duy nhất
 *
 * Cài dependencies trước khi chạy:
 *   npm install lucide-react recharts
 *
 * Dùng trong App.jsx:
 *   import PawHomeDashboard from "./PawHomeDashboard";
 *   export default function App() { return <PawHomeDashboard />; }
 */

import { useState, useEffect, useCallback } from "react";
import {
  Thermometer, Droplets, Utensils, Droplet,
  Fan, Lightbulb, Volume2, PawPrint,
  Activity, Wifi, Camera, RefreshCw,
  AlertTriangle, CheckCircle, Info, X,
  Dog, Cat, ChevronRight, Bell, Settings,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ─────────────────── DESIGN TOKENS ─────────────────── */
const T = {
  primary:   "#2D7D6F",
  primary2:  "#3A9B89",
  secondary: "#F4A03A",
  accent:    "#E8604C",
  water:     "#4AB8E8",
  soft:      "#EAF6F4",
  bg:        "#F3F8F7",
  card:      "#FFFFFF",
  text:      "#1A2E2A",
  muted:     "#6B8E88",
  border:    "rgba(45,125,111,0.14)",
};

/* ─────────────────── HELPERS ─────────────────── */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function statusOf(v, dangerBelow, warnBelow) {
  if (v < dangerBelow) return "danger";
  if (v < warnBelow)   return "warning";
  return "ok";
}

function tempStatus(t) {
  if (t > 32) return "danger";
  if (t > 29 || t < 22) return "warning";
  return "ok";
}

const STATUS_COLOR = {
  ok:      { bg: "#EAF6F0", text: "#1A7A4A", label: "Tốt" },
  warning: { bg: "#FFF3E0", text: "#B45A00", label: "Chú ý" },
  danger:  { bg: "#FEE9E8", text: "#C0392B", label: "Nguy hiểm" },
};

const now = () =>
  new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

/* ─────────────────── ATOMS ─────────────────── */

/** Pill badge */
function Badge({ status, children, style }) {
  const col = STATUS_COLOR[status] || STATUS_COLOR.ok;
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      background: col.bg,
      color: col.text,
      ...style,
    }}>
      {children ?? col.label}
    </span>
  );
}

/** Toggle switch */
function Toggle({ on, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!on)}
      style={{
        width: 42, height: 24, borderRadius: 12,
        background: on ? T.primary : "#D1D5DB",
        border: "none", position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background .25s", flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: "absolute",
        width: 18, height: 18, borderRadius: "50%",
        background: "#fff",
        top: 3, left: on ? 21 : 3,
        transition: "left .25s",
        boxShadow: "0 1px 4px rgba(0,0,0,.25)",
      }} />
    </button>
  );
}

/** Progress bar */
function Bar({ value, color, height = 8 }) {
  return (
    <div style={{ background: T.soft, borderRadius: 20, height, overflow: "hidden" }}>
      <div style={{
        width: `${clamp(value, 0, 100)}%`,
        height: "100%", borderRadius: 20,
        background: color,
        transition: "width .5s ease",
      }} />
    </div>
  );
}

/** Card wrapper */
function Card({ children, style }) {
  return (
    <div style={{
      background: T.card,
      borderRadius: 16,
      border: `0.5px solid ${T.border}`,
      padding: "18px 20px",
      ...style,
    }}>
      {children}
    </div>
  );
}

/** Section title inside card */
function CardTitle({ children, icon: Icon }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 15, fontWeight: 700, color: T.text,
      marginBottom: 16,
    }}>
      {Icon && <Icon size={16} color={T.primary} />}
      {children}
    </div>
  );
}

/** Metric sensor card */
function SensorCard({ title, value, unit, icon: Icon, status }) {
  const col = STATUS_COLOR[status] || STATUS_COLOR.ok;
  return (
    <Card style={{ textAlign: "center", padding: "18px 12px" }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: T.soft, margin: "0 auto 10px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={20} color={T.primary} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: col.text, lineHeight: 1 }}>
        {value}<span style={{ fontSize: 14, fontWeight: 500 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: T.muted, margin: "5px 0 8px", fontWeight: 600 }}>
        {title}
      </div>
      <Badge status={status} />
    </Card>
  );
}

/** Device toggle card */
function DeviceCard({ title, desc, icon: Icon, on, onChange, disabled, color }) {
  const active = on && !disabled;
  return (
    <Card style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 14px",
      background: active ? T.soft : T.card,
      transition: "background .25s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: active ? (color + "22") : "#F3F4F6",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} color={active ? color : "#9CA3AF"} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{title}</div>
          <div style={{ fontSize: 11, color: T.muted }}>{desc}</div>
        </div>
      </div>
      <Toggle on={on} onChange={onChange} disabled={disabled} />
    </Card>
  );
}

/** Alert row */
function AlertRow({ type, title, message, onClose }) {
  const cfg = {
    warning: { bg: "#FFF8EF", border: "#F4A03A", icon: AlertTriangle, color: "#B45A00" },
    error:   { bg: "#FEF0EF", border: "#E8604C", icon: AlertTriangle, color: "#C0392B" },
    info:    { bg: "#EFF8FF", border: "#4AB8E8", icon: Info,          color: "#0369A1" },
    success: { bg: "#EAF6F0", border: "#2D7D6F", icon: CheckCircle,   color: "#1A7A4A" },
  }[type] || {};
  const Icon = cfg.icon;
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 12, padding: "10px 14px",
    }}>
      <Icon size={16} color={cfg.color} style={{ marginTop: 1, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{title}</div>
        <div style={{ fontSize: 12, color: T.text, marginTop: 2 }}>{message}</div>
      </div>
      {onClose && (
        <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}>
          <X size={14} color={T.muted} />
        </button>
      )}
    </div>
  );
}

/** Activity timeline item */
function TimelineItem({ type, message, timestamp }) {
  const color = { success: "#1A7A4A", info: T.primary, warning: "#B45A00", error: "#C0392B" }[type] || T.muted;
  const dot   = { success: "#22C55E", info: T.primary, warning: "#F4A03A", error: "#E8604C" }[type] || T.muted;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        background: dot, marginTop: 4, flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{message}</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{timestamp}</div>
      </div>
    </div>
  );
}

/** Quick action button */
function ActionBtn({ icon: Icon, label, onClick, disabled, color = T.primary }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        padding: "12px 8px", borderRadius: 14,
        border: `1.5px solid ${disabled ? T.border : color + "44"}`,
        background: disabled ? "#F9FAFB" : T.soft,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        flex: 1, minWidth: 70, transition: "all .2s",
        fontFamily: "inherit",
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.background = color + "18")}
      onMouseLeave={e => !disabled && (e.currentTarget.style.background = T.soft)}
    >
      <Icon size={20} color={disabled ? T.muted : color} />
      <span style={{ fontSize: 11, fontWeight: 700, color: disabled ? T.muted : color }}>{label}</span>
    </button>
  );
}

/** Pet recognition panel */
function PetRecognition({ detected, dogFeederOpen, catFeederOpen }) {
  return (
    <Card>
      <CardTitle icon={PawPrint}>Nhận diện thú cưng</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Dog */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px", borderRadius: 12,
          background: detected === "dog" ? "#FFF9EC" : T.soft,
          border: `1.5px solid ${detected === "dog" ? T.secondary : T.border}`,
          transition: "all .3s",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "#FFF3D0", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Dog size={20} color="#E8A020" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Buddy</div>
            <div style={{ fontSize: 11, color: T.muted }}>Golden Retriever · 3 tuổi</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Badge status={detected === "dog" ? "ok" : "warning"}>
              {detected === "dog" ? "Đã phát hiện" : "Không thấy"}
            </Badge>
            {dogFeederOpen && (
              <div style={{ fontSize: 10, color: T.primary, marginTop: 4, fontWeight: 700 }}>
                🟢 Máy ăn đang mở
              </div>
            )}
          </div>
        </div>
        {/* Cat */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px", borderRadius: 12,
          background: detected === "cat" ? "#F5F0FF" : T.soft,
          border: `1.5px solid ${detected === "cat" ? "#A78BFA" : T.border}`,
          transition: "all .3s",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "#F0E8FF", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Cat size={20} color="#7C3AED" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Mochi</div>
            <div style={{ fontSize: 11, color: T.muted }}>Mèo Anh lông ngắn · 2 tuổi</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Badge status={detected === "cat" ? "ok" : "warning"}>
              {detected === "cat" ? "Đã phát hiện" : "Không thấy"}
            </Badge>
            {catFeederOpen && (
              <div style={{ fontSize: 10, color: "#7C3AED", marginTop: 4, fontWeight: 700 }}>
                🟢 Máy ăn đang mở
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ─────────────────── TAB BAR ─────────────────── */
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: "flex", gap: 4,
      background: "#F1F5F3", borderRadius: 12,
      padding: 4, marginBottom: 20,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 10,
            border: "none", cursor: "pointer",
            background: active === t.id ? T.card : "transparent",
            color: active === t.id ? T.primary : T.muted,
            fontWeight: active === t.id ? 700 : 500,
            fontSize: 13, fontFamily: "inherit",
            boxShadow: active === t.id ? "0 1px 4px rgba(0,0,0,.08)" : "none",
            transition: "all .2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          {t.icon && <t.icon size={14} />}
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────── MAIN COMPONENT ─────────────────── */
export default function PawHomeDashboard() {
  /* ── state ── */
  const [tab,        setTab]        = useState("overview");
  const [autoMode,   setAutoMode]   = useState(true);
  const [temp,       setTemp]       = useState(28);
  const [humidity,   setHumidity]   = useState(65);
  const [dogFood,    setDogFood]    = useState(75);
  const [catFood,    setCatFood]    = useState(18);
  const [water,      setWater]      = useState(72);
  const [detected,   setDetected]   = useState(null);   // "dog"|"cat"|null
  const [motion,     setMotion]     = useState(false);
  const [fanOn,      setFanOn]      = useState(false);
  const [heaterOn,   setHeaterOn]   = useState(false);
  const [pumpOn,     setPumpOn]     = useState(false);
  const [speakerOn,  setSpeakerOn]  = useState(true);
  const [alerts,     setAlerts]     = useState([]);
  const [dismissed,  setDismissed]  = useState(new Set());
  const [activities, setActivities] = useState([
    { id: "a1", type: "success", message: "Buddy đã ăn đúng giờ (12:00)", timestamp: "2 giờ trước" },
    { id: "a2", type: "info",    message: "Nước đã được refill tự động",  timestamp: "3 giờ trước" },
    { id: "a3", type: "warning", message: "Nhiệt độ phòng vượt 27°C",    timestamp: "4 giờ trước" },
  ]);
  const [chartData, setChartData] = useState([
    { time: "10:00", temp: 26, hum: 60 },
    { time: "11:00", temp: 27, hum: 62 },
    { time: "12:00", temp: 28, hum: 64 },
    { time: "13:00", temp: 29, hum: 65 },
    { time: "14:00", temp: 28, hum: 65 },
  ]);

  /* ── add activity helper ── */
  const addActivity = useCallback((type, message) => {
    setActivities(prev => [
      { id: Date.now().toString(), type, message, timestamp: "Vừa xong" },
      ...prev.slice(0, 9),
    ]);
  }, []);

  /* ── simulate sensor updates every 3 s ── */
  useEffect(() => {
    const id = setInterval(() => {
      setTemp(t  => clamp(t + (Math.random() - 0.5) * 2, 20, 36));
      setHumidity(h => clamp(h + (Math.random() - 0.5) * 4, 40, 85));
      setMotion(Math.random() > 0.85);
      const r = Math.random();
      setDetected(r > 0.65 ? (Math.random() > 0.5 ? "dog" : "cat") : r < 0.3 ? null : (p => p));
      if (Math.random() > 0.8) {
        setDogFood(p => clamp(p - Math.random() * 2, 0, 100));
        setCatFood(p => clamp(p - Math.random() * 2, 0, 100));
      }
      const t2 = new Date();
      const ts = `${t2.getHours()}:${String(t2.getMinutes()).padStart(2,"0")}`;
      setChartData(prev => [
        ...prev.slice(-4),
        { time: ts, temp: Math.round(clamp(temp + (Math.random()-0.5)*2,20,36)), hum: Math.round(clamp(humidity+(Math.random()-0.5)*4,40,85)) },
      ]);
    }, 3000);
    return () => clearInterval(id);
  }, [temp, humidity]);

  /* ── auto mode logic ── */
  useEffect(() => {
    if (!autoMode) return;
    setFanOn(temp > 30);
    setHeaterOn(temp < 22);
    if (water < 20) {
      setPumpOn(true);
      setTimeout(() => { setWater(w => clamp(w + 10, 0, 100)); setPumpOn(false); }, 1200);
    }
    if (dogFood < 20 && detected === "dog") {
      setDogFood(p => clamp(p + 25, 0, 100));
      addActivity("success", "Phát hiện Buddy đói, đã tự động nhả thức ăn!");
    }
    if (catFood < 20 && detected === "cat") {
      setCatFood(p => clamp(p + 25, 0, 100));
      addActivity("success", "Phát hiện Mochi đói, đã tự động nhả thức ăn!");
    }
  }, [autoMode, temp, water, dogFood, catFood, detected, addActivity]);

  /* ── generate alerts ── */
  useEffect(() => {
    const list = [];
    if (dogFood  < 20) list.push({ id:"df", type:"warning", title:"Thức ăn chó sắp hết",   message:"Thức ăn của Buddy còn dưới 20%! Vui lòng nạp thêm." });
    if (catFood  < 20) list.push({ id:"cf", type:"warning", title:"Thức ăn mèo sắp hết",   message:"Thức ăn của Mochi còn dưới 20%! Vui lòng nạp thêm." });
    if (water    < 20) list.push({ id:"wl", type:"warning", title:"Bình nước sắp cạn",      message:"Hệ thống sẽ tự động bơm thêm nước." });
    if (temp     > 32) list.push({ id:"th", type:"error",   title:"Nhiệt độ quá cao",       message:"Nhiệt độ vượt 32°C! Quạt đang được kích hoạt." });
    if (temp     < 20) list.push({ id:"tl", type:"error",   title:"Nhiệt độ quá thấp",      message:"Nhiệt độ dưới 20°C! Đèn sưởi đang hoạt động." });
    if (motion && speakerOn)
                       list.push({ id:"md", type:"info",    title:"Phát hiện chuyển động",  message:"Thú cưng đang ở khu vực cấm! Đang phát cảnh báo âm thanh." });
    setAlerts(list.filter(a => !dismissed.has(a.id)));
  }, [dogFood, catFood, water, temp, motion, speakerOn, dismissed]);

  /* ── derived ── */
  const dogFeederOpen = detected === "dog";
  const catFeederOpen = detected === "cat";

  /* ── manual actions ── */
  const feedDog     = () => { setDogFood(p => clamp(p+15,0,100)); addActivity("success","Đã nhả thức ăn thủ công cho Buddy"); };
  const feedCat     = () => { setCatFood(p => clamp(p+15,0,100)); addActivity("success","Đã nhả thức ăn thủ công cho Mochi"); };
  const refillWater = () => { setWater(p => clamp(p+20,0,100));   addActivity("success","Đã bơm nước thủ công"); };
  const takePhoto   = () => {                                       addActivity("info",  "Đã chụp ảnh thú cưng"); };

  /* ── advice string ── */
  const advice = temp > 29
    ? "Nhiệt độ hơi cao, nên bật quạt làm mát cho thú cưng."
    : temp < 22
    ? "Nhiệt độ thấp, nên bật đèn sưởi giữ ấm."
    : "Môi trường ổn định, thú cưng đang khỏe mạnh! 🐾";

  /* ─── RENDER ─── */
  return (
    <div style={{
      minHeight: "100vh", background: T.bg, padding: "16px",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif", color: T.text,
    }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>

        {/* ── HEADER ── */}
        <div style={{
          background: `linear-gradient(135deg, ${T.primary}, ${T.primary2})`,
          borderRadius: 20, padding: "20px 24px",
          display: "flex", flexWrap: "wrap", alignItems: "center",
          justifyContent: "space-between", gap: 16, marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "rgba(255,255,255,.2)", backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <PawPrint size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff" }}>
                PawHome Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,.8)" }}>
                Hệ thống chăm sóc thú cưng thông minh
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* online badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,.18)", borderRadius: 10,
              padding: "7px 14px",
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#4ADE80", display: "inline-block",
                animation: "pulse 2s infinite",
              }} />
              <span style={{ color: "#fff", fontSize: 13 }}>Đang kết nối</span>
            </div>
            {/* auto/manual toggle */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#fff", borderRadius: 12, padding: "8px 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,.1)",
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>
                {autoMode ? "🤖 Tự động" : "🎛️ Thủ công"}
              </span>
              <Toggle on={autoMode} onChange={setAutoMode} />
            </div>
          </div>
        </div>

        {/* ── ALERTS ── */}
        {alerts.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {alerts.map(a => (
              <AlertRow
                key={a.id} type={a.type} title={a.title} message={a.message}
                onClose={() => setDismissed(s => new Set([...s, a.id]))}
              />
            ))}
          </div>
        )}

        {/* ── TABS ── */}
        <TabBar
          tabs={[
            { id: "overview",   label: "Tổng quan",   icon: Activity },
            { id: "controls",   label: "Điều khiển",  icon: Settings },
            { id: "analytics",  label: "Phân tích",   icon: ChevronRight },
          ]}
          active={tab}
          onChange={setTab}
        />

        {/* ══════════ TAB: OVERVIEW ══════════ */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* sensor row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
              <SensorCard title="Nhiệt độ"     value={temp.toFixed(1)}         unit="°C" icon={Thermometer} status={tempStatus(temp)} />
              <SensorCard title="Độ ẩm"        value={Math.round(humidity)}    unit="%"  icon={Droplets}    status="ok" />
              <SensorCard title="Thức ăn chó"  value={Math.round(dogFood)}     unit="%"  icon={Utensils}    status={statusOf(dogFood,20,40)} />
              <SensorCard title="Thức ăn mèo"  value={Math.round(catFood)}     unit="%"  icon={Utensils}    status={statusOf(catFood,20,40)} />
              <SensorCard title="Mực nước"     value={Math.round(water)}       unit="%"  icon={Droplet}     status={statusOf(water,20,40)} />
            </div>

            {/* mid row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
              <PetRecognition detected={detected} dogFeederOpen={dogFeederOpen} catFeederOpen={catFeederOpen} />

              {/* storage levels */}
              <Card>
                <CardTitle icon={Activity}>Mức độ dự trữ</CardTitle>
                {[
                  { label: "Thức ăn Buddy",  val: dogFood,  color: T.secondary },
                  { label: "Thức ăn Mochi",  val: catFood,  color: "#A78BFA"  },
                  { label: "Nước uống",      val: water,    color: T.water    },
                ].map(row => (
                  <div key={row.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.muted }}>{row.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{Math.round(row.val)}%</span>
                    </div>
                    <Bar value={row.val} color={row.color} />
                  </div>
                ))}
                <div style={{
                  marginTop: 8, padding: "10px 12px",
                  background: T.soft, borderRadius: 10,
                  fontSize: 12, color: T.text, lineHeight: 1.6,
                }}>
                  <strong style={{ color: T.primary }}>💡 Lời khuyên: </strong>{advice}
                </div>
              </Card>
            </div>

            {/* quick actions */}
            <Card>
              <CardTitle icon={Activity}>Thao tác nhanh</CardTitle>
              {autoMode && (
                <p style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>
                  ⚙️ Đang ở chế độ tự động — chuyển sang Thủ công để kích hoạt
                </p>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <ActionBtn icon={Utensils} label="Nhả ăn chó"  onClick={feedDog}     disabled={autoMode} color={T.secondary} />
                <ActionBtn icon={Utensils} label="Nhả ăn mèo"  onClick={feedCat}     disabled={autoMode} color="#A78BFA" />
                <ActionBtn icon={Droplet}  label="Bơm nước"    onClick={refillWater} disabled={autoMode} color={T.water} />
                <ActionBtn icon={Camera}   label="Chụp ảnh"    onClick={takePhoto}   disabled={false}    color={T.primary} />
              </div>
            </Card>

            {/* device status overview */}
            <Card>
              <CardTitle icon={Settings}>Trạng thái thiết bị</CardTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
                {[
                  { icon: Fan,     label: "Quạt",         on: fanOn,     color: T.primary },
                  { icon: Lightbulb, label: "Đèn sưởi",  on: heaterOn,  color: T.secondary },
                  { icon: Droplet, label: "Máy bơm",      on: pumpOn,    color: T.water },
                  { icon: Volume2, label: "Loa cảnh báo", on: speakerOn, color: T.accent },
                ].map(d => (
                  <div key={d.label} style={{
                    textAlign: "center", padding: "14px 8px",
                    background: d.on ? T.soft : "#F9FAFB",
                    borderRadius: 12,
                    border: `0.5px solid ${d.on ? d.color + "44" : T.border}`,
                    transition: "all .25s",
                  }}>
                    <d.icon size={24} color={d.on ? d.color : "#D1D5DB"} />
                    <div style={{ fontSize: 11, fontWeight: 700, marginTop: 8, color: T.text }}>{d.label}</div>
                    <Badge status={d.on ? "ok" : "warning"}>{d.on ? "Bật" : "Tắt"}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ══════════ TAB: CONTROLS ══════════ */}
        {tab === "controls" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {autoMode ? (
              <Card>
                <CardTitle icon={Settings}>Chế độ tự động đang bật</CardTitle>
                <p style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>
                  Hệ thống tự điều khiển dựa theo cảm biến. Bật Thủ công ở header để điều khiển trực tiếp.
                </p>
                <div style={{
                  background: T.soft, borderRadius: 12, padding: "14px 16px",
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  {[
                    "✓ Quạt sẽ bật khi nhiệt độ > 30°C",
                    "✓ Đèn sưởi sẽ bật khi nhiệt độ < 22°C",
                    "✓ Máy bơm tự động khi mực nước < 20%",
                    "✓ Máy nhả thức ăn chỉ mở khi nhận diện đúng thú cưng",
                    "✓ Loa phát cảnh báo khi phát hiện chuyển động khu cấm",
                  ].map(r => (
                    <p key={r} style={{ margin: 0, fontSize: 13, color: T.text }}>{r}</p>
                  ))}
                </div>
              </Card>
            ) : (
              <>
                <Card>
                  <CardTitle icon={Settings}>Điều khiển thiết bị thủ công</CardTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10 }}>
                    <DeviceCard icon={Fan}       title="Quạt mini"     desc="Làm mát môi trường"         on={fanOn}     onChange={setFanOn}     color={T.primary} />
                    <DeviceCard icon={Lightbulb} title="Đèn sưởi"      desc="Giữ ấm khi lạnh"           on={heaterOn}  onChange={setHeaterOn}  color={T.secondary} />
                    <DeviceCard icon={Droplet}   title="Máy bơm nước"  desc="Bơm nước vào bình"         on={pumpOn}    onChange={v => { setPumpOn(v); if(v) setTimeout(()=>{ setWater(w=>clamp(w+10,0,100)); setPumpOn(false); }, 1200); }} color={T.water} />
                    <DeviceCard icon={Volume2}   title="Loa cảnh báo"  desc="Phát âm báo khu vực cấm"   on={speakerOn} onChange={setSpeakerOn} color={T.accent} />
                  </div>
                </Card>

                <Card>
                  <CardTitle icon={Utensils}>Nhả thức ăn thủ công</CardTitle>
                  <div style={{ display: "flex", gap: 10 }}>
                    <ActionBtn icon={Utensils} label="Nhả ăn cho Buddy" onClick={feedDog}  disabled={false} color={T.secondary} />
                    <ActionBtn icon={Utensils} label="Nhả ăn cho Mochi" onClick={feedCat}  disabled={false} color="#A78BFA" />
                    <ActionBtn icon={Droplet}  label="Bơm nước"          onClick={refillWater} disabled={false} color={T.water} />
                    <ActionBtn icon={Camera}   label="Chụp ảnh"          onClick={takePhoto}   disabled={false} color={T.primary} />
                  </div>
                </Card>

                <Card>
                  <CardTitle>Hướng dẫn sử dụng</CardTitle>
                  {[
                    ["Quạt mini",     "Bật khi nhiệt độ > 27°C để làm mát môi trường sống"],
                    ["Đèn sưởi",      "Bật khi nhiệt độ < 22°C để giữ ấm cho thú cưng"],
                    ["Máy bơm nước",  "Bơm thêm nước khi mực nước xuống dưới 30%"],
                    ["Loa cảnh báo",  "Phát âm báo khi phát hiện thú cưng vào khu vực cấm"],
                  ].map(([title, desc]) => (
                    <p key={title} style={{ fontSize: 13, color: T.text, marginBottom: 8 }}>
                      <strong style={{ color: T.primary }}>• {title}:</strong> {desc}
                    </p>
                  ))}
                </Card>
              </>
            )}
          </div>
        )}

        {/* ══════════ TAB: ANALYTICS ══════════ */}
        {tab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* charts */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14 }}>
              {[
                { title: "Xu hướng nhiệt độ (°C)", key: "temp",  color: T.accent },
                { title: "Xu hướng độ ẩm (%)",     key: "hum",   color: T.water  },
              ].map(ch => (
                <Card key={ch.key}>
                  <CardTitle>{ch.title}</CardTitle>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: T.muted }} />
                      <YAxis tick={{ fontSize: 11, fill: T.muted }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 10, fontSize: 12, border: `1px solid ${T.border}` }}
                      />
                      <Line type="monotone" dataKey={ch.key} stroke={ch.color} strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              ))}
            </div>

            {/* activity timeline */}
            <Card>
              <CardTitle icon={Bell}>Nhật ký hoạt động</CardTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {activities.map(a => (
                  <TimelineItem key={a.id} type={a.type} message={a.message} timestamp={a.timestamp} />
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── FOOTER ── */}
        <p style={{
          textAlign: "center", fontSize: 11, color: T.muted,
          marginTop: 24, paddingBottom: 12,
        }}>
          PawHome v1.0 · Hệ sinh thái chăm sóc thú cưng thông minh · Cập nhật lúc {now()}
        </p>

      </div>

      {/* global keyframe for pulse dot */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        * { box-sizing: border-box; }
        button:focus { outline: none; }
      `}</style>
    </div>
  );
}
