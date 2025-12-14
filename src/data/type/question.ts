export const questionDifficulties = ["EASY", "MEDIUM", "HARD"] as const;

export type QuestionDifficulty = (typeof questionDifficulties)[number];
