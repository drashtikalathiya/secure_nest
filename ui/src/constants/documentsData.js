import { IconFileDescription, IconFileTypePdf } from "@tabler/icons-react";

export const DOCUMENT_CATEGORIES = [
  "Identity",
  "Legal",
  "Property",
  "Medical",
  "Insurance",
  "Finance",
  "Personal",
];

export const ACCEPT_TYPES = ".pdf,.png,.jpg,.jpeg,.doc,.docx";

export const FILE_TYPE_CONFIG = {
  PDF: {
    kind: "pdf",
    label: "PDF",
    icon: IconFileTypePdf,
    iconClassName: "text-rose-300",
    glowClassName: "bg-rose-500/20",
  },
  DOC: {
    kind: "doc",
    label: "DOC",
    icon: IconFileDescription,
    iconClassName: "text-sky-200",
    glowClassName: "bg-sky-500/20",
  },
  DOCX: {
    kind: "doc",
    label: "DOC",
    icon: IconFileDescription,
    iconClassName: "text-sky-200",
    glowClassName: "bg-sky-500/20",
  },
  IMAGE: {
    kind: "image",
    label: "IMAGE",
    icon: null,
    iconClassName: "",
    glowClassName: "bg-slate-500/10",
  },
};
