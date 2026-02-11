import {
  IconDeviceTv,
  IconBuildingBank,
  IconWifi,
  IconShare2,
  IconSourceCode,
  IconShoppingBag,
  IconBriefcase,
} from "@tabler/icons-react";

export const PASSWORD_INITIAL_CARDS = [
  {
    name: "Netflix Family",
    category: "Streaming",
    label: "USERNAME",
    value: "robert.smith@gmail.com",
    password: "password123",
    notes: "",
    access: "Shared",
  },
  {
    name: "Bank of America",
    category: "Banking",
    label: "USERNAME",
    value: "sarah.j_88",
    password: "password123",
    notes: "",
    access: "Only Owner",
  },
  {
    name: "Home Router",
    category: "Wi-Fi",
    label: "SSID",
    value: "FBI_SURVEILLANCE_VAN",
    password: "password123",
    notes: "",
    access: "Shared",
  },
  {
    name: "Facebook",
    category: "Social Media",
    label: "EMAIL",
    value: "robert.smith@gmail.com",
    password: "password123",
    notes: "",
    access: "Shared",
  },
];

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

export const PASSWORD_FALLBACK_ICON = IconBriefcase;

export const PASSWORD_SECURITY_LEVEL_STYLES = {
  Weak: {
    bar: "bg-rose-400",
    text: "text-rose-300",
    width: 28,
  },
  Moderate: {
    bar: "bg-amber-400",
    text: "text-amber-300",
    width: 52,
  },
  Strong: {
    bar: "bg-emerald-400",
    text: "text-emerald-300",
    width: 72,
  },
  Excellent: {
    bar: "bg-lime-400",
    text: "text-lime-300",
    width: 90,
  },
};

export const PASSWORD_ACCESS_STYLES = {
  Shared: "bg-sky-500/20 text-sky-200",
  "Only Owner": "bg-amber-500/20 text-amber-200",
};
