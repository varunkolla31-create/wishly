import { customAlphabet } from "nanoid";

const URL_SAFE_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generate = customAlphabet(URL_SAFE_ALPHABET, 21);

export function newId(): string {
  return generate();
}
