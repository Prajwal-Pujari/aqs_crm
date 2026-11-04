// ─── Generic API Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: UserDto;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'SALES' | 'SUPPORT';
  isActive: boolean;
  createdAt: string;
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export const PipelineStage = {
  LEAD: 'LEAD',
  IN_TALKS: 'IN_TALKS',
  DEMO: 'DEMO',
  QUOTATION_SENT: 'QUOTATION_SENT',
  PO_RECEIVED: 'PO_RECEIVED',
  INSTALLATION: 'INSTALLATION',
  LIVE: 'LIVE',
  RENEWAL_DUE: 'RENEWAL_DUE',
  RENEWED: 'RENEWED',
  LAPSED: 'LAPSED',
} as const;

export type PipelineStage = (typeof PipelineStage)[keyof typeof PipelineStage];

export const CycleStatus = {
  ACTIVE: 'ACTIVE',
  RENEWAL_DUE: 'RENEWAL_DUE',
  OVERDUE: 'OVERDUE',
  RENEWED: 'RENEWED',
  LAPSED: 'LAPSED',
} as const;

export type CycleStatus = (typeof CycleStatus)[keyof typeof CycleStatus];

// ─── Company ─────────────────────────────────────────────────────────────────

export interface Company {
  id: number;
  name: string;
  industry?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  notes?: string;
  pipelineStage: PipelineStage;
  servicesProvided?: string;
  assignedToId?: number;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}

export type CompanyDto = Company;

export interface CompanyCreateRequest {
  name: string;
  industry?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  notes?: string;
  pipelineStage?: PipelineStage;
  servicesProvided?: string;
  assignedTo?: number;
}

export interface CompanyUpdateRequest {
  name?: string;
  industry?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  notes?: string;
  pipelineStage?: PipelineStage;
  servicesProvided?: string;
  assignedTo?: number;
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export interface Contact {
  id: number;
  companyId: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isBilling: boolean;
  optedInGreetings: boolean;
  optedInPromos: boolean;
  unsubscribeToken?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactDto = Contact;

export interface ContactCreateRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isBilling?: boolean;
  optedInGreetings?: boolean;
  optedInPromos?: boolean;
  notes?: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  description?: string;
  currentVersion?: string;
  annualPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ProductDto = Product;

export interface ProductCreateRequest {
  name: string;
  description?: string;
  currentVersion?: string;
  annualPrice: number;
  isActive?: boolean;
}

// ─── Subscription ────────────────────────────────────────────────────────────

export interface Subscription {
  id: number;
  companyId: number;
  companyName: string;
  productId: number;
  productName: string;
  installDate?: string;
  version?: string;
  site?: string;
  isActive: boolean;
  latestCycleStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionDto = Subscription;

export interface SubscriptionCreateRequest {
  productId: number;
  installDate?: string;
  version?: string;
  site?: string;
}

// ─── Contract Cycle ──────────────────────────────────────────────────────────

export interface ContractCycle {
  id: number;
  subscriptionId: number;
  cycleNo: number;
  startDate: string;
  endDate: string;
  amount: number;
  poNumber?: string;
  poDate?: string;
  status: CycleStatus;
  renewedFromId?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContractCycleDto = ContractCycle;

export interface ContractCycleCreateRequest {
  startDate: string;
  endDate: string;
  amount: number;
  poNumber?: string;
  poDate?: string;
  notes?: string;
}

export interface RenewRequest {
  startDate?: string;
  endDate?: string;
  amount?: number;
  poNumber?: string;
  poDate?: string;
  notes?: string;
}

// ─── PO Document ─────────────────────────────────────────────────────────────

export interface PoDocument {
  id: number;
  cycleId: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  fileHash?: string;
  uploadedByName?: string;
  downloadUrl?: string;
  createdAt: string;
}

export type PoDocumentDto = PoDocument;

// ─── Checklist Item ──────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: number;
  companyId: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  completedByName?: string;
  sortOrder: number;
  createdAt: string;
}

export type ChecklistItemDto = ChecklistItem;

// ─── Stage History ───────────────────────────────────────────────────────────

export interface StageHistory {
  id: number;
  companyId: number;
  fromStage?: string;
  toStage: string;
  changedByName?: string;
  notes?: string;
  createdAt: string;
}

export type StageHistoryDto = StageHistory;

// ─── Activities ───────────────────────────────────────────────────────────────

export type ActivityType = 'CALL' | 'TEXT' | 'EMAIL' | 'MEETING' | 'NOTE';

export interface ActivityDto {
  id: number;
  companyId: number;
  companyName?: string;
  contactId?: number;
  contactName?: string;
  userId?: number;
  userName?: string;
  type: ActivityType;
  subject: string;
  details?: string;
  outcome?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityCreateRequest {
  contactId?: number;
  type: ActivityType;
  subject: string;
  details?: string;
  outcome?: string;
  nextFollowUp?: string;
}

// ─── Issues ──────────────────────────────────────────────────────────────────

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface IssueDto {
  id: number;
  companyId: number;
  companyName?: string;
  reportedByContactId?: number;
  reportedByContactName?: string;
  assignedToUserId?: number;
  assignedToUserName?: string;
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueCreateRequest {
  reportedByContactId?: number;
  assignedToUserId?: number;
  title: string;
  description: string;
  priority?: IssuePriority;
}

export interface IssueUpdateRequest {
  assignedToUserId?: number;
  title?: string;
  description?: string;
  priority?: IssuePriority;
  status?: IssueStatus;
  resolutionNotes?: string;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export interface TaskDto {
  id: number;
  companyId: number;
  companyName?: string;
  cycleId?: number;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  priority: string;
  source: string;
  assignedToId?: number;
  assignedToName?: string;
  createdById?: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreateRequest {
  cycleId?: number;
  title: string;
  description?: string;
  dueDate: string;
  priority?: string;
  assignedToId?: number;
}

// ─── Unified Timeline ────────────────────────────────────────────────────────

export interface TimelineEventDto {
  id: string;
  eventType: 'ACTIVITY' | 'ISSUE' | 'EMAIL' | 'STAGE_CHANGE' | 'PO_DOCUMENT';
  title: string;
  description?: string;
  category: string;
  badge?: string;
  authorName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ─── SMTP Settings ────────────────────────────────────────────────────────────

export interface SmtpSettingsDto {
  id: number;
  host: string;
  port: number;
  protocol: string;
  username?: string;
  hasPassword: boolean;
  fromEmail?: string;
  fromName?: string;
  starttlsEnabled: boolean;
  sslEnabled: boolean;
  isActive: boolean;
  updatedAt?: string;
}

export interface SmtpSettingsUpdateRequest {
  host: string;
  port: number;
  protocol?: string;
  username: string;
  password?: string;
  fromEmail?: string;
  fromName?: string;
  starttlsEnabled?: boolean;
  sslEnabled?: boolean;
}

// ─── Phase 4: Festivals & Greetings ──────────────────────────────────────────

export interface FestivalDto {
  id: number;
  name: string;
  festivalDate: string;
  templateKey: string;
  customMessage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FestivalCreateRequest {
  name: string;
  festivalDate: string;
  templateKey?: string;
  customMessage?: string;
  isActive?: boolean;
}

export interface FestivalUpdateRequest {
  name: string;
  festivalDate: string;
  templateKey?: string;
  customMessage?: string;
  isActive?: boolean;
}

// ─── Phase 4: Unsubscribe & Preferences ──────────────────────────────────────

export interface ContactPreferenceDto {
  token: string;
  contactName: string;
  companyName: string;
  email: string;
  optedInGreetings: boolean;
  optedInPromos: boolean;
}

export interface UnsubscribeUpdateRequest {
  optedInGreetings?: boolean;
  optedInPromos?: boolean;
}

// ─── Phase 4: Dashboard Aggregates ───────────────────────────────────────────

export interface UpcomingRenewalSummaryDto {
  cycleId: number;
  subscriptionId?: number;
  companyId?: number;
  companyName: string;
  productId?: number;
  productName: string;
  cycleNo?: number;
  startDate?: string;
  endDate: string;
  amount: number;
  status: string;
  daysRemaining: number;
}

export interface DashboardStatsDto {
  totalArr: number;
  activeContractsCount: number;
  renewalsDueCount: number;
  renewalsDueSum: number;
  overdueCount: number;
  overdueSum: number;
  totalCompaniesCount: number;
  totalContactsCount: number;
  stagesBreakdown: Record<string, number>;
  openIssuesByPriority: Record<string, number>;
  failedEmailsCount: number;
  pendingQueueCount: number;
  upcomingRenewals: UpcomingRenewalSummaryDto[];
  overdueContracts: UpcomingRenewalSummaryDto[];
  recentActivities: ActivityDto[];
}
