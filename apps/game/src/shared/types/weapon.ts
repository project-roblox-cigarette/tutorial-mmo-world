export type WeaponId = 'Sword_Lv0' | 'Sword_Lv1' | 'Sword_Lv2' | 'Sword_Lv3';

export type WeaponConfig = {
  id: WeaponId;
  damage: number;
  hitboxThickness: number;
  maxHitsPerSwing: number;
  cooldownSec: number;
  hitStartSec: number;
  hitEndSec: number;
  hitSampleIntervalSec: number;
};
