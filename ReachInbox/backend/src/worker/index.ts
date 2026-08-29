import { Worker } from '../queue/index';
import { prisma } from '../database/index';
import IORedis from 'ioredis';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
};

const redisConnection = new IORedis(redisConfig);
const rateLimitRedis = new IORedis(redisConfig);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transporter.verify()
  .then(() => console.log("SMTP VERIFIED"))
  .catch(err => console.error("SMTP VERIFY FAILED:", err));

const MAX_EMAILS_PER_HOUR = parseInt(process.env.MAX_EMAILS_PER_HOUR || '200', 10);
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '5', 10);
const DELAY_BETWEEN_EMAILS_MS = parseInt(process.env.DELAY_BETWEEN_EMAILS_MS || '2000', 10);

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkRateLimit(senderEmail: string): Promise<number> {
    const currentHour = new Date().toISOString().slice(0, 13);
    const key = `rate_limit:${senderEmail}:${currentHour}`;
    
    const count = await rateLimitRedis.incr(key);
    if (count === 1) {
        await rateLimitRedis.expire(key, 3600);
    }
    return count;
}

const emailWorker = new Worker('email-queue', async (job: any) => {
    console.log("JOB RECEIVED:", job.id, job.data);
    const { emailJobId } = job.data;
    
    const emailJob = await prisma.emailJob.findUnique({ where: { id: emailJobId } });
    
    if (!emailJob || emailJob.status === 'SENT') {
        return;
    }

    const count = await checkRateLimit(emailJob.senderEmail);

    if (count > MAX_EMAILS_PER_HOUR) {
        const nextHour = new Date();
        nextHour.setHours(nextHour.getHours() + 1);
        nextHour.setMinutes(0, 0, 0);
        const delay = nextHour.getTime() - Date.now();
        
        await job.moveToDelayed(Date.now() + delay, job.token!);
        throw new Error('RATE_LIMIT_EXCEEDED');
    }

    try {
        await transporter.sendMail({
            from: emailJob.senderEmail,
            to: emailJob.recipient,
            subject: emailJob.subject,
            text: emailJob.body,
        });

        await prisma.emailJob.update({
            where: { id: emailJobId },
            data: { status: 'SENT', sentAt: new Date() }
        });

        if (DELAY_BETWEEN_EMAILS_MS > 0) {
            await sleep(DELAY_BETWEEN_EMAILS_MS);
        }

    } catch (error: any) {
        if (error.message !== 'RATE_LIMIT_EXCEEDED') {
            await prisma.emailJob.update({
                where: { id: emailJobId },
                data: { status: 'FAILED', failedReason: error.message || 'Unknown error' }
            });
            throw error;
        }
    }
}, { 
    connection: redisConnection,
    concurrency: CONCURRENCY
});

emailWorker.on("completed", (job) => {
  console.log("COMPLETED:", job.id);
});

emailWorker.on("failed", (job, err) => {
  console.log("FAILED:", job?.id, err);
});

console.log('Mail worker started...');
