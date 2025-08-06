// SkifyMagicAI Development Debug Logger
// Real-time progress tracking for owner visibility

export class SkifyDebugLogger {
  private static instance: SkifyDebugLogger;
  private logBuffer: string[] = [];
  private isEnabled = true;

  static getInstance(): SkifyDebugLogger {
    if (!SkifyDebugLogger.instance) {
      SkifyDebugLogger.instance = new SkifyDebugLogger();
    }
    return SkifyDebugLogger.instance;
  }

  log(component: string, action: string, details?: any) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logEntry = `[${timestamp}] SKIFY ${component.toUpperCase()}: ${action}`;
    
    console.log(`🚀 ${logEntry}`, details || '');
    this.logBuffer.push(logEntry);
    
    // Keep only last 50 logs
    if (this.logBuffer.length > 50) {
      this.logBuffer = this.logBuffer.slice(-50);
    }
  }

  success(component: string, action: string) {
    this.log(component, `✅ ${action}`);
  }

  error(component: string, action: string, error?: any) {
    this.log(component, `❌ ${action}`, error);
  }

  progress(component: string, action: string, progress: number) {
    this.log(component, `⏳ ${action} (${progress}%)`);
  }

  api(endpoint: string, method: string, status?: number) {
    this.log('API', `${method} ${endpoint} ${status ? `→ ${status}` : ''}`);
  }

  getLogs(): string[] {
    return [...this.logBuffer];
  }

  clearLogs() {
    this.logBuffer = [];
    console.clear();
    this.log('SYSTEM', 'Debug logs cleared');
  }
}

export const debugLogger = SkifyDebugLogger.getInstance();

// Initialize debug logging
debugLogger.log('SYSTEM', 'Debug logging initialized for SkifyMagicAI development');
debugLogger.log('DEVELOPER', 'ChatGPT (@openai-dev-helper) active with full project control');