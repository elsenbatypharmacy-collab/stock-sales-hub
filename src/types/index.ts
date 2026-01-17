// Database Types for Inventory Management System

export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  minimumQuantity: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  balance: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  balance: number;
  createdAt: string;
}

export type PaymentType = 'cash' | 'credit';

export interface Invoice {
  id: string;
  invoiceNumber: number;
  invoiceDate: string;
  paymentType: PaymentType;
  customerId: string | null;
  customerName: string | null;
  totalAmount: number;
  totalProfit: number;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number;
  profit: number;
}

export type TransactionType = 'sale' | 'payment' | 'adjustment';

export interface CustomerTransaction {
  id: string;
  customerId: string;
  invoiceId: string | null;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  createdAt: string;
}

export type SupplierTransactionType = 'purchase' | 'payment' | 'adjustment';

export interface SupplierTransaction {
  id: string;
  supplierId: string;
  amount: number;
  type: SupplierTransactionType;
  description: string;
  date: string;
  createdAt: string;
}

export type AuditStatus = 'draft' | 'approved';

export interface InventoryAudit {
  id: string;
  auditDate: string;
  status: AuditStatus;
  notes: string;
  createdAt: string;
  approvedAt: string | null;
}

export interface InventoryAuditItem {
  id: string;
  auditId: string;
  productId: string;
  productName: string;
  systemQuantity: number;
  actualQuantity: number;
  difference: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  type: 'in' | 'out' | 'adjustment';
  reason: string;
  date: string;
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  todaySales: number;
  todayProfit: number;
  monthlySales: number;
  monthlyProfit: number;
  totalCustomerDebt: number;
  totalSupplierDebt: number;
}
