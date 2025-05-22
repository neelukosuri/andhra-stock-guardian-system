
// Common types
export type UserRole = 'HQ_ADMIN' | 'DISTRICT_ADMIN';

export interface User {
  id: string;
  username: string;
  password: string; // In a real app this would be a hash
  role: UserRole;
  districtId?: string; // Only for DISTRICT_ADMIN
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationStaff {
  id: string;
  gNo: string;
  name: string;
  rank: string;
  placeOfPosting: string;
  mobileNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface District {
  id: string;
  name: string;
  isCommissionerateOrWing: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ledger {
  id: string;
  name: string;
  currentSequenceNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuantityMetric {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  financialYear: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string;
  name: string;
  mobileNumber: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  name: string;
  code: string;
  description: string;
  ledgerId: string;
  createdAt: string;
  updatedAt: string;
  itemCode?: string; // Adding this as some components are using it
}

export interface HQStock {
  id: string;
  itemId: string;
  quantity: number;
  metricId: string;
  lowStockThreshold?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Procurement {
  id: string;
  itemId: string;
  quantity: number;
  metricId: string;
  invoiceNumber: string;
  purchaseDate: string;
  budgetId: string;
  sellerId: string;
  warrantyPeriodTill: string;
  procurementType: 'New' | 'Existing';
  procuredByUserId: string;
  createdAt: string;
}

export interface LoanItem {
  id: string;
  itemId: string;
  quantity: number;
  metricId: string;
  sourceWing: string;
  eventName: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: 'Loaned' | 'Returned';
  returnedTo?: string;  // Adding this field
  returnNotes?: string; // Adding this field
  createdAt: string;    // Changed from created_at to createdAt
  updatedAt: string;
}

export interface HQIssuanceVoucher {
  id: string;
  ivNumber: string;
  issueDate: string;
  issuedByUserId: string;
  receivingStaffGNo: string;
  receivingDistrictId: string;
  approvalAuthority: string;
  approvalDate: string;
  approvalRefNo: string;
  createdAt: string;
}

export interface HQItemMovement {
  id: string;
  ivId?: string;
  larId?: string;
  itemId: string;
  quantity: number;
  metricId?: string; // Added to fix build error
  movementType: 'Issue_To_District' | 'Return_From_District';
  isReturnable: boolean;
  returnedQuantity: number;
  createdAt: string;
}

export interface HQLARVoucher {
  id: string;
  larNumber: string;
  returnDate: string;
  returnedByUserId: string;
  ivIdRef: string;
  createdAt: string;
}

export interface DistrictStock {
  id: string;
  districtId: string;
  itemId: string;
  quantity: number;
  metricId: string;
  isReturnable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DistrictIssuanceVoucher {
  id: string;
  ivNumber: string;
  issueDate: string;
  issuedByUserId: string;
  receivingStaffGNo: string;
  receivingOfficeName: string;
  districtId: string; // Adding this field
  createdAt: string;
}

export interface DistrictItemMovement {
  id: string;
  districtId: string;
  districtIvId?: string;
  districtLarId?: string;
  itemId: string;
  quantity: number;
  metricId?: string; // Added to fix build error
  movementType: 'Issue_To_Internal' | 'Return_From_Internal';
  isReturnable: boolean;
  returnedQuantity: number;
  createdAt: string;
}

export interface DistrictLARVoucher {
  id: string;
  larNumber: string;
  returnDate: string;
  returnedByUserId: string;
  districtIvIdRef: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

// Extended types for UI display
export interface ItemWithDetails extends Item {
  ledgerName?: string;
}

export interface HQStockWithDetails extends HQStock {
  itemName?: string;
  itemCode?: string;
  metricName?: string;
}

export interface LoanItemWithDetails extends LoanItem {
  itemName?: string;
  itemCode?: string;
  metricName?: string;
}

export interface HQIssuanceVoucherWithDetails extends HQIssuanceVoucher {
  issuedByUsername?: string;
  receivingStaffName?: string;
  receivingDistrictName?: string;
}

export interface DistrictStockWithDetails extends DistrictStock {
  itemName?: string;
  itemCode?: string;
  metricName?: string;
  districtName?: string;
}
