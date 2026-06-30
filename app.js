import { runNFE } from "./nfeEngine.js";

const sections = {
  public: "Public Website",
  studio: "NFE Studio",
  os: "NFE-OS",
  admin: "Administration"
};

const nfeEngineVersion = "NFE Engine v0.3";

let caseCount = Number(localStorage.getItem("nfeCaseCount")) || 0;
let caseHistory = JSON.parse(localStorage.getItem("nfeCaseHistory")) || [];

function saveState() {
  localStorage.setItem("nfeCaseCount", String(caseCount));
  localStorage.setItem("nfeCaseHistory", JSON.stringify(caseHistory));
}

function showSection(id) {
  if (id === "docs") id = "public";

  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  const targetSection = document.querySelector(`#${id}`);
  if (targetSection) targetSection.classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.section === id);
  });

  const sectionTitle = document.querySelector("#section-title");
  if (sectionTitle && sections[id]) sectionTitle.textContent = sections[id];
}

document.querySelectorAll("[data-section]").forEach(button => {
  button.addEventListener("click", () => showSection(button.dataset.section));
});

document.querySelectorAll("[data-section-link]").forEach(button => {
  button.addEventListener("click", () => showSection(button.dataset.sectionLink));
});

const layerNames = [
  ["Layer 0", "Observation Ledger"],
  ["Layer 1", "Human Drivers"],
  ["Layer 2", "Narrative Pressures"],
  ["Layer 3", "Stakeholder Response"],
  ["Layer 4", "Decision Path"],
  ["Layer 5", "Outcome Expectation"],
  ["Layer 6", "Validation & Refinement"],
  ["Layer 7", "Adaptive Reasoning / Test-Time Reasoning"]
];

function renderLayers(activeLayer7 = false) {
  const layerContainer = document.querySelector("#layers");
  if (!layerContainer) return;

  layerContainer.innerHTML = layerNames.map(([number, description], index) => {
    const isLayer7 = index === 7;
    const status = isLayer7 ? (activeLayer7 ? "Triggered" : "Optional") : "Required";

    return `
      <div class="layer ${isLayer7 ? "optional" : ""}">
        <strong>${number}</strong>
        <span>${description}</span>
        <em>${status}</em>
      </div>
    `;
  }).join("");
}

function renderHistory() {
  const historyEl = document.querySelector("#caseHistory");
  const metricCases = document.querySelector("#metricCases");

  if (!historyEl) return;

  historyEl.innerHTML = caseHistory.map(item => `
    <li>
      <strong>${item.id}</strong> — ${item.title}
      <br>
      <small>${item.mode} | ${item.status}</small>
    </li>
  `).join("");

  if (metricCases) {
    metricCases.textContent = `${caseHistory.length} case${caseHistory.length === 1 ? "" : "s"}`;
  }
}

function formatEngineReport(report, title) {
  const classification = report.classification;
  const plan = report.executionPlan;

  return `
NFE REPORT
==========

Case ID: ${report.id}
Title: ${title}
Engine Version: ${nfeEngineVersion}
Status: Completed
Created: ${report.createdAt}

TASK ADAPTER
------------
Primary Task: ${classification.primaryTask}
Secondary Tasks: ${classification.secondaryTasks.length ? classification.secondaryTasks.join(", ") : "None"}
Confidence: ${classification.confidence}
Domain: ${classification.domain}
Complexity: ${classification.complexity}
Evidence Required: ${classification.evidenceRequired ? "Yes" : "No"}
Execution Hint: ${classification.executionHint}

EXECUTION ORCHESTRATOR
----------------------
Execution Profile: ${plan.executionProfile}
Core Layers Enabled: ${plan.runCoreLayers ? "Yes" : "No"}
Layers To Run: ${plan.layersToRun.join(", ")}
Layer 7 Recommended: ${plan.layer7Recommended ? "Yes" : "No"}
Evidence Collection Required: ${plan.requiresEvidenceCollection ? "Yes" : "No"}
Iteration Required: ${plan.requiresIteration ? "Yes" : "No"}
Report Format: ${plan.reportFormat}

VALIDATION FOCUS
----------------
${plan.validationFocus.map(item => `- ${item}`).join("\n")}

CASE INPUT
----------
${report.prompt}

CORE NFE ANALYTICAL ENGINE
--------------------------
${Object.entries(report.layerOutputs).map(([layer, output]) => `${layer}\n${output}`).join("\n\n")}

FINAL SUMMARY
-------------
${report.finalSummary}
`.trim();
}

function runDemoAnalysis() {
  const title = document.querySelector("#caseTitle")?.value.trim() || "Untitled Case";
  const prompt = document.querySelector("#casePrompt")?.value.trim() || "No claim provided.";

  const engineReport = runNFE(prompt);
  const classification = engineReport.classification;
  const plan = engineReport.executionPlan;

  caseCount += 1;
  const id = `NFE-${String(caseCount).padStart(6, "0")}`;

  engineReport.id = id;

  caseHistory.unshift({
    id,
    title,
    mode: plan.executionProfile,
    status: "Completed",
    timestamp: engineReport.createdAt
  });

  saveState();
  renderHistory();
  renderLayers(plan.layer7Recommended);

  const evidenceLedger = document.querySelector("#evidenceLedger");
  if (evidenceLedger) {
    evidenceLedger.innerHTML = `
      <li><strong>Prompt:</strong> ${prompt}</li>
      <li><strong>Task Adapter:</strong> Classified as ${classification.primaryTask}.</li>
      <li><strong>Execution Orchestrator:</strong> Selected ${plan.executionProfile}.</li>
      <li><strong>Core Engine:</strong> Layers 0–6 scheduled as canonical workflow.</li>
      <li><strong>Layer 7:</strong> ${plan.layer7Recommended ? "Recommended." : "Not recommended."}</li>
    `;
  }

  const reportOutput = document.querySelector("#reportOutput");
  if (reportOutput) {
    reportOutput.textContent = formatEngineReport(engineReport, title);
  }

  showSection("studio");
}

const runAnalysisButton = document.querySelector("#runAnalysis");
if (runAnalysisButton) {
  runAnalysisButton.addEventListener("click", runDemoAnalysis);
}

const exportButton = document.querySelector("#exportBtn");
if (exportButton) {
  exportButton.addEventListener("click", () => {
    const content = document.querySelector("#reportOutput")?.textContent || "";

    if (!content || content.includes("Run an analysis")) {
      alert("Run an analysis first, then export the report.");
      return;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `nfe-engine-v0-3-report-${Date.now()}.txt`;
    anchor.click();

    URL.revokeObjectURL(url);
  });
}

renderLayers(false);
renderHistory();
