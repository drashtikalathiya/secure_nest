import {
  IconAddressBook,
  IconKey,
  IconUserPlus,
  IconUpload,
  IconUsersGroup,
  IconFileText,
} from "@tabler/icons-react";

export const VAULT_SECTIONS = [
  {
    label: "Family Members",
    icon: IconUsersGroup,
    accent: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300",
    to: "/members",
  },
  {
    label: "Passwords",
    icon: IconKey,
    accent: "text-sky-400",
    badge: "bg-sky-500/20 text-sky-300",
    to: "/passwords",
  },
  {
    label: "Contacts",
    icon: IconAddressBook,
    accent: "text-violet-400",
    badge: "bg-violet-500/20 text-violet-300",
    to: "/contacts",
  },
  {
    label: "Documents",
    icon: IconFileText,
    accent: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-300",
    to: "/documents",
  },
];

export const QUICK_ACTIONS = [
  {
    id: "quick-password",
    label: "Add New Password",
    description: "Generate a secure login",
    to: "/passwords",
    icon: IconKey,
  },
  {
    id: "quick-invite",
    label: "Invite Member",
    description: "Add a trusted family member",
    to: "/members",
    icon: IconUserPlus,
  },
  {
    id: "quick-upload",
    label: "Upload Document",
    description: "Scan or drop PDF files",
    to: "/documents",
    icon: IconUpload,
  },
  {
    id: "quick-contact",
    label: "Add New Contact ",
    description: "Add your secure contact",
    to: "/contacts",
    icon: IconAddressBook,
  },
];

export const MODULE_LABELS = {
  passwords: "Passwords",
  documents: "Documents",
  contacts: "Contacts",
  members: "Members",
};

export const MODULE_AVATAR = {
  passwords: "bg-emerald-500/20 text-emerald-200",
  documents: "bg-sky-500/20 text-sky-200",
  contacts: "bg-amber-500/20 text-amber-200",
  members: "bg-indigo-500/20 text-indigo-200",
};
