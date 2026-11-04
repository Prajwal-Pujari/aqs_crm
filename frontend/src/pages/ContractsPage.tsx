import { useState, useEffect } from 'react';
import { companyApi, subscriptionApi, contractApi, poDocumentApi } from '@/api/services';
import type { CompanyDto, SubscriptionDto, ContractCycleDto, PoDocumentDto } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatINR } from '@/utils/currency';
import {
  FileText,
  Search,
  Calendar,
  IndianRupee,
  Building2,
  RefreshCw,
  Upload,
  CheckCircle2,
  X,
  ExternalLink,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ContractRow {
  cycle: ContractCycleDto;
  subscription: SubscriptionDto;
  company: CompanyDto;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Renew Modal
  const [renewTarget, setRenewTarget] = useState<ContractRow | null>(null);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPoNumber, setNewPoNumber] = useState('');
  const [newPoDate, setNewPoDate] = useState('');
  const [renewNotes, setRenewNotes] = useState('');
  const [isRenewing, setIsRenewing] = useState(false);

  // Upload PO Modal
  const [uploadTargetCycleId, setUploadTargetCycleId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const compRes = await companyApi.getAll();
      const comps = compRes.content || [];

      const rows: ContractRow[] = [];

      await Promise.all(
        comps.map(async (company) => {
          try {
            const subs = await subscriptionApi.getByCompany(company.id);
            await Promise.all(
              subs.map(async (sub) => {
                try {
                  const cycles = await contractApi.getCycles(sub.id);
                  cycles.forEach((cycle) => {
                    rows.push({
                      cycle,
                      subscription: sub,
                      company,
                    });
                  });
                } catch (e) {
                  // ignore
                }
              })
            );
          } catch (e) {
            // ignore
          }
        })
      );

      // Sort by end date ascending
      rows.sort((a, b) => new Date(a.cycle.endDate).getTime() - new Date(b.cycle.endDate).getTime());
      setContracts(rows);
    } catch (err) {
      console.error('Failed to load contracts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openRenewModal = (row: ContractRow) => {
    setRenewTarget(row);
    // Default next start = prev end + 1 day
    const prevEnd = new Date(row.cycle.endDate);
    const nextStart = new Date(prevEnd);
    nextStart.setDate(prevEnd.getDate() + 1);

    const nextEnd = new Date(nextStart);
    nextEnd.setFullYear(nextStart.getFullYear() + 1);
    nextEnd.setDate(nextEnd.getDate() - 1);

    setNewStartDate(nextStart.toISOString().split('T')[0]);
    setNewEndDate(nextEnd.toISOString().split('T')[0]);
    setNewAmount(String(row.cycle.amount));
    setNewPoNumber('');
    setNewPoDate(new Date().toISOString().split('T')[0]);
    setRenewNotes(`Annual renewal from Cycle #${row.cycle.cycleNo}`);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewTarget) return;

    setIsRenewing(true);
    try {
      await contractApi.renewCycle(renewTarget.subscription.id, renewTarget.cycle.id, {
        startDate: newStartDate,
        endDate: newEndDate,
        amount: Number(newAmount),
        poNumber: newPoNumber || undefined,
        poDate: newPoDate || undefined,
        notes: renewNotes || undefined,
      });

      alert('Subscription cycle renewed successfully! Prior reminders cancelled and new cycle created.');
      setRenewTarget(null);
      loadData();
    } catch (err) {
      alert('Failed to renew subscription cycle.');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleUploadPo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTargetCycleId || !selectedFile) return;

    setIsUploading(true);
    try {
      await poDocumentApi.upload(uploadTargetCycleId, selectedFile);
      alert('PO document uploaded and SHA-256 hashed successfully in MinIO storage!');
      setUploadTargetCycleId(null);
      setSelectedFile(null);
      loadData();
    } catch (err) {
      alert('Failed to upload PO document.');
    } finally {
      setIsUploading(false);
    }
  };

  // Stats calculation
  const totalACV = contracts.reduce((sum, r) => sum + (r.cycle.amount || 0), 0);
  const activeCount = contracts.filter((r) => r.cycle.status === 'ACTIVE').length;
  const dueCount = contracts.filter((r) => r.cycle.status === 'RENEWAL_DUE').length;
  const overdueCount = contracts.filter((r) => r.cycle.status === 'OVERDUE').length;

  const filteredContracts = contracts.filter((r) => {
    if (statusFilter !== 'ALL' && r.cycle.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComp = r.company.name.toLowerCase().includes(q);
      const matchProd = r.subscription.productName.toLowerCase().includes(q);
      const matchPo = (r.cycle.poNumber || '').toLowerCase().includes(q);
      return matchComp || matchProd || matchPo;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-text text-label-sm font-medium">
            <FileText className="h-4 w-4 text-sage" />
            <span>Annual Subscription Contracts &amp; PO Cycles</span>
          </div>
          <h1 className="mt-1 font-headline text-headline-xl text-ink font-medium">
            Contract Cycles Portfolio
          </h1>
          <p className="mt-0.5 text-body-sm text-stone-text">
            Every annual term is tracked as an immutable cycle billed against client Purchase Orders.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-card border border-divider bg-card hover:bg-divider/50 text-ink text-label-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 text-sage" />
          <span>Refresh Cycles</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="rounded-card bg-card p-5 shadow-card border border-divider">
          <span className="text-label-xs font-semibold uppercase tracking-wider text-stone-text">
            Total Contract Value
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-headline text-headline-lg text-ink font-bold">
              {formatINR(totalACV)}
            </span>
            <IndianRupee className="h-5 w-5 text-sage" />
          </div>
          <p className="mt-1 text-body-xs text-stone-text">{contracts.length} Total Annual Cycles</p>
        </div>

        <div className="rounded-card bg-card p-5 shadow-card border border-divider">
          <span className="text-label-xs font-semibold uppercase tracking-wider text-stone-text">
            Active Subscriptions
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-headline text-headline-lg text-[#446254] font-bold">
              {activeCount}
            </span>
            <CheckCircle2 className="h-5 w-5 text-[#446254]" />
          </div>
          <p className="mt-1 text-body-xs text-stone-text">Currently in active billing term</p>
        </div>

        <div className="rounded-card bg-card p-5 shadow-card border border-divider">
          <span className="text-label-xs font-semibold uppercase tracking-wider text-stone-text">
            Renewal Due (60-day window)
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-headline text-headline-lg text-[#C98F4F] font-bold">
              {dueCount}
            </span>
            <Calendar className="h-5 w-5 text-[#C98F4F]" />
          </div>
          <p className="mt-1 text-body-xs text-stone-text">Automated reminder triggers active</p>
        </div>

        <div className="rounded-card bg-card p-5 shadow-card border border-divider">
          <span className="text-label-xs font-semibold uppercase tracking-wider text-stone-text">
            Overdue Cycles
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-headline text-headline-lg text-[#BC6A5C] font-bold">
              {overdueCount}
            </span>
            <AlertTriangle className="h-5 w-5 text-[#BC6A5C]" />
          </div>
          <p className="mt-1 text-body-xs text-stone-text">Requires immediate sales follow-up</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: 'ALL', label: 'All Cycles' },
              { key: 'ACTIVE', label: 'Active' },
              { key: 'RENEWAL_DUE', label: 'Renewal Due' },
              { key: 'OVERDUE', label: 'Overdue' },
              { key: 'RENEWED', label: 'Renewed (Archived)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-pill text-label-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-sage text-white'
                  : 'bg-card text-stone-text border border-divider hover:text-ink hover:bg-divider/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-text" />
          <input
            type="text"
            placeholder="Search company, product, PO #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-body-sm bg-card border border-divider rounded-input focus:outline-none focus:border-sage"
          />
        </div>
      </div>

      {/* Contract Table */}
      <div className="rounded-card border border-divider bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-body-sm text-stone-text">
            Loading contract cycles...
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="py-20 text-center p-8">
            <FileText className="mx-auto h-12 w-12 text-stone-border mb-3" />
            <h3 className="font-headline text-headline-sm text-ink">No contract cycles found</h3>
            <p className="mt-1 text-body-sm text-stone-text max-w-sm mx-auto">
              Create client companies and subscriptions with PO contract cycles to monitor terms here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-canvas border-b border-divider text-label-xs uppercase tracking-wider text-stone-text">
                <tr>
                  <th className="px-5 py-3.5">Company &amp; Product</th>
                  <th className="px-5 py-3.5">Cycle #</th>
                  <th className="px-5 py-3.5">Term Window</th>
                  <th className="px-5 py-3.5">Annual Value</th>
                  <th className="px-5 py-3.5">PO Number</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {filteredContracts.map((row) => (
                  <tr key={row.cycle.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-headline font-semibold text-ink">
                        {row.company.name}
                      </div>
                      <div className="text-body-xs text-stone-text flex items-center gap-1.5 mt-0.5">
                        <span>{row.subscription.productName}</span>
                        <span>•</span>
                        <span>Site: {row.subscription.site || 'Primary'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-sage-light text-sage-dark text-label-xs font-semibold">
                        Cycle {row.cycle.cycleNo}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-ink font-medium">
                        {row.cycle.startDate} → {row.cycle.endDate}
                      </div>
                      <div className="text-body-xs text-stone-text">
                        {new Date(row.cycle.endDate) < new Date()
                          ? 'Term finished'
                          : `${Math.ceil(
                              (new Date(row.cycle.endDate).getTime() - Date.now()) / (1000 * 86400)
                            )} days remaining`}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-ink">
                      {formatINR(row.cycle.amount)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-mono text-body-xs text-ink">
                        {row.cycle.poNumber || '—'}
                      </div>
                      {row.cycle.poDate && (
                        <div className="text-label-xs text-stone-text">PO Date: {row.cycle.poDate}</div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={row.cycle.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setUploadTargetCycleId(row.cycle.id)}
                          title="Upload PO Document PDF/Image to MinIO S3"
                          className="p-1.5 rounded-md hover:bg-divider text-stone-text hover:text-ink cursor-pointer"
                        >
                          <Upload className="h-4 w-4" />
                        </button>

                        {row.cycle.status !== 'RENEWED' && (
                          <button
                            onClick={() => openRenewModal(row)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-card bg-sage hover:bg-sage-hover text-white text-label-xs font-semibold transition-colors cursor-pointer"
                          >
                            <RefreshCw className="h-3 w-3" />
                            <span>Renew</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Renew Contract */}
      {renewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-card border border-divider bg-card p-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div>
                <h2 className="font-headline text-headline-sm text-ink">
                  Renew Annual Subscription
                </h2>
                <p className="text-body-xs text-stone-text">
                  {renewTarget.company.name} • {renewTarget.subscription.productName}
                </p>
              </div>
              <button
                onClick={() => setRenewTarget(null)}
                className="text-stone-text hover:text-ink cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 p-3 rounded-card bg-sage-light/60 border border-sage/30 text-body-xs text-sage-dark flex items-start gap-2">
              <Info className="h-4 w-4 text-sage shrink-0 mt-0.5" />
              <div>
                <strong>Renewal Invariant:</strong> The previous cycle (#{renewTarget.cycle.cycleNo}) is preserved as RENEWED and never overwritten. Start date defaults to previous end date + 1 day.
              </div>
            </div>

            <form onSubmit={handleRenewSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    New Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  />
                </div>
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    New End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                  Annual Renewal Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    New PO Number
                  </label>
                  <input
                    type="text"
                    value={newPoNumber}
                    onChange={(e) => setNewPoNumber(e.target.value)}
                    placeholder="e.g. PO-2027-009"
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  />
                </div>
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    PO Date
                  </label>
                  <input
                    type="date"
                    value={newPoDate}
                    onChange={(e) => setNewPoDate(e.target.value)}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={renewNotes}
                  onChange={(e) => setRenewNotes(e.target.value)}
                  className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setRenewTarget(null)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRenewing}
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {isRenewing ? 'Creating Cycle...' : 'Confirm Renewal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload PO */}
      {uploadTargetCycleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-card border border-divider bg-card p-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <h2 className="font-headline text-headline-sm text-ink">Upload PO Document</h2>
              <button
                onClick={() => setUploadTargetCycleId(null)}
                className="text-stone-text hover:text-ink cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadPo} className="mt-4 space-y-4">
              <div className="border-2 border-dashed border-divider hover:border-sage rounded-card p-6 text-center cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-stone-text mb-2" />
                <p className="text-body-sm text-stone-text">
                  {selectedFile ? selectedFile.name : 'Select PDF, JPG, or PNG Purchase Order file'}
                </p>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  required
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="mt-3 block w-full text-xs text-stone-text file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-sage-light file:text-sage-dark file:font-semibold hover:file:bg-sage-light/80"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setUploadTargetCycleId(null)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Uploading to MinIO...' : 'Upload & Hash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

