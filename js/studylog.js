(function () {
  'use strict';

  function loadData() {
    try {
      return JSON.parse(localStorage.getItem('studyLogs')) || [];
    } catch {
      return [];
    }
  }

  function saveData(logs) {
    localStorage.setItem('studyLogs', JSON.stringify(logs));
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function updateStats() {
    const logs = loadData();
    const totalHours = logs.reduce((s, l) => s + Number(l.hours || 0), 0);
    const totalProblems = logs.reduce((s, l) => s + Number(l.problems || 0), 0);
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
    document.getElementById('totalProblems').textContent = totalProblems;
    document.getElementById('totalSessions').textContent = logs.length;
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderTable() {
    const logs = loadData();
    const tbody = document.getElementById('logTableBody');
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
        <td style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">${log.hours}h</td>
        <td style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">${log.problems}</td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(log.notes || '—')}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteLog(${i})">Delete</button></td>
      </tr>
    `).join('');
  }

  window.deleteLog = function (originalIndex) {
    const logs = loadData();
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const toDelete = sorted[originalIndex];
    const actualIndex = logs.findIndex(l =>
      l.date === toDelete.date && l.subject === toDelete.subject &&
      l.hours === toDelete.hours && l.notes === toDelete.notes
    );
    if (actualIndex !== -1) {
      logs.splice(actualIndex, 1);
      saveData(logs);
      renderTable();
      updateStats();
      showToast('Entry deleted');
    }
  };

  function addStudyLog(e) {
    e.preventDefault();
    const date = document.getElementById('logDate').value;
    const subject = document.getElementById('logSubject').value;
    const hours = parseFloat(document.getElementById('logHours').value);
    const problems = parseInt(document.getElementById('logProblems').value, 10);
    const notes = document.getElementById('logNotes').value.trim();

    if (!date || !subject || isNaN(hours) || isNaN(problems)) return;

    const logs = loadData();
    logs.push({ date, subject, hours, problems, notes });
    saveData(logs);

    e.target.reset();
    document.getElementById('logDate').value = new Date().toISOString().split('T')[0];

    renderTable();
    updateStats();
    showToast('Study session logged!');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('logDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('studyForm').addEventListener('submit', addStudyLog);
    renderTable();
    updateStats();
  });
})();
