import {
  IconKey,
  IconFileText,
  IconCreditCard,
  IconUsersGroup,
  IconAddressBook,
} from "@tabler/icons-react";

export const VAULT_SECTIONS = [
  {
    label: "Family Members",
    meta: "Updated yesterday",
    count: "15",
    icon: IconUsersGroup,
    accent: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300",
    to: "/members",
  },
  {
    label: "Passwords",
    meta: "Last added 3h ago",
    count: "128",
    icon: IconKey,
    accent: "text-sky-400",
    badge: "bg-sky-500/20 text-sky-300",
    to: "/passwords",
  },
  {
    label: "Contacts",
    meta: "Emergency list synced",
    count: "36",
    icon: IconAddressBook,
    accent: "text-violet-400",
    badge: "bg-violet-500/20 text-violet-300",
    to: "/contacts",
  },
  {
    label: "Documents",
    meta: "2 files expiring soon",
    count: "42",
    icon: IconFileText,
    accent: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-300",
    to: "/documents",
  },
];
