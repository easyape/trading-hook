# TimeTask Infrastructure

This module provides a flexible infrastructure for scheduling and managing timed tasks in the application.

## Features

- Schedule tasks using cron expressions
- Manage task lifecycle (create, pause, resume, remove)
- Handle success and error callbacks
- Predefined tasks using decorators
- Dynamic task registration

## Usage

### Basic Setup

The TimeTask module is already integrated into the application. It's imported in the `app.module.ts` file.

### Creating Tasks

There are two ways to create timed tasks:

#### 1. Using the `@Cron` decorator

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class YourService {
  @Cron(CronExpression.EVERY_HOUR)
  handleHourlyTask() {
    // Your task logic here
    console.log('Task executed every hour');
  }
}
```

#### 2. Using the TimeTaskService

```typescript
import { Injectable } from '@nestjs/common';
import { TimeTaskService } from '../timetask/timetask.service';

@Injectable()
export class YourService {
  constructor(private readonly timeTaskService: TimeTaskService) {
    this.registerYourTask();
  }

  private registerYourTask(): void {
    this.timeTaskService.createTask({
      name: 'your-task-name',
      cronExpression: '0 0 * * *', // Run at midnight every day
      callback: async () => {
        // Your task logic here
        console.log('Task executed');
      },
      onSuccess: () => {
        console.log('Task completed successfully');
      },
      onError: (error) => {
        console.error('Task failed:', error.message);
      }
    });
  }
}
```

### Managing Tasks

```typescript
// Pause a task
timeTaskService.pauseTask('your-task-name');

// Resume a task
timeTaskService.resumeTask('your-task-name');

// Remove a task
timeTaskService.removeTask('your-task-name');

// Get all registered tasks
const tasks = timeTaskService.getAllTasks();

// Check if a task exists
const exists = timeTaskService.hasTask('your-task-name');
```

## Cron Expression Format

Cron expressions follow the standard format:

```
* * * * *
│ │ │ │ │
│ │ │ │ └── day of week (0 - 7) (0 or 7 is Sunday)
│ │ │ └──── month (1 - 12)
│ │ └────── day of month (1 - 31)
│ └──────── hour (0 - 23)
└────────── minute (0 - 59)
```

Common patterns:
- `* * * * *`: Every minute
- `0 * * * *`: Every hour at minute 0
- `0 0 * * *`: Every day at midnight
- `0 0 * * 0`: Every Sunday at midnight
- `0 0 1 * *`: First day of every month at midnight
- `*/5 * * * *`: Every 5 minutes

## Examples

Check the `examples` directory for sample implementations:
- `balance-update.task.ts`: Daily balance update task
- `trading-monitor.task.ts`: Market monitoring and price alert tasks

## Integration

To use the TimeTask infrastructure in your service:

1. Import the TimeTaskService in your service
2. Inject it in the constructor
3. Create and register your tasks

```typescript
import { Injectable } from '@nestjs/common';
import { TimeTaskService } from '../timetask/timetask.service';

@Injectable()
export class YourService {
  constructor(private readonly timeTaskService: TimeTaskService) {
    // Register your tasks here
  }
}
```
