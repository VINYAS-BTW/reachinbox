'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { X, UploadCloud, Calendar, Clock, AlertCircle } from 'lucide-react';

interface ComposeEmailModalProps {
  onClose: () => void;
  senderEmail: string;
}

export default function ComposeEmailModal({ onClose, senderEmail }: ComposeEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [startTime, setStartTime] = useState('');
  const [delay, setDelay] = useState(2);
  const [hourlyLimit, setHourlyLimit] = useState(200);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          const validLeads = results.data.filter((row: any) => row.email);
          setLeads(validLeads);
        },
        error: () => {
          setError('Failed to parse CSV file.');
        }
      });
    }
  };

  const handleSchedule = async () => {
    if (!subject || !body || leads.length === 0 || !startTime) {
      setError('Please fill in all required fields and upload a valid CSV.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/emails/schedule`, {
        senderEmail,
        subject,
        body,
        leads,
        startTime,
        delay,
        hourlyLimit,
      });

      if (response.data.success) {
        onClose();
      } else {
        setError('Failed to schedule emails.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred while scheduling.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">Compose New Sequence</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-500"
              placeholder="Exciting news from our team!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-1.5">Email Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none placeholder:text-slate-500"
              placeholder="Hi there,&#10;&#10;I wanted to reach out because..."
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center relative hover:bg-slate-100 transition-colors cursor-pointer group">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">Click or drag CSV file to upload leads</p>
            <p className="text-xs text-slate-500 mt-1">Must contain an 'email' column header</p>

            {leads.length > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {leads.length} leads detected
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" /> Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Delay between emails (sec)
              </label>
              <input
                type="number"
                min="0"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Hourly Limit (Emails/hour)
              </label>
              <input
                type="number"
                min="1"
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Scheduling...' : 'Schedule Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}
