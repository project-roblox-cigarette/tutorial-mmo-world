import { Players, ReplicatedStorage } from '@rbxts/services';
import { REMOTES } from 'shared/constants';
import type { ShopOpenPayload } from 'shared/types/shop';
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
function openShopPreview(payload: ShopOpenPayload): void {
  const localPlayer = Players.LocalPlayer;
  const playerGui = localPlayer.FindFirstChildOfClass('PlayerGui');
  if (!playerGui) {
    logger.warn('ShopOpen', 'PlayerGui が見つからないため仮UIを表示できません');
    return;
  }

  // 既に同名のUIが存在する場合は削除してから新規作成する
  const existing = playerGui.FindFirstChild(SHOP_PREVIEW_GUI_NAME);
  if (existing) {
    existing.Destroy();
  }

  // 仮UIを構築してPlayerGuiに配置する
  const screenGui = new Instance('ScreenGui');
  screenGui.Name = SHOP_PREVIEW_GUI_NAME;
  screenGui.ResetOnSpawn = false;

  // フレームを作成して配置する
  const frame = new Instance('Frame');
  frame.Name = 'Container';
  frame.Size = new UDim2(0, 360, 0, 180);
  frame.AnchorPoint = new Vector2(0.5, 0.5);
  frame.Position = new UDim2(0.5, 0, 0.5, 0);
  frame.BackgroundColor3 = Color3.fromRGB(24, 28, 36);
  frame.BorderSizePixel = 0;
  frame.Parent = screenGui;

  // タイトルと説明、閉じるボタンを作成して配置する
  const title = new Instance('TextLabel');
  title.Name = 'Title';
  title.Size = new UDim2(1, -24, 0, 56);
  title.Position = new UDim2(0, 12, 0, 12);
  title.BackgroundTransparency = 1;
  title.Font = Enum.Font.GothamBold;
  title.TextSize = 24;
  title.TextColor3 = Color3.fromRGB(240, 244, 248);
  title.TextXAlignment = Enum.TextXAlignment.Left;
  title.TextYAlignment = Enum.TextYAlignment.Top;
  title.Text = `${payload.ShopId} を開く予定`;
  title.Parent = frame;

  // 受信確認用の説明テキストを配置する
  const description = new Instance('TextLabel');
  description.Name = 'Description';
  description.Size = new UDim2(1, -24, 0, 42);
  description.Position = new UDim2(0, 12, 0, 76);
  description.BackgroundTransparency = 1;
  description.Font = Enum.Font.Gotham;
  description.TextSize = 16;
  description.TextColor3 = Color3.fromRGB(180, 188, 199);
  description.TextXAlignment = Enum.TextXAlignment.Left;
  description.TextYAlignment = Enum.TextYAlignment.Top;
  description.Text = 'これは受信確認用の仮UIです';
  description.Parent = frame;

  // 閉じるボタンを配置する
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

  // 閉じるボタンがクリックされたらUIを破棄する
  closeButton.Activated.Connect(() => {
    screenGui.Destroy();
  });

  // 最後にPlayerGuiに配置する
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

    openShopPreview(payload);
  });
}
