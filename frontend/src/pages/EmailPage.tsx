import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { emailApi, reminderApi } from '@/api/services';
import { Mail, Send, Play, CheckCircle2, Clock, FileText, AlertCircle, RefreshCw, Settings } from 'lucide-react';

export default function EmailPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [reminderConfigs, setReminderConfigs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Test send form
  const [testEmail, setTestEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('renewal_reminder_30');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  // Queue process
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tList, qRes, lRes, cList] = await Promise.all([
        emailApi.getTemplates(),
        emailApi.getQueue(),
        emailApi.getLogs(),
        reminderApi.getConfigs(),
      ]);
      setTemplates(tList);
      setQueue(qRes.content || []);
      setLogs(lRes.content || []);
      setReminderConfigs(cList);
    } catch (err) {
      console.error('Failed to load email data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;

    setIsSending(true);
    setSendResult(null);
    try {
      const res = await emailApi.testSend(testEmail, selectedTemplate);
      setSendResult(`Result: ${res.message || 'Email attempt logged'}`);
      loadData();
    } catch (err) {
      setSendResult('Failed to dispatch test email.');
    } finally {
      setIsSending(false);
    }
  };

  const handleProcessQueue = async () => {
    setIsProcessing(true);
    try {
      const res = await emailApi.processQueue();
      alert(`Queue processed: ${res.data?.processedCount || 0} emails dispatched.`);
      loadData();
    } catch (err) {
      alert('Failed to process queue.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sage"></span>
            <span className="text-label-xs uppercase tracking-wider text-stone-text font-semibold">
              Transactional &amp; Notification Engine
            </span>
          </div>
          <h1 className="font-headline text-headline-xl text-ink font-semibold tracking-tight mt-1">
            Email Engine &amp; Renewal Reminders
          </h1>
          <p className="font-body text-body-sm text-stone-text mt-0.5">
            Automated GoDaddy SMTP delivery, placeholder engine, and ShedLock 9:00 AM IST daily triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/settings"
            className="flex items-center gap-1.5 px-3 py-2 rounded-card border border-sage/40 bg-sage-light text-sage-dark text-label-xs font-semibold hover:bg-sage/20 transition-colors"
          >
            <Settings className="h-3.5 w-3.5 text-sage" />
            <span>Configure SMTP Mailbox</span>
          </Link>

          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-card border border-divider bg-card hover:bg-divider/50 text-stone-text text-label-xs font-semibold cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Engine State</span>
          </button>
        </div>
      </div>

      {/* Top Grid: Test Send + Active Reminder Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Test Send Card (5 cols) */}
        <div className="lg:col-span-5 rounded-card border border-divider bg-card shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-divider">
            <Send className="h-5 w-5 text-sage" />
            <h2 className="font-headline text-headline-sm font-semibold text-ink">
              Send Test Email
            </h2>
          </div>

          <form onSubmit={handleTestSend} className="space-y-3.5 text-body-sm">
            <div>
              <label className="block text-label-xs font-semibold text-ink mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="procurement@company.com"
                className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm"
                required
              />
            </div>

            <div>
              <label className="block text-label-xs font-semibold text-ink mb-1">
                Select Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm"
              >
                {templates.map((tpl) => (
                  <option key={tpl.templateKey} value={tpl.templateKey}>
                    {tpl.templateKey} ({tpl.subject.slice(0, 35)}...)
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-lg bg-canvas text-[11px] text-stone-text space-y-1 border border-divider">
              <span className="font-semibold text-ink block">Supported Placeholders:</span>
              <p>{'{{company_name}}, {{contact_name}}, {{product_name}}, {{end_date}}, {{amount}}, {{po_number}}'}</p>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 rounded-input bg-sage hover:bg-sage-hover text-white text-label-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSending ? 'Sending Test...' : 'Dispatch Test Email'}
            </button>
          </form>

          {sendResult && (
            <div className="p-3 rounded-lg bg-sage-light/60 text-sage-dark text-body-xs border border-sage/30 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-sage" />
              <span>{sendResult}</span>
            </div>
          )}
        </div>

        {/* 6 Automated Reminder Config Tiers (7 cols) */}
        <div className="lg:col-span-7 rounded-card border border-divider bg-card shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <div className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-sage" />
              <h2 className="font-headline text-headline-sm font-semibold text-ink">
                Automated Reminder Offsets
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-sage bg-sage-light px-2 py-0.5 rounded-full">
              9:00 AM IST ShedLock
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            {reminderConfigs.map((cfg) => {
              const isOverdue = cfg.daysOffset > 0;
              return (
                <div
                  key={cfg.triggerCode}
                  className="p-3 rounded-lg border border-divider bg-canvas/60 space-y-1"
                >
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isOverdue ? 'bg-red-100 text-red-800' : 'bg-sage-light text-sage-dark'
                    }`}
                  >
                    {cfg.triggerCode}
                  </span>
                  <div className="font-headline text-body-sm font-semibold text-ink">
                    {isOverdue ? `+${cfg.daysOffset} days overdue` : `${Math.abs(cfg.daysOffset)} days before`}
                  </div>
                  <span className="text-[10px] text-stone-text block truncate">
                    Template: {cfg.templateKey || cfg.triggerCode}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-sidebar border border-divider text-body-xs text-stone-text">
            <strong>Idempotency &amp; Catch-up:</strong> The daily job evaluates these offsets against contract cycles. If the server was offline, catch-up logic detects missing windows and queues reminders safely.
          </div>
        </div>
      </div>

      {/* Email Queue & Dispatch */}
      <div className="rounded-card border border-divider bg-card shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-divider">
          <div>
            <h2 className="font-headline text-headline-sm font-semibold text-ink">
              Email Dispatch Queue ({queue.length} items)
            </h2>
            <p className="text-body-xs text-stone-text">
              Queued emails waiting for background dispatch with retry backoff.
            </p>
          </div>

          <button
            onClick={handleProcessQueue}
            disabled={isProcessing || queue.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-input bg-sage hover:bg-sage-hover text-white text-label-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-40"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Process Queue Now</span>
          </button>
        </div>

        {queue.length === 0 ? (
          <p className="text-body-sm text-stone-text py-4 text-center">
            Queue is empty. All queued emails have been processed or cancelled.
          </p>
        ) : (
          <div className="divide-y divide-divider/60">
            {queue.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-body-xs">
                <div>
                  <span className="font-medium text-ink block">{item.subject}</span>
                  <span className="text-stone-text">To: {item.toEmail} • Retries: {item.retryCount}/{item.maxRetries}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Logs History */}
      <div className="rounded-card border border-divider bg-card shadow-card p-6 space-y-4">
        <div className="pb-2 border-b border-divider">
          <h2 className="font-headline text-headline-sm font-semibold text-ink">
            Sent Delivery Audit Logs ({logs.length} logged)
          </h2>
          <p className="text-body-xs text-stone-text">
            Historical audit log of all emails sent or attempted through the system.
          </p>
        </div>

        {logs.length === 0 ? (
          <p className="text-body-sm text-stone-text py-4 text-center">No logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-xs">
              <thead className="border-b border-divider text-stone-text font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60 text-ink">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-canvas/50">
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SENT' ? 'bg-sage-light text-sage-dark' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium">{log.toEmail}</td>
                    <td className="py-2.5 px-3 truncate max-w-xs">{log.subject}</td>
                    <td className="py-2.5 px-3 text-stone-text">{log.category}</td>
                    <td className="py-2.5 px-3 text-stone-text">
                      {new Date(log.sentAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

