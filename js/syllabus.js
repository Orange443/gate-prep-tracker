(function () {
  'use strict';

  const SYLLABUS_DATA = {
    'Probability & Statistics': [
      'Counting (Permutations & Combinations)',
      'Sample Space, Events & Independence',
      'Conditional, Marginal & Joint Probability',
      'Bayes\' Theorem',
      'Random Variables',
      'Conditional Expectation & Variance',
      'Mean, Median, Mode & Standard Deviation',
      'Correlation & Covariance',
      'Discrete Distributions (Uniform, Bernoulli, Binomial, Poisson)',
      'Continuous Distributions (Uniform, Exponential, Normal, t, Chi-squared)',
      'Cumulative Distribution Function',
      'Central Limit Theorem',
      'Confidence Intervals',
      'Hypothesis Testing (z-test, t-test, Chi-squared test)'
    ],
    'Linear Algebra': [
      'Vector Spaces & Subspaces',
      'Linear Dependence & Independence',
      'Matrices (Projection, Orthogonal, Idempotent, Partition)',
      'Quadratic Forms',
      'Systems of Linear Equations',
      'Gaussian Elimination',
      'Eigenvalues & Eigenvectors',
      'Determinant, Rank & Nullity',
      'LU Decomposition',
      'Singular Value Decomposition (SVD)'
    ],
    'Calculus & Optimization': [
      'Functions of Single Variable',
      'Limits & Continuity',
      'Differentiability',
      'Taylor Series',
      'Maxima & Minima',
      'Optimization Techniques'
    ],
    'Programming, DSA': [
      'Python Programming',
      'Stacks & Queues',
      'Linked Lists',
      'Trees',
      'Hash Tables',
      'Linear & Binary Search',
      'Selection, Bubble & Insertion Sort',
      'Merge Sort & Quick Sort',
      'Graph Traversals (BFS, DFS)',
      'Shortest Path Algorithms'
    ],
    'DBMS & Warehousing': [
      'ER Model',
      'Relational Model',
      'Relational Algebra & Tuple Calculus',
      'SQL',
      'Integrity Constraints',
      'Normal Forms (1NF, 2NF, 3NF, BCNF)',
      'File Organization & Indexing',
      'Data Transformation (Normalization, Discretization, Sampling)',
      'Multidimensional Data Models (Star, Snowflake Schema)',
      'Concept Hierarchies & Measures'
    ],
    'Machine Learning': [
      'Linear & Ridge Regression',
      'Logistic Regression',
      'k-Nearest Neighbor (k-NN)',
      'Naive Bayes Classifier',
      'Linear Discriminant Analysis (LDA)',
      'Support Vector Machine (SVM)',
      'Decision Trees',
      'Bias-Variance Tradeoff',
      'Cross-Validation (LOO, k-fold)',
      'Multi-Layer Perceptron & Feed-Forward NN',
      'k-Means & k-Medoid Clustering',
      'Hierarchical Clustering',
      'Principal Component Analysis (PCA)'
    ],
    'Artificial Intelligence': [
      'Uninformed Search (BFS, DFS, DLS, Iterative Deepening)',
      'Informed Search (A*, Heuristics, Admissibility)',
      'Adversarial Search (Minimax, Alpha-Beta Pruning)',
      'Propositional Logic (Syntax, Semantics, Resolution)',
      'Predicate Logic (Quantifiers, Unification, Chaining)',
      'Conditional Independence (Bayesian Networks)',
      'Variable Elimination',
      'Approximate Inference (Sampling)'
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
