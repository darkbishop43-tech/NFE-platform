const sections = {
  public: 'Public Website',
  studio: 'NFE Studio',
  os: 'NFE-OS',
  admin: 'Administration'
};

const nfeEngineVersion = 'NFE Engine v0.3';

let caseCount = Number(localStorage.getItem('nfeCaseCount')) || 0;
let caseHistory = JSON.parse(localStorage.getItem('nfeCaseHistory')) || [];

function saveState() {
  localStorage.setItem('nfeCaseCount', String(caseCount));
  localStorage.setItem('nfeCaseHistory', JSON.stringify(caseHistory));
}

function showSection(id) {
  if (id === 'docs') id = 'public';

  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  const targetSection = document.querySelector(`#${id}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  document.querySelectorAll('.nav-btn').forEach(button => {
    button.classList.toggle('active', button.dataset.section === id);
  });

  const sectionTitle = document.querySelector('#section-title');
  if (sectionTitle && sections[id]) {
    sectionTitle.textContent = sections[id];
  }
}

document.querySelectorAll('[data-section]').forEach(button => {
  button.addEventListener('click', () => showSection(button.dataset.section));
});

document.querySelectorAll('[data-section-link]').forEach(button => {
  button.addEventListener('click', () => showSection(button.dataset.sectionLink));
});

const layerNames = [
  ['Layer 0', 'Observation Ledger'],
  ['Layer 1', 'Human Drivers'],
  ['Layer 2', 'Narrative Pressures'],
  ['Layer 3', 'Stakeholder Response'],
  ['Layer 4', 'Decision Path'],
  ['Layer 5', 'Outcome Expectation'],
  ['Layer 6', 'Validation & Refinement'],
  ['Layer 7', 'Adaptive Reasoning / Test-Time Reasoning']
];

const layerOutputs = {
  0: ['Observation Ledger', 'Initial Evidence Inventory', 'Scope Assessment'],
  1: ['Driver Identification', 'Stakeholder Motivations', 'Initial Driver Confidence'],
  2: ['Narrative Pressure Map', 'Competing Narratives', 'Pressure Assessment'],
  3: ['Stakeholder Response Models', 'Behavioral Expectations', 'Response Alternatives'],
  4: ['Decision Path Assessment', 'Decision Alternatives', 'Assumptions'],
  5: ['Expected Outcomes', 'Alternative Outcomes', 'Confidence Estimate'],
  6: ['Validation Summary', 'Remaining Unknowns', 'Confidence Calibration', 'Refinement Recommendations'],
  7: ['Evidence Considered', 'Assumptions Identified', 'Competing Interpretations', 'Rejected Explanations', 'Validation Targets']
};

function getReasoningModeLabel(mode) {
  if (!mode) return 'Deep Pass';

  if (mode.toLowerCase().includes('fast')) return 'Fast Pass';
  if (mode.toLowerCase().includes('benchmark')) return 'Benchmark Pass';
  if (mode.toLowerCase().includes('deep')) return 'Deep Pass';
  if (mode.toLowerCase().includes('layer 7')) return 'Deep Pass';

  return mode;
}

function shouldActivateLayer7(mode, prompt) {
  const selectedMode = getReasoningModeLabel(mode);
  const text = `${mode} ${prompt}`.toLowerCase();

  const triggerTerms = [
    'uncertain',
    'prediction',
    'predict',
    'conflict',
    'contradiction',
    'incomplete',
    'ambiguous',
    'benchmark',
    'validation',
    'high impact',
    'high-impact',
    'stakes',
    'medium confidence',
    'low confidence'
  ];

  return (
    selectedMode === 'Deep Pass' ||
    selectedMode === 'Benchmark Pass' ||
    text.includes('layer 7') ||
    triggerTerms.some(term => text.includes(term))
  );
}

function renderLayers(activeLayer7 = false) {
  const layerContainer = document.querySelector('#layers');
  if (!layerContainer) return;

  layerContainer.innerHTML = layerNames.map(([number, description], index) => {
    const isLayer7 = index === 7;
    const status = isLayer7
      ? activeLayer7 ? 'Triggered' : 'Optional'
      : 'Required';

    return `
      <div class="layer ${isLayer7 ? 'optional' : ''}">
        <strong>${number}</strong>
        <span>${description}</span>
        <em>${status}</em>
      </div>
    `;
  }).join('');
}

function renderHistory() {
  const historyEl = document.querySelector('#caseHistory');
  const metricCases = document.querySelector('#metricCases');

  if (!historyEl) return;

  if (!caseHistory.length) {
    historyEl.innerHTML = '';
  } else {
    historyEl.innerHTML = caseHistory.map(item => `
      <li>
        <strong>${item.id}</strong> — ${item.title}
        <br>
        <small>${item.mode} | ${item.status}</small>
      </li>
    `).join('');
  }

  if (metricCases) {
    metricCases.textContent = `${caseHistory.length} case${caseHistory.length === 1 ? '' : 's'}`;
  }
}

function buildCoreEngineReport(prompt) {
  return {
    layer_0_observation_ledger: {
      purpose: 'Capture observations while separating observable evidence from inference.',
      outputs: layerOutputs[0],
      demo_result: prompt
        ? `Primary claim captured: ${prompt}`
        : 'No claim provided.'
    },
    layer_1_human_drivers: {
      purpose: 'Identify underlying human motivations influencing individuals and groups.',
      outputs: layerOutputs[1],
      demo_result: 'Human drivers require case-specific stakeholder evidence.'
    },
    layer_2_narrative_pressures: {
      purpose: 'Determine competing narratives, incentives, and pressures acting on stakeholders.',
      outputs: layerOutputs[2],
      demo_result: 'Narrative pressures are mapped as competing interpretations.'
    },
    layer_3_stakeholder_response: {
      purpose: 'Evaluate how stakeholders are likely to respond under current conditions.',
      outputs: layerOutputs[3],
      demo_result: 'Stakeholder response remains provisional until evidence is expanded.'
    },
    layer_4_decision_path: {
      purpose: 'Assess likely decision pathways based on evidence, incentives, and stakeholder behavior.',
      outputs: layerOutputs[4],
      demo_result: 'Decision paths are treated as conditional, not certain.'
    },
    layer_5_outcome_expectation: {
      purpose: 'Estimate likely outcomes and identify factors that may alter them.',
      outputs: layerOutputs[5],
      demo_result: 'Outcome expectation is generated with explicit alternatives.'
    },
    layer_6_validation_refinement: {
      purpose: 'Validate conclusions, identify weaknesses, and refine analytical outputs.',
      outputs: layerOutputs[6],
      demo_result: 'Validation requires confidence calibration and remaining unknowns.'
    }
  };
}

function buildLayer7Report(layer7Active, mode) {
  if (!layer7Active) {
    return {
      activated: false,
      classification: 'Optional Adaptive Layer',
      reason: 'Layer 7 was not required for this run.',
      architectural_constraint: 'Layer 7 may not bypass, replace, or reorder Layers 0–6.'
    };
  }

  return {
    activated: true,
    classification: 'Optional Adaptive Layer',
    reason: `${mode} requires additional analytical robustness, confidence calibration, or validation planning.`,
    architectural_constraint: 'Layer 7 operates only after the Core Engine and shall not bypass, replace, or reorder Layers 0–6.',
    allowed_actions: [
      'Request additional analytical passes',
      'Evaluate competing interpretations',
      'Revisit earlier analytical outputs',
      'Recommend further evidence collection'
    ],
    multi_path_reasoning: [
      'Primary Narrative Pressure model',
      'Alternative Narrative Pressure model',
      'Skeptical / Anti-NFE model',
      'Low-confidence explanation',
      'Outlier scenario',
      'Boundary-condition failure scenario'
    ],
    challenge_round: [
      'What assumption could be wrong?',
      'What evidence is missing?',
      'What evidence would reverse the conclusion?',
      'Which stakeholder might behave differently than expected?',
      'Which driver might be overestimated?',
      'Which driver might be underestimated?',
      'Is the framework forcing a pattern onto weak evidence?'
    ],
    outputs: layerOutputs[7]
  };
}

function runDemoAnalysis() {
  const title = document.querySelector('#caseTitle')?.value.trim() || 'Untitled Case';
  const prompt = document.querySelector('#casePrompt')?.value.trim() || 'No claim provided.';
  const selectedMode = document.querySelector('#caseMode')?.value || 'Deep Pass';
  const reasoningMode = getReasoningModeLabel(selectedMode);
  const layer7Active = shouldActivateLayer7(selectedMode, prompt);

  caseCount += 1;
  const id = `NFE-${String(caseCount).padStart(6, '0')}`;
  const timestamp = new Date().toISOString();

  const report = {
    id,
    title,
    engine_version: nfeEngineVersion,
    status: 'Completed',
    timestamp,
    reasoning_mode: reasoningMode,
    architecture: {
      core_engine: 'Layers 0–6 are the mandatory canonical analytical workflow.',
      adaptive_layer: 'Layer 7 is optional and activates only when additional analytical effort is warranted.',
      constraint: 'Layer 7 may supplement the Core Engine but may not bypass, replace, or reorder Layers 0–6.'
    },
    case_input: {
      analysis_objective: title,
      question_or_claim: prompt
    },
    core_nfe_analytical_engine: buildCoreEngineReport(prompt),
    layer_7_adaptive_reasoning: buildLayer7Report(layer7Active, reasoningMode),
    confidence_calibration: layer7Active
      ? {
          baseline: 'Medium',
          refined: 'Medium-High',
          note: 'Demo confidence movement only. Final confidence requires real evidence evaluation.'
        }
      : {
          baseline: 'Medium',
          refined: 'Medium',
          note: 'Layer 7 not activated.'
        },
    final_assessment: layer7Active
      ? 'The Core Engine completed first. Layer 7 then supplemented the analysis with adaptive challenge, multi-path review, and validation planning.'
      : 'The Core Engine completed the analysis without Layer 7 augmentation.',
    validation_targets: [
      'Confirm observation/inference separation',
      'Review stakeholder driver assumptions',
      'Test competing narrative pressure models',
      'Identify evidence that could reverse the conclusion',
      'Record outcome comparison plan if used for benchmark testing'
    ],
    archive_status: {
      archive_health: 'SAFE',
      checkpoint_recommendation: 'Prototype checkpoint ready',
      scrp_alignment: 'Compatible with SCRP v2.0 governance'
    }
  };

  caseHistory.unshift({
    id,
    title,
    mode: reasoningMode,
    status: 'Completed',
    timestamp
  });

  saveState();
  renderHistory();
  renderLayers(layer7Active);

  const evidenceLedger = document.querySelector('#evidenceLedger');
  if (evidenceLedger) {
    evidenceLedger.innerHTML = `
      <li><strong>Claim:</strong> ${prompt}</li>
      <li><strong>Core Engine:</strong> Layers 0–6 completed as mandatory workflow.</li>
      <li><strong>Layer 7:</strong> ${layer7Active ? 'Triggered as optional adaptive reasoning.' : 'Not triggered.'}</li>
      <li><strong>Constraint:</strong> Layer 7 did not bypass, replace, or reorder the Core Engine.</li>
    `;
  }

  const reportOutput = document.querySelector('#reportOutput');
  if (reportOutput) {
    reportOutput.textContent = JSON.stringify(report, null, 2);
  }

  showSection('studio');
}

const runAnalysisButton = document.querySelector('#runAnalysis');
if (runAnalysisButton) {
  runAnalysisButton.addEventListener('click', runDemoAnalysis);
}

const exportButton = document.querySelector('#exportBtn');
if (exportButton) {
  exportButton.addEventListener('click', () => {
    const content = document.querySelector('#reportOutput')?.textContent || '';

    if (!content || content.includes('Run an analysis')) {
      alert('Run an analysis first, then export the report.');
      return;
    }

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `nfe-engine-v0-3-report-${Date.now()}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  });
}

renderLayers(false);
renderHistory();
