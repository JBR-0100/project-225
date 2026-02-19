import { Logger } from '../../infrastructure/Logger';

type JobHandler = (data: any) => Promise<void>;

interface Job {
    id: string;
    name: string;
    data: any;
    attempts: number;
    maxAttempts: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * In-memory Job Queue for background task processing.
 * Simulates BullMQ behavior without Redis dependency.
 */
export class JobQueue {
    private queue: Job[] = [];
    private handlers: Map<string, JobHandler> = new Map();
    private processing: boolean = false;
    private name: string;

    constructor(name: string) {
        this.name = name;
        Logger.info(`JobQueue "${name}" initialized`);
    }

    registerHandler(jobName: string, handler: JobHandler): void {
        this.handlers.set(jobName, handler);
        Logger.info(`Handler registered for job: ${jobName}`, { queue: this.name });
    }

    async addJob(jobName: string, data: any, maxAttempts: number = 3): Promise<string> {
        const job: Job = {
            id: `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: jobName,
            data,
            attempts: 0,
            maxAttempts,
            status: 'pending',
        };

        this.queue.push(job);
        Logger.info(`Job added to queue`, { queue: this.name, jobId: job.id, jobName });

        // Process immediately in the background (non-blocking)
        setImmediate(() => this.processQueue());

        return job.id;
    }

    private async processQueue(): Promise<void> {
        if (this.processing) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const job = this.queue.find(j => j.status === 'pending');
            if (!job) break;

            job.status = 'processing';
            job.attempts++;

            const handler = this.handlers.get(job.name);
            if (!handler) {
                Logger.warn(`No handler for job: ${job.name}`, { jobId: job.id });
                job.status = 'failed';
                continue;
            }

            try {
                await handler(job.data);
                job.status = 'completed';
                Logger.info(`Job completed`, { queue: this.name, jobId: job.id, jobName: job.name });
            } catch (error) {
                if (job.attempts >= job.maxAttempts) {
                    job.status = 'failed';
                    Logger.error(`Job failed after ${job.attempts} attempts`, { queue: this.name, jobId: job.id, error });
                } else {
                    job.status = 'pending'; // Retry
                    Logger.warn(`Job failed, retrying (${job.attempts}/${job.maxAttempts})`, { queue: this.name, jobId: job.id });
                }
            }
        }

        // Clean completed/failed jobs
        this.queue = this.queue.filter(j => j.status === 'pending');
        this.processing = false;
    }

    getStats(): { pending: number; completed: number; failed: number } {
        return {
            pending: this.queue.filter(j => j.status === 'pending').length,
            completed: this.queue.filter(j => j.status === 'completed').length,
            failed: this.queue.filter(j => j.status === 'failed').length,
        };
    }
}
