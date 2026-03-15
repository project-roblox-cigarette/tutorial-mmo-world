import { Players } from '@rbxts/services';
import { ATTRIBUTES } from 'shared/constants';
import { logger } from 'shared/utils/logger';

const MONEY_HUD_GUI_NAME = 'MoneyHudGui';
const MONEY_LABEL_NAME = 'MoneyLabel';

function getOrCreateMoneyLabel(): TextLabel | undefined {
  const localPlayer = Players.LocalPlayer;
  const playerGui = localPlayer.FindFirstChildOfClass('PlayerGui');

  if (!playerGui) {
    logger.warn(
      'MoneyHud',
      'PlayerGui が見つからないため所持金UIを表示できません',
    );
    return undefined;
  }

  const existingGui = playerGui.FindFirstChild(MONEY_HUD_GUI_NAME);
  if (existingGui?.IsA('ScreenGui')) {
    const existingLabel = existingGui.FindFirstChild(MONEY_LABEL_NAME);
    if (existingLabel?.IsA('TextLabel')) {
      return existingLabel;
    }
  }

  const screenGui = new Instance('ScreenGui');
  screenGui.Name = MONEY_HUD_GUI_NAME;
  screenGui.ResetOnSpawn = false;

  const frame = new Instance('Frame');
  frame.Name = 'Container';
  frame.Size = new UDim2(0, 180, 0, 56);
  frame.AnchorPoint = new Vector2(1, 0);
  frame.Position = new UDim2(1, -16, 0, 16);
  frame.BackgroundColor3 = Color3.fromRGB(24, 28, 36);
  frame.BorderSizePixel = 0;
  frame.Parent = screenGui;

  const moneyLabel = new Instance('TextLabel');
  moneyLabel.Name = MONEY_LABEL_NAME;
  moneyLabel.Size = new UDim2(1, -16, 1, -16);
  moneyLabel.Position = new UDim2(0, 8, 0, 8);
  moneyLabel.BackgroundTransparency = 1;
  moneyLabel.Font = Enum.Font.GothamBold;
  moneyLabel.TextSize = 22;
  moneyLabel.TextColor3 = Color3.fromRGB(240, 244, 248);
  moneyLabel.TextXAlignment = Enum.TextXAlignment.Right;
  moneyLabel.Text = 'Money: 0';
  moneyLabel.Parent = frame;

  screenGui.Parent = playerGui;
  return moneyLabel;
}

function getCurrentMoney(): number {
  const value = Players.LocalPlayer.GetAttribute(ATTRIBUTES.Money);
  return typeIs(value, 'number') ? value : 0;
}

function updateMoneyLabel(label: TextLabel): void {
  const money = getCurrentMoney();
  label.Text = `Money: ${money}`;
}

export function startMoneyHudController(): void {
  const label = getOrCreateMoneyLabel();
  if (!label) return;

  updateMoneyLabel(label);

  Players.LocalPlayer.GetAttributeChangedSignal(ATTRIBUTES.Money).Connect(
    () => {
      updateMoneyLabel(label);
      logger.debug('MoneyHud', `所持金表示を更新: ${label.Text}`);
    },
  );
}
