export class AntiBloatInjector {
  // Ponytail Protocol constraints
  private static readonly CONSTRAINTS = `
[YAGNI_CONSTRAINTS]
1. Generate the absolute minimum necessary output.
2. Never include boilerplate, apologies, or meta-commentary.
3. Reuse existing context rather than generating new theoretical frameworks.
[/YAGNI_CONSTRAINTS]
`;

  public static inject(prompt: string): string {
    return `${prompt}\n\n${this.CONSTRAINTS}`;
  }

  public static validate(promptTokens: number, responseTokens: number, maxRatio: number = 10): { isValid: boolean, reason?: string } {
    const ratio = responseTokens / (promptTokens || 1); // Avoid division by zero

    if (ratio > maxRatio) {
      return {
        isValid: false,
        reason: `Response token ratio (${ratio.toFixed(2)}x) exceeded maximum threshold of ${maxRatio}x. Force regeneration required.`
      };
    }

    return { isValid: true };
  }
}
