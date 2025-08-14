// Элементы
const modeButtons = document.querySelectorAll(".mode-btn");
const clickArea = document.getElementById("clickArea");
const progressValue = document.getElementById("progressValue");
const rankDisplay = document.getElementById("rank");
const progressBar = document.getElementById("progressBar");
const resetBtn = document.getElementById("resetBtn");
const upgradeList = document.getElementById("upgradeList");

const addBtn = document.getElementById("addBtn");
const addForm = document.getElementById("addForm");
const codeInput = document.getElementById("codeInput");
const amountInput = document.getElementById("amountInput");
const confirmAdd = document.getElementById("confirmAdd");

let currentMode = null;

// Ранги
const universityRanks = [
    { name: "Абитуриент", target: 10000 },
    { name: "Студент", target: 50000 },
    { name: "Магистрант", target: 100000 },
    { name: "Аспирант", target: 300000 },
    { name: "Научный сотрудник", target: 600000 },
    { name: "Профессор", target: 800000 },
    { name: "Легенда СФУ", target: 1000000 }
];

const dormLevels = Array.from({ length: 30 }, (_, i) => ({
    name: `Общага № ${i + 1}`,
    target: (i + 1) * 1000
}));

// Данные
const data = {
    university: { clicks: 0, ranks: universityRanks },
    dorm: { clicks: 0, ranks: dormLevels }
};

// Шаблоны апгрейдов
const upgradeTemplates = {
    university: [
        { id: "mouse_turbo", name: "🐭 Лабораторная мышь", description: "+1 клик. Ускоряет научные изыскания", price: 500, value: 1, count: 0, type: "click" },
        { id: "keyboard_laser", name: "💼 Грант от Минобрнауки", description: "+5 кликов. Научный прорыв!", price: 5000, value: 5, count: 0, type: "click" },
        { id: "super_mouse", name: "📚 Докторская диссертация", description: "+10 кликов. Ты — светило науки", price: 50000, value: 10, count: 0, type: "click" },
        { id: "autoclicker", name: "🧑‍🔬 Аспирант-помощник", description: "+1 каждые 2 сек. Работает за еду", price: 10000, value: 1, count: 0, type: "auto" }
    ],
    dorm: [
        { id: "mouse_turbo", name: "⚡ Чайник на 1500 Вт", description: "+1 клик. Кипятит за 30 сек", price: 500, value: 1, count: 0, type: "click" },
        { id: "keyboard_laser", name: "🌯 Шаурма у 5-й общаги", description: "+5 кликов. Энергия на весь день", price: 5000, value: 5, count: 0, type: "click" },
        { id: "super_mouse", name: "📶 Wi-Fi с пароля 12345678", description: "+10 кликов. Ловит даже в подвале", price: 50000, value: 10, count: 0, type: "click" },
        { id: "autoclicker", name: "🍬 Сосед по комнате", description: "+1 каждые 2 сек. Кликает за конфетку", price: 10000, value: 1, count: 0, type: "auto" }
    ]
};

let upgrades = [];
let clickPower = 1;

// 🔐 Код для накрутки
const CHEAT_CODE = "sfu2025";

// Загрузка
function loadFromStorage() {
    const savedData = localStorage.getItem("clickerData");
    if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.university?.clicks !== undefined) data.university.clicks = parsed.university.clicks;
        if (parsed.dorm?.clicks !== undefined) data.dorm.clicks = parsed.dorm.clicks;
    }

    const savedUpgrades = localStorage.getItem("upgrades");
    if (savedUpgrades) {
        const parsed = JSON.parse(savedUpgrades);
        ["university", "dorm"].forEach(mode => {
            if (parsed[mode]) {
                Object.keys(parsed[mode]).forEach(id => {
                    const upgrade = upgradeTemplates[mode].find(u => u.id === id);
                    if (upgrade) upgrade.count = parsed[mode][id].count;
                });
            }
        });
    }
}

// Сохранение
function saveToStorage() {
    localStorage.setItem("clickerData", JSON.stringify({
        university: { clicks: data.university.clicks },
        dorm: { clicks: data.dorm.clicks }
    }));

    const saved = { university: {}, dorm: {} };
    ["university", "dorm"].forEach(mode => {
        upgradeTemplates[mode].forEach(u => {
            saved[mode][u.id] = { count: u.count };
        });
    });
    localStorage.setItem("upgrades", JSON.stringify(saved));
}

// Пересчёт силы клика
function recalculateClickPower() {
    clickPower = 1 + upgrades
        .filter(u => u.type === "click")
        .reduce((sum, u) => sum + u.value * u.count, 0);
}

// Рендер апгрейдов
function renderUpgrades() {
    upgradeList.innerHTML = "";
    upgrades.forEach(upg => {
        const price = Math.floor(upg.price * (1 + upg.count * 0.5));
        const canBuy = data[currentMode].clicks >= price;

        const div = document.createElement("div");
        div.className = "upgrade-item";
        div.innerHTML = `
      <div>
        <strong>${upg.name}</strong> (${upg.count})
        <p class="description">${upg.description}</p>
      </div>
      <button ${canBuy ? "" : "disabled"}>
        Купить за ${price}
      </button>
    `;
        div.querySelector("button").addEventListener("click", () => buyUpgrade(upg));
        upgradeList.appendChild(div);
    });
}

// Покупка
function buyUpgrade(upgrade) {
    const price = Math.floor(upgrade.price * (1 + upgrade.count * 0.5));
    if (data[currentMode].clicks < price) return;

    data[currentMode].clicks -= price;
    upgrade.count++;
    saveToStorage();
    recalculateClickPower();
    updateUI();
    renderUpgrades();
}

// Клик
clickArea.addEventListener("click", () => {
    if (!currentMode) {
        alert("Выбери режим: ВУЗ или Общага");
        return;
    }

    data[currentMode].clicks += clickPower;
    clickArea.classList.add("click-animation");

    setTimeout(() => {
        clickArea.classList.remove("click-animation");
    }, 150);

    saveToStorage();
    updateUI();
    renderUpgrades();
});

// Автокликер
setInterval(() => {
    if (currentMode) {
        upgrades.forEach(u => {
            if (u.type === "auto" && u.count > 0) {
                data[currentMode].clicks += u.value * u.count;
            }
        });
        updateUI();
        renderUpgrades();
        saveToStorage();
    }
}, 2000);

// Смена режима
function switchMode(mode) {
    currentMode = mode;
    upgrades = JSON.parse(JSON.stringify(upgradeTemplates[mode]));

    const saved = localStorage.getItem("upgrades");
    if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[mode]) {
            upgrades.forEach(u => {
                if (parsed[mode][u.id]) u.count = parsed[mode][u.id].count;
            });
        }
    }

    recalculateClickPower();

    modeButtons.forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.mode === mode) btn.classList.add("active");
    });

    updateUI();
    renderUpgrades();
}

// Обновление интерфейса
function updateUI() {
    if (!currentMode) return;

    const d = data[currentMode];
    const rankList = d.ranks;
    let currentRankIndex = 0;
    let nextTarget = rankList[0].target;

    for (let i = 0; i < rankList.length; i++) {
        if (d.clicks < rankList[i].target) {
            currentRankIndex = i;
            nextTarget = rankList[i].target;
            break;
        }
        if (i === rankList.length - 1) {
            currentRankIndex = i;
            nextTarget = rankList[i].target;
        }
    }

    const currentRank = rankList[currentRankIndex];
    const prevTarget = currentRankIndex === 0 ? 0 : rankList[currentRankIndex - 1].target;
    const progress = nextTarget - prevTarget > 0
        ? ((d.clicks - prevTarget) / (nextTarget - prevTarget)) * 100
        : 100;

    progressValue.textContent = d.clicks;
    rankDisplay.textContent = currentRank.name;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
    progressBar.style.backgroundColor = currentRankIndex === rankList.length - 1 ? "#5ec318" : "#0057A5";
}

// Сброс
resetBtn.addEventListener("click", () => {
    if (!currentMode) return;
    if (confirm("Сбросить прогресс этого режима?")) {
        data[currentMode].clicks = 0;
        saveToStorage();
        updateUI();
        renderUpgrades();
    }
});

// Переключение режимов
modeButtons.forEach(btn => {
    btn.addEventListener("click", () => switchMode(btn.dataset.mode));
});

// Накрутка
addBtn.addEventListener("click", () => {
    addForm.style.display = addForm.style.display === "none" ? "block" : "none";
    codeInput.value = "";
    amountInput.value = "";
});

confirmAdd.addEventListener("click", () => {
    const code = codeInput.value.trim();
    const amount = parseInt(amountInput.value);

    if (!code || !amount || amount <= 0) {
        alert("Заполни все поля!");
        return;
    }

    if (code !== CHEAT_CODE) {
        alert("❌ Неверный код!");
        return;
    }

    data[currentMode].clicks += amount;
    saveToStorage();
    updateUI();
    renderUpgrades();
    alert(`✅ Успешно добавлено ${amount} кликов!`);
    addForm.style.display = "none";
});

// Инициализация
loadFromStorage();
switchMode("university");