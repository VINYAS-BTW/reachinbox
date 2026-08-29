import React from 'react';
import { format } from 'date-fns';
import { Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface EmailJob {
  id: string;
  recipient: string;
  subject: string;
  scheduledAt: string;
  sentAt?: string;
  status: string;
}

interface EmailsTableProps {
  emails: EmailJob[];
  loading: boolean;
  type: 'scheduled' | 'sent';
}

export default function EmailsTable({ emails, loading, type }: EmailsTableProps) {
  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading emails...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">No emails found</h3>
        <p className="text-slate-500 max-w-sm">
          {type === 'scheduled' 
            ? "You don't have any upcoming emails scheduled. Click 'Compose New Email' to get started." 
            : "No emails have been sent yet. Sent emails will appear here automatically."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="py-4 px-6 text-sm font-semibold text-slate-600">Recipient</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-600">Subject</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-600">
                {type === 'scheduled' ? 'Scheduled For' : 'Sent At'}
              </th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-600 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {emails.map((email) => (
              <tr key={email.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 text-sm text-slate-800 font-medium">{email.recipient}</td>
                <td className="py-4 px-6 text-sm text-slate-600 truncate max-w-xs">{email.subject}</td>
                <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                  {format(new Date(type === 'scheduled' ? email.scheduledAt : (email.sentAt || email.scheduledAt)), 'MMM d, yyyy h:mm a')}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {email.status === 'PENDING' && <Clock className="w-3.5 h-3.5 text-blue-500" />}
                    {email.status === 'SENT' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                    {email.status === 'FAILED' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                    
                    <span className={
                      email.status === 'PENDING' ? 'text-blue-700' :
                      email.status === 'SENT' ? 'text-green-700' :
                      'text-red-700'
                    }>
                      {email.status.charAt(0) + email.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
