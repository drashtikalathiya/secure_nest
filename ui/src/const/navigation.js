import {
  IconLayoutDashboard,
  IconUsers,
  IconKey,
  IconAddressBook,
  IconFileText,
  IconSettings,
} from "@tabler/icons-react";

export const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: IconLayoutDashboard },
  { label: "Family Members", to: "/members", icon: IconUsers },
  { label: "Passwords", to: "/passwords", icon: IconKey },
  { label: "Contacts", to: "/contacts", icon: IconAddressBook },
  { label: "Documents", to: "/documents", icon: IconFileText },
  { label: "Settings", to: "/settings", icon: IconSettings },
];
