const sections = { public: 'Public Website', studio: 'NFE Studio', os: 'NFE-OS', admin: 'Administration' };
let caseCount = 0;

function showSection(id) {
  if (id === 'docs') id = 'public';
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelector(`#${id}`).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === id));
  document.querySelector('#section-title').textContent = sections[id];
}

document.querySelectorAll('[data-section]').forEach(btn => btn.addEventListener('click', () => showSection(btn.dataset.section)));
document.querySelectorAll('[data-section-link]').forEach(btn => btn.addEventListener('click', () => showSection(btn.dataset.sectionLink)));

const layerNames = [
  ['Layer 0', 'Problem Intake'],
  ['Layer 1', 'Context Framing'],
  ['Layer 2', 'Evidence Mapping'],
  ['Layer 3', 'Narrative / Causal Modeling'],
  ['Layer 4', 'Contradiction + Belief Gap Review'],
  ['Layer 5', 'Synthesis'],
  ['Layer 6', 'Output + Trace'],
  ['Layer 7', 'Optional Adaptive Reasoning']
];

document.querySelector('#layers').innerHTML = layerNames.map(([n, d], i) => `<div class="layer ${i===7?'optional':''}"><strong>${n}</strong><span>${d}</span></div>`).join('');

function runDemoAnalysis() {
  const title = document.querySelector('#caseTitle').value.trim() || 'Untitled Case';
  const prompt = document.querySelector('#casePrompt').value.trim();
  const mode = document.querySelector('#caseMode').value;
  caseCount += 1;
  const report = {
    id: `NFE-${String(caseCount).padStart(6, '0')}`,
    title,
    mode,
    core_engine: 'Layers 0–6 completed first',
    layer_7: mode.includes('Layer 7') ? 'Invoked as optional augmentation' : 'Not invoked',
    confidence: mode.includes('Layer 7') ? '0.48 → 0.59 demo movement' : '0.48 baseline',
    conclusion: 'Layer 7 may supplement but not replace, bypass, or reorder the Core Engine.',
    validation_plan: ['Preserve Core trace', 'Record trigger signals', 'Store augmentation report', 'Archive checkpoint']
  };

  document.querySelector('#caseHistory').insertAdjacentHTML('afterbegin', `<li><strong>${report.id}</strong> — ${title}</li>`);
  document.querySelector('#evidenceLedger').insertAdjacentHTML('afterbegin', `<li>Claim reviewed: ${prompt.slice(0, 90)}${prompt.length > 90 ? '…' : ''}</li>`);
  document.querySelector('#reportOutput').textContent = JSON.stringify(report, null, 2);
  document.querySelector('#metricCases').textContent = `${caseCount} case${caseCount === 1 ? '' : 's'}`;
  showSection('studio');
}

document.querySelector('#runAnalysis').addEventListener('click', runDemoAnalysis);
document.querySelector('#exportBtn').addEventListener('click', () => {
  const content = document.querySelector('#reportOutput').textContent;
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nfe-demo-report.json';
  a.click();
  URL.revokeObjectURL(url);
});
