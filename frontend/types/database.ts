// Database types matching Java backend models

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum TransactionStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

export enum TransactionType {
  FEE = 'FEE',
  PAYMENT = 'PAYMENT'
}

export enum PaymentMethod {
  SYSTEM = 'SYSTEM',
  STRIPE = 'STRIPE',
  CASH = 'CASH',
  BANK = 'BANK',
  BANK_TRANSFER = 'BANK_TRANSFER' // Backend използва този вариант
}

export enum FundType {
  MAINTENANCE = 'MAINTENANCE',  // Фонд Поддръжка (backend използва GENERAL)
  REPAIR = 'REPAIR',             // Фонд Ремонти
  GENERAL = 'GENERAL'            // Общ фонд (алиас за MAINTENANCE)
}

export enum DocumentType {
  PROTOCOL = 'PROTOCOL',
  INVOICE = 'INVOICE',
  CONTRACT = 'CONTRACT',
  OTHER = 'OTHER'
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

// Dashboard response
export interface DashboardData {
  managedBuildings: ManagedBuilding[];
  myHomes: MyHome[];
}

export interface ManagedBuilding {
  id: number;
  name: string;
  address: string;
  entrance: string;
  totalUnits: number;
  managerInfo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface MyHome {
  unitId: number;
  unitNumber: number;
  buildingId: number; // ID на сградата от UnitResponseFromAPI.buildingInfo.id
  buildingName: string;
  buildingAddress: string;
}

export interface Building {
  id: number;
  name: string;
  address: string;
  entrance: string;
  totalUnits?: number;
  createdAt: string;
  updatedAt: string;
  units?: Unit[];
  managerInfo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface UnitBalance {
  id: number;
  unitId: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: number;
  buildingId: number;
  unitNumber: string;
  area: number;
  residents: number;
  residentsCount?: number; // Алиас за residents
  floor: number | null;
  accessCode?: string; // 8-цифрен код за регистрация на жители
  isVerified?: boolean; // Потвърдени ли са данните от мениджъра
  createdAt: string;
  updatedAt: string;
  building?: Building;
  balance?: UnitBalance;
  fees?: UnitFee[];
  resident?: User; // Жителят регистриран с този код (ако има такъв)
}

export interface UnitFee {
  id: number;
  unitId: number;
  month: string; // LocalDate as ISO string
  amount: number;
  fundType: FundType;
  dueFrom: string; // LocalDate as ISO string
  dueTo: string; // LocalDate as ISO string
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
  unit?: Unit;
}

export interface Payment {
  id: number;
  unitFeeId: number;
  userId: number | null;
  amount: number;
  paymentDate: string | null;
  bankReference: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  unitFee?: UnitFee;
  user?: User;
}

export interface Receipt {
  id: number;
  paymentId: number;
  receiptNumber: string;
  generatedAt: string;
  pdfUrl: string | null;
  payment?: Payment;
}

export interface Budget {
  id: number;
  year: number;
  maintenanceAmount: number;
  repairAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceService {
  id: number;
  name: string;
  provider: string;
  monthlyCost: number;
  startDate: string; // LocalDate
  endDate: string | null; // LocalDate
  createdAt: string;
  updatedAt: string;
}

export interface VotesOption {
  id: number;
  pollId: number;
  optionText: string;
}

export interface VotesPoll {
  id: number;
  title: string;
  description: string | null;
  startAt: string; // LocalDateTime
  endAt: string; // LocalDateTime
  createdBy: User | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  options?: VotesOption[];
}

export interface UserVote {
  id: number;
  pollId: number;
  userId: number;
  optionId: number;
  votedAt: string;
  poll?: VotesPoll;
  user?: User;
  option?: VotesOption;
}

// Extended types with additional computed fields
export interface UnitFeeWithDetails extends UnitFee {
  unit?: Unit & { building?: Building };
  payment?: Payment;
}

export interface PaymentWithDetails extends Payment {
  unitFee?: UnitFeeWithDetails;
  user?: User;
  receipt?: Receipt;
}

export interface VotesPollWithResults extends VotesPoll {
  options?: (VotesOption & { voteCount?: number })[];
  totalVotes?: number;
  userVote?: UserVote;
}

// New Transaction Types (from API)
export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  fundType: FundType;
  paymentMethod: PaymentMethod;
  description: string;
  transactionStatus: TransactionStatus;
  documentUrl: string | null;
  externalDocumentUrl: string | null;
  createdAt: string;
  unitId: number;
  unitNumber: number;
}

// Receipt Details (from API)
export interface ReceiptDetails {
  receiptNumber: number;
  issueDate: string;
  payerName: string;
  payerUnit: number;
  buildingAddress: string;
  managerName: string;
  amount: number;
  currency: string;
  reason: string;
  documentUrl: string;
}

// Stripe Payment Types
export interface StripePaymentRequest {
  amount: number;
}

export interface StripePaymentResponse {
  clientSecret: string;
  transactionId: number;
}

// Cash Payment Request
export interface CashPaymentRequest {
  amount: number;
  fundType: FundType;
  note: string;
}

// Bank Payment Request
export interface BankPaymentRequest {
  amount: number;
  transactionReference: string;
  proofUrl: string;
}

// Document (from API)
export interface Document {
  id: number;
  title: string;
  description: string;
  type: DocumentType;
  fileUrl: string;
  uploaderName: string;
  isVisible: boolean;
  createdAt: string;
}