'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { X, AlertCircle } from 'lucide-react';

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
        startTime: new Date(startTime).toISOString(),
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

  const inputClass =
    'w-full px-3 py-2 border border-neutral-200 bg-white text-sm text-neutral-900 outline-none focus:border-neutral-950 placeholder:text-neutral-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-neutral-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h2 className="text-base font-semibold text-neutral-900">New campaign</h2>
          <button type="button" onClick={onClose} className="text-neutral-400 p-1 rounded-lg cursor-pointer hover:bg-neutral-100 hover:text-neutral-600 transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="border border-neutral-200 bg-neutral-50 text-neutral-700 p-3 flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputClass}
              placeholder="Subject line"
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Body
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className={`${inputClass} resize-none`}
              placeholder="Email content"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Leads CSV
            </label>
            <div className="border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                aria-label="Upload leads CSV file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <p className="text-sm text-neutral-700">Upload a CSV with an email column</p>
              {leads.length > 0 && (
                <p className="text-xs text-neutral-500 mt-2 tabular-nums">
                  {leads.length} leads loaded
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Start time
              </label>
              <input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="delay" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Delay between emails (seconds)
              </label>
              <input
                id="delay"
                type="number"
                min="0"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="hourlyLimit" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Hourly limit
              </label>
              <input
                id="hourlyLimit"
                type="number"
                min="1"
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 px-5 py-4 bg-neutral-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 rounded-lg cursor-pointer hover:bg-neutral-200 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSchedule}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-neutral-950 rounded-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Scheduling…' : 'Schedule campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}
