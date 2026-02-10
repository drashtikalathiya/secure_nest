export const SUMMARY_ICON_STYLES = {
  total: "bg-emerald-500/20 text-emerald-300",
  invites: "bg-indigo-500/20 text-indigo-300",
  owners: "bg-amber-500/20 text-amber-300",
};

export const FAMILY_MEMBERS = [
  {
    name: "Alexander Thompson",
    email: "alex.t@vault.family",
    initials: "AT",
    role: "Owner",
    status: "Active",
    access: "Full Access",
    permissions: { view: true, edit: true, delete: true },
  },
  {
    name: "Sarah Thompson",
    email: "sarah.t@vault.family",
    initials: "ST",
    role: "Owner",
    status: "Active",
    access: "Full Access",
    permissions: { view: true, edit: true, delete: true },
  },
  {
    name: "David Miller",
    email: "david.m@vault.family",
    initials: "DM",
    role: "Member",
    status: "Active",
    access: "Edit Permissions",
    permissions: { view: true, edit: true, delete: false },
  },
  {
    name: "Emily Roberts",
    email: "emily.r@gmail.com",
    initials: "ER",
    role: "Member",
    status: "Invited",
    access: "View Only",
    permissions: { view: true, edit: false, delete: false },
  },
];

export const ROLE_STYLES = {
  Owner: "bg-sky-500/20 text-sky-300",
  Member: "bg-slate-800/70 text-slate-300",
};

export const STATUS_STYLES = {
  Active: "text-emerald-300",
  Invited: "text-slate-400",
};
