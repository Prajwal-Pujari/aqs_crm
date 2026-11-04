import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { dashboardApi, reminderApi } from '@/api/services';
import type { DashboardStatsDto } from '@/types';
import { formatINR } from '@/utils/currency';
import {
  TrendingUp,
  Play,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  IndianRupee,
  Clock,
  ShieldAlert,
  Mail,
  Send,
  Users,
  ArrowRight,
  Phone,
  FileText,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evalMessage, setEvalMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRunReminders = async () => {
    setEvaluating(true);
    setEvalMessage(null);
    try {
      const res = await reminderApi.triggerRun();
      const count = res.data?.remindersTriggered ?? 0;
      setEvalMessage(`Evaluation complete: ${count} renewal reminders generated & queued into ShedLock engine.`);
      fetchStats();
    } catch (err) {
      setEvalMessage('Failed to trigger renewal evaluation.');
    } finally {
      setEvaluating(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL':
        return <Phone className="h-3.5 w-3.5 text-sage" />;
      case 'EMAIL':
        return <Mail className="h-3.5 w-3.5 text-sage" />;
      case 'MEETING':
        return <Users className="h-3.5 w-3.5 text-sage" />;
      case 'NOTE':
        return <FileText className="h-3.5 w-3.5 text-sage" />;
      default:
        return <CheckCircle2 className="h-3.5 w-3.5 text-sage" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-text text-label-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-sage animate-pulse"></span>
            <span>AQS Enterprise Command Center</span>
            <span>•</span>
            <span>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <h1 className="mt-2 font-headline text-headline-xl text-ink font-medium">
            Good day, {user?.fullName || user?.username || 'Executive'}.
          </h1>
          <p className="mt-1 text-body-md text-stone-text">
            Annual recurring software subscriptions, PO contract lifecycles, and automated delivery.
          </p>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunReminders}
            disabled={evaluating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-card border border-divider bg-card hover:bg-divider/50 text-ink text-label-sm font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            title="Triggers the daily 9:00 AM IST ShedLock reminder job"
          >
            <Play className={`h-4 w-4 text-sage ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Evaluating...' : 'Run Reminder Job'}</span>
          </button>

          <button
            onClick={() => navigate('/companies')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium transition-all shadow-sm cursor-pointer"
          >
            <Building2 className="h-4 w-4" />
            <span>Client Portfolio</span>
          </button>
        </div>
      </div>

      {evalMessage && (
        <div className="flex items-center gap-2 rounded-card border border-sage/40 bg-sage-light/60 p-4 text-body-sm text-sage-dark">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-sage" />
          <span>{evalMessage}</span>
        </div>
      )}

      {/* 4 Primary Financial & Portfolio Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Card 1: Total ARR */}
        <div className="rounded-card bg-card p-6 shadow-card border border-divider transition-shadow hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-label-sm font-medium text-stone-text uppercase tracking-wider">
              Annual Recurring Rev
            </span>
            <span className="p-1 rounded bg-sage-light text-sage-dark">
              <IndianRupee className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-headline text-headline-xl text-ink font-semibold">
              {formatINR(stats?.totalArr ?? 0)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-divider/60 text-body-xs text-stone-text flex justify-between">
            <span>{stats?.activeContractsCount ?? 0} active subscriptions</span>
            <span className="text-sage font-medium">Billed on PO</span>
          </div>
        </div>

        {/* Card 2: Active Accounts */}
        <div className="rounded-card bg-card p-6 shadow-card border border-divider transition-shadow hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-label-sm font-medium text-stone-text uppercase tracking-wider">
              Client Accounts
            </span>
            <Building2 className="h-4 w-4 text-stone-text" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-headline text-headline-xl text-ink font-semibold">
              {stats?.totalCompaniesCount ?? 0}
            </span>
            <span className="text-body-xs text-stone-text">
              {stats?.totalContactsCount ?? 0} contacts
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-divider/60 text-body-xs text-stone-text flex justify-between">
            <span>Multi-tier enterprise</span>
            <span className="text-sage font-medium">100% indexed</span>
          </div>
        </div>

        {/* Card 3: Renewals Due (30-60 Days) */}
        <div className="rounded-card bg-card p-6 shadow-card border border-divider transition-shadow hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-label-sm font-medium text-stone-text uppercase tracking-wider">
              Renewals Due (30–60d)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-label-xs font-semibold">
              {stats?.renewalsDueCount ?? 0} Cycles
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-headline text-headline-xl text-ink font-semibold">
              {formatINR(stats?.renewalsDueSum ?? 0)}
            </span>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="mt-3 pt-3 border-t border-divider/60 text-body-xs text-stone-text flex justify-between">
            <span>Automated reminders</span>
            <button
              onClick={() => navigate('/pipeline')}
              className="text-sage hover:underline cursor-pointer font-medium"
            >
              View in pipeline →
            </button>
          </div>
        </div>

        {/* Card 4: Overdue Subscriptions */}
        <div className="rounded-card bg-card p-6 shadow-card border border-divider transition-shadow hover:shadow-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-label-sm font-medium text-stone-text uppercase tracking-wider">
              Overdue Subscriptions
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-label-xs font-semibold ${
                (stats?.overdueCount ?? 0) > 0 ? 'bg-red-100 text-red-800' : 'bg-sage-light text-sage-dark'
              }`}
            >
              {(stats?.overdueCount ?? 0) > 0 ? `${stats?.overdueCount} Overdue` : 'Clear'}
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-headline text-headline-xl text-ink font-semibold">
              {formatINR(stats?.overdueSum ?? 0)}
            </span>
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </div>
          <div className="mt-3 pt-3 border-t border-divider/60 text-body-xs text-stone-text flex justify-between">
            <span>Requires PO follow-up</span>
            <button
              onClick={() => navigate('/contracts')}
              className="text-sage hover:underline cursor-pointer font-medium"
            >
              Renew cycles →
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Renewals + Pipeline & System Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upcoming Renewals & Pipeline Stages (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Overdue Alert Card (if any) */}
          {(stats?.overdueContracts?.length ?? 0) > 0 && (
            <div className="rounded-card border border-red-300 bg-red-50/60 p-6 shadow-card space-y-3">
              <div className="flex items-center justify-between border-b border-red-200 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h2 className="font-headline text-headline-sm font-semibold text-red-950">
                    Overdue Renewal Contracts ({stats?.overdueContracts.length})
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/contracts')}
                  className="text-label-xs font-semibold text-red-700 hover:underline cursor-pointer"
                >
                  Manage all contracts
                </button>
              </div>

              <div className="divide-y divide-red-200/60">
                {stats?.overdueContracts.map((c) => (
                  <div key={c.cycleId} className="py-2.5 flex items-center justify-between text-body-xs">
                    <div>
                      <span className="font-semibold text-ink">{c.companyName}</span>
                      <span className="text-stone-text ml-2">
                        {c.productName} • Cycle #{c.cycleNo}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-ink">
                        {formatINR(c.amount)}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                        {Math.abs(c.daysRemaining)}d overdue
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Renewals Schedule */}
          <div className="rounded-card border border-divider bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-divider">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-sage" />
                <div>
                  <h2 className="font-headline text-headline-sm font-semibold text-ink">
                    Upcoming Renewal Schedule
                  </h2>
                  <p className="text-body-xs text-stone-text">
                    Next contract expirations scheduled for automated reminder sequence
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/contracts')}
                className="text-label-xs text-sage font-medium hover:underline cursor-pointer"
              >
                View all contracts →
              </button>
            </div>

            {stats?.upcomingRenewals?.length === 0 ? (
              <div className="py-8 text-center text-stone-text text-body-sm">
                No active or renewal-due contracts found.
              </div>
            ) : (
              <div className="divide-y divide-divider/60">
                {stats?.upcomingRenewals?.map((item) => (
                  <div
                    key={item.cycleId}
                    className="py-3 flex items-center justify-between hover:bg-canvas/40 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-ink block">{item.companyName}</span>
                      <span className="text-body-xs text-stone-text">
                        {item.productName} • Term ends {item.endDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="font-mono font-semibold text-ink block text-body-xs">
                          {formatINR(item.amount)}
                        </span>
                        <span className="text-[10px] text-stone-text">Annual PO</span>
                      </div>

                      <span
                        className={`px-2 py-1 rounded text-label-xs font-semibold ${
                          item.daysRemaining <= 15
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sage-light text-sage-dark'
                        }`}
                      >
                        {item.daysRemaining} days left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 10-Stage Pipeline Overview */}
          <div className="rounded-card border border-divider bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-divider">
              <div>
                <h2 className="font-headline text-headline-sm font-semibold text-ink">
                  Pipeline Stage Distribution
                </h2>
                <p className="text-body-xs text-stone-text">
                  Companies categorized across all 10 industrial subscription stages
                </p>
              </div>

              <button
                onClick={() => navigate('/pipeline')}
                className="text-label-xs text-sage font-medium hover:underline cursor-pointer"
              >
                Open Kanban board →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              {stats?.stagesBreakdown &&
                Object.entries(stats.stagesBreakdown).map(([stage, count]) => (
                  <div
                    key={stage}
                    onClick={() => navigate('/pipeline')}
                    className="p-3 rounded-card border border-divider bg-canvas/60 hover:border-sage transition-all cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-stone-text block truncate uppercase">
                      {stage.replace(/_/g, ' ')}
                    </span>
                    <span className="font-headline text-headline-sm font-bold text-ink mt-1 block">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Engine Health, Issues, & Recent Feed (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Engine & Mailbox Diagnostics Card */}
          <div className="rounded-card border border-divider bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-divider">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-sage" />
                <h3 className="font-headline text-headline-sm font-semibold text-ink">
                  Engine &amp; Delivery Health
                </h3>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-sage-light text-sage-dark text-[10px] font-semibold">
                GoDaddy SMTP
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-card bg-canvas border border-divider space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-text">Queue Pending</span>
                <span className="font-headline text-headline-sm font-bold text-ink block">
                  {stats?.pendingQueueCount ?? 0}
                </span>
                <span className="text-[10px] text-stone-text">Awaiting dispatch</span>
              </div>

              <div className="p-3 rounded-card bg-canvas border border-divider space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-text">Failed Deliveries</span>
                <span
                  className={`font-headline text-headline-sm font-bold block ${
                    (stats?.failedEmailsCount ?? 0) > 0 ? 'text-red-600' : 'text-sage'
                  }`}
                >
                  {stats?.failedEmailsCount ?? 0}
                </span>
                <span className="text-[10px] text-stone-text">Audit log entries</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-body-xs">
              <span className="text-stone-text">Daily Reminder Mutex:</span>
              <span className="font-semibold text-ink">ShedLock 9:00 AM IST</span>
            </div>

            <div className="pt-1 flex gap-2">
              <button
                onClick={() => navigate('/email')}
                className="flex-1 py-1.5 rounded-card border border-divider hover:bg-canvas text-stone-text text-label-xs font-medium cursor-pointer text-center"
              >
                Inspect Email Logs
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="flex-1 py-1.5 rounded-card bg-sage hover:bg-sage-hover text-white text-label-xs font-medium cursor-pointer text-center"
              >
                SMTP Settings
              </button>
            </div>
          </div>

          {/* Open Issues by Priority Card */}
          <div className="rounded-card border border-divider bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-divider">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-sage" />
                <h3 className="font-headline text-headline-sm font-semibold text-ink">
                  Support &amp; Quality Issues
                </h3>
              </div>

              <button
                onClick={() => navigate('/companies')}
                className="text-label-xs text-sage font-medium hover:underline cursor-pointer"
              >
                View all →
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="p-2.5 rounded-card bg-red-50 border border-red-200 text-center">
                <span className="text-[10px] font-bold text-red-800 uppercase block">Critical</span>
                <span className="font-headline text-headline-sm font-bold text-red-900 block mt-0.5">
                  {stats?.openIssuesByPriority?.CRITICAL ?? 0}
                </span>
              </div>

              <div className="p-2.5 rounded-card bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">High</span>
                <span className="font-headline text-headline-sm font-bold text-amber-900 block mt-0.5">
                  {stats?.openIssuesByPriority?.HIGH ?? 0}
                </span>
              </div>

              <div className="p-2.5 rounded-card bg-blue-50 border border-blue-200 text-center">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">Medium</span>
                <span className="font-headline text-headline-sm font-bold text-blue-900 block mt-0.5">
                  {stats?.openIssuesByPriority?.MEDIUM ?? 0}
                </span>
              </div>

              <div className="p-2.5 rounded-card bg-canvas border border-divider text-center">
                <span className="text-[10px] font-bold text-stone-text uppercase block">Low</span>
                <span className="font-headline text-headline-sm font-bold text-ink block mt-0.5">
                  {stats?.openIssuesByPriority?.LOW ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="rounded-card border border-divider bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-divider">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-sage" />
                <h3 className="font-headline text-headline-sm font-semibold text-ink">
                  Recent Interactions
                </h3>
              </div>

              <span className="text-[11px] text-stone-text">Real-time log</span>
            </div>

            {stats?.recentActivities?.length === 0 ? (
              <p className="text-body-xs text-stone-text py-4 text-center">
                No recent activity logged yet.
              </p>
            ) : (
              <div className="divide-y divide-divider/60">
                {stats?.recentActivities?.map((act) => (
                  <div key={act.id} className="py-2.5 flex items-start gap-3 text-body-xs">
                    <div className="p-1.5 rounded-full bg-sage-light shrink-0 mt-0.5">
                      {getActivityIcon(act.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-ink block truncate">{act.subject}</span>
                      <span className="text-stone-text block truncate">
                        {act.companyName} • {act.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-text shrink-0">
                      {new Date(act.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
