const modeButtons = document.querySelectorAll(".mode-btn");
const clickArea = document.getElementById("clickArea");
const progressValue = document.getElementById("progressValue");
const rankDisplay = document.getElementById("rank");
const progressBar = document.getElementById("progressBar");
const resetBtn = document.getElementById("resetBtn");

let currentMode = null;

const universityRanks = [
    { name: "Абитуриент", target: 100 },
    { name: "Студент", target: 500 },
    { name: "Магистрант", target: 1000 },
    { name: "Аспирант", target: 3000 },
    { name: "Научный сотрудник", target: 6000 },
    { name: "Профессор", target: 8000 },
    { name: "Легенда СФУ", target: 10000 }
];

const dormLevels = Array.from({ length: 30 }, (_, i) => ({
    name: `Общага № ${i + 1}`,
    target: (i + 1) * 10
}));

const data = {
    university: { clicks: 0, ranks: universityRanks },
    dorm: { clicks: 0, ranks: dormLevels }
};

function loadFromStorage() {
    const saved = localStorage.getItem("clickerData");
    if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.university?.clicks !== undefined) data.university.clicks = parsed.university.clicks;
        if (parsed.dorm?.clicks !== undefined) data.dorm.clicks = parsed.dorm.clicks;
    }
}

function saveToStorage() {
    localStorage.setItem("clickerData", JSON.stringify({
        university: { clicks: data.university.clicks },
        dorm: { clicks: data.dorm.clicks }
    }));
}

function switchMode(mode) {
    currentMode = mode;

    modeButtons.forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.mode === mode) {
            btn.classList.add("active");
        }
    });

    updateUI();
}

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

    if (currentRankIndex === rankList.length - 1) {
        progressBar.style.backgroundColor = "#5ec318";
    } else {
        progressBar.style.backgroundColor = "#0057A5";
    }
}

clickArea.addEventListener("click", () => {
    if (!currentMode) {
        alert("Выбери режим: ВУЗ или Общага");
        return;
    }

    data[currentMode].clicks++;
    clickArea.classList.add("click-animation");

    setTimeout(() => {
        clickArea.classList.remove("click-animation");
    }, 150);

    saveToStorage();
    updateUI();
});

modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        switchMode(btn.dataset.mode);
    });
});

resetBtn.addEventListener("click", () => {
    if (!currentMode) return;
    if (confirm("Сбросить прогресс этого режима?")) {
        data[currentMode].clicks = 0;
        saveToStorage();
        updateUI();
    }
});

loadFromStorage();
switchMode("university");