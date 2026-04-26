import { I18nManager } from "react-native";

I18nManager.allowRTL(true);

if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}

if (typeof I18nManager.swapLeftAndRightInRTL === "function") {
  I18nManager.swapLeftAndRightInRTL(true);
}
