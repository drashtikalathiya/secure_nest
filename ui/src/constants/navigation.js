import {
  IconLayoutDashboard,
  IconUsers,
  IconKey,
  IconAddressBook,
  IconFileText,
} from "@tabler/icons-react";

export const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: IconLayoutDashboard },
  { label: "Family Members", to: "/members", icon: IconUsers },
  { label: "Passwords", to: "/passwords", icon: IconKey, moduleKey: "passwords" },
  { label: "Contacts", to: "/contacts", icon: IconAddressBook, moduleKey: "contacts" },
  { label: "Documents", to: "/documents", icon: IconFileText, moduleKey: "documents" },
];
