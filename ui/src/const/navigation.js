import {
  IconLayoutDashboard,
  IconUsers,
  IconKey,
  IconAddressBook,
  IconFileText,
  IconCreditCard,
  IconHeartbeat,
} from "@tabler/icons-react";

export const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: IconLayoutDashboard },
  { label: "Family Members", to: "/members", icon: IconUsers },
  { label: "Passwords", to: "/passwords", icon: IconKey },
  { label: "Contacts", to: "/contacts", icon: IconAddressBook },
  { label: "Documents", to: "/documents", icon: IconFileText },
  { label: "Finance", to: "/finance", icon: IconCreditCard },
  { label: "Medical Records", to: "/medical", icon: IconHeartbeat },
];
