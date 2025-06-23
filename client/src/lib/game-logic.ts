export class GameLogic {
  static readonly HOUSE_EDGE = 0.03;
  static readonly MAX_MULTIPLIER = 50;
  static readonly MIN_MULTIPLIER = 1.01;
  static readonly MIN_BET = 10;

  static calculateMultiplier(elapsedMs: number): number {
    // Formula: Multiplier = e^(0.0001 * t) * (1 - house_edge)
    const multiplier = Math.pow(Math.E, 0.0001 * elapsedMs) * (1 - this.HOUSE_EDGE);
    return Math.max(1.0, Math.min(this.MAX_MULTIPLIER, multiplier));
  }

  static calculateWinAmount(betAmount: number, multiplier: number): number {
    return Math.round(betAmount * multiplier);
  }

  static isValidBet(amount: number, balance: number): boolean {
    return amount >= this.MIN_BET && amount <= balance && Number.isInteger(amount);
  }

  static isValidAutoStop(multiplier: number): boolean {
    return multiplier >= this.MIN_MULTIPLIER && multiplier <= this.MAX_MULTIPLIER;
  }

  static calculateLevel(totalWagered: number): number {
    return Math.floor(totalWagered / 5000) + 1;
  }

  static calculateLevelReward(level: number): number {
    return 500 * level;
  }

  static shouldTriggerInsurance(consecutiveLosses: number): boolean {
    return consecutiveLosses > 0 && consecutiveLosses % 10 === 0;
  }

  static calculateInsuranceAmount(betAmount: number): number {
    return Math.round(betAmount * 0.5);
  }

  static canClaimDailyBonus(lastClaimTimestamp: number): boolean {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    return now - lastClaimTimestamp >= dayInMs;
  }

  static getDailyBonusAmount(): number {
    return 1000;
  }

  static isLuckyHour(): boolean {
    const now = new Date();
    const hour = now.getHours();
    // Lucky hour is from 12:00-13:00 (noon)
    return hour === 12;
  }

  static getLuckyHourMultiplier(): number {
    return 2;
  }
}
