class SessionService {
  private timeoutId: number | null = null;
  private warningTimeoutId: number | null = null;
  private idleTimeoutMinutes: number = 30; // Default 30 minutes
  private warningMinutes: number = 5; // Show warning 5 minutes before timeout
  private onTimeout: (() => void) | null = null;
  private onWarning: (() => void) | null = null;
  private lastActivity: number = Date.now();

  constructor() {
    // Removed activity listeners: timer only resets on login or explicit extension
    this.loadConfig();
  }

  private loadConfig() {
    // Load from localStorage or API config
    const config = localStorage.getItem('sessionConfig');
    if (config) {
      const parsed = JSON.parse(config);
      this.idleTimeoutMinutes = parsed.idleTimeoutMinutes || 10;
    }
  }

  public setConfig(idleTimeoutMinutes: number) {
    this.idleTimeoutMinutes = idleTimeoutMinutes;
    localStorage.setItem('sessionConfig', JSON.stringify({ idleTimeoutMinutes }));
    this.resetTimer();
  }

  public setCallbacks(onTimeout: () => void, onWarning: () => void) {
    this.onTimeout = onTimeout;
    this.onWarning = onWarning;
  }

  // Removed setupActivityListeners: timer is not reset by user activity

  private resetTimer() {
    this.clearTimers();
    
    const timeoutMs = this.idleTimeoutMinutes * 60 * 1000;
    const warningMs = (this.idleTimeoutMinutes - this.warningMinutes) * 60 * 1000;

    // Set warning timer
    if (this.warningMinutes < this.idleTimeoutMinutes) {
      this.warningTimeoutId = setTimeout(() => {
        this.onWarning?.();
      }, warningMs);
    }

    // Set timeout timer
    this.timeoutId = setTimeout(() => {
      this.onTimeout?.();
    }, timeoutMs);
  }

  private clearTimers() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }

  public start() {
    this.resetTimer();
  }

  public stop() {
    this.clearTimers();
  }

  public getRemainingTime(): number {
    const elapsed = Date.now() - this.lastActivity;
    const remaining = (this.idleTimeoutMinutes * 60 * 1000) - elapsed;
    return Math.max(0, Math.floor(remaining / 1000));
  }

  public getIdleTimeoutMinutes(): number {
    return this.idleTimeoutMinutes;
  }
}

export const sessionService = new SessionService();