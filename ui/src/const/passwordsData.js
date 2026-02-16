import {
  IconDeviceTv,
  IconBuildingBank,
  IconWifi,
  IconShare2,
  IconSourceCode,
  IconShoppingBag,
} from "@tabler/icons-react";

export const PASSWORD_CATEGORY_OPTIONS = [
  "Streaming",
  "Banking",
  "Wi-Fi",
  "Social Media",
  "Work",
  "Shopping",
];

export const PASSWORD_CATEGORY_ICONS = {
  Streaming: IconDeviceTv,
  Banking: IconBuildingBank,
  "Wi-Fi": IconWifi,
  "Social Media": IconShare2,
  Work: IconSourceCode,
  Shopping: IconShoppingBag,
};

export const PASSWORD_CATEGORY_ICON_STYLES = {
  Streaming: "bg-rose-500/20 text-rose-300",
  Banking: "bg-sky-500/20 text-sky-300",
  "Wi-Fi": "bg-amber-500/20 text-amber-300",
  "Social Media": "bg-indigo-500/20 text-indigo-300",
  Work: "bg-blue-500/20 text-blue-300",
  Shopping: "bg-orange-500/20 text-orange-300",
};
