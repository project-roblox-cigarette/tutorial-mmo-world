import { Players, ReplicatedStorage } from '@rbxts/services';
import { REMOTES } from 'shared/constants';
import { SHOP_CONFIGS, SHOP_ITEM_CATALOG } from 'shared/constants/shops';
import type {
  ShopId,
  ShopItemId,
  ShopOpenPayload,
  ShopPurchaseResult,
} from 'shared/types/shop';
import { isShopId } from 'shared/types/shop';
import { logger } from 'shared/utils/logger';

// ショップオープン通知を受け取るためのRemoteEventの名前
const SHOP_PREVIEW_GUI_NAME = 'ShopPreviewGui';

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
 * 受信確認用の最小仮UIを PlayerGui に表示する。
 * @param payload サーバーから受け取ったショップオープン通知のペイロード
 */
function openShopUi(payload: ShopOpenPayload): void {
  const localPlayer = Players.LocalPlayer;
  const playerGui = localPlayer.FindFirstChildOfClass('PlayerGui');
  if (!playerGui) {
    logger.warn(
      'ShopOpen',
      'PlayerGui が見つからないためショップUIを表示できません',
    );
    return;
  }

  const existing = playerGui.FindFirstChild(SHOP_PREVIEW_GUI_NAME);
  if (existing) {
    existing.Destroy();
  }

  const screenGui = new Instance('ScreenGui');
  screenGui.Name = SHOP_PREVIEW_GUI_NAME;
  screenGui.ResetOnSpawn = false;

  const frame = new Instance('Frame');
  frame.Name = 'Container';
  frame.Size = new UDim2(0, 420, 0, 260);
  frame.AnchorPoint = new Vector2(0.5, 0.5);
  frame.Position = new UDim2(0.5, 0, 0.5, 0);
  frame.BackgroundColor3 = Color3.fromRGB(24, 28, 36);
  frame.BorderSizePixel = 0;
  frame.Parent = screenGui;

  const title = new Instance('TextLabel');
  title.Name = 'Title';
  title.Size = new UDim2(1, -24, 0, 40);
  title.Position = new UDim2(0, 12, 0, 12);
  title.BackgroundTransparency = 1;
  title.Font = Enum.Font.GothamBold;
  title.TextSize = 24;
  title.TextColor3 = Color3.fromRGB(240, 244, 248);
  title.TextXAlignment = Enum.TextXAlignment.Left;
  title.Text = `${payload.ShopId}`;
  title.Parent = frame;

  const listContainer = new Instance('Frame');
  listContainer.Name = 'ItemList';
  listContainer.Size = new UDim2(1, -24, 0, 140);
  listContainer.Position = new UDim2(0, 12, 0, 60);
  listContainer.BackgroundTransparency = 1;
  listContainer.Parent = frame;

  const statusLabel = new Instance('TextLabel');
  statusLabel.Name = 'StatusLabel';
  statusLabel.Size = new UDim2(1, -24, 0, 28);
  statusLabel.Position = new UDim2(0, 12, 1, -44);
  statusLabel.BackgroundTransparency = 1;
  statusLabel.TextXAlignment = Enum.TextXAlignment.Left;
  statusLabel.Font = Enum.Font.Gotham;
  statusLabel.TextSize = 16;
  statusLabel.TextColor3 = Color3.fromRGB(255, 220, 120);
  statusLabel.Text = '';
  statusLabel.Parent = frame;

  function setStatusMessage(message: string): void {
    statusLabel.Text = message;
  }

  const closeButton = new Instance('TextButton');
  closeButton.Name = 'CloseButton';
  closeButton.Size = new UDim2(0, 108, 0, 36);
  closeButton.AnchorPoint = new Vector2(1, 1);
  closeButton.Position = new UDim2(1, -12, 1, -12);
  closeButton.BackgroundColor3 = Color3.fromRGB(56, 64, 82);
  closeButton.BorderSizePixel = 0;
  closeButton.Font = Enum.Font.GothamBold;
  closeButton.TextSize = 16;
  closeButton.TextColor3 = Color3.fromRGB(245, 247, 250);
  closeButton.Text = '閉じる';
  closeButton.Parent = frame;

  closeButton.Activated.Connect(() => {
    screenGui.Destroy();
  });

  _renderShopItems(listContainer, payload.ShopId, setStatusMessage);

  screenGui.Parent = playerGui;
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

    openShopUi(payload);
  });
}

/**
 * クライアントからサーバーへの購入リクエストを送信するための関数
 * @returns RemoteFunctionの呼び出し結果（ShopPurchaseResult）
 */
function getShopPurchaseRemote(): RemoteFunction {
  const folder = ReplicatedStorage.WaitForChild(REMOTES.FolderName);
  const remote = folder.WaitForChild(REMOTES.Shop_purchase);
  return remote as RemoteFunction;
}

/**
 * クライアントからサーバーへの購入リクエストを送信する関数
 * @param shopId 購入したい商品のショップID
 * @param itemId 購入したい商品のID
 * @returns サーバーからの購入処理結果（ShopPurchaseResult）
 */
function requestPurchase(
  shopId: ShopId,
  itemId: ShopItemId,
): ShopPurchaseResult {
  const payload = {
    ShopId: shopId,
    ItemId: itemId,
  };

  return getShopPurchaseRemote().InvokeServer(payload) as ShopPurchaseResult;
}

function createItemRow(
  parent: Instance,
  shopId: ShopId,
  itemId: ShopItemId,
  yOffset: number,
  setStatusMessage: (message: string) => void,
): void {
  const itemConfig = SHOP_ITEM_CATALOG[itemId];

  const row = new Instance('Frame');
  row.Size = new UDim2(1, -24, 0, 44);
  row.Position = new UDim2(0, 12, 0, yOffset);
  row.BackgroundTransparency = 1;
  row.Parent = parent;

  const label = new Instance('TextLabel');
  label.Size = new UDim2(0.65, 0, 1, 0);
  label.BackgroundTransparency = 1;
  label.TextXAlignment = Enum.TextXAlignment.Left;
  label.Font = Enum.Font.Gotham;
  label.TextSize = 18;
  label.TextColor3 = Color3.fromRGB(255, 255, 255);
  label.Text = `${itemConfig.DisplayName} - ${itemConfig.Price}G`;
  label.Parent = row;

  const button = new Instance('TextButton');
  button.Size = new UDim2(0, 96, 0, 32);
  button.AnchorPoint = new Vector2(1, 0.5);
  button.Position = new UDim2(1, 0, 0.5, 0);
  button.Text = '購入';
  button.Font = Enum.Font.GothamBold;
  button.TextSize = 16;
  button.TextColor3 = Color3.fromRGB(255, 255, 255);
  button.BackgroundColor3 = Color3.fromRGB(60, 120, 220);
  button.Parent = row;

  button.Activated.Connect(() => {
    const result = requestPurchase(shopId, itemId);

    if (result.Success) {
      setStatusMessage(`${itemConfig.DisplayName} を購入しました`);
      logger.info(
        'ShopUI',
        `購入成功: shopId=${shopId} itemId=${itemId} remaining=${result.RemainingMoney}`,
      );
      return;
    }

    if (result.Error === 'InsufficientFunds') {
      setStatusMessage('お金が足りません');
      return;
    }

    setStatusMessage(`購入に失敗しました: ${result.Error}`);
  });
}

function _renderShopItems(
  listContainer: Frame,
  shopId: ShopId,
  setStatusMessage: (message: string) => void,
): void {
  listContainer.ClearAllChildren();

  const shopConfig = SHOP_CONFIGS[shopId];
  if (!shopConfig) {
    setStatusMessage('ショップ設定が見つかりません');
    return;
  }

  let yOffset = 0;
  for (const itemId of shopConfig.Items) {
    createItemRow(listContainer, shopId, itemId, yOffset, setStatusMessage);
    yOffset += 48;
  }
}
