require("dotenv").config();

export const get = (key: string): string => {
  const value = process.env[key];

  if (value) return value;

  throw new Error(`${key} must be set in ENV.`);
};
