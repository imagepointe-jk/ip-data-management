import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
  const salt = 11;
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  givenPassword: string,
  hashedPassword: string
) {
  return bcrypt.compare(givenPassword, hashedPassword);
}
