type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export function formatQuestionDifficulty(difficulty: QuestionDifficulty) {
  switch (difficulty) {
    case "EASY":
      return "Easy";
    case "MEDIUM":
      return "Medium";
    case "HARD":
      return "Hard";
    default:
      throw new Error(
        `Unknown question difficulty: ${difficulty satisfies never}`
      );
  }
}
