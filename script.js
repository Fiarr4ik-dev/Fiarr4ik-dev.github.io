// Элементы
const clickArea = document.getElementById("clickArea");
const clicksDisplay = document.getElementById("clicks");
const rankDisplay = document.getElementById("rank");
const progressBar = document.getElementById("progress");
const resetBtn = document.getElementById("resetBtn");

const ranks = [
    { name: "Абитуриент",      target: 1000,   color: "#6c757d" },   // серый — начало пути
    { name: "Студент",         target: 5000,   color: "#007bff" },   // синий — как СФУ
    { name: "Магистрант",      target: 10000,  color: "#28a745" },   // зелёный — рост
    { name: "Аспирант",        target: 30000,  color: "#fd7e14" },   // оранжевый — наука
    { name: "Научный сотрудник", target: 60000, color: "#17a2b8" },  // бирюзовый — исследователь
    { name: "Профессор",       target: 80000,  color: "#6f42c1" },   // фиолетовый — мудрость
    { name: "Легенда СФУ",     target: 100000, color: "#d4af37" }    // золотой — пик!
];

// Загрузка прогресса
let totalClicks = parseInt(localStorage.getItem("clickerTotal")) || 0;
let currentRankIndex = 0;

// Определяем текущий ранг
function updateRank() {
    for (let i = 0; i < ranks.length; i++) {
        if (totalClicks < ranks[i].target) {
            currentRankIndex = i;
            break;
        }
        if (i === ranks.length - 1) {
            currentRankIndex = i; // Максимальный ранг
        }
    }
}

// Обновление интерфейса
function updateUI() {
    clicksDisplay.textContent = totalClicks;
    rankDisplay.textContent = ranks[currentRankIndex].name;

    const currentTarget = ranks[currentRankIndex].target;
    const prevTarget = currentRankIndex === 0 ? 0 : ranks[currentRankIndex - 1].target;
    const progress = ((totalClicks - prevTarget) / (currentTarget - prevTarget)) * 100;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
}

// Клик!
clickArea.addEventListener("click", () => {
    totalClicks++;
    clickArea.classList.add("click-animation");

    // Сохраняем
    localStorage.setItem("clickerTotal", totalClicks);

    // Обновляем
    updateRank();
    updateUI();

    // Убираем анимацию
    setTimeout(() => {
        clickArea.classList.remove("click-animation");
    }, 300);
});

// Сброс прогресса
resetBtn.addEventListener("click", () => {
    if (confirm("Ты уверен? Весь прогресс будет потерян!")) {
        totalClicks = 0;
        localStorage.removeItem("clickerTotal");
        updateRank();
        updateUI();
    }
});

// Инициализация
updateRank();
updateUI();