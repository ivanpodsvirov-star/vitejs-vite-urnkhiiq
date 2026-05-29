// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";

const SAVE_KEY = "poklikai_admin_edc27_v12_gold_12000";
const PLAYER_ID_KEY = "poklikai_admin_player_id_v1";

const BASE_CHANCE = 100 / 12000;
const UPGRADE_CHANCE = 0.001;
const HOURLY_BONUS_CHANCE = 0.0002;
const MAX_CHANCE = 0.05;
const START_UPGRADE_COST = 1200;
const COST_GROWTH = 1.45;

const ROULETTE_SYMBOLS = ["🔦", "⚡", "🔋", "💡", "⭐"];

const ADMIN_LINES = [
  "клик принят",
  "не жми так яростно",
  "турбо не навсегда",
  "я все вижу из-под капюшона",
  "удача любит терпеливых",
  "люменов много не бывает",
  "официальный админ на месте",
  "палец работает на ROI",
];

const FORTUNES = [
  "Скоро тебе повезет, но палец еще должен поработать.",
  "В ближайшей темноте тебе понадобится надежный свет.",
  "Следующий удачный клик может быть ближе, чем кажется.",
  "Сегодня шанс улыбается тем, кто не сдается.",
  "Твой будущий EDC уже где-то рядом.",
  "Скоро один маленький луч решит большую проблему.",
  "Впереди темный участок, но ты будешь готов.",
  "Фонарь появится тогда, когда ты меньше всего ждешь.",
  "Будущий победитель обычно делает еще один клик.",
  "Свет уже ищет тебя. Осталось не пропустить момент.",
  "Через несколько кликов ты можешь пожалеть, что остановился.",
  "Темнота впереди, но у тебя будет преимущество.",
  "Сегодня случайность работает не против тебя.",
  "Золотой фонарь любит терпеливых.",
  "Скоро экран может показать то, ради чего ты здесь.",
  "Каждый клик приближает момент, который нельзя пропустить.",
  "В будущем тебя ждет яркая находка.",
  "Не все удачные клики выглядят важными сразу.",
  "Админ делает вид, что ничего не знает, но он что-то знает.",
  "Свет появится внезапно. Будь готов.",
  "Удача не шумит заранее.",
  "Твой приз может быть ближе, чем кажется.",
  "Сегодня лучше сделать еще один клик.",
  "Будущий победитель не закрывает игру слишком рано.",
  "Иногда самый важный клик выглядит обычным.",
  "Фонарь не спешит, но он уже где-то в игре.",
  "Скоро терпение может стать твоим главным преимуществом.",
  "Если экран потемнел, значит свет будет заметнее.",
  "Админ молчит, но рандом уже думает.",
  "Сделай паузу, но не сдавайся.",
];

const ADS = [
  ["EDC35", "Мощный плоский EDC-фонарь для города, машины и ежедневного набора.", "EDC-фонарь", "https://nitecore.ru/catalog/fonari/edc35-/"],
  ["EDC09", "Компактный фонарь на каждый день. Быстро достать, удобно носить.", "Компактный EDC", "https://nitecore.ru/catalog/fonari/ruchnye-fonari/edc-fonari-dlya-issledovateley-i-puteshestvennikov/edc09/"],
  ["EDC17", "Карманный фонарь для тех, кто любит быть готовым к темноте заранее.", "На каждый день", "https://nitecore.ru/catalog/fonari/ruchnye-fonari/edc-fonari-dlya-issledovateley-i-puteshestvennikov/edc17/"],
  ["TIP SE Black", "Мини-фонарь на ключи. Маленький формат, быстрый доступ к свету.", "Наключный фонарь", "https://nitecore.ru/catalog/fonari/tip-se-black/"],
  ["CARBO 10000", "Пауэрбанк для телефона, фонаря и другой техники, когда розетка далеко.", "Питание", "https://nitecore.ru/catalog/istochniki-pitaniya/power-bank/carbo-10000-/"],
];

const ACHIEVEMENTS = [
  { id: "start", need: 5, title: "Первый свет", text: "5 кликов. Фонарь только включился.", icon: "✦" },
  { id: "spark", need: 10, title: "Первая искра", text: "10 кликов. Админ понял, что ты настроен серьезно.", icon: "✧" },
  { id: "warm", need: 25, title: "Разогрев диода", text: "25 кликов. Свет становится ярче.", icon: "◌" },
  { id: "beam", need: 50, title: "Первый луч", text: "50 кликов. Луч уже прорезает темноту.", icon: "▸" },
  { id: "pocket", need: 100, title: "Карманный EDC", text: "100 кликов. Свет уже лежит в кармане.", icon: "🔦" },
  { id: "clip", need: 250, title: "Клипса на месте", text: "250 кликов. Фонарь готов к ежедневному ношению.", icon: "▰" },
  { id: "promo5", need: 500, title: "Промокод 5%", text: "500 кликов. Открывается промокод на скидку 5%.", reward: "NITECORE5", icon: "🎟" },
  { id: "mode", need: 750, title: "Смена режима", text: "750 кликов. Ты научился управлять светом.", icon: "◐" },
  { id: "turbo", need: 1000, title: "Режим турбо", text: "1000 кликов. Палец вышел на максимальную яркость.", icon: "⚡" },
  { id: "throw", need: 1500, title: "Дальний луч", text: "1500 кликов. Свет улетает дальше обычного.", icon: "➤" },
  { id: "camp", need: 3000, title: "Ночной лагерь", text: "3000 кликов. В темноте уже не страшно.", icon: "▲" },
  { id: "lumen", need: 5000, title: "Люмен-мастер", text: "5000 кликов. Люмены под контролем.", icon: "◉" },
  { id: "water", need: 7500, title: "Защита от дождя", text: "7500 кликов. Погода больше не аргумент.", icon: "◆" },
  { id: "guard", need: 10000, title: "Ночной дозор", text: "10000 кликов. Админ уважает выдержку.", icon: "◈" },
  { id: "trail", need: 15000, title: "Тропа освещена", text: "15000 кликов. Можно идти дальше.", icon: "⬢" },
  { id: "battery", need: 20000, title: "21700 внутри", text: "20000 кликов. Запас энергии почти легендарный.", icon: "▣" },
  { id: "legend", need: 25000, title: "Легенда канала", text: "25000 кликов. Ты почти дошел до главной скидки.", icon: "✹" },
  { id: "promo20", need: 30000, title: "Промокод 20%", text: "30000 кликов. Открывается промокод на скидку 20%.", reward: "NITECORE20", icon: "★" },
];

const defaultGame = {
  coins: 0,
  totalClicks: 0,
  chanceLevel: 0,
  hourlyBoost: 0,
  lastHourlyVisit: 0,
  wins: 0,
  lastWinAt: 0,
  rouletteDone: false,
  rouletteWin: false,
};

const rnd = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const num = (n: number) =>
  n >= 1000000
    ? (n / 1000000).toFixed(1) + "M"
    : n >= 1000
    ? (n / 1000).toFixed(1) + "K"
    : String(Math.floor(n || 0));

const chance = (g: any) =>
  Math.min(
    BASE_CHANCE + g.chanceLevel * UPGRADE_CHANCE + g.hourlyBoost * HOURLY_BONUS_CHANCE,
    MAX_CHANCE
  );

const cost = (lvl: number) => Math.floor(START_UPGRADE_COST * Math.pow(COST_GROWTH, lvl));
const makeId = () => window.crypto?.randomUUID?.() || "guest_" + Date.now();

function withHourlyBonus(g: any) {
  const now = Date.now();

  if (!g.lastHourlyVisit || now - g.lastHourlyVisit >= 3600000) {
    return {
      ...g,
      hourlyBoost: Math.min((g.hourlyBoost || 0) + 1, 149),
      lastHourlyVisit: now,
    };
  }

  return g;
}

function Stat({ title, value }: any) {
  return (
    <div className="stat">
      <span>{title}</span>
      <b>{value}</b>
    </div>
  );
}

export default function App() {
  const [game, setGame] = useState(defaultGame);
  const [player, setPlayer] = useState("Игрок");
  const [gold, setGold] = useState<any>(null);
  const [cookie, setCookie] = useState<any>(null);
  const [fortune, setFortune] = useState("");
  const [float, setFloat] = useState<any[]>([]);
  const [win, setWin] = useState(false);
  const [rules, setRules] = useState(true);
  const [thought, setThought] = useState("");
  const [ad, setAd] = useState<any>(null);
  const [hit, setHit] = useState(false);
  const [mood, setMood] = useState("normal");
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [achToast, setAchToast] = useState<any>(null);
  const [roulette, setRoulette] = useState<any>(null);

  const adminRef = useRef<any>(null);
  const audioRef = useRef<any>(null);
  const musicRef = useRef<any>(null);

  const curChance = useMemo(() => chance(game), [game.chanceLevel, game.hourlyBoost]);
  const upCost = useMemo(() => cost(game.chanceLevel), [game.chanceLevel]);

  const achList = useMemo(
    () =>
      ACHIEVEMENTS.map((a) => ({
        ...a,
        unlocked: game.totalClicks >= a.need,
      })),
    [game.totalClicks]
  );

  const achDone = achList.filter((a) => a.unlocked).length;

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready?.();
    tg?.expand?.();

    const u = tg?.initDataUnsafe?.user;
    localStorage.setItem(PLAYER_ID_KEY, u?.id ? String(u.id) : localStorage.getItem(PLAYER_ID_KEY) || makeId());

    if (u?.username) setPlayer("@" + u.username);
    else if (u?.first_name) setPlayer(u.first_name);

    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      setGame(withHourlyBonus(saved ? { ...defaultGame, ...saved } : defaultGame));
    } catch {
      setGame(withHourlyBonus(defaultGame));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game]);

  function ctx() {
    const AC = window.AudioContext || window.webkitAudioContext;

    if (!AC) return null;
    if (!audioRef.current) audioRef.current = new AC();
    if (audioRef.current.state === "suspended") audioRef.current.resume();

    return audioRef.current;
  }

  function beep(f = 600, d = 0.06, v = 0.025, type = "sine") {
    if (!sound) return;

    const c = ctx();
    if (!c) return;

    const o = c.createOscillator();
    const g = c.createGain();

    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(v, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d);

    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + d + 0.02);
  }

  useEffect(() => {
    clearInterval(musicRef.current);
    musicRef.current = null;

    if (!music) return;

    const notes = [196, 247, 294, 330, 294, 247];
    let i = 0;

    musicRef.current = setInterval(() => {
      if (sound) beep(notes[i++ % notes.length], 0.35, 0.012, "sine");
    }, 780);

    return () => clearInterval(musicRef.current);
  }, [music, sound]);

  function addFloat(text: string) {
    const id = Date.now() + Math.random();

    setFloat((f) => [...f, { id, text, x: Math.random() * 90 - 45 }]);

    setTimeout(() => {
      setFloat((f) => f.filter((v) => v.id !== id));
    }, 650);
  }

  function sayAdmin() {
    setThought(rnd(ADMIN_LINES));
    setTimeout(() => setThought(""), 2200);
  }

  function loserSlots() {
    let slots = [rnd(ROULETTE_SYMBOLS), rnd(ROULETTE_SYMBOLS), rnd(ROULETTE_SYMBOLS)];

    while (slots[0] === slots[1] && slots[1] === slots[2]) {
      slots = [rnd(ROULETTE_SYMBOLS), rnd(ROULETTE_SYMBOLS), rnd(ROULETTE_SYMBOLS)];
    }

    return slots;
  }

  function startRoulette() {
    if (roulette?.active) return;

    const isWin = Math.random() < 0.35;

    setRoulette({
      active: true,
      spinning: true,
      slots: ["?", "?", "?"],
      win: false,
    });

    beep(320, 0.08, 0.03, "square");
    setTimeout(() => beep(420, 0.08, 0.03, "square"), 160);
    setTimeout(() => beep(520, 0.08, 0.03, "square"), 320);

    setTimeout(() => {
      const result = isWin ? ["🔦", "🔦", "🔦"] : loserSlots();

      setRoulette({
        active: true,
        spinning: false,
        slots: result,
        win: isWin,
      });

      setGame((g) => ({
        ...g,
        rouletteWin: isWin,
      }));

      if (isWin) {
        beep(680, 0.1, 0.04, "triangle");
        setTimeout(() => beep(880, 0.12, 0.04, "triangle"), 100);
      } else {
        beep(220, 0.16, 0.025, "sawtooth");
      }
    }, 3300);
  }

  useEffect(() => {
    if (rules) return;

    const t = setInterval(() => {
      setAd((old: any) => {
        if (old || gold || cookie || fortune || roulette?.active) return old;
        return rnd(ADS);
      });
    }, 60000);

    return () => clearInterval(t);
  }, [rules, gold, cookie, fortune, roulette]);

  function openAd() {
    const link = ad?.[3] || ADS[0][3];
    const tg = window.Telegram?.WebApp;

    setAd(null);

    setTimeout(() => {
      try {
        if (tg?.openLink) {
          tg.openLink(link, { try_instant_view: false });
        } else {
          const opened = window.open(link, "_blank", "noopener,noreferrer");
          if (!opened) window.location.href = link;
        }
      } catch {
        window.location.href = link;
      }
    }, 30);
  }

  function spawnGold() {
    if (gold || ad || rules || cookie || fortune || roulette?.active) return;

    const id = Date.now() + Math.random();

    const item = {
      id,
      top: 70 + Math.random() * 200,
      time: 3.2 + Math.random(),
      dir: Math.random() > 0.5 ? "left" : "right",
    };

    setGold(item);
    setTimeout(() => setGold((g: any) => (g?.id === id ? null : g)), item.time * 1000);
  }

  function spawnCookie() {
    if (cookie || fortune || ad || rules || gold || roulette?.active) return;

    const id = Date.now() + Math.random();

    const item = {
      id,
      left: 12 + Math.random() * 76,
      time: 5,
    };

    setCookie(item);
    setTimeout(() => setCookie((c: any) => (c?.id === id ? null : c)), item.time * 1000);
  }

  function openCookie(e: any) {
    e.preventDefault();
    e.stopPropagation();

    setCookie(null);
    setFortune(rnd(FORTUNES));
    beep(520, 0.08, 0.02, "triangle");
  }

  function closeCookie(e: any) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setFortune("");
  }

  function winGold(e: any) {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!gold) return;

    setGold(null);
    setWin(true);

    beep(660, 0.08, 0.04);
    setTimeout(() => beep(900, 0.1, 0.035), 80);

    setGame((g) => ({
      ...g,
      wins: g.wins + 1,
      lastWinAt: g.totalClicks,
    }));

    setTimeout(() => setWin(false), 4200);
  }

  function showAchievementToast(a: any) {
    setAchToast(a);
    addFloat("достижение!");

    beep(760, 0.08, 0.035, "triangle");
    setTimeout(() => beep(980, 0.09, 0.03, "triangle"), 90);

    setTimeout(() => setAchToast(null), 3600);
  }

  function clickAdmin() {
    beep(620 + Math.random() * 90, 0.05, 0.022);

    setGame((g) => {
      const n = g.totalClicks + 1;
      const launchRoulette = n === 1000 && !g.rouletteDone;

      if (launchRoulette) {
        setTimeout(startRoulette, 0);
      }

      if (!launchRoulette && Math.random() * 100 <= chance(g)) {
        setTimeout(spawnGold, 0);
      }

      if (n % 10 === 0) {
        setHit(false);
        setTimeout(() => setHit(true), 0);
        setTimeout(() => setHit(false), 280);
      }

      if (n % 5 === 0) {
        const common = ["happy", "angry", "surprised", "tired", "blink", "smirk"];
        const rare = ["evil", "steam", "lightning", "shock"];

        setMood(rnd(n % 25 === 0 || Math.random() > 0.86 ? rare : common));
        setTimeout(() => setMood("normal"), 1500);
      }

      if (n % 100 === 0 && !launchRoulette) {
        setTimeout(spawnCookie, 0);
      }

      const newAch = ACHIEVEMENTS.find((a) => a.need === n);
      if (newAch) {
        setTimeout(() => showAchievementToast(newAch), 0);
      }

      if (Math.random() > 0.985) {
        setTimeout(sayAdmin, 0);
      }

      return {
        ...g,
        coins: g.coins + 1,
        totalClicks: n,
        rouletteDone: launchRoulette ? true : g.rouletteDone,
      };
    });

    addFloat("+1");
  }

  function pressArea(e: any) {
    if (rules || ad || fortune || roulette?.active) return;

    const r = adminRef.current?.getBoundingClientRect();
    if (!r) return;

    const ok =
      e.clientX >= r.left - 18 &&
      e.clientX <= r.right + 18 &&
      e.clientY >= r.top - 18 &&
      e.clientY <= r.bottom + 18;

    if (!ok) return;

    e.preventDefault();
    e.stopPropagation();

    clickAdmin();
  }

  function upgrade() {
    if (game.coins < upCost || curChance >= MAX_CHANCE) return;

    beep(520, 0.08, 0.03, "triangle");

    setGame((g) => ({
      ...g,
      coins: g.coins - upCost,
      chanceLevel: g.chanceLevel + 1,
    }));

    addFloat("удача +");
  }

  return (
    <div className="game">
      <style>{css}</style>

      <div className="prize">
        Приз: <b>EDC27</b>
      </div>

      {achToast && (
        <div className="achToast">
          <div className="achToastIcon">{achToast.icon}</div>
          <div>
            <b>Достижение открыто!</b>
            <span>{achToast.title}</span>
            {achToast.reward && <em>Промокод: {achToast.reward}</em>}
          </div>
        </div>
      )}

      {rules && (
        <div className="overlay">
          <div className="modal">
            <div className="badge">Правила розыгрыша</div>
            <h2>Поймай золотой фонарь</h2>
            <p>
              Кликайте по админу, поймайте золотой фонарь и отправьте скриншот победы в комментарии.
              Первый скриншот забирает приз.
            </p>

            <div className="rulesList">
              <div><b>1.</b> Кликайте по админу и копите монеты.</div>
              <div><b>2.</b> Улучшайте удачу и возвращайтесь в игру каждый день.</div>
              <div><b>3.</b> Когда появится золотой фонарь, нажмите на него.</div>
              <div><b>4.</b> Сделайте скриншот победы и отправьте его в комментарии.</div>
            </div>

            <button onClick={() => setRules(false)}>Понятно, играть</button>
          </div>
        </div>
      )}

      {ad && (
        <div className="overlay adO">
          <div className="modal adM">
            <div className="badge dark">{ad[2]}</div>
            <h2>{ad[0]}</h2>
            <p>{ad[1]}</p>

            <div className="adBtns">
              <button onClick={openAd}>На сайт</button>
              <button className="ghost" onClick={() => setAd(null)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {roulette?.active && (
        <div className="overlay rouletteO">
          <div className="modal rouletteM">
            <div className="badge">Рулетка на 1000 клике</div>
            <h2>{roulette.spinning ? "Крутим рулетку" : roulette.win ? "Выпало три фонаря!" : "Не в этот раз"}</h2>

            <div className="slots">
              {[0, 1, 2].map((i) => (
                <div key={i} className={"slot " + (roulette.spinning ? "spinning" : "")}>
                  {roulette.spinning ? (
                    <div className="reel">
                      <span>🔦</span>
                      <span>⚡</span>
                      <span>🔋</span>
                      <span>💡</span>
                      <span>⭐</span>
                      <span>🔦</span>
                    </div>
                  ) : (
                    <span>{roulette.slots[i]}</span>
                  )}
                </div>
              ))}
            </div>

            {roulette.spinning ? (
              <p>Если выпадет три фонаря, откроется промокод на скидку 20%.</p>
            ) : roulette.win ? (
              <div className="promoBox">
                <span>Промокод 20%:</span>
                <b>NITECORE20</b>
                <small>Сделай скриншот, чтобы не потерять.</small>
              </div>
            ) : (
              <p>Рулетка была только на 1000 клике. Повторного запуска не будет.</p>
            )}

            {!roulette.spinning && (
              <button onClick={() => setRoulette(null)}>Закрыть</button>
            )}
          </div>
        </div>
      )}

      {achOpen && (
        <div className="overlay">
          <div className="modal achModal">
            <div className="badge">Достижения</div>
            <h2>Фонарные достижения</h2>
            <p>Открыто: {achDone} из {ACHIEVEMENTS.length}. Закрытые достижения полностью скрыты до получения.</p>

            <div className="achList">
              {achList.map((a) => (
                <div key={a.id} className={"ach " + (a.unlocked ? "open" : "lock")}>
                  <div className="achHead">
                    <div className={"achIcon " + (a.unlocked ? "open" : "lock")}>
                      {a.unlocked ? a.icon : "?"}
                    </div>

                    <div className="achText">
                      <b>{a.unlocked ? a.title : "Секретное достижение"}</b>
                      <span>{a.unlocked ? a.text : "Описание скрыто до открытия."}</span>
                    </div>
                  </div>

                  {a.reward && (
                    <em>{a.unlocked ? "Промокод: " + a.reward : "Награда скрыта"}</em>
                  )}

                  <small>{a.unlocked ? "Открыто" : "Условие скрыто"}</small>
                  <i><u style={{ width: a.unlocked ? "100%" : "0%" }} /></i>
                </div>
              ))}
            </div>

            <button onClick={() => setAchOpen(false)}>Закрыть</button>
          </div>
        </div>
      )}

      <div className="top">
        <div className="sound">
          <button onClick={() => setSound((s) => !s)}>Звук: {sound ? "вкл" : "выкл"}</button>
          <button onClick={() => setMusic((m) => !m)}>Музыка: {music ? "вкл" : "выкл"}</button>
        </div>

        <div className="title">
          <span>NITECORE</span>
          <h1>Кликни админа</h1>
        </div>
      </div>

      <div className="stats">
        <Stat title="Монеты" value={num(game.coins)} />
        <Stat title="Клики" value={num(game.totalClicks)} />
      </div>

      <div className="main">
        <div className="zone" onPointerDown={pressArea}>
          <div className="back" />

          {gold && (
            <button
              className={"gold " + gold.dir}
              style={{ top: gold.top, animationDuration: gold.time + "s" }}
              onPointerDown={winGold}
            >
              <i />
              <b />
              <span>ЖМИ!</span>
            </button>
          )}

          {cookie && (
            <div
              className="cookie"
              style={{ left: cookie.left + "%", animationDuration: cookie.time + "s" }}
              onPointerDown={openCookie}
            >
              <i />?
            </div>
          )}

          {fortune && (
            <div className="fortune" onPointerDown={closeCookie}>
              <b>Печенье с предсказанием</b>
              <p>{fortune}</p>
              <small>Нажми, чтобы закрыть</small>
            </div>
          )}

          {win && (
            <div className="win">
              <b>Победа!</b>
              <span>Ты поймал золотой фонарь</span>
              <strong>Приз: лимитированный Nitecore EDC27</strong>
            </div>
          )}

          <div className="adminWrap">
            {thought && <div className="bubble">{thought}</div>}

            {float.map((f) => (
              <div key={f.id} className="float" style={{ marginLeft: f.x }}>
                {f.text}
              </div>
            ))}

            <Admin refEl={adminRef} hit={hit} mood={mood} />
          </div>
        </div>

        <div className="side">
          <div className="info">
            <h3>Как играть</h3>
            <p>Поймай золотой фонарь, сделай скриншот победы и отправь его в комментарии.</p>
          </div>

          <button className="achBtn" onClick={() => setAchOpen(true)}>
            Достижения: {achDone}/{ACHIEVEMENTS.length}
          </button>

          <button className="upgrade" disabled={game.coins < upCost || curChance >= MAX_CHANCE} onClick={upgrade}>
            {curChance >= MAX_CHANCE
              ? "Максимальный уровень"
              : "Улучшить удачу за " + num(upCost) + " монет"}
          </button>

          {game.rouletteDone && (
            <div className="info">
              <span>Рулетка на 1000 клике</span>
              <b>{game.rouletteWin ? "Промокод 20% открыт" : "Попытка использована"}</b>
            </div>
          )}

          {game.wins > 0 && (
            <div className="info">
              <span>Последний выигрыш</span>
              <b>EDC27 на {num(game.lastWinAt)} кликах</b>
            </div>
          )}
        </div>
      </div>

      <div className="bottom">
        Игрок: <b>{player}</b>
      </div>
    </div>
  );
}

function Admin({ refEl, hit, mood }: any) {
  const steam = mood === "steam" || mood === "angry" || mood === "evil";
  const lightning = mood === "lightning" || mood === "shock";

  return (
    <div ref={refEl} className={"admin " + (hit ? "hit" : "")} aria-hidden="true">
      <div className="figure">
        <div className="glow" />
        <div className="body" />
        <div className="shoulder l" />
        <div className="shoulder r" />
        <div className="hood" />
        <div className="rim" />

        <div className={"face " + mood}>
          {steam && (
            <div className="steam">
              <span /><span /><span />
            </div>
          )}

          {lightning && (
            <div className="bolt">
              <span /><span />
            </div>
          )}

          <div className="eyes"><i /><i /></div>
          <div className="mouth" />
        </div>

        <div className="neck" />
        <div className="pocket" />
        <div className="logo">NITECORE</div>
      </div>
    </div>
  );
}

const css = [
  "*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}html,body,#root{min-height:100%}body{margin:0;background:#080808;overflow-x:hidden}button,.admin,.admin *{user-select:none;-webkit-user-select:none;outline:none!important;-webkit-tap-highlight-color:transparent!important}",
  ".game{min-height:100svh;color:white;padding:14px;font-family:Arial,sans-serif;background:radial-gradient(circle at 50% 10%,rgba(250,204,21,.18),transparent 24%),linear-gradient(135deg,#070707,#171717 48%,#050505);position:relative}.prize{position:fixed;right:12px;top:12px;z-index:50;background:rgba(0,0,0,.76);border:1px solid rgba(250,204,21,.45);color:#facc15;padding:9px 12px;border-radius:14px;font-size:14px;font-weight:900}",
  ".overlay{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:16px}.adO{z-index:90;background:rgba(0,0,0,.5)}.modal{width:min(94vw,520px);background:linear-gradient(180deg,#181818,#080808);border:1px solid rgba(250,204,21,.42);border-radius:24px;padding:22px;box-shadow:0 0 70px rgba(250,204,21,.18),0 30px 90px rgba(0,0,0,.75)}.adM{width:min(92vw,380px);text-align:center}.badge{display:inline-flex;background:rgba(250,204,21,.15);border:1px solid rgba(250,204,21,.35);color:#facc15;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:1000;margin-bottom:10px}.dark{color:#111;background:#facc15}.modal h2{margin:0 0 10px;font-size:28px;color:#facc15}.modal p{color:#ddd;line-height:1.35;margin:0 0 14px}.modal button,.upgrade,.achBtn,.adBtns button{width:100%;background:#facc15;color:#111;border:0;border-radius:14px;padding:14px;font-weight:1000;cursor:pointer}.adBtns{display:grid;grid-template-columns:1fr 1fr;gap:8px}.adBtns .ghost{background:#181818;color:#facc15;border:1px solid rgba(250,204,21,.35)}",
  ".top{max-width:1180px;margin:0 auto 12px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding-right:125px}.sound{display:flex;gap:6px;flex-wrap:wrap}.sound button{background:rgba(0,0,0,.72);color:#facc15;border:1px solid rgba(250,204,21,.38);border-radius:12px;padding:9px 10px;font-size:12px;font-weight:1000}.title{display:inline-flex;flex-direction:column;gap:4px;padding:10px 14px;border:2px solid #facc15;border-radius:16px;background:rgba(20,20,20,.86);box-shadow:0 0 28px rgba(250,204,21,.18)}.title span{color:#facc15;font-size:12px;font-weight:900;letter-spacing:2px}h1{margin:0;font-size:36px;line-height:1;text-transform:uppercase}",
  ".stats{max-width:1180px;margin:0 auto 12px;display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.stat,.info{background:rgba(0,0,0,.64);border:1px solid #333;border-radius:16px;padding:12px}.stat span{display:block;color:#aaa;font-size:12px;margin-bottom:5px}.stat b{color:#facc15;font-size:25px}.main{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1fr 390px;gap:12px}.side{background:rgba(0,0,0,.66);border:1px solid #333;border-radius:24px;padding:12px;min-height:580px;display:flex;flex-direction:column;gap:10px}.info h3{color:#facc15;margin:0 0 8px}.info p{color:#bbb;line-height:1.35;margin:0}.info span{display:block;color:#aaa;font-size:12px;margin-bottom:6px}.info b{color:#facc15}.upgrade:disabled{opacity:.45}.achBtn{background:#111;color:#facc15;border:1px solid rgba(250,204,21,.45)}",
  ".zone{min-height:580px;position:relative;overflow:hidden;border:1px solid #333;border-radius:24px;background:#0d0d0d;display:flex;align-items:center;justify-content:center}.back{position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,rgba(250,204,21,.12),transparent 38%),linear-gradient(180deg,#1b1b1b,#070707);pointer-events:none}.adminWrap{position:relative;z-index:3;width:320px;height:420px;display:flex;align-items:center;justify-content:center}.admin{width:310px;height:410px;pointer-events:none}.admin.hit .figure{animation:tap .26s ease}@keyframes tap{0%,100%{transform:scale(1) rotate(0)}25%{transform:scale(.91) rotate(-2deg)}55%{transform:scale(1.06) rotate(2deg)}}",
  ".figure{width:100%;height:100%;position:relative;filter:drop-shadow(0 28px 65px rgba(0,0,0,.9))}.glow{position:absolute;left:50%;top:43%;width:320px;height:320px;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(250,204,21,.14),transparent 64%);filter:blur(10px)}.body{position:absolute;left:50%;bottom:12px;width:252px;height:286px;transform:translateX(-50%);background:linear-gradient(180deg,#1d1d1d,#070707);border-radius:44px 44px 25px 25px;z-index:1}.shoulder{position:absolute;top:212px;width:88px;height:180px;background:linear-gradient(180deg,#151515,#050505);border-radius:45px;z-index:2}.shoulder.l{left:17px;transform:rotate(11deg)}.shoulder.r{right:17px;transform:rotate(-11deg)}.hood{position:absolute;top:2px;left:50%;width:215px;height:228px;transform:translateX(-50%);background:linear-gradient(180deg,#2a2a2a,#050505);border-radius:50% 50% 44% 44%;z-index:5}.rim{position:absolute;top:45px;left:50%;width:170px;height:182px;transform:translateX(-50%);background:linear-gradient(180deg,#080808,#000);border-radius:48% 48% 50% 50%;z-index:6;box-shadow:0 0 0 12px rgba(20,20,20,.75),inset 0 0 35px #000}",
  ".face{position:absolute;top:80px;left:50%;width:130px;height:110px;transform:translateX(-50%);background:#000;border-radius:45% 45% 52% 52%;z-index:7;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:visible}.eyes{display:flex;gap:22px;margin-bottom:14px;z-index:3}.eyes i{display:block;width:12px;height:12px;border-radius:50%;background:#facc15;box-shadow:0 0 10px rgba(250,204,21,.65);transition:.18s}.mouth{width:26px;height:10px;border-bottom:3px solid #facc15;border-radius:0 0 18px 18px;transition:.18s;z-index:3}.happy .eyes i{height:6px;border-radius:0 0 10px 10px}.happy .mouth{width:34px;height:14px;border-bottom-width:4px}.angry .eyes i,.steam .eyes i,.evil .eyes i{height:4px;border-radius:10px}.angry .eyes i:first-child,.steam .eyes i:first-child,.evil .eyes i:first-child{transform:rotate(20deg)}.angry .eyes i:last-child,.steam .eyes i:last-child,.evil .eyes i:last-child{transform:rotate(-20deg)}.angry .mouth,.steam .mouth,.lightning .mouth{height:0;border-radius:0}.surprised .mouth,.shock .mouth{width:12px;height:12px;border:3px solid #facc15;border-radius:50%}.tired .eyes i,.blink .eyes i{height:3px;border-radius:10px}.smirk .eyes i:last-child{height:5px}.smirk .mouth{transform:rotate(8deg)}",
  ".steam{position:absolute;inset:0;pointer-events:none;z-index:1}.steam span{position:absolute;bottom:72px;width:14px;height:26px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.7),rgba(255,255,255,0));filter:blur(2px);opacity:0;animation:steam 1s ease-out infinite}.steam span:nth-child(1){left:20px}.steam span:nth-child(2){left:52px;animation-delay:.25s}.steam span:nth-child(3){right:20px;animation-delay:.5s}@keyframes steam{20%{opacity:.7}100%{transform:translateY(-28px) scale(1.3);opacity:0}}.bolt{position:absolute;inset:0;pointer-events:none}.bolt span{position:absolute;top:8px;width:18px;height:42px;background:#facc15;clip-path:polygon(45% 0,100% 0,63% 38%,100% 38%,35% 100%,52% 57%,15% 57%);filter:drop-shadow(0 0 10px rgba(250,204,21,.85));animation:flash .35s infinite alternate}.bolt span:first-child{left:-10px;transform:rotate(-12deg)}.bolt span:last-child{right:-10px;transform:rotate(12deg)}@keyframes flash{0%{opacity:.45}100%{opacity:1}}.neck{position:absolute;left:50%;top:177px;width:90px;height:65px;transform:translateX(-50%);background:#050505;border-radius:0 0 35px 35px;z-index:4}.logo{position:absolute;bottom:135px;left:50%;transform:translateX(-50%);color:#facc15;font-size:27px;font-weight:1000;letter-spacing:4px;z-index:8}.pocket{position:absolute;bottom:42px;left:50%;width:160px;height:66px;transform:translateX(-50%);border:2px solid rgba(255,255,255,.055);border-top:0;border-radius:0 0 20px 20px;z-index:8}",
  ".bubble{position:absolute;top:8px;left:50%;transform:translateX(-50%);max-width:235px;background:#fff8dc;color:#111;padding:10px 12px;border-radius:16px;font-size:13px;font-weight:900;text-align:center;z-index:35}.float{position:absolute;top:58px;left:50%;z-index:25;color:#facc15;font-size:31px;font-weight:1000;pointer-events:none;animation:float .65s ease forwards;text-shadow:0 3px 0 #000}@keyframes float{100%{opacity:0;transform:translate(-50%,-70px) scale(1.18)}}",
  ".gold{position:absolute;left:-100px;z-index:20;width:82px;height:82px;border:0;background:transparent;padding:0;cursor:pointer;animation:flyR linear forwards;filter:drop-shadow(0 0 24px rgba(250,204,21,.75))}.gold.left{left:auto;right:-100px;animation-name:flyL}.gold i{position:absolute;left:14%;top:38%;width:62%;height:27%;border-radius:999px;background:linear-gradient(90deg,#7c4a00,#facc15,#fff2a8)}.gold b{position:absolute;right:10%;top:31%;width:27%;height:43%;border-radius:999px;background:#fff2a8;box-shadow:0 0 28px rgba(250,204,21,.95)}.gold.left b{right:auto;left:10%}.gold span{position:absolute;left:50%;top:-15px;transform:translateX(-50%);color:#facc15;font-size:13px;font-weight:1000}@keyframes flyR{100%{transform:translateX(calc(100vw + 200px));opacity:0}}@keyframes flyL{100%{transform:translateX(calc(-100vw - 200px));opacity:0}}",
  ".cookie{position:absolute;top:-90px;z-index:28;width:70px;height:54px;cursor:pointer;border-radius:50%;background:radial-gradient(circle at 34% 28%,#fff0b4,#d69535 64%,#8b4f12);box-shadow:inset -8px -10px 16px rgba(0,0,0,.22),0 14px 25px rgba(0,0,0,.35);animation:fall linear forwards;color:#2b1604;font-weight:1000;font-size:24px;display:flex;align-items:center;justify-content:center}.cookie i{position:absolute;left:32px;top:7px;width:4px;height:43px;background:rgba(78,38,10,.55)}@keyframes fall{100%{top:calc(100% + 100px);opacity:0;transform:rotate(24deg)}}.fortune,.win{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:45;width:min(88%,410px);border-radius:20px;padding:18px;text-align:center;box-shadow:0 25px 65px rgba(0,0,0,.58);cursor:pointer}.fortune{background:linear-gradient(180deg,#fff7d7,#f1d590);color:#1a1202;border:2px solid #facc15}.fortune b{display:inline-flex;margin-bottom:10px;padding:5px 9px;border-radius:999px;background:#1a1202;color:#facc15;font-size:11px;text-transform:uppercase}.fortune p{margin:0;font-size:20px;line-height:1.25;font-weight:900}.fortune small{display:block;margin-top:10px;color:rgba(26,18,2,.65);font-weight:900}.win{background:rgba(250,204,21,.97);color:#111;border:2px solid #fff2a8}.win b,.win span,.win strong{display:block}.win b{font-size:25px;text-transform:uppercase}.win strong{margin-top:10px;font-size:20px}",
  ".rulesList{display:flex;flex-direction:column;gap:8px;color:#ddd;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:12px;margin-bottom:14px}.rulesList b{color:#facc15}.achModal{width:min(94vw,640px)}.achList{display:grid;gap:10px;max-height:46vh;overflow:auto;margin:0 0 14px}.ach{background:linear-gradient(180deg,#151515,#0b0b0b);border:1px solid #333;border-radius:16px;padding:12px;display:grid;gap:8px}.ach.open{border-color:rgba(250,204,21,.78);box-shadow:0 0 20px rgba(250,204,21,.12)}.ach.lock{opacity:.74}.achHead{display:flex;gap:12px;align-items:flex-start}.achIcon{width:54px;height:54px;min-width:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:1000}.achIcon.open{background:radial-gradient(circle at 35% 25%,#fff4a8,#facc15 55%,#b97900);color:#111;box-shadow:0 0 22px rgba(250,204,21,.28),inset 0 -8px 14px rgba(0,0,0,.18)}.achIcon.lock{background:linear-gradient(180deg,#2a2a2a,#111);color:#777;border:1px solid #3a3a3a}.achText{display:grid;gap:4px}.ach b{color:#facc15}.ach span,.ach small{color:#aaa}.ach em{font-style:normal;color:#111;background:#facc15;border-radius:10px;padding:7px 9px;font-weight:1000}.ach.lock em{background:#222;color:#888}.ach i{display:block;height:8px;background:#222;border-radius:999px;overflow:hidden}.ach i u{display:block;height:100%;background:linear-gradient(90deg,#facc15,#ffe58a)}",
  ".achToast{position:fixed;left:50%;top:76px;transform:translateX(-50%);z-index:120;width:min(92vw,420px);display:flex;gap:12px;align-items:center;background:linear-gradient(180deg,#181818,#090909);border:1px solid rgba(250,204,21,.75);border-radius:18px;padding:12px;box-shadow:0 0 34px rgba(250,204,21,.25),0 18px 50px rgba(0,0,0,.6);animation:toastIn .25s ease}.achToastIcon{width:54px;height:54px;min-width:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 35% 25%,#fff4a8,#facc15 55%,#b97900);color:#111;font-size:27px;font-weight:1000;box-shadow:0 0 22px rgba(250,204,21,.28)}.achToast div:last-child{display:grid;gap:3px}.achToast b{color:#facc15;font-size:15px}.achToast span{font-size:14px;font-weight:900}.achToast em{font-style:normal;color:#111;background:#facc15;border-radius:9px;padding:5px 8px;font-size:12px;font-weight:1000}@keyframes toastIn{0%{opacity:0;transform:translateX(-50%) translateY(-18px) scale(.94)}100%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}",
  ".rouletteO{z-index:130;background:rgba(0,0,0,.84)}.rouletteM{text-align:center;width:min(94vw,520px);border-color:rgba(250,204,21,.8);box-shadow:0 0 90px rgba(250,204,21,.25),0 30px 90px rgba(0,0,0,.8)}.slots{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}.slot{height:96px;border-radius:18px;background:linear-gradient(180deg,#070707,#1a1a1a);border:2px solid rgba(250,204,21,.55);display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:inset 0 0 24px rgba(0,0,0,.8),0 0 20px rgba(250,204,21,.12)}.slot span{font-size:48px;line-height:1}.slot.spinning .reel{display:grid;gap:18px;animation:reel .35s linear infinite}.slot.spinning:nth-child(2) .reel{animation-duration:.28s}.slot.spinning:nth-child(3) .reel{animation-duration:.23s}@keyframes reel{0%{transform:translateY(-188px)}100%{transform:translateY(188px)}}.promoBox{background:linear-gradient(180deg,#facc15,#d39b00);color:#111;border-radius:18px;padding:15px;margin:10px 0 14px;display:grid;gap:5px;box-shadow:0 0 26px rgba(250,204,21,.28)}.promoBox span{font-size:13px;font-weight:900}.promoBox b{font-size:30px;letter-spacing:2px}.promoBox small{font-weight:900;color:rgba(0,0,0,.68)}",
  ".bottom{max-width:1180px;margin:10px auto 0;color:#aaa;text-align:center;font-size:13px}.bottom b{color:#facc15}@media(max-width:900px){.game{max-width:460px;margin:0 auto}.main{grid-template-columns:1fr}.side{min-height:auto}.top{padding-right:0;margin-top:42px}}",
  "@media(max-width:600px){.game{min-height:100dvh;width:100%;max-width:430px;margin:0 auto;padding:6px;display:flex;flex-direction:column}.prize{position:absolute;right:6px;top:6px;padding:6px 9px;font-size:11px}.overlay{padding:8px}.modal{width:100%;max-height:calc(100dvh - 16px);overflow:auto;padding:14px;border-radius:16px}.modal h2{font-size:20px}.modal p{font-size:12px}.top{margin:34px 0 5px;gap:6px;flex-direction:column-reverse}.sound{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:5px}.sound button{padding:8px 6px;font-size:10.5px}.title{padding:8px 10px}.title span{font-size:8px}h1{font-size:20px}.stats{width:100%;gap:5px;margin:0 0 6px}.stat{padding:7px 5px}.stat span{font-size:9px}.stat b{font-size:14px}.main{display:flex;flex-direction:column;gap:6px;flex:1}.zone{min-height:350px;height:53dvh;max-height:440px;border-radius:17px}.side{padding:0;border:0;background:transparent;border-radius:0;gap:6px}.info{display:none}.upgrade,.achBtn{padding:11px;font-size:12px}.adminWrap{width:232px;height:292px;margin-top:-4px}.admin{width:224px;height:292px}.glow{width:228px;height:228px}.body{width:180px;height:196px;bottom:8px}.shoulder{top:146px;width:56px;height:126px}.hood{width:146px;height:156px}.rim{top:30px;width:116px;height:126px}.face{top:54px;width:88px;height:76px}.eyes{gap:14px;margin-bottom:9px}.eyes i{width:8px;height:8px}.mouth{width:18px;height:7px;border-bottom-width:2px}.neck{top:121px;width:60px;height:44px}.logo{bottom:92px;font-size:18px;letter-spacing:2px}.pocket{bottom:28px;width:112px;height:44px}.bubble{max-width:182px;font-size:10.5px;padding:7px 9px;top:-2px}.float{top:36px;font-size:20px}.gold{width:60px;height:60px}.cookie{width:52px;height:40px;font-size:18px}.fortune,.win{width:90%;padding:13px;border-radius:15px}.fortune p{font-size:15px}.win b{font-size:17px}.win strong{font-size:15px}.achToast{top:48px;width:94vw;padding:10px}.achToastIcon{width:46px;height:46px;min-width:46px;font-size:22px}.slots{gap:6px;margin:12px 0}.slot{height:76px;border-radius:14px}.slot span{font-size:38px}.promoBox b{font-size:24px}.bottom{margin-top:5px;font-size:11px}}",
].join("\n");