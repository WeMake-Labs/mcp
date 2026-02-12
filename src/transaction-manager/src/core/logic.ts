import { v4 as uuidv4 } from "uuid";
import chalk from "chalk";
import { setWithTTL, get, del, expire } from "../lib/redis-helper.js";
import { TxnResponse } from "./types.js";
import { DEFAULT_TTL_SECONDS, MAX_TTL_SECONDS, TOKEN_PREFIX } from "./constants.js";

export class TransactionLogic {
  /**
   * Generates a unique transaction token.
   */
  private generateToken(): string {
    return TOKEN_PREFIX + uuidv4();
  }

  /**
   * Calculates the expiry timestamp string.
   */
  private calculateExpiry(ttlSeconds: number): string {
    return new Date(Date.now() + ttlSeconds * 1000).toISOString();
  }

  /**
   * Validates and adjusts the TTL.
   */
  private getEffectiveTtl(requestTtl?: number): number {
    let effectiveTtl = Math.min(requestTtl ?? DEFAULT_TTL_SECONDS, MAX_TTL_SECONDS);
    if (effectiveTtl <= 0) effectiveTtl = DEFAULT_TTL_SECONDS;
    return effectiveTtl;
  }

  /**
   * Starts a new transaction.
   * @param payload Initial state payload
   * @param ttlSeconds Optional TTL in seconds
   * @returns The transaction response with the new token
   */
  public async startTransaction(payload?: unknown, ttlSeconds?: number): Promise<TxnResponse> {
    const effectiveTtl = this.getEffectiveTtl(ttlSeconds);
    const newToken = this.generateToken();

    const setResult = await setWithTTL(newToken, payload ?? {}, effectiveTtl);
    if (!setResult) {
      throw new Error("Failed to set initial state in Redis.");
    }

    return {
      status: "pending",
      token: newToken,
      payload: payload ?? {},
      expiresAt: this.calculateExpiry(effectiveTtl)
    };
  }

  /**
   * Resumes an existing transaction.
   * @param token The transaction token
   * @param payload Optional new payload to update state
   * @param ttlSeconds Optional TTL to extend expiry
   * @returns The transaction response with current state
   */
  public async resumeTransaction(token: string, payload?: unknown, ttlSeconds?: number): Promise<TxnResponse> {
    const effectiveTtl = this.getEffectiveTtl(ttlSeconds);

    const currentPayload = await get(token);
    if (currentPayload === null) {
      throw new Error(`Transaction token "${token}" not found or expired.`);
    }

    let finalPayload: unknown = currentPayload;
    if (payload !== undefined) {
      await setWithTTL(token, payload, effectiveTtl);
      finalPayload = payload;
    } else {
      await expire(token, effectiveTtl);
    }

    return {
      status: "pending",
      token: token,
      payload: finalPayload,
      expiresAt: this.calculateExpiry(effectiveTtl)
    };
  }

  /**
   * Closes a transaction.
   * @param token The transaction token
   * @returns The transaction response indicating closure
   */
  public async closeTransaction(token: string): Promise<TxnResponse> {
    const deleteResult = await del(token);
    if (deleteResult === 0) {
      console.warn(chalk.yellow(`Attempted to close non-existent or already closed token: ${token}`));
    }

    return {
      status: "closed",
      token: token,
      payload: undefined,
      expiresAt: null
    };
  }
}
