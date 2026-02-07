export type PlayerData = {
  userId: number;
  displayName: string;
  joinedAt: number;
  score: number;
  level: number;
};

export type ScoreUpdateType = 'add' | 'subtract' | 'set';

export type LeaderboardEntry = {
  userId: number;
  displayName: string;
  score: number;
  rank: number;
};
