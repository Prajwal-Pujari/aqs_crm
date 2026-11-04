import { useState, useEffect } from 'react';
import { reminderApi, emailApi, smtpSettingsApi, festivalApi } from '@/api/services';
import { SmtpSettingsDto, SmtpSettingsUpdateRequest, FestivalDto, FestivalCreateRequest } from '@/types';
import {
  Settings,
  Clock,
  Mail,
  HardDrive,
  ShieldCheck,
  Play,
  CheckCircle2,
  Send,
  Database,
  Lock,
  AlertTriangle,
  HeartHandshake,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'smtp' | 'cadence' | 'festivals' | 'storage'>('smtp');
  const [configs, setConfigs] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [festivals, setFestivals] = useState<FestivalDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Manual Trigger Job
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<string | null>(null);

  // SMTP Settings State
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettingsDto | null>(null);
  const [smtpForm, setSmtpForm] = useState<SmtpSettingsUpdateRequest>({
    host: 'smtpout.secureserver.net',
    port: 587,
    protocol: 'smtp',
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'AQS Renewal CRM',
    starttlsEnabled: true,
    sslEnabled: false,
  });
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpSaveMessage, setSmtpSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test Email State
  const [testEmail, setTestEmail] = useState('');
  const [testTemplate, setTestTemplate] = useState('renewal_reminder_60');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Festivals Modal & Actions State
  const [showAddFestival, setShowAddFestival] = useState(false);
  const [newFestivalForm, setNewFestivalForm] = useState<FestivalCreateRequest>({
    name: '',
    festivalDate: new Date().toISOString().split('T')[0],
    customMessage: '',
    templateKey: 'festival_greeting_default',
  });
  const [festivalActionMsg, setFestivalActionMsg] = useState<string | null>(null);

  const loadSettingsData = async () => {
    setIsLoading(true);
    try {
      const [cRes, tRes, sRes, fRes] = await Promise.all([
        reminderApi.getConfigs(),
        emailApi.getTemplates(),
        smtpSettingsApi.get(),
        festivalApi.getAll(),
      ]);
      setConfigs(cRes || []);
      setTemplates(tRes || []);
      setFestivals(fRes || []);
      if (sRes) {
        setSmtpSettings(sRes);
        setSmtpForm({
          host: sRes.host || 'smtpout.secureserver.net',
          port: sRes.port || 587,
          protocol: sRes.protocol || 'smtp',
          username: sRes.username || '',
          password: '',
          fromEmail: sRes.fromEmail || '',
          fromName: sRes.fromName || 'AQS Renewal CRM',
          starttlsEnabled: sRes.starttlsEnabled ?? true,
          sslEnabled: sRes.sslEnabled ?? false,
        });
      }
    } catch (err) {
      console.error('Failed to load settings data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleApplyPreset = (preset: 'godaddy-tls' | 'godaddy-ssl' | 'gmail') => {
    if (preset === 'godaddy-tls') {
      setSmtpForm((prev) => ({
        ...prev,
        host: 'smtpout.secureserver.net',
        port: 587,
        protocol: 'smtp',
        starttlsEnabled: true,
        sslEnabled: false,
      }));
    } else if (preset === 'godaddy-ssl') {
      setSmtpForm((prev) => ({
        ...prev,
        host: 'smtpout.secureserver.net',
        port: 465,
        protocol: 'smtp',
        starttlsEnabled: false,
        sslEnabled: true,
      }));
    } else if (preset === 'gmail') {
      setSmtpForm((prev) => ({
        ...prev,
        host: 'smtp.gmail.com',
        port: 587,
        protocol: 'smtp',
        starttlsEnabled: true,
        sslEnabled: false,
      }));
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSmtp(true);
    setSmtpSaveMessage(null);
    try {
      const payload: SmtpSettingsUpdateRequest = {
        host: smtpForm.host.trim(),
        port: Number(smtpForm.port),
        protocol: smtpForm.protocol?.trim() || 'smtp',
        username: smtpForm.username.trim(),
        fromEmail: smtpForm.fromEmail?.trim() || smtpForm.username.trim(),
        fromName: smtpForm.fromName?.trim() || 'AQS Renewal CRM',
        starttlsEnabled: Boolean(smtpForm.starttlsEnabled),
        sslEnabled: Boolean(smtpForm.sslEnabled),
      };

      if (smtpForm.password && smtpForm.password.trim()) {
        payload.password = smtpForm.password;
      }

      const updated = await smtpSettingsApi.update(payload);
      setSmtpSettings(updated);
      setSmtpForm((prev) => ({
        ...prev,
        password: '',
      }));
      setSmtpSaveMessage({
        type: 'success',
        text: 'SMTP credentials successfully saved into the PostgreSQL database! The system will dynamically authenticate via these credentials without restarting.',
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update SMTP settings in database';
      setSmtpSaveMessage({ type: 'error', text: msg });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleRunReminders = async () => {
    setEvaluating(true);
    setEvalResult(null);
    try {
      const res = await reminderApi.triggerRun();
      const count = res.data?.remindersTriggered ?? 0;
      setEvalResult(`Reminder evaluation run complete: ${count} reminder emails queued into ShedLock engine.`);
    } catch (err) {
      setEvalResult('Failed to run reminder scheduler.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) return;

    setTestSending(true);
    setTestResult(null);
    try {
      const res = await emailApi.testSend(testEmail.trim(), testTemplate);
      setTestResult({
        success: true,
        message: res.message || `Test email successfully dispatched to ${testEmail}!`,
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.data?.errorMessage ||
        err.message ||
        'Failed to send test email. Please check database SMTP settings and credentials.';
      setTestResult({
        success: false,
        message: msg,
      });
    } finally {
      setTestSending(false);
    }
  };

  // Festival Actions
  const handleToggleFestival = async (id: number) => {
    try {
      await festivalApi.toggle(id);
      loadSettingsData();
    } catch (err) {
      console.error('Failed to toggle festival:', err);
    }
  };

  const handleTriggerFestival = async (id: number, name: string) => {
    setFestivalActionMsg(null);
    try {
      const res = await festivalApi.trigger(id);
      const count = res.data?.greetingsQueued ?? 0;
      setFestivalActionMsg(`Triggered '${name}' greeting: ${count} emails queued for opted-in contacts.`);
    } catch (err: any) {
      setFestivalActionMsg(`Failed to trigger greeting for ${name}`);
    }
  };

  const handleCreateFestival = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFestivalForm.name || !newFestivalForm.festivalDate) return;

    try {
      await festivalApi.create(newFestivalForm);
      setShowAddFestival(false);
      setNewFestivalForm({
        name: '',
        festivalDate: new Date().toISOString().split('T')[0],
        customMessage: '',
        templateKey: 'festival_greeting_default',
      });
      loadSettingsData();
    } catch (err) {
      console.error('Failed to create festival:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-text text-label-sm font-medium">
            <Settings className="h-4 w-4 text-sage" />
            <span>Platform Configuration &amp; Automation Rules</span>
          </div>
          <h1 className="mt-1 font-headline text-headline-xl text-ink font-medium">
            System &amp; Engine Settings
          </h1>
          <p className="mt-0.5 text-body-sm text-stone-text">
            Database-backed SMTP mailbox, 9:00 AM IST ShedLock reminder cadence, and festive greeting automation.
          </p>
        </div>

        <button
          onClick={handleRunReminders}
          disabled={evaluating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Play className={`h-4 w-4 ${evaluating ? 'animate-spin' : ''}`} />
          <span>{evaluating ? 'Evaluating...' : 'Run Daily Reminder Job Now'}</span>
        </button>
      </div>

      {evalResult && (
        <div className="flex items-center gap-2 rounded-card border border-sage/40 bg-sage-light/60 p-4 text-body-sm text-sage-dark">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-sage" />
          <span>{evalResult}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-divider pb-px">
        <button
          onClick={() => setActiveTab('smtp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-card font-medium text-label-sm transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'smtp'
              ? 'border-sage text-ink bg-card'
              : 'border-transparent text-stone-text hover:text-ink hover:bg-card/40'
          }`}
        >
          <Mail className="h-4 w-4 text-sage" />
          <span>SMTP Mailbox (Database Stored)</span>
          {smtpSettings?.hasPassword && smtpSettings?.username ? (
            <span className="w-2 h-2 rounded-full bg-sage" title="Configured"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-500" title="Unconfigured"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('cadence')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-card font-medium text-label-sm transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'cadence'
              ? 'border-sage text-ink bg-card'
              : 'border-transparent text-stone-text hover:text-ink hover:bg-card/40'
          }`}
        >
          <Clock className="h-4 w-4 text-sage" />
          <span>Renewal Cadence Tiers</span>
          <span className="px-1.5 py-0.2 rounded-full bg-canvas text-stone-text text-[10px] font-mono">
            {configs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('festivals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-card font-medium text-label-sm transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'festivals'
              ? 'border-sage text-ink bg-card'
              : 'border-transparent text-stone-text hover:text-ink hover:bg-card/40'
          }`}
        >
          <HeartHandshake className="h-4 w-4 text-sage" />
          <span>Festivals &amp; Greetings</span>
          <span className="px-1.5 py-0.2 rounded-full bg-canvas text-stone-text text-[10px] font-mono">
            {festivals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-card font-medium text-label-sm transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'storage'
              ? 'border-sage text-ink bg-card'
              : 'border-transparent text-stone-text hover:text-ink hover:bg-card/40'
          }`}
        >
          <HardDrive className="h-4 w-4 text-sage" />
          <span>MinIO PO Storage</span>
        </button>
      </div>

      {/* TAB 1: SMTP MAILBOX CONFIGURATION */}
      {activeTab === 'smtp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main SMTP Form (7 Cols) */}
          <div className="lg:col-span-7 rounded-card border border-divider bg-card p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-divider">
              <div>
                <h2 className="font-headline text-headline-sm text-ink flex items-center gap-2">
                  <Database className="h-5 w-5 text-sage" />
                  <span>Database-Backed SMTP Mailbox</span>
                </h2>
                <p className="text-body-xs text-stone-text mt-0.5">
                  Credentials are stored securely in the PostgreSQL database (<code className="font-mono text-xs text-ink bg-canvas px-1 py-0.5 rounded">smtp_settings</code>) and loaded dynamically on each send.
                </p>
              </div>

              {smtpSettings?.hasPassword && smtpSettings?.username ? (
                <span className="px-2.5 py-1 rounded-full bg-sage-light text-sage-dark text-label-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
                  <span>Active in DB</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-label-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Credentials Needed</span>
                </span>
              )}
            </div>

            {/* Quick Provider Presets */}
            <div className="space-y-1.5">
              <span className="text-label-xs font-semibold text-stone-text uppercase tracking-wider block">
                Quick Provider Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('godaddy-tls')}
                  className="px-2.5 py-1 rounded-card border border-divider bg-canvas hover:border-sage text-ink text-label-xs font-medium transition-colors cursor-pointer"
                >
                  GoDaddy STARTTLS (Port 587)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('godaddy-ssl')}
                  className="px-2.5 py-1 rounded-card border border-divider bg-canvas hover:border-sage text-ink text-label-xs font-medium transition-colors cursor-pointer"
                >
                  GoDaddy SSL (Port 465)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('gmail')}
                  className="px-2.5 py-1 rounded-card border border-divider bg-canvas hover:border-sage text-ink text-label-xs font-medium transition-colors cursor-pointer"
                >
                  Gmail STARTTLS (Port 587)
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSmtp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-label-xs font-semibold text-ink">
                    SMTP Server Host <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={smtpForm.host}
                    onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    placeholder="smtpout.secureserver.net"
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-xs text-ink focus:outline-none focus:border-sage font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-label-xs font-semibold text-ink">
                    Port <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={smtpForm.port}
                    onChange={(e) => setSmtpForm({ ...smtpForm, port: Number(e.target.value) })}
                    placeholder="587"
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-xs text-ink focus:outline-none focus:border-sage font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-label-xs font-semibold text-ink">
                    Username / Mailbox Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={smtpForm.username}
                    onChange={(e) => setSmtpForm({ ...smtpForm, username: e.target.value })}
                    placeholder="your_email@yourdomain.com"
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-xs text-ink focus:outline-none focus:border-sage font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-label-xs font-semibold text-ink">
                      Password {smtpSettings?.hasPassword ? '(Leave blank to keep saved)' : <span className="text-red-500">*</span>}
                    </label>
                    {smtpSettings?.hasPassword && (
                      <span className="text-[10px] text-sage font-medium flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Saved in DB
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    value={smtpForm.password || ''}
                    onChange={(e) => setSmtpForm({ ...smtpForm, password: e.target.value })}
                    placeholder={smtpSettings?.hasPassword ? '•••••••••••• (Leave blank to keep)' : 'Enter mailbox password'}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-xs text-ink focus:outline-none focus:border-sage font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-label-xs font-semibold text-ink">
                    From Address
                  </label>
                  <input
                    type="email"
                    value={smtpForm.fromEmail || ''}
                    onChange={(e) => setSmtpForm({ ...smtpForm, fromEmail: e.target.value })}
                    placeholder="Same as mailbox username"
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-xs text-ink focus:outline-none focus:border-sage font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-label-xs font-semibold text-ink">
                    From Display Name
                  </label>
                  <input
                    type="text"
                    value={smtpForm.fromName || ''}
                    onChange={(e) => setSmtpForm({ ...smtpForm, fromName: e.target.value })}
                    placeholder="AQS Renewal CRM"
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-xs text-ink focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              {/* Encryption Options */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-body-xs text-ink">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={smtpForm.starttlsEnabled}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setSmtpForm({
                        ...smtpForm,
                        starttlsEnabled: val,
                        sslEnabled: val ? false : smtpForm.sslEnabled,
                      });
                    }}
                    className="rounded border-divider text-sage focus:ring-sage"
                  />
                  <span>STARTTLS (Recommended for Port 587)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={smtpForm.sslEnabled}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setSmtpForm({
                        ...smtpForm,
                        sslEnabled: val,
                        starttlsEnabled: val ? false : smtpForm.starttlsEnabled,
                      });
                    }}
                    className="rounded border-divider text-sage focus:ring-sage"
                  />
                  <span>SSL Protocol (Recommended for Port 465)</span>
                </label>
              </div>

              {smtpSaveMessage && (
                <div
                  className={`p-3.5 rounded-card text-body-xs border flex items-start gap-2.5 ${
                    smtpSaveMessage.type === 'success'
                      ? 'border-sage/40 bg-sage-light/60 text-sage-dark'
                      : 'border-red-300 bg-red-50 text-red-800'
                  }`}
                >
                  {smtpSaveMessage.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-sage" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                  )}
                  <span>{smtpSaveMessage.text}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-stone-text">
                  Saved directly to database • No application restart or docker rebuild required.
                </span>
                <button
                  type="submit"
                  disabled={isSavingSmtp}
                  className="px-5 py-2.5 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  <span>{isSavingSmtp ? 'Saving to Database...' : 'Save Settings to DB'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Test Send & Connection Diagnostic Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-card border border-divider bg-card p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-divider">
                <Send className="h-5 w-5 text-sage" />
                <h3 className="font-headline text-headline-sm text-ink">Live SMTP Test Dispatch</h3>
              </div>

              <p className="text-body-xs text-stone-text">
                Test your database SMTP credentials immediately. The backend will perform an authentic TLS handshake and dispatch a test message to the specified recipient.
              </p>

              <form onSubmit={handleTestSend} className="space-y-3.5 text-body-sm">
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">
                    Recipient Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your_personal_email@domain.com"
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-xs text-ink focus:outline-none focus:border-sage font-mono"
                  />
                </div>

                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">
                    Select Test Template
                  </label>
                  <select
                    value={testTemplate}
                    onChange={(e) => setTestTemplate(e.target.value)}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-xs text-ink focus:outline-none focus:border-sage"
                  >
                    {templates.length === 0 ? (
                      <option value="renewal_reminder_60">renewal_reminder_60 (60 Days Prior)</option>
                    ) : (
                      templates.map((tpl) => (
                        <option key={tpl.templateKey} value={tpl.templateKey}>
                          {tpl.templateKey} ({tpl.subject.slice(0, 30)}...)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="p-3 rounded-card bg-canvas border border-divider text-[11px] text-stone-text space-y-1">
                  <span className="font-semibold text-ink block">Test Dispatch Specs:</span>
                  <div>From: <code className="font-mono text-ink">{smtpForm.fromEmail || smtpForm.username || 'noreply@aqs.com'}</code></div>
                  <div>Via: <code className="font-mono text-ink">{smtpForm.host}:{smtpForm.port} ({smtpForm.sslEnabled ? 'SSL' : 'STARTTLS'})</code></div>
                </div>

                <button
                  type="submit"
                  disabled={testSending || !smtpForm.username}
                  className="w-full py-2.5 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className={`h-4 w-4 ${testSending ? 'animate-spin' : ''}`} />
                  <span>{testSending ? 'Sending Handshake & Mail...' : 'Send Live Test Email'}</span>
                </button>
              </form>

              {testResult && (
                <div
                  className={`p-3.5 rounded-card text-body-xs border flex items-start gap-2.5 ${
                    testResult.success
                      ? 'border-sage/40 bg-sage-light/60 text-sage-dark'
                      : 'border-red-300 bg-red-50 text-red-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-sage" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                  )}
                  <div>
                    <span className="font-semibold block">
                      {testResult.success ? 'Delivery Handshake Succeeded' : 'SMTP Dispatch Failed'}
                    </span>
                    <span className="mt-0.5 block break-words">{testResult.message}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Architecture Card */}
            <div className="rounded-card border border-divider bg-canvas/60 p-5 space-y-2 text-body-xs text-stone-text">
              <span className="font-headline font-semibold text-ink flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sage" />
                <span>Dynamic Database Architecture</span>
              </span>
              <p>
                By keeping credentials inside PostgreSQL rather than <code className="font-mono text-ink">.env</code>, administrators can update SMTP passwords or switch between staging and production mail servers instantaneously with 0 downtime.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RENEWAL REMINDER CADENCE */}
      {activeTab === 'cadence' && (
        <div className="rounded-card border border-divider bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-divider">
            <div className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-sage" />
              <div>
                <h2 className="font-headline text-headline-sm text-ink">
                  Renewal Reminder Automation Cadence
                </h2>
                <p className="text-body-xs text-stone-text">
                  Daily cron at 9:00 AM IST (Asia/Kolkata) with ShedLock distributed mutex guard
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-sage-light text-sage-dark text-label-xs font-semibold">
              ShedLock Active
            </span>
          </div>

          <p className="text-body-xs text-stone-text">
            Configured offsets stored in database. All notifications are strictly idempotent via
            unique constraints on <code className="bg-canvas px-1 py-0.5 rounded text-ink font-mono text-xs">(cycle_id, reminder_type, contact_id)</code> with catch-up safety.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-canvas border-b border-divider text-label-xs uppercase tracking-wider text-stone-text">
                <tr>
                  <th className="px-4 py-2.5">Offset</th>
                  <th className="px-4 py-2.5">Trigger Condition</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Template</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {configs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-text text-body-xs">
                      Loading reminder configuration tiers...
                    </td>
                  </tr>
                ) : (
                  configs.map((c) => (
                    <tr key={c.id || c.triggerCode} className="hover:bg-canvas/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-ink">
                        {c.daysOffset < 0 || c.daysBeforeCycleEnd < 0
                          ? `${Math.abs(c.daysOffset ?? c.daysBeforeCycleEnd)} days before end`
                          : `${c.daysOffset ?? c.daysBeforeCycleEnd} days after end (Overdue)`}
                      </td>
                      <td className="px-4 py-3 font-mono text-body-xs text-stone-text">
                        {c.triggerCode || c.reminderType}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-label-xs font-medium ${
                            (c.daysOffset ?? c.daysBeforeCycleEnd) >= 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-sage-light text-sage-dark'
                          }`}
                        >
                          {(c.daysOffset ?? c.daysBeforeCycleEnd) >= 0 ? 'Overdue Notice' : 'Early Warning'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-body-xs text-stone-text">
                        {c.templateKey || 'Standard Template'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-sage text-label-xs font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-sage"></span>
                          <span>{c.isActive ? 'Enabled' : 'Paused'}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FESTIVALS & GREETINGS AUTOMATION */}
      {activeTab === 'festivals' && (
        <div className="space-y-6">
          <div className="rounded-card border border-divider bg-card p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-divider">
              <div className="flex items-center gap-2.5">
                <HeartHandshake className="h-5 w-5 text-sage" />
                <div>
                  <h2 className="font-headline text-headline-sm text-ink">
                    Festivals &amp; Greeting Automations
                  </h2>
                  <p className="text-body-xs text-stone-text">
                    Daily 09:15 AM IST ShedLock job automatically sends personalized festive greetings to all opted-in partner contacts.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddFestival(!showAddFestival)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-xs font-medium transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Festival</span>
                </button>
              </div>
            </div>

            {festivalActionMsg && (
              <div className="flex items-center gap-2 rounded-card border border-sage/40 bg-sage-light/60 p-3 text-body-xs text-sage-dark">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-sage" />
                <span>{festivalActionMsg}</span>
              </div>
            )}

            {/* Add Festival inline form */}
            {showAddFestival && (
              <form
                onSubmit={handleCreateFestival}
                className="p-4 rounded-card border border-divider bg-canvas/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-headline text-body-sm font-semibold text-ink">
                    Register New Festival
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddFestival(false)}
                    className="text-stone-text hover:text-ink text-body-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-xs font-semibold text-ink mb-1">
                      Festival Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Diwali, Holi, Eid"
                      value={newFestivalForm.name}
                      onChange={(e) => setNewFestivalForm({ ...newFestivalForm, name: e.target.value })}
                      className="w-full rounded-input border border-divider bg-card px-3 py-1.5 text-body-xs text-ink focus:outline-none focus:border-sage"
                    />
                  </div>

                  <div>
                    <label className="block text-label-xs font-semibold text-ink mb-1">
                      Festival Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={newFestivalForm.festivalDate}
                      onChange={(e) =>
                        setNewFestivalForm({ ...newFestivalForm, festivalDate: e.target.value })
                      }
                      className="w-full rounded-input border border-divider bg-card px-3 py-1.5 text-body-xs text-ink focus:outline-none focus:border-sage"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">
                    Custom Message Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific heartfelt wish appended to the template..."
                    value={newFestivalForm.customMessage || ''}
                    onChange={(e) =>
                      setNewFestivalForm({ ...newFestivalForm, customMessage: e.target.value })
                    }
                    className="w-full rounded-input border border-divider bg-card px-3 py-1.5 text-body-xs text-ink focus:outline-none focus:border-sage"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-card bg-sage hover:bg-sage-hover text-white text-label-xs font-semibold cursor-pointer"
                >
                  Save Festival
                </button>
              </form>
            )}

            {/* Festivals List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-canvas border-b border-divider text-label-xs uppercase tracking-wider text-stone-text">
                  <tr>
                    <th className="px-4 py-2.5">Festival</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Custom Note</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider/60">
                  {festivals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-stone-text text-body-xs">
                        No festivals registered. Click "Add Festival" to set up your holiday greeting calendar.
                      </td>
                    </tr>
                  ) : (
                    festivals.map((f) => (
                      <tr key={f.id} className="hover:bg-canvas/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-ink flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-600" />
                          <span>{f.name}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-body-xs text-stone-text">
                          {f.festivalDate}
                        </td>
                        <td className="px-4 py-3 text-body-xs text-stone-text max-w-xs truncate">
                          {f.customMessage || 'Standard warm wishes'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleFestival(f.id)}
                            className={`px-2.5 py-0.5 rounded-full text-label-xs font-semibold cursor-pointer transition-colors ${
                              f.isActive ? 'bg-sage-light text-sage-dark' : 'bg-canvas text-stone-text'
                            }`}
                          >
                            {f.isActive ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => handleTriggerFestival(f.id, f.name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-card border border-divider bg-canvas hover:border-sage text-ink text-[11px] font-medium transition-colors cursor-pointer"
                            title="Queues greetings immediately for testing"
                          >
                            <Send className="h-3 w-3 text-sage" />
                            <span>Test Dispatch</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MINIO STORAGE */}
      {activeTab === 'storage' && (
        <div className="rounded-card border border-divider bg-card p-6 shadow-card space-y-6 max-w-2xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-divider">
            <HardDrive className="h-5 w-5 text-sage" />
            <div>
              <h2 className="font-headline text-headline-sm text-ink">MinIO PO Document Storage</h2>
              <p className="text-body-xs text-stone-text">S3-compatible object storage for signed Purchase Orders</p>
            </div>
          </div>

          <div className="space-y-3 text-body-xs">
            <div className="flex justify-between py-2 border-b border-divider/60">
              <span className="text-stone-text">S3 Bucket Name</span>
              <span className="font-mono font-semibold text-ink">aqs-po-documents</span>
            </div>
            <div className="flex justify-between py-2 border-b border-divider/60">
              <span className="text-stone-text">Allowed File Formats</span>
              <span className="text-ink">PDF, JPG, PNG (&lt;15MB)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-divider/60">
              <span className="text-stone-text">Integrity Guard</span>
              <span className="text-sage font-medium">SHA-256 Checksum on upload</span>
            </div>
            <div className="flex justify-between py-2 border-b border-divider/60">
              <span className="text-stone-text">Storage Endpoint</span>
              <span className="font-mono text-ink">http://localhost:9000</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-stone-text">MinIO Console GUI</span>
              <span className="font-mono text-sage">http://localhost:9001</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
