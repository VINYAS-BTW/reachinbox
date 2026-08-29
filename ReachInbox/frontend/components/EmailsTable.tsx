import React from 'react';
import { format } from 'date-fns';

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

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function EmailsTable({ emails, loading, type }: EmailsTableProps) {
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <p className="text-sm text-neutral-500">Loading emails</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="w-full py-16 px-4 bg-white border border-neutral-200 text-center">
        <p className="text-sm font-medium text-neutral-900">No emails</p>
        <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
          {type === 'scheduled'
            ? 'Create a campaign to schedule outbound email.'
            : 'Sent and failed jobs will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">Recipient</th>
              <th className="py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">Subject</th>
              <th className="py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                {type === 'scheduled' ? 'Scheduled' : 'Sent'}
              </th>
              <th className="py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {emails.map((email) => (
              <tr key={email.id}>
                <td className="py-3 px-4 text-sm text-neutral-900">{email.recipient}</td>
                <td className="py-3 px-4 text-sm text-neutral-600 truncate max-w-xs">{email.subject}</td>
                <td className="py-3 px-4 text-sm text-neutral-500 whitespace-nowrap tabular-nums">
                  {format(
                    new Date(type === 'scheduled' ? email.scheduledAt : (email.sentAt || email.scheduledAt)),
                    'MMM d, yyyy h:mm a'
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
                    {formatStatus(email.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
