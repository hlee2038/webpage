'use strict';

const pound = 453592370000n;
const converters = {
  length: {
    defaultUnit: 'm',
    storagePrefix: 'length-converter-ex01:',
    iconName: 'ruler',
    negativeError: '0 이상의 길이를 입력해 주세요.',
    inputLimit: null,
    resultOrder: ['mm', 'in', 'cm', 'ft', 'm', 'yd', 'km', 'mi'],
    previewOrder: ['m', 'in', 'cm'],
    previewOverrides: { cm: ['mm', 'in'], ft: ['cm', 'm'], km: ['m', 'yd'] },
    // Exact factors in billionths of a meter.
    units: {
      mm: { name: '밀리미터', factor: 1000000n },
      cm: { name: '센티미터', factor: 10000000n },
      m: { name: '미터', factor: 1000000000n },
      km: { name: '킬로미터', factor: 1000000000000n },
      in: { name: '인치', factor: 25400000n },
      ft: { name: '피트', factor: 304800000n },
      yd: { name: '야드', factor: 914400000n },
      mi: { name: '마일', factor: 1609344000000n }
    }
  },
  weight: {
    defaultUnit: 'kg',
    storagePrefix: 'weight-converter-ex02:',
    iconName: 'scale',
    negativeError: '0 이상의 무게를 입력해 주세요.',
    inputLimit: 300,
    resultOrder: ['mg', 'oz', 'g', 'lb', 'kg', 'st', 't', 'US ton', 'UK ton'],
    previewOrder: ['kg', 'lb', 'g'],
    previewOverrides: {},
    // Exact factors in trillionths of a kilogram.
    units: {
      mg: { name: '밀리그램', factor: 1000000n },
      g: { name: '그램', factor: 1000000000n },
      kg: { name: '킬로그램', factor: 1000000000000n },
      t: { name: '미터톤', factor: 1000000000000000n },
      oz: { name: '온스', factor: pound / 16n },
      lb: { name: '파운드', factor: pound },
      st: { name: '스톤', factor: 14n * pound },
      'US ton': { name: '미국식 톤', factor: 2000n * pound },
      'UK ton': { name: '영국식 톤', factor: 2240n * pound }
    }
  }
};

const {
  defaultUnit, storagePrefix, iconName, negativeError, inputLimit,
  resultOrder, previewOrder, previewOverrides, units
} = converters[document.documentElement.dataset.converter];

const amount = document.querySelector('#amount');
const unit = document.querySelector('#unit');
const precision = document.querySelector('#precision');
const results = document.querySelector('#results');
const error = document.querySelector('#error');
const status = document.querySelector('#status');
const lightTheme = document.querySelector('#light-theme');
const darkTheme = document.querySelector('#dark-theme');
const clearAmount = document.querySelector('#clear-amount');
const historyList = document.querySelector('#history-list');
const emptyHistory = document.querySelector('#empty-history');
const clearHistory = document.querySelector('#clear-history');
const historyLimit = 8;
const historyValueLimit = 301;
const integerFormat = new Intl.NumberFormat('ko-KR');
const timeFormat = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const decimalPattern = /^-?[0-9]*(?:\.[0-9]*)?$/;
const completeNumber = /[0-9]/;
let historyTimer;
let previousInput = '';
let history = readHistory();

function readSetting(key) {
  try {
    return localStorage.getItem(storagePrefix + key);
  } catch {
    return null;
  }
}

function saveSetting(key, value) {
  try {
    localStorage.setItem(storagePrefix + key, value);
  } catch {
    // Conversion remains available when browser storage is blocked.
  }
}

function readHistory() {
  try {
    const entries = JSON.parse(readSetting('history'));
    return Array.isArray(entries) ? entries.filter(entry =>
      entry && typeof entry.value === 'string' && /^\d+(?:\.\d+)?$/.test(entry.value) &&
      entry.value.length <= historyValueLimit && Object.hasOwn(units, entry.unit)
    ).slice(0, historyLimit) : [];
  } catch {
    return [];
  }
}

function splitDecimal(value) {
  const [integer, fraction = ''] = value.split('.');
  return {
    integer: integer.replace(/^0+(?=\d)/, '') || '0',
    fraction: fraction.replace(/0+$/, '')
  };
}

function roundedDecimal(numerator, denominator, digits) {
  const scale = 10n ** BigInt(digits);
  const scaled = (numerator * scale * 2n + denominator) / (2n * denominator);
  return { integer: scaled / scale, fraction: (scaled % scale).toString().padStart(digits, '0').replace(/0+$/, '') };
}

function scientific(numerator, denominator, digits) {
  let exponent = numerator.toString().length - denominator.toString().length;
  let top = numerator * 10n ** BigInt(Math.max(0, -exponent));
  const bottom = denominator * 10n ** BigInt(Math.max(0, exponent));
  if (top < bottom) {
    top *= 10n;
    exponent -= 1;
  }
  const mantissa = roundedDecimal(top, bottom, digits);
  if (mantissa.integer === 10n) {
    mantissa.integer = 1n;
    exponent += 1;
  }
  return `${mantissa.integer}${mantissa.fraction ? '.' + mantissa.fraction : ''}e${exponent >= 0 ? '+' : ''}${exponent}`;
}

function formatResult(numerator, denominator, digits) {
  const { integer, fraction } = roundedDecimal(numerator, denominator, digits);
  if (numerator > 0n && ((integer === 0n && !fraction) || integer >= 1000000000000000n)) {
    return scientific(numerator, denominator, digits);
  }
  return `${integerFormat.format(integer)}${fraction ? '.' + fraction : ''}`;
}

for (const [symbol, { name }] of Object.entries(units)) {
  unit.add(new Option(`${name} (${symbol})`, symbol));
}
for (let digits = 0; digits <= 12; digits += 1) {
  precision.add(new Option(`${digits}자리`, digits));
}
unit.value = defaultUnit;
precision.value = '6';

function icon(name) {
  return `<svg class="icon" aria-hidden="true"><use href="#icon-${name}"/></svg>`;
}

const rows = resultOrder.map(symbol => {
  const { name } = units[symbol];
  const row = document.createElement('li');
  row.className = symbol.endsWith(' ton') ? 'result result-ton' : 'result';
  row.innerHTML = `<span class="unit-badge" aria-hidden="true">${symbol}</span>
    <span class="result-label">${name}<span class="sr-only" hidden> (기준 단위)</span></span>
    <span class="result-value"><output for="amount unit precision"></output><span class="result-symbol" aria-hidden="true">${symbol}</span></span>
    <button type="button" class="icon-button" aria-label="${name} 결과 복사" title="${name} 결과 복사">${icon('copy')}</button>`;
  results.append(row);
  const output = row.querySelector('output');
  const copy = row.querySelector('button');
  const badge = row.querySelector('.sr-only');
  output.setAttribute('aria-live', 'off');
  copy.addEventListener('click', () => copyResult(output.textContent, name));
  return { symbol, row, output, copy, badge };
});

async function copyResult(value, name) {
  const plain = value.replaceAll(',', '');
  try {
    await navigator.clipboard.writeText(plain);
  } catch {
    const field = document.createElement('textarea');
    field.className = 'sr-only';
    field.value = plain;
    field.readOnly = true;
    const focused = document.activeElement;
    document.body.append(field);
    field.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      // Some browsers disable clipboard access for local files.
    } finally {
      field.remove();
      focused?.focus();
    }
    if (!copied) {
      status.textContent = '복사할 수 없습니다. 결과를 선택해 직접 복사해 주세요.';
      return;
    }
  }
  status.textContent = `${name} 결과를 복사했습니다.`;
}

function renderHistory() {
  emptyHistory.hidden = history.length > 0;
  clearHistory.disabled = history.length === 0;
  historyList.replaceChildren(...history.map(entry => {
    const row = document.createElement('li');
    row.innerHTML = `${icon(iconName)}
      <div class="history-content"><strong class="history-value"></strong><p class="history-summary"></p></div>
      <div class="history-actions"><button type="button" class="icon-button" title="기록 삭제">${icon('trash')}</button></div>`;
    const value = row.querySelector('.history-value');
    const { integer, fraction } = splitDecimal(entry.value);
    value.textContent = `${integerFormat.format(BigInt(integer))}${fraction ? '.' + fraction : ''} ${entry.unit}`;
    const numerator = BigInt(integer + fraction) * units[entry.unit].factor;
    const scale = 10n ** BigInt(fraction.length);
    const previewUnits = previewOverrides[entry.unit] || previewOrder.filter(symbol => symbol !== entry.unit).slice(0, 2);
    const preview = previewUnits.map(symbol =>
      `${formatResult(numerator, scale * units[symbol].factor, Number(precision.value))} ${symbol}`
    );
    row.querySelector('.history-summary').textContent = `= ${preview.join(', ')} 외 ${Object.keys(units).length - preview.length - 1}개`;
    const remove = row.querySelector('button');
    if (Number.isFinite(entry.timestamp)) {
      const timestamp = new Date(entry.timestamp);
      if (!Number.isNaN(timestamp.getTime())) {
        const time = document.createElement('time');
        time.dateTime = timestamp.toISOString();
        time.textContent = timeFormat.format(timestamp);
        remove.before(time);
      }
    }
    remove.setAttribute('aria-label', `${value.textContent} 기록 삭제`);
    remove.addEventListener('click', () => {
      const index = history.indexOf(entry);
      history.splice(index, 1);
      saveHistory();
      (historyList.children[Math.min(index, history.length - 1)]?.querySelector('button') || amount).focus();
    });
    return row;
  }));
}

function saveHistory() {
  saveSetting('history', JSON.stringify(history));
  renderHistory();
}

function scheduleHistory(value, symbol) {
  historyTimer = setTimeout(() => {
    if (history[0]?.value === value && history[0]?.unit === symbol) return;
    history = [{ value, unit: symbol, timestamp: Date.now() }, ...history.filter(entry => entry.value !== value || entry.unit !== symbol)]
      .slice(0, historyLimit);
    saveHistory();
  }, 1200);
}

function convert(record = false) {
  if (record) clearTimeout(historyTimer);
  const value = amount.value;
  clearAmount.hidden = value === '';
  const symbol = unit.value;
  const negative = value.startsWith('-') && completeNumber.test(value);
  const outOfRange = inputLimit !== null && value.length > inputLimit;
  const valid = completeNumber.test(value) && !negative && !outOfRange;
  error.textContent = outOfRange ? `계산 가능 범위를 초과했습니다. 소수점을 포함해 ${inputLimit}자까지 입력해 주세요.`
    : negative ? negativeError : '';
  error.hidden = !error.textContent;
  amount.setAttribute('aria-invalid', String(negative || outOfRange));
  const { integer, fraction } = valid ? splitDecimal(value) : {};
  const baseNumerator = valid ? BigInt(integer + fraction) * units[symbol].factor : 0n;
  const scale = valid ? 10n ** BigInt(fraction.length) : 1n;
  for (const entry of rows) {
    const isBase = entry.symbol === symbol;
    entry.row.toggleAttribute('data-base', isBase);
    entry.badge.hidden = !isBase;
    entry.output.textContent = valid
      ? formatResult(baseNumerator, scale * units[entry.symbol].factor, Number(precision.value))
      : '—';
    entry.copy.disabled = !valid;
  }
  if (valid && record) scheduleHistory(fraction ? `${integer}.${fraction}` : integer, symbol);
}

function handleInput(event) {
  if (event.isComposing) return;
  const value = amount.value.trim().replace(',', '.');
  if (!decimalPattern.test(value)) {
    const caret = Math.max(0, (amount.selectionStart ?? previousInput.length) - Math.max(0, value.length - previousInput.length));
    amount.value = previousInput;
    amount.setSelectionRange(caret, caret);
    return;
  }
  if (value !== amount.value) amount.value = value;
  previousInput = value;
  convert(true);
}

function applyTheme(dark) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  lightTheme.setAttribute('aria-pressed', String(!dark));
  darkTheme.setAttribute('aria-pressed', String(dark));
}

function clearInput() {
  clearTimeout(historyTimer);
  amount.value = previousInput = '';
  status.textContent = '';
  convert();
  amount.focus();
}

amount.addEventListener('input', handleInput);
amount.addEventListener('compositionend', handleInput);
unit.addEventListener('change', () => convert(true));
precision.addEventListener('change', () => {
  convert();
  renderHistory();
});
clearAmount.addEventListener('click', clearInput);
document.querySelector('#reset').addEventListener('click', () => {
  unit.value = defaultUnit;
  clearInput();
});
clearHistory.addEventListener('click', () => {
  clearTimeout(historyTimer);
  history = [];
  saveHistory();
  amount.focus();
});
lightTheme.addEventListener('click', () => {
  applyTheme(false);
  saveSetting('theme', 'light');
});
darkTheme.addEventListener('click', () => {
  applyTheme(true);
  saveSetting('theme', 'dark');
});

applyTheme(readSetting('theme') === 'dark');
renderHistory();
convert();
