// テレポート処理
// Handlerから呼び出してテレポートを実行する。

import { RunService, TeleportService } from '@rbxts/services';
import { DEBUG_WARP_POS } from 'shared/constants';
import type {
  PlaceKey,
  TeleportRequest,
  TeleportResponse,
} from 'shared/types/teleport';
import { logger } from 'shared/utils/logger';
import { getPlaceId } from 'shared/utils/places';

/**
 * 呼び出し元（Handler）が分岐できるように、処理結果を型で表現する。
 * - status: true  → TeleportAsync 呼び出し成功
 * - status: false → pcallの実行エラー
 */

const successResponse = {
  Status: true as const,
};
const failureResponse = {
  Status: false as const,
  Reason: 'TELEPORT_ERROR' as const,
  Detail: '',
};

function warpWithinPlace(
  player: Player,
  destination: PlaceKey,
): TeleportResponse {
  const warpPos = DEBUG_WARP_POS[destination];
  if (!warpPos) {
    return {
      ...failureResponse,
      Detail: 'デバッグ用の座標が定義されていません',
    };
  }

  const character = player.Character;
  if (!character) {
    return {
      ...failureResponse,
      Detail: 'キャラクターが見つかりません',
    };
  }

  // 少し上に置いて埋まりを軽減（必要なら調整）
  const cframe = new CFrame(warpPos.add(new Vector3(0, 5, 0)));
  character.PivotTo(cframe);

  // 任意：移動直後の滑りを抑える
  const getHumanoidRootPart = character.FindFirstChild('HumanoidRootPart');
  if (getHumanoidRootPart?.IsA('BasePart')) {
    getHumanoidRootPart.AssemblyLinearVelocity = new Vector3(0, 0, 0);
    getHumanoidRootPart.AssemblyAngularVelocity = new Vector3(0, 0, 0);
  }

  return successResponse;
}

/**
 * ワープの処理
 * @param request プレイヤーと目的地
 * @returns Teleport の実行成否（成功 or エラー理由 + 詳細）
 */
export function requestTeleport(request: TeleportRequest): TeleportResponse {
  // Studioで確認するときは座標ワープ。
  if (RunService.IsStudio()) {
    return warpWithinPlace(request.Player, request.Destination);
  }

  // 安全にplaceIdを取得
  const placeId = getPlaceId(request.Destination);

  // テレポート実行、pcallで例外対応
  const [success, err] = pcall(() => {
    TeleportService.TeleportAsync(placeId, [request.Player]);
  });

  // 失敗時：エラー内容をログに残し、呼び出し元へ失敗を返す
  if (!success) {
    const errorDetail = tostring(err);
    logger.error(
      'Teleport',
      `テレポート失敗: userId=${request.Player.UserId} dest=${request.Destination} placeId=${placeId} error=${errorDetail}`,
    );

    return {
      ...failureResponse,
      Detail: errorDetail,
    };
  }

  // 呼び出し元に成功を通知。
  return successResponse;
}
