import apiClient from './client';
import type {
  ApiResponse,
  PagedResponse,
  CompanyDto,
  CompanyCreateRequest,
  ContactDto,
  ContactCreateRequest,
  ProductDto,
  ProductCreateRequest,
  SubscriptionDto,
  SubscriptionCreateRequest,
  ContractCycleDto,
  ContractCycleCreateRequest,
  RenewRequest,
  PoDocumentDto,
  ChecklistItemDto,
} from '@/types';

export const companyApi = {
  getAll: async (search?: string, stage?: string, page: number = 0, size: number = 200) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (stage) params.append('stage', stage);
    params.append('page', String(page));
    params.append('size', String(size));
    const res = await apiClient.get<PagedResponse<CompanyDto>>(`/companies?${params.toString()}`);
    return res.data;
  },

  getById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<CompanyDto>>(`/companies/${id}`);
    return res.data.data!;
  },

  create: async (data: CompanyCreateRequest) => {
    const res = await apiClient.post<ApiResponse<CompanyDto>>('/companies', data);
    return res.data.data!;
  },

  update: async (id: number, data: any) => {
    const res = await apiClient.put<ApiResponse<CompanyDto>>(`/companies/${id}`, data);
    return res.data.data!;
  },

  updatePipelineStage: async (companyId: number, newStage: string, notes?: string) => {
    const res = await apiClient.put<ApiResponse<CompanyDto>>(`/companies/${companyId}/pipeline`, {
      newStage,
      notes,
    });
    return res.data.data!;
  },

  getStageHistory: async (companyId: number) => {
    const res = await apiClient.get<ApiResponse<any[]>>(`/companies/${companyId}/pipeline/history`);
    return res.data.data || [];
  },
};

export const contactApi = {
  getByCompany: async (companyId: number) => {
    const res = await apiClient.get<ApiResponse<ContactDto[]>>(`/companies/${companyId}/contacts`);
    return res.data.data || [];
  },

  create: async (companyId: number, data: ContactCreateRequest) => {
    const res = await apiClient.post<ApiResponse<ContactDto>>(`/companies/${companyId}/contacts`, data);
    return res.data.data!;
  },
};

export const productApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<ProductDto[]>>('/products');
    return res.data.data || [];
  },

  create: async (data: ProductCreateRequest) => {
    const res = await apiClient.post<ApiResponse<ProductDto>>('/products', data);
    return res.data.data!;
  },
};

export const subscriptionApi = {
  getByCompany: async (companyId: number) => {
    const res = await apiClient.get<ApiResponse<SubscriptionDto[]>>(`/companies/${companyId}/subscriptions`);
    return res.data.data || [];
  },

  create: async (companyId: number, data: SubscriptionCreateRequest) => {
    const res = await apiClient.post<ApiResponse<SubscriptionDto>>(`/companies/${companyId}/subscriptions`, data);
    return res.data.data!;
  },
};

export const contractApi = {
  getCycles: async (subscriptionId: number) => {
    const res = await apiClient.get<ApiResponse<ContractCycleDto[]>>(`/subscriptions/${subscriptionId}/cycles`);
    return res.data.data || [];
  },

  createFirstCycle: async (subscriptionId: number, data: ContractCycleCreateRequest) => {
    const res = await apiClient.post<ApiResponse<ContractCycleDto>>(`/subscriptions/${subscriptionId}/cycles`, data);
    return res.data.data!;
  },

  updateCycle: async (subscriptionId: number, cycleId: number, data: ContractCycleCreateRequest) => {
    const res = await apiClient.put<ApiResponse<ContractCycleDto>>(`/subscriptions/${subscriptionId}/cycles/${cycleId}`, data);
    return res.data.data!;
  },

  renewCycle: async (subscriptionId: number, cycleId: number, data: RenewRequest) => {
    const res = await apiClient.post<ApiResponse<ContractCycleDto>>(`/subscriptions/${subscriptionId}/cycles/${cycleId}/renew`, data);
    return res.data.data!;
  },
};

export const poDocumentApi = {
  getDocuments: async (cycleId: number) => {
    const res = await apiClient.get<ApiResponse<PoDocumentDto[]>>(`/cycles/${cycleId}/documents`);
    return res.data.data || [];
  },

  upload: async (cycleId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<PoDocumentDto>>(`/cycles/${cycleId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data!;
  },
};

export const checklistApi = {
  getByCompany: async (companyId: number) => {
    const res = await apiClient.get<ApiResponse<ChecklistItemDto[]>>(`/companies/${companyId}/checklist`);
    return res.data.data || [];
  },

  toggleItem: async (companyId: number, itemId: number) => {
    const res = await apiClient.patch<ApiResponse<ChecklistItemDto>>(`/companies/${companyId}/checklist/${itemId}/toggle`);
    return res.data.data!;
  },
};

export const emailApi = {
  getTemplates: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>('/emails/templates');
    return res.data.data || [];
  },

  getQueue: async () => {
    const res = await apiClient.get<PagedResponse<any>>('/emails/queue');
    return res.data;
  },

  getLogs: async () => {
    const res = await apiClient.get<PagedResponse<any>>('/emails/logs');
    return res.data;
  },

  testSend: async (recipientEmail: string, templateKey?: string) => {
    const res = await apiClient.post<ApiResponse<any>>('/emails/test-send', { recipientEmail, templateKey });
    return res.data;
  },

  processQueue: async () => {
    const res = await apiClient.post<ApiResponse<any>>('/emails/queue/process');
    return res.data;
  },
};

export const reminderApi = {
  getConfigs: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>('/reminders/configs');
    return res.data.data || [];
  },

  triggerRun: async (evaluationDate?: string) => {
    const params = evaluationDate ? `?evaluationDate=${evaluationDate}` : '';
    const res = await apiClient.post<ApiResponse<any>>(`/reminders/run${params}`);
    return res.data;
  },
};

export const activityApi = {
  getByCompany: async (companyId: number) => {
    const res = await apiClient.get<ApiResponse<any[]>>(`/companies/${companyId}/activities`);
    return res.data.data || [];
  },

  create: async (companyId: number, data: any) => {
    const res = await apiClient.post<ApiResponse<any>>(`/companies/${companyId}/activities`, data);
    return res.data.data!;
  },
};

export const issueApi = {
  getByCompany: async (companyId: number) => {
    const res = await apiClient.get<ApiResponse<any[]>>(`/companies/${companyId}/issues`);
    return res.data.data || [];
  },

  getAll: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>('/issues');
    return res.data.data || [];
  },

  create: async (companyId: number, data: any) => {
    const res = await apiClient.post<ApiResponse<any>>(`/companies/${companyId}/issues`, data);
    return res.data.data!;
  },

  update: async (issueId: number, data: any) => {
    const res = await apiClient.put<ApiResponse<any>>(`/issues/${issueId}`, data);
    return res.data.data!;
  },
};

export const taskApi = {
  getByCompany: async (companyId: number) => {
    const res = await apiClient.get<ApiResponse<any[]>>(`/companies/${companyId}/tasks`);
    return res.data.data || [];
  },

  getAll: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>('/tasks');
    return res.data.data || [];
  },

  create: async (companyId: number, data: any) => {
    const res = await apiClient.post<ApiResponse<any>>(`/companies/${companyId}/tasks`, data);
    return res.data.data!;
  },

  toggle: async (taskId: number) => {
    const res = await apiClient.patch<ApiResponse<any>>(`/tasks/${taskId}/toggle`);
    return res.data.data!;
  },
};

export const timelineApi = {
  getCompanyTimeline: async (companyId: number) => {
    const res = await apiClient.get<ApiResponse<any[]>>(`/companies/${companyId}/timeline`);
    return res.data.data || [];
  },
};

export const smtpSettingsApi = {
  get: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/settings/smtp');
    return res.data.data;
  },

  update: async (data: any) => {
    const res = await apiClient.put<ApiResponse<any>>('/settings/smtp', data);
    return res.data.data;
  },
};

export const festivalApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>('/festivals');
    return res.data.data || [];
  },

  get: async (id: number) => {
    const res = await apiClient.get<ApiResponse<any>>(`/festivals/${id}`);
    return res.data.data!;
  },

  create: async (data: any) => {
    const res = await apiClient.post<ApiResponse<any>>('/festivals', data);
    return res.data.data!;
  },

  update: async (id: number, data: any) => {
    const res = await apiClient.put<ApiResponse<any>>(`/festivals/${id}`, data);
    return res.data.data!;
  },

  delete: async (id: number) => {
    await apiClient.delete<ApiResponse<any>>(`/festivals/${id}`);
  },

  toggle: async (id: number) => {
    const res = await apiClient.patch<ApiResponse<any>>(`/festivals/${id}/toggle`);
    return res.data.data!;
  },

  trigger: async (id: number) => {
    const res = await apiClient.post<ApiResponse<any>>(`/festivals/${id}/trigger`);
    return res.data;
  },

  runDaily: async (evaluationDate?: string) => {
    const params = evaluationDate ? `?evaluationDate=${evaluationDate}` : '';
    const res = await apiClient.post<ApiResponse<any>>(`/festivals/run-daily${params}`);
    return res.data;
  },
};

export const unsubscribeApi = {
  get: async (token: string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/unsubscribe/${token}`);
    return res.data.data!;
  },

  update: async (token: string, data: any) => {
    const res = await apiClient.post<ApiResponse<any>>(`/unsubscribe/${token}`, data);
    return res.data.data!;
  },
};

export const dashboardApi = {
  getStats: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/dashboard/stats');
    return res.data.data!;
  },
};

