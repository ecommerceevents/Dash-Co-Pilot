import CryptoJS from "crypto-js";

function encrypt(text: string) {
  const secret = process.env.CRYPTO_SECRET?.toString();
  if (!secret) {
    throw Error("CRYPTO_SECRET env variable not set");
  }
  const ciphertext = CryptoJS.AES.encrypt(text, secret).toString();
  return ciphertext;
}

function decrypt(ciphertext: string) {
  const secret = process.env.CRYPTO_SECRET?.toString();
  if (!secret) {
    throw Error("CRYPTO_SECRET env variable not set");
  }
  const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}

export default {
  encrypt,
  decrypt,
};
