import type { AreaLevel, EnemyBalanceConfig } from '../types';

/** 敵のバランス設定 */
export const ENEMY_BALANCE_BY_LEVEL: Record<AreaLevel, EnemyBalanceConfig> = {
  1: {
    Hp: 10,
    ExpDrop: { Min: 10, Max: 20 },
    MoneyDrop: { Min: 1, Max: 3 },
    EnemyDamage: 5,
  },
  2: {
    Hp: 100,
    ExpDrop: { Min: 50, Max: 150 },
    MoneyDrop: { Min: 10, Max: 30 },
    EnemyDamage: 30,
  },
  3: {
    Hp: 1000,
    ExpDrop: { Min: 150, Max: 300 },
    MoneyDrop: { Min: 100, Max: 300 },
    EnemyDamage: 70,
  },
} as const;
