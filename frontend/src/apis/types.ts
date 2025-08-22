// API Response Types

export interface User {
  id: string;
  email: string;
  role: {
    name: string;
    permissions: Record<string, any>;
  };
}

export interface AuthResponse {
  token: string;
  permissions: Record<string, any>;
  user: {
    email: string;
    id: string;
    role_id: string;
    role: string;
  };
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
  supplier_responses: SupplierResponse[];
  created_at: string;
  updated_at: string;
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
  documents: Document[];
  created_at: string;
  updated_at: string;
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
  totalResponses?: number;
  pendingResponses?: number;
  approvedResponses?: number;
  rejectedResponses?: number;
  draftResponses?: number;
  submittedResponses?: number;
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
  errors?: any[];
}
