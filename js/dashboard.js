(function () {
  'use strict';

  const QUOTES = [
    '"The only way to do great work is to love what you do." — Steve Jobs',
    '"It does not matter how slowly you go as long as you do not stop." — Confucius',
    '"Success is the sum of small efforts, repeated day in and day out." — Robert Collier',
    '"The expert in anything was once a beginner." — Helen Hayes',
    '"Believe you can and you\'re halfway there." — Theodore Roosevelt',
    '"Hard work beats talent when talent doesn\'t work hard." — Tim Notke',
    '"Discipline is the bridge between goals and accomplishment." — Jim Rohn',
    '"Don\'t watch the clock; do what it does. Keep going." — Sam Levenson',
    '"The secret of getting ahead is getting started." — Mark Twain',
    '"Every master was once a disaster." — T. Harv Eker',
    '"Consistency is the mother of mastery." — Robin Sharma',
    '"What we fear doing most is usually what we most need to do." — Tim Ferriss'
  ];

  function loadData(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  function loadSyllabusProgress() {
    try {
      return JSON.parse(localStorage.getItem('syllabusProgress')) || {};
    } catch {
      return {};
    }
  }

  function getWeekKey(dateStr) {
    const d = new Date(dateStr);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d - jan1) / 86400000);
    const week = Math.ceil((days + jan1.getDay() + 1) / 7);
    return d.getFullYear() + '-W' + String(week).padStart(2, '0');
  }

  function isThisWeek(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    return d >= startOfWeek && d < endOfWeek;
  }

  function calculateStreak(logs) {
    if (!logs.length) return 0;
    const uniqueDates = [...new Set(logs.map(l => l.date))].sort().reverse();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) return 0;

    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const current = new Date(uniqueDates[i - 1]);
      const prev = new Date(uniqueDates[i]);
      const diff = (current - prev) / 86400000;
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

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

  function calculateSyllabusCompletion() {
    const progress = loadSyllabusProgress();
    let total = 0;
    let done = 0;
    for (const subject of Object.keys(SYLLABUS_DATA)) {
      const topics = SYLLABUS_DATA[subject];
      total += topics.length;
      const subjectProgress = progress[subject] || {};
      for (const topic of topics) {
        if (subjectProgress[topic]) done++;
      }
    }
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  function getSubjectProgress() {
    const progress = loadSyllabusProgress();
    const result = {};
    for (const subject of Object.keys(SYLLABUS_DATA)) {
      const topics = SYLLABUS_DATA[subject];
      const subjectProg = progress[subject] || {};
      let done = 0;
      for (const t of topics) { if (subjectProg[t]) done++; }
      result[subject] = Math.round((done / topics.length) * 100);
    }
    return result;
  }

  function updateDashboard() {
    const studyLogs = loadData('studyLogs');
    const problemLogs = loadData('problemLogs');
    const mockTests = loadData('mockTests');

    const totalHours = studyLogs.reduce((s, l) => s + Number(l.hours || 0), 0);
    const totalProblems = problemLogs.reduce((s, l) => s + Number(l.count || 0), 0);
    const syllabusPercent = calculateSyllabusCompletion();

    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
    document.getElementById('totalProblems').textContent = totalProblems;
    document.getElementById('totalMocks').textContent = mockTests.length;
    document.getElementById('syllabusPercent').textContent = syllabusPercent + '%';

    const weeklyStudy = studyLogs.filter(l => isThisWeek(l.date));
    const weeklyProb = problemLogs.filter(l => isThisWeek(l.date));
    const weeklyMock = mockTests.filter(l => isThisWeek(l.date));

    document.getElementById('weeklyHours').textContent =
      weeklyStudy.reduce((s, l) => s + Number(l.hours || 0), 0).toFixed(1);
    document.getElementById('weeklyProblems').textContent =
      weeklyProb.reduce((s, l) => s + Number(l.count || 0), 0);
    document.getElementById('weeklyMocks').textContent = weeklyMock.length;

    if (weeklyMock.length > 0) {
      const avg = weeklyMock.reduce((s, m) => s + Number(m.score), 0) / weeklyMock.length;
      document.getElementById('weeklyAvgScore').textContent = avg.toFixed(1);
    }

    const streak = calculateStreak(studyLogs);
    document.getElementById('streakCount').textContent =
      streak + ' day streak';

    const quoteEl = document.getElementById('quoteText');
    quoteEl.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    renderProblemsChart(problemLogs);
    renderMocksChart(mockTests);
    renderSubjectChart();
  }

  let problemsChartInstance = null;
  let mocksChartInstance = null;
  let subjectChartInstance = null;

  function renderProblemsChart(logs) {
    const canvas = document.getElementById('problemsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const weekMap = {};
    logs.forEach(l => {
      const wk = getWeekKey(l.date);
      weekMap[wk] = (weekMap[wk] || 0) + Number(l.count || 0);
    });

    const sortedWeeks = Object.keys(weekMap).sort().slice(-8);
    const labels = sortedWeeks.map(w => w);
    const data = sortedWeeks.map(w => weekMap[w]);

    if (problemsChartInstance) problemsChartInstance.destroy();
    problemsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Problems',
          data: data,
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
        plugins: {
          legend: { display: false },
        },
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

  function renderMocksChart(tests) {
    const canvas = document.getElementById('mocksChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sorted = [...tests].sort((a, b) => a.date.localeCompare(b.date));
    const labels = sorted.map(t => t.name || t.date);
    const data = sorted.map(t => Number(t.score));

    if (mocksChartInstance) mocksChartInstance.destroy();
    mocksChartInstance = new Chart(ctx, {
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
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
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
            ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } }
          }
        }
      }
    });
  }

  function renderSubjectChart() {
    const canvas = document.getElementById('subjectChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const progress = getSubjectProgress();
    const labels = Object.keys(progress);
    const data = Object.values(progress);

    const colors = [
      '#38bdf8', '#34d399', '#fbbf24', '#f87171',
      '#a78bfa', '#fb923c', '#818cf8'
    ];

    if (subjectChartInstance) subjectChartInstance.destroy();
    subjectChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.map(l => l.length > 18 ? l.slice(0, 16) + '...' : l),
        datasets: [{
          label: 'Completion %',
          data: data,
          backgroundColor: colors.map(c => c + '99'),
          borderColor: colors,
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 50
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(51,65,85,0.5)' },
            ticks: {
              color: '#94a3b8',
              font: { family: 'JetBrains Mono', size: 11 },
              callback: function (v) { return v + '%'; }
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 12 } }
          }
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', updateDashboard);
})();
