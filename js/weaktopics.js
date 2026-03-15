(function () {
  'use strict';

  function loadData() {
    try {
      return JSON.parse(localStorage.getItem('weakTopics')) || [];
    } catch {
      return [];
    }
  }

  function saveData(topics) {
    localStorage.setItem('weakTopics', JSON.stringify(topics));
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function updateStats() {
    const topics = loadData();
    document.getElementById('totalEntries').textContent = topics.length;
    const subjects = new Set(topics.map(t => t.subject));
    document.getElementById('subjectsAffected').textContent = subjects.size;
  }

  function renderList() {
    const topics = loadData();
    const list = document.getElementById('mistakeList');
    const emptyState = document.getElementById('emptyState');

    if (topics.length === 0) {
      list.innerHTML = '';
      list.appendChild(emptyState);
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    const sorted = [...topics].sort((a, b) => b.date.localeCompare(a.date));

    list.innerHTML = sorted.map((t, i) => `
      <div class="mistake-card animate-in" style="animation-delay: ${i * 40}ms">
        <div class="mistake-header">
          <div>
            <span class="mistake-topic">${escapeHTML(t.topic)}</span>
            <span class="mistake-subject"> &mdash; ${escapeHTML(t.subject)}</span>
          </div>
          <button class="btn btn-danger btn-sm" onclick="deleteWeakTopic(${i})">Delete</button>
        </div>
        <div class="mistake-body">
          <p><strong>Mistake:</strong> ${escapeHTML(t.mistake)}</p>
          <p><strong>Correct Concept:</strong> ${escapeHTML(t.correct)}</p>
        </div>
        <div class="mistake-date">${escapeHTML(t.date)}</div>
      </div>
    `).join('');
  }

  window.deleteWeakTopic = function (idx) {
    const topics = loadData();
    const sorted = [...topics].sort((a, b) => b.date.localeCompare(a.date));
    const toDelete = sorted[idx];
    const actualIdx = topics.findIndex(t =>
      t.date === toDelete.date && t.topic === toDelete.topic &&
      t.subject === toDelete.subject && t.mistake === toDelete.mistake
    );
    if (actualIdx !== -1) {
      topics.splice(actualIdx, 1);
      saveData(topics);
      renderList();
      updateStats();
      showToast('Entry deleted');
    }
  };

  function addWeakTopic(e) {
    e.preventDefault();
    const topic = document.getElementById('weakTopic').value.trim();
    const subject = document.getElementById('weakSubject').value;
    const date = document.getElementById('weakDate').value;
    const mistake = document.getElementById('weakMistake').value.trim();
    const correct = document.getElementById('weakCorrect').value.trim();

    if (!topic || !subject || !date || !mistake || !correct) return;

    const topics = loadData();
    topics.push({ topic, subject, date, mistake, correct });
    saveData(topics);

    e.target.reset();
    document.getElementById('weakDate').value = new Date().toISOString().split('T')[0];

    renderList();
    updateStats();
    showToast('Weak topic added!');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('weakDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('weakForm').addEventListener('submit', addWeakTopic);
    renderList();
    updateStats();
  });
})();
