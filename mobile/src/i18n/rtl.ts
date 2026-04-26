import { I18nManager } from "react-native";

I18nManager.allowRTL(false);

if (I18nManager.isRTL) {
  I18nManager.forceRTL(false);
}

if (typeof I18nManager.swapLeftAndRightInRTL === "function") {
  I18nManager.swapLeftAndRightInRTL(false);
}
