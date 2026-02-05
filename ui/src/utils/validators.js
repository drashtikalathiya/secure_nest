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

export const validateSignup = ({
  fullName,
  email,
  password,
  confirmPassword,
}) => {
  const errors = {};

  if (!fullName.trim()) {
    errors.fullName = "Full name is required";
  }

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!password.trim()) {
    errors.password = "Password is required";
  } else if (!isStrongPassword(password)) {
    errors.password =
      "Password must be at least 6 characters, include 1 capital letter and 1 special character";
  }

  if (!confirmPassword.trim()) {
    errors.confirmPassword = "Confirm password is required";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!password.trim()) {
    errors.password = "Password is required";
  } else if (!isStrongPassword(password)) {
    errors.password =
      "Password must be at least 6 characters, include 1 capital letter and 1 special character";
  }

  return errors;
};
