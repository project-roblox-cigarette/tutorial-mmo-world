// テレポート処理
// Handlerから呼び出してテレポートを実行する。

import { TeleportService, RunService } from '@rbxts/services';
import { getPlaceId, PlaceKey, DEBUG_WARP_POS } from '../../shared/Places';

/**
 * Handlerから渡される情報
 */
export interface TeleportRequest {
  player: Player;
  destination: PlaceKey;
}

/**
 * 呼び出し元（Handler）が分岐できるように、処理結果を型で表現する。
 * - ok: true  → TeleportAsync 呼び出し成功
 * - ok: false → pcallの実行エラー
 */
export type TeleportResult =
  | { ok: true }
  | { ok: false; reason: 'TELEPORT_ERROR'; detail?: string };

function warpWithinPlace(
  player: Player,
  destination: PlaceKey,
): TeleportResult {
  const pos = DEBUG_WARP_POS[destination];
  if (!pos) {
    return {
      ok: false,
      reason: 'TELEPORT_ERROR',
      detail: 'No debug position defined',
    };
  }

  const character = player.Character;
  if (!character) {
    return {
      ok: false,
      reason: 'TELEPORT_ERROR',
      detail: 'Character not found',
    };
  }

  // 少し上に置いて埋まりを軽減（必要なら調整）
  const cf = new CFrame(pos.add(new Vector3(0, 5, 0)));
  character.PivotTo(cf);

  // 任意：移動直後の滑りを抑える
  const hrp = character.FindFirstChild('HumanoidRootPart');
  if (hrp && hrp.IsA('BasePart')) {
    hrp.AssemblyLinearVelocity = new Vector3(0, 0, 0);
    hrp.AssemblyAngularVelocity = new Vector3(0, 0, 0);
  }

  return { ok: true };
}

/**
 * ワープの処理
 * @param req プレイヤーと目的地
 * @returns Teleport の実行成否（成功 or エラー理由 + detail）
 */
export function requestTeleport(req: TeleportRequest): TeleportResult {
  // Studioで確認するときは座標ワープ。
  if (RunService.IsStudio()) {
    return warpWithinPlace(req.player, req.destination);
  }

  // 安全にplaceIdを取得
  const placeId = getPlaceId(req.destination);

  // テレポート実行、pcallで例外対応
  const [success, err] = pcall(() => {
    TeleportService.TeleportAsync(placeId, [req.player]);
  });

  // 失敗時：エラー内容をログに残し、呼び出し元へ失敗を返す
  if (!success) {
    const detail = tostring(err);
    warn(
      `[Teleport] failed userId=${req.player.UserId} dest=${req.destination} placeId=${placeId} err=${detail}`,
    );
    return { ok: false, reason: 'TELEPORT_ERROR', detail };
  }

  // 呼び出し元に成功を通知。
  return { ok: true };
}
