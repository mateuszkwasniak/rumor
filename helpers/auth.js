import { hash, compare } from "bcryptjs";

export const hashPassword = async (password) => {
  const hashedPwd = await hash(password, 12);
  return hashedPwd;
};

export const comparePasswords = async (frontPassword, dbPassword) => {
  const isValid = await compare(frontPassword, dbPassword);
  return isValid;
};
