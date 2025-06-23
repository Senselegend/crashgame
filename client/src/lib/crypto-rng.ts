export class CryptoRNG {
  static generateSecureRandom(): number {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xFFFFFFFF + 1);
  }

  static generateCrashPoint(): number {
    const random = this.generateSecureRandom();
    const houseEdge = 0.03;
    
    // Use inverse exponential distribution for crash points
    // This creates realistic crash patterns
    const crashPoint = Math.max(1.01, Math.min(50, 1 / (1 - random) * (1 - houseEdge)));
    return Math.round(crashPoint * 100) / 100;
  }
}
