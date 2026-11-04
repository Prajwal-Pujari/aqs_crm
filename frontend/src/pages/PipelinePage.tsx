import { useState, useEffect } from 'react';
import {
  companyApi,
  subscriptionApi,
  contractApi,
  poDocumentApi,
  productApi,
} from '@/api/services';
import type {
  CompanyDto,
  SubscriptionDto,
  ContractCycleDto,
  PoDocumentDto,
  ProductDto,
} from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatINR } from '@/utils/currency';
import {
  Kanban,
  ListFilter,
  Search,
  Plus,
  ArrowRight,
  Building2,
  FileText,
  Upload,
  Calendar,
  IndianRupee,
  CheckCircle2,
  X,
  ExternalLink,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const ALL_PIPELINE_STAGES = [
  { key: 'LEAD', label: 'Lead', description: 'Initial inquiry & prospecting' },
  { key: 'IN_TALKS', label: 'In Talks', description: 'Discovery call & requirements gathering' },
  { key: 'DEMO', label: 'Demo', description: 'Live industrial software walkthrough' },
  { key: 'QUOTATION_SENT', label: 'Quotation Sent', description: 'Commercial pricing proposal submitted' },
  { key: 'PO_RECEIVED', label: 'PO Received', description: 'Official client purchase order verified' },
  { key: 'INSTALLATION', label: 'Installation', description: 'On-prem deployment & configuration' },
  { key: 'LIVE', label: 'Live', description: 'In full production & monitoring' },
  { key: 'RENEWAL_DUE', label: 'Renewal Due', description: 'Annual term within 60-day renewal notice' },
  { key: 'RENEWED', label: 'Renewed', description: 'Next year term confirmed' },
  { key: 'LAPSED', label: 'Lapsed', description: 'Subscription ended without renewal' },
];

interface CompanyPipelineData {
  company: CompanyDto;
  subscription?: SubscriptionDto;
  cycle?: ContractCycleDto;
  documents?: PoDocumentDto[];
}

export default function PipelinePage() {
  const [pipelineData, setPipelineData] = useState<CompanyPipelineData[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');

  // Updating stage state
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Manage / Record PO Modal
  const [poTarget, setPoTarget] = useState<CompanyPipelineData | null>(null);
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [poAmount, setPoAmount] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [poFile, setPoFile] = useState<File | null>(null);
  const [isSavingPo, setIsSavingPo] = useState(false);

  // Stage Change with Notes Modal
  const [stageChangeTarget, setStageChangeTarget] = useState<{
    company: CompanyDto;
    newStage: string;
  } | null>(null);
  const [stageChangeNotes, setStageChangeNotes] = useState('');

  // History Drawer Modal
  const [historyTarget, setHistoryTarget] = useState<CompanyDto | null>(null);
  const [stageHistory, setStageHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadPipelineData = async () => {
    setIsLoading(true);
    try {
      const [compRes, prodRes] = await Promise.all([
        companyApi.getAll('', undefined, 0, 200),
        productApi.getAll(),
      ]);

      const comps = compRes.content || [];
      setProducts(prodRes || []);

      // Fetch subscriptions and cycles in parallel for complete PO visibility
      const detailedList: CompanyPipelineData[] = await Promise.all(
        comps.map(async (company) => {
          try {
            const subs = await subscriptionApi.getByCompany(company.id);
            if (subs.length > 0) {
              const primarySub = subs[0];
              const cycles = await contractApi.getCycles(primarySub.id);
              if (cycles.length > 0) {
                // Latest cycle
                const latestCycle = cycles[cycles.length - 1];
                let docs: PoDocumentDto[] = [];
                try {
                  docs = await poDocumentApi.getDocuments(latestCycle.id);
                } catch (e) {
                  // ignore
                }
                return {
                  company,
                  subscription: primarySub,
                  cycle: latestCycle,
                  documents: docs,
                };
              }
              return { company, subscription: primarySub };
            }
          } catch (e) {
            // ignore
          }
          return { company };
        })
      );

      setPipelineData(detailedList);
    } catch (err) {
      console.error('Failed to load pipeline data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPipelineData();
  }, []);

  // Open PO modal
  const openPoModal = (item: CompanyPipelineData) => {
    setPoTarget(item);
    setPoNumber(item.cycle?.poNumber || '');
    setPoDate(item.cycle?.poDate || new Date().toISOString().split('T')[0]);
    setPoAmount(item.cycle?.amount ? String(item.cycle.amount) : '15000');
    setSelectedProductId(item.subscription?.productId || (products[0]?.id ?? ''));
    setPoFile(null);
  };

  const handleSavePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poTarget) return;

    setIsSavingPo(true);
    try {
      let cycleId = poTarget.cycle?.id;

      // 1. If no subscription exists yet, create one
      if (!poTarget.subscription) {
        const prodId = Number(selectedProductId) || (products[0]?.id ?? 1);
        const sub = await subscriptionApi.create(poTarget.company.id, {
          productId: prodId,
          site: 'Primary Industrial Facility',
          version: '2.4.0',
        });

        // Create first cycle
        const today = new Date().toISOString().split('T')[0];
        const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
        const cycle = await contractApi.createFirstCycle(sub.id, {
          startDate: today,
          endDate: nextYear,
          amount: Number(poAmount) || 15000,
          poNumber: poNumber || undefined,
          poDate: poDate || undefined,
          notes: 'PO registered from pipeline stage transition',
        });
        cycleId = cycle.id;
      } else if (poTarget.cycle) {
        // Update existing cycle with PO details
        await contractApi.updateCycle(poTarget.subscription.id, poTarget.cycle.id, {
          startDate: poTarget.cycle.startDate,
          endDate: poTarget.cycle.endDate,
          amount: Number(poAmount) || poTarget.cycle.amount,
          poNumber: poNumber || undefined,
          poDate: poDate || undefined,
          notes: poTarget.cycle.notes || undefined,
        });
      }

      // 2. Upload PO file if provided
      if (cycleId && poFile) {
        await poDocumentApi.upload(cycleId, poFile);
      }

      // 3. Move stage to PO_RECEIVED if it's currently earlier
      const currentStageIdx = ALL_PIPELINE_STAGES.findIndex(
        (s) => s.key === poTarget.company.pipelineStage
      );
      const poStageIdx = ALL_PIPELINE_STAGES.findIndex((s) => s.key === 'PO_RECEIVED');
      if (currentStageIdx < poStageIdx) {
        await companyApi.updatePipelineStage(
          poTarget.company.id,
          'PO_RECEIVED',
          `PO ${poNumber || ''} registered and verified.`
        );
      }

      alert('Purchase Order & document saved successfully!');
      setPoTarget(null);
      loadPipelineData();
    } catch (err) {
      console.error(err);
      alert('Failed to save Purchase Order details.');
    } finally {
      setIsSavingPo(false);
    }
  };

  // Stage advance helper
  const handleDirectStageChange = async (company: CompanyDto, newStage: string) => {
    // If moving to PO_RECEIVED and no PO is attached, prompt PO modal
    if (newStage === 'PO_RECEIVED') {
      const item = pipelineData.find((p) => p.company.id === company.id);
      if (item) {
        openPoModal(item);
        return;
      }
    }

    setUpdatingId(company.id);
    try {
      const updated = await companyApi.updatePipelineStage(
        company.id,
        newStage,
        `Moved stage to ${newStage}`
      );
      setPipelineData((prev) =>
        prev.map((item) =>
          item.company.id === updated.id ? { ...item, company: updated } : item
        )
      );
    } catch (err) {
      alert('Failed to update stage.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Open Stage History
  const openHistory = async (comp: CompanyDto) => {
    setHistoryTarget(comp);
    setLoadingHistory(true);
    try {
      const hist = await companyApi.getStageHistory(comp.id);
      setStageHistory(hist);
    } catch (err) {
      setStageHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Filtered companies
  const filteredData = pipelineData.filter((item) => {
    if (stageFilter !== 'ALL' && item.company.pipelineStage !== stageFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.company.name.toLowerCase().includes(q);
      const matchInd = (item.company.industry || '').toLowerCase().includes(q);
      const matchCity = (item.company.city || '').toLowerCase().includes(q);
      const matchPo = (item.cycle?.poNumber || '').toLowerCase().includes(q);
      return matchName || matchInd || matchCity || matchPo;
    }
    return true;
  });

  // Calculate Pipeline Metrics
  const totalAccounts = pipelineData.length;
  const inTalksCount = pipelineData.filter((p) =>
    ['LEAD', 'IN_TALKS', 'DEMO', 'QUOTATION_SENT'].includes(p.company.pipelineStage)
  ).length;
  const poBookedCount = pipelineData.filter((p) =>
    ['PO_RECEIVED', 'INSTALLATION'].includes(p.company.pipelineStage)
  ).length;
  const liveCount = pipelineData.filter((p) =>
    ['LIVE', 'RENEWAL_DUE', 'RENEWED'].includes(p.company.pipelineStage)
  ).length;

  const totalPipelineACV = pipelineData.reduce(
    (sum, p) => sum + (p.cycle?.amount || 15000),
    0
  );

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto">
      {/* Header & KPI Summary Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-text text-label-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-sage animate-pulse"></span>
            <span>Commercial &amp; Deployment Funnel</span>
            <span>•</span>
            <span>Annual PO Contract Pipeline</span>
          </div>
          <h1 className="mt-1 font-headline text-headline-xl text-ink font-semibold">
            Sales &amp; Delivery Pipeline
          </h1>
          <p className="mt-0.5 text-body-sm text-stone-text">
            Track client contracts from initial Lead &amp; Quotation to PO receipt, on-site Installation, and annual Renewals.
          </p>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-3">
          {/* Switcher Pill */}
          <div className="flex items-center rounded-card border border-divider bg-card p-1 shadow-sm">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-input text-label-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'KANBAN'
                  ? 'bg-sage text-white shadow-sm'
                  : 'text-stone-text hover:text-ink hover:bg-divider/40'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-input text-label-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-sage text-white shadow-sm'
                  : 'text-stone-text hover:text-ink hover:bg-divider/40'
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>Full List View</span>
            </button>
          </div>

          <button
            onClick={loadPipelineData}
            title="Refresh accounts and PO states"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-card border border-divider bg-card hover:bg-divider/40 text-stone-text hover:text-ink text-label-xs font-medium shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-sage ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Pipeline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="rounded-card bg-card p-5 shadow-card border border-divider">
          <div className="flex items-center justify-between">
            <span className="text-label-xs font-semibold uppercase tracking-wider text-stone-text">
              Total Funnel Value
            </span>
            <IndianRupee className="h-4 w-4 text-sage" />
          </div>
          <p className="mt-3 font-headline text-headline-lg font-bold text-ink">
            {formatINR(totalPipelineACV)}
          </p>
          <p className="mt-1 text-body-xs text-stone-text">
            {totalAccounts} Accounts across 10 stages
          </p>
        </div>

        <div className="rounded-card bg-card p-5 shadow-card border border-divider">
          <div className="flex items-center justify-between">
            <span className="text-label-xs font-semibold uppercase tracking-wider text-stone-text">
              In Talks / Quotation
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#E1EAF1] text-[#7C97AE] text-label-xs font-semibold">
              Pre-PO
            </span>
          </div>
          <p className="mt-3 font-headline text-headline-lg font-bold text-ink">
            {inTalksCount}
          </p>
          <p className="mt-1 text-body-xs text-stone-text">Active commercial negotiations</p>
        </div>

        <div className="rounded-card bg-card p-5 shadow-card border border-divider">
          <div className="flex items-center justify-between">
            <span className="text-label-xs font-semibold uppercase tracking-wider text-stone-text">
              PO Received / Install
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-label-xs font-semibold border border-amber-200">
              Deployment
            </span>
          </div>
          <p className="mt-3 font-headline text-headline-lg font-bold text-ink">
            {poBookedCount}
          </p>
          <p className="mt-1 text-body-xs text-stone-text">Checklist &amp; installation active</p>
        </div>

        <div className="rounded-card bg-card p-5 shadow-card border border-divider">
          <div className="flex items-center justify-between">
            <span className="text-label-xs font-semibold uppercase tracking-wider text-stone-text">
              Live &amp; Renewals
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sage-light text-sage-dark text-label-xs font-semibold">
              Live Term
            </span>
          </div>
          <p className="mt-3 font-headline text-headline-lg font-bold text-ink">
            {liveCount}
          </p>
          <p className="mt-1 text-body-xs text-stone-text">Billed against verified client POs</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-3 rounded-card border border-divider shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          <button
            onClick={() => setStageFilter('ALL')}
            className={`px-3 py-1 rounded-pill text-label-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              stageFilter === 'ALL'
                ? 'bg-sage text-white'
                : 'text-stone-text hover:bg-divider/60'
            }`}
          >
            All Stages ({pipelineData.length})
          </button>
          {ALL_PIPELINE_STAGES.map((s) => {
            const count = pipelineData.filter((p) => p.company.pipelineStage === s.key).length;
            return (
              <button
                key={s.key}
                onClick={() => setStageFilter(s.key)}
                className={`px-3 py-1 rounded-pill text-label-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  stageFilter === s.key
                    ? 'bg-sage text-white'
                    : 'text-stone-text hover:bg-divider/60'
                }`}
              >
                {s.label} <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-text" />
          <input
            type="text"
            placeholder="Search account, city, PO #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-body-xs bg-canvas border border-divider rounded-input focus:outline-none focus:border-sage text-ink"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-24 text-center rounded-card border border-divider bg-card shadow-card">
          <RefreshCw className="mx-auto h-8 w-8 text-sage animate-spin mb-3" />
          <p className="text-body-sm text-stone-text">Loading client pipeline &amp; PO documents...</p>
        </div>
      ) : viewMode === 'KANBAN' ? (
        /* ══════════════════════════════════════════════════════════════════════════
           KANBAN BOARD VIEW (10 COLUMNS WITH PO BADGES & ACTIONS)
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="flex gap-4 overflow-x-auto pb-8 pt-1 scrollbar-hide">
          {ALL_PIPELINE_STAGES.map((stage, stageIndex) => {
            const inStage = filteredData.filter((p) => p.company.pipelineStage === stage.key);
            const nextStageObj = ALL_PIPELINE_STAGES[stageIndex + 1];

            return (
              <div
                key={stage.key}
                className="w-80 shrink-0 rounded-card bg-sidebar/70 border border-divider p-3.5 flex flex-col min-h-[620px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 border-b border-divider/70 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-headline text-label-sm font-bold text-ink">
                      {stage.label}
                    </span>
                    <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-canvas text-stone-text text-[11px] font-bold flex items-center justify-center border border-divider">
                      {inStage.length}
                    </span>
                  </div>

                  <span className="text-[10px] text-stone-text truncate max-w-[110px]" title={stage.description}>
                    {stage.description}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {inStage.map((item) => {
                    const comp = item.company;
                    const hasPo = !!item.cycle?.poNumber;
                    const docCount = item.documents?.length || 0;

                    return (
                      <div
                        key={comp.id}
                        className="p-4 rounded-card bg-card border border-divider shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between gap-3 group"
                      >
                        {/* Company Card Header */}
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-headline text-body-sm font-semibold text-ink line-clamp-1 group-hover:text-sage transition-colors">
                              {comp.name}
                            </h3>
                            <StatusBadge stage={comp.pipelineStage} />
                          </div>

                          <p className="text-[11px] text-stone-text mt-1">
                            {comp.industry || 'Industrial'} • {comp.city ? `${comp.city}, ` : ''}{comp.country || 'India'}
                          </p>

                          {/* Annual Value & Product */}
                          <div className="mt-2.5 pt-2 border-t border-divider/60 flex items-center justify-between text-body-xs">
                            <span className="text-stone-text">
                              {item.subscription?.productName || 'AQS Suite'}
                            </span>
                            <span className="font-semibold text-ink">
                              {formatINR(item.cycle?.amount || 1200000)} / yr
                            </span>
                          </div>
                        </div>

                        {/* PO STATUS SECTION */}
                        <div className="rounded-input bg-canvas/70 border border-divider/70 p-2.5 text-body-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-stone-text font-medium flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-sage" />
                              <span>Purchase Order:</span>
                            </span>

                            {hasPo ? (
                              <span className="font-mono text-[11px] font-bold text-ink bg-card px-1.5 py-0.5 rounded border border-divider">
                                {item.cycle?.poNumber}
                              </span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-amber-200">
                                Pending PO
                              </span>
                            )}
                          </div>

                          {/* PO Document Indicator & Upload Action */}
                          <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-divider/40 text-[11px]">
                            {docCount > 0 ? (
                              <span className="inline-flex items-center gap-1 text-sage font-medium">
                                <FileCheck className="h-3.5 w-3.5" />
                                <span>{docCount} File{docCount > 1 ? 's' : ''} in MinIO</span>
                              </span>
                            ) : (
                              <span className="text-stone-text">No document attached</span>
                            )}

                            <button
                              onClick={() => openPoModal(item)}
                              className="text-sage hover:underline font-semibold cursor-pointer flex items-center gap-1"
                            >
                              <Upload className="h-3 w-3" />
                              <span>{hasPo ? 'Manage PO' : 'Record PO'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Card Footer: Quick Actions */}
                        <div className="pt-2 border-t border-divider/60 flex items-center justify-between gap-2">
                          <button
                            onClick={() => openHistory(comp)}
                            className="text-[11px] text-stone-text hover:text-ink cursor-pointer"
                          >
                            History &rarr;
                          </button>

                          {/* Move to next stage button */}
                          {nextStageObj && (
                            <button
                              onClick={() => handleDirectStageChange(comp, nextStageObj.key)}
                              disabled={updatingId === comp.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sage-light hover:bg-sage text-sage-dark hover:text-white text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                              title={`Advance to ${nextStageObj.label}`}
                            >
                              <span>{nextStageObj.label}</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {inStage.length === 0 && (
                    <div className="py-12 text-center text-[12px] text-stone-text/60 border border-dashed border-divider rounded-lg">
                      No accounts in {stage.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════════
           FULL LIST / TABLE VIEW (SEE EVERY SINGLE ACCOUNT WITH NO CUT-OFFS)
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="rounded-card border border-divider bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-canvas border-b border-divider text-label-xs uppercase tracking-wider text-stone-text">
                <tr>
                  <th className="px-5 py-3.5">Company Account</th>
                  <th className="px-5 py-3.5">Location &amp; Industry</th>
                  <th className="px-5 py-3.5">Pipeline Stage</th>
                  <th className="px-5 py-3.5">PO Number &amp; Date</th>
                  <th className="px-5 py-3.5">MinIO Documents</th>
                  <th className="px-5 py-3.5">Annual Value</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-text text-body-sm">
                      No client accounts matched your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const comp = item.company;
                    const hasPo = !!item.cycle?.poNumber;
                    const docCount = item.documents?.length || 0;

                    return (
                      <tr key={comp.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-headline font-semibold text-ink">
                            {comp.name}
                          </div>
                          <div className="text-body-xs text-stone-text">
                            {item.subscription?.productName || 'AQS Industrial Suite'}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-ink font-medium">
                            {comp.city || '—'}, {comp.state || comp.country || 'India'}
                          </div>
                          <div className="text-body-xs text-stone-text">
                            {comp.industry || 'Industrial'}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {/* Interactive Stage Picker Dropdown */}
                            <select
                              value={comp.pipelineStage}
                              onChange={(e) => handleDirectStageChange(comp, e.target.value)}
                              className="text-label-xs font-semibold rounded-pill px-2.5 py-1 border border-divider bg-card focus:outline-none focus:border-sage cursor-pointer"
                            >
                              {ALL_PIPELINE_STAGES.map((s) => (
                                <option key={s.key} value={s.key}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {hasPo ? (
                            <div>
                              <div className="font-mono text-body-xs font-bold text-ink">
                                {item.cycle?.poNumber}
                              </div>
                              <div className="text-[11px] text-stone-text">
                                Date: {item.cycle?.poDate || '—'}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              PO Not Issued
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {docCount > 0 ? (
                            <div className="flex items-center gap-1.5 text-sage font-medium text-body-xs">
                              <FileCheck className="h-4 w-4" />
                              <span>{docCount} Document{docCount > 1 ? 's' : ''}</span>
                            </div>
                          ) : (
                            <span className="text-body-xs text-stone-text">No document</span>
                          )}
                        </td>

                        <td className="px-5 py-4 font-semibold text-ink">
                          {formatINR(item.cycle?.amount || 1200000)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openPoModal(item)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-card border border-divider bg-card hover:bg-divider/50 text-ink text-label-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Upload className="h-3 w-3 text-sage" />
                              <span>{hasPo ? 'Edit PO' : 'Record PO'}</span>
                            </button>

                            <button
                              onClick={() => openHistory(comp)}
                              className="p-1 rounded hover:bg-divider text-stone-text hover:text-ink cursor-pointer"
                              title="View Stage Transition History"
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
         MODAL: RECORD / MANAGE PO & UPLOAD DOCUMENT (MINIO S3)
         ══════════════════════════════════════════════════════════════════════════ */}
      {poTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-card border border-divider bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div>
                <h2 className="font-headline text-headline-sm text-ink">
                  {poTarget.cycle?.poNumber ? 'Manage Purchase Order' : 'Record Purchase Order (PO)'}
                </h2>
                <p className="text-body-xs text-stone-text">
                  {poTarget.company.name} • Stage: {poTarget.company.pipelineStage}
                </p>
              </div>
              <button
                onClick={() => setPoTarget(null)}
                className="text-stone-text hover:text-ink cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 p-3.5 rounded-card bg-sage-light/60 border border-sage/30 text-body-xs text-sage-dark flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-sage shrink-0 mt-0.5" />
              <div>
                <strong>Annual PO Billing Workflow:</strong> Saving this PO will verify the account, record the annual contract cycle, and securely hash and store the PO document in MinIO S3 object storage.
              </div>
            </div>

            <form onSubmit={handleSavePo} className="mt-5 space-y-4">
              {/* Product Selection if no subscription yet */}
              {!poTarget.subscription && (
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    Licensed Software Product *
                  </label>
                  <select
                    required
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(Number(e.target.value))}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatINR(p.annualPrice)}/yr)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    PO Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO-2026-ENG-882"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage font-mono"
                  />
                </div>
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    PO Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                  Annual Contract Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="15000"
                  value={poAmount}
                  onChange={(e) => setPoAmount(e.target.value)}
                  className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                />
              </div>

              {/* Upload PO Document File */}
              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                  Upload PO Document (PDF, JPG, PNG &lt;15MB)
                </label>
                <div className="border-2 border-dashed border-divider hover:border-sage rounded-card p-4 text-center cursor-pointer bg-canvas/40 transition-colors">
                  <Upload className="mx-auto h-7 w-7 text-stone-text mb-1" />
                  <p className="text-body-xs text-stone-text">
                    {poFile ? poFile.name : 'Click to select signed client Purchase Order file'}
                  </p>
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={(e) => setPoFile(e.target.files?.[0] || null)}
                    className="mt-2 block w-full text-xs text-stone-text file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:bg-sage-light file:text-sage-dark file:font-semibold hover:file:bg-sage-light/80"
                  />
                </div>
              </div>

              {/* Existing Uploaded Documents List */}
              {poTarget.documents && poTarget.documents.length > 0 && (
                <div className="pt-2">
                  <span className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-2">
                    Attached MinIO S3 Documents
                  </span>
                  <div className="space-y-1.5">
                    {poTarget.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 rounded-card bg-canvas border border-divider text-body-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-sage shrink-0" />
                          <span className="font-medium text-ink truncate max-w-xs">
                            {doc.fileName}
                          </span>
                          <span className="text-stone-text text-[11px]">
                            ({(doc.fileSize / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-text font-mono">
                          {doc.createdAt?.slice(0, 10)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setPoTarget(null)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPo}
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSavingPo ? 'Saving to MinIO...' : 'Save Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
         DRAWER / MODAL: STAGE TRANSITION HISTORY
         ══════════════════════════════════════════════════════════════════════════ */}
      {historyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-card border border-divider bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div>
                <h2 className="font-headline text-headline-sm text-ink">
                  Pipeline Stage History
                </h2>
                <p className="text-body-xs text-stone-text">{historyTarget.name}</p>
              </div>
              <button
                onClick={() => setHistoryTarget(null)}
                className="text-stone-text hover:text-ink cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              {loadingHistory ? (
                <div className="py-8 text-center text-body-xs text-stone-text">
                  Loading transition history...
                </div>
              ) : stageHistory.length === 0 ? (
                <div className="py-8 text-center text-body-xs text-stone-text">
                  No historical stage transitions recorded yet.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-divider">
                  {stageHistory.map((h) => (
                    <div key={h.id} className="relative">
                      <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-sage ring-4 ring-card"></span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline text-label-xs font-semibold text-ink">
                            {h.toStage}
                          </span>
                          {h.fromStage && (
                            <span className="text-[11px] text-stone-text">
                              from {h.fromStage}
                            </span>
                          )}
                        </div>
                        {h.notes && (
                          <p className="text-body-xs text-stone-text mt-0.5">{h.notes}</p>
                        )}
                        <p className="text-[10px] text-stone-text/70 mt-0.5">
                          {h.createdAt?.slice(0, 16).replace('T', ' ')} • by {h.changedByName || 'Admin'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end pt-3 border-t border-divider">
              <button
                onClick={() => setHistoryTarget(null)}
                className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
