// API Response Types

export interface User {
  id: string;
  email: string;
  role: {
    name: string;
    permissions: Record<string, unknown>;
  };
}

export interface AuthResponse {
  token: string;
  permissions: Record<string, unknown>;
  user: {
    email: string;
    id: string;
    role_id: string;
    role: string;
  };
}

export interface RFPVersion {
  id: string;
  rfp_id: string;
  version_number: number;
  description: string;
  requirements: string;
  budget_min?: number;
  budget_max?: number;
  deadline: string;
  notes?: string;
  documents: Document[];
  created_at: string;
}

export interface RFP {
  id: string;
  title: string;
  status: {
    code: string;
    label: string;
  };
  buyer: {
    id: string;
    email: string;
  };
  awarded_response_id?: string;
  awarded_response?: SupplierResponse;
  current_version: {
    id: string;
    version_number: number;
    description: string;
    requirements: string;
    budget_min?: number;
    budget_max?: number;
    deadline: string;
    notes?: string;
    documents: Document[];
  };
  current_version_id?: string;
  versions?: RFPVersion[];
  supplier_responses: SupplierResponse[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
  awarded_at?: string;
}

export interface SupplierResponse {
  id: string;
  rfp_id: string;
  supplier: {
    id: string;
    email: string;
  };
  status: {
    code: string;
    label: string;
  };
  proposed_budget?: number;
  timeline?: string;
  cover_letter?: string;
  notes?: string;
  rejection_reason?: string;
  documents: Document[];
  rfp?: {
    id: string;
    title: string;
    buyer: {
      id: string;
      email: string;
    };
    status: {
      code: string;
      label: string;
    };
    current_version: {
      id: string;
      version_number: number;
      description: string;
      requirements: string;
      budget_min?: number;
      budget_max?: number;
      deadline: string;
      notes?: string;
    };
  };
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  reviewed_at?: string;
  decided_at?: string;
}

export interface Document {
  id: string;
  file_name: string;
  url: string;
  file_type?: string;
  version: number;
  created_at: string;
}

export interface DashboardData {
  recentRfps?: RFP[];
  recentResponses?: SupplierResponse[];
  rfpsNeedingAttention?: RFP[];
  availableRfps?: RFP[];
  myResponses?: SupplierResponse[];
  responsesNeedingAttention?: SupplierResponse[];
  role: string;
}

export interface DashboardStats {
  totalRfps?: number;
  publishedRfps?: number;
  draftRfps?: number;
  closedRfps?: number;
  awardedRfps?: number;
  cancelledRfps?: number;
  totalResponses?: number;
  pendingResponses?: number;
  approvedResponses?: number;
  rejectedResponses?: number;
  awardedResponses?: number;
  draftResponses?: number;
  submittedResponses?: number;
  underReviewResponses?: number;
  availableRfps?: number;
  role: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export interface ApiError {
  message: string;
  errors?: unknown[];
}
