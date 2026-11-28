/**
 * SIMULASI CAT CPNS 2027 ENGINE
 * PermenPAN-RB Official Algorithm & Interactive UI
 * Author: Dr. Ilham Pradani Hub
 */

let bankData = null;
let currentExam = {
  packetType: '',
  questions: [],
  currentIndex: 0,
  answers: {},     // { questionId: 'A' }
  ragu: {},        // { questionId: true/false }
  durationSeconds: 100 * 60,
  secondsLeft: 100 * 60,
  timerInterval: null,
  isFinished: false,
  startTime: null
};

let participantName = localStorage.getItem('cat_participant_name') || 'Calon ASN Hebat';
let currentFontSizeLevel = 0; // -1: small, 0: normal, 1: large

// 1. INITIALIZATION ON PAGE LOAD
document.addEventListener('DOMContentLoaded', async () => {
  setupThemeToggle();
  setupKeyboardNavigation();
  loadParticipantName();
  await loadBankData();
  checkOngoingSession();
});

// Load Participant Name
function loadParticipantName() {
  const inputEl = document.getElementById('input-nama-peserta');
  const displayEl = document.getElementById('user-display-name');
  if (inputEl) inputEl.value = participantName;
  if (displayEl) displayEl.textContent = participantName;
}

function saveParticipantName() {
  const inputEl = document.getElementById('input-nama-peserta');
  if (inputEl && inputEl.value.trim()) {
    participantName = inputEl.value.trim();
    localStorage.setItem('cat_participant_name', participantName);
    loadParticipantName();
    alert('✅ Nama peserta berhasil disimpan: ' + participantName);
  }
}

// Setup Theme
function setupThemeToggle() {
  const isDark = localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  const btn = document.getElementById('btn-toggle-theme');
  if (btn) {
    btn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const darkNow = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', darkNow ? 'dark' : 'light');
    });
  }

  const btnFs = document.getElementById('btn-fullscreen');
  if (btnFs) {
    btnFs.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen().catch(err => console.log(err));
      }
    });
  }
}

// 2. LOAD BANK SOAL JSON DATA
async function loadBankData() {
  try {
    const res = await fetch('data/cpns_bank_soal.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    bankData = await res.json();
    
    // Update badge count
    const totalCountEl = document.getElementById('total-bank-count');
    if (totalCountEl && bankData.metadata && bankData.metadata.counts) {
      totalCountEl.textContent = bankData.metadata.counts.total || 399;
    }
  } catch (err) {
    console.error('Gagal memuat bank soal:', err);
    alert('Peringatan: Gagal memuat data bank soal lokal. Pastikan koneksi dan file data tersedia.');
  }
}

// 3. START EXAM / CHOOSE PACKET
function startExam(packetType) {
  if (!bankData) {
    alert('Data bank soal sedang dimuat, silakan tunggu 2 detik lalu klik lagi.');
    return;
  }

  let questions = [];
  let durationMinutes = 100;

  if (packetType === 'full_simulation') {
    // 110 Soal: 30 TWK + 35 TIU + 45 TKP
    const twkPool = [...(bankData.twk || [])];
    const tiuPool = [...(bankData.tiu || []), ...(bankData.prediksi_tiu || [])];
    const tkpPool = [...(bankData.tkp || [])];

    const twkSelected = twkPool.slice(0, 30);
    const tiuSelected = tiuPool.slice(0, 35);
    const tkpSelected = tkpPool.slice(0, 45);

    questions = [...twkSelected, ...tiuSelected, ...tkpSelected];
    durationMinutes = 100;
  } else if (packetType === 'twk_only') {
    questions = (bankData.twk || []).slice(0, 30);
    durationMinutes = 25;
  } else if (packetType === 'tiu_only') {
    questions = [...(bankData.tiu || []), ...(bankData.prediksi_tiu || [])].slice(0, 35);
    durationMinutes = 35;
  } else if (packetType === 'tkp_only') {
    questions = (bankData.tkp || []).slice(0, 45);
    durationMinutes = 40;
  } else if (packetType === 'posttest') {
    questions = (bankData.posttest || []).length > 0 ? bankData.posttest : (bankData.all || []).slice(0, 110);
    durationMinutes = 100;
  } else if (packetType === 'prediksi') {
    questions = [...(bankData.prediksi_tiu || []), ...(bankData.tiu || []).slice(0, 30)];
    durationMinutes = 35;
  } else {
    questions = (bankData.pretest || []).length > 0 ? bankData.pretest : (bankData.all || []).slice(0, 110);
    durationMinutes = 100;
  }

  if (questions.length === 0) {
    alert('Maaf, tidak ada soal yang ditemukan untuk paket ini.');
    return;
  }

  currentExam = {
    packetType: packetType,
    questions: questions,
    currentIndex: 0,
    answers: {},
    ragu: {},
    durationSeconds: durationMinutes * 60,
    secondsLeft: durationMinutes * 60,
    timerInterval: null,
    isFinished: false,
    startTime: Date.now()
  };

  saveSessionToStorage();
  switchToScreen('exam');
  renderCurrentQuestion();
  renderGrid();
  startTimer();
}

// 4. TIMER LOGIC
function startTimer() {
  if (currentExam.timerInterval) clearInterval(currentExam.timerInterval);

  const timerDisplay = document.getElementById('exam-timer');
  const updateDisplay = () => {
    const mins = Math.floor(currentExam.secondsLeft / 60);
    const secs = currentExam.secondsLeft % 60;
    const str = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (timerDisplay) timerDisplay.textContent = str;

    // Visual warning when time is running low
    if (currentExam.secondsLeft <= 300) { // < 5 mins
      timerDisplay.classList.add('text-rose-500', 'animate-pulse');
    } else if (currentExam.secondsLeft <= 600) { // < 10 mins
      timerDisplay.classList.add('text-amber-500');
    }
  };

  updateDisplay();
  currentExam.timerInterval = setInterval(() => {
    currentExam.secondsLeft--;
    saveSessionToStorage();

    if (currentExam.secondsLeft <= 0) {
      clearInterval(currentExam.timerInterval);
      alert('⏰ Waktu Ujian Telah Habis! Sistem akan mengumpulkan jawaban Anda otomatis.');
      finishExam();
    } else {
      updateDisplay();
    }
  }, 1000);
}

// 5. RENDER CURRENT QUESTION & OPTIONS
function renderCurrentQuestion() {
  const q = currentExam.questions[currentExam.currentIndex];
  if (!q) return;

  const qNum = currentExam.currentIndex + 1;
  const totalQ = currentExam.questions.length;

  document.getElementById('current-question-num').textContent = qNum;
  document.getElementById('total-questions-exam').textContent = totalQ;

  // Category Badge & Title
  const badgeCat = document.getElementById('badge-category');
  const titleSub = document.getElementById('title-subtest');
  const ruleSub = document.getElementById('subtest-scoring-rule');

  badgeCat.textContent = q.category || 'SKD';
  if (q.category === 'TWK') {
    badgeCat.className = 'px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-wider';
    titleSub.textContent = 'Tes Wawasan Kebangsaan (TWK)';
    ruleSub.textContent = 'Nilai: Benar +5, Salah 0, Kosong 0 • Passing Grade: 65';
  } else if (q.category === 'TIU') {
    badgeCat.className = 'px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider';
    titleSub.textContent = 'Tes Intelegensia Umum (TIU)';
    ruleSub.textContent = 'Nilai: Benar +5, Salah 0, Kosong 0 • Passing Grade: 80';
  } else {
    badgeCat.className = 'px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider';
    titleSub.textContent = 'Tes Karakteristik Pribadi (TKP)';
    ruleSub.textContent = 'Nilai: Pilihan bernilai 1 s.d. 5 Poin, Kosong 0 • Passing Grade: 166';
  }

  // Question Text
  const qTextEl = document.getElementById('question-text');
  qTextEl.textContent = q.question;
  applyFontSize();

  // Ragu-ragu Checkbox
  const checkRagu = document.getElementById('check-ragu');
  checkRagu.checked = !!currentExam.ragu[q.id];

  // Options Container
  const optContainer = document.getElementById('options-container');
  optContainer.innerHTML = '';

  const currentAns = currentExam.answers[q.id];
  const optionKeys = ['A', 'B', 'C', 'D', 'E'];

  optionKeys.forEach(optKey => {
    if (!q.options || !q.options[optKey]) return;

    const optText = q.options[optKey];
    const isSelected = currentAns === optKey;

    const btn = document.createElement('div');
    btn.className = `group flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer no-select ${
      isSelected 
        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-sm' 
        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
    }`;
    btn.onclick = () => selectOption(optKey);

    btn.innerHTML = `
      <div class="w-8 h-8 rounded-xl font-bold flex items-center justify-center text-sm shrink-0 transition-colors ${
        isSelected
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 group-hover:text-blue-600'
      }">
        ${optKey}
      </div>
      <div class="text-sm sm:text-base leading-relaxed pt-0.5 text-slate-800 dark:text-slate-200">
        ${optText}
      </div>
    `;

    optContainer.appendChild(btn);
  });

  // Prev / Next button state
  document.getElementById('btn-prev-question').disabled = currentExam.currentIndex === 0;
  document.getElementById('btn-next-question').innerHTML = 
    currentExam.currentIndex === totalQ - 1 
      ? `<span>Periksa Kembali</span> <i class="ph-bold ph-check"></i>`
      : `<span>Selanjutnya</span> <i class="ph-bold ph-caret-right"></i>`;

  renderGrid();
  updateProgressStats();
}

// 6. SELECT OPTION & TOGGLE RAGU
function selectOption(optKey) {
  const q = currentExam.questions[currentExam.currentIndex];
  if (!q) return;

  // Toggle or select
  if (currentExam.answers[q.id] === optKey) {
    // Already selected: clicking again keeps it or can clear
    currentExam.answers[q.id] = optKey;
  } else {
    currentExam.answers[q.id] = optKey;
  }

  saveSessionToStorage();
  renderCurrentQuestion();
}

function toggleRaguRagu() {
  const q = currentExam.questions[currentExam.currentIndex];
  if (!q) return;

  const isChecked = document.getElementById('check-ragu').checked;
  currentExam.ragu[q.id] = isChecked;

  saveSessionToStorage();
  renderGrid();
  updateProgressStats();
}

// 7. QUESTION NAVIGATION
function navigateQuestion(offset) {
  const newIndex = currentExam.currentIndex + offset;
  if (newIndex >= 0 && newIndex < currentExam.questions.length) {
    currentExam.currentIndex = newIndex;
    renderCurrentQuestion();
  }
}

function jumpToQuestion(index) {
  if (index >= 0 && index < currentExam.questions.length) {
    currentExam.currentIndex = index;
    renderCurrentQuestion();
  }
}

// 8. RENDER GRID NUMBERS
let activeCategoryFilter = 'ALL';

function filterGrid(cat) {
  activeCategoryFilter = cat;
  ['all', 'twk', 'tiu', 'tkp'].forEach(c => {
    const el = document.getElementById(`filter-${c}`);
    if (el) {
      if (c.toUpperCase() === cat) {
        el.className = 'px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 font-bold shadow-sm text-slate-800 dark:text-slate-200';
      } else {
        el.className = 'px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300';
      }
    }
  });
  renderGrid();
}

function renderGrid() {
  const gridContainer = document.getElementById('question-grid');
  if (!gridContainer) return;

  gridContainer.innerHTML = '';

  currentExam.questions.forEach((q, idx) => {
    // Check category filter
    if (activeCategoryFilter !== 'ALL' && q.category !== activeCategoryFilter) {
      return;
    }

    const qNum = idx + 1;
    const isAnswered = !!currentExam.answers[q.id];
    const isRagu = !!currentExam.ragu[q.id];
    const isActive = currentExam.currentIndex === idx;
    const ansLetter = currentExam.answers[q.id] || '';

    let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

    if (isRagu) {
      bgClass = 'bg-amber-400 dark:bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-sm';
    } else if (isAnswered) {
      bgClass = 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm';
    }

    const ringClass = isActive ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900 font-extrabold scale-105' : '';

    const btn = document.createElement('button');
    btn.className = `w-10 h-10 rounded-xl border flex flex-col items-center justify-center text-xs transition relative ${bgClass} ${ringClass}`;
    btn.onclick = () => jumpToQuestion(idx);
    btn.title = `Soal No. ${qNum} (${q.category})`;

    btn.innerHTML = `
      <span class="leading-none text-[11px]">${qNum}</span>
      ${isAnswered ? `<span class="text-[9px] opacity-90 leading-none mt-0.5">${ansLetter}</span>` : ''}
    `;

    gridContainer.appendChild(btn);
  });
}

function updateProgressStats() {
  let answered = 0;
  let ragu = 0;

  currentExam.questions.forEach(q => {
    if (currentExam.answers[q.id]) answered++;
    if (currentExam.ragu[q.id]) ragu++;
  });

  const total = currentExam.questions.length;
  const empty = total - answered;

  const elA = document.getElementById('stat-answered');
  const elR = document.getElementById('stat-ragu');
  const elE = document.getElementById('stat-empty');

  if (elA) elA.textContent = answered;
  if (elR) elR.textContent = ragu;
  if (elE) elE.textContent = empty;

  // Modal stats
  const mA = document.getElementById('modal-stat-answered');
  const mR = document.getElementById('modal-stat-ragu');
  const mE = document.getElementById('modal-stat-empty');
  if (mA) mA.textContent = answered;
  if (mR) mR.textContent = ragu;
  if (mE) mE.textContent = empty;
}

// 9. FONT SIZE CONTROLS
function changeFontSize(delta) {
  if (delta === 0) currentFontSizeLevel = 0;
  else currentFontSizeLevel = Math.max(-1, Math.min(2, currentFontSizeLevel + delta));
  applyFontSize();
}

function applyFontSize() {
  const qText = document.getElementById('question-text');
  if (!qText) return;

  qText.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
  if (currentFontSizeLevel === -1) {
    qText.classList.add('text-sm');
  } else if (currentFontSizeLevel === 0) {
    qText.classList.add('text-base', 'sm:text-lg');
  } else {
    qText.classList.add('text-xl');
  }
}

// 10. KEYBOARD SHORTCUTS
function setupKeyboardNavigation() {
  window.addEventListener('keydown', (e) => {
    // Only active during exam
    const examScreen = document.getElementById('screen-exam');
    if (!examScreen || examScreen.classList.contains('hidden')) return;

    const key = e.key.toUpperCase();
    if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
      selectOption(key);
    } else if (key === 'ARROWLEFT') {
      navigateQuestion(-1);
    } else if (key === 'ARROWRIGHT') {
      navigateQuestion(1);
    } else if (key === 'R' || e.code === 'Space') {
      if (document.activeElement.tagName !== 'INPUT') {
        const check = document.getElementById('check-ragu');
        if (check) {
          check.checked = !check.checked;
          toggleRaguRagu();
        }
      }
    }
  });
}

// 11. CONFIRM MODAL & FINISH EXAM
function openConfirmFinishModal() {
  updateProgressStats();
  const m = document.getElementById('modal-finish');
  if (m) {
    m.classList.remove('hidden');
    m.classList.add('flex');
  }
}

function closeConfirmFinishModal() {
  const m = document.getElementById('modal-finish');
  if (m) {
    m.classList.add('hidden');
    m.classList.remove('flex');
  }
}

function finishExam() {
  closeConfirmFinishModal();
  if (currentExam.timerInterval) clearInterval(currentExam.timerInterval);
  currentExam.isFinished = true;
  localStorage.removeItem('cat_ongoing_session');

  calculateAndShowResults();
}

// 12. SCORING & RESULTS CALCULATION
function calculateAndShowResults() {
  let twkScore = 0, twkCorrect = 0, twkWrong = 0;
  let tiuScore = 0, tiuCorrect = 0, tiuWrong = 0;
  let tkpScore = 0, tkpCount = 0, tkpTopChoice = 0;

  currentExam.questions.forEach(q => {
    const userAns = currentExam.answers[q.id];

    if (q.category === 'TWK') {
      if (userAns && userAns === q.answer) {
        twkScore += 5;
        twkCorrect++;
      } else {
        twkWrong++;
      }
    } else if (q.category === 'TIU') {
      if (userAns && userAns === q.answer) {
        tiuScore += 5;
        tiuCorrect++;
      } else {
        tiuWrong++;
      }
    } else if (q.category === 'TKP') {
      tkpCount++;
      if (userAns && q.points && q.points[userAns] !== undefined) {
        const p = q.points[userAns];
        tkpScore += p;
        if (p === 5) tkpTopChoice++;
      } else if (userAns) {
        // Fallback default
        tkpScore += 3;
      }
    }
  });

  const totalScore = twkScore + tiuScore + tkpScore;

  // Passing Grades PermenPAN-RB
  const twkPass = twkScore >= 65;
  const tiuPass = tiuScore >= 80;
  const tkpPass = tkpScore >= 166;
  const isAllPassed = twkPass && tiuPass && tkpPass;

  // Update Result UI
  document.getElementById('result-total-score').textContent = totalScore;
  document.getElementById('twk-score-value').textContent = twkScore;
  document.getElementById('twk-correct-count').textContent = twkCorrect;
  document.getElementById('twk-wrong-count').textContent = twkWrong;
  document.getElementById('twk-progress-bar').style.width = `${Math.min(100, (twkScore / 150) * 100)}%`;

  document.getElementById('tiu-score-value').textContent = tiuScore;
  document.getElementById('tiu-correct-count').textContent = tiuCorrect;
  document.getElementById('tiu-wrong-count').textContent = tiuWrong;
  document.getElementById('tiu-progress-bar').style.width = `${Math.min(100, (tiuScore / 175) * 100)}%`;

  document.getElementById('tkp-score-value').textContent = tkpScore;
  document.getElementById('tkp-top-count').textContent = tkpTopChoice;
  document.getElementById('tkp-avg-point').textContent = tkpCount > 0 ? (tkpScore / tkpCount).toFixed(1) : '0';
  document.getElementById('tkp-progress-bar').style.width = `${Math.min(100, (tkpScore / 225) * 100)}%`;

  // Status badges
  setSubtestBadge('twk-status-badge', twkPass);
  setSubtestBadge('tiu-status-badge', tiuPass);
  setSubtestBadge('tkp-status-badge', tkpPass);

  // Overall Graduation Card
  const resultCard = document.getElementById('result-status-card');
  const badgeEl = document.getElementById('result-badge');
  const headEl = document.getElementById('result-headline');
  const subEl = document.getElementById('result-subtext');

  if (isAllPassed) {
    resultCard.className = 'rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700';
    badgeEl.textContent = '🌟 LULUS PASSING GRADE SKD';
    headEl.textContent = `Selamat, ${participantName}! Anda Memenuhi Syarat Kelulusan.`;
    subEl.textContent = 'Seluruh ambang batas TWK (≥65), TIU (≥80), dan TKP (≥166) berhasil Anda lampaui dengan gemilang. Anda siap melaju ke tahap SKB!';
    
    // Trigger celebration confetti
    triggerConfetti();
  } else {
    resultCard.className = 'rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-rose-700 via-rose-600 to-orange-700';
    badgeEl.textContent = '⚠️ BELUM MEMENUHI PASSING GRADE';
    headEl.textContent = `Jangan Menyerah, ${participantName}!`;
    subEl.textContent = 'Berdasarkan aturan resmi BKN, seorang peserta wajib melampaui ambang batas pada KETIGA subtes sekaligus. Pelajari kembali pembahasan di bawah untuk memperkuat materi yang belum optimal.';
  }

  switchToScreen('result');
}

function setSubtestBadge(id, isPass) {
  const el = document.getElementById(id);
  if (!el) return;
  if (isPass) {
    el.className = 'text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1';
    el.innerHTML = '<i class="ph-bold ph-check"></i> Memenuhi';
  } else {
    el.className = 'text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1';
    el.innerHTML = '<i class="ph-bold ph-x"></i> Tidak Lolos';
  }
}

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

// 13. REVIEW & PEMBAHASAN MODE
function openReviewMode() {
  const container = document.getElementById('section-review-container');
  if (container) {
    container.classList.remove('hidden');
    renderReviewList();
    container.scrollIntoView({ behavior: 'smooth' });
  }
}

function renderReviewList() {
  const listContainer = document.getElementById('review-cards-list');
  const filter = document.getElementById('review-filter').value;
  if (!listContainer) return;

  listContainer.innerHTML = '';

  currentExam.questions.forEach((q, idx) => {
    const qNum = idx + 1;
    const userAns = currentExam.answers[q.id];
    const isCorrect = (q.category === 'TKP') ? (userAns && q.points && q.points[userAns] >= 4) : (userAns === q.answer);

    // Apply filter
    if (filter === 'WRONG' && isCorrect) return;
    if (filter === 'TWK' && q.category !== 'TWK') return;
    if (filter === 'TIU' && q.category !== 'TIU') return;
    if (filter === 'TKP' && q.category !== 'TKP') return;

    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4';

    let statusPill = '';
    if (!userAns) {
      statusPill = '<span class="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">Tidak Dijawab</span>';
    } else if (isCorrect) {
      statusPill = '<span class="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1"><i class="ph-bold ph-check"></i> Jawaban Benar / Tepat</span>';
    } else {
      statusPill = '<span class="text-xs px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1"><i class="ph-bold ph-x"></i> Jawaban Kurang Tepat</span>';
    }

    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
            ${qNum}
          </span>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">${q.category}</span>
        </div>
        ${statusPill}
      </div>

      <div class="text-slate-800 dark:text-slate-100 text-base leading-relaxed whitespace-pre-line">
        ${q.question}
      </div>

      <!-- Options Review -->
      <div class="grid grid-cols-1 gap-2 pt-2 text-sm">
        ${['A', 'B', 'C', 'D', 'E'].map(optKey => {
          if (!q.options || !q.options[optKey]) return '';
          const isUser = userAns === optKey;
          const isKey = q.answer === optKey;
          let optBg = 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
          let badge = '';

          if (q.category === 'TKP') {
            const pt = (q.points && q.points[optKey]) !== undefined ? q.points[optKey] : '-';
            badge = `<span class="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">${pt} Poin</span>`;
            if (isUser) optBg = 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 font-semibold';
          } else {
            if (isKey) {
              optBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold';
              badge = `<span class="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">Kunci Benar</span>`;
            } else if (isUser && !isKey) {
              optBg = 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200';
              badge = `<span class="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300">Pilihan Anda</span>`;
            }
          }

          return `
            <div class="p-3 rounded-xl border flex items-center justify-between gap-3 ${optBg}">
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm">${optKey}</span>
                <span>${q.options[optKey]}</span>
              </div>
              <div>${badge}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Pembahasan Box -->
      <div class="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
        <div class="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <i class="ph-bold ph-lightbulb text-amber-500 text-sm"></i> Pembahasan Resmi:
        </div>
        <p class="leading-relaxed whitespace-pre-line opacity-95">
          ${q.explanation || 'Pembahasan resmi terdapat pada dokumen bank materi CPNS Paten.'}
        </p>
      </div>
    `;

    listContainer.appendChild(card);
  });
}

// 14. STORAGE & SESSION RESUME
function saveSessionToStorage() {
  if (currentExam.isFinished) return;
  const session = {
    packetType: currentExam.packetType,
    answers: currentExam.answers,
    ragu: currentExam.ragu,
    currentIndex: currentExam.currentIndex,
    secondsLeft: currentExam.secondsLeft,
    questionsIds: currentExam.questions.map(q => q.id)
  };
  localStorage.setItem('cat_ongoing_session', JSON.stringify(session));
}

function checkOngoingSession() {
  const saved = localStorage.getItem('cat_ongoing_session');
  if (!saved) return;

  try {
    const s = JSON.parse(saved);
    if (s && s.secondsLeft > 0 && s.questionsIds && s.questionsIds.length > 0) {
      if (confirm('Ditemukan sesi tryout sebelumnya yang belum selesai. Apakah Anda ingin melanjutkan?')) {
        // Resume session
        startExam(s.packetType);
        currentExam.answers = s.answers || {};
        currentExam.ragu = s.ragu || {};
        currentExam.currentIndex = s.currentIndex || 0;
        currentExam.secondsLeft = s.secondsLeft;
        renderCurrentQuestion();
      } else {
        localStorage.removeItem('cat_ongoing_session');
      }
    }
  } catch (e) {
    console.error('Session resume error:', e);
  }
}

// 15. SCREEN SWITCHING HELPER
function switchToScreen(screenName) {
  const lobby = document.getElementById('screen-lobby');
  const exam = document.getElementById('screen-exam');
  const result = document.getElementById('screen-result');
  const headerStatus = document.getElementById('header-exam-status');

  lobby.classList.add('hidden');
  exam.classList.add('hidden');
  result.classList.add('hidden');
  headerStatus.classList.add('hidden');

  if (screenName === 'lobby') {
    lobby.classList.remove('hidden');
  } else if (screenName === 'exam') {
    exam.classList.remove('hidden');
    headerStatus.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (screenName === 'result') {
    result.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function returnToLobby() {
  if (currentExam.timerInterval) clearInterval(currentExam.timerInterval);
  switchToScreen('lobby');
}
