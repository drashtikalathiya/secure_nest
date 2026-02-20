const normalizeAccess = (value, fallback = "none") => {
  if (value === "none" || value === "view" || value === "edit") {
    return value;
  }

  return fallback;
};

const getModuleAccessKey = (moduleKey) => {
  if (moduleKey === "passwords") return "permission_password_access_level";
  if (moduleKey === "contacts") return "permission_contacts_access_level";
  if (moduleKey === "documents") return "permission_documents_access_level";
  return null;
};

export const getModuleAccessLevel = (user, moduleKey) => {
  if (!user) return "none";
  if (user.role === "owner") return "edit";

  const key = getModuleAccessKey(moduleKey);
  if (!key) return "none";
  return normalizeAccess(user[key], "none");
};

export const canViewModule = (user, moduleKey) => {
  const access = getModuleAccessLevel(user, moduleKey);
  return access === "view" || access === "edit";
};

export const canEditModule = (user, moduleKey) => {
  return getModuleAccessLevel(user, moduleKey) === "edit";
};
