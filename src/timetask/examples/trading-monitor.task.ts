import { Injectable } from '@nestjs/common';
import { TimeTaskService } from '../timetask.service';

/**
 * Example task for monitoring trading activities
 * This demonstrates how to use the TimeTask infrastructure for more frequent tasks
 */
@Injectable()
export class TradingMonitorTask {
  constructor(private readonly timeTaskService: TimeTaskService) {
    // Register the tasks when the service is instantiated
    this.registerMarketMonitorTask();
    this.registerPriceAlertTask();
  }

  /**
   * Register a task to monitor market conditions every 5 minutes
   */
  private registerMarketMonitorTask(): void {
    this.timeTaskService.createTask({
      name: 'market-monitor',
      cronExpression: '*/5 * * * *', // Run every 5 minutes
      callback: async () => {
        console.log('Running market monitoring task');
        
        // Example: Check market conditions, trading volumes, etc.
        await this.checkMarketConditions();
      },
      onSuccess: () => {
        console.log('Market monitoring completed successfully');
      },
      onError: (error) => {
        console.error('Market monitoring failed:', error.message);
      }
    });
  }

  /**
   * Register a task to check price alerts every minute
   */
  private registerPriceAlertTask(): void {
    this.timeTaskService.createTask({
      name: 'price-alert-check',
      cronExpression: '* * * * *', // Run every minute
      callback: async () => {
        console.log('Checking price alerts');
        
        // Example: Check if any price alerts should be triggered
        await this.checkPriceAlerts();
      },
      onSuccess: () => {
        console.log('Price alert check completed successfully');
      },
      onError: (error) => {
        console.error('Price alert check failed:', error.message);
      }
    });
  }

  /**
   * Example method to check market conditions
   */
  private async checkMarketConditions(): Promise<void> {
    // This is where you would implement market monitoring logic
    // For example:
    // 1. Fetch current market data from exchanges
    // 2. Analyze trends and patterns
    // 3. Log or alert on significant changes
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Market conditions checked');
  }

  /**
   * Example method to check price alerts
   */
  private async checkPriceAlerts(): Promise<void> {
    // This is where you would implement price alert logic
    // For example:
    // 1. Fetch current prices for watched assets
    // 2. Compare against user-defined alert thresholds
    // 3. Trigger notifications if thresholds are crossed
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Price alerts checked');
  }
}
