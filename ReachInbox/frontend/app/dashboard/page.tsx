'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { LogOut, Plus } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import ComposeEmailModal from '../../components/ComposeEmailModal';
import EmailsTable from '../../components/EmailsTable';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('scheduled');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchEmails();
    }
  }, [status, router]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const [scheduledRes, sentRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/emails/scheduled`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/emails/sent`)
      ]);
      setScheduledEmails(scheduledRes.data);
      setSentEmails(sentRes.data);
    } catch (error) {
      console.error('Failed to fetch emails', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComposeClose = () => {
    setIsComposeOpen(false);
    fetchEmails();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-500">Loading</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white tracking-tight">ReachInbox</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 mr-2 border-r border-neutral-800 pr-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{session.user?.name}</p>
                <p className="text-xs text-neutral-400">{session.user?.email}</p>
              </div>
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-8 h-8 rounded-full border border-neutral-700"
                />
              ) : (
                <div className="w-8 h-8 bg-neutral-800 text-neutral-300 rounded-full flex items-center justify-center text-sm font-medium">
                  {session.user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2 text-sm text-neutral-400"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Campaigns</h1>
            <p className="text-sm text-neutral-500 mt-1">Scheduled and sent email jobs</p>
          </div>

          <button
            type="button"
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 bg-neutral-950 text-white px-4 py-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New campaign
          </button>
        </div>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <Tabs.List className="flex border-b border-neutral-200 mb-6 gap-6">
            <Tabs.Trigger
              value="scheduled"
              className={`pb-3 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'scheduled'
                  ? 'border-neutral-950 text-neutral-950'
                  : 'border-transparent text-neutral-500'
              }`}
            >
              Scheduled
              <span className="ml-2 text-xs text-neutral-400 tabular-nums">
                {scheduledEmails.length}
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="sent"
              className={`pb-3 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'sent'
                  ? 'border-neutral-950 text-neutral-950'
                  : 'border-transparent text-neutral-500'
              }`}
            >
              Sent & failed
              <span className="ml-2 text-xs text-neutral-400 tabular-nums">
                {sentEmails.length}
              </span>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="scheduled" className="flex-1 outline-none">
            <EmailsTable emails={scheduledEmails} loading={loading} type="scheduled" />
          </Tabs.Content>
          <Tabs.Content value="sent" className="flex-1 outline-none">
            <EmailsTable emails={sentEmails} loading={loading} type="sent" />
          </Tabs.Content>
        </Tabs.Root>
      </main>

      {isComposeOpen && (
        <ComposeEmailModal
          onClose={handleComposeClose}
          senderEmail={session.user?.email || 'noreply@reachinbox.ai'}
        />
      )}
    </div>
  );
}
