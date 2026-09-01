import type { LinterReport } from "../types/studioTypes";

export function lintMcq(question: {
  prompt: string;
  options: string[];
  correct_option_index: number;
  explanation?: string | null;
}): LinterReport {
  const flags: string[] = [];

  // 1. Check prompt length
  if (!question.prompt || question.prompt.trim().length < 5) {
    flags.push("Prompt is too short or empty.");
  }

  // 2. Check 4 options presence
  if (!Array.isArray(question.options) || question.options.length !== 4) {
    flags.push("Question must contain exactly 4 options.");
  } else {
    // Check for empty options
    const emptyCount = question.options.filter((o) => !o || !o.trim()).length;
    if (emptyCount > 0) {
      flags.push(`${emptyCount} option(s) are completely empty.`);
    }

    // Check duplicate options
    const trimmedOpts = question.options.map((o) => o.trim().toLowerCase());
    const uniqueOpts = new Set(trimmedOpts);
    if (uniqueOpts.size < trimmedOpts.length) {
      flags.push("Duplicate options detected (two or more options are identical).");
    }

    // 3. Check correct option index validity
    if (
      question.correct_option_index < 0 ||
      question.correct_option_index > 3 ||
      !Number.isInteger(question.correct_option_index)
    ) {
      flags.push("Invalid correct answer index (must be between 0 and 3).");
    }

    // 4. Option length imbalance check (AI Distractor Artifact Detection)
    const correctOpt = question.options[question.correct_option_index] || "";
    const distractorLengths = question.options
      .filter((_, idx) => idx !== question.correct_option_index)
      .map((o) => o.length);

    if (distractorLengths.length > 0) {
      const avgDistractorLength =
        distractorLengths.reduce((a, b) => a + b, 0) / distractorLengths.length;

      if (avgDistractorLength > 10 && correctOpt.length > avgDistractorLength * 3.5) {
        flags.push("Length Imbalance: Correct option is significantly longer than distractors.");
      }
    }
  }

  // 5. Check Math / KaTeX Delimiters
  const allMathStrings = [
    question.prompt,
    ...(question.options || []),
    question.explanation || "",
  ].join(" ");

  // Count unescaped single dollar signs
  const dollarMatches = allMathStrings.match(/(?<!\\)\$/g);
  if (dollarMatches && dollarMatches.length % 2 !== 0) {
    flags.push("Unmatched LaTeX math delimiter ($...$) detected.");
  }

  // Check for broken common LaTeX commands
  if (allMathStrings.includes("\\frac{") && !allMathStrings.includes("}{")) {
    flags.push("Potentially broken \\frac{}{} LaTeX syntax.");
  }

  return {
    isClean: flags.length === 0,
    flags,
  };
}
