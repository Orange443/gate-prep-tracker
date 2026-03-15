(function () {
  'use strict';

  function loadData() {
    try {
      return JSON.parse(localStorage.getItem('problemLogs')) || [];
    } catch {
      return [];
    }
  }

  function saveData(logs) {
    localStorage.setItem('problemLogs', JSON.stringify(logs));
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function getWeekKey(dateStr) {
    const d = new Date(dateStr);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d - jan1) / 86400000);
    const week = Math.ceil((days + jan1.getDay() + 1) / 7);
    return d.getFullYear() + '-W' + String(week).padStart(2, '0');
  }

  function updateStats() {
    const logs = loadData();
    const total = logs.reduce((s, l) => s + Number(l.count || 0), 0);
    const easy = logs.filter(l => l.difficulty === 'Easy').reduce((s, l) => s + Number(l.count), 0);
    const medium = logs.filter(l => l.difficulty === 'Medium').reduce((s, l) => s + Number(l.count), 0);
    const hard = logs.filter(l => l.difficulty === 'Hard').reduce((s, l) => s + Number(l.count), 0);

    document.getElementById('totalSolved').textContent = total;
    document.getElementById('totalEasy').textContent = easy;
    document.getElementById('totalMedium').textContent = medium;
    document.getElementById('totalHard').textContent = hard;
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function difficultyBadge(diff) {
    const cls = diff === 'Easy' ? 'badge-easy' : diff === 'Medium' ? 'badge-medium' : 'badge-hard';
    return '<span class="badge ' + cls + '">' + diff + '</span>';
  }

  function renderTable() {
    const logs = loadData();
    const tbody = document.getElementById('probTableBody');
    const emptyState = document.getElementById('emptyState');

    if (logs.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));

    tbody.innerHTML = sorted.map((log, i) => `
      <tr>
        <td>${escapeHTML(log.date)}</td>
        <td>${escapeHTML(log.subject)}</td>
        <td style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">${log.count}</td>
        <td>${difficultyBadge(log.difficulty)}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteProblem(${i})">Delete</button></td>
      </tr>
    `).join('');
  }

  window.deleteProblem = function (idx) {
    const logs = loadData();
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const toDelete = sorted[idx];
    const actualIdx = logs.findIndex(l =>
      l.date === toDelete.date && l.subject === toDelete.subject &&
      l.count === toDelete.count && l.difficulty === toDelete.difficulty
    );
    if (actualIdx !== -1) {
      logs.splice(actualIdx, 1);
      saveData(logs);
      renderTable();
      updateStats();
      renderCharts();
      showToast('Entry deleted');
    }
  };

  let subjectChartInst = null;
  let weeklyChartInst = null;

  function renderCharts() {
    const logs = loadData();

    // Subject chart (doughnut)
    const subjectMap = {};
    logs.forEach(l => {
      subjectMap[l.subject] = (subjectMap[l.subject] || 0) + Number(l.count);
    });

    const subjects = Object.keys(subjectMap);
    const subjectData = Object.values(subjectMap);
    const colors = ['#38bdf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb923c', '#818cf8'];

    const subjectCtx = document.getElementById('subjectProbChart');
    if (subjectCtx) {
      if (subjectChartInst) subjectChartInst.destroy();
      subjectChartInst = new Chart(subjectCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: subjects,
          datasets: [{
            data: subjectData,
            backgroundColor: colors.slice(0, subjects.length),
            borderColor: '#1e293b',
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94a3b8', font: { size: 12 }, padding: 12 }
            }
          }
        }
      });
    }

    // Weekly chart (bar)
    const weekMap = {};
    logs.forEach(l => {
      const wk = getWeekKey(l.date);
      weekMap[wk] = (weekMap[wk] || 0) + Number(l.count);
    });

    const sortedWeeks = Object.keys(weekMap).sort().slice(-8);
    const weekLabels = sortedWeeks;
    const weekData = sortedWeeks.map(w => weekMap[w]);

    const weekCtx = document.getElementById('weeklyProbChart');
    if (weekCtx) {
      if (weeklyChartInst) weeklyChartInst.destroy();
      weeklyChartInst = new Chart(weekCtx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: weekLabels,
          datasets: [{
            label: 'Problems',
            data: weekData,
            backgroundColor: 'rgba(56, 189, 248, 0.6)',
            borderColor: '#38bdf8',
            borderWidth: 1,
            borderRadius: 6,
            maxBarThickness: 40
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: 'rgba(51,65,85,0.5)' },
              ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } }
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(51,65,85,0.5)' },
              ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } }
            }
          }
        }
      });
    }
  }

  function addProblemLog(e) {
    e.preventDefault();
    const date = document.getElementById('probDate').value;
    const subject = document.getElementById('probSubject').value;
    const count = parseInt(document.getElementById('probCount').value, 10);
    const difficulty = document.getElementById('probDifficulty').value;

    if (!date || !subject || isNaN(count) || !difficulty) return;

    const logs = loadData();
    logs.push({ date, subject, count, difficulty });
    saveData(logs);

    e.target.reset();
    document.getElementById('probDate').value = new Date().toISOString().split('T')[0];

    renderTable();
    updateStats();
    renderCharts();
    showToast('Problems logged!');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('probDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('problemForm').addEventListener('submit', addProblemLog);
    renderTable();
    updateStats();
    renderCharts();
  });
})();
