export const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;
export const xpForNextLevel = (level: number) => (level * level) * 100;
