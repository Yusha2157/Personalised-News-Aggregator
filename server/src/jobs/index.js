/**
 * Scheduled Jobs Index for Personalized News Aggregator
 * Central job scheduler and management
 */

import cron from 'node-cron';
import { logger } from '../config/logger.js';
import { CRON_SCHEDULES } from '../config/constants.js';
import { fetchJob } from './fetchJob.js';
import { cleanupJob } from './cleanupJob.js';
import { analyticsJob } from './analyticsJob.js';

class JobScheduler {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Start all scheduled jobs
   */
  startAll() {
    if (this.isRunning) {
      logger.warn('Job scheduler is already running');
      return;
    }

    logger.info('Starting scheduled jobs...');

    // Start news fetching job
    this.startJob('fetch-news', CRON_SCHEDULES.FETCH_NEWS, fetchJob.run);
    
    // Start cleanup job
    this.startJob('cleanup-articles', CRON_SCHEDULES.CLEANUP_ARTICLES, cleanupJob.run);
    
    // Start analytics update job
    this.startJob('update-analytics', CRON_SCHEDULES.UPDATE_TRENDING, analyticsJob.run);

    this.isRunning = true;
    logger.info('All scheduled jobs started');
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    if (!this.isRunning) {
      logger.warn('Job scheduler is not running');
      return;
    }

    logger.info('Stopping scheduled jobs...');

    for (const [name, job] of this.jobs) {
      job.destroy();
      logger.info(`Stopped job: ${name}`);
    }

    this.jobs.clear();
    this.isRunning = false;
    logger.info('All scheduled jobs stopped');
  }

  /**
   * Start a specific job
   * @param {string} name - Job name
   * @param {string} schedule - Cron schedule
   * @param {Function} task - Task function
   */
  startJob(name, schedule, task) {
    try {
      if (this.jobs.has(name)) {
        logger.warn(`Job ${name} is already running`);
        return;
      }

      const job = cron.schedule(schedule, async () => {
        logger.info(`Starting scheduled job: ${name}`);
        const startTime = Date.now();

        try {
          await task();
          const duration = Date.now() - startTime;
          logger.info(`Completed job: ${name} in ${duration}ms`);
        } catch (error) {
          const duration = Date.now() - startTime;
          logger.error(`Job ${name} failed after ${duration}ms:`, error);
        }
      }, {
        scheduled: false,
        timezone: 'UTC'
      });

      this.jobs.set(name, job);
      job.start();
      
      logger.info(`Started job: ${name} with schedule: ${schedule}`);
    } catch (error) {
      logger.error(`Failed to start job ${name}:`, error);
    }
  }

  /**
   * Stop a specific job
   * @param {string} name - Job name
   */
  stopJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.destroy();
      this.jobs.delete(name);
      logger.info(`Stopped job: ${name}`);
    } else {
      logger.warn(`Job ${name} not found`);
    }
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: Array.from(this.jobs.keys()).map(name => ({
        name,
        running: this.jobs.get(name).running
      }))
    };
  }

  /**
   * Run a job immediately
   * @param {string} name - Job name
   */
  async runJobNow(name) {
    const job = this.jobs.get(name);
    if (!job) {
      throw new Error(`Job ${name} not found`);
    }

    logger.info(`Running job immediately: ${name}`);
    
    switch (name) {
      case 'fetch-news':
        return await fetchJob.run();
      case 'cleanup-articles':
        return await cleanupJob.run();
      case 'update-analytics':
        return await analyticsJob.run();
      default:
        throw new Error(`Unknown job: ${name}`);
    }
  }
}

export const jobScheduler = new JobScheduler();

/**
 * Start scheduled jobs (exported function)
 */
export function startScheduledJobs() {
  jobScheduler.startAll();
}

/**
 * Stop scheduled jobs (exported function)
 */
export function stopScheduledJobs() {
  jobScheduler.stopAll();
}
