(function () {
  'use strict';

  let PLAN = null;
  let currentWeekIndex = 0;

  function loadJSON(cb) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'gate_plan.json', true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        PLAN = JSON.parse(xhr.responseText);
        cb();
      }
    };
    xhr.send();
  }

  function loadLS(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  }

  function loadPlannerState() {
    try { return JSON.parse(localStorage.getItem('plannerState')) || {}; }
    catch { return {}; }
  }

  function savePlannerState(state) {
    localStorage.setItem('plannerState', JSON.stringify(state));
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  function getAllWeeks() {
    if (!PLAN) return [];
    const weeks = [];
    PLAN.phases.forEach(phase => {
      phase.weeks.forEach(w => {
        weeks.push({ ...w, phase: phase.phase });
      });
    });
    return weeks;
  }

  function getWeekData(idx) {
    const weeks = getAllWeeks();
    return weeks[idx] || null;
  }

  function getDayName() {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  }

  function getWeekDateRange(weekIndex) {
    const state = loadPlannerState();
    const startDate = state.startDate ? new Date(state.startDate) : new Date();
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (weekIndex * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return { start: weekStart, end: weekEnd };
  }

  function isCurrentWeekByDate(weekIndex) {
    const range = getWeekDateRange(weekIndex);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now >= range.start && now <= range.end;
  }

  function detectCurrentWeek() {
    const state = loadPlannerState();
    if (state.currentWeek !== undefined) return state.currentWeek;

    const weeks = getAllWeeks();
    for (let i = 0; i < weeks.length; i++) {
      if (isCurrentWeekByDate(i)) return i;
    }

    const completedWeeks = state.completedWeeks || [];
    for (let i = 0; i < weeks.length; i++) {
      if (!completedWeeks.includes(i)) return i;
    }
    return 0;
  }

  function getWeekProblemsFromLogs(weekIndex) {
    const range = getWeekDateRange(weekIndex);
    const logs = loadLS('problemLogs');
    let total = 0;
    logs.forEach(l => {
      const d = new Date(l.date);
      if (d >= range.start && d <= range.end) {
        total += Number(l.count || 0);
      }
    });
    return total;
  }

  function getWeekHoursFromLogs(weekIndex) {
    const range = getWeekDateRange(weekIndex);
    const logs = loadLS('studyLogs');
    let total = 0;
    logs.forEach(l => {
      const d = new Date(l.date);
      if (d >= range.start && d <= range.end) {
        total += Number(l.hours || 0);
      }
    });
    return total;
  }

  function renderWeek() {
    const week = getWeekData(currentWeekIndex);
    if (!week) return;

    const state = loadPlannerState();
    const completedWeeks = state.completedWeeks || [];
    const topicStates = state.topicStates || {};
    const weekKey = 'week-' + week.week;
    const weekTopics = topicStates[weekKey] || {};
    const isCompleted = completedWeeks.includes(currentWeekIndex);

    document.getElementById('phaseLabel').textContent = week.phase;
    document.getElementById('weekLabel').textContent = 'Week ' + week.week + ' — ' + week.focus;

    document.getElementById('currentWeekNum').textContent = week.week;
    document.getElementById('focusWeekBadge').textContent = 'Week ' + week.week;
    document.getElementById('focusTitle').textContent = week.focus;

    const statusEl = document.getElementById('focusStatus');
    if (isCompleted) {
      statusEl.textContent = 'Completed';
      statusEl.className = 'planner-focus-status status-done';
    } else {
      statusEl.textContent = 'In Progress';
      statusEl.className = 'planner-focus-status status-active';
    }

    const weekHours = getWeekHoursFromLogs(currentWeekIndex);
    const weekProbs = getWeekProblemsFromLogs(currentWeekIndex);
    const hourTarget = PLAN.daily_study_target_hours * 7;

    document.getElementById('weekHoursDone').textContent = weekHours.toFixed(1);
    document.getElementById('weekProbsDone').textContent = weekProbs;
    document.getElementById('weekProbsTarget').textContent = week.problem_target;

    const topicsTotal = week.topics.length;
    let topicsDone = 0;
    week.topics.forEach(t => { if (weekTopics[t]) topicsDone++; });

    document.getElementById('weekTopicsDone').textContent = topicsDone;
    document.getElementById('weekTopicsTotal').textContent = topicsTotal;

    const topicPct = topicsTotal > 0 ? Math.round((topicsDone / topicsTotal) * 100) : 0;
    const probPct = week.problem_target > 0 ? Math.min(100, Math.round((weekProbs / week.problem_target) * 100)) : 0;
    const weekPct = Math.round((topicPct + probPct) / 2);

    document.getElementById('weekCompletionPct').textContent = weekPct + '%';
    document.getElementById('weekCompletionBar').style.width = weekPct + '%';
    document.getElementById('probCompletionPct').textContent = probPct + '%';
    document.getElementById('probCompletionBar').style.width = probPct + '%';

    renderTopicChecklist(week, weekTopics, weekKey);
    renderDailyPlan(week);
    renderTimeline();

    const markBtn = document.getElementById('markCompleteBtn');
    if (isCompleted) {
      markBtn.textContent = 'Week Completed';
      markBtn.disabled = true;
      markBtn.style.opacity = '0.5';
    } else {
      markBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Mark Week Complete';
      markBtn.disabled = false;
      markBtn.style.opacity = '1';
    }

    document.getElementById('prevWeek').disabled = currentWeekIndex === 0;
    document.getElementById('nextWeek').disabled = currentWeekIndex >= getAllWeeks().length - 1;
  }

  function renderTopicChecklist(week, weekTopics, weekKey) {
    const list = document.getElementById('topicChecklist');
    list.innerHTML = week.topics.map((topic, i) => {
      const checked = weekTopics[topic] ? 'checked' : '';
      const id = 'ptopic-' + i;
      return `
        <li class="planner-topic-item">
          <input type="checkbox" id="${id}" ${checked} data-topic="${topic}" data-week-key="${weekKey}">
          <label for="${id}">${topic}</label>
        </li>`;
    }).join('');

    list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', function () {
        const state = loadPlannerState();
        if (!state.topicStates) state.topicStates = {};
        const wk = this.dataset.weekKey;
        if (!state.topicStates[wk]) state.topicStates[wk] = {};
        state.topicStates[wk][this.dataset.topic] = this.checked;
        savePlannerState(state);
        renderWeek();
      });
    });
  }

  function renderDailyPlan(week) {
    const container = document.getElementById('dailyPlanList');
    const today = getDayName();
    document.getElementById('todayBadge').textContent = 'Today: ' + today;

    if (!week.daily_plan || !week.daily_plan.length) {
      container.innerHTML = '<div class="empty-state"><p>No daily plan configured for this week.</p></div>';
      return;
    }

    container.innerHTML = week.daily_plan.map(day => {
      const isToday = day.day === today;
      return `
        <div class="planner-day ${isToday ? 'planner-day-today' : ''}">
          <div class="planner-day-label ${isToday ? 'today-highlight' : ''}">${day.day}${isToday ? ' (TODAY)' : ''}</div>
          <div class="planner-day-blocks">
            ${day.blocks.map(b => `<div class="planner-block">${b}</div>`).join('')}
          </div>
        </div>`;
    }).join('');
  }

  function renderTimeline() {
    const strip = document.getElementById('timelineStrip');
    const weeks = getAllWeeks();
    const state = loadPlannerState();
    const completed = state.completedWeeks || [];

    strip.innerHTML = weeks.map((w, i) => {
      let cls = 'timeline-week';
      if (completed.includes(i)) cls += ' tl-done';
      else if (i === currentWeekIndex) cls += ' tl-current';
      return `<button class="btn ${cls}" data-idx="${i}" title="Week ${w.week}: ${w.focus}">
        <span class="tl-num">${w.week}</span>
        <span class="tl-label">${w.focus.length > 14 ? w.focus.slice(0, 12) + '..' : w.focus}</span>
      </button>`;
    }).join('');

    strip.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', function () {
        currentWeekIndex = parseInt(this.dataset.idx, 10);
        renderWeek();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function initPlanner() {
    loadJSON(function () {
      const state = loadPlannerState();
      if (!state.startDate) {
        state.startDate = new Date().toISOString().split('T')[0];
        savePlannerState(state);
      }

      currentWeekIndex = detectCurrentWeek();
      renderWeek();

      document.getElementById('prevWeek').addEventListener('click', function () {
        if (currentWeekIndex > 0) { currentWeekIndex--; renderWeek(); }
      });

      document.getElementById('nextWeek').addEventListener('click', function () {
        if (currentWeekIndex < getAllWeeks().length - 1) { currentWeekIndex++; renderWeek(); }
      });

      document.getElementById('markCompleteBtn').addEventListener('click', function () {
        const state = loadPlannerState();
        if (!state.completedWeeks) state.completedWeeks = [];
        if (!state.completedWeeks.includes(currentWeekIndex)) {
          state.completedWeeks.push(currentWeekIndex);

          if (currentWeekIndex < getAllWeeks().length - 1) {
            state.currentWeek = currentWeekIndex + 1;
          }
          savePlannerState(state);
          showToast('Week ' + getWeekData(currentWeekIndex).week + ' completed! Moving to next week.');

          if (currentWeekIndex < getAllWeeks().length - 1) {
            currentWeekIndex++;
          }
          renderWeek();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initPlanner);
})();
