import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { RFP, SupplierResponse } from '@/apis/types';

// PDF Export Functions
export const exportRfpToPdf = (rfp: RFP) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('RFP Details', 20, 30);
  
  // RFP Information
  doc.setFontSize(12);
  doc.text(`Title: ${rfp.title}`, 20, 50);
  doc.text(`Status: ${rfp.status}`, 20, 60);
  doc.text(`Created: ${new Date(rfp.created_at).toLocaleDateString()}`, 20, 70);
  doc.text(`Deadline: ${new Date(rfp.deadline).toLocaleDateString()}`, 20, 80);
  
  if (rfp.budget_min && rfp.budget_max) {
    doc.text(`Budget: $${rfp.budget_min.toLocaleString()} - $${rfp.budget_max.toLocaleString()}`, 20, 90);
  }
  
  // Description
  doc.text('Description:', 20, 110);
  const splitDescription = doc.splitTextToSize(rfp.description, 170);
  doc.text(splitDescription, 20, 120);
  
  // Requirements
  const descriptionHeight = splitDescription.length * 5;
  doc.text('Requirements:', 20, 130 + descriptionHeight);
  const splitRequirements = doc.splitTextToSize(rfp.requirements, 170);
  doc.text(splitRequirements, 20, 140 + descriptionHeight);
  
  // Notes if available
  if (rfp.notes) {
    const requirementsHeight = splitRequirements.length * 5;
    doc.text('Notes:', 20, 160 + descriptionHeight + requirementsHeight);
    const splitNotes = doc.splitTextToSize(rfp.notes, 170);
    doc.text(splitNotes, 20, 170 + descriptionHeight + requirementsHeight);
  }
  
  // Save the PDF
  doc.save(`RFP-${rfp.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
};

export const exportRfpListToPdf = (rfps: RFP[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.text('RFP List', 20, 20);
  
  // Table data
  const tableData = rfps.map(rfp => [
    rfp.title,
    rfp.status,
    new Date(rfp.created_at).toLocaleDateString(),
    new Date(rfp.deadline).toLocaleDateString(),
    rfp.budget_min && rfp.budget_max 
      ? `$${rfp.budget_min.toLocaleString()} - $${rfp.budget_max.toLocaleString()}`
      : 'Not specified'
  ]);
  
  autoTable(doc, {
    head: [['Title', 'Status', 'Created', 'Deadline', 'Budget']],
    body: tableData,
    startY: 30,
  });
  
  doc.save('RFP-List.pdf');
};

export const exportResponsesToPdf = (responses: SupplierResponse[], rfpTitle?: string) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.text(rfpTitle ? `Responses for: ${rfpTitle}` : 'Response List', 20, 20);
  
  // Table data
  const tableData = responses.map(response => [
    response.supplier?.email || 'N/A',
    response.status,
    response.proposed_budget ? `$${response.proposed_budget.toLocaleString()}` : 'N/A',
    response.timeline || 'N/A',
    new Date(response.created_at).toLocaleDateString()
  ]);
  
  autoTable(doc, {
    head: [['Supplier', 'Status', 'Budget', 'Timeline', 'Submitted']],
    body: tableData,
    startY: 30,
  });
  
  doc.save(`Responses-${rfpTitle?.replace(/[^a-zA-Z0-9]/g, '-') || 'List'}.pdf`);
};

// Excel Export Functions
export const exportRfpToExcel = (rfp: RFP) => {
  const data = [{
    Title: rfp.title,
    Status: rfp.status,
    Description: rfp.description,
    Requirements: rfp.requirements,
    'Budget Min': rfp.budget_min,
    'Budget Max': rfp.budget_max,
    Deadline: new Date(rfp.deadline).toLocaleDateString(),
    Notes: rfp.notes || '',
    Created: new Date(rfp.created_at).toLocaleDateString(),
    Updated: new Date(rfp.updated_at).toLocaleDateString()
  }];
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'RFP Details');
  
  XLSX.writeFile(wb, `RFP-${rfp.title.replace(/[^a-zA-Z0-9]/g, '-')}.xlsx`);
};

export const exportRfpListToExcel = (rfps: RFP[]) => {
  const data = rfps.map(rfp => ({
    Title: rfp.title,
    Status: rfp.status,
    Description: rfp.description,
    Requirements: rfp.requirements,
    'Budget Min': rfp.budget_min,
    'Budget Max': rfp.budget_max,
    Deadline: new Date(rfp.deadline).toLocaleDateString(),
    Notes: rfp.notes || '',
    Created: new Date(rfp.created_at).toLocaleDateString(),
    Updated: new Date(rfp.updated_at).toLocaleDateString()
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'RFP List');
  
  XLSX.writeFile(wb, 'RFP-List.xlsx');
};

export const exportResponsesToExcel = (responses: SupplierResponse[], rfpTitle?: string) => {
  const data = responses.map(response => ({
    'Supplier Email': response.supplier?.email || 'N/A',
    Status: response.status,
    'Proposed Budget': response.proposed_budget,
    Timeline: response.timeline || '',
    'Cover Letter': response.cover_letter || '',
    'Submitted Date': new Date(response.created_at).toLocaleDateString(),
    'Updated Date': new Date(response.updated_at).toLocaleDateString()
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Responses');
  
  XLSX.writeFile(wb, `Responses-${rfpTitle?.replace(/[^a-zA-Z0-9]/g, '-') || 'List'}.xlsx`);
};

// Bulk Operations
export interface BulkOperation {
  id: string;
  action: 'delete' | 'publish' | 'archive' | 'export';
}

export const validateBulkOperation = (selectedIds: string[], action: string): boolean => {
  if (selectedIds.length === 0) {
    return false;
  }
  
  const allowedActions = ['delete', 'publish', 'archive', 'export'];
  return allowedActions.includes(action);
};

export const formatBulkOperationMessage = (count: number, action: string): string => {
  const actionText = {
    delete: 'delete',
    publish: 'publish',
    archive: 'archive',
    export: 'export'
  }[action] || action;
  
  return `Are you sure you want to ${actionText} ${count} item${count > 1 ? 's' : ''}?`;
};
