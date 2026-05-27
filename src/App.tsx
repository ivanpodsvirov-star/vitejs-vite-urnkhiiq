// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";

const SAVE_KEY = "poklikai_admin_edc29_two_weeks_v5_telegram_mobile";
const PLAYER_ID_KEY = "poklikai_admin_player_id_v1";

const adminThoughts = [
  "остынь банан",
  "хочу дебаты",
  "вот бы EDC27 так не грелся",
  "АРМИТЕК",
  "клик принят",
  "где мой пауэрбанк",
  "золотой фонарь где-то рядом",
  "люменов много не бывает",
  "это не баг, это режим ожидания",
  "мне бы кофе и 21700",
  "кто опять включил турбо",
  "не жми так яростно",
  "я все вижу из-под капюшона",
  "шанс маленький, но живой",
  "проверяй серийник, герой",
  "оптика решает, банан",
  "турбо не навсегда",
  "мне нужен отпуск в режиме moonlight",
  "контент-план горит ярче фонаря",
  "официальный админ, официальные мысли",
  "кликать надо с уважением",
  "где мой EDC набор",
  "я не греюсь, я раскрываюсь",
  "свет есть, вопросов нет",
  "не путай люмены с магией",
  "кто принес дешевый аккумулятор",
  "мне нужен темный фон и драматизм",
  "если что, я был в энергосбережении",
  "твой палец работает на ROI",
  "Nitecore внутри, хаос снаружи",
];

const ads = [
  {
    title: "EDC35 для тех, кто любит мощнее",
    text: "Плоский EDC-фонарь с серьезным светом. Нажал, посветил, понял.",
    tag: "Реклама фонаря",
  },
  {
    title: "EDC09 всегда под рукой",
    text: "Компактный фонарь на каждый день. Маленький, но не бесполезный.",
    tag: "Карманный вариант",
  },
  {
    title: "EDC17 для ежедневного набора",
    text: "Когда нужен нормальный свет, а не вспышка телефона на последнем проценте.",
    tag: "EDC совет",
  },
  {
    title: "Админ рекомендует EDC35",
    text: "Света много, формат удобный, выглядит серьезно. Банан одобряет.",
    tag: "Совет админа",
  },
  {
    title: "EDC09 в карман и пошел",
    text: "Для подъезда, гаража, машины, склада и внезапной темноты.",
    tag: "Полезная пауза",
  },
  {
    title: "EDC17 против темного угла",
    text: "Тот случай, когда фонарь лучше иметь заранее, чем искать потом.",
    tag: "Мини-реклама",
  },
  {
    title: "Пока кликаешь, посмотри фонарь",
    text: "У тебя уже есть монеты. Осталось выбрать нормальный EDC.",
    tag: "Пауза между кликами",
  },
  {
    title: "Не все фонари одинаковые",
    text: "Один светит для галочки, другой реально помогает. Выбор очевиден.",
    tag: "Фонарный факт",
  },
  {
    title: "EDC35 выглядит как босс",
    text: "Если фонарь должен быть не просто фонарем, а предметом силы.",
    tag: "Мощный вариант",
  },
  {
    title: "EDC09 без лишнего пафоса",
    text: "Просто компактный фонарь, который удобно носить каждый день.",
    tag: "Лаконично",
  },
  {
    title: "EDC17 для тех, кто готов",
    text: "Темнота приходит без предупреждения. Нормальный фонарь тоже нужен заранее.",
    tag: "На каждый день",
  },
  {
    title: "Свет нужен не только в походе",
    text: "Дом, машина, работа, двор, склад. EDC-фонарь быстро становится привычкой.",
    tag: "EDC мысль",
  },
  {
    title: "Телефон не фонарь",
    text: "Вспышка телефона пригодится, но нормальный EDC все равно удобнее.",
    tag: "Жиза",
  },
  {
    title: "Кликнул админа, посмотри фонарь",
    text: "Реклама короткая, фонари нормальные, ссылки те же три.",
    tag: "Быстрая реклама",
  },
  {
    title: "Твой будущий EDC где-то тут",
    text: "EDC35, EDC09 или EDC17. Случайная ссылка решит за тебя.",
    tag: "Рандом совет",
  },
];

const adLinks = [
  "https://nitecore.ru/catalog/fonari/edc35-/",
  "https://nitecore.ru/catalog/fonari/ruchnye-fonari/edc-fonari-dlya-issledovateley-i-puteshestvennikov/edc09/",
  "https://nitecore.ru/catalog/fonari/ruchnye-fonari/edc-fonari-dlya-issledovateley-i-puteshestvennikov/edc17/",
];

const defaultGame = {
  coins: 0,
  clicks: 0,
  totalClicks: 0,
  chanceLevel: 0,
  hourlyBoost: 0,
  lastHourlyVisit: 0,
  checks: 0,
  wins: 0,
  lastWinAt: 0,
};

function formatNumber(num) {
  const value = Number(num) || 0;
  if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
  if (value >= 1000) return (value / 1000).toFixed(1) + "K";
  return Math.floor(value).toString();
}

function getManualChance(level, hourlyBoost) {
  return Math.min(0.01 + level * 0.01 + hourlyBoost * 0.01, 1.5);
}

function getUpgradeCost(level) {
  return Math.floor(350 * Math.pow(1.8, level));
}

function makeId() {
  return window.crypto?.randomUUID?.() || "guest_" + Date.now();
}

function applyHourlyVisitBonus(gameData) {
  const now = Date.now();
  const lastVisit = Number(gameData.lastHourlyVisit || 0);

  if (!lastVisit || now - lastVisit >= 60 * 60 * 1000) {
    return {
      ...gameData,
      hourlyBoost: Math.min(Number(gameData.hourlyBoost || 0) + 1, 149),
      lastHourlyVisit: now,
    };
  }

  return gameData;
}

export default function App() {
  const [game, setGame] = useState(defaultGame);
  const [playerName, setPlayerName] = useState("Игрок");
  const [goldLight, setGoldLight] = useState(null);
  const [floatingText, setFloatingText] = useState([]);
  const [winMessage, setWinMessage] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [thought, setThought] = useState("");
  const [adPopup, setAdPopup] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready?.();
    tg?.expand?.();

    const user = tg?.initDataUnsafe?.user;

    let id = localStorage.getItem(PLAYER_ID_KEY) || makeId();
    if (user?.id) id = String(user.id);
    localStorage.setItem(PLAYER_ID_KEY, id);

    if (user?.username) setPlayerName("@" + user.username);
    else if (user?.first_name) setPlayerName(user.first_name);

    try {
      const saved = localStorage.getItem(SAVE_KEY);
      const loaded = saved ? { ...defaultGame, ...JSON.parse(saved) } : defaultGame;
      setGame(applyHourlyVisitBonus(loaded));
    } catch (error) {
      localStorage.removeItem(SAVE_KEY);
      setGame(applyHourlyVisitBonus(defaultGame));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game]);

  const manualChance = useMemo(() => getManualChance(game.chanceLevel, game.hourlyBoost), [game.chanceLevel, game.hourlyBoost]);
  const upgradeCost = useMemo(() => getUpgradeCost(game.chanceLevel), [game.chanceLevel]);

  function addFloatingText(text) {
    const id = Date.now() + Math.random();
    setFloatingText((prev) => [...prev, { id, text, x: Math.floor(Math.random() * 90 - 45) }]);

    setTimeout(() => {
      setFloatingText((prev) => prev.filter((item) => item.id !== id));
    }, 650);
  }

  function showAdminThought() {
    const phrase = adminThoughts[Math.floor(Math.random() * adminThoughts.length)];
    setThought(phrase);
    setTimeout(() => setThought(""), 2400);
  }

  function makeAdWithLink() {
    const nextAd = ads[Math.floor(Math.random() * ads.length)];
    const link = adLinks[Math.floor(Math.random() * adLinks.length)];
    return { ...nextAd, link };
  }

  function showRandomAd() {
    setAdPopup(makeAdWithLink());
  }

  function openAdSite() {
    const link = adPopup?.link || adLinks[Math.floor(Math.random() * adLinks.length)];
    const tg = window.Telegram?.WebApp;

    try {
      if (tg?.openLink) {
        tg.openLink(link, { try_instant_view: false });
      } else {
        const opened = window.open(link, "_blank", "noopener,noreferrer");
        if (!opened) window.location.href = link;
      }
    } catch (error) {
      window.location.href = link;
    }

    setAdPopup(null);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.72) showAdminThought();
    }, 22000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showRules) return;

    const timer = setInterval(() => {
      setAdPopup((current) => {
        if (current) return current;
        if (Math.random() > 0.76) {
          return makeAdWithLink();
        }
        return null;
      });
    }, 28000);

    return () => clearInterval(timer);
  }, [showRules]);

  function showWin() {
    setGoldLight(null);
    setWinMessage(true);

    setGame((prev) => ({
      ...prev,
      wins: prev.wins + 1,
      lastWinAt: prev.totalClicks,
    }));

    addFloatingText("ПОБЕДА!");
    setTimeout(() => setWinMessage(false), 4500);
  }

  function spawnGoldLight() {
    if (goldLight) return;

    const id = Date.now() + Math.random();
    const item = {
      id,
      top: Math.floor(80 + Math.random() * 190),
      duration: 3.2 + Math.random() * 1.1,
      direction: Math.random() > 0.5 ? "left" : "right",
    };

    setGoldLight(item);

    setTimeout(() => {
      setGoldLight((current) => (current?.id === id ? null : current));
    }, item.duration * 1000);
  }

  function rollManualChance(nextTotalClicks) {
    if (nextTotalClicks % 10 !== 0) return;

    setGame((prev) => ({ ...prev, checks: prev.checks + 1 }));

    const roll = Math.random() * 100;
    if (roll <= manualChance) spawnGoldLight();
  }

  function clickAdmin() {
    setGame((prev) => {
      const nextTotalClicks = prev.totalClicks + 1;

      setTimeout(() => rollManualChance(nextTotalClicks), 0);

      return {
        ...prev,
        coins: prev.coins + 1,
        clicks: prev.clicks + 1,
        totalClicks: nextTotalClicks,
      };
    });

    addFloatingText("+1");

    if (Math.random() > 0.982) showAdminThought();
    if (Math.random() > 0.992 && !adPopup && !showRules) showRandomAd();
  }

  function catchGoldLight() {
    if (!goldLight) return;
    showWin();
  }

  function upgradeChance() {
    if (game.coins < upgradeCost) return;
    if (manualChance >= 1.5) return;

    setGame((prev) => ({
      ...prev,
      coins: prev.coins - upgradeCost,
      chanceLevel: prev.chanceLevel + 1,
    }));

    addFloatingText("шанс +");
  }

  function resetGame() {
    const ok = confirm("Точно сбросить игру?");
    if (!ok) return;
    setGame(applyHourlyVisitBonus(defaultGame));
    setGoldLight(null);
    setWinMessage(false);
    setThought("");
    setAdPopup(null);
    setShowRules(true);
  }

  return (
    <div className="game">
      <style>{styles}</style>

      <div className="prizeCorner">Приз: <b>EDC27</b></div>

      {showRules && (
        <div className="rulesOverlay">
          <div className="rulesModal">
            <div className="rulesBadge">Правила розыгрыша</div>
            <h2>Поймай золотой фонарь</h2>
            <p>
              Ваша задача поймать золотой фонарь и первым отправить скриншот победы в чат.
            </p>
            <div className="rulesList">
              <div><b>1.</b> Золотой фонарь случайно появляется на экране, пока вы кликаете по админу.</div>
              <div><b>2.</b> Чем больше кликов, тем выше шанс появления фонаря.</div>
              <div><b>3.</b> Успейте нажать на фонарь, сделайте скриншот и отправьте его в чат. Первый забирает приз EDC27.</div>
            </div>
            <button className="rulesButton" onClick={() => setShowRules(false)}>Понятно, играть</button>
          </div>
        </div>
      )}

      {adPopup && (
        <div className="adOverlay">
          <div className="adModal">
            <div className="adTag">{adPopup.tag}</div>
            <h2>{adPopup.title}</h2>
            <p>{adPopup.text}</p>
            <div className="adActions">
              <button className="adSite" onClick={openAdSite}>На сайт</button>
              <button className="adClose" onClick={() => setAdPopup(null)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      <div className="topPanel">
        <div>
          <div className="miniText">NITECORE</div>
          <h1>Кликни админа</h1>
        </div>
      </div>

      <div className="statsGrid">
        <Stat title="Монеты" value={formatNumber(game.coins)} />
        <Stat title="Клики" value={formatNumber(game.totalClicks)} />
      </div>

      <div className="mainArea">
        <div className="clickZone">
          <div className="simpleBack" />

          {goldLight && (
            <button
              className={"goldLight " + goldLight.direction}
              style={{ top: goldLight.top, animationDuration: goldLight.duration + "s" }}
              onClick={catchGoldLight}
              aria-label="Поймать золотой фонарь"
            >
              <div className="goldBeam" />
              <div className="goldBody" />
              <div className="goldHead" />
              <span>ЖМИ!</span>
            </button>
          )}

          {winMessage && (
            <div className="winBox">
              <b>Поздравляю, ты победил!</b>
              <span>Ты поймал золотой фонарь</span>
              <strong>Приз: Nitecore EDC27</strong>
            </div>
          )}

          <div className="adminWrap">
            {thought && <div className="thoughtBubble">{thought}</div>}

            {floatingText.map((item) => (
              <div key={item.id} className="floating" style={{ marginLeft: item.x }}>{item.text}</div>
            ))}

            <button className="adminButton" onClick={clickAdmin} aria-label="Кликнуть админа">
              <div className="adminFigure">
                <div className="adminGlow" />
                <div className="adminBody" />
                <div className="adminShoulder left" />
                <div className="adminShoulder right" />
                <div className="adminHoodOuter" />
                <div className="adminHoodRim" />
                <div className="adminFaceShadow" />
                <div className="adminNeckShadow" />
                <div className="adminZipper" />
                <div className="adminPocket" />
                <div className="adminLogo">NITECORE</div>
              </div>
            </button>
          </div>
        </div>

        <div className="sidePanel">
          <div className="infoCard">
            <h3>Как играть</h3>
            <p>Ваша задача поймать золотой фонарь. Он случайно появляется на экране, пока вы кликаете по админу. Чем больше кликов, тем выше шанс. Успейте нажать на фонарь и пришлите скриншот победы в чат.</p>
          </div>

          <button
            className="upgradeButton"
            disabled={game.coins < upgradeCost || manualChance >= 1.5}
            onClick={upgradeChance}
          >
            {manualChance >= 1.5 ? "Максимальный шанс" : "Увеличить шанс за " + formatNumber(upgradeCost) + " монет"}
          </button>

          {game.wins > 0 && (
            <div className="lastWin">
              <span>Последний выигрыш</span>
              <b>EDC27 на {formatNumber(game.lastWinAt)} кликах</b>
            </div>
          )}
        </div>
      </div>

      <div className="bottomText">Игрок: <b>{playerName}</b></div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="statCard">
      <span>{title}</span>
      <b>{value}</b>
    </div>
  );
}

const styles = `
* { box-sizing: border-box; }
html, body, #root { min-height: 100%; }
body { margin: 0; background: #080808; overflow-x: hidden; }
.game {
  min-height: 100svh;
  color: white;
  padding: 14px;
  font-family: Arial, sans-serif;
  background: radial-gradient(circle at 50% 10%, rgba(250,204,21,.18), transparent 24%), linear-gradient(135deg, #070707, #171717 48%, #050505);
  position: relative;
}
.prizeCorner {
  position: fixed;
  right: 12px;
  top: 12px;
  z-index: 50;
  background: rgba(0,0,0,.76);
  border: 1px solid rgba(250,204,21,.45);
  color: #facc15;
  padding: 9px 12px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 0 25px rgba(250,204,21,.12);
}
.rulesOverlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,.78); display: flex; align-items: center; justify-content: center; padding: 16px; }
.rulesModal { width: min(94vw, 540px); background: linear-gradient(180deg, #181818, #080808); border: 1px solid rgba(250,204,21,.42); border-radius: 24px; padding: 22px; box-shadow: 0 0 70px rgba(250,204,21,.18), 0 30px 90px rgba(0,0,0,.75); }
.rulesBadge { display: inline-flex; background: rgba(250,204,21,.15); border: 1px solid rgba(250,204,21,.35); color: #facc15; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 1000; margin-bottom: 10px; }
.rulesModal h2 { margin: 0 0 10px; font-size: 30px; text-transform: uppercase; color: #facc15; }
.rulesModal p { color: #ddd; line-height: 1.35; margin: 0 0 14px; }
.rulesList { display: flex; flex-direction: column; gap: 8px; color: #ddd; background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 12px; }
.rulesList b { color: #facc15; }
.rulesButton { width: 100%; margin-top: 14px; background: #facc15; color: #111; border: 0; border-radius: 14px; padding: 14px; font-weight: 1000; cursor: pointer; }
.adOverlay { position: fixed; inset: 0; z-index: 90; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.5); padding: 16px; }
.adModal { width: min(92vw, 380px); background: linear-gradient(180deg, #202020, #090909); border: 1px solid rgba(250,204,21,.45); border-radius: 22px; padding: 18px; box-shadow: 0 0 60px rgba(250,204,21,.16), 0 24px 80px rgba(0,0,0,.7); text-align: center; animation: adPop .2s ease; }
.adTag { display: inline-flex; color: #111; background: #facc15; border-radius: 999px; padding: 5px 10px; font-size: 11px; font-weight: 1000; margin-bottom: 10px; }
.adModal h2 { margin: 0 0 8px; color: #facc15; font-size: 26px; }
.adModal p { margin: 0 0 14px; color: #ddd; line-height: 1.35; }
.adActions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.adSite, .adClose { width: 100%; border: 0; border-radius: 13px; padding: 12px; font-weight: 1000; cursor: pointer; text-align: center; text-decoration: none; display: block; font-family: inherit; font-size: 14px; }
.adSite { background: #facc15; color: #111; }
.adClose { background: #181818; color: #facc15; border: 1px solid rgba(250,204,21,.35); }
@keyframes adPop { 0% { opacity: 0; transform: scale(.86); } 100% { opacity: 1; transform: scale(1); } }
.topPanel { max-width: 1180px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-right: 125px; }
.miniText { color: #facc15; font-size: 12px; font-weight: 900; letter-spacing: 2px; }
h1 { margin: 0; font-size: 36px; line-height: 1; text-transform: uppercase; }
.smallButton { background: #222; color: white; border: 1px solid #444; border-radius: 13px; padding: 10px 16px; font-weight: 900; cursor: pointer; }
.statsGrid { max-width: 1180px; margin: 0 auto 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.statCard { background: rgba(0,0,0,.64); border: 1px solid #333; border-radius: 16px; padding: 12px; }
.statCard span { display: block; color: #aaa; font-size: 12px; margin-bottom: 5px; }
.statCard b { color: #facc15; font-size: 25px; }
.mainArea { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 1fr 390px; gap: 12px; }
.clickZone { min-height: 580px; position: relative; overflow: hidden; border: 1px solid #333; border-radius: 24px; background: #0d0d0d; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
.simpleBack { position: absolute; inset: 0; background: radial-gradient(circle at 50% 42%, rgba(250,204,21,.12), transparent 38%), linear-gradient(180deg, #1b1b1b, #070707); pointer-events: none; }
.adminWrap { position: relative; z-index: 3; width: 320px; height: 420px; display: flex; align-items: center; justify-content: center; }
.adminButton { width: 310px; height: 410px; border: 0; background: transparent; cursor: pointer; transition: transform .08s ease; }
.adminButton:active { transform: scale(.96); }
.adminFigure { width: 100%; height: 100%; position: relative; filter: drop-shadow(0 28px 65px rgba(0,0,0,.9)); }
.adminGlow { position: absolute; left: 50%; top: 43%; width: 320px; height: 320px; transform: translate(-50%, -50%); background: radial-gradient(circle, rgba(250,204,21,.14), transparent 64%); filter: blur(10px); }
.adminBody { position: absolute; left: 50%; bottom: 12px; width: 252px; height: 286px; transform: translateX(-50%); background: radial-gradient(circle at 45% 18%, rgba(255,255,255,.075), transparent 28%), linear-gradient(180deg, #1d1d1d, #070707); border-radius: 44px 44px 25px 25px; z-index: 1; box-shadow: inset -25px 0 35px rgba(0,0,0,.6); }
.adminShoulder { position: absolute; top: 212px; width: 88px; height: 180px; background: linear-gradient(180deg, #151515, #050505); border-radius: 45px; z-index: 2; }
.adminShoulder.left { left: 17px; transform: rotate(11deg); }
.adminShoulder.right { right: 17px; transform: rotate(-11deg); }
.adminHoodOuter { position: absolute; top: 2px; left: 50%; width: 215px; height: 228px; transform: translateX(-50%); background: radial-gradient(circle at 45% 20%, rgba(255,255,255,.08), transparent 24%), linear-gradient(180deg, #2a2a2a, #050505); border-radius: 50% 50% 44% 44%; z-index: 5; }
.adminHoodRim { position: absolute; top: 45px; left: 50%; width: 170px; height: 182px; transform: translateX(-50%); background: linear-gradient(180deg, #080808, #000); border-radius: 48% 48% 50% 50%; z-index: 6; box-shadow: 0 0 0 12px rgba(20,20,20,.75), inset 0 0 35px #000; }
.adminFaceShadow { position: absolute; top: 80px; left: 50%; width: 130px; height: 110px; transform: translateX(-50%); background: #000; border-radius: 45% 45% 52% 52%; z-index: 7; }
.adminNeckShadow { position: absolute; left: 50%; top: 177px; width: 90px; height: 65px; transform: translateX(-50%); background: #050505; border-radius: 0 0 35px 35px; z-index: 4; }
.adminLogo { position: absolute; bottom: 135px; left: 50%; transform: translateX(-50%); color: #facc15; font-size: 27px; font-weight: 1000; letter-spacing: 4px; z-index: 8; }
.adminZipper { position: absolute; left: 50%; top: 210px; width: 3px; height: 172px; transform: translateX(-50%); background: #555; z-index: 8; opacity: .65; }
.adminPocket { position: absolute; bottom: 42px; left: 50%; width: 160px; height: 66px; transform: translateX(-50%); border: 2px solid rgba(255,255,255,.055); border-top: 0; border-radius: 0 0 20px 20px; z-index: 8; }
.thoughtBubble { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); max-width: 235px; background: #fff8dc; color: #111; padding: 10px 12px; border-radius: 16px; font-size: 13px; font-weight: 900; line-height: 1.2; text-align: center; z-index: 35; box-shadow: 0 8px 25px rgba(0,0,0,.35); animation: bubblePop .18s ease; }
.thoughtBubble:after { content: ""; position: absolute; bottom: -8px; left: 50%; width: 16px; height: 16px; background: #fff8dc; transform: translateX(-50%) rotate(45deg); }
@keyframes bubblePop { 0% { opacity: 0; transform: translateX(-50%) scale(.86); } 100% { opacity: 1; transform: translateX(-50%) scale(1); } }
.floating { position: absolute; top: 58px; left: 50%; z-index: 25; color: #facc15; font-size: 31px; font-weight: 1000; pointer-events: none; animation: floatUp .65s ease forwards; text-shadow: 0 3px 0 #000; }
@keyframes floatUp { 0% { opacity: 1; transform: translate(-50%, 20px) scale(.8); } 100% { opacity: 0; transform: translate(-50%, -70px) scale(1.18); } }
.bigClickButton { position: relative; z-index: 4; width: min(90%, 380px); padding: 16px; border: 0; border-radius: 16px; background: linear-gradient(180deg, #facc15, #eab308); color: #111; font-size: 22px; font-weight: 1000; cursor: pointer; box-shadow: 0 0 34px rgba(250,204,21,.32); }
.goldLight { position: absolute; left: -100px; z-index: 20; width: 82px; height: 82px; border: 0; background: transparent; padding: 0; cursor: pointer; animation-name: flyRight; animation-timing-function: linear; animation-fill-mode: forwards; filter: drop-shadow(0 0 24px rgba(250,204,21,.75)); }
.goldLight.left { left: auto; right: -100px; animation-name: flyLeft; }
.goldBody { position: absolute; left: 14%; top: 38%; width: 62%; height: 27%; border-radius: 999px; background: linear-gradient(90deg, #7c4a00, #facc15, #fff2a8); box-shadow: inset 0 0 8px rgba(255,255,255,.45); }
.goldHead { position: absolute; right: 10%; top: 31%; width: 27%; height: 43%; border-radius: 999px; background: #fff2a8; box-shadow: 0 0 28px rgba(250,204,21,.95); }
.goldBeam { position: absolute; right: -35%; top: 18%; width: 90%; height: 65%; background: radial-gradient(circle, rgba(250,204,21,.48), transparent 68%); filter: blur(5px); }
.goldLight.left .goldHead { right: auto; left: 10%; }
.goldLight.left .goldBeam { right: auto; left: -35%; }
.goldLight span { position: absolute; left: 50%; top: -15px; transform: translateX(-50%); color: #facc15; font-size: 13px; font-weight: 1000; text-shadow: 0 2px 5px #000; }
@keyframes flyRight { 0% { transform: translateX(0) rotate(-8deg) scale(.9); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateX(calc(100vw + 200px)) rotate(8deg) scale(1.05); opacity: 0; } }
@keyframes flyLeft { 0% { transform: translateX(0) rotate(8deg) scale(.9); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateX(calc(-100vw - 200px)) rotate(-8deg) scale(1.05); opacity: 0; } }
.winBox { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 40; width: min(88%, 430px); background: rgba(250,204,21,.97); color: #111; border: 2px solid #fff2a8; border-radius: 22px; padding: 22px 18px; text-align: center; box-shadow: 0 0 60px rgba(250,204,21,.48), 0 24px 70px rgba(0,0,0,.55); animation: winPop .22s ease; }
.winBox b, .winBox span, .winBox strong { display: block; }
.winBox b { font-size: 25px; text-transform: uppercase; }
.winBox span { margin-top: 8px; font-weight: 900; }
.winBox strong { margin-top: 10px; font-size: 20px; }
@keyframes winPop { 0% { opacity: 0; transform: translate(-50%, -50%) scale(.82); } 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
.sidePanel { background: rgba(0,0,0,.66); border: 1px solid #333; border-radius: 24px; padding: 12px; min-height: 580px; display: flex; flex-direction: column; gap: 10px; }
.infoCard, .lastWin { background: #111; border: 1px solid #333; border-radius: 16px; padding: 14px; }
.infoCard h3 { color: #facc15; margin: 0 0 8px; }
.infoCard p { color: #bbb; line-height: 1.35; margin: 0; }
.lastWin span { display: block; color: #aaa; margin-bottom: 5px; }
.lastWin b { display: block; color: #facc15; }
.upgradeButton { width: 100%; background: #facc15; color: #111; border: 0; border-radius: 14px; padding: 14px; font-weight: 1000; cursor: pointer; }
.upgradeButton:disabled { opacity: .45; cursor: not-allowed; }
.smallInfo { color: #aaa; font-size: 12px; line-height: 1.35; background: rgba(250,204,21,.08); border: 1px solid rgba(250,204,21,.18); border-radius: 12px; padding: 10px; }
.bottomText { max-width: 1180px; margin: 10px auto 0; color: #aaa; text-align: center; font-size: 13px; }
.bottomText b { color: #facc15; }
@media (max-width: 900px) {
  .game { max-width: 460px; margin: 0 auto; }
  .mainArea { grid-template-columns: 1fr; }
  .sidePanel { min-height: auto; }
  .topPanel { padding-right: 0; margin-top: 42px; }
}

@media (max-width: 600px) {
  html, body, #root { min-height: 100dvh; }
  body { overflow-x: hidden; touch-action: manipulation; }
  .game {
    min-height: 100dvh;
    width: 100%;
    max-width: 430px;
    margin: 0 auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }

  .rulesOverlay { padding: 8px; align-items: center; overflow: auto; }
  .rulesModal {
    width: 100%;
    max-height: calc(100dvh - 16px);
    overflow: auto;
    padding: 14px;
    border-radius: 16px;
  }
  .rulesBadge { font-size: 10px; padding: 5px 8px; margin-bottom: 7px; }
  .rulesModal h2 { font-size: 20px; margin-bottom: 7px; }
  .rulesModal p { font-size: 12px; margin-bottom: 9px; }
  .rulesList { font-size: 11px; gap: 6px; padding: 9px; border-radius: 12px; }
  .rulesButton { padding: 11px; border-radius: 12px; font-size: 13px; }

  .adOverlay { padding: 8px; }
  .adModal { width: 96vw; max-width: 360px; padding: 14px; border-radius: 16px; }
  .adModal h2 { font-size: 20px; }
  .adModal p { font-size: 12px; }
  .adActions { gap: 6px; }
  .adSite, .adClose { padding: 11px 8px; font-size: 13px; border-radius: 11px; }

  .prizeCorner {
    position: absolute;
    right: 6px;
    top: 6px;
    padding: 6px 9px;
    font-size: 11px;
    border-radius: 10px;
  }

  .topPanel {
    margin: 34px 0 5px;
    gap: 6px;
    padding-right: 0;
    align-items: flex-start;
  }
  .miniText { font-size: 8px; letter-spacing: 1px; }
  h1 { font-size: 20px; line-height: .95; max-width: 230px; }

  .statsGrid {
    width: 100%;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    margin: 0 0 6px;
  }
  .statCard { padding: 7px 5px; border-radius: 11px; min-width: 0; }
  .statCard span { font-size: 9px; margin-bottom: 2px; white-space: nowrap; }
  .statCard b { font-size: 14px; }

  .mainArea {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-height: 0;
  }
  .clickZone {
    min-height: 350px;
    height: 53dvh;
    max-height: 440px;
    border-radius: 17px;
    gap: 0;
    flex-shrink: 0;
  }

  .adminWrap { width: 232px; height: 292px; margin-top: -4px; }
  .adminButton { width: 224px; height: 292px; }
  .adminGlow { width: 228px; height: 228px; }
  .adminBody { width: 180px; height: 196px; bottom: 8px; border-radius: 30px 30px 18px 18px; }
  .adminShoulder { top: 146px; width: 56px; height: 126px; border-radius: 32px; }
  .adminShoulder.left { left: 17px; }
  .adminShoulder.right { right: 17px; }
  .adminHoodOuter { top: 1px; width: 146px; height: 156px; }
  .adminHoodRim { top: 30px; width: 116px; height: 126px; box-shadow: 0 0 0 8px rgba(20,20,20,.75), inset 0 0 24px #000; }
  .adminFaceShadow { top: 54px; width: 88px; height: 76px; }
  .adminNeckShadow { top: 121px; width: 60px; height: 44px; }
  .adminLogo { bottom: 92px; font-size: 18px; letter-spacing: 2px; }
  .adminZipper { top: 145px; height: 118px; }
  .adminPocket { bottom: 28px; width: 112px; height: 44px; }

  .thoughtBubble {
    max-width: 182px;
    font-size: 10.5px;
    padding: 7px 9px;
    top: -2px;
    border-radius: 12px;
  }
  .floating { top: 36px; font-size: 20px; }

  .goldLight { width: 60px; height: 60px; }
  .goldLight span { font-size: 10px; top: -11px; }
  .winBox { width: 92%; padding: 14px 10px; border-radius: 15px; }
  .winBox b { font-size: 17px; }
  .winBox span { font-size: 12px; }
  .winBox strong { font-size: 15px; }

  .sidePanel {
    padding: 0;
    border: 0;
    background: transparent;
    border-radius: 0;
    min-height: auto;
    gap: 6px;
  }
  .infoCard { display: none; }
  .lastWin { padding: 8px; border-radius: 11px; font-size: 11px; }
  .upgradeButton {
    padding: 11px;
    border-radius: 12px;
    font-size: 12px;
    box-shadow: 0 0 24px rgba(250,204,21,.18);
  }
  .bottomText { margin-top: 5px; font-size: 11px; }
}
`;
