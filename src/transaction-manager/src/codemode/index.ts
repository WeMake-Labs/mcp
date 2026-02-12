import { TransactionLogic } from "../core/logic.js";
import { TxnResponse } from "../core/types.js";

/**
 * TransactionManager provides a programmatic API for managing stateful transactions.
 * This class serves as the main entry point for the Code Mode architecture.
 */
export class TransactionManager {
  private logic: TransactionLogic;

  constructor() {
    this.logic = new TransactionLogic();
  }

  /**
   * Starts a new transaction with an optional initial payload and TTL.
   *
   * @param payload - Initial data to store in the transaction state.
   * @param ttlSeconds - Time-to-live in seconds (defaults to 3600).
   * @returns A promise resolving to the transaction response containing the new token.
   */
  public async start(payload?: unknown, ttlSeconds?: number): Promise<TxnResponse> {
    return this.logic.startTransaction(payload, ttlSeconds);
  }

  /**
   * Resumes an existing transaction, optionally updating its payload and extending its TTL.
   *
   * @param token - The unique transaction token.
   * @param payload - New data to update the transaction state (optional).
   * @param ttlSeconds - New TTL to extend the transaction expiry (optional).
   * @returns A promise resolving to the transaction response with the current state.
   * @throws Error if the token is invalid or expired.
   */
  public async resume(token: string, payload?: unknown, ttlSeconds?: number): Promise<TxnResponse> {
    return this.logic.resumeTransaction(token, payload, ttlSeconds);
  }

  /**
   * Closes an active transaction, removing it from storage.
   *
   * @param token - The unique transaction token to close.
   * @returns A promise resolving to the transaction response indicating closure.
   */
  public async close(token: string): Promise<TxnResponse> {
    return this.logic.closeTransaction(token);
  }
}
