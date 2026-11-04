import { useState, useEffect } from 'react';
import {
  companyApi,
  contactApi,
  subscriptionApi,
  contractApi,
  poDocumentApi,
  checklistApi,
  productApi,
  activityApi,
  issueApi,
  taskApi,
  timelineApi,
} from '@/api/services';
import type {
  CompanyDto,
  ContactDto,
  SubscriptionDto,
  ContractCycleDto,
  PoDocumentDto,
  ChecklistItemDto,
  ProductDto,
  ActivityDto,
  ActivityType,
  IssueDto,
  IssuePriority,
  IssueStatus,
  TaskDto,
  TimelineEventDto,
  PipelineStage,
} from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatINR } from '@/utils/currency';
import {
  Search,
  Plus,
  Building2,
  FileText,
  Upload,
  Calendar,
  IndianRupee,
  User,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  X,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckSquare,
  Square,
  Send,
  FileCheck,
  ArrowRight,
  Info,
  ListTodo,
  Package,
  Edit3,
  Layers,
} from 'lucide-react';

const STANDARD_SERVICES = ['GMS', 'NABL', 'QMS', 'LCMS', 'Automations'];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDto | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Inspector Tab
  const [inspectorTab, setInspectorTab] = useState<'OVERVIEW' | 'TIMELINE' | 'ISSUES' | 'TASKS'>('OVERVIEW');

  // Inspector details
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([]);
  const [cycles, setCycles] = useState<ContractCycleDto[]>([]);
  const [documents, setDocuments] = useState<PoDocumentDto[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItemDto[]>([]);
  const [activities, setActivities] = useState<ActivityDto[]>([]);
  const [issues, setIssues] = useState<IssueDto[]>([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [timeline, setTimeline] = useState<TimelineEventDto[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Modals
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isUploadPoOpen, setIsUploadPoOpen] = useState(false);

  // Phase 3 Modals
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('CALL');
  const [activitySubject, setActivitySubject] = useState('');
  const [activityDetails, setActivityDetails] = useState('');
  const [activityOutcome, setActivityOutcome] = useState('');
  const [activityFollowUp, setActivityFollowUp] = useState('');
  const [activityContactId, setActivityContactId] = useState<number | ''>('');
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issuePriority, setIssuePriority] = useState<IssuePriority>('MEDIUM');
  const [isSavingIssue, setIsSavingIssue] = useState(false);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [isSavingTask, setIsSavingTask] = useState(false);

  // Service filter state
  const [serviceFilter, setServiceFilter] = useState('ALL');

  // Manage Services Modal for Selected Company
  const [isManageServicesOpen, setIsManageServicesOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [isSavingServices, setIsSavingServices] = useState(false);

  // New Company Services (in Add Company modal)
  const [newCompanyServices, setNewCompanyServices] = useState<string[]>(['GMS', 'QMS']);
  const [newCustomService, setNewCustomService] = useState('');
  const [newCompanyStage, setNewCompanyStage] = useState<PipelineStage>('LEAD');

  // Add Subscription Modal
  const [isAddSubscriptionOpen, setIsAddSubscriptionOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<ProductDto[]>([]);
  const [subProductId, setSubProductId] = useState<number | ''>('');
  const [subVersion, setSubVersion] = useState('v1.0');
  const [subSite, setSubSite] = useState('');
  const [subAmount, setSubAmount] = useState<number>(25000);
  const [subPoNumber, setSubPoNumber] = useState('');
  const [isSavingSub, setIsSavingSub] = useState(false);

  // Edit Contract Cycle Modal
  const [isEditCycleOpen, setIsEditCycleOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<ContractCycleDto | null>(null);
  const [editCycleAmount, setEditCycleAmount] = useState<number>(25000);
  const [editCyclePoNumber, setEditCyclePoNumber] = useState('');
  const [editCyclePoDate, setEditCyclePoDate] = useState('');
  const [editCycleStartDate, setEditCycleStartDate] = useState('');
  const [editCycleEndDate, setEditCycleEndDate] = useState('');
  const [isSavingEditCycle, setIsSavingEditCycle] = useState(false);

  // Load companies
  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await companyApi.getAll('', undefined, 0, 200);
      const list = res.content || [];
      setCompanies(list);
      if (list.length > 0 && !selectedCompany) {
        setSelectedCompany(list[0]);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
    productApi.getAll().then((prods) => {
      setAvailableProducts(prods);
      if (prods && prods.length > 0) {
        setSubProductId(prods[0].id);
      }
    }).catch(console.error);
  }, []);

  const handleOpenManageServices = () => {
    if (!selectedCompany) return;
    const current = selectedCompany.servicesProvided
      ? selectedCompany.servicesProvided.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    setSelectedServices(current);
    setIsManageServicesOpen(true);
  };

  const handleToggleService = (key: string) => {
    setSelectedServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleAddCustomService = () => {
    const val = customServiceInput.trim();
    if (val && !selectedServices.includes(val)) {
      setSelectedServices((prev) => [...prev, val]);
      setCustomServiceInput('');
    }
  };

  const handleSaveServices = async () => {
    if (!selectedCompany) return;
    setIsSavingServices(true);
    try {
      const servicesStr = selectedServices.join(', ');
      const updated = await companyApi.update(selectedCompany.id, {
        servicesProvided: servicesStr,
      });
      setSelectedCompany(updated);
      setCompanies((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setIsManageServicesOpen(false);
    } catch (err) {
      alert('Failed to update company services.');
    } finally {
      setIsSavingServices(false);
    }
  };

  const handleToggleNewService = (key: string) => {
    setNewCompanyServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleAddNewCustomService = () => {
    const val = newCustomService.trim();
    if (val && !newCompanyServices.includes(val)) {
      setNewCompanyServices((prev) => [...prev, val]);
      setNewCustomService('');
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !subProductId) return;
    setIsSavingSub(true);
    try {
      const sub = await subscriptionApi.create(selectedCompany.id, {
        productId: Number(subProductId),
        version: subVersion,
        site: subSite || undefined,
        installDate: new Date().toISOString().split('T')[0],
      });

      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);

      await contractApi.createFirstCycle(sub.id, {
        startDate: today.toISOString().split('T')[0],
        endDate: nextYear.toISOString().split('T')[0],
        amount: subAmount || 25000,
        poNumber: subPoNumber || undefined,
        poDate: today.toISOString().split('T')[0],
      });

      setIsAddSubscriptionOpen(false);
      setSubPoNumber('');
      setSubSite('');
      loadCompanyDetails();
    } catch (err) {
      alert('Failed to create software subscription.');
    } finally {
      setIsSavingSub(false);
    }
  };

  const handleOpenEditCycle = (cycle: ContractCycleDto) => {
    setEditingCycle(cycle);
    setEditCycleAmount(cycle.amount);
    setEditCyclePoNumber(cycle.poNumber || '');
    setEditCyclePoDate(cycle.poDate || '');
    setEditCycleStartDate(cycle.startDate || '');
    setEditCycleEndDate(cycle.endDate || '');
    setIsEditCycleOpen(true);
  };

  const handleSaveEditCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCycle || subscriptions.length === 0) return;
    setIsSavingEditCycle(true);
    try {
      await contractApi.updateCycle(subscriptions[0].id, editingCycle.id, {
        startDate: editCycleStartDate,
        endDate: editCycleEndDate,
        amount: Number(editCycleAmount),
        poNumber: editCyclePoNumber || undefined,
        poDate: editCyclePoDate || undefined,
      });
      setIsEditCycleOpen(false);
      loadCompanyDetails();
    } catch (err) {
      alert('Failed to update contract cycle.');
    } finally {
      setIsSavingEditCycle(false);
    }
  };

  // When selected company changes, load all sub-resources
  const loadCompanyDetails = async () => {
    if (!selectedCompany) return;
    setLoadingDetails(true);
    try {
      const [cList, sList, checkList, actList, issList, tList, tlList] = await Promise.all([
        contactApi.getByCompany(selectedCompany.id),
        subscriptionApi.getByCompany(selectedCompany.id),
        checklistApi.getByCompany(selectedCompany.id),
        activityApi.getByCompany(selectedCompany.id),
        issueApi.getByCompany(selectedCompany.id),
        taskApi.getByCompany(selectedCompany.id),
        timelineApi.getCompanyTimeline(selectedCompany.id),
      ]);

      setContacts(cList);
      setSubscriptions(sList);
      setChecklist(checkList);
      setActivities(actList);
      setIssues(issList);
      setTasks(tList);
      setTimeline(tlList);

      // Load cycles for first subscription
      if (sList.length > 0) {
        const cycleList = await contractApi.getCycles(sList[0].id);
        setCycles(cycleList);

        if (cycleList.length > 0) {
          const docList = await poDocumentApi.getDocuments(cycleList[0].id);
          setDocuments(docList);
        } else {
          setDocuments([]);
        }
      } else {
        setCycles([]);
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error loading company details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadCompanyDetails();
  }, [selectedCompany]);

  // Stage change handler
  const handleStageChange = async (newStage: string) => {
    if (!selectedCompany) return;
    try {
      const updated = await companyApi.updatePipelineStage(
        selectedCompany.id,
        newStage,
        `Stage updated to ${newStage}`
      );
      setSelectedCompany(updated);
      setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      loadCompanyDetails();
    } catch (err) {
      alert('Failed to update stage.');
    }
  };

  // Toggle checklist item
  const handleToggleChecklist = async (itemId: number) => {
    if (!selectedCompany) return;
    try {
      const updatedItem = await checklistApi.toggleItem(selectedCompany.id, itemId);
      setChecklist((prev) => prev.map((it) => (it.id === updatedItem.id ? updatedItem : it)));
    } catch (err) {
      console.error('Failed to toggle checklist item:', err);
    }
  };

  // Toggle task
  const handleToggleTask = async (taskId: number) => {
    try {
      const updated = await taskApi.toggle(taskId);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      alert('Failed to update task.');
    }
  };

  // Submit Activity
  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !activitySubject.trim()) return;

    setIsSavingActivity(true);
    try {
      await activityApi.create(selectedCompany.id, {
        contactId: activityContactId ? Number(activityContactId) : undefined,
        type: activityType,
        subject: activitySubject,
        details: activityDetails || undefined,
        outcome: activityOutcome || undefined,
        nextFollowUp: activityFollowUp || undefined,
      });

      setIsAddActivityOpen(false);
      setActivitySubject('');
      setActivityDetails('');
      setActivityOutcome('');
      setActivityFollowUp('');
      setActivityContactId('');
      loadCompanyDetails();
    } catch (err) {
      alert('Failed to log activity.');
    } finally {
      setIsSavingActivity(false);
    }
  };

  // Submit Issue
  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !issueTitle.trim()) return;

    setIsSavingIssue(true);
    try {
      await issueApi.create(selectedCompany.id, {
        title: issueTitle,
        description: issueDesc,
        priority: issuePriority,
      });

      setIsAddIssueOpen(false);
      setIssueTitle('');
      setIssueDesc('');
      setIssuePriority('MEDIUM');
      loadCompanyDetails();
    } catch (err) {
      alert('Failed to report issue.');
    } finally {
      setIsSavingIssue(false);
    }
  };

  // Submit Task
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !taskTitle.trim() || !taskDueDate) return;

    setIsSavingTask(true);
    try {
      await taskApi.create(selectedCompany.id, {
        title: taskTitle,
        dueDate: taskDueDate,
        priority: taskPriority,
      });

      setIsAddTaskOpen(false);
      setTaskTitle('');
      setTaskDueDate('');
      setTaskPriority('MEDIUM');
      loadCompanyDetails();
    } catch (err) {
      alert('Failed to create task.');
    } finally {
      setIsSavingTask(false);
    }
  };

  // Filtered companies by search, pipeline stage tab, and software / service
  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = c.name?.toLowerCase().includes(q);
      const matchIndustry = c.industry?.toLowerCase().includes(q);
      const matchCity = c.city?.toLowerCase().includes(q);
      const matchServices = c.servicesProvided?.toLowerCase().includes(q);
      if (!matchName && !matchIndustry && !matchCity && !matchServices) return false;
    }

    // Stage Tab Filter
    if (activeFilter === 'ACTIVE' && c.pipelineStage !== 'LIVE') return false;
    if (activeFilter === 'RENEWAL_DUE' && c.pipelineStage !== 'RENEWAL_DUE') return false;
    if (activeFilter === 'INSTALLATION' && c.pipelineStage !== 'INSTALLATION') return false;
    if (activeFilter === 'LEADS' && !['LEAD', 'IN_TALKS', 'DEMO', 'QUOTATION_SENT'].includes(c.pipelineStage)) return false;

    // Software / Services Filter
    if (serviceFilter !== 'ALL') {
      if (!c.servicesProvided || !c.servicesProvided.toLowerCase().includes(serviceFilter.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-text text-label-sm font-medium">
            <Building2 className="h-4 w-4 text-sage" />
            <span>Client Portfolio</span>
            <span>•</span>
            <span>Commercial Contracts &amp; Account Health</span>
          </div>
          <h1 className="mt-1 font-headline text-headline-xl text-ink font-semibold">
            Enterprise Accounts
          </h1>
          <p className="mt-0.5 text-body-sm text-stone-text">
            Annual subscription agreements, MinIO PO documents, and unified company timeline.
          </p>
        </div>

        <button
          onClick={() => setIsAddCompanyOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Client Account</span>
        </button>
      </div>

      {/* Main Split Layout: 7 Cols (Portfolio) / 5 Cols (Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Company Search & List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Filter Tabs */}
          <div className="bg-card rounded-card border border-divider p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-text" />
              <input
                type="text"
                placeholder="Search account, industry, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-body-sm bg-canvas border border-divider rounded-input focus:outline-none focus:border-sage text-ink"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide text-label-xs font-semibold">
              {[
                { key: 'ALL', label: 'All Accounts' },
                { key: 'ACTIVE', label: 'Live' },
                { key: 'RENEWAL_DUE', label: 'Renewal Due' },
                { key: 'INSTALLATION', label: 'Installation' },
                { key: 'LEADS', label: 'Funnel Leads' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === tab.key
                      ? 'bg-sage text-white shadow-sm'
                      : 'text-stone-text hover:bg-divider/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Software / Services Filter Bar */}
            <div className="pt-2.5 border-t border-divider/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-text flex items-center gap-1">
                  <Package className="h-3 w-3 text-sage" />
                  <span>Filter by Software / Services Provided:</span>
                </span>
                {serviceFilter !== 'ALL' && (
                  <button
                    onClick={() => setServiceFilter('ALL')}
                    className="text-[10px] text-sage hover:underline cursor-pointer font-medium"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide text-label-xs font-medium">
                {['ALL', 'GMS', 'NABL', 'QMS', 'LCMS', 'Automations'].map((svc) => (
                  <button
                    key={svc}
                    onClick={() => setServiceFilter(svc)}
                    className={`px-2.5 py-1 rounded-card transition-all cursor-pointer whitespace-nowrap text-body-xs ${
                      serviceFilter === svc
                        ? 'bg-sage text-white font-semibold shadow-xs'
                        : 'bg-canvas border border-divider text-stone-text hover:text-ink hover:border-stone-border'
                    }`}
                  >
                    {svc === 'ALL' ? 'All Services' : svc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Companies Feed */}
          {isLoading ? (
            <div className="py-20 text-center bg-card rounded-card border border-divider text-stone-text text-body-sm">
              Loading client accounts...
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="py-20 text-center bg-card rounded-card border border-divider p-8">
              <Building2 className="mx-auto h-10 w-10 text-stone-border mb-3" />
              <h3 className="font-headline text-headline-sm text-ink">No companies found</h3>
              <p className="text-body-xs text-stone-text mt-1">Try refining your search query.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredCompanies.map((c) => {
                const isSelected = selectedCompany?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCompany(c)}
                    className={`p-4 rounded-card bg-card transition-all cursor-pointer border flex items-center justify-between shadow-card hover:shadow-card-hover ${
                      isSelected
                        ? 'border-sage ring-2 ring-sage/15'
                        : 'border-divider hover:border-stone-border'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`h-11 w-11 rounded-card flex items-center justify-center font-headline text-headline-xs font-bold shrink-0 ${
                          isSelected ? 'bg-sage text-white' : 'bg-sage-light text-sage-dark'
                        }`}
                      >
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-headline text-body-md font-semibold text-ink truncate">
                          {c.name}
                        </h3>
                        <p className="text-body-xs text-stone-text truncate mt-0.5">
                          {c.industry || 'Industrial'} • {c.city ? `${c.city}, ` : ''}{c.country || 'India'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Software / Services Provided Badges */}
                      <div className="hidden sm:flex items-center gap-1.5 flex-wrap max-w-xs justify-end">
                        {c.servicesProvided ? (
                          c.servicesProvided
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .slice(0, 3)
                            .map((svc) => (
                              <span
                                key={svc}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-sage-light text-sage-dark border border-sage/20"
                              >
                                {svc}
                              </span>
                            ))
                        ) : (
                          <span className="text-[11px] text-stone-text italic">
                            No services yet
                          </span>
                        )}
                        {c.servicesProvided &&
                          c.servicesProvided
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean).length > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-canvas text-stone-text border border-divider">
                              +
                              {c.servicesProvided
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean).length - 3}
                            </span>
                          )}
                      </div>

                      <StatusBadge stage={c.pipelineStage} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Deep Inspector */}
        <div className="lg:col-span-5">
          {selectedCompany ? (
            <div className="bg-card rounded-card border border-divider shadow-card overflow-hidden">
              {/* Inspector Header */}
              <div className="p-6 border-b border-divider bg-canvas/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-headline text-headline-md font-bold text-ink">
                      {selectedCompany.name}
                    </h2>
                    <p className="text-body-xs text-stone-text mt-0.5">
                      {selectedCompany.city ? `${selectedCompany.city}, ` : ''}
                      {selectedCompany.state || selectedCompany.country || 'India'} • {selectedCompany.industry || 'Industrial'}
                    </p>
                  </div>

                  <StatusBadge stage={selectedCompany.pipelineStage} />
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-4 pt-4 border-t border-divider/60 flex items-center gap-2">
                  <button
                    onClick={() => setIsAddActivityOpen(true)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-card bg-sage hover:bg-sage-hover text-white text-label-xs font-semibold transition-colors shadow-sm cursor-pointer"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Log Activity</span>
                  </button>

                  <button
                    onClick={() => setIsAddIssueOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-card border border-divider bg-card hover:bg-divider/50 text-ink text-label-xs font-semibold transition-colors cursor-pointer"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-amber-700" />
                    <span>Report Issue</span>
                  </button>

                  <button
                    onClick={() => setIsAddTaskOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-card border border-divider bg-card hover:bg-divider/50 text-ink text-label-xs font-semibold transition-colors cursor-pointer"
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-sage" />
                    <span>Add Task</span>
                  </button>
                </div>

                {/* Inspector Navigation Tabs */}
                <div className="mt-4 flex items-center gap-1 border-b border-divider/70 text-label-xs font-semibold">
                  {[
                    { key: 'OVERVIEW', label: 'Contracts & Contacts' },
                    { key: 'TIMELINE', label: `Timeline (${timeline.length})` },
                    { key: 'ISSUES', label: `Issues (${issues.length})` },
                    { key: 'TASKS', label: `Tasks (${tasks.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setInspectorTab(tab.key as any)}
                      className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
                        inspectorTab === tab.key
                          ? 'border-sage text-sage font-bold'
                          : 'border-transparent text-stone-text hover:text-ink'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inspector Content Body */}
              <div className="p-6">
                {/* ─── TAB 1: OVERVIEW & CONTRACTS ─────────────────────────────── */}
                {inspectorTab === 'OVERVIEW' && (
                  <div className="space-y-6">
                    {/* Pipeline Stage Transition */}
                    <div>
                      <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1.5">
                        Pipeline Funnel Stage
                      </label>
                      <select
                        value={selectedCompany.pipelineStage}
                        onChange={(e) => handleStageChange(e.target.value)}
                        className="w-full text-body-xs font-semibold rounded-input border border-divider bg-canvas px-3 py-2 text-ink focus:outline-none focus:border-sage cursor-pointer"
                      >
                        <option value="LEAD">Lead</option>
                        <option value="IN_TALKS">In Talks</option>
                        <option value="DEMO">Demo</option>
                        <option value="QUOTATION_SENT">Quotation Sent</option>
                        <option value="PO_RECEIVED">PO Received</option>
                        <option value="INSTALLATION">Installation</option>
                        <option value="LIVE">Live Production</option>
                        <option value="RENEWAL_DUE">Renewal Due</option>
                        <option value="RENEWED">Renewed</option>
                        <option value="LAPSED">Lapsed</option>
                      </select>
                    </div>

                    {/* Software & Services Provided */}
                    <div className="p-4 rounded-lg bg-canvas/70 border border-divider">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-sage" />
                          <span className="text-label-sm font-semibold uppercase tracking-wider text-stone-text">
                            Software &amp; Services Provided
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenManageServices}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-canvas border border-divider hover:border-sage text-sage font-semibold text-label-xs cursor-pointer transition-colors shadow-xs"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Manage Services</span>
                        </button>
                      </div>

                      {selectedCompany.servicesProvided ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedCompany.servicesProvided
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((svc) => (
                              <span
                                key={svc}
                                className="px-2.5 py-1 rounded-md text-body-xs font-semibold bg-sage-light text-sage-dark border border-sage/20 shadow-xs flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
                                {svc}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <div className="text-body-xs text-stone-text italic py-1">
                          No software or services assigned yet. Click Manage Services to configure GMS, NABL, QMS, LCMS, Automations, etc.
                        </div>
                      )}
                    </div>

                    {/* Contacts List */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-label-sm font-semibold uppercase tracking-wider text-stone-text">
                          Key Stakeholders ({contacts.length})
                        </span>
                        <button
                          onClick={() => setIsAddContactOpen(true)}
                          className="text-label-xs text-sage hover:underline font-semibold cursor-pointer"
                        >
                          + Add Contact
                        </button>
                      </div>

                      {contacts.length === 0 ? (
                        <p className="text-body-xs text-stone-text">No contacts registered.</p>
                      ) : (
                        <div className="space-y-2">
                          {contacts.map((ct) => (
                            <div
                              key={ct.id}
                              className="p-3 rounded-lg bg-canvas/70 border border-divider flex items-center justify-between text-body-xs"
                            >
                              <div>
                                <div className="flex items-center gap-1.5 font-medium text-ink">
                                  <span>{ct.firstName} {ct.lastName || ''}</span>
                                  {ct.isBilling && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      BILLING
                                    </span>
                                  )}
                                </div>
                                <span className="text-stone-text">{ct.email || ct.phone || 'No direct info'}</span>
                              </div>
                              <span className="text-stone-text">{ct.role || 'Stakeholder'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contract Cycles */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-label-sm font-semibold uppercase tracking-wider text-stone-text">
                          Annual Cycles ({cycles.length})
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAddSubscriptionOpen(true)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-canvas border border-divider hover:border-sage text-ink text-label-xs font-semibold cursor-pointer transition-colors shadow-xs"
                          >
                            <Plus className="h-3 w-3 text-sage" />
                            <span>Add Software</span>
                          </button>
                          {cycles.length > 0 && cycles[0].status !== 'RENEWED' && (
                            <button
                              onClick={() => setIsRenewModalOpen(true)}
                              className="px-2.5 py-1 rounded bg-sage text-white text-label-xs font-semibold hover:bg-sage-hover cursor-pointer transition-colors shadow-sm"
                            >
                              Renew Contract
                            </button>
                          )}
                        </div>
                      </div>

                      {cycles.length === 0 ? (
                        <div className="p-4 rounded-lg bg-canvas/70 border border-dashed border-divider text-center space-y-2.5">
                          <IndianRupee className="h-5 w-5 text-stone-text mx-auto" />
                          <div className="space-y-0.5">
                            <p className="text-body-xs font-semibold text-ink">No Contract or PO Amount Registered</p>
                            <p className="text-[11px] text-stone-text max-w-xs mx-auto">
                              Add the annual subscription value and purchase order details for this account.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsAddSubscriptionOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-card bg-sage hover:bg-sage-hover text-white text-body-xs font-semibold cursor-pointer transition-colors shadow-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Set Contract Amount &amp; PO</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {cycles.map((cycle) => (
                            <div
                              key={cycle.id}
                              className="p-3.5 rounded-lg border border-divider bg-canvas/70 space-y-2 text-body-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-headline text-label-sm font-bold text-ink">
                                  Cycle #{cycle.cycleNo} {cycle.renewedFromId ? `(Renewed from #${cycle.renewedFromId})` : ''}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditCycle(cycle)}
                                    className="inline-flex items-center gap-1 text-[11px] text-sage hover:underline font-semibold cursor-pointer"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                    <span>Edit Amount</span>
                                  </button>
                                  <StatusBadge status={cycle.status} />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-stone-text pt-1">
                                <div>
                                  <span className="block text-[11px]">Term:</span>
                                  <span className="font-medium text-ink">
                                    {cycle.startDate} → {cycle.endDate}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[11px]">Annual Amount:</span>
                                  <span className="font-semibold text-ink flex items-center gap-1.5">
                                    <span>{formatINR(cycle.amount)}</span>
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[11px]">PO Number:</span>
                                  <span className="font-medium text-ink">
                                    {cycle.poNumber || 'Pending'}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[11px]">PO Date:</span>
                                  <span className="font-medium text-ink">
                                    {cycle.poDate || '—'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* PO Documents */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-label-sm font-semibold uppercase tracking-wider text-stone-text">
                          PO Documents (MinIO S3)
                        </span>
                        {cycles.length > 0 && (
                          <button
                            onClick={() => setIsUploadPoOpen(true)}
                            className="text-label-xs text-sage hover:underline font-semibold cursor-pointer"
                          >
                            + Upload PO
                          </button>
                        )}
                      </div>

                      {documents.length === 0 ? (
                        <p className="text-body-xs text-stone-text">No PO files uploaded for this cycle.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-2.5 rounded border border-divider bg-canvas/50 flex items-center justify-between text-body-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileCheck className="h-4 w-4 text-sage shrink-0" />
                                <span className="font-medium text-ink truncate">{doc.fileName}</span>
                                <span className="text-[10px] text-stone-text">
                                  ({Math.round(doc.fileSize / 1024)} KB)
                                </span>
                              </div>
                              {doc.downloadUrl && (
                                <a
                                  href={doc.downloadUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-label-xs text-sage hover:underline shrink-0 font-medium"
                                >
                                  Download
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Installation Checklist */}
                    {checklist.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-label-sm font-semibold uppercase tracking-wider text-stone-text">
                            Installation Checklist ({checklist.filter((i) => i.isCompleted).length}/{checklist.length})
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {checklist.map((item) => (
                            <label
                              key={item.id}
                              className="p-2.5 rounded border border-divider bg-canvas/40 flex items-start gap-2.5 cursor-pointer hover:bg-canvas/70 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={item.isCompleted}
                                onChange={() => handleToggleChecklist(item.id)}
                                className="mt-0.5 rounded border-divider text-sage focus:ring-sage"
                              />
                              <div className="text-body-xs">
                                <span className={item.isCompleted ? 'line-through text-stone-text' : 'font-medium text-ink'}>
                                  {item.title}
                                </span>
                                {item.description && (
                                  <p className="text-[11px] text-stone-text mt-0.5">{item.description}</p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TAB 2: UNIFIED TIMELINE ─────────────────────────────────── */}
                {inspectorTab === 'TIMELINE' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-label-xs font-semibold uppercase tracking-wider text-stone-text">
                        Historical Event Stream
                      </span>
                      <button
                        onClick={loadCompanyDetails}
                        className="text-label-xs text-sage hover:underline font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Refresh Stream</span>
                      </button>
                    </div>

                    {timeline.length === 0 ? (
                      <div className="py-12 text-center text-body-xs text-stone-text">
                        No historical events recorded for this account yet.
                      </div>
                    ) : (
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-divider">
                        {timeline.map((ev) => {
                          const getEventIcon = () => {
                            if (ev.eventType === 'ACTIVITY') {
                              if (ev.category === 'CALL') return <Phone className="h-3.5 w-3.5 text-sage" />;
                              if (ev.category === 'MEETING') return <User className="h-3.5 w-3.5 text-sage" />;
                              if (ev.category === 'EMAIL') return <Mail className="h-3.5 w-3.5 text-sage" />;
                              return <FileText className="h-3.5 w-3.5 text-sage" />;
                            }
                            if (ev.eventType === 'ISSUE') return <AlertCircle className="h-3.5 w-3.5 text-amber-700" />;
                            if (ev.eventType === 'STAGE_CHANGE') return <ArrowRight className="h-3.5 w-3.5 text-blue-600" />;
                            if (ev.eventType === 'PO_DOCUMENT') return <FileCheck className="h-3.5 w-3.5 text-emerald-700" />;
                            if (ev.eventType === 'EMAIL') return <Send className="h-3.5 w-3.5 text-sage" />;
                            return <Clock className="h-3.5 w-3.5 text-stone-text" />;
                          };

                          return (
                            <div key={ev.id} className="relative">
                              <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-card border border-divider flex items-center justify-center ring-4 ring-card">
                                {getEventIcon()}
                              </span>

                              <div className="p-3 rounded-card border border-divider bg-canvas/40 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-headline text-body-xs font-semibold text-ink">
                                    {ev.title}
                                  </h4>
                                  {ev.badge && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-card border border-divider text-stone-text shrink-0">
                                      {ev.badge}
                                    </span>
                                  )}
                                </div>

                                {ev.description && (
                                  <p className="text-body-xs text-stone-text leading-relaxed">
                                    {ev.description}
                                  </p>
                                )}

                                <div className="pt-1 flex items-center justify-between text-[10px] text-stone-text/80">
                                  <span>{ev.authorName || 'Team'}</span>
                                  <span>{ev.timestamp ? ev.timestamp.slice(0, 16).replace('T', ' ') : 'Just now'}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TAB 3: SUPPORT ISSUES ───────────────────────────────────── */}
                {inspectorTab === 'ISSUES' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-label-xs font-semibold uppercase tracking-wider text-stone-text">
                        Support &amp; Technical Tickets ({issues.length})
                      </span>
                      <button
                        onClick={() => setIsAddIssueOpen(true)}
                        className="text-label-xs text-sage hover:underline font-semibold cursor-pointer"
                      >
                        + Report Issue
                      </button>
                    </div>

                    {issues.length === 0 ? (
                      <div className="py-12 text-center text-body-xs text-stone-text">
                        No active support tickets reported for this account.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {issues.map((iss) => (
                          <div
                            key={iss.id}
                            className="p-3.5 rounded-card border border-divider bg-canvas/40 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-headline text-body-sm font-semibold text-ink">
                                {iss.title}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  iss.priority === 'CRITICAL'
                                    ? 'bg-rose-100 text-rose-800'
                                    : iss.priority === 'HIGH'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-stone-200 text-stone-700'
                                }`}
                              >
                                {iss.priority}
                              </span>
                            </div>

                            <p className="text-body-xs text-stone-text">
                              {iss.description}
                            </p>

                            <div className="pt-2 border-t border-divider/60 flex items-center justify-between text-[11px] text-stone-text">
                              <span>Status: <strong className="text-ink">{iss.status}</strong></span>
                              <span>{iss.createdAt?.slice(0, 10)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TAB 4: TASKS ───────────────────────────────────────────── */}
                {inspectorTab === 'TASKS' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-label-xs font-semibold uppercase tracking-wider text-stone-text">
                        Account Action Items ({tasks.length})
                      </span>
                      <button
                        onClick={() => setIsAddTaskOpen(true)}
                        className="text-label-xs text-sage hover:underline font-semibold cursor-pointer"
                      >
                        + New Task
                      </button>
                    </div>

                    {tasks.length === 0 ? (
                      <div className="py-12 text-center text-body-xs text-stone-text">
                        No pending follow-up tasks for this account.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleToggleTask(task.id)}
                            className="p-3 rounded-card border border-divider bg-canvas/40 flex items-center justify-between gap-3 cursor-pointer hover:bg-canvas/70 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              {task.isCompleted ? (
                                <CheckSquare className="h-4 w-4 text-sage shrink-0" />
                              ) : (
                                <Square className="h-4 w-4 text-stone-text shrink-0" />
                              )}
                              <div>
                                <span className={task.isCompleted ? 'line-through text-stone-text text-body-xs' : 'font-medium text-ink text-body-xs'}>
                                  {task.title}
                                </span>
                                {task.description && (
                                  <p className="text-[11px] text-stone-text mt-0.5">{task.description}</p>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="block text-[11px] text-stone-text">
                                Due: {task.dueDate || 'Flexible'}
                              </span>
                              <span className="text-[10px] font-semibold text-sage-dark uppercase">
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-card rounded-card border border-divider shadow-card text-stone-text text-body-sm">
              Select an account from the portfolio to inspect contracts, timeline, and issues.
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL: LOG ACTIVITY ──────────────────────────────────────────────── */}
      {isAddActivityOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-card border border-divider bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div>
                <h2 className="font-headline text-headline-sm text-ink">Log Account Activity</h2>
                <p className="text-body-xs text-stone-text">{selectedCompany.name}</p>
              </div>
              <button onClick={() => setIsAddActivityOpen(false)} className="text-stone-text hover:text-ink cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitActivity} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    Activity Type *
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as any)}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  >
                    <option value="CALL">Phone Call</option>
                    <option value="MEETING">Meeting / Technical Walkthrough</option>
                    <option value="EMAIL">Email Sent</option>
                    <option value="TEXT">Message / SMS</option>
                    <option value="NOTE">Internal Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    Contact Person
                  </label>
                  <select
                    value={activityContactId}
                    onChange={(e) => setActivityContactId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  >
                    <option value="">Select contact (optional)</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName || ''} ({c.role || 'Contact'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                  Subject / Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discussed annual license renewal and telemetry connector"
                  value={activitySubject}
                  onChange={(e) => setActivitySubject(e.target.value)}
                  className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                />
              </div>

              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                  Detailed Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Details of client requirements, agreed actions, or blockers..."
                  value={activityDetails}
                  onChange={(e) => setActivityDetails(e.target.value)}
                  className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    Outcome
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Positive - Quote requested"
                    value={activityOutcome}
                    onChange={(e) => setActivityOutcome(e.target.value)}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  />
                </div>

                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={activityFollowUp}
                    onChange={(e) => setActivityFollowUp(e.target.value)}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              {activityFollowUp && (
                <div className="p-2.5 rounded bg-sage-light/60 border border-sage/30 text-[11px] text-sage-dark flex items-center gap-2">
                  <Info className="h-4 w-4 text-sage shrink-0" />
                  <span>Specifying a follow-up date will automatically schedule an internal action task.</span>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingActivity}
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSavingActivity ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: REPORT ISSUE ─────────────────────────────────────────────── */}
      {isAddIssueOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-card border border-divider bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div>
                <h2 className="font-headline text-headline-sm text-ink">Report Support Ticket</h2>
                <p className="text-body-xs text-stone-text">{selectedCompany.name}</p>
              </div>
              <button onClick={() => setIsAddIssueOpen(false)} className="text-stone-text hover:text-ink cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIssue} className="mt-4 space-y-4">
              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High latency on PLC Modbus TCP connector"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                />
              </div>

              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                  Priority Tier *
                </label>
                <select
                  value={issuePriority}
                  onChange={(e) => setIssuePriority(e.target.value as any)}
                  className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical (Production Blocker)</option>
                </select>
              </div>

              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                  Description &amp; Observed Error *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the technical malfunction, steps to reproduce, or affected industrial unit..."
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsAddIssueOpen(false)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingIssue}
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSavingIssue ? 'Reporting...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD TASK ─────────────────────────────────────────────────── */}
      {isAddTaskOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-card border border-divider bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div>
                <h2 className="font-headline text-headline-sm text-ink">Add Action Task</h2>
                <p className="text-body-xs text-stone-text">{selectedCompany.name}</p>
              </div>
              <button onClick={() => setIsAddTaskOpen(false)} className="text-stone-text hover:text-ink cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Send updated pricing schedule"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  />
                </div>

                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTask}
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSavingTask ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODALS: ADD COMPANY, RENEW, ADD CONTACT, UPLOAD PO ─────────────── */}
      {/* (Preserved existing Modals) */}
      {isUploadPoOpen && cycles.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-card border border-divider bg-card p-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <h2 className="font-headline text-headline-sm text-ink">Upload PO Document</h2>
              <button onClick={() => setIsUploadPoOpen(false)} className="text-stone-text hover:text-ink cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fileInput = (e.target as any).file?.files?.[0];
                if (!fileInput) return;
                try {
                  await poDocumentApi.upload(cycles[0].id, fileInput);
                  alert('PO document uploaded successfully to MinIO!');
                  setIsUploadPoOpen(false);
                  loadCompanyDetails();
                } catch (err) {
                  alert('Failed to upload PO document.');
                }
              }}
              className="mt-4 space-y-4"
            >
              <input
                type="file"
                name="file"
                required
                accept="application/pdf,image/jpeg,image/png"
                className="w-full text-xs text-stone-text file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-sage-light file:text-sage-dark file:font-semibold"
              />
              <div className="flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsUploadPoOpen(false)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer"
                >
                  Upload &amp; Hash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRenewModalOpen && cycles.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-card border border-divider bg-card p-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <h2 className="font-headline text-headline-sm text-ink">Renew Annual Subscription</h2>
              <button onClick={() => setIsRenewModalOpen(false)} className="text-stone-text hover:text-ink cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                try {
                  await contractApi.renewCycle(subscriptions[0].id, cycles[0].id, {
                    startDate: formData.get('startDate') as string,
                    endDate: formData.get('endDate') as string,
                    amount: Number(formData.get('amount')),
                    poNumber: formData.get('poNumber') as string || undefined,
                  });
                  alert('Subscription renewed successfully!');
                  setIsRenewModalOpen(false);
                  loadCompanyDetails();
                } catch (err) {
                  alert('Failed to renew subscription.');
                }
              }}
              className="mt-4 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">New Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={new Date(new Date(cycles[0].endDate).getTime() + 86400000).toISOString().split('T')[0]}
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm"
                  />
                </div>
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">New End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    defaultValue={new Date(new Date(cycles[0].endDate).getTime() + 366 * 86400000).toISOString().split('T')[0]}
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-label-xs font-semibold text-ink mb-1">Renewal Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  required
                  defaultValue={cycles[0].amount}
                  className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm"
                />
              </div>
              <div>
                <label className="block text-label-xs font-semibold text-ink mb-1">PO Number</label>
                <input
                  type="text"
                  name="poNumber"
                  placeholder="e.g. PO-2027-001"
                  className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer"
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddContactOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-card border border-divider bg-card p-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <h2 className="font-headline text-headline-sm text-ink">Add Contact Person</h2>
              <button onClick={() => setIsAddContactOpen(false)} className="text-stone-text hover:text-ink cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                try {
                  await contactApi.create(selectedCompany.id, {
                    firstName: formData.get('firstName') as string,
                    lastName: formData.get('lastName') as string || undefined,
                    email: formData.get('email') as string || undefined,
                    phone: formData.get('phone') as string || undefined,
                    role: formData.get('role') as string || undefined,
                    isBilling: formData.get('isBilling') === 'on',
                  });
                  alert('Contact added successfully!');
                  setIsAddContactOpen(false);
                  loadCompanyDetails();
                } catch (err) {
                  alert('Failed to add contact.');
                }
              }}
              className="mt-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm"
                  />
                </div>
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-label-xs font-semibold text-ink mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm"
                />
              </div>
              <div>
                <label className="block text-label-xs font-semibold text-ink mb-1">Role / Designation</label>
                <input
                  type="text"
                  name="role"
                  placeholder="e.g. Plant Head / Commercial Lead"
                  className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input type="checkbox" name="isBilling" className="rounded border-divider text-sage focus:ring-sage" />
                <span className="text-body-xs text-ink font-medium">Designate as Primary Billing Contact</span>
              </label>
              <div className="flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: MANAGE SOFTWARE & SERVICES ─────────────────────────────── */}
      {isManageServicesOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-card border border-divider bg-card p-6 shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-sage" />
                <div>
                  <h2 className="font-headline text-headline-sm text-ink">Manage Client Software &amp; Services</h2>
                  <p className="text-body-xs text-stone-text">{selectedCompany.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManageServicesOpen(false)}
                className="text-stone-text hover:text-ink cursor-pointer p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-2">
                  Select AQS Software &amp; Offerings
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {STANDARD_SERVICES.map((svc) => {
                    const isChecked = selectedServices.includes(svc);
                    return (
                      <button
                        type="button"
                        key={svc}
                        onClick={() => handleToggleService(svc)}
                        className={`flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          isChecked
                            ? 'border-sage bg-sage-light/40 text-sage-dark font-semibold'
                            : 'border-divider bg-canvas/60 text-ink hover:border-stone-border'
                        }`}
                      >
                        <span className="text-body-sm">{svc}</span>
                        {isChecked ? (
                          <CheckCircle2 className="h-4 w-4 text-sage" />
                        ) : (
                          <div className="h-4 w-4 rounded border border-divider bg-card" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Services Tagging */}
              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1.5">
                  Add Custom Service / Project
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customServiceInput}
                    onChange={(e) => setCustomServiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomService();
                      }
                    }}
                    placeholder="e.g. ERP Integration, Custom Telemetry..."
                    className="flex-1 h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm focus:outline-none focus:border-sage"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="px-3 h-9 rounded-card border border-divider bg-canvas hover:border-sage text-ink text-body-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Active Assigned Summary Chips */}
              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1.5">
                  Assigned Services Summary ({selectedServices.length})
                </label>
                {selectedServices.length === 0 ? (
                  <p className="text-body-xs text-stone-text italic">No software or services currently selected.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-canvas/60 border border-divider">
                    {selectedServices.map((svc) => (
                      <span
                        key={svc}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sage-light text-sage-dark text-body-xs font-semibold border border-sage/20"
                      >
                        <span>{svc}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleService(svc)}
                          className="hover:text-red-600 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsManageServicesOpen(false)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingServices}
                  onClick={handleSaveServices}
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSavingServices ? 'Saving...' : 'Save Services'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD SOFTWARE SUBSCRIPTION ──────────────────────────────── */}
      {isAddSubscriptionOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-card border border-divider bg-card p-6 shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-sage" />
                <div>
                  <h2 className="font-headline text-headline-sm text-ink">Register Software Subscription</h2>
                  <p className="text-body-xs text-stone-text">{selectedCompany.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSubscriptionOpen(false)}
                className="text-stone-text hover:text-ink cursor-pointer p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="mt-4 space-y-4">
              <div>
                <label className="block text-label-xs font-semibold text-ink mb-1">Product Offering *</label>
                {availableProducts.length > 0 ? (
                  <select
                    value={subProductId}
                    onChange={(e) => setSubProductId(Number(e.target.value))}
                    required
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm focus:outline-none focus:border-sage"
                  >
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-body-xs text-stone-text">Loading catalog products...</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">Release Version</label>
                  <input
                    type="text"
                    value={subVersion}
                    onChange={(e) => setSubVersion(e.target.value)}
                    placeholder="e.g. v2.4.0"
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm font-mono focus:outline-none focus:border-sage"
                  />
                </div>
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">Plant / Site</label>
                  <input
                    type="text"
                    value={subSite}
                    onChange={(e) => setSubSite(e.target.value)}
                    placeholder="e.g. Unit-1 Hosur, Plant-2"
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">Annual PO Amount (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-text" />
                    <input
                      type="number"
                      required
                      min={0}
                      step={500}
                      value={subAmount}
                      onChange={(e) => setSubAmount(Number(e.target.value))}
                      placeholder="25000"
                      className="w-full h-9 pl-9 pr-3 rounded-input border border-divider bg-canvas text-ink text-body-sm font-semibold focus:outline-none focus:border-sage"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">Initial PO Number</label>
                  <input
                    type="text"
                    value={subPoNumber}
                    onChange={(e) => setSubPoNumber(e.target.value)}
                    placeholder="e.g. PO/2026/089"
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm font-mono focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsAddSubscriptionOpen(false)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSub}
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSavingSub ? 'Registering...' : 'Register Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD COMPANY ────────────────────────────────────────────── */}
      {isAddCompanyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-card border border-divider bg-card p-6 shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div>
                <h2 className="font-headline text-headline-sm text-ink">New Enterprise Account</h2>
                <p className="text-body-xs text-stone-text">Add client and configure software services provided</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCompanyOpen(false)}
                className="text-stone-text hover:text-ink cursor-pointer p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                try {
                  const comp = await companyApi.create({
                    name: formData.get('name') as string,
                    industry: (formData.get('industry') as string) || undefined,
                    city: (formData.get('city') as string) || undefined,
                    country: 'India',
                    pipelineStage: newCompanyStage,
                    servicesProvided: newCompanyServices.join(', '),
                  });

                  const amountStr = formData.get('amount') as string;
                  const poNum = formData.get('poNumber') as string;
                  const startDateVal = formData.get('startDate') as string;
                  const endDateVal = formData.get('endDate') as string;

                  if (amountStr && Number(amountStr) > 0) {
                    const prodId = availableProducts[0]?.id || 1;
                    const todayStr = new Date().toISOString().split('T')[0];
                    const nextYearStr = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];

                    const sub = await subscriptionApi.create(comp.id, {
                      productId: prodId,
                      version: 'v1.0',
                      installDate: startDateVal || todayStr,
                    });

                    await contractApi.createFirstCycle(sub.id, {
                      startDate: startDateVal || todayStr,
                      endDate: endDateVal || nextYearStr,
                      amount: Number(amountStr),
                      poNumber: poNum || undefined,
                      poDate: startDateVal || todayStr,
                    });
                  }

                  alert('Company account created successfully!');
                  setIsAddCompanyOpen(false);
                  loadCompanies();
                } catch (err) {
                  alert('Failed to create company.');
                }
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-label-xs font-semibold text-ink mb-1">Company Legal Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Tata Advanced Systems Ltd"
                  className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm focus:outline-none focus:border-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    placeholder="e.g. Aerospace / Manufacturing"
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm focus:outline-none focus:border-sage"
                  />
                </div>
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Hyderabad / Pune"
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-xs font-semibold text-ink mb-1">Pipeline Stage</label>
                <select
                  value={newCompanyStage}
                  onChange={(e) => setNewCompanyStage(e.target.value as PipelineStage)}
                  className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm focus:outline-none focus:border-sage cursor-pointer"
                >
                  <option value="LEAD">Lead</option>
                  <option value="IN_TALKS">In Talks</option>
                  <option value="DEMO">Demo</option>
                  <option value="QUOTATION_SENT">Quotation Sent</option>
                  <option value="PO_RECEIVED">PO Received</option>
                  <option value="INSTALLATION">Installation</option>
                  <option value="LIVE">Live Production</option>
                </select>
              </div>

              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-2">
                  Software &amp; Services Provided to Client
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STANDARD_SERVICES.map((svc) => {
                    const isChecked = newCompanyServices.includes(svc);
                    return (
                      <button
                        type="button"
                        key={svc}
                        onClick={() => handleToggleNewService(svc)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          isChecked
                            ? 'border-sage bg-sage-light/40 text-sage-dark font-semibold'
                            : 'border-divider bg-canvas/60 text-ink hover:border-stone-border'
                        }`}
                      >
                        <span className="text-body-xs">{svc}</span>
                        {isChecked ? (
                          <CheckCircle2 className="h-4 w-4 text-sage" />
                        ) : (
                          <div className="h-4 w-4 rounded border border-divider bg-card" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Additional custom service input */}
                <div className="flex gap-2 mt-2.5">
                  <input
                    type="text"
                    value={newCustomService}
                    onChange={(e) => setNewCustomService(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewCustomService();
                      }
                    }}
                    placeholder="Other software / service name..."
                    className="flex-1 h-8 px-2.5 rounded-input border border-divider bg-canvas text-ink text-body-xs focus:outline-none focus:border-sage"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCustomService}
                    className="px-2.5 h-8 rounded-card border border-divider bg-canvas hover:border-sage text-ink text-[11px] font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {newCompanyServices.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 p-2 rounded bg-canvas/60 border border-divider">
                    {newCompanyServices.map((svc) => (
                      <span
                        key={svc}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sage-light text-sage-dark text-[11px] font-semibold border border-sage/20"
                      >
                        <span>{svc}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleNewService(svc)}
                          className="hover:text-red-600 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Commercial & Annual PO Amount Section */}
              <div className="p-3.5 rounded-lg bg-canvas/70 border border-divider space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-stone-text">
                    <IndianRupee className="h-4 w-4 text-sage" />
                    <span className="text-label-xs font-semibold uppercase tracking-wider">
                      Contract &amp; Annual Amount (Optional)
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-text">Can be set now or later</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-xs font-semibold text-ink mb-1">
                      Annual PO Amount (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-text" />
                      <input
                        type="number"
                        name="amount"
                        min={0}
                        step={500}
                        placeholder="e.g. 50000"
                        className="w-full h-8 pl-8 pr-2.5 rounded-input border border-divider bg-card text-ink text-body-xs font-semibold focus:outline-none focus:border-sage"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-label-xs font-semibold text-ink mb-1">
                      PO Number
                    </label>
                    <input
                      type="text"
                      name="poNumber"
                      placeholder="e.g. PO/2026/042"
                      className="w-full h-8 px-2.5 rounded-input border border-divider bg-card text-ink text-body-xs font-mono focus:outline-none focus:border-sage"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-xs font-semibold text-ink mb-1">
                      Contract Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full h-8 px-2.5 rounded-input border border-divider bg-card text-ink text-body-xs focus:outline-none focus:border-sage"
                    />
                  </div>
                  <div>
                    <label className="block text-label-xs font-semibold text-ink mb-1">
                      Contract End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]}
                      className="w-full h-8 px-2.5 rounded-input border border-divider bg-card text-ink text-body-xs focus:outline-none focus:border-sage"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyOpen(false)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT CONTRACT CYCLE AMOUNT & PO ────────────────────────── */}
      {isEditCycleOpen && editingCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-card border border-divider bg-card p-6 shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-sage" />
                <div>
                  <h2 className="font-headline text-headline-sm text-ink">Edit Contract &amp; PO Amount</h2>
                  <p className="text-body-xs text-stone-text">Cycle #{editingCycle.cycleNo} — {selectedCompany?.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditCycleOpen(false)}
                className="text-stone-text hover:text-ink cursor-pointer p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCycle} className="mt-4 space-y-4">
              <div>
                <label className="block text-label-xs font-semibold text-ink mb-1">
                  Annual Contract / PO Amount (₹) *
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-text" />
                  <input
                    type="number"
                    required
                    min={0}
                    step={100}
                    value={editCycleAmount}
                    onChange={(e) => setEditCycleAmount(Number(e.target.value))}
                    className="w-full h-9 pl-9 pr-3 rounded-input border border-divider bg-canvas text-ink text-body-sm font-semibold focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">PO Number</label>
                  <input
                    type="text"
                    value={editCyclePoNumber}
                    onChange={(e) => setEditCyclePoNumber(e.target.value)}
                    placeholder="e.g. PO-2026-001"
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm font-mono focus:outline-none focus:border-sage"
                  />
                </div>
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">PO Date</label>
                  <input
                    type="date"
                    value={editCyclePoDate}
                    onChange={(e) => setEditCyclePoDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">Term Start Date *</label>
                  <input
                    type="date"
                    required
                    value={editCycleStartDate}
                    onChange={(e) => setEditCycleStartDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm focus:outline-none focus:border-sage"
                  />
                </div>
                <div>
                  <label className="block text-label-xs font-semibold text-ink mb-1">Term End Date *</label>
                  <input
                    type="date"
                    required
                    value={editCycleEndDate}
                    onChange={(e) => setEditCycleEndDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-input border border-divider bg-canvas text-ink text-body-sm focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsEditCycleOpen(false)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEditCycle}
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSavingEditCycle ? 'Saving...' : 'Update Amount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
