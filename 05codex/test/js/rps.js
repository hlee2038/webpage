const storageKey = 'ex02.rps.stats.v1';
const choices = ['scissors', 'rock', 'paper'];
const names = { scissors: '가위', rock: '바위', paper: '보' };
const beats = { scissors: 'paper', rock: 'scissors', paper: 'rock' };
const reasons = {
  scissors: '가위가 보를 잘랐습니다.',
  rock: '바위가 가위를 이겼습니다.',
  paper: '보가 바위를 감쌌습니다.'
};
const emptyStats = { wins: 0, losses: 0, draws: 0, streak: 0, best: 0 };
const buttons = [...document.querySelectorAll('.pick')];
const result = document.getElementById('result');
const resultTitle = document.getElementById('result-title');
const resultDetail = document.getElementById('result-detail');
const celebration = document.getElementById('celebration');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let stats = loadStats();
let activeRound = null;

function loadStats() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey));
    const valid = data && Object.keys(emptyStats).every(key =>
      Number.isSafeInteger(data[key]) && data[key] >= 0
    );
    if (valid && data.streak <= data.best && data.best <= data.wins &&
        Number.isSafeInteger(data.wins + data.losses + data.draws)) {
      const { wins, losses, draws, streak, best } = data;
      return { wins, losses, draws, streak, best };
    }
  } catch {
    // Storage can be unavailable or contain invalid JSON.
  }
  return { ...emptyStats };
}

function persistStats(reset = false) {
  try {
    if (reset) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, JSON.stringify(stats));
    }
  } catch {
    // Keep the game playable in browsers that restrict local storage.
  }
}

function renderStats() {
  const total = stats.wins + stats.losses + stats.draws;
  const rate = total ? Math.round(stats.wins / total * 100) : 0;
  for (const [key, value] of Object.entries({ ...stats, total, rate: rate + '%' })) {
    document.getElementById(key).textContent = value;
  }
}

function showHand(side, choice, label = names[choice]) {
  document.getElementById(side + '-hand').setAttribute('href', '#' + choice);
  document.getElementById(side + '-name').textContent = label;
}

function showResult(title, detail, outcome = '') {
  result.className = 'result' + (outcome ? ' ' + outcome + ' reveal' : '');
  resultTitle.textContent = title;
  resultDetail.textContent = detail;
}

function setChoicesDisabled(disabled) {
  for (const button of buttons) button.disabled = disabled;
}

function stopRound() {
  if (!activeRound) return;
  clearInterval(activeRound.countdown);
  clearInterval(activeRound.shuffle);
  activeRound = null;
  setChoicesDisabled(false);
}

function celebrate() {
  if (reducedMotion.matches) return;
  const colors = ['#ffb700', '#219cf4', '#eb586c', '#36a647'];
  for (let index = 0; index < 16; index++) {
    const piece = document.createElement('i');
    const direction = index < 8 ? -1 : 1;
    piece.style.setProperty('--x', (index < 8 ? 27 + index : 59 + index) + '%');
    piece.style.setProperty('--color', colors[index % colors.length]);
    piece.style.setProperty('--delay', (index % 4) * 35 + 'ms');
    piece.style.setProperty('--drift', direction * (16 + (index % 8) * 7) + 'px');
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
    celebration.append(piece);
  }
}

function finishRound(round) {
  if (activeRound !== round) return;
  stopRound();
  const { player, computer } = round;
  showHand('player', player);
  showHand('computer', computer);

  if (player === computer) {
    stats.draws++;
    stats.streak = 0;
    showResult('무승부!', '둘 다 ' + names[player] + ' 손 모양을 냈습니다.', 'draw');
  } else if (beats[player] === computer) {
    stats.wins++;
    stats.streak++;
    stats.best = Math.max(stats.best, stats.streak);
    showResult('👑 승리!', reasons[player], 'win');
    celebrate();
  } else {
    stats.losses++;
    stats.streak = 0;
    showResult('패배!', reasons[computer], 'loss');
  }
  renderStats();
  persistStats();
}

function play(player) {
  if (activeRound) return;
  const round = { player, computer: choices[Math.floor(Math.random() * choices.length)] };
  activeRound = round;
  setChoicesDisabled(true);
  celebration.replaceChildren();
  showHand('player', player);
  showHand('computer', 'unknown', '선택 중');
  const calls = ['가위!', '바위!', '보!'];
  let call = 0;
  showResult(calls[call], '컴퓨터가 손 모양을 고르고 있어요.');
  if (!reducedMotion.matches) {
    let frame = 0;
    round.shuffle = setInterval(() => {
      if (activeRound !== round) return;
      showHand('computer', choices[frame % choices.length], '선택 중');
      frame++;
    }, 115);
  }
  round.countdown = setInterval(() => {
    if (activeRound !== round) return;
    call++;
    if (call === calls.length) {
      finishRound(round);
    } else {
      resultTitle.textContent = calls[call];
    }
  }, 500);
}

function showReadyState() {
  stopRound();
  celebration.replaceChildren();
  showHand('player', 'unknown', '대기');
  showHand('computer', 'unknown', '대기');
  showResult('대결 준비!', '아래에서 가위, 바위, 보 중 하나를 골라 주세요.');
}

function resetGame() {
  stats = { ...emptyStats };
  persistStats(true);
  renderStats();
  showReadyState();
}

window.addEventListener('pagehide', () => {
  if (activeRound) showReadyState();
});
window.addEventListener('pageshow', event => {
  if (!event.persisted) return;
  stats = loadStats();
  renderStats();
});

for (const button of buttons) {
  button.addEventListener('click', () => play(button.dataset.choice));
}
document.getElementById('reset').addEventListener('click', resetGame);
renderStats();
