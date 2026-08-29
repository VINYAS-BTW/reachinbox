import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

export interface EmailJobPayload {
  emailJobId: string;
}

export function createRedisConnection(host: string, port: number) {
  return new IORedis({
    host,
    port,
    maxRetriesPerRequest: null,
  });
}

export function getEmailQueue(connection: IORedis) {
  return new Queue('email-queue', { connection });
}

export async function scheduleEmailJob(queue: Queue, jobData: EmailJobPayload, delay: number) {
  await queue.add('send-email', jobData, { delay, removeOnComplete: true, removeOnFail: false });
}

export { Worker, Job };
