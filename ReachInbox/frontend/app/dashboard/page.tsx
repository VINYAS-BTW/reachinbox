'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { LogOut, Plus, Search } from 'lucide-react';
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">ReachInbox</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 mr-4 border-r border-slate-200 pr-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{session.user?.name}</p>
                <p className="text-xs text-slate-500">{session.user?.email}</p>
              </div>
              {session.user?.image ? (
                <img src={session.user.image} alt="User Avatar" className="w-9 h-9 rounded-full border border-slate-200" />
              ) : (
                <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  {session.user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">Campaigns</h1>
            <p className="text-slate-500">Manage and monitor your email sequences.</p>
          </div>

          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-200 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Compose New Email
          </button>
        </div>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <Tabs.List className="flex border-b border-slate-200 mb-6 gap-6">
            <Tabs.Trigger
              value="scheduled"
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'scheduled'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
            >
              Scheduled Emails
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                {scheduledEmails.length}
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="sent"
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sent'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
            >
              Sent & Failed
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
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
