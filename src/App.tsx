// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";

const SAVE_KEY = "poklikai_admin_nitecore_save_v2";
const LEADERS_KEY = "poklikai_admin_nitecore_leaders_v2";

const shopItems = [
  { id: "tiki", title: "Nitecore TIKI", desc: "+1 монета за клик", baseCost: 25, type: "click", value: 1, emoji: "🔦" },
  { id: "tube", title: "Nitecore TUBE V2", desc: "+4 монеты за клик", baseCost: 120, type: "click", value: 4, emoji: "💡" },
  { id: "nu25", title: "Nitecore NU25", desc: "+3 монеты в секунду", baseCost: 180, type: "auto", value: 3, emoji: "🎒" },
  { id: "mh12", title: "Nitecore MH12 Pro", desc: "+12 монет в секунду", baseCost: 700, type: "auto", value: 12, emoji: "⚡" },
  { id: "edc29", title: "Nitecore EDC29", desc: "+20 монет за клик", baseCost: 1400, type: "click", value: 20, emoji: "🖤" },
  { id: "tm9k", title: "Nitecore TM9K", desc: "+35 монет в секунду", baseCost: 2600, type: "auto", value: 35, emoji: "🚀" },
  { id: "nb10000", title: "Nitecore NB10000", desc: "+60 монет за клик", baseCost: 4200, type: "click", value: 60, emoji: "🔋" },
  { id: "adminBox", title: "Черный ящик админа", desc: "+85 монет в секунду", baseCost: 6500, type: "auto", value: 85, emoji: "📦" },
];

const defaultUpgrades = shopItems.reduce((acc, item) => {
  acc[item.id] = 0;
  return acc;
}, {});

const defaultGame = {
  coins: 0,
  totalEarned: 0,
  clicks: 0,
  upgrades: defaultUpgrades,
  x2Until: 0,
  lastDailyBonus: "",
  lastX2Bonus: "",
};

const defaultLeaders = [
  { name: "Админ Nitecore", score: 150000 },
  { name: "Босс СММ", score: 90000 },
  { name: "Фонарный магнат", score: 50000 },
  { name: "Кликер с района", score: 25000 },
];

function formatNumber(num) {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return Math.floor(num).toString();
}

function getCost(baseCost, level) {
  return Math.floor(baseCost * Math.pow(1.45, level));
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [game, setGame] = useState(defaultGame);
  const [leaders, setLeaders] = useState(defaultLeaders);
  const [playerName, setPlayerName] = useState("Игрок");
  const [floatingText, setFloatingText] = useState([]);
  const [randomBonus, setRandomBonus] = useState(null);
  const [activeTab, setActiveTab] = useState("shop");

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready?.();
    tg?.expand?.();

    const user = tg?.initDataUnsafe?.user;
    if (user?.username) setPlayerName("@" + user.username);
    else if (user?.first_name) setPlayerName(user.first_name);

    const savedGame = localStorage.getItem(SAVE_KEY);
    const savedLeaders = localStorage.getItem(LEADERS_KEY);

    if (savedGame) {
      const parsed = JSON.parse(savedGame);
      setGame({
        ...defaultGame,
        ...parsed,
        upgrades: { ...defaultUpgrades, ...(parsed.upgrades || {}) },
      });
    }

    if (savedLeaders) setLeaders(JSON.parse(savedLeaders));
  }, []);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game]);

  useEffect(() => {
    localStorage.setItem(LEADERS_KEY, JSON.stringify(leaders));
  }, [leaders]);

  const stats = useMemo(() => {
    let clickPower = 1;
    let autoIncome = 0;

    shopItems.forEach((item) => {
      const level = game.upgrades[item.id] || 0;
      if (item.type === "click") clickPower += item.value * level;
      if (item.type === "auto") autoIncome += item.value * level;
    });

    const x2Active = Date.now() < game.x2Until;
    if (x2Active) {
      clickPower *= 2;
      autoIncome *= 2;
    }

    return {
      clickPower,
      autoIncome,
      x2Active,
      score: Math.floor(game.totalEarned + game.clicks * 5),
    };
  }, [game]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (stats.autoIncome > 0) {
        setGame((prev) => ({
          ...prev,
          coins: prev.coins + stats.autoIncome,
          totalEarned: prev.totalEarned + stats.autoIncome,
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [stats.autoIncome]);

  useEffect(() => {
    const bonusTimer = setInterval(() => {
      if (Math.random() > 0.62) {
        setRandomBonus({
          id: Date.now(),
          amount: Math.floor(150 + Math.random() * 1200),
          timeLeft: 8,
        });
      }
    }, 15000);

    return () => clearInterval(bonusTimer);
  }, []);

  useEffect(() => {
    if (!randomBonus) return;

    const timer = setInterval(() => {
      setRandomBonus((prev) => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) return null;
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [randomBonus]);

  function addFloatingText(text) {
    const id = Date.now() + Math.random();
    setFloatingText((prev) => [...prev, { id, text, x: Math.floor(Math.random() * 140 - 70) }]);

    setTimeout(() => {
      setFloatingText((prev) => prev.filter((item) => item.id !== id));
    }, 850);
  }

  function clickAdmin() {
    const earned = stats.clickPower;

    setGame((prev) => ({
      ...prev,
      coins: prev.coins + earned,
      totalEarned: prev.totalEarned + earned,
      clicks: prev.clicks + 1,
    }));

    addFloatingText("+" + formatNumber(earned));
  }

  function buyItem(item) {
    const level = game.upgrades[item.id] || 0;
    const cost = getCost(item.baseCost, level);
    if (game.coins < cost) return;

    setGame((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      upgrades: {
        ...prev.upgrades,
        [item.id]: level + 1,
      },
    }));
  }

  function claimDailyBonus() {
    const today = getTodayKey();
    if (game.lastDailyBonus === today) return;

    setGame((prev) => ({
      ...prev,
      coins: prev.coins + 1000,
      totalEarned: prev.totalEarned + 1000,
      lastDailyBonus: today,
    }));

    addFloatingText("+1000 бонус");
  }

  function activateX2Bonus() {
    const today = getTodayKey();
    if (game.lastX2Bonus === today) return;
    if (game.coins < 500) return;

    setGame((prev) => ({
      ...prev,
      coins: prev.coins - 500,
      x2Until: Date.now() + 60 * 1000,
      lastX2Bonus: today,
    }));

    addFloatingText("x2 на 60 сек");
  }

  function claimRandomBonus() {
    if (!randomBonus) return;

    setGame((prev) => ({
      ...prev,
      coins: prev.coins + randomBonus.amount,
      totalEarned: prev.totalEarned + randomBonus.amount,
    }));

    addFloatingText("+" + randomBonus.amount + " бонус");
    setRandomBonus(null);
  }

  function saveScoreToLeaders() {
    const updated = [...leaders, { name: playerName, score: stats.score }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaders(updated);
    setActiveTab("leaders");
  }

  function resetGame() {
    const ok = confirm("Точно начать заново? Прогресс сбросится.");
    if (!ok) return;
    setGame(defaultGame);
  }

  const dailyBonusReady = game.lastDailyBonus !== getTodayKey();
  const x2BonusReady = game.lastX2Bonus !== getTodayKey();

  return (
    <div className="game">
      <style>{styles}</style>

      <div className="topPanel">
        <div>
          <div className="miniText">NITECORE CLICKER</div>
          <h1>Кликай админа</h1>
        </div>
        <button className="smallButton" onClick={resetGame}>Сброс</button>
      </div>

      <div className="statsGrid">
        <Stat title="Монеты" value={formatNumber(game.coins)} />
        <Stat title="За клик" value={formatNumber(stats.clickPower)} />
        <Stat title="В секунду" value={formatNumber(stats.autoIncome)} />
        <Stat title="Клики" value={formatNumber(game.clicks)} />
      </div>

      {stats.x2Active && <div className="boostLine">🔥 Бонус x2 активен. Админ работает на максималках.</div>}

      <div className="mainArea">
        <div className="clickZone">
          <div className="forestGlow" />
          <div className="adminWrap">
            {floatingText.map((item) => (
              <div key={item.id} className="floating" style={{ marginLeft: item.x }}>{item.text}</div>
            ))}

            <button className="adminButton" onClick={clickAdmin} aria-label="Кликнуть админа">
              <div className="adminFigure">
                <div className="adminShadow" />
                <div className="adminHood" />
                <div className="adminFaceVoid" />
                <div className="adminBody" />
                <div className="adminArm left" />
                <div className="adminArm right" />
                <div className="adminPocket" />
                <div className="adminLogo">NITECORE</div>
                <div className="adminCord left" />
                <div className="adminCord right" />
              </div>
            </button>
          </div>

          <button className="bigClickButton" onClick={clickAdmin}>КЛИКНУТЬ АДМИНА</button>

          {randomBonus && (
            <button className="randomBonus" onClick={claimRandomBonus}>
              🎁 Забрать бонус {randomBonus.amount} монет<br />
              <span>исчезнет через {randomBonus.timeLeft} сек.</span>
            </button>
          )}
        </div>

        <div className="sidePanel">
          <div className="tabs">
            <button className={activeTab === "shop" ? "active" : ""} onClick={() => setActiveTab("shop")}>Магазин</button>
            <button className={activeTab === "bonus" ? "active" : ""} onClick={() => setActiveTab("bonus")}>Бонусы</button>
            <button className={activeTab === "leaders" ? "active" : ""} onClick={() => setActiveTab("leaders")}>Лидеры</button>
          </div>

          {activeTab === "shop" && (
            <div className="shopList">
              {shopItems.map((item) => {
                const level = game.upgrades[item.id] || 0;
                const cost = getCost(item.baseCost, level);
                const canBuy = game.coins >= cost;

                return (
                  <button key={item.id} className={canBuy ? "shopItem" : "shopItem disabled"} onClick={() => buyItem(item)}>
                    <div className="shopEmoji">{item.emoji}</div>
                    <div className="shopInfo">
                      <b>{item.title}</b>
                      <span>{item.desc}</span>
                      <small>Уровень: {level}</small>
                    </div>
                    <div className="price">{formatNumber(cost)}</div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === "bonus" && (
            <div className="bonusList">
              <BonusCard title="Ежедневный бонус" text="Раз в день можно забрать 1000 монет.">
                <button disabled={!dailyBonusReady} onClick={claimDailyBonus} className="bonusButton">
                  {dailyBonusReady ? "Забрать 1000 монет" : "Уже забрано"}
                </button>
              </BonusCard>

              <BonusCard title="Буст x2" text="На 60 секунд удваивает клик и автодоход. Доступен один раз в сутки.">
                <button disabled={!x2BonusReady || game.coins < 500} onClick={activateX2Bonus} className="bonusButton">
                  {x2BonusReady ? "Купить за 500 монет" : "Буст уже использован сегодня"}
                </button>
              </BonusCard>

              <BonusCard title="Случайный бонус" text="Иногда появляется подарок. Успей нажать, пока он не исчез." />
            </div>
          )}

          {activeTab === "leaders" && (
            <div className="leadersBox">
              <div className="scoreBox">
                <span>Твой счет</span>
                <b>{formatNumber(stats.score)}</b>
              </div>

              <button className="saveScoreButton" onClick={saveScoreToLeaders}>Добавить себя в таблицу</button>

              <div className="leadersList">
                {leaders.map((leader, index) => (
                  <div key={index} className="leaderRow">
                    <span>{index + 1}. {leader.name}</span>
                    <b>{formatNumber(leader.score)}</b>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bottomText">Игрок: <b>{playerName}</b> | Счет: <b>{formatNumber(stats.score)}</b></div>
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

function BonusCard({ title, text, children }) {
  return (
    <div className="bonusCard">
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}

const styles = `
* { box-sizing: border-box; }
body { margin: 0; background: #080808; }
.game {
  min-height: 100vh;
  color: white;
  padding: 18px;
  font-family: Arial, sans-serif;
  background:
    radial-gradient(circle at 50% 14%, rgba(255, 210, 70, 0.28), transparent 25%),
    linear-gradient(135deg, #090909 0%, #181818 45%, #040404 100%);
}
.topPanel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1180px;
  margin: 0 auto 16px;
}
.miniText {
  color: #facc15;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 13px;
}
h1 {
  margin: 0;
  font-size: 42px;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: -1px;
}
.smallButton {
  background: #222;
  color: white;
  border: 1px solid #444;
  border-radius: 14px;
  padding: 12px 18px;
  font-weight: 900;
  cursor: pointer;
}
.statsGrid {
  max-width: 1180px;
  margin: 0 auto 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.statCard {
  background: rgba(0,0,0,0.62);
  border: 1px solid #333;
  border-radius: 18px;
  padding: 14px;
}
.statCard span {
  display: block;
  color: #aaa;
  font-size: 13px;
  margin-bottom: 6px;
}
.statCard b {
  color: #facc15;
  font-size: 28px;
}
.boostLine {
  max-width: 1180px;
  margin: 0 auto 16px;
  background: #facc15;
  color: #111;
  padding: 12px 16px;
  border-radius: 14px;
  font-weight: 900;
  text-align: center;
}
.mainArea {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 16px;
  align-items: stretch;
}
.clickZone {
  background:
    radial-gradient(circle at center, rgba(255, 210, 70, 0.18), transparent 35%),
    linear-gradient(180deg, rgba(35,35,35,0.82), rgba(0,0,0,0.86));
  border: 1px solid #333;
  border-radius: 28px;
  min-height: 650px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  position: relative;
  overflow: hidden;
}
.clickZone:before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, transparent 0 49%, rgba(255,255,255,0.025) 50%, transparent 51%),
    linear-gradient(0deg, transparent 0 49%, rgba(255,255,255,0.02) 50%, transparent 51%);
  background-size: 80px 80px;
  pointer-events: none;
}
.forestGlow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 20%, rgba(250,204,21,0.18), transparent 23%),
    radial-gradient(circle at 20% 80%, rgba(76, 43, 10, 0.35), transparent 30%),
    radial-gradient(circle at 80% 80%, rgba(76, 43, 10, 0.35), transparent 30%);
  pointer-events: none;
}
.adminWrap {
  position: relative;
  width: 360px;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.adminButton {
  width: 340px;
  height: 480px;
  border: 0;
  border-radius: 40px;
  background: transparent;
  color: white;
  cursor: pointer;
  position: relative;
  transition: transform 0.08s ease;
}
.adminButton:active { transform: scale(0.96); }
.adminFigure {
  width: 100%;
  height: 100%;
  position: relative;
  filter: drop-shadow(0 30px 70px rgba(0, 0, 0, 0.82));
}
.adminShadow {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 310px;
  height: 90px;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.65);
  border-radius: 50%;
  filter: blur(20px);
}
.adminHood {
  position: absolute;
  top: 4px;
  left: 50%;
  width: 230px;
  height: 230px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #242424 0%, #101010 72%, #050505 100%);
  border-radius: 50% 50% 46% 46%;
  z-index: 3;
  box-shadow: inset 0 0 24px rgba(255,255,255,0.05);
}
.adminFaceVoid {
  position: absolute;
  top: 76px;
  left: 50%;
  width: 165px;
  height: 166px;
  transform: translateX(-50%);
  background: #000;
  border-radius: 45% 45% 50% 50%;
  z-index: 4;
  box-shadow: inset 0 0 25px rgba(0,0,0,1);
}
.adminBody {
  position: absolute;
  bottom: 20px;
  left: 50%;
  width: 295px;
  height: 320px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #181818 0%, #080808 100%);
  border-radius: 32px 32px 28px 28px;
  z-index: 1;
  box-shadow: inset 0 0 24px rgba(255,255,255,0.045);
}
.adminArm {
  position: absolute;
  top: 250px;
  width: 84px;
  height: 210px;
  background: linear-gradient(180deg, #151515, #050505);
  border-radius: 50px;
  z-index: 2;
}
.adminArm.left { left: 16px; transform: rotate(12deg); }
.adminArm.right { right: 16px; transform: rotate(-12deg); }
.adminPocket {
  position: absolute;
  bottom: 58px;
  left: 50%;
  width: 180px;
  height: 76px;
  transform: translateX(-50%);
  border: 2px solid rgba(255,255,255,0.055);
  border-radius: 0 0 22px 22px;
  z-index: 5;
}
.adminLogo {
  position: absolute;
  bottom: 162px;
  left: 50%;
  transform: translateX(-50%);
  color: #facc15;
  font-size: 31px;
  font-weight: 1000;
  letter-spacing: 5px;
  z-index: 6;
  text-shadow: 0 0 16px rgba(250, 204, 21, 0.2);
}
.adminCord {
  position: absolute;
  top: 190px;
  width: 2px;
  height: 105px;
  background: #3d3d3d;
  z-index: 7;
}
.adminCord.left { left: 145px; }
.adminCord.right { right: 145px; }
.floating {
  position: absolute;
  top: 70px;
  left: 50%;
  z-index: 10;
  color: #facc15;
  font-size: 34px;
  font-weight: 1000;
  pointer-events: none;
  animation: floatUp 0.85s ease forwards;
  text-shadow: 0 3px 0 #000;
}
@keyframes floatUp {
  0% { opacity: 1; transform: translate(-50%, 20px) scale(0.8); }
  100% { opacity: 0; transform: translate(-50%, -90px) scale(1.35); }
}
.bigClickButton {
  width: min(90%, 460px);
  padding: 22px;
  border: 0;
  border-radius: 18px;
  background: linear-gradient(180deg, #facc15 0%, #eab308 100%);
  color: #111;
  font-size: 26px;
  font-weight: 1000;
  cursor: pointer;
  box-shadow: 0 0 40px rgba(250, 204, 21, 0.35);
  letter-spacing: 1px;
  z-index: 3;
}
.bigClickButton:active { transform: scale(0.98); }
.randomBonus {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  background: #22c55e;
  color: white;
  border: 0;
  border-radius: 18px;
  padding: 14px 18px;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.45);
  z-index: 4;
}
.randomBonus span { font-size: 12px; opacity: 0.85; }
.sidePanel {
  background: rgba(0,0,0,0.66);
  border: 1px solid #333;
  border-radius: 28px;
  padding: 14px;
  min-height: 650px;
}
.tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}
.tabs button {
  background: #181818;
  color: #aaa;
  border: 1px solid #333;
  border-radius: 14px;
  padding: 12px 8px;
  font-weight: 900;
  cursor: pointer;
}
.tabs button.active {
  background: #facc15;
  color: #111;
  border-color: #facc15;
}
.shopList, .bonusList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.shopItem {
  display: grid;
  grid-template-columns: 54px 1fr auto;
  gap: 10px;
  align-items: center;
  background: #111;
  border: 1px solid #333;
  border-radius: 18px;
  color: white;
  padding: 12px;
  text-align: left;
  cursor: pointer;
}
.shopItem.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.shopEmoji {
  width: 54px;
  height: 54px;
  background: #222;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}
.shopInfo b {
  display: block;
  font-size: 16px;
  margin-bottom: 3px;
}
.shopInfo span {
  display: block;
  color: #aaa;
  font-size: 13px;
}
.shopInfo small {
  display: block;
  color: #666;
  margin-top: 4px;
}
.price {
  color: #facc15;
  font-weight: 1000;
  font-size: 18px;
}
.bonusCard {
  background: #111;
  border: 1px solid #333;
  border-radius: 18px;
  padding: 16px;
}
.bonusCard h3 {
  margin: 0 0 8px;
  color: #facc15;
}
.bonusCard p {
  margin: 0 0 12px;
  color: #bbb;
  line-height: 1.35;
}
.bonusButton {
  width: 100%;
  background: #facc15;
  color: #111;
  border: 0;
  border-radius: 14px;
  padding: 14px;
  font-weight: 1000;
  cursor: pointer;
}
.bonusButton:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.leadersBox {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.scoreBox {
  background: #111;
  border: 1px solid #333;
  border-radius: 18px;
  padding: 16px;
}
.scoreBox span {
  color: #aaa;
  display: block;
  margin-bottom: 5px;
}
.scoreBox b {
  color: #facc15;
  font-size: 34px;
}
.saveScoreButton {
  width: 100%;
  background: #facc15;
  color: #111;
  border: 0;
  border-radius: 14px;
  padding: 14px;
  font-weight: 1000;
  cursor: pointer;
}
.leadersList {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.leaderRow {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  background: #111;
  border: 1px solid #333;
  border-radius: 14px;
  padding: 12px;
}
.leaderRow span { color: #ddd; }
.leaderRow b { color: #facc15; }
.bottomText {
  max-width: 1180px;
  margin: 16px auto 0;
  color: #aaa;
  text-align: center;
}
.bottomText b { color: #facc15; }
@media (max-width: 900px) {
  .mainArea { grid-template-columns: 1fr; }
  .statsGrid { grid-template-columns: repeat(2, 1fr); }
  h1 { font-size: 32px; }
  .clickZone { min-height: 620px; }
  .sidePanel { min-height: auto; }
}
`;
