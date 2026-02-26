export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isStrongPassword = (password) => {
  return (
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
};

const PASSWORD_RULE_MESSAGE =
  "Password must be at least 6 characters, include 1 capital letter and 1 special character";

const requireField = (value, message) => {
  if (!String(value || "").trim()) {
    return message;
  }
  return null;
};

const validatePasswordField = (password) => {
  const missing = requireField(password, "Password is required");
  if (missing) return missing;
  if (!isStrongPassword(password)) return PASSWORD_RULE_MESSAGE;
  return null;
};

const validateEmailField = (email) => {
  const missing = requireField(email, "Email is required");
  if (missing) return missing;
  if (!isValidEmail(email)) return "Enter a valid email address";
  return null;
};

export const validateSignup = ({
  fullName,
  email,
  password,
  confirmPassword,
}) => {
  const errors = {};

  const nameError = requireField(fullName, "Full name is required");
  if (nameError) errors.fullName = nameError;

  const emailError = validateEmailField(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePasswordField(password);
  if (passwordError) errors.password = passwordError;

  const confirmError = requireField(
    confirmPassword,
    "Confirm password is required",
  );
  if (confirmError) {
    errors.confirmPassword = confirmError;
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};

  const emailError = validateEmailField(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePasswordField(password);
  if (passwordError) errors.password = passwordError;

  return errors;
};

export const validateResetPassword = ({ password, confirmPassword }) => {
  const errors = {};

  const passwordError = validatePasswordField(password);
  if (passwordError) errors.password = passwordError;

  const confirmError = requireField(
    confirmPassword,
    "Confirm password is required",
  );
  if (confirmError) {
    errors.confirmPassword = confirmError;
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};
