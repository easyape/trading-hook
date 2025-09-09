import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

/**
 * Interface for task configuration
 */
export interface TaskConfig {
  name: string;
  cronExpression: string;
  callback: () => Promise<void> | void;
  onSuccess?: (result?: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Service for managing timed tasks
 */
@Injectable()
export class TimeTaskService {
  private readonly logger = new Logger(TimeTaskService.name);
  
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  /**
   * Create and register a new timed task
   * @param config Task configuration
   * @returns The name of the registered task
   */
  createTask(config: TaskConfig): string {
    const { name, cronExpression, callback, onSuccess, onError } = config;
    
    // Create a new cron job
    const job = new CronJob(cronExpression, async () => {
      try {
        this.logger.debug(`Executing task: ${name}`);
        const result = await callback();
        this.logger.debug(`Task ${name} executed successfully`);
        
        if (onSuccess) {
          onSuccess(result);
        }
      } catch (error) {
        this.logger.error(`Error executing task ${name}: ${error.message}`, error.stack);
        
        if (onError) {
          onError(error);
        }
      }
    });
    
    // Register the job with the scheduler
    this.schedulerRegistry.addCronJob(name, job);
    
    // Start the job
    job.start();
    
    this.logger.log(`Task ${name} registered and started with cron expression: ${cronExpression}`);
    return name;
  }

  /**
   * Stop and remove a registered task
   * @param name The name of the task to remove
   */
  removeTask(name: string): void {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.stop();
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.log(`Task ${name} stopped and removed`);
    } catch (error) {
      this.logger.error(`Error removing task ${name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Pause a registered task
   * @param name The name of the task to pause
   */
  pauseTask(name: string): void {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.stop();
      this.logger.log(`Task ${name} paused`);
    } catch (error) {
      this.logger.error(`Error pausing task ${name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Resume a paused task
   * @param name The name of the task to resume
   */
  resumeTask(name: string): void {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.start();
      this.logger.log(`Task ${name} resumed`);
    } catch (error) {
      this.logger.error(`Error resuming task ${name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all registered tasks
   * @returns Array of task names
   */
  getAllTasks(): string[] {
    const jobKeys = this.schedulerRegistry.getCronJobs().keys();
    return Array.from(jobKeys);
  }

  /**
   * Check if a task exists
   * @param name The name of the task to check
   * @returns True if the task exists, false otherwise
   */
  hasTask(name: string): boolean {
    try {
      this.schedulerRegistry.getCronJob(name);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Example of a predefined task using the @Cron decorator
   * This runs every day at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleDailyTask() {
    this.logger.debug('Daily task executed at midnight');
    // Implement your daily task logic here
  }

  /**
   * Example of a predefined task using the @Cron decorator
   * This runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  handleHourlyTask() {
    this.logger.debug('Hourly task executed');
    // Implement your hourly task logic here
  }
}
