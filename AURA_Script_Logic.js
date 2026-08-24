const STORAGE_KEY = 'AURA_STREAK_HABITS_DATA_V12';

let habits = loadData();
let currentActiveHabitId = null;

const PRESET_EMOJIS = ['🔥', '🏋️', '📖', '💧', '🧠', '🏃', '💤', '🕌', '📝', '🎯', '💪', '📚', '💻', '🧘', '🛌', '🏆', '⚡'];

let calendarViewYear = new Date().getFullYear();
let calendarViewMonth = new Date().getMonth();

const MONTH_NAMES_MS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
];

function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { 
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { console.error(e); }
  }
  return [];
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function getStreakLevel(streak) {
  if (streak >= 100) return { level: 6, title: 'Unstoppable', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
  if (streak >= 60) return { level: 5, title: 'Elite', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  if (streak >= 30) return { level: 4, title: 'Strong', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  if (streak >= 14) return { level: 3, title: 'Disciplined', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
  if (streak >= 7) return { level: 2, title: 'Consistent', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
  return { level: 1, title: 'Beginner', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
}

const ALL_ACHIEVEMENTS = [
  { id: 'first_day', name: 'First Day', desc: 'Hari pertama selesai', icon: '🌱', req: 1 },
  { id: '3_day', name: '3 Day Streak', desc: 'Pertahankan 3 hari', icon: '⚡', req: 3 },
  { id: '7_day', name: '7 Day Streak', desc: '1 Minggu penuh!', icon: '🔥', req: 7 },
  { id: '14_day', name: '14 Day Streak', desc: '2 Minggu disiplin', icon: '🚀', req: 14 },
  { id: '30_day', name: '30 Day Streak', desc: '1 Bulan hebat!', icon: '🏆', req: 30 },
  { id: '60_day', name: '60 Day Streak', desc: 'Konsistensi padu', icon: '👑', req: 60 },
  { id: '90_day', name: '90 Day Streak', desc: 'Gaya hidup baru', icon: '💎', req: 90 },
  { id: '100_day', name: '100 Day Streak', desc: 'Century Club!', icon: '🌟', req: 100 }
];

function triggerHaptic() {
  if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
}

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#f97316', '#f59e0b', '#10b981', '#06b6d4', '#a855f7']
    });
  }
}

function renderLobby() {
  const container = document.getElementById('habitList');
  const emptyState = document.getElementById('emptyState');
  const today = getTodayDateString();

  document.getElementById('totalActiveStreaksBadge').innerText = `${habits.length} Habit Aktif`;
  container.innerHTML = '';

  if (habits.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  habits.forEach(habit => {
    const isCompletedToday = habit.lastCompletedDate === today;
    const isRestToday = habit.lastRestDate === today;
    const levelInfo = getStreakLevel(habit.currentStreak);

    let actionBtnHTML = '';
    if (isCompletedToday) {
      actionBtnHTML = `
        <button disabled class="w-full py-3 px-4 rounded-xl font-extrabold text-xs bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center space-x-2 cursor-not-allowed">
          <i data-lucide="check-circle-2" class="w-4 h-4"></i>
          <span>✓ COMPLETED TODAY</span>
        </button>
      `;
    } else if (isRestToday) {
      actionBtnHTML = `
        <button disabled class="w-full py-3 px-4 rounded-xl font-extrabold text-xs bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 flex items-center justify-center space-x-2 cursor-not-allowed">
          <i data-lucide="moon" class="w-4 h-4"></i>
          <span>💤 REST TODAY</span>
        </button>
      `;
    } else {
      actionBtnHTML = `
        <div class="grid grid-cols-4 gap-2">
          <button onclick="event.stopPropagation(); completeHabit('${habit.id}')" class="col-span-3 py-3 px-4 rounded-xl font-extrabold text-xs bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 shadow-neon-orange active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
            <i data-lucide="flame" class="w-4 h-4 fill-slate-950"></i>
            <span>COMPLETE (+1 DAY)</span>
          </button>
          <button onclick="event.stopPropagation(); restHabit('${habit.id}')" title="Rest Day" class="col-span-1 py-3 rounded-xl font-extrabold text-xs bg-slate-800/80 hover:bg-cyan-950/40 text-cyan-400 border border-slate-700/80 flex items-center justify-center">
            <i data-lucide="moon" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    }

    const card = document.createElement('div');
    card.className = `glass-card p-4 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-slate-600/60 cursor-pointer group`;
    card.onclick = () => openDetailModal(habit.id);

    card.innerHTML = `
      <div class="flex justify-between items-center mb-2.5">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelInfo.bg}">
          Lv.${levelInfo.level} — ${levelInfo.title}
        </span>
        <button onclick="event.stopPropagation(); confirmDeleteHabitDirect('${habit.id}')" class="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700/70 flex items-center justify-center text-2xl shadow-inner">
            ${habit.icon}
          </div>
          <div>
            <h2 class="text-base font-bold text-white tracking-wide">${habit.name}</h2>
            <div class="text-xs text-slate-400 font-medium">${habit.category}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 flex items-center justify-end gap-1">
            <span>${habit.currentStreak}</span>
            <span class="text-xs font-black text-orange-400">DAYS</span>
          </div>
          <div class="text-[10px] text-slate-500 font-semibold">REKOR: ${habit.highestStreak}D</div>
        </div>
      </div>
      <div class="pt-1 border-t border-slate-800/60">${actionBtnHTML}</div>
    `;
    container.appendChild(card);
  });
  lucide.createIcons();
}

function completeHabit(id) {
  const today = getTodayDateString();
  const habit = habits.find(h => h.id === id);
  if (!habit || habit.lastCompletedDate === today || habit.lastRestDate === today) return;

  habit.currentStreak += 1;
  habit.totalCompleted += 1;
  habit.lastCompletedDate = today;
  habit.history[today] = 'completed';

  if (habit.currentStreak > habit.highestStreak) {
    habit.highestStreak = habit.currentStreak;
  }

  checkAchievements(habit);
  saveData();
  triggerHaptic();
  triggerConfetti();
  openAddNoteModal(today);

  renderLobby();
  if (currentActiveHabitId === id) renderDetailContent(id);
}

function restHabit(id) {
  const today = getTodayDateString();
  const habit = habits.find(h => h.id === id);
  if (!habit || habit.lastCompletedDate === today || habit.lastRestDate === today) return;

  habit.lastRestDate = today;
  habit.totalRest += 1;
  habit.history[today] = 'rest';

  saveData();
  triggerHaptic();
  renderLobby();
  if (currentActiveHabitId === id) renderDetailContent(id);
}

function checkAchievements(habit) {
  ALL_ACHIEVEMENTS.forEach(ach => {
    if (habit.currentStreak >= ach.req && (!habit.achievements || !habit.achievements.includes(ach.id))) {
      if (!habit.achievements) habit.achievements = [];
      habit.achievements.push(ach.id);
      showAchievementBanner(ach.name);
    }
  });
}

function showAchievementBanner(title) {
  const banner = document.getElementById('achievementBanner');
  document.getElementById('achievementTitle').innerText = title;
  banner.classList.remove('hidden');
  setTimeout(() => {
    banner.classList.remove('-translate-y-12', 'opacity-0');
    banner.classList.add('translate-y-0', 'opacity-100');
  }, 50);
  setTimeout(() => {
    banner.classList.remove('translate-y-0', 'opacity-100');
    banner.classList.add('-translate-y-12', 'opacity-0');
    setTimeout(() => banner.classList.add('hidden'), 500);
  }, 4000);
}

function openDetailModal(id) {
  currentActiveHabitId = id;
  const now = new Date();
  calendarViewYear = now.getFullYear();
  calendarViewMonth = now.getMonth();
  renderDetailContent(id);

  const modal = document.getElementById('detailModal');
  const card = modal.querySelector('.glass-modal');
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    card.classList.remove('translate-y-8');
  }, 10);
}

function closeDetailModal() {
  const modal = document.getElementById('detailModal');
  const card = modal.querySelector('.glass-modal');
  card.classList.add('translate-y-8');
  modal.classList.add('opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
    currentActiveHabitId = null;
    closeHabitMenu();
  }, 300);
}

function changeCalendarMonth(offset) {
  calendarViewMonth += offset;
  if (calendarViewMonth < 0) {
    calendarViewMonth = 11;
    calendarViewYear -= 1;
  } else if (calendarViewMonth > 11) {
    calendarViewMonth = 0;
    calendarViewYear += 1;
  }
  if (currentActiveHabitId) {
    const habit = habits.find(h => h.id === currentActiveHabitId);
    if (habit) renderMonthlyCalendar(habit);
  }
}

function jumpToTodayCalendar() {
  const now = new Date();
  calendarViewYear = now.getFullYear();
  calendarViewMonth = now.getMonth();
  if (currentActiveHabitId) {
    const habit = habits.find(h => h.id === currentActiveHabitId);
    if (habit) renderMonthlyCalendar(habit);
  }
}

function renderDetailContent(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) return;

  const today = getTodayDateString();
  const levelInfo = getStreakLevel(habit.currentStreak);

  document.getElementById('detailIcon').innerText = habit.icon;
  document.getElementById('detailTitle').innerText = habit.name;
  document.getElementById('detailCategory').innerText = habit.category;
  
  const badge = document.getElementById('detailLevelBadge');
  badge.className = `px-3 py-0.5 rounded-full text-xs font-extrabold ${levelInfo.bg}`;
  badge.innerText = `Lv.${levelInfo.level} — ${levelInfo.title}`;

  document.getElementById('detailCurrentStreak').innerText = habit.currentStreak;
  document.getElementById('detailHighestStreak').innerText = `${habit.highestStreak} Hari`;
  document.getElementById('detailTotalCompleted').innerText = `${habit.totalCompleted} Hari`;
  document.getElementById('detailTotalRest').innerText = `${habit.totalRest} Hari`;
  document.getElementById('detailCurrentStreakStat').innerText = `${habit.currentStreak} Hari`;

  const goal = habit.goalDays || 30;
  const pct = Math.min(Math.round((habit.currentStreak / goal) * 100), 100);
  document.getElementById('detailGoalText').innerText = `${habit.currentStreak} / ${goal} DAYS (${pct}%)`;
  document.getElementById('detailGoalBar').style.width = `${pct}%`;

  const isCompletedToday = habit.lastCompletedDate === today;
  const isRestToday = habit.lastRestDate === today;
  const actionBox = document.getElementById('detailActionBox');

  if (isCompletedToday) {
    actionBox.innerHTML = `<div class="py-3 px-4 rounded-xl text-center text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ COMPLETED TODAY</div>`;
  } else if (isRestToday) {
    actionBox.innerHTML = `<div class="py-3 px-4 rounded-xl text-center text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">💤 REST DAY</div>`;
  } else {
    actionBox.innerHTML = `
      <div class="grid grid-cols-4 gap-2">
        <button onclick="completeHabit('${habit.id}')" class="col-span-3 py-3 px-4 rounded-xl font-extrabold text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-neon-orange">COMPLETE TODAY</button>
        <button onclick="restHabit('${habit.id}')" class="col-span-1 py-3 rounded-xl font-extrabold text-xs bg-slate-800 text-cyan-400 border border-slate-700">💤</button>
      </div>
    `;
  }

  const achContainer = document.getElementById('detailAchievementsList');
  achContainer.innerHTML = '';
  ALL_ACHIEVEMENTS.forEach(ach => {
    const unlocked = habit.achievements && habit.achievements.includes(ach.id);
    const el = document.createElement('div');
    el.className = `flex-shrink-0 p-2.5 rounded-xl border text-center w-24 ${unlocked ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-40'}`;
    el.innerHTML = `<div class="text-2xl mb-1">${ach.icon}</div><div class="text-[10px] font-extrabold truncate">${ach.name}</div>`;
    achContainer.appendChild(el);
  });

  renderMonthlyCalendar(habit);
  renderNotes(habit);
  lucide.createIcons();
}

function renderMonthlyCalendar(habit) {
  const grid = document.getElementById('calendarGrid');
  const textHeader = document.getElementById('calendarMonthYearText');
  grid.innerHTML = '';
  textHeader.innerText = `${MONTH_NAMES_MS[calendarViewMonth]} ${calendarViewYear}`;

  const firstDayOfMonth = new Date(calendarViewYear, calendarViewMonth, 1);
  const daysInMonth = new Date(calendarViewYear, calendarViewMonth + 1, 0).getDate();
  let startDayIndex = firstDayOfMonth.getDay() - 1;
  if (startDayIndex < 0) startDayIndex = 6;

  for (let i = 0; i < startDayIndex; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'p-2 rounded-xl text-xs opacity-0 pointer-events-none';
    grid.appendChild(emptyCell);
  }

  const todayStr = getTodayDateString();
  for (let day = 1; day <= daysInMonth; day++) {
    const mStr = String(calendarViewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateKey = `${calendarViewYear}-${mStr}-${dStr}`;
    const status = habit.history[dateKey];
    const isToday = dateKey === todayStr;

    let statusStyle = 'bg-slate-900/80 border-slate-800 text-slate-400';
    let statusBadge = '';
    if (status === 'completed') {
      statusStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-black shadow-neon-emerald';
      statusBadge = '<span class="text-[8px] block -mt-0.5">✓</span>';
    } else if (status === 'rest') {
      statusStyle = 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-black';
      statusBadge = '<span class="text-[8px] block -mt-0.5">💤</span>';
    }

    const todayBorder = isToday ? 'ring-2 ring-orange-500 ring-offset-1 ring-offset-slate-950 font-black' : '';
    const cell = document.createElement('div');
    cell.className = `p-2 rounded-xl border text-xs flex flex-col items-center justify-center cursor-pointer ${statusStyle} ${todayBorder}`;
    cell.innerHTML = `<span>${day}</span>${statusBadge}`;
    grid.appendChild(cell);
  }
}

function renderNotes(habit) {
  const container = document.getElementById('detailNotesList');
  container.innerHTML = '';
  if (!habit.notes || habit.notes.length === 0) {
    container.innerHTML = `<div class="text-xs text-slate-500 text-center py-3 italic">Belum ada catatan tertulis.</div>`;
    return;
  }
  habit.notes.slice().reverse().forEach((n, idx) => {
    const originalIndex = habit.notes.length - 1 - idx;
    const item = document.createElement('div');
    item.className = 'p-3 rounded-xl glass-card border border-slate-800 text-xs flex justify-between items-start';
    item.innerHTML = `
      <div>
        <div class="text-[10px] text-amber-400 font-bold mb-1">📅 ${n.date}</div>
        <div class="text-slate-200 leading-relaxed">${n.text}</div>
      </div>
      <button onclick="confirmDeleteNote(${originalIndex})" class="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
    `;
    container.appendChild(item);
  });
  lucide.createIcons();
}

function openAddNoteModal(defaultDate = getTodayDateString()) {
  document.getElementById('noteModalTitle').innerText = 'Tambah Catatan Baru';
  document.getElementById('editNoteIndex').value = '';
  document.getElementById('noteDateInput').value = defaultDate;
  document.getElementById('noteInput').value = '';
  document.getElementById('noteModal').classList.remove('hidden', 'opacity-0');
}

function closeNoteModal() {
  document.getElementById('noteModal').classList.add('hidden');
}

function saveNoteManual() {
  const habit = habits.find(h => h.id === currentActiveHabitId);
  if (!habit) return;
  const dateVal = document.getElementById('noteDateInput').value || getTodayDateString();
  const textVal = document.getElementById('noteInput').value.trim();
  if (!textVal) return;

  if (!habit.notes) habit.notes = [];
  habit.notes.push({ date: dateVal, text: textVal });
  saveData();
  renderDetailContent(habit.id);
  closeNoteModal();
}

function confirmDeleteNote(index) {
  const habit = habits.find(h => h.id === currentActiveHabitId);
  if (!habit || !habit.notes[index]) return;
  habit.notes.splice(index, 1);
  saveData();
  renderDetailContent(habit.id);
}

function renderEmojiPickerGrid() {
  const grid = document.getElementById('emojiPickerGrid');
  grid.innerHTML = '';
  PRESET_EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'p-2 text-xl rounded-xl bg-slate-800/80 hover:bg-slate-700 text-center';
    btn.innerText = emoji;
    btn.onclick = () => {
      document.getElementById('formIcon').value = emoji;
      document.getElementById('selectedEmojiPreview').innerText = emoji;
      toggleEmojiPicker();
    };
    grid.appendChild(btn);
  });
}

function toggleEmojiPicker() {
  document.getElementById('emojiPickerGridContainer').classList.toggle('hidden');
}

function openAddModal() {
  renderEmojiPickerGrid();
  document.getElementById('formModalTitle').innerText = 'Tambah Habit Baru';
  document.getElementById('formHabitId').value = '';
  document.getElementById('formName').value = '';
  document.getElementById('formIcon').value = '🔥';
  document.getElementById('selectedEmojiPreview').innerText = '🔥';
  document.getElementById('formInitialStreak').value = '0';
  document.getElementById('formHighestStreak').value = '0';
  document.getElementById('formTotalCompleted').value = '0';
  document.getElementById('habitFormModal').classList.remove('hidden', 'opacity-0');
}

function openEditModalFromDetail() {
  closeHabitMenu();
  const habit = habits.find(h => h.id === currentActiveHabitId);
  if (!habit) return;
  renderEmojiPickerGrid();
  document.getElementById('formModalTitle').innerText = 'Edit Habit';
  document.getElementById('formHabitId').value = habit.id;
  document.getElementById('formName').value = habit.name;
  document.getElementById('formIcon').value = habit.icon;
  document.getElementById('selectedEmojiPreview').innerText = habit.icon;
  document.getElementById('formInitialStreak').value = habit.currentStreak;
  document.getElementById('formHighestStreak').value = habit.highestStreak;
  document.getElementById('formTotalCompleted').value = habit.totalCompleted;
  document.getElementById('formGoal').value = habit.goalDays || 30;
  document.getElementById('formCategory').value = habit.category;
  document.getElementById('habitFormModal').classList.remove('hidden', 'opacity-0');
}

function closeFormModal() {
  document.getElementById('habitFormModal').classList.add('hidden');
}

function handleFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('formHabitId').value;
  const name = document.getElementById('formName').value.trim();
  const icon = document.getElementById('formIcon').value.trim() || '🔥';
  const initialStreak = parseInt(document.getElementById('formInitialStreak').value) || 0;
  const highestStreak = parseInt(document.getElementById('formHighestStreak').value) || 0;
  const totalCompleted = parseInt(document.getElementById('formTotalCompleted').value) || 0;
  const goalDays = parseInt(document.getElementById('formGoal').value) || 30;
  const category = document.getElementById('formCategory').value;
  if (!name) return;

  if (id) {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      habit.name = name;
      habit.icon = icon;
      habit.currentStreak = initialStreak;
      habit.highestStreak = Math.max(highestStreak, initialStreak);
      habit.totalCompleted = totalCompleted;
      habit.goalDays = goalDays;
      habit.category = category;
      checkAchievements(habit);
    }
  } else {
    const newHabit = {
      id: 'habit_' + Date.now(),
      name, icon, goalDays, category,
      currentStreak: initialStreak,
      highestStreak: Math.max(highestStreak, initialStreak),
      totalCompleted: Math.max(totalCompleted, initialStreak),
      totalRest: 0, totalResets: 0,
      lastCompletedDate: null, lastRestDate: null,
      history: {}, notes: [], achievements: []
    };
    checkAchievements(newHabit);
    habits.push(newHabit);
  }

  saveData();
  renderLobby();
  closeFormModal();
  if (currentActiveHabitId && id === currentActiveHabitId) renderDetailContent(id);
}

function confirmResetStreakOnlyFromDetail() {
  closeHabitMenu();
  const habit = habits.find(h => h.id === currentActiveHabitId);
  if (!habit) return;
  habit.currentStreak = 0;
  habit.lastCompletedDate = null;
  habit.lastRestDate = null;
  saveData();
  renderLobby();
  renderDetailContent(habit.id);
}

function confirmFullResetFromDetail() {
  closeHabitMenu();
  const habit = habits.find(h => h.id === currentActiveHabitId);
  if (!habit) return;
  habit.currentStreak = 0;
  habit.highestStreak = 0;
  habit.totalCompleted = 0;
  habit.totalRest = 0;
  habit.history = {};
  habit.notes = [];
  habit.achievements = [];
  saveData();
  renderLobby();
  renderDetailContent(habit.id);
}

function confirmDeleteHabitDirect(id) {
  habits = habits.filter(h => h.id !== id);
  saveData();
  renderLobby();
  closeDetailModal();
}

function confirmDeleteHabitFromDetail() {
  closeHabitMenu();
  if (currentActiveHabitId) confirmDeleteHabitDirect(currentActiveHabitId);
}

function confirmClearAllData() {
  habits = [];
  saveData();
  renderLobby();
}

function toggleHabitMenu(e) {
  e.stopPropagation();
  document.getElementById('habitDropdown').classList.toggle('hidden');
}

function closeHabitMenu() {
  const menu = document.getElementById('habitDropdown');
  if (menu) menu.classList.add('hidden');
}

document.addEventListener('click', closeHabitMenu);
window.addEventListener('DOMContentLoaded', renderLobby);