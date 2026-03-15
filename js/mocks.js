(function () {
  'use strict';

  function loadData() {
    try {
      return JSON.parse(localStorage.getItem('mockTests')) || [];
    } catch {
      return [];
    }
  }

  function saveData(tests) {
    localStorage.setItem('mockTests', JSON.stringify(tests));
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function updateStats() {
    const tests = loadData();
    document.getElementById('testsTaken').textContent = tests.length;

    if (tests.length > 0) {
      const scores = tests.map(t => Number(t.score));
      const best = Math.max(...scores);
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      document.getElementById('bestScore').textContent = best.toFixed(1);
      document.getElementById('avgScore').textContent = avg.toFixed(1);
    } else {
      document.getElementById('bestScore').textContent = '--';
      document.getElementById('avgScore').textContent = '--';
    }
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderTable() {
    const tests = loadData();
    const tbody = document.getElementById('mockTableBody');
    const emptyState = document.getElementById('emptyState');

    if (tests.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    const sorted = [...tests].sort((a, b) => b.date.localeCompare(a.date));

    tbody.innerHTML = sorted.map((t, i) => `
      <tr>
        <td>${escapeHTML(t.date)}</td>
        <td>${escapeHTML(t.name)}</td>
        <td style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">${t.score}</td>
        <td>${escapeHTML(t.rank || '—')}</td>
        <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(t.weakAreas || '—')}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteMock(${i})">Delete</button></td>
      </tr>
    `).join('');
  }

  window.deleteMock = function (idx) {
    const tests = loadData();
    const sorted = [...tests].sort((a, b) => b.date.localeCompare(a.date));
    const toDelete = sorted[idx];
    const actualIdx = tests.findIndex(t =>
      t.date === toDelete.date && t.name === toDelete.name && t.score === toDelete.score
    );
    if (actualIdx !== -1) {
      tests.splice(actualIdx, 1);
      saveData(tests);
      renderTable();
      updateStats();
      renderScoreChart();
      showToast('Mock test deleted');
    }
  };

  let scoreChartInst = null;

  function renderScoreChart() {
    const tests = loadData();
    const ctx = document.getElementById('scoreChart');
    if (!ctx) return;

    const sorted = [...tests].sort((a, b) => a.date.localeCompare(b.date));
    const labels = sorted.map(t => t.name || t.date);
    const data = sorted.map(t => Number(t.score));

    if (scoreChartInst) scoreChartInst.destroy();
    scoreChartInst = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Score',
          data: data,
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#34d399',
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 2.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(51,65,85,0.5)' },
            ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 }, maxRotation: 45 }
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(51,65,85,0.5)' },
            ticks: {
              color: '#94a3b8',
              font: { family: 'JetBrains Mono', size: 11 },
              callback: function (v) { return v + '%'; }
            }
          }
        }
      }
    });
  }

  function addMockTest(e) {
    e.preventDefault();
    const date = document.getElementById('mockDate').value;
    const name = document.getElementById('mockName').value.trim();
    const score = parseFloat(document.getElementById('mockScore').value);
    const rank = document.getElementById('mockRank').value.trim();
    const weakAreas = document.getElementById('mockWeak').value.trim();

    if (!date || !name || isNaN(score)) return;

    const tests = loadData();
    tests.push({ date, name, score, rank, weakAreas });
    saveData(tests);

    e.target.reset();
    document.getElementById('mockDate').value = new Date().toISOString().split('T')[0];

    renderTable();
    updateStats();
    renderScoreChart();
    showToast('Mock test recorded!');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('mockDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('mockForm').addEventListener('submit', addMockTest);
    renderTable();
    updateStats();
    renderScoreChart();
  });
})();
