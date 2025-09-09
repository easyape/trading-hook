import { Injectable } from '@nestjs/common';
import { TimeTaskService } from '../timetask.service';

/**
 * Example task for updating user balances
 * This demonstrates how to use the TimeTask infrastructure
 */
@Injectable()
export class BalanceUpdateTask {
  constructor(private readonly timeTaskService: TimeTaskService) {
    // Register the task when the service is instantiated
    this.registerBalanceUpdateTask();
  }

  /**
   * Register a task to update user balances daily
   */
  private registerBalanceUpdateTask(): void {
    this.timeTaskService.createTask({
      name: 'daily-balance-update',
      cronExpression: '0 0 * * *', // Run at midnight every day
      callback: async () => {
        // Implement your balance update logic here
        console.log('Running daily balance update task');
        
        // Example: Update balances, calculate interest, etc.
        await this.performBalanceUpdate();
      },
      onSuccess: () => {
        console.log('Balance update completed successfully');
      },
      onError: (error) => {
        console.error('Balance update failed:', error.message);
      }
    });
  }

  /**
   * Example method to perform the actual balance update
   */
  private async performBalanceUpdate(): Promise<void> {
    // This is where you would implement the actual balance update logic
    // For example, you might:
    // 1. Fetch all user balances
    // 2. Apply interest or other calculations
    // 3. Update the balances in the database
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Balance update logic executed');
  }
}
