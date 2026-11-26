'use strict';

const balls = [...document.querySelectorAll('.ball')];
const button = document.querySelector('#draw-button');
const label = document.querySelector('#draw-label');
const status = document.querySelector('#draw-status');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const numberLimit = 45;
const drawCount = 6;
const colourBands = ['yellow', 'blue', 'red', 'grey', 'green'];
let revealTimer;

function randomIndex(length) {
  const sample = new Uint32Array(1);
  const range = 2 ** 32;
  const cutoff = range - (range % length);
  do {
    window.crypto.getRandomValues(sample);
  } while (sample[0] >= cutoff);
  return sample[0] % length;
}

function drawNumbers() {
  const pool = Array.from({ length: numberLimit }, (_, index) => index + 1);
  const numbers = Array.from({ length: drawCount }, () => {
    const index = randomIndex(pool.length);
    const number = pool[index];
    pool[index] = pool[pool.length - 1];
    pool.pop();
    return number;
  });
  return numbers.sort((left, right) => left - right);
}

function showNumber(ball, number) {
  ball.textContent = String(number);
  ball.removeAttribute('aria-label');
  ball.dataset.colour = colourBands[Math.floor((number - 1) / 10)];
}

function clearBalls() {
  for (const ball of balls) {
    ball.textContent = '–';
    ball.setAttribute('aria-label', '빈 공');
    delete ball.dataset.colour;
  }
}

button.addEventListener('click', () => {
  if (button.disabled) return;

  const numbers = drawNumbers();
  const valid = numbers.length === drawCount && new Set(numbers).size === drawCount &&
    numbers.every(number => Number.isInteger(number) && number >= 1 && number <= numberLimit);
  if (!valid) {
    status.textContent = '추첨에 실패했습니다. 다시 시도해 주세요.';
    return;
  }

  button.disabled = true;
  label.textContent = '추첨 중...';
  status.textContent = '번호를 추첨하고 있습니다.';
  clearBalls();

  function finishDraw() {
    label.textContent = '번호 다시 추첨하기';
    button.disabled = false;
    status.textContent = `추첨 결과: ${numbers.join(', ')}.`;
  }

  if (reducedMotion.matches) {
    numbers.forEach((number, index) => showNumber(balls[index], number));
    finishDraw();
    return;
  }

  function revealNext(index) {
    showNumber(balls[index], numbers[index]);
    if (index + 1 === numbers.length) {
      finishDraw();
    } else {
      revealTimer = setTimeout(revealNext, 370, index + 1);
    }
  }

  revealTimer = setTimeout(revealNext, 370, 0);
});

window.addEventListener('pagehide', () => {
  clearTimeout(revealTimer);
  clearBalls();
  button.disabled = false;
  label.textContent = '번호 추첨하기';
  status.textContent = '번호 추첨을 시작해 보세요.';
});
