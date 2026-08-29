import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from '../database/index';
import { createRedisConnection, getEmailQueue, scheduleEmailJob } from '../queue/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const redisConn = createRedisConnection(
  process.env.REDIS_HOST || '127.0.0.1',
  parseInt(process.env.REDIS_PORT || '6379', 10)
);

const emailQueue = getEmailQueue(redisConn);

app.use(cors());
app.use(express.json());

app.post('/api/emails/schedule', async (req, res) => {
    try {
        const { senderEmail, subject, body, leads, startTime } = req.body;
        
        if (!senderEmail || !subject || !body || !leads || !Array.isArray(leads)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const scheduledTime = new Date(startTime);
        
        const jobs = await Promise.all(leads.map(async (lead: any) => {
            const emailJob = await prisma.emailJob.create({
                data: {
                    recipient: lead.email,
                    subject,
                    body,
                    senderEmail,
                    scheduledAt: scheduledTime
                }
            });

            const delay = Math.max(0, scheduledTime.getTime() - Date.now());
            await scheduleEmailJob(emailQueue, { emailJobId: emailJob.id }, delay);
            return emailJob;
        }));

        res.json({ success: true, count: jobs.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/emails/scheduled', async (req, res) => {
    try {
        const jobs = await prisma.emailJob.findMany({
            where: { status: 'PENDING' },
            orderBy: { scheduledAt: 'asc' }
        });
        res.json(jobs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/emails/sent', async (req, res) => {
    try {
        const jobs = await prisma.emailJob.findMany({
            where: {
                status: { in: ['SENT', 'FAILED'] }
            },
            orderBy: { sentAt: 'desc' }
        });
        res.json(jobs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});
