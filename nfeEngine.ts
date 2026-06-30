// src/nfeEngine.ts

export type TaskType =
  | "Creative"
  | "Analytical"
  | "Predictive"
  | "Evaluation"
  | "Research"
  | "Hybrid";

export type ComplexityLevel = "Low" | "Medium" | "High";

export type ExecutionHint = "Fast" | "Standard" | "Deep" | "Benchmark";

export type ExecutionProfile = "Fast Pass" | "Standard Pass" | "Deep Pass" | "Benchmark Pass";

export interface TaskClassification {
  primaryTask: TaskType;
  secondaryTasks: TaskType[];
  confidence: number;
  domain: string;
  complexity: ComplexityLevel;
  evidenceRequired: boolean;
  executionHint: ExecutionHint;
}

export interface ExecutionContext {
  originalPrompt: string;
  classification: TaskClassification;
  project?: string;
  constraints?: string[];
  userNotes?: string;
  createdAt: string;
}

export interface ExecutionPlan {
  executionProfile: ExecutionProfile;
  runCoreLayers: boolean;
  layersToRun: number[];
  layer7Recommended: boolean;
  requiresEvidenceCollection: boolean;
  requiresIteration: boolean;
  reportFormat: string;
  validationFocus: string[];
  toolRecommendations: string[];
}

export interface NFEReport {
  id: string;
  createdAt: string;
  prompt: string;
  classification: TaskClassification;
  executionPlan: ExecutionPlan;
  layerOutputs: Record<string, string>;
  finalSummary: string;
}

/**
 * BUILD 2.2 — TASK ADAPTER
 *
 * Responsibility:
 * Classify the incoming request.
 *
 * It does NOT:
 * - perform reasoning
 * - generate conclusions
 * - invoke Layer 7
 * - collect evidence
 * - decide final report structure
 */
export function classifyTask(prompt: string): TaskClassification {
  const text = prompt.toLowerCase();

  const creativeKeywords = [
    "write",
    "story",
    "joke",
    "scene",
    "script",
    "screenplay",
    "character",
    "dialogue",
    "episode",
    "caption",
    "post",
    "article",
    "poem",
    "song",
    "creative",
  ];

  const analyticalKeywords = [
    "analyze",
    "explain",
    "why",
    "break down",
    "reason",
    "cause",
    "impact",
    "strategy",
    "argument",
    "logic",
  ];

  const predictiveKeywords = [
    "predict",
    "forecast",
    "likely",
    "probability",
    "odds",
    "future",
    "next",
    "will happen",
    "outcome",
  ];

  const evaluationKeywords = [
    "compare",
    "evaluate",
    "judge",
    "rank",
    "score",
    "best",
    "worst",
    "pros and cons",
    "verdict",
    "assessment",
  ];

  const researchKeywords = [
    "research",
    "sources",
    "evidence",
    "data",
    "study",
    "findings",
    "citations",
    "facts",
    "report",
    "investigate",
  ];

  const scores: Record<TaskType, number> = {
    Creative: countMatches(text, creativeKeywords),
    Analytical: countMatches(text, analyticalKeywords),
    Predictive: countMatches(text, predictiveKeywords),
    Evaluation: countMatches(text, evaluationKeywords),
    Research: countMatches(text, researchKeywords),
    Hybrid: 0,
  };

  const sorted = Object.entries(scores)
    .filter(([type]) => type !== "Hybrid")
    .sort((a, b) => b[1] - a[1]) as [TaskType, number][];

  const top = sorted[0];
  const second = sorted[1];

  let primaryTask: TaskType = top[1] > 0 ? top[0] : "Analytical";
  const secondaryTasks: TaskType[] = [];

  if (second && second[1] > 0) {
    secondaryTasks.push(second[0]);
  }

  const activeTypes = sorted.filter(([, score]) => score > 0);

  if (activeTypes.length >= 3) {
    primaryTask = "Hybrid";
    secondaryTasks.push(...activeTypes.map(([type]) => type).filter((t) => t !== primaryTask));
  }

  const complexity = determineComplexity(text, activeTypes.length);
  const evidenceRequired = determineEvidenceRequirement(primaryTask, text);
  const executionHint = determineExecutionHint(primaryTask, complexity, evidenceRequired, text);
  const domain = inferDomain(text);

  const confidence = calculateConfidence(top[1], second?.[1] ?? 0, activeTypes.length);

  return {
    primaryTask,
    secondaryTasks: Array.from(new Set(secondaryTasks)),
    confidence,
    domain,
    complexity,
    evidenceRequired,
    executionHint,
  };
}

/**
 * EXECUTION CONTEXT
 *
 * Stable handoff object between:
 * Task Adapter → Execution Orchestrator
 */
export function createExecutionContext(
  prompt: string,
  options?: {
    project?: string;
    constraints?: string[];
    userNotes?: string;
  }
): ExecutionContext {
  return {
    originalPrompt: prompt,
    classification: classifyTask(prompt),
    project: options?.project,
    constraints: options?.constraints ?? [],
    userNotes: options?.userNotes,
    createdAt: new Date().toISOString(),
  };
}

/**
 * BUILD 2.3 — EXECUTION ORCHESTRATOR
 *
 * Responsibility:
 * Decide how the NFE Engine should execute.
 *
 * It does NOT:
 * - replace the Core Engine
 * - reorder Layers 0–6
 * - perform the actual layer analysis
 */
export function createExecutionPlan(context: ExecutionContext): ExecutionPlan {
  const { classification } = context;

  const executionProfile = mapExecutionProfile(classification.executionHint);

  const layer7Recommended =
    classification.complexity === "High" ||
    classification.primaryTask === "Predictive" ||
    classification.primaryTask === "Hybrid" ||
    classification.executionHint === "Deep" ||
    classification.executionHint === "Benchmark";

  const requiresIteration =
    classification.complexity === "High" ||
    classification.primaryTask === "Creative" ||
    classification.primaryTask === "Hybrid" ||
    classification.primaryTask === "Predictive";

  const requiresEvidenceCollection =
    classification.evidenceRequired ||
    classification.primaryTask === "Research" ||
    classification.primaryTask === "Evaluation";

  const reportFormat = selectReportFormat(classification.primaryTask);

  const validationFocus = selectValidationFocus(classification.primaryTask);

  const toolRecommendations = selectToolRecommendations(classification);

  return {
    executionProfile,
    runCoreLayers: true,
    layersToRun: [0, 1, 2, 3, 4, 5, 6],
    layer7Recommended,
    requiresEvidenceCollection,
    requiresIteration,
    reportFormat,
    validationFocus,
    toolRecommendations,
  };
}

/**
 * BUILD 2.4 PREVIEW — SIMPLE CORE ENGINE RUNTIME
 *
 * This is a placeholder runtime that produces readable reports.
 * Later builds can replace each layer with stronger AI/runtime logic.
 */
export function runNFE(prompt: string): NFEReport {
  const context = createExecutionContext(prompt);
  const executionPlan = createExecutionPlan(context);

  const layerOutputs: Record<string, string> = {
    "Layer 0 — Observation Ledger":
      "Identify the observable facts, user request, assumptions, and known constraints.",
    "Layer 1 — Human Drivers":
      "Identify motivations, incentives, fears, desires, and behavioral pressures relevant to the case.",
    "Layer 2 — Narrative Pressures":
      "Identify the story forces, public framing, emotional gravity, and interpretive pressures shaping the situation.",
    "Layer 3 — Stakeholder Response":
      "Identify how relevant actors may respond based on incentives, constraints, and perceived risks.",
    "Layer 4 — Decision Path":
      "Map plausible paths, choices, tradeoffs, and turning points.",
    "Layer 5 — Outcome Expectation":
      "Estimate likely outcomes, uncertainties, risks, and alternative possibilities.",
    "Layer 6 — Validation & Refinement":
      "Identify what would confirm, weaken, or revise the analysis.",
  };

  if (executionPlan.layer7Recommended) {
    layerOutputs["Layer 7 — Adaptive Reasoning / Test-Time Reasoning"] =
      "Layer 7 is recommended because the task appears complex, predictive, hybrid, benchmark-oriented, or likely to benefit from additional reasoning passes.";
  }

  return {
    id: generateReportId(),
    createdAt: new Date().toISOString(),
    prompt,
    classification: context.classification,
    executionPlan,
    layerOutputs,
    finalSummary:
      "The request has been classified, routed through an execution plan, and prepared for canonical NFE Layer 0–6 processing. Layer 7 is recommended only if warranted by complexity, uncertainty, or validation needs.",
  };
}

/* ----------------------------- Helpers ----------------------------- */

function countMatches(text: string, keywords: string[]): number {
  return keywords.reduce((count, keyword) => {
    return text.includes(keyword) ? count + 1 : count;
  }, 0);
}

function determineComplexity(text: string, activeTypeCount: number): ComplexityLevel {
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (
    wordCount > 80 ||
    activeTypeCount >= 3 ||
    text.includes("complex") ||
    text.includes("deep") ||
    text.includes("thorough") ||
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

function determineEvidenceRequirement(taskType: TaskType, text: string): boolean {
  if (taskType === "Research" || taskType === "Evaluation" || taskType === "Predictive") {
    return true;
  }

  return (
    text.includes("evidence") ||
    text.includes("source") ||
    text.includes("data") ||
    text.includes("facts") ||
    text.includes("citations") ||
    text.includes("latest") ||
    text.includes("current") ||
    text.includes("news")
  );
}

function determineExecutionHint(
  taskType: TaskType,
  complexity: ComplexityLevel,
  evidenceRequired: boolean,
  text: string
): ExecutionHint {
  if (text.includes("benchmark") || text.includes("test case")) {
    return "Benchmark";
  }

  if (complexity === "High" || evidenceRequired || taskType === "Predictive") {
    return "Deep";
  }

  if (complexity === "Low") {
    return "Fast";
  }

  return "Standard";
}

function inferDomain(text: string): string {
  if (text.includes("story") || text.includes("script") || text.includes("character")) {
    return "Creative Writing";
  }

  if (text.includes("market") || text.includes("business") || text.includes("company")) {
    return "Business";
  }

  if (text.includes("politics") || text.includes("election") || text.includes("policy")) {
    return "Politics";
  }

  if (text.includes("science") || text.includes("study") || text.includes("experiment")) {
    return "Research";
  }

  if (text.includes("code") || text.includes("app") || text.includes("software")) {
    return "Software";
  }

  return "General";
}

function calculateConfidence(topScore: number, secondScore: number, activeTypeCount: number): number {
  if (topScore === 0) return 0.55;

  if (activeTypeCount >= 3) return 0.72;

  const gap = topScore - secondScore;

  if (gap >= 2) return 0.92;
  if (gap === 1) return 0.82;

  return 0.75;
}

function mapExecutionProfile(hint: ExecutionHint): ExecutionProfile {
  switch (hint) {
    case "Fast":
      return "Fast Pass";
    case "Deep":
      return "Deep Pass";
    case "Benchmark":
      return "Benchmark Pass";
    case "Standard":
    default:
      return "Standard Pass";
  }
}

function selectReportFormat(taskType: TaskType): string {
  switch (taskType) {
    case "Creative":
      return "Creative Development Report";
    case "Research":
      return "Research Report";
    case "Predictive":
      return "Forecast Report";
    case "Evaluation":
      return "Evaluation Report";
    case "Hybrid":
      return "Hybrid NFE Report";
    case "Analytical":
    default:
      return "Analytical Report";
  }
}

function selectValidationFocus(taskType: TaskType): string[] {
  switch (taskType) {
    case "Creative":
      return ["Coherence", "Audience response", "Emotional logic", "Originality"];
    case "Research":
      return ["Source quality", "Evidence strength", "Completeness", "Contradictions"];
    case "Predictive":
      return ["Assumption tracking", "Outcome monitoring", "Probability revision", "Signal changes"];
    case "Evaluation":
      return ["Criteria clarity", "Comparison fairness", "Tradeoff analysis", "Bias control"];
    case "Hybrid":
      return ["Cross-domain consistency", "Evidence strength", "Execution fit", "Uncertainty tracking"];
    case "Analytical":
    default:
      return ["Logical consistency", "Causal strength", "Alternative explanations", "Conclusion sensitivity"];
  }
}

function selectToolRecommendations(classification: TaskClassification): string[] {
  const tools: string[] = [];

  if (classification.evidenceRequired) {
    tools.push("Evidence collection");
  }

  if (classification.primaryTask === "Research") {
    tools.push("Source review");
    tools.push("Citation tracking");
  }

  if (classification.primaryTask === "Predictive") {
    tools.push("Outcome tracker");
    tools.push("Forecast ledger");
  }

  if (classification.primaryTask === "Creative") {
    tools.push("Draft generator");
    tools.push("Revision loop");
  }

  if (classification.executionHint === "Benchmark") {
    tools.push("Benchmark runtime");
    tools.push("Result comparison ledger");
  }

  return tools;
}

function generateReportId(): string {
  return `NFE-${Date.now()}`;
}
