/**
 * Predefined market questions for bulk market creation
 * Categorized by topic for easy selection
 */

export interface MarketQuestion {
    question: string;
    category: string;
}

export const CRYPTO_QUESTIONS: MarketQuestion[] = [
    { question: "Will Bitcoin reach $100,000 by end of 2026?", category: "crypto" },
    { question: "Will Ethereum surpass $5,000 in 2026?", category: "crypto" },
    { question: "Will STX reach $5 by March 2026?", category: "crypto" },
    { question: "Will a Bitcoin ETF be approved in the US by Q2 2026?", category: "crypto" },
    { question: "Will Solana reach $200 by June 2026?", category: "crypto" },
    { question: "Will total crypto market cap exceed $5 trillion in 2026?", category: "crypto" },
    { question: "Will Cardano launch smart contracts v2 by Q3 2026?", category: "crypto" },
    { question: "Will Polygon reach $3 by end of 2026?", category: "crypto" },
    { question: "Will Avalanche surpass $100 in 2026?", category: "crypto" },
    { question: "Will Chainlink reach $50 by Q4 2026?", category: "crypto" },
];

export const TECH_QUESTIONS: MarketQuestion[] = [
    { question: "Will Apple release AR glasses in 2026?", category: "tech" },
    { question: "Will Tesla achieve full self-driving by end of 2026?", category: "tech" },
    { question: "Will OpenAI release GPT-5 in 2026?", category: "tech" },
    { question: "Will Meta's metaverse have 100M users by 2026?", category: "tech" },
    { question: "Will quantum computing breakthrough happen in 2026?", category: "tech" },
    { question: "Will SpaceX successfully land on Mars in 2026?", category: "tech" },
    { question: "Will 6G networks launch commercially in 2026?", category: "tech" },
    { question: "Will autonomous vehicles be legal in all US states by 2026?", category: "tech" },
    { question: "Will fusion energy become commercially viable in 2026?", category: "tech" },
    { question: "Will brain-computer interfaces be FDA approved by 2026?", category: "tech" },
];

export const SPORTS_QUESTIONS: MarketQuestion[] = [
    { question: "Will Team USA win the most medals at 2026 Olympics?", category: "sports" },
    { question: "Will Messi win another Ballon d'Or in 2026?", category: "sports" },
    { question: "Will LeBron James retire in 2026?", category: "sports" },
    { question: "Will a new world record be set in 100m sprint in 2026?", category: "sports" },
    { question: "Will the FIFA World Cup 2026 have over 5B viewers?", category: "sports" },
    { question: "Will an NFL team go undefeated in 2026 season?", category: "sports" },
    { question: "Will Tiger Woods win another major in 2026?", category: "sports" },
    { question: "Will Serena Williams return to tennis in 2026?", category: "sports" },
    { question: "Will a new Olympic sport be added for 2026?", category: "sports" },
    { question: "Will esports be included in 2026 Olympics?", category: "sports" },
];

export const POLITICS_QUESTIONS: MarketQuestion[] = [
    { question: "Will there be a US presidential election debate in 2026?", category: "politics" },
    { question: "Will unemployment rate drop below 3% in 2026?", category: "politics" },
    { question: "Will inflation rate be below 2% by end of 2026?", category: "politics" },
    { question: "Will a new country join the EU in 2026?", category: "politics" },
    { question: "Will universal basic income be tested in a US state in 2026?", category: "politics" },
    { question: "Will climate legislation pass in US Congress in 2026?", category: "politics" },
    { question: "Will a major trade agreement be signed in 2026?", category: "politics" },
    { question: "Will voting age be lowered to 16 in any country in 2026?", category: "politics" },
    { question: "Will a woman be elected as UN Secretary-General in 2026?", category: "politics" },
    { question: "Will cannabis be federally legalized in US by 2026?", category: "politics" },
];

export const ENTERTAINMENT_QUESTIONS: MarketQuestion[] = [
    { question: "Will Avatar 3 gross over $2 billion worldwide?", category: "entertainment" },
    { question: "Will a streaming service surpass 500M subscribers in 2026?", category: "entertainment" },
    { question: "Will a video game sell 50M copies in first month in 2026?", category: "entertainment" },
    { question: "Will a music artist break Spotify streaming record in 2026?", category: "entertainment" },
    { question: "Will a new Star Wars movie be announced for 2026?", category: "entertainment" },
    { question: "Will Marvel release 5+ movies in 2026?", category: "entertainment" },
    { question: "Will TikTok be banned in the US by 2026?", category: "entertainment" },
    { question: "Will a virtual concert have 100M+ viewers in 2026?", category: "entertainment" },
    { question: "Will a book-to-screen adaptation win Best Picture in 2026?", category: "entertainment" },
    { question: "Will a gaming console sell 10M units in first week in 2026?", category: "entertainment" },
];

export const SCIENCE_QUESTIONS: MarketQuestion[] = [
    { question: "Will a cure for Alzheimer's be discovered in 2026?", category: "science" },
    { question: "Will CRISPR gene therapy be approved for common use in 2026?", category: "science" },
    { question: "Will a new planet be discovered in our solar system in 2026?", category: "science" },
    { question: "Will lab-grown meat be cheaper than regular meat by 2026?", category: "science" },
    { question: "Will a major breakthrough in battery technology occur in 2026?", category: "science" },
    { question: "Will a vaccine for cancer be developed in 2026?", category: "science" },
    { question: "Will evidence of alien life be found in 2026?", category: "science" },
    { question: "Will a human clone be created in 2026?", category: "science" },
    { question: "Will a new element be added to periodic table in 2026?", category: "science" },
    { question: "Will a major earthquake prediction system be deployed in 2026?", category: "science" },
];

export const BUSINESS_QUESTIONS: MarketQuestion[] = [
    { question: "Will Amazon's market cap exceed $3 trillion in 2026?", category: "business" },
    { question: "Will a tech company acquire a major automaker in 2026?", category: "business" },
    { question: "Will remote work become mandatory for 50%+ companies in 2026?", category: "business" },
    { question: "Will a 4-day work week be adopted by Fortune 500 company in 2026?", category: "business" },
    { question: "Will a unicorn startup IPO at $100B+ valuation in 2026?", category: "business" },
    { question: "Will oil prices exceed $150/barrel in 2026?", category: "business" },
    { question: "Will gold reach $3,000/oz in 2026?", category: "business" },
    { question: "Will a major bank collapse in 2026?", category: "business" },
    { question: "Will S&P 500 reach 7,000 points in 2026?", category: "business" },
    { question: "Will a company reach $1 trillion revenue in 2026?", category: "business" },
];

// Combine all questions
export const ALL_QUESTIONS: MarketQuestion[] = [
    ...CRYPTO_QUESTIONS,
    ...TECH_QUESTIONS,
    ...SPORTS_QUESTIONS,
    ...POLITICS_QUESTIONS,
    ...ENTERTAINMENT_QUESTIONS,
    ...SCIENCE_QUESTIONS,
    ...BUSINESS_QUESTIONS,
];

/**
 * Get random questions from a specific category
 */
export function getRandomQuestions(count: number, category?: string): MarketQuestion[] {
    const pool = category
        ? ALL_QUESTIONS.filter(q => q.category === category)
        : ALL_QUESTIONS;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get questions by category
 */
export function getQuestionsByCategory(category: string): MarketQuestion[] {
    switch (category.toLowerCase()) {
        case 'crypto':
            return CRYPTO_QUESTIONS;
        case 'tech':
            return TECH_QUESTIONS;
        case 'sports':
            return SPORTS_QUESTIONS;
        case 'politics':
            return POLITICS_QUESTIONS;
        case 'entertainment':
            return ENTERTAINMENT_QUESTIONS;
        case 'science':
            return SCIENCE_QUESTIONS;
        case 'business':
            return BUSINESS_QUESTIONS;
        default:
            return ALL_QUESTIONS;
    }
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
    return ['crypto', 'tech', 'sports', 'politics', 'entertainment', 'science', 'business'];
}
