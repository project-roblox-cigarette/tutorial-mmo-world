export type DamageApplyResult =
  | { ok: true; killed: boolean }
  | {
      ok: false;
      reason:
        | 'NOT_ENEMY'
        | 'NO_TARGET'
        | 'ALREADY_DEAD'
        | 'NO_HEALTH_COMPONENT';
    };

export type HitDetectionResult = {
  enemies: Model[];
};

export type MeleeAttackRequest = {
  debugWeaponName?: string;
};
