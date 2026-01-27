export interface ScoreResult {
    baseScore: number;
    multiplier: number;
    totalScore: number;
}

export class ScoreCalculator {
    public static calculate(matchCount: number, multiplier: number = 1): ScoreResult {
        const baseScore = matchCount * matchCount;
        const totalScore = baseScore * multiplier;

        return {
            baseScore,
            multiplier,
            totalScore
        };
    }
}
