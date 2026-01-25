/**
 * RemoteEvent / RemoteFunction を格納するフォルダ名
 * ReplivatedStorage/Remotes に対応
 */
export const REMOTES_FOLDER_NAME = 'Remotes' as const;

/**
 * 剣攻撃の RemoteEvent 名
 * クライアントが攻撃したことを通知して
 * サーバー側でヒット判定とダメージ処理を行う。
 */
export const REMOTE_MELEE_ATTACK = 'MeleeAttack' as const;

/**
 * 送受信Payload
 */
export type MeleeAttackRequest = {
  debugWeaponName?: string;
};
