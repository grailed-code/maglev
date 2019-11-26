require("dotenv").config();

/**
 * get :: String -> String
 *
 * Returns the value of the given key from the process.env. If there is no value at the key, throws
 * an error.
 */
export const get = (key: string): string => {
  const value = process.env[key];

  if (value) return value;

  throw new Error(`${key} must be set in ENV.`);
};
