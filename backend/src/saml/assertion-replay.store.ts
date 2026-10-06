export class AssertionReplayStore {
  private readonly consumedAssertions = new Map<string, number>();

  hasBeenConsumed(assertionId: string): boolean {
    this.removeExpired();

    return this.consumedAssertions.has(assertionId);
  }

  consume(assertionId: string, expiresAt: number): void {
    this.consumedAssertions.set(assertionId, expiresAt);
  }

  private removeExpired(): void {
    const now = Date.now();

    for (const [assertionId, expiresAt] of this.consumedAssertions) {
      if (expiresAt <= now) {
        this.consumedAssertions.delete(assertionId);
      }
    }
  }
}