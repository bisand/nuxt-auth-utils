import { Hash } from "@adonisjs/hash";
import { Scrypt } from "@adonisjs/hash/drivers/scrypt";
import { useRuntimeConfig } from "#imports";
let _hash;
function getHash() {
  if (!_hash) {
    const options = useRuntimeConfig().hash?.scrypt;
    const scrypt = new Scrypt(options);
    _hash = new Hash(scrypt);
  }
  return _hash;
}
export async function hashPassword(password) {
  return await getHash().make(password);
}
export async function verifyPassword(hashedPassword, plainPassword) {
  return await getHash().verify(hashedPassword, plainPassword);
}
