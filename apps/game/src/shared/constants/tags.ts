/**
 * CollectionService用タグ定数
 * ゲーム内のオブジェクトを識別するために使用
 */
export const TAGS = {
  /** 敵キャラクターを識別するタグ */
  ENEMY: 'Enemy',
  /** テレポートプロンプトを識別するタグ */
  TELEPORT_PROMPT: 'TeleportPrompt',
  /** 敵のスポーンエリアを識別するタグ */
  ENEMY_AREA: 'EnemyArea',
  /** ショップNPCを識別するタグ */
  SHOP_NPC: 'ShopNPC',
} as const;
