let interval;
let totalSessions = 0;
let purposeText = '';
let isBreak = false;
let workDuration = 25;
let breakDuration = 5;
let cyclesLeft = 0;
let currentCycle = 1;
const startSound = new Audio('assets/start.wav');
const endSound = new Audio('assets/end.wav');
const daysOfWeek = ["Pn", "Wt", "Śr", "Czw", "Pt", "Sb", "Nd"];
let last7DaysSessions = [1, 2, 1, 3, 0, 2, 1];

// Pytania refleksyjne
const reflectionQuestions = [
  "Co dzisiaj poszło Ci najlepiej?",
  "Co było największym wyzwaniem?",
  "Jak się teraz czujesz?",
  "Co mogę zrobić lepiej następnym razem?",
  "Co mnie dzisiaj najbardziej zaskoczyło?",
  "Za co jestem teraz wdzięczny?",
  "Czy skupiłem się na najważniejszym celu?",
  "Co sprawiło mi dzisiaj radość?"
];

// Najpierw tworzymy wykres
const miniCtx = document.getElementById('miniSessionsChart').getContext('2d');
const miniSessionsChart = new Chart(miniCtx, {
  type: 'bar',
  data: {
    labels: daysOfWeek,
    datasets: [{
      label: 'Sesje',
      data: last7DaysSessions,
      backgroundColor: '#657EBE',
      borderColor: '#F2E1AE',
      borderWidth: 1,
      borderRadius: 6,
      barThickness: 20,
    }]
  },
  options: {
    maintainAspectRatio: true,
    responsive: false, // ważne: false
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }
});


// Dopiero teraz aktualizacja danych z localStorage
if (localStorage.getItem('totalSessions')) {
  totalSessions = parseInt(localStorage.getItem('totalSessions'));
  const sessionsElement = document.getElementById('sessions');
  if (sessionsElement) {
    sessionsElement.textContent = totalSessions;
  }
}

if (localStorage.getItem('last7DaysSessions')) {
  last7DaysSessions = JSON.parse(localStorage.getItem('last7DaysSessions'));
  miniSessionsChart.data.datasets[0].data = last7DaysSessions;
  miniSessionsChart.update();
}

// Start sesji
function startSession() {
  workDuration = parseInt(document.getElementById('minutes').value) || 25;
  cyclesLeft = parseInt(document.getElementById('cycles').value) || 4;
  purposeText = document.getElementById('purpose').value || "Nie podano celu";
  isBreak = false;
  currentCycle = 1;
  startSound.play();

  document.getElementById('cycle-counter').classList.remove('hidden');
  document.getElementById('current-cycle').textContent = currentCycle;
  document.getElementById('total-cycles').textContent = cyclesLeft;

  startTimer(workDuration);
}

// Timer
function startTimer(minutes) {
  let time = minutes * 60;
  clearInterval(interval);

  interval = setInterval(() => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    document.getElementById('timer').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    time--;

    if (time < 0) {
      clearInterval(interval);

      if (!isBreak) {
        isBreak = true;
        showNotification("Czas na przerwę! 🧘‍♀️");
        setTimeout(() => {
          startTimer(breakDuration);
        }, 2000);
      } else {
        isBreak = false;
        cyclesLeft--;
        currentCycle++;

        if (cyclesLeft > 0) {
          document.getElementById('current-cycle').textContent = currentCycle;
          showNotification("Wracamy do pracy! 👩‍🏫");
          setTimeout(() => {
            startTimer(workDuration);
          }, 2000);
        } else {
          document.getElementById('cycle-counter').classList.add('hidden');
          totalSessions++;

          const sessionsElement = document.getElementById('sessions');
          if (sessionsElement) {
            sessionsElement.textContent = totalSessions;
          }

          const topPurpose = document.getElementById('top-purpose');
          if (topPurpose) {
            topPurpose.textContent = purposeText;
          }

          const today = new Date().getDay();
          const index = (today === 0) ? 6 : today - 1;
          last7DaysSessions[index]++;
          miniSessionsChart.data.datasets[0].data = last7DaysSessions;
          miniSessionsChart.update();

          localStorage.setItem('totalSessions', totalSessions);
          localStorage.setItem('last7DaysSessions', JSON.stringify(last7DaysSessions));

          endSound.play();
          showNotification("Gratulacje, koniec pracy na dzisiaj! 🎉");

          setTimeout(() => {
            showReflection();
          }, 2000);
        }
      }
    }
  }, 1000);
}

// Powiadomienia
function showNotification(message) {
  const modal = document.getElementById('notification-modal');
  const text = document.getElementById('notification-text');

  text.textContent = message;
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 2000);
}

// Refleksja
function showReflection() {
  const randomIndex = Math.floor(Math.random() * reflectionQuestions.length);
  const randomQuestion = reflectionQuestions[randomIndex];
  document.querySelector('#reflection-modal p').textContent = randomQuestion;

  document.getElementById('reflection-modal').classList.remove('hidden');
}

// Zamknięcie refleksji
function closeReflection() {
  document.getElementById('reflection-modal').classList.add('hidden');
  flowerConfetti();
}

// Confetti
function flowerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pastelColors = ["#C6C0B0", "#ECD4BD", "#CB977F", "#9E8185", "#9AA0A0"];
  const petals = [];

  for (let i = 0; i < 40; i++) {
    petals.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: Math.random() * 20 + 10,
      speed: Math.random() * 2 + 1,
      drift: Math.random() * 1.5 - 0.75,
      color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 2 - 1
    });
  }

  function drawPetals() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    petals.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });

    petals.forEach(p => {
      p.y += p.speed;
      p.x += p.drift;
      p.rotation += p.rotationSpeed;
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
        p.color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
      }
    });

    requestAnimationFrame(drawPetals);
  }

  drawPetals();

  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 6000);
}
