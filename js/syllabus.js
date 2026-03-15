(function () {
  'use strict';

  const SYLLABUS_DATA = {
    'Probability & Statistics': [
      'Conditional Probability', 'Bayes Theorem', 'Random Variables',
      'Distributions', 'Central Limit Theorem', 'Hypothesis Testing',
      'Estimation', 'Correlation & Regression'
    ],
    'Linear Algebra': [
      'Vector Spaces', 'Linear Independence', 'Rank',
      'Eigenvalues', 'Eigenvectors', 'SVD',
      'Matrix Decomposition', 'Orthogonality'
    ],
    'Calculus': [
      'Limits & Continuity', 'Differentiation', 'Integration',
      'Partial Derivatives', 'Maxima & Minima', 'Gradient & Hessian',
      'Taylor Series', 'Multivariable Calculus'
    ],
    'Programming & DSA': [
      'Arrays & Strings', 'Linked Lists', 'Trees & Graphs',
      'Sorting & Searching', 'Dynamic Programming', 'Greedy Algorithms',
      'Complexity Analysis', 'Hashing'
    ],
    'Databases': [
      'ER Model', 'Relational Model', 'SQL',
      'Normalization', 'Transactions', 'Indexing',
      'NoSQL Basics'
    ],
    'Machine Learning': [
      'Linear Regression', 'Logistic Regression', 'Decision Trees',
      'SVM', 'Clustering', 'Dimensionality Reduction',
      'Neural Networks', 'Bias-Variance Tradeoff', 'Regularization',
      'Ensemble Methods'
    ],
    'Artificial Intelligence': [
      'Search Algorithms', 'Adversarial Search', 'Knowledge Representation',
      'Logic & Inference', 'Probabilistic Reasoning', 'NLP Basics',
      'Reinforcement Learning'
    ]
  };

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem('syllabusProgress')) || {};
    } catch {
      return {};
    }
  }

  function saveProgress(progress) {
    localStorage.setItem('syllabusProgress', JSON.stringify(progress));
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function updateOverallStats() {
    const progress = loadProgress();
    let total = 0;
    let done = 0;
    for (const subject of Object.keys(SYLLABUS_DATA)) {
      const topics = SYLLABUS_DATA[subject];
      total += topics.length;
      const sp = progress[subject] || {};
      for (const t of topics) { if (sp[t]) done++; }
    }
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById('overallPercent').textContent = percent + '%';
    document.getElementById('topicsCompleted').textContent = done + ' / ' + total;
  }

  function renderSyllabus() {
    const grid = document.getElementById('syllabusGrid');
    const progress = loadProgress();
    grid.innerHTML = '';

    const subjects = Object.keys(SYLLABUS_DATA);
    subjects.forEach((subject, idx) => {
      const topics = SYLLABUS_DATA[subject];
      const sp = progress[subject] || {};
      const doneCount = topics.filter(t => sp[t]).length;
      const percent = Math.round((doneCount / topics.length) * 100);

      const card = document.createElement('div');
      card.className = 'subject-card animate-in';
      card.style.animationDelay = (idx * 60) + 'ms';

      let topicsHTML = '';
      topics.forEach(topic => {
        const checked = sp[topic] ? 'checked' : '';
        const id = 'chk-' + subject.replace(/\W/g, '') + '-' + topic.replace(/\W/g, '');
        topicsHTML += `
          <li class="topic-item">
            <input type="checkbox" id="${id}" ${checked}
              data-subject="${subject}" data-topic="${topic}">
            <label class="topic-label" for="${id}">${topic}</label>
          </li>`;
      });

      card.innerHTML = `
        <div class="subject-header">
          <span class="subject-name">${subject}</span>
          <span class="subject-progress-text">${percent}%</span>
        </div>
        <div class="subject-progress-bar progress-bar-container">
          <div class="progress-bar-fill" style="width: ${percent}%"></div>
        </div>
        <ul class="topic-list">${topicsHTML}</ul>
      `;

      grid.appendChild(card);
    });

    grid.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', function () {
        const progress = loadProgress();
        const subject = this.dataset.subject;
        const topic = this.dataset.topic;
        if (!progress[subject]) progress[subject] = {};
        progress[subject][topic] = this.checked;
        saveProgress(progress);
        updateCardProgress(this.closest('.subject-card'), subject);
        updateOverallStats();
        showToast(this.checked ? 'Topic completed!' : 'Topic unchecked');
      });
    });
  }

  function updateCardProgress(card, subject) {
    const progress = loadProgress();
    const topics = SYLLABUS_DATA[subject];
    const sp = progress[subject] || {};
    const doneCount = topics.filter(t => sp[t]).length;
    const percent = Math.round((doneCount / topics.length) * 100);
    card.querySelector('.subject-progress-text').textContent = percent + '%';
    card.querySelector('.progress-bar-fill').style.width = percent + '%';
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderSyllabus();
    updateOverallStats();
  });
})();
