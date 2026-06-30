// nfeEngine.js

export function runNFE(prompt) {
  const classification = classifyTask(prompt);
  const executionPlan = createExecutionPlan(classification);

  return {
    id: `NFE-${Date.now()}`,
    createdAt: new Date().toISOString(),
    prompt,
    classification,
    executionPlan,
    layerOutputs: {
      "Layer 0 — Observation Ledger":
        "Identify the observable facts, user request, assumptions, and known constraints.",
      "Layer 1 — Human Drivers":
        "Identify motivations, incentives, fears, desires, and behavioral pressures relevant to the case.",
      "Layer 2 — Narrative Pressures":
        "Identify story forces, public framing, emotional gravity, and interpretive pressures.",
      "Layer 3 — Stakeholder Response":
        "Identify how relevant actors may respond based on incentives and constraints.",
      "Layer 4 — Decision Path":
        "Map plausible paths, choices, tradeoffs, and turning points.",
      "Layer 5 — Outcome Expectation":
        "Estimate likely outcomes, uncertainties, risks, and alternatives.",
      "Layer 6 — Validation & Refinement":
        "Identify what would confirm, weaken, or revise the analysis."
    },
    finalSummary:
      "The request has been classified by the Task Adapter and routed through the Execution Orchestrator for canonical NFE Layer 0–6 processing."
  };
}

export function classifyTask(prompt) {
  const text = prompt.toLowerCase();

  const scores = {
    Creative: countMatches(text, [
      "write",
      "story",
      "joke",
      "scene",
      "script",
      "screenplay",
      "character",
      "dialogue",
      "episode",
      "creative"
    ]),
    Analytical: countMatches(text, [
      "analyze",
      "explain",
      "why",
      "break down",
      "reason",
      "impact",
      "strategy",
      "argument"
    ]),
    Predictive: countMatches(text, [
      "predict",
      "forecast",
      "likely",
      "future",
      "probability",
      "odds",
      "outcome"
    ]),
    Evaluation: countMatches(text, [
      "compare",
      "evaluate",
      "rank",
      "score",
      "best",
      "worst",
      "pros and cons",
      "verdict"
    ]),
    Research: countMatches(text, [
      "research",
      "sources",
      "evidence",
      "data",
      "study",
      "citations",
      "facts",
      "investigate"
    ])
  };

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const activeTypes = sorted.filter((entry) => entry[1] > 0);

  let primaryTask = activeTypes.length ? activeTypes[0][0] : "Analytical";

  if (activeTypes.length >= 3) {
    primaryTask = "Hybrid";
  }

  const complexity = determineComplexity(text, activeTypes.length);
  const evidenceRequired =
    primaryTask === "Research" ||
    primaryTask === "Predictive" ||
    primaryTask === "Evaluation" ||
    text.includes("evidence") ||
    text.includes("sources") ||
    text.includes("current") ||
    text.includes("latest");

  const executionHint = determineExecutionHint(primaryTask, complexity, evidenceRequired, text);

  return {
    primaryTask,
    secondaryTasks: activeTypes
      .map((entry) => entry[0])
      .filter((type) => type !== primaryTask),
    confidence: calculateConfidence(activeTypes.length),
    domain: inferDomain(text),
    complexity,
    evidenceRequired,
    executionHint
  };
}

function createExecutionPlan(classification) {
  return {
    executionProfile: `${classification.executionHint} Pass`,
    runCoreLayers: true,
    layersToRun: [0, 1, 2, 3, 4, 5, 6],
    layer7Recommended:
      classification.complexity === "High" ||
      classification.primaryTask === "Predictive" ||
      classification.primaryTask === "Hybrid",
    requiresEvidenceCollection: classification.evidenceRequired,
    requiresIteration:
      classification.complexity === "High" ||
      classification.primaryTask === "Creative" ||
      classification.primaryTask === "Hybrid",
    reportFormat: `${classification.primaryTask} NFE Report`,
    validationFocus: selectValidationFocus(classification.primaryTask)
  };
}

function countMatches(text, keywords) {
  return keywords.reduce((count, keyword) => {
    return text.includes(keyword) ? count + 1 : count;
  }, 0);
}

function determineComplexity(text, activeTypeCount) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (
    wordCount > 80 ||
    activeTypeCount >= 3 ||
    text.includes("complex") ||
    text.includes("deep") ||
    text.includes("benchmark") ||
    text.includes("experiment")
  ) {
    return "High";
  }

  if (wordCount > 25 || activeTypeCount === 2) {
    return "Medium";
  }

  return "Low";
}

function determineExecutionHint(primaryTask, complexity, evidenceRequired, text) {
  if (text.includes("benchmark") || text.includes("test case")) {
    return "Benchmark";
  }

  if (complexity === "High" || evidenceRequired || primaryTask === "Predictive") {
    return "Deep";
  }

  if (complexity === "Low") {
    return "Fast";
  }

  return "Standard";
}

function inferDomain(text) {
  if (text.includes("story") || text.includes("script") || text.includes("character")) {
    return "Creative Writing";
  }

  if (text.includes("business") || text.includes("company") || text.includes("market")) {
    return "Business";
  }

  if (text.includes("politics") || text.includes("election") || text.includes("policy")) {
    return "Politics";
  }

  if (text.includes("software") || text.includes("app") || text.includes("code")) {
    return "Software";
  }

  return "General";
}

function calculateConfidence(activeTypeCount) {
  if (activeTypeCount === 0) return 0.55;
  if (activeTypeCount === 1) return 0.9;
  if (activeTypeCount === 2) return 0.8;
  return 0.72;
}

function selectValidationFocus(primaryTask) {
  if (primaryTask === "Creative") {
    return ["Coherence", "Audience response", "Emotional logic", "Originality"];
  }

  if (primaryTask === "Research") {
    return ["Source quality", "Evidence strength", "Completeness", "Contradictions"];
  }

  if (primaryTask === "Predictive") {
    return ["Assumption tracking", "Outcome monitoring", "Probability revision"];
  }

  if (primaryTask === "Evaluation") {
    return ["Criteria clarity", "Comparison fairness", "Bias control"];
  }

  return ["Logical consistency", "Alternative explanations", "Conclusion sensitivity"];
}
