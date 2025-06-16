export function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Must be at least 8 characters");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Must include a lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Must include an uppercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Must include a number");
  }
  if (!/[\W_]/.test(password)) {
    errors.push("Must include a special character");
  }

  return errors;
}
