/**
 * SIMULASI CAT CPNS 2027 ENGINE (MODERN & ACCESSIBLE)
 * - Standar PermenPAN-RB & KepmenPAN-RB Resmi BKN
 * - Formasi Khusus Disabilitas (130 Menit, Kumulatif 286, TIU 60) & Formasi Umum (100 Menit)
 * - Google Sign-In OAuth 2.0 Integration
 * - Audio Screen Reader Text-to-Speech (TTS) Ramah Disabilitas
 * - Jeda / Keluar Ujian Fleksibel (Simpan Progres)
 * - Navigasi Lembar Jawaban Luas (Grid & List View)
 * Author: Dr. Ilham Pradani Hub
 */

const GOOGLE_CLIENT_ID = "812430784237-70vet0sepo0f0eti0cs62nnjd4s89ia8.apps.googleusercontent.com";

let bankData = null;
let userProfile = {
  name: 'Calon ASN Hebat',
  email: '',
  avatar: '',
  formasi: 'UMUM', // 'UMUM', 'DISABILITAS', 'CUMLAUDE', 'PAPUA_3T'
  isGoogleAuth: false
};

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
  isPaused: false,
  startTime: null
};

let currentFontSizeLevel = 0; // -1: small, 0: normal, 1: large, 2: extra large
let activeCategoryFilter = 'ALL';
let activeNavView = 'grid'; // 'grid' or 'list'
let speechUtterance = null;

// SMART CAT ALGORITHM & PERSISTENT PROGRESS STATE
let examSettings = {
  editionMode: 'PRIORITY_2027', // 'PRIORITY_2027', 'ONLY_2027', 'ONLY_KLASIK', 'RANDOM_ALL'
  alwaysNew: true,              // Selalu utamakan soal baru (belum tuntas)
  repeatWrong: true             // Ulangi soal salah di tryout kedua
};

let userProgress = {
  seenQuestions: {},     // { questionId: true }
  masteredQuestions: {}, // { questionId: true }
  wrongQuestions: {},    // { questionId: true }
  history: []
};

function loadLocalSettingsAndProgress() {
  try {
    const savedSet = localStorage.getItem('cat_exam_settings');
    if (savedSet) examSettings = { ...examSettings, ...JSON.parse(savedSet) };

    const savedProg = localStorage.getItem('cat_user_progress');
    if (savedProg) {
      const p = JSON.parse(savedProg);
      userProgress.seenQuestions = p.seenQuestions || {};
      userProgress.masteredQuestions = p.masteredQuestions || {};
      userProgress.wrongQuestions = p.wrongQuestions || {};
      userProgress.history = p.history || [];
    }
  } catch (err) {
    console.warn('Failed loading local progress:', err);
  }
}

function saveLocalProgress() {
  try {
    localStorage.setItem('cat_user_progress', JSON.stringify(userProgress));
    localStorage.setItem('cat_exam_settings', JSON.stringify(examSettings));
  } catch (err) {}
}

// 1. INITIALIZATION ON DOM READY
document.addEventListener('DOMContentLoaded', async () => {
  loadStoredProfile();
  setupThemeAndContrast();
  setupKeyboardNavigation();
  initGoogleAuth();
  await loadBankData();
  checkOngoingSession();
  updateFormasiUI();
  renderSessionHistory();
});

// 2. PROFILE & FORMASI MANAGEMENT
function loadStoredProfile() {
  const saved = localStorage.getItem('cat_user_profile');
  if (saved) {
    try {
      userProfile = { ...userProfile, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Profile parse error:', e);
    }
  }
  updateProfileHeader();
}

function updateProfileHeader() {
  const nameEl = document.getElementById('user-display-name');
  const badgeEl = document.getElementById('user-formasi-badge');
  const avatarBadge = document.getElementById('user-avatar-badge');

  if (nameEl) nameEl.textContent = userProfile.name || 'Calon ASN';

  if (badgeEl) {
    if (userProfile.formasi === 'DISABILITAS') {
      badgeEl.textContent = '♿ Formasi Disabilitas';
      badgeEl.className = 'text-[10px] text-amber-600 dark:text-amber-400 font-bold';
    } else if (userProfile.formasi === 'CUMLAUDE') {
      badgeEl.textContent = '🎓 Formasi Cumlaude';
      badgeEl.className = 'text-[10px] text-indigo-600 dark:text-indigo-400 font-bold';
    } else if (userProfile.formasi === 'PAPUA_3T') {
      badgeEl.textContent = '🌏 Formasi 3T/Papua';
      badgeEl.className = 'text-[10px] text-rose-600 dark:text-rose-400 font-bold';
    } else {
      badgeEl.textContent = 'Formasi Umum';
      badgeEl.className = 'text-[10px] text-emerald-600 dark:text-emerald-400 font-medium';
    }
  }

  if (avatarBadge) {
    if (userProfile.avatar) {
      avatarBadge.innerHTML = `<img src="${userProfile.avatar}" alt="Avatar" class="w-full h-full object-cover rounded-full">`;
    } else {
      const initials = (userProfile.name || 'IP').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      avatarBadge.textContent = initials || 'IP';
    }
  }

  // Update lobby stat duration
  const durasiEl = document.getElementById('stat-durasi-display');
  const noteEl = document.getElementById('stat-disabilitas-note');
  const fullDurBadge = document.getElementById('badge-full-duration');

  if (userProfile.formasi === 'DISABILITAS') {
    if (durasiEl) durasiEl.textContent = '130 Menit';
    if (noteEl) noteEl.innerHTML = '<span class="text-amber-500 font-bold">Khusus Disabilitas: 130m</span>';
    if (fullDurBadge) fullDurBadge.textContent = '130 Menit (Disabilitas)';
  } else {
    if (durasiEl) durasiEl.textContent = '100 Menit';
    if (noteEl) noteEl.textContent = 'Umum: 100m • Disabilitas: 130m';
    if (fullDurBadge) fullDurBadge.textContent = '100 Menit';
  }

  // Handle Google Login Button Visibility (Hide button if already logged in)
  const gContainerLobby = document.getElementById('g_id_signin_container');
  const gContainerModal = document.getElementById('modal-google-btn-wrapper');
  let loggedInPill = document.getElementById('user-logged-in-pill');

  if (userProfile.isGoogleAuth) {
    if (gContainerLobby) gContainerLobby.classList.add('hidden');

    if (!loggedInPill && gContainerLobby && gContainerLobby.parentNode) {
      loggedInPill = document.createElement('div');
      loggedInPill.id = 'user-logged-in-pill';
      loggedInPill.className = 'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold text-white shadow-sm';
      gContainerLobby.parentNode.insertBefore(loggedInPill, gContainerLobby.nextSibling);
    }
    if (loggedInPill) {
      loggedInPill.classList.remove('hidden');
      loggedInPill.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="truncate max-w-[160px]">${userProfile.name}</span>
        <i class="ph-bold ph-check-circle text-emerald-300"></i>
      `;
    }

    if (gContainerModal) {
      gContainerModal.innerHTML = `
        <button type="button" onclick="logoutGoogleAccount()" class="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900/60 transition flex items-center gap-1.5 shadow-sm">
          <i class="ph-bold ph-sign-out"></i>
          <span>Keluar Akun Google</span>
        </button>
      `;
    }
  } else {
    if (gContainerLobby) gContainerLobby.classList.remove('hidden');
    if (loggedInPill) loggedInPill.classList.add('hidden');

    if (gContainerModal && window.google && google.accounts && google.accounts.id) {
      gContainerModal.innerHTML = '';
      google.accounts.id.renderButton(gContainerModal, {
        theme: 'outline',
        size: 'medium',
        shape: 'pill',
        text: 'signin'
      });
    }
  }
}

function logoutGoogleAccount() {
  if (!confirm('Apakah Anda yakin ingin keluar dari akun Google?')) return;

  userProfile.name = 'Calon ASN Hebat';
  userProfile.email = '';
  userProfile.avatar = '';
  userProfile.isGoogleAuth = false;

  localStorage.setItem('cat_user_profile', JSON.stringify(userProfile));

  if (window.google && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }

  updateProfileHeader();
  renderSessionHistory();

  const gContainerLobby = document.getElementById('g_id_signin_container');
  const gContainerModal = document.getElementById('modal-google-btn-wrapper');
  if (window.google && google.accounts && google.accounts.id) {
    if (gContainerLobby) {
      gContainerLobby.innerHTML = '';
      google.accounts.id.renderButton(gContainerLobby, {
        theme: 'filled_blue',
        size: 'medium',
        shape: 'pill',
        text: 'signin_with',
        logo_alignment: 'left'
      });
    }
    if (gContainerModal) {
      gContainerModal.innerHTML = '';
      google.accounts.id.renderButton(gContainerModal, {
        theme: 'outline',
        size: 'medium',
        shape: 'pill',
        text: 'signin'
      });
    }
  }

  alert('👋 Anda berhasil keluar dari akun Google.');
}

function openProfileModal() {
  const m = document.getElementById('modal-profile');
  const inputName = document.getElementById('modal-input-name');
  const userName = document.getElementById('modal-user-name');
  const userEmail = document.getElementById('modal-user-email');
  const userAvatar = document.getElementById('modal-user-avatar');

  if (inputName) inputName.value = userProfile.name || '';
  if (userName) userName.textContent = userProfile.name || 'Tamu / Belum Login';
  if (userEmail) userEmail.textContent = userProfile.email || 'Mode Tamu (Data tersimpan di browser)';

  if (userAvatar) {
    if (userProfile.avatar) {
      userAvatar.innerHTML = `<img src="${userProfile.avatar}" alt="Avatar" class="w-full h-full object-cover rounded-full">`;
    } else {
      userAvatar.textContent = userProfile.isGoogleAuth ? 'G' : '👤';
    }
  }

  // Set radio selection
  const radio = document.querySelector(`input[name="formasi_radio"][value="${userProfile.formasi}"]`);
  if (radio) radio.checked = true;
  updateFormasiSelection(userProfile.formasi);

  if (m) {
    m.classList.remove('hidden');
    m.classList.add('flex');
  }
}

function closeProfileModal() {
  const m = document.getElementById('modal-profile');
  if (m) {
    m.classList.add('hidden');
    m.classList.remove('flex');
  }
}

function updateFormasiSelection(formasiKey) {
  document.querySelectorAll('.formasi-radio-option').forEach(el => {
    el.classList.remove('border-blue-600', 'border-emerald-600', 'bg-blue-50/50', 'bg-emerald-50/50', 'dark:bg-blue-950/30', 'dark:bg-emerald-950/30');
    el.classList.add('border-slate-200', 'dark:border-slate-800');
  });

  const selectedEl = document.getElementById(`label-formasi-${formasiKey.toLowerCase()}`);
  if (selectedEl) {
    selectedEl.classList.remove('border-slate-200', 'dark:border-slate-800');
    if (formasiKey === 'DISABILITAS') {
      selectedEl.classList.add('border-emerald-600', 'bg-emerald-50/50', 'dark:bg-emerald-950/30');
    } else {
      selectedEl.classList.add('border-blue-600', 'bg-blue-50/50', 'dark:bg-blue-950/30');
    }
  }
}

function saveProfileModal() {
  const inputName = document.getElementById('modal-input-name');
  if (inputName && inputName.value.trim()) {
    userProfile.name = inputName.value.trim();
  }

  const selectedRadio = document.querySelector('input[name="formasi_radio"]:checked');
  if (selectedRadio) {
    userProfile.formasi = selectedRadio.value;
  }

  localStorage.setItem('cat_user_profile', JSON.stringify(userProfile));
  updateProfileHeader();
  closeProfileModal();

  alert(`✅ Profil disimpan!\nNama: ${userProfile.name}\nJalur: ${userProfile.formasi === 'DISABILITAS' ? 'Penyandang Disabilitas (130 Menit + TTS)' : 'Formasi ' + userProfile.formasi}`);
}

function updateFormasiUI() {
  updateProfileHeader();
}

// 3. GOOGLE SIGN-IN OAUTH INTEGRATION
function initGoogleAuth() {
  window.onGoogleLibraryLoad = () => {
    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false
      });

      // Render button in Lobby
      const container1 = document.getElementById('g_id_signin_container');
      if (container1) {
        google.accounts.id.renderButton(container1, {
          theme: 'filled_blue',
          size: 'medium',
          shape: 'pill',
          text: 'signin_with',
          logo_alignment: 'left'
        });
      }

      // Render button in Modal
      const container2 = document.getElementById('modal-google-btn-wrapper');
      if (container2) {
        google.accounts.id.renderButton(container2, {
          theme: 'outline',
          size: 'medium',
          shape: 'pill',
          text: 'signin'
        });
      }

      // Update visibility based on auth status
      updateProfileHeader();
    }
  };

  // If GSI script already loaded
  if (window.google && google.accounts && google.accounts.id) {
    window.onGoogleLibraryLoad();
  }
}

function handleGoogleCredentialResponse(response) {
  try {
    const jwt = response.credential;
    const payload = decodeJwtResponse(jwt);
    if (payload) {
      userProfile.name = payload.name || userProfile.name;
      userProfile.email = payload.email || '';
      userProfile.avatar = payload.picture || '';
      userProfile.isGoogleAuth = true;

      localStorage.setItem('cat_user_profile', JSON.stringify(userProfile));
      updateProfileHeader();
      alert(`🎉 Berhasil Masuk dengan Akun Google!\nSelamat datang, ${userProfile.name}`);

      // Sync user data with Cloudflare D1
      syncUserProgressWithBackend();
    }
  } catch (err) {
    console.error('Google decode error:', err);
  }
}

function decodeJwtResponse(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

// 4. ACCESSIBILITY & THEME CONTROLS
function setupThemeAndContrast() {
  const isDark = localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  const isHighContrast = localStorage.getItem('cat_high_contrast') === 'true';
  if (isHighContrast) {
    document.body.classList.add('high-contrast');
  }

  const btnTheme = document.getElementById('btn-toggle-theme');
  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const darkNow = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', darkNow ? 'dark' : 'light');
    });
  }

  const btnFs = document.getElementById('btn-fullscreen');
  if (btnFs) {
    btnFs.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
      } else {
        document.exitFullscreen().catch(e => console.log(e));
      }
    });
  }
}

function toggleHighContrast() {
  document.body.classList.toggle('high-contrast');
  const active = document.body.classList.contains('high-contrast');
  localStorage.setItem('cat_high_contrast', active ? 'true' : 'false');
}

// 5. AUDIO SCREEN READER (TEXT-TO-SPEECH) UNTUK DISABILITAS NETRA
function speakCurrentQuestion() {
  if (!('speechSynthesis' in window)) {
    alert('Browser Anda tidak mendukung Web Speech API Text-to-Speech.');
    return;
  }

  stopTTS();

  const q = currentExam.questions[currentExam.currentIndex];
  if (!q) return;

  const qNum = currentExam.currentIndex + 1;
  let fullSpeech = `Soal nomor ${qNum}. Kategori ${q.category}, ${q.subtest}. ${q.question}. `;

  ['A', 'B', 'C', 'D', 'E'].forEach(opt => {
    if (q.options && q.options[opt]) {
      fullSpeech += `Pilihan ${opt}: ${q.options[opt]}. `;
    }
  });

  speechUtterance = new SpeechSynthesisUtterance(fullSpeech);
  speechUtterance.lang = 'id-ID';
  speechUtterance.rate = 0.95; // Sedikit lebih santai agar jelas
  speechUtterance.pitch = 1.0;

  // Prefer Indonesian voice if available
  const voices = window.speechSynthesis.getVoices();
  const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID'));
  if (idVoice) speechUtterance.voice = idVoice;

  const btnPlay = document.getElementById('btn-play-tts');
  if (btnPlay) {
    btnPlay.classList.add('bg-blue-600', 'text-white');
    btnPlay.classList.remove('bg-white', 'dark:bg-slate-700', 'text-blue-600');
  }

  speechUtterance.onend = () => {
    if (btnPlay) {
      btnPlay.classList.remove('bg-blue-600', 'text-white');
      btnPlay.classList.add('bg-white', 'dark:bg-slate-700', 'text-blue-600');
    }
  };

  speechUtterance.onerror = () => {
    if (btnPlay) {
      btnPlay.classList.remove('bg-blue-600', 'text-white');
      btnPlay.classList.add('bg-white', 'dark:bg-slate-700', 'text-blue-600');
    }
  };

  window.speechSynthesis.speak(speechUtterance);
}

function stopTTS() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const btnPlay = document.getElementById('btn-play-tts');
    if (btnPlay) {
      btnPlay.classList.remove('bg-blue-600', 'text-white');
      btnPlay.classList.add('bg-white', 'dark:bg-slate-700', 'text-blue-600');
    }
  }
}

// 6. LOAD BANK DATA (SMART D1 & COMBINED DATASET)
async function loadBankData() {
  try {
    let res = await fetch('data/cpns_bank_soal_combined.json');
    if (!res.ok) {
      res = await fetch('data/cpns_bank_soal.json');
    }
    const data = await res.json();
    
    if (data.questions && Array.isArray(data.questions)) {
      bankData = {
        total: data.total || data.questions.length,
        questions: data.questions,
        q2027: data.questions.filter(q => q.edition === '2027'),
        qKlasik: data.questions.filter(q => q.edition === '2024-2025'),
        twk: data.questions.filter(q => q.category === 'TWK'),
        tiu: data.questions.filter(q => q.category === 'TIU'),
        tkp: data.questions.filter(q => q.category === 'TKP')
      };
    } else {
      const allQs = data.all || [];
      bankData = {
        total: allQs.length,
        questions: allQs,
        q2027: allQs,
        qKlasik: [],
        twk: data.twk || allQs.filter(q => q.category === 'TWK'),
        tiu: data.tiu || allQs.filter(q => q.category === 'TIU'),
        tkp: data.tkp || allQs.filter(q => q.category === 'TKP')
      };
    }

    loadLocalSettingsAndProgress();
    updateMasteryDashboardUI();

    // Async sync with Cloudflare D1
    syncUserProgressWithBackend();
  } catch (err) {
    console.error('Gagal memuat bank soal:', err);
  }
}

// 6B. SMART QUESTION SELECTION ALGORITHM
function selectQuestionsForCategory(category, requiredCount, options = {}) {
  if (!bankData || !bankData.questions) return [];

  const remedialOnly = !!options.remedialOnly;
  const activeEditionMode = options.editionMode || examSettings.editionMode;

  let catAll = bankData.questions.filter(q => q.category === category);

  // Jika opsi remedial aktif, prioritaskan soal yang salah
  if (remedialOnly) {
    const wrongPool = catAll.filter(q => !!userProgress.wrongQuestions[q.id]);
    if (wrongPool.length > 0) {
      catAll = wrongPool;
    }
  }

  const q2027 = catAll.filter(q => q.edition === '2027');
  const qKlasik = catAll.filter(q => q.edition === '2024-2025');

  function calculatePriority(q) {
    const isWrong = !!userProgress.wrongQuestions[q.id];
    const isMastered = !!userProgress.masteredQuestions[q.id];
    const isSeen = !!userProgress.seenQuestions[q.id];

    // Priority 1: Soal salah di tryout sebelumnya (Remedial)
    if (isWrong) {
      return 1000 + Math.random();
    }
    // Priority 2: Soal fresh (belum pernah dilihat)
    if (!isSeen && !isMastered) {
      return 500 + Math.random();
    }
    // Priority 3: Pernah dilihat tapi belum tuntas
    if (isSeen && !isMastered) {
      return 200 + Math.random();
    }
    // Priority 4: Soal sudah tuntas
    if (examSettings.alwaysNew && isMastered && !remedialOnly) {
      return -1000 + Math.random(); // Dihindari jika mode alwaysNew aktif
    }
    return 10 + Math.random();
  }

  let selected = [];

  if (activeEditionMode === 'ONLY_2027') {
    const sorted = [...q2027].sort((a, b) => calculatePriority(b) - calculatePriority(a));
    selected = sorted.slice(0, requiredCount);
  } else if (activeEditionMode === 'ONLY_KLASIK') {
    const sorted = [...qKlasik].sort((a, b) => calculatePriority(b) - calculatePriority(a));
    selected = sorted.slice(0, requiredCount);
  } else if (activeEditionMode === 'RANDOM_ALL') {
    const sorted = [...catAll].sort((a, b) => calculatePriority(b) - calculatePriority(a));
    selected = sorted.slice(0, requiredCount);
  } else {
    // Mode Default: 'PRIORITY_2027'
    const sorted2027 = [...q2027].sort((a, b) => calculatePriority(b) - calculatePriority(a));
    let pool2027 = sorted2027;
    if (examSettings.alwaysNew && !remedialOnly) {
      pool2027 = sorted2027.filter(q => !userProgress.masteredQuestions[q.id]);
    }
    selected = pool2027.slice(0, requiredCount);

    // Jika kuota kategori belum tercukupi (misal butuh 35 TIU), lengkapi dari bank soal Klasik
    if (selected.length < requiredCount) {
      const needed = requiredCount - selected.length;
      const sortedKlasik = [...qKlasik].sort((a, b) => calculatePriority(b) - calculatePriority(a));
      let poolKlasik = sortedKlasik;
      if (examSettings.alwaysNew && !remedialOnly) {
        poolKlasik = sortedKlasik.filter(q => !userProgress.masteredQuestions[q.id]);
      }
      const fillKlasik = poolKlasik.slice(0, needed);
      selected = [...selected, ...fillKlasik];

      // Jika seluruh bank soal baru & klasik sudah tuntas semua, ambil fallback soal tersisa
      if (selected.length < requiredCount) {
        const remaining = [...catAll].filter(q => !selected.some(s => s.id === q.id));
        selected = [...selected, ...remaining.slice(0, requiredCount - selected.length)];
      }
    }
  }

  // Jika tetap kurang dari target, ambil sembarang yang ada di kategori
  if (selected.length < requiredCount && catAll.length > 0) {
    selected = catAll.slice(0, requiredCount);
  }

  return selected;
}

// 7. START EXAM / PAKET UJIAN DENGAN PARAMETER KUSTOM & PRE-EXAM LOGIC
function startExam(packetType, customOptions = {}) {
  if (!bankData || !bankData.questions) {
    alert('Bank soal sedang disiapkan, tunggu 2 detik lalu klik kembali.');
    return;
  }

  const isDisabilitas = userProfile.formasi === 'DISABILITAS';
  const isUntimed = !!customOptions.isUntimed;
  const durationMinutes = isUntimed ? 0 : (customOptions.durationMinutes || (isDisabilitas ? 130 : 100));
  const targetQCount = customOptions.targetQCount || 110;
  const remedialOnly = !!customOptions.remedialOnly;
  const editionMode = customOptions.editionMode || examSettings.editionMode;

  let questions = [];

  if (packetType === 'twk_only') {
    questions = selectQuestionsForCategory('TWK', targetQCount || 30, { remedialOnly, editionMode });
  } else if (packetType === 'tiu_only') {
    questions = selectQuestionsForCategory('TIU', targetQCount || 35, { remedialOnly, editionMode });
  } else if (packetType === 'tkp_only') {
    questions = selectQuestionsForCategory('TKP', targetQCount || 45, { remedialOnly, editionMode });
  } else {
    // Multi-category (Full Simulation, Posttest, Prediksi, dll)
    let twkCount = 30;
    let tiuCount = 35;
    let tkpCount = 45;

    if (targetQCount !== 110) {
      twkCount = Math.max(1, Math.round(targetQCount * (30 / 110)));
      tiuCount = Math.max(1, Math.round(targetQCount * (35 / 110)));
      tkpCount = Math.max(1, targetQCount - twkCount - tiuCount);
    }

    const twkQuestions = selectQuestionsForCategory('TWK', twkCount, { remedialOnly, editionMode });
    const tiuQuestions = selectQuestionsForCategory('TIU', tiuCount, { remedialOnly, editionMode });
    const tkpQuestions = selectQuestionsForCategory('TKP', tkpCount, { remedialOnly, editionMode });

    questions = [...twkQuestions, ...tiuQuestions, ...tkpQuestions];
  }

  currentExam = {
    packetType: packetType,
    customOptions: customOptions,
    questions: questions,
    currentIndex: 0,
    answers: {},
    ragu: {},
    isUntimed: isUntimed,
    durationSeconds: isUntimed ? 0 : durationMinutes * 60,
    secondsLeft: isUntimed ? 0 : durationMinutes * 60,
    timerInterval: null,
    isFinished: false,
    isPaused: false,
    startTime: Date.now()
  };

  saveSessionToStorage();
  switchToScreen('exam');
  renderCurrentQuestion();
  renderNavigation();
  startTimer();
}

// 8. TIMER ENGINE (MENDUKUNG WAKTU BEBAS / UNTIMED)
function startTimer() {
  if (currentExam.timerInterval) clearInterval(currentExam.timerInterval);

  const timerDisplay = document.getElementById('exam-timer');

  // MODE WAKTU BEBAS (LATIHAN SANTAI TANPA BATAS WAKTU)
  if (currentExam.isUntimed) {
    let elapsed = 0;
    const updateUntimed = () => {
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      const str = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      if (timerDisplay) {
        timerDisplay.innerHTML = `<span class="flex items-center gap-1.5 text-sky-400 font-bold"><i class="ph-bold ph-infinity text-sm"></i> ${str}</span>`;
      }
    };

    updateUntimed();
    currentExam.timerInterval = setInterval(() => {
      if (currentExam.isPaused) return;
      elapsed++;
      updateUntimed();
    }, 1000);
    return;
  }

  // MODE HITUNG MUNDUR RESMI CAT BKN
  const updateDisplay = () => {
    const mins = Math.floor(currentExam.secondsLeft / 60);
    const secs = currentExam.secondsLeft % 60;
    const str = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (timerDisplay) timerDisplay.textContent = str;

    if (currentExam.secondsLeft <= 300) {
      timerDisplay.classList.add('text-rose-500', 'animate-pulse');
    } else if (currentExam.secondsLeft <= 600) {
      timerDisplay.classList.add('text-amber-500');
    }
  };

  updateDisplay();
  currentExam.timerInterval = setInterval(() => {
    if (currentExam.isPaused) return;

    currentExam.secondsLeft--;
    saveSessionToStorage();

    if (currentExam.secondsLeft <= 0) {
      clearInterval(currentExam.timerInterval);
      alert('⏰ Waktu Ujian Telah Habis! Sistem akan mengumpulkan lembar jawaban Anda otomatis.');
      finishExam();
    } else {
      updateDisplay();
    }
  }, 1000);
}

// 9. JEDA & KELUAR DARI HALAMAN PENGUJIAN
function openPauseExitModal() {
  currentExam.isPaused = true;
  const m = document.getElementById('modal-pause-exit');
  if (m) {
    m.classList.remove('hidden');
    m.classList.add('flex');
  }
}

function closePauseExitModal() {
  currentExam.isPaused = false;
  const m = document.getElementById('modal-pause-exit');
  if (m) {
    m.classList.add('hidden');
    m.classList.remove('flex');
  }
}

function pauseAndSaveExam() {
  stopTTS();
  if (currentExam.timerInterval) clearInterval(currentExam.timerInterval);
  saveSessionToStorage();
  closePauseExitModal();
  switchToScreen('lobby');
  alert('💾 Progres ujian Anda berhasil dijeda & disimpan!\nSisa waktu dan jawaban Anda aman. Anda bisa melanjutkannya kapan saja dari beranda.');
}

function cancelAndExitExam() {
  if (confirm('Yakin ingin membatalkan ujian? Semua jawaban pada sesi ini akan dihapus.')) {
    stopTTS();
    if (currentExam.timerInterval) clearInterval(currentExam.timerInterval);
    localStorage.removeItem('cat_ongoing_session');
    currentExam.isFinished = true;
    closePauseExitModal();
    switchToScreen('lobby');
  }
}

// 10. RENDER SOAL & OPSI JAWABAN
function renderCurrentQuestion() {
  stopTTS();

  const q = currentExam.questions[currentExam.currentIndex];
  if (!q) return;

  const qNum = currentExam.currentIndex + 1;
  const totalQ = currentExam.questions.length;

  document.getElementById('current-question-num').textContent = qNum;
  document.getElementById('total-questions-exam').textContent = totalQ;

  const badgeCat = document.getElementById('badge-category');
  const titleSub = document.getElementById('title-subtest');
  const ruleSub = document.getElementById('subtest-scoring-rule');

  badgeCat.textContent = q.category || 'SKD';
  if (q.category === 'TWK') {
    badgeCat.className = 'px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-wider';
    titleSub.textContent = 'Tes Wawasan Kebangsaan (TWK)';
    ruleSub.textContent = userProfile.formasi === 'DISABILITAS' 
      ? 'Nilai: Benar +5, Salah 0 • Formasi Disabilitas: Kumulatif SKD ≥ 286' 
      : 'Nilai: Benar +5, Salah 0, Kosong 0 • Passing Grade: 65';
  } else if (q.category === 'TIU') {
    badgeCat.className = 'px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider';
    titleSub.textContent = 'Tes Intelegensia Umum (TIU)';
    ruleSub.textContent = userProfile.formasi === 'DISABILITAS' 
      ? 'Nilai: Benar +5, Salah 0 • Ambang Batas Disabilitas: 60' 
      : 'Nilai: Benar +5, Salah 0, Kosong 0 • Passing Grade: 80';
  } else {
    badgeCat.className = 'px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider';
    titleSub.textContent = 'Tes Karakteristik Pribadi (TKP)';
    ruleSub.textContent = userProfile.formasi === 'DISABILITAS' 
      ? 'Nilai: Pilihan bernilai 1 s.d. 5 Poin, Kosong 0' 
      : 'Nilai: Pilihan bernilai 1 s.d. 5 Poin, Kosong 0 • Passing Grade: 166';
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
      <div class="w-9 h-9 rounded-xl font-extrabold flex items-center justify-center text-sm shrink-0 transition-colors ${
        isSelected
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 group-hover:text-blue-600'
      }">
        ${optKey}
      </div>
      <div class="text-base sm:text-lg leading-relaxed pt-1 text-slate-800 dark:text-slate-200">
        ${optText}
      </div>
    `;

    optContainer.appendChild(btn);
  });

  // Prev / Next button state
  document.getElementById('btn-prev-question').disabled = currentExam.currentIndex === 0;
  document.getElementById('btn-next-question').innerHTML = 
    currentExam.currentIndex === totalQ - 1 
      ? `<span>Periksa Selesai</span> <i class="ph-bold ph-check"></i>`
      : `<span>Selanjutnya</span> <i class="ph-bold ph-caret-right"></i>`;

  renderNavigation();
  updateProgressStats();

  // Render KaTeX math equations if present
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(document.getElementById('question-text'), { throwOnError: false });
    renderMathInElement(document.getElementById('options-container'), { throwOnError: false });
  }
}

// 11. SELECT OPTION & TOGGLE RAGU
function selectOption(optKey) {
  const q = currentExam.questions[currentExam.currentIndex];
  if (!q) return;

  currentExam.answers[q.id] = optKey;
  saveSessionToStorage();
  renderCurrentQuestion();
}

function toggleRaguRagu() {
  const q = currentExam.questions[currentExam.currentIndex];
  if (!q) return;

  const isChecked = document.getElementById('check-ragu').checked;
  currentExam.ragu[q.id] = isChecked;

  saveSessionToStorage();
  renderNavigation();
  updateProgressStats();

  // Render KaTeX math equations if present
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(document.getElementById('question-text'), { throwOnError: false });
    renderMathInElement(document.getElementById('options-container'), { throwOnError: false });
  }
}

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

// 12. SPACIOUS QUESTION NAVIGATION (GRID & LIST VIEW)
function setNavViewMode(mode) {
  activeNavView = mode;
  const gridEl = document.getElementById('question-grid');
  const listEl = document.getElementById('question-list-view');
  const btnGrid = document.getElementById('view-mode-grid');
  const btnList = document.getElementById('view-mode-list');

  if (mode === 'grid') {
    gridEl.classList.remove('hidden');
    listEl.classList.add('hidden');
    btnGrid.className = 'p-1.5 rounded-lg bg-white dark:bg-slate-700 font-bold shadow-sm';
    btnList.className = 'p-1.5 rounded-lg text-slate-500';
  } else {
    gridEl.classList.add('hidden');
    listEl.classList.remove('hidden');
    btnList.className = 'p-1.5 rounded-lg bg-white dark:bg-slate-700 font-bold shadow-sm';
    btnGrid.className = 'p-1.5 rounded-lg text-slate-500';
  }
  renderNavigation();
}

function filterGrid(cat) {
  activeCategoryFilter = cat;
  ['all', 'unanswered', 'ragu', 'twk', 'tiu', 'tkp'].forEach(c => {
    const el = document.getElementById(`filter-${c}`);
    if (el) {
      if (c.toUpperCase() === cat) {
        el.className = 'px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 font-bold shadow-sm text-slate-800 dark:text-slate-200';
      } else {
        el.className = 'px-3 py-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300';
      }
    }
  });
  renderNavigation();
}

function renderNavigation() {
  if (activeNavView === 'grid') {
    renderSpaciousGrid();
  } else {
    renderSpaciousList();
  }
}

function renderSpaciousGrid() {
  const container = document.getElementById('question-grid');
  if (!container) return;
  container.innerHTML = '';

  currentExam.questions.forEach((q, idx) => {
    const qNum = idx + 1;
    const isAnswered = !!currentExam.answers[q.id];
    const isRagu = !!currentExam.ragu[q.id];
    const isActive = currentExam.currentIndex === idx;
    const ansLetter = currentExam.answers[q.id] || '';

    // Apply Filter
    if (activeCategoryFilter === 'UNANSWERED' && isAnswered) return;
    if (activeCategoryFilter === 'RAGU' && !isRagu) return;
    if (['TWK', 'TIU', 'TKP'].includes(activeCategoryFilter) && q.category !== activeCategoryFilter) return;

    let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

    if (isRagu) {
      bgClass = 'bg-amber-400 dark:bg-amber-500 text-slate-950 font-black border-amber-500 shadow-sm';
    } else if (isAnswered) {
      bgClass = 'bg-emerald-600 text-white font-black border-emerald-600 shadow-sm';
    }

    const ringClass = isActive ? 'ring-4 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900 font-extrabold scale-110 z-10' : '';

    const btn = document.createElement('button');
    btn.className = `w-12 h-12 rounded-2xl border flex flex-col items-center justify-center text-xs transition relative ${bgClass} ${ringClass}`;
    btn.onclick = () => jumpToQuestion(idx);
    btn.title = `Soal No. ${qNum} (${q.category})`;

    btn.innerHTML = `
      <span class="leading-none text-xs font-bold">${qNum}</span>
      ${isAnswered ? `<span class="text-[10px] font-extrabold leading-none mt-1 uppercase">${ansLetter}</span>` : ''}
    `;

    container.appendChild(btn);
  });
}

function renderSpaciousList() {
  const container = document.getElementById('question-list-view');
  if (!container) return;
  container.innerHTML = '';

  currentExam.questions.forEach((q, idx) => {
    const qNum = idx + 1;
    const isAnswered = !!currentExam.answers[q.id];
    const isRagu = !!currentExam.ragu[q.id];
    const isActive = currentExam.currentIndex === idx;
    const ansLetter = currentExam.answers[q.id] || '-';

    if (activeCategoryFilter === 'UNANSWERED' && isAnswered) return;
    if (activeCategoryFilter === 'RAGU' && !isRagu) return;
    if (['TWK', 'TIU', 'TKP'].includes(activeCategoryFilter) && q.category !== activeCategoryFilter) return;

    const row = document.createElement('div');
    row.className = `p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
      isActive 
        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 shadow-sm' 
        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
    }`;
    row.onclick = () => jumpToQuestion(idx);

    let statusBadge = '<span class="text-[10px] px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500">Kosong</span>';
    if (isRagu) {
      statusBadge = `<span class="text-[10px] px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-bold">Ragu (${ansLetter})</span>`;
    } else if (isAnswered) {
      statusBadge = `<span class="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold">Jawab: ${ansLetter}</span>`;
    }

    row.innerHTML = `
      <div class="flex items-center gap-3 overflow-hidden">
        <span class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold flex items-center justify-center text-xs shrink-0">${qNum}</span>
        <div class="truncate text-xs text-slate-700 dark:text-slate-300">
          <strong class="uppercase text-slate-400 mr-1">[${q.category}]</strong> ${q.question}
        </div>
      </div>
      <div>${statusBadge}</div>
    `;

    container.appendChild(row);
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

  const mA = document.getElementById('modal-stat-answered');
  const mR = document.getElementById('modal-stat-ragu');
  const mE = document.getElementById('modal-stat-empty');
  if (mA) mA.textContent = answered;
  if (mR) mR.textContent = ragu;
  if (mE) mE.textContent = empty;
}

// 13. FONT SIZING & KEYBOARD
function changeFontSize(delta) {
  if (delta === 0) currentFontSizeLevel = 0;
  else currentFontSizeLevel = Math.max(-1, Math.min(2, currentFontSizeLevel + delta));
  applyFontSize();
}

function applyFontSize() {
  const qText = document.getElementById('question-text');
  if (!qText) return;

  qText.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl');
  if (currentFontSizeLevel === -1) {
    qText.classList.add('text-sm');
  } else if (currentFontSizeLevel === 0) {
    qText.classList.add('text-base', 'sm:text-lg');
  } else if (currentFontSizeLevel === 1) {
    qText.classList.add('text-lg', 'sm:text-xl');
  } else {
    qText.classList.add('text-xl', 'sm:text-2xl');
  }
}

function setupKeyboardNavigation() {
  window.addEventListener('keydown', (e) => {
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

// 14. FINISH EXAM & CALCULATION (OFFICIAL RULES)
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
  stopTTS();
  closeConfirmFinishModal();
  if (currentExam.timerInterval) clearInterval(currentExam.timerInterval);
  currentExam.isFinished = true;
  localStorage.removeItem('cat_ongoing_session');

  calculateResultsWithOfficialRules();
}

function calculateResultsWithOfficialRules() {
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
        tkpScore += 3;
      }
    }
  });

  const totalScore = twkScore + tiuScore + tkpScore;

  // RULE CHECKING BASED ON SELECTED FORMASI
  let isAllPassed = false;
  let twkPass = false;
  let tiuPass = false;
  let tkpPass = false;

  if (userProfile.formasi === 'DISABILITAS') {
    // KepmenPAN-RB Khusus Penyandang Disabilitas:
    // 1. Nilai Kumulatif SKD paling rendah 286
    // 2. Nilai TIU paling rendah 60
    tiuPass = tiuScore >= 60;
    twkPass = true; // Tidak ada batas minimal TWK terpisah
    tkpPass = true; // Tidak ada batas minimal TKP terpisah
    isAllPassed = (totalScore >= 286) && (tiuScore >= 60);

    document.getElementById('twk-passing-grade-info').innerHTML = 'Formasi Disabilitas: <em>Kumulatif SKD ≥ 286</em>';
    document.getElementById('tiu-passing-grade-info').innerHTML = 'Ambang Batas Disabilitas: <strong>60</strong>';
    document.getElementById('tkp-passing-grade-info').innerHTML = 'Formasi Disabilitas: <em>Kumulatif SKD ≥ 286</em>';
  } else if (userProfile.formasi === 'CUMLAUDE') {
    // Formasi Cumlaude: Kumulatif >= 311, TIU >= 85
    tiuPass = tiuScore >= 85;
    twkPass = true;
    tkpPass = true;
    isAllPassed = (totalScore >= 311) && (tiuScore >= 85);
  } else if (userProfile.formasi === 'PAPUA_3T') {
    // Formasi 3T/Papua: Kumulatif >= 286, TIU >= 60
    tiuPass = tiuScore >= 60;
    twkPass = true;
    tkpPass = true;
    isAllPassed = (totalScore >= 286) && (tiuScore >= 60);
  } else {
    // Formasi Umum Standar: TWK >= 65, TIU >= 80, TKP >= 166
    twkPass = twkScore >= 65;
    tiuPass = tiuScore >= 80;
    tkpPass = tkpScore >= 166;
    isAllPassed = twkPass && tiuPass && tkpPass;
  }

  // Update UI Elements
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

  setSubtestBadge('twk-status-badge', twkPass);
  setSubtestBadge('tiu-status-badge', tiuPass);
  setSubtestBadge('tkp-status-badge', tkpPass);

  const resultCard = document.getElementById('result-status-card');
  const badgeEl = document.getElementById('result-badge');
  const headEl = document.getElementById('result-headline');
  const subEl = document.getElementById('result-subtext');

  if (isAllPassed) {
    resultCard.className = 'rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700';
    badgeEl.textContent = '🌟 LULUS PASSING GRADE SKD';
    headEl.textContent = `Selamat, ${userProfile.name}! Anda Memenuhi Syarat.`;
    subEl.textContent = userProfile.formasi === 'DISABILITAS'
      ? `Skor kumulatif Anda (${totalScore} ≥ 286) dan nilai TIU (${tiuScore} ≥ 60) berhasil memenuhi ambang batas formasi disabilitas resmi BKN!`
      : 'Seluruh komponen TWK (≥65), TIU (≥80), dan TKP (≥166) Anda berhasil memenuhi ambang batas. Anda berhak melaju ke tahapan SKB!';
    
    if (typeof confetti === 'function') {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  } else {
    resultCard.className = 'rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-rose-700 via-rose-600 to-orange-700';
    badgeEl.textContent = '⚠️ BELUM MEMENUHI PASSING GRADE';
    headEl.textContent = `Jangan Menyerah, ${userProfile.name}!`;
    subEl.textContent = userProfile.formasi === 'DISABILITAS'
      ? `Berdasarkan aturan formasi khusus disabilitas, skor kumulatif minimal adalah 286 dan TIU minimal 60. Pelajari kembali pembahasan di bawah.`
      : 'Sesuai aturan BKN, seluruh subtes harus melampaui passing grade sekaligus. Silakan pelajari kembali analisis pembahasan soal.';
  }

  // 15C. UPDATE USER PROGRESS & MASTERY TRACKING
  const wrongQuestionIds = [];
  currentExam.questions.forEach(q => {
    userProgress.seenQuestions[q.id] = true;
    const userAns = currentExam.answers[q.id];

    if (q.category === 'TKP') {
      const pt = (userAns && q.points && q.points[userAns] !== undefined) ? q.points[userAns] : 0;
      if (pt >= 4) {
        userProgress.masteredQuestions[q.id] = true;
        delete userProgress.wrongQuestions[q.id];
      } else {
        userProgress.wrongQuestions[q.id] = true;
        delete userProgress.masteredQuestions[q.id];
        wrongQuestionIds.push(q.id);
      }
    } else {
      if (userAns && userAns === q.answer) {
        userProgress.masteredQuestions[q.id] = true;
        delete userProgress.wrongQuestions[q.id];
      } else {
        userProgress.wrongQuestions[q.id] = true;
        delete userProgress.masteredQuestions[q.id];
        wrongQuestionIds.push(q.id);
      }
    }
  });

  let packetReadableName = 'Simulasi Resmi SKD CAT BKN';
  if (currentExam.packetType === 'twk_only') packetReadableName = 'Tryout Khusus TWK';
  else if (currentExam.packetType === 'tiu_only') packetReadableName = 'Tryout Khusus TIU';
  else if (currentExam.packetType === 'tkp_only') packetReadableName = 'Tryout Khusus TKP';
  else if (currentExam.packetType === 'posttest') packetReadableName = 'Paket Post-Test Paten';
  else if (currentExam.packetType === 'prediksi') packetReadableName = 'Prediksi Soal Baru 2027';

  userProgress.history.push({
    id: 'ses_' + Date.now(),
    date: new Date().toISOString(),
    packetType: currentExam.packetType,
    packetName: packetReadableName,
    totalQuestions: currentExam.questions.length,
    durationMinutes: currentExam.isUntimed ? 'Waktu Bebas' : Math.round(currentExam.durationSeconds / 60),
    isUntimed: !!currentExam.isUntimed,
    totalScore,
    twkScore,
    tiuScore,
    tkpScore,
    isAllPassed,
    formasi: userProfile.formasi,
    wrongQuestionIds: wrongQuestionIds
  });

  saveLocalProgress();
  saveProgressToBackend();
  updateMasteryDashboardUI();
  renderSessionHistory();

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

// 15. REVIEW MODE
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
          <span class="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
            ${qNum}
          </span>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">${q.category}</span>
        </div>
        <div class="flex items-center gap-2">
          ${statusPill}
          <button onclick="copySingleReviewQuestion(${idx})" id="btn-copy-${idx}" class="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 shadow-sm" title="Salin Soal & Pembahasan">
            <i class="ph-bold ph-copy text-xs"></i>
            <span>Salin</span>
          </button>
        </div>
      </div>

      <div class="text-slate-800 dark:text-slate-100 text-base leading-relaxed whitespace-pre-line select-text">
        ${q.question}
      </div>

      <div class="grid grid-cols-1 gap-2 pt-2 text-sm select-text">
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
            <div class="p-3.5 rounded-xl border flex items-center justify-between gap-3 ${optBg}">
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm">${optKey}</span>
                <span>${q.options[optKey]}</span>
              </div>
              <div>${badge}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 select-text">
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

  // Render KaTeX in review cards
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(listContainer, { throwOnError: false });
  }
}

// 15B. CLIPBOARD COPY FUNCTIONS (SALIN SOAL & PEMBAHASAN)
function copySingleReviewQuestion(idx) {
  const q = currentExam.questions[idx];
  if (!q) return;

  const qNum = idx + 1;
  let text = `[SOAL CAT CPNS 2027 - ${q.category} No. ${qNum}]\n\n`;
  text += `${q.question}\n\n`;
  text += `Pilihan Jawaban:\n`;
  ['A', 'B', 'C', 'D', 'E'].forEach(opt => {
    if (q.options && q.options[opt]) {
      text += `${opt}. ${q.options[opt]}\n`;
    }
  });

  if (q.category === 'TKP') {
    text += `\nPembobotan Poin TKP:\n`;
    ['A', 'B', 'C', 'D', 'E'].forEach(opt => {
      const pt = (q.points && q.points[opt] !== undefined) ? q.points[opt] : '-';
      text += `${opt}: ${pt} Poin | `;
    });
    text += `\n`;
  } else {
    text += `\nKunci Jawaban Resmi: ${q.answer}\n`;
  }

  text += `\nPembahasan Resmi:\n${q.explanation || '-'}\n`;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(`btn-copy-${idx}`);
    if (btn) {
      btn.innerHTML = `<i class="ph-bold ph-check text-emerald-600 text-xs"></i> <span class="text-emerald-600">Tersalin!</span>`;
      setTimeout(() => {
        btn.innerHTML = `<i class="ph-bold ph-copy text-xs"></i> <span>Salin</span>`;
      }, 2000);
    }
  }).catch(err => {
    console.error('Copy error:', err);
    fallbackCopyText(text);
  });
}

function copyAllReviewQuestions() {
  const filter = document.getElementById('review-filter').value;
  let text = `=== REKAP SOAL & PEMBAHASAN RESMI CAT CPNS 2027 ===\n`;
  text += `Portal: https://tryout.ilhampradani.me\n`;
  text += `Peserta: ${userProfile.name} (${userProfile.formasi})\n\n`;

  let count = 0;
  currentExam.questions.forEach((q, idx) => {
    const qNum = idx + 1;
    const userAns = currentExam.answers[q.id];
    const isCorrect = (q.category === 'TKP') ? (userAns && q.points && q.points[userAns] >= 4) : (userAns === q.answer);

    if (filter === 'WRONG' && isCorrect) return;
    if (filter === 'TWK' && q.category !== 'TWK') return;
    if (filter === 'TIU' && q.category !== 'TIU') return;
    if (filter === 'TKP' && q.category !== 'TKP') return;

    count++;
    text += `==================================================\n`;
    text += `SOAL NO. ${qNum} [${q.category} - ${q.subtest}]\n`;
    text += `==================================================\n`;
    text += `${q.question}\n\n`;
    text += `Pilihan Jawaban:\n`;
    ['A', 'B', 'C', 'D', 'E'].forEach(opt => {
      if (q.options && q.options[opt]) {
        text += `${opt}. ${q.options[opt]}\n`;
      }
    });

    if (q.category === 'TKP') {
      text += `\nPoin Opsi: A=${q.points?.A || '-'}, B=${q.points?.B || '-'}, C=${q.points?.C || '-'}, D=${q.points?.D || '-'}, E=${q.points?.E || '-'}\n`;
    } else {
      text += `\nKunci Jawaban: ${q.answer}\n`;
    }
    text += `Jawaban Anda: ${userAns || 'Tidak Dijawab'}\n\n`;
    text += `Pembahasan:\n${q.explanation || '-'}\n\n`;
  });

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btn-copy-all');
    if (btn) {
      btn.innerHTML = `<i class="ph-bold ph-check text-emerald-600 text-sm"></i> <span class="text-emerald-600">Semua Tersalin!</span>`;
      setTimeout(() => {
        btn.innerHTML = `<i class="ph-bold ph-copy text-sm"></i> <span>Salin Semua Pembahasan</span>`;
      }, 2500);
    }
    alert(`📋 Sebanyak ${count} butir soal beserta kunci dan pembahasannya berhasil disalin ke clipboard!`);
  }).catch(err => {
    console.error('Copy error:', err);
    fallbackCopyText(text);
  });
}

function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    alert('📋 Berhasil disalin ke clipboard!');
  } catch (err) {
    alert('Silakan blok teks pada layar lalu tekan Ctrl+C untuk menyalin.');
  }
  document.body.removeChild(textArea);
}

// 16. SESSION RESUME & STATE PERSISTENCE
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
      if (confirm('Ditemukan sesi ujian tryout sebelumnya yang dijeda. Apakah Anda ingin melanjutkan pengerjaan?')) {
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

// 17. SCREEN SWITCHING HELPER
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
  stopTTS();
  if (currentExam.timerInterval) clearInterval(currentExam.timerInterval);
  switchToScreen('lobby');
}

// 18. SMART CAT MASTERY DASHBOARD & D1 SYNC HELPERS
function updateMasteryDashboardUI() {
  if (!bankData || !bankData.questions) return;
  const totalPool = bankData.questions.length;
  const masteredCount = Object.keys(userProgress.masteredQuestions || {}).length;
  const wrongCount = Object.keys(userProgress.wrongQuestions || {}).length;
  const seenCount = Object.keys(userProgress.seenQuestions || {}).length;
  const freshCount = Math.max(0, totalPool - seenCount);

  const pct = totalPool > 0 ? Math.min(100, Math.round((masteredCount / totalPool) * 100)) : 0;

  const totalPoolEl = document.getElementById('stat-total-pool');
  if (totalPoolEl) totalPoolEl.textContent = totalPool.toLocaleString('id-ID');

  const freshEl = document.getElementById('stat-fresh-count');
  if (freshEl) freshEl.textContent = freshCount.toLocaleString('id-ID');

  const masteredEl = document.getElementById('stat-mastered-count');
  if (masteredEl) masteredEl.textContent = masteredCount.toLocaleString('id-ID');

  const wrongEl = document.getElementById('stat-wrong-count');
  if (wrongEl) wrongEl.textContent = wrongCount.toLocaleString('id-ID');

  const pctEl = document.getElementById('stat-mastery-percentage');
  if (pctEl) pctEl.textContent = `${pct}% Tuntas Dikuasai`;

  const barEl = document.getElementById('stat-mastery-bar');
  if (barEl) barEl.style.width = `${pct}%`;

  const totalCountEl = document.getElementById('total-bank-count');
  if (totalCountEl) totalCountEl.textContent = totalPool.toLocaleString('id-ID');

  // Sync settings dropdown and toggles
  const edModeEl = document.getElementById('setting-edition-mode');
  if (edModeEl && examSettings.editionMode) edModeEl.value = examSettings.editionMode;

  const alwaysNewEl = document.getElementById('setting-always-new');
  if (alwaysNewEl) alwaysNewEl.checked = !!examSettings.alwaysNew;

  const repeatWrongEl = document.getElementById('setting-repeat-wrong');
  if (repeatWrongEl) repeatWrongEl.checked = !!examSettings.repeatWrong;
}

function updateExamSettings() {
  const edModeEl = document.getElementById('setting-edition-mode');
  const alwaysNewEl = document.getElementById('setting-always-new');
  const repeatWrongEl = document.getElementById('setting-repeat-wrong');

  if (edModeEl) examSettings.editionMode = edModeEl.value;
  if (alwaysNewEl) examSettings.alwaysNew = alwaysNewEl.checked;
  if (repeatWrongEl) examSettings.repeatWrong = repeatWrongEl.checked;

  saveLocalProgress();
  saveProgressToBackend();
}

async function resetMasteredQuestions() {
  const confirmed = confirm(
    'Mulai ulang status soal yang sudah tuntas?\n\n' +
    'Semua soal akan kembali berstatus baru dan dapat dimunculkan kembali pada simulasi ujian berikutnya.\n' +
    '(Catatan: Riwayat skor dan sertifikat nilai tryout Anda tetap aman).'
  );
  if (!confirmed) return;

  userProgress.masteredQuestions = {};
  userProgress.wrongQuestions = {};
  userProgress.seenQuestions = {};
  saveLocalProgress();
  updateMasteryDashboardUI();

  const userId = userProfile.email || 'anonymous_user';
  try {
    await fetch('/api/cpns?action=reset_mastery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
  } catch (err) {
    console.warn('Reset D1 backend error:', err);
  }

  alert('✅ Status soal tuntas berhasil direset! Seluruh butir soal kini siap diuji kembali.');
}

async function syncUserProgressWithBackend() {
  const userId = userProfile.email || 'anonymous_user';
  try {
    const res = await fetch(`/api/cpns?action=user_stats&user_id=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (Array.isArray(d.seen_questions) && d.seen_questions.length > 0) {
          d.seen_questions.forEach(id => userProgress.seenQuestions[id] = true);
        }
        if (Array.isArray(d.mastered_questions) && d.mastered_questions.length > 0) {
          d.mastered_questions.forEach(id => userProgress.masteredQuestions[id] = true);
        }
        if (Array.isArray(d.wrong_questions) && d.wrong_questions.length > 0) {
          d.wrong_questions.forEach(id => userProgress.wrongQuestions[id] = true);
        }
        if (d.settings && Object.keys(d.settings).length > 0) {
          examSettings = { ...examSettings, ...d.settings };
        }
        if (Array.isArray(d.history) && d.history.length > 0) {
          userProgress.history = d.history;
        }
        saveLocalProgress();
        updateMasteryDashboardUI();
        renderSessionHistory();
      }
    }
  } catch (err) {
    console.warn('Sync D1 worker backend error:', err);
  }
}

async function saveProgressToBackend() {
  const userId = userProfile.email || 'anonymous_user';
  try {
    await fetch('/api/cpns?action=sync_progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        seen_questions: Object.keys(userProgress.seenQuestions || {}),
        mastered_questions: Object.keys(userProgress.masteredQuestions || {}),
        wrong_questions: Object.keys(userProgress.wrongQuestions || {}),
        history: userProgress.history || [],
        settings: examSettings
      })
    });
  } catch (err) {
    console.warn('Save to D1 worker backend error:', err);
  }
}

// 19. PRE-EXAM CONFIRMATION & CUSTOMIZATION MODAL ENGINE
let pendingPreExamPacket = 'full_simulation';

function openPreExamModal(packetType) {
  pendingPreExamPacket = packetType;
  const isDisabilitas = userProfile.formasi === 'DISABILITAS';

  const modal = document.getElementById('modal-pre-exam');
  const titleEl = document.getElementById('pre-exam-title');
  const durInput = document.getElementById('pre-exam-duration-input');
  const qInput = document.getElementById('pre-exam-qcount-input');
  const qDisplay = document.getElementById('pre-exam-qcount-display');
  const untimedCb = document.getElementById('pre-exam-untimed');
  const remedialCb = document.getElementById('pre-exam-remedial-only');
  const edSelect = document.getElementById('pre-exam-edition-select');

  // Set user display in modal
  const nameEl = document.getElementById('pre-exam-user-name');
  const idEl = document.getElementById('pre-exam-user-id');
  const avatarEl = document.getElementById('pre-exam-avatar');
  if (nameEl) nameEl.textContent = userProfile.name;
  if (idEl) idEl.textContent = `User ID: ${userProfile.email || 'guest_' + (userProfile.name || 'asn').toLowerCase().replace(/\s+/g, '_')}`;
  if (avatarEl) {
    if (userProfile.avatar) {
      avatarEl.innerHTML = `<img src="${userProfile.avatar}" class="w-full h-full object-cover">`;
    } else {
      avatarEl.textContent = (userProfile.name || 'ASN').substring(0, 2).toUpperCase();
    }
  }

  // Set defaults based on packet
  let defaultDuration = isDisabilitas ? 130 : 100;
  let defaultCount = 110;
  let packetName = 'Simulasi Resmi SKD CAT BKN';

  if (packetType === 'twk_only') {
    defaultDuration = 25;
    defaultCount = 30;
    packetName = 'Tryout Khusus TWK';
  } else if (packetType === 'tiu_only') {
    defaultDuration = isDisabilitas ? 45 : 35;
    defaultCount = 35;
    packetName = 'Tryout Khusus TIU';
  } else if (packetType === 'tkp_only') {
    defaultDuration = isDisabilitas ? 50 : 40;
    defaultCount = 45;
    packetName = 'Tryout Khusus TKP';
  } else if (packetType === 'posttest') {
    defaultDuration = isDisabilitas ? 130 : 100;
    defaultCount = 110;
    packetName = 'Paket Post-Test Paten';
  } else if (packetType === 'prediksi') {
    defaultDuration = 35;
    defaultCount = 35;
    packetName = 'Prediksi Soal Baru 2027';
  }

  if (titleEl) titleEl.textContent = `Konfirmasi: ${packetName}`;
  if (durInput) durInput.value = defaultDuration;
  if (qInput) qInput.value = defaultCount;
  if (qDisplay) qDisplay.textContent = `${defaultCount} Soal`;
  if (untimedCb) untimedCb.checked = false;
  if (remedialCb) remedialCb.checked = false;
  if (edSelect) edSelect.value = examSettings.editionMode || 'PRIORITY_2027';

  toggleUntimedMode(untimedCb);

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closePreExamModal() {
  const modal = document.getElementById('modal-pre-exam');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function toggleUntimedMode(checkbox) {
  const durInput = document.getElementById('pre-exam-duration-input');
  const timerWrapper = document.getElementById('pre-exam-timer-wrapper');
  const hint = document.getElementById('pre-exam-duration-hint');

  if (checkbox && checkbox.checked) {
    if (durInput) durInput.disabled = true;
    if (timerWrapper) timerWrapper.classList.add('opacity-40', 'pointer-events-none');
    if (hint) hint.textContent = 'Mode Waktu Bebas Aktif: Ujian santai tanpa batas waktu (cocok untuk pendalaman materi).';
  } else {
    if (durInput) durInput.disabled = false;
    if (timerWrapper) timerWrapper.classList.remove('opacity-40', 'pointer-events-none');
    if (hint) hint.textContent = 'Standar BKN: 100 menit untuk umum, 130 menit untuk formasi disabilitas.';
  }
}

function setPreExamDuration(mins) {
  const untimedCb = document.getElementById('pre-exam-untimed');
  if (untimedCb) untimedCb.checked = false;
  toggleUntimedMode(untimedCb);

  const durInput = document.getElementById('pre-exam-duration-input');
  if (durInput) durInput.value = mins;
}

function setPreExamQCount(count) {
  const qInput = document.getElementById('pre-exam-qcount-input');
  const qDisplay = document.getElementById('pre-exam-qcount-display');
  if (qInput) qInput.value = count;
  if (qDisplay) qDisplay.textContent = `${count} Soal`;
}

function onPreExamQCountChange(val) {
  const qDisplay = document.getElementById('pre-exam-qcount-display');
  if (qDisplay) qDisplay.textContent = `${val || 0} Soal`;
}

function confirmAndStartExam() {
  const isUntimed = document.getElementById('pre-exam-untimed')?.checked || false;
  const durationMinutes = parseInt(document.getElementById('pre-exam-duration-input')?.value) || 100;
  const targetQCount = parseInt(document.getElementById('pre-exam-qcount-input')?.value) || 110;
  const remedialOnly = document.getElementById('pre-exam-remedial-only')?.checked || false;
  const editionMode = document.getElementById('pre-exam-edition-select')?.value || 'PRIORITY_2027';

  closePreExamModal();

  startExam(pendingPreExamPacket, {
    isUntimed,
    durationMinutes,
    targetQCount,
    remedialOnly,
    editionMode
  });
}

// 20. SESSION HISTORY PER ACCOUNT ENGINE
let activeHistoryFilter = 'ALL';

function renderSessionHistory() {
  const container = document.getElementById('session-history-container');
  const userDisplay = document.getElementById('history-user-display');
  const countAll = document.getElementById('count-hist-all');
  const countPassed = document.getElementById('count-hist-passed');
  const countFailed = document.getElementById('count-hist-failed');

  const userId = userProfile.email || 'guest_' + (userProfile.name || 'asn').toLowerCase().replace(/\s+/g, '_');
  if (userDisplay) userDisplay.textContent = userId;

  const history = userProgress.history || [];
  const passedCount = history.filter(h => h.isAllPassed).length;
  const failedCount = history.filter(h => !h.isAllPassed).length;

  if (countAll) countAll.textContent = history.length;
  if (countPassed) countPassed.textContent = passedCount;
  if (countFailed) countFailed.textContent = failedCount;

  // Filter tabs styling
  const btnAll = document.getElementById('btn-hist-all');
  const btnPassed = document.getElementById('btn-hist-passed');
  const btnFailed = document.getElementById('btn-hist-failed');

  [btnAll, btnPassed, btnFailed].forEach(b => {
    if (b) {
      b.classList.remove('bg-blue-600', 'bg-rose-600', 'text-white', 'shadow-sm');
      b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
    }
  });

  if (activeHistoryFilter === 'ALL' && btnAll) {
    btnAll.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
    btnAll.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
  } else if (activeHistoryFilter === 'PASSED' && btnPassed) {
    btnPassed.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
    btnPassed.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
  } else if (activeHistoryFilter === 'FAILED' && btnFailed) {
    btnFailed.classList.add('bg-rose-600', 'text-white', 'shadow-sm');
    btnFailed.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
  }

  if (!container) return;

  const filtered = history.filter(h => {
    if (activeHistoryFilter === 'PASSED') return h.isAllPassed;
    if (activeHistoryFilter === 'FAILED') return !h.isAllPassed;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-slate-400 space-y-2">
        <i class="ph-bold ph-calendar-blank text-3xl"></i>
        <p class="text-xs">Belum ada riwayat sesi yang cocok dengan filter. Selesaikan simulasi tryout untuk melihat histori per akun.</p>
      </div>
    `;
    return;
  }

  // Render from latest to oldest
  container.innerHTML = filtered.slice().reverse().map((ses, idx) => {
    const originalIdx = history.indexOf(ses);
    const dateStr = new Date(ses.date).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    const statusBadge = ses.isAllPassed
      ? `<span class="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1"><i class="ph-bold ph-check-circle"></i> LULUS PASSING GRADE</span>`
      : `<span class="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[11px] flex items-center gap-1"><i class="ph-bold ph-x-circle"></i> BELUM MEMENUHI</span>`;

    const wrongCount = (ses.wrongQuestionIds && Array.isArray(ses.wrongQuestionIds)) ? ses.wrongQuestionIds.length : 0;

    return `
      <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-blue-400">
        <div class="space-y-1.5">
          <div class="flex flex-wrap items-center gap-2">
            ${statusBadge}
            <span class="font-bold text-sm text-slate-900 dark:text-slate-100">${ses.packetName || ses.packetType}</span>
            <span class="text-xs text-slate-400">• ${dateStr} WIB</span>
          </div>
          <div class="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span>Total Skor: <strong class="text-blue-600 text-sm font-black">${ses.totalScore}</strong></span>
            <span>TWK: <strong>${ses.twkScore}</strong></span>
            <span>TIU: <strong>${ses.tiuScore}</strong></span>
            <span>TKP: <strong>${ses.tkpScore}</strong></span>
            <span>• Soal: ${ses.totalQuestions || 110} Butir</span>
            <span>• Durasi: ${ses.durationMinutes === 'Waktu Bebas' ? 'Waktu Bebas' : ses.durationMinutes + 'm'}</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="retestSession('${ses.packetType}')" class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 shadow-sm">
            <i class="ph-bold ph-arrows-clockwise text-xs"></i>
            <span>Uji Ulang</span>
          </button>
          ${!ses.isAllPassed || wrongCount > 0 ? `
            <button onclick="remedialSession(${originalIdx})" class="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900/60 transition flex items-center gap-1.5 shadow-sm">
              <i class="ph-bold ph-target text-xs"></i>
              <span>Remedial Soal Gagal</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function filterSessionHistory(filter) {
  activeHistoryFilter = filter;
  renderSessionHistory();
}

function retestSession(packetType) {
  openPreExamModal(packetType);
}

function remedialSession(historyIndex) {
  const ses = userProgress.history[historyIndex];
  if (!ses) return;

  openPreExamModal(ses.packetType);

  const remedialCb = document.getElementById('pre-exam-remedial-only');
  if (remedialCb) remedialCb.checked = true;

  const wrongCount = ses.wrongQuestionIds ? ses.wrongQuestionIds.length : 30;
  if (wrongCount > 0) {
    setPreExamQCount(Math.min(wrongCount, 110));
  }
}
