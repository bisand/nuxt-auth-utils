/**
 * Hash a password using scrypt
 * @param password - The plain text password to hash
 * @returns The hashed password
 * @example
 * ```ts
 * const hashedPassword = await hashPassword('user_password')
 * ```
 * @more you can configure the scrypt options in `auth.hash.scrypt`
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Verify a password against a hashed password
 * @param hashedPassword - The hashed password to verify against
 * @param plainPassword - The plain text password to verify
 * @returns `true` if the password is valid, `false` otherwise
 * @example
 * ```ts
 * const isValid = await verifyPassword(hashedPassword, 'user_password')
 * ```
 * @more you can configure the scrypt options in `auth.hash.scrypt`
 */
export declare function verifyPassword(hashedPassword: string, plainPassword: string): Promise<boolean>;
