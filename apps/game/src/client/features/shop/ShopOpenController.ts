import { ReplicatedStorage } from '@rbxts/services';
import { REMOTES } from 'shared/constants';
import type { ShopOpenPayload } from 'shared/types/shop';
import { isShopId } from 'shared/types/shop';
import { logger } from 'shared/utils/logger';

/**
 * ShopOpen 用の RemoteEvent を取得する。
 * サーバー側で必要時に生成されるため WaitForChild で待つ。
 */
function getShopOpenRemote(): RemoteEvent {
  const remotesFolder = ReplicatedStorage.WaitForChild(
    REMOTES.FolderName,
  ) as Folder;

  const remote = remotesFolder.WaitForChild(REMOTES.Shop_open);
  return remote as RemoteEvent;
}

/**
 * payload の最低限の妥当性を検証する。
 */
function isShopOpenPayload(value: unknown): value is ShopOpenPayload {
  if (!typeIs(value, 'table')) return false;

  const payload = value as Partial<ShopOpenPayload>;
  return isShopId(payload.ShopId);
}

/**
 * サーバーからの ShopOpen 通知を受け取る controller
 */
export function startShopOpenController(): void {
  const shopOpenRemote = getShopOpenRemote();

  shopOpenRemote.OnClientEvent.Connect((payload: unknown) => {
    if (!isShopOpenPayload(payload)) {
      logger.warn('ShopOpen', '不正なpayloadを受信しました');
      return;
    }

    logger.info(
      'ShopOpen',
      `ショップオープン通知を受信: shopId=${payload.ShopId}`,
    );
  });
}
