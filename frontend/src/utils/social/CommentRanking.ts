/**
 * Utility for sorting and ranking comments based on quality, reliability, and consensus.
 */
export class CommentRanking {
    /**
     * Calculates a quality score for a comment.
     * @param likes Number of likes
     * @param userKarma Reputation of the commenter
     * @param ageInHours Hours since posting
     * @param reportingCount Number of flags (penalty)
     */
    static getQualityScore(
        likes: number,
        userKarma: number,
        ageInHours: number,
        reportingCount: number
    ): number {
        const karmaWeight = 0.4;
        const likesWeight = 10;
        const penaltyWeight = 100;

        // Wilson score interval or similar decay function for ranking
        const score = (likes * likesWeight) + (userKarma * karmaWeight);
        const decay = Math.pow(ageInHours + 2, 1.5);

        const baseScore = score / decay;
        const penalty = reportingCount * penaltyWeight;

        return Math.max(0, baseScore - penalty);
    }

    /**
     * Sorts a list of comments by quality score.
     */
    static sort(comments: any[]): any[] {
        return [...comments].sort((a, b) => {
            const scoreA = this.getQualityScore(a.likes, a.userKarma || 0, a.age || 1, a.flags || 0);
            const scoreB = this.getQualityScore(b.likes, b.userKarma || 0, b.age || 1, b.flags || 0);
            return scoreB - scoreA;
        });
    }

    /**
     * Determines if a comment should be auto-hidden based on penalty score.
     */
    static shouldHide(flags: number, qualityScore: number): boolean {
        return flags > 10 || qualityScore < 0;
    }
}
