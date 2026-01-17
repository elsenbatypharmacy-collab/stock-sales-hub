// LocalStorage Service for Data Persistence

import { 
  User, Product, Customer, Supplier, Invoice, 
  CustomerTransaction, SupplierTransaction,
  InventoryAudit, InventoryAuditItem, StockMovement
} from '@/types';

const STORAGE_KEYS = {
  USERS: 'inv_users',
  PRODUCTS: 'inv_products',
  CUSTOMERS: 'inv_customers',
  SUPPLIERS: 'inv_suppliers',
  INVOICES: 'inv_invoices',
  INVOICE_COUNTER: 'inv_invoice_counter',
  CUSTOMER_TRANSACTIONS: 'inv_customer_transactions',
  SUPPLIER_TRANSACTIONS: 'inv_supplier_transactions',
  INVENTORY_AUDITS: 'inv_inventory_audits',
  INVENTORY_AUDIT_ITEMS: 'inv_inventory_audit_items',
  STOCK_MOVEMENTS: 'inv_stock_movements',
  CURRENT_USER: 'inv_current_user',
} as const;

// Generic storage functions
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize default admin user
export function initializeDefaultUser(): void {
  const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
  if (users.length === 0) {
    const defaultUser: User = {
      id: generateId(),
      username: 'admin',
      password: 'admin123',
      createdAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.USERS, [defaultUser]);
  }
}

// Auth functions
export function login(username: string, password: string): User | null {
  const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  }
  return null;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function getCurrentUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

// Products CRUD
export function getProducts(): Product[] {
  return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
}

export function getProduct(id: string): Product | undefined {
  return getProducts().find(p => p.id === id);
}

export function createProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  setItem(STORAGE_KEYS.PRODUCTS, products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...updates };
  setItem(STORAGE_KEYS.PRODUCTS, products);
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  setItem(STORAGE_KEYS.PRODUCTS, filtered);
  return true;
}

export function updateProductQuantity(id: string, quantityChange: number): Product | null {
  const product = getProduct(id);
  if (!product) return null;
  return updateProduct(id, { quantity: product.quantity + quantityChange });
}

export function getLowStockProducts(): Product[] {
  return getProducts().filter(p => p.quantity <= p.minimumQuantity);
}

// Customers CRUD
export function getCustomers(): Customer[] {
  return getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
}

export function getCustomer(id: string): Customer | undefined {
  return getCustomers().find(c => c.id === id);
}

export function createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'balance'>): Customer {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: generateId(),
    balance: 0,
    createdAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  setItem(STORAGE_KEYS.CUSTOMERS, customers);
  return newCustomer;
}

export function updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) return null;
  customers[index] = { ...customers[index], ...updates };
  setItem(STORAGE_KEYS.CUSTOMERS, customers);
  return customers[index];
}

export function deleteCustomer(id: string): boolean {
  const customers = getCustomers();
  const filtered = customers.filter(c => c.id !== id);
  if (filtered.length === customers.length) return false;
  setItem(STORAGE_KEYS.CUSTOMERS, filtered);
  return true;
}

export function updateCustomerBalance(id: string, amount: number): Customer | null {
  const customer = getCustomer(id);
  if (!customer) return null;
  return updateCustomer(id, { balance: customer.balance + amount });
}

// Suppliers CRUD
export function getSuppliers(): Supplier[] {
  return getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
}

export function getSupplier(id: string): Supplier | undefined {
  return getSuppliers().find(s => s.id === id);
}

export function createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'balance'>): Supplier {
  const suppliers = getSuppliers();
  const newSupplier: Supplier = {
    ...supplier,
    id: generateId(),
    balance: 0,
    createdAt: new Date().toISOString(),
  };
  suppliers.push(newSupplier);
  setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
  return newSupplier;
}

export function updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
  const suppliers = getSuppliers();
  const index = suppliers.findIndex(s => s.id === id);
  if (index === -1) return null;
  suppliers[index] = { ...suppliers[index], ...updates };
  setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
  return suppliers[index];
}

export function deleteSupplier(id: string): boolean {
  const suppliers = getSuppliers();
  const filtered = suppliers.filter(s => s.id !== id);
  if (filtered.length === suppliers.length) return false;
  setItem(STORAGE_KEYS.SUPPLIERS, filtered);
  return true;
}

export function updateSupplierBalance(id: string, amount: number): Supplier | null {
  const supplier = getSupplier(id);
  if (!supplier) return null;
  return updateSupplier(id, { balance: supplier.balance + amount });
}

// Invoices
export function getNextInvoiceNumber(): number {
  const counter = getItem<number>(STORAGE_KEYS.INVOICE_COUNTER, 0);
  const newCounter = counter + 1;
  setItem(STORAGE_KEYS.INVOICE_COUNTER, newCounter);
  return newCounter;
}

export function getInvoices(): Invoice[] {
  return getItem<Invoice[]>(STORAGE_KEYS.INVOICES, []);
}

export function getInvoice(id: string): Invoice | undefined {
  return getInvoices().find(i => i.id === id);
}

export function createInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>): Invoice {
  const invoices = getInvoices();
  const newInvoice: Invoice = {
    ...invoice,
    id: generateId(),
    invoiceNumber: getNextInvoiceNumber(),
    createdAt: new Date().toISOString(),
  };
  invoices.push(newInvoice);
  setItem(STORAGE_KEYS.INVOICES, invoices);
  
  // Update product quantities
  invoice.items.forEach(item => {
    updateProductQuantity(item.productId, -item.quantity);
  });
  
  // If credit sale, update customer balance and create transaction
  if (invoice.paymentType === 'credit' && invoice.customerId) {
    updateCustomerBalance(invoice.customerId, invoice.totalAmount);
    createCustomerTransaction({
      customerId: invoice.customerId,
      invoiceId: newInvoice.id,
      amount: invoice.totalAmount,
      type: 'sale',
      description: `فاتورة مبيعات رقم ${newInvoice.invoiceNumber}`,
      date: invoice.invoiceDate,
    });
  }
  
  return newInvoice;
}

export function getTodayInvoices(): Invoice[] {
  const today = new Date().toISOString().split('T')[0];
  return getInvoices().filter(i => i.invoiceDate.startsWith(today));
}

export function getMonthInvoices(year: number, month: number): Invoice[] {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  return getInvoices().filter(i => i.invoiceDate.startsWith(monthStr));
}

// Customer Transactions
export function getCustomerTransactions(customerId?: string): CustomerTransaction[] {
  const transactions = getItem<CustomerTransaction[]>(STORAGE_KEYS.CUSTOMER_TRANSACTIONS, []);
  if (customerId) {
    return transactions.filter(t => t.customerId === customerId);
  }
  return transactions;
}

export function createCustomerTransaction(
  transaction: Omit<CustomerTransaction, 'id' | 'createdAt'>
): CustomerTransaction {
  const transactions = getCustomerTransactions();
  const newTransaction: CustomerTransaction = {
    ...transaction,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  transactions.push(newTransaction);
  setItem(STORAGE_KEYS.CUSTOMER_TRANSACTIONS, transactions);
  return newTransaction;
}

export function addCustomerPayment(customerId: string, amount: number, description: string): void {
  updateCustomerBalance(customerId, -amount);
  createCustomerTransaction({
    customerId,
    invoiceId: null,
    amount: -amount,
    type: 'payment',
    description,
    date: new Date().toISOString(),
  });
}

export function addCustomerAdjustment(customerId: string, amount: number, description: string): void {
  updateCustomerBalance(customerId, amount);
  createCustomerTransaction({
    customerId,
    invoiceId: null,
    amount,
    type: 'adjustment',
    description,
    date: new Date().toISOString(),
  });
}

// Supplier Transactions
export function getSupplierTransactions(supplierId?: string): SupplierTransaction[] {
  const transactions = getItem<SupplierTransaction[]>(STORAGE_KEYS.SUPPLIER_TRANSACTIONS, []);
  if (supplierId) {
    return transactions.filter(t => t.supplierId === supplierId);
  }
  return transactions;
}

export function createSupplierTransaction(
  transaction: Omit<SupplierTransaction, 'id' | 'createdAt'>
): SupplierTransaction {
  const transactions = getSupplierTransactions();
  const newTransaction: SupplierTransaction = {
    ...transaction,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  transactions.push(newTransaction);
  setItem(STORAGE_KEYS.SUPPLIER_TRANSACTIONS, transactions);
  return newTransaction;
}

export function addSupplierPayment(supplierId: string, amount: number, description: string): void {
  updateSupplierBalance(supplierId, -amount);
  createSupplierTransaction({
    supplierId,
    amount: -amount,
    type: 'payment',
    description,
    date: new Date().toISOString(),
  });
}

export function addSupplierPurchase(supplierId: string, amount: number, description: string): void {
  updateSupplierBalance(supplierId, amount);
  createSupplierTransaction({
    supplierId,
    amount,
    type: 'purchase',
    description,
    date: new Date().toISOString(),
  });
}

// Stock Movements
export function getStockMovements(productId?: string): StockMovement[] {
  const movements = getItem<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, []);
  if (productId) {
    return movements.filter(m => m.productId === productId);
  }
  return movements;
}

export function addStockIn(productId: string, quantity: number, reason: string): void {
  const product = getProduct(productId);
  if (!product) return;
  
  updateProductQuantity(productId, quantity);
  
  const movements = getStockMovements();
  movements.push({
    id: generateId(),
    productId,
    productName: product.name,
    quantity,
    type: 'in',
    reason,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
  setItem(STORAGE_KEYS.STOCK_MOVEMENTS, movements);
}

// Inventory Audits
export function getInventoryAudits(): InventoryAudit[] {
  return getItem<InventoryAudit[]>(STORAGE_KEYS.INVENTORY_AUDITS, []);
}

export function getInventoryAudit(id: string): InventoryAudit | undefined {
  return getInventoryAudits().find(a => a.id === id);
}

export function getInventoryAuditItems(auditId: string): InventoryAuditItem[] {
  return getItem<InventoryAuditItem[]>(STORAGE_KEYS.INVENTORY_AUDIT_ITEMS, [])
    .filter(item => item.auditId === auditId);
}

export function createInventoryAudit(notes: string): InventoryAudit {
  const audits = getInventoryAudits();
  const newAudit: InventoryAudit = {
    id: generateId(),
    auditDate: new Date().toISOString(),
    status: 'draft',
    notes,
    createdAt: new Date().toISOString(),
    approvedAt: null,
  };
  audits.push(newAudit);
  setItem(STORAGE_KEYS.INVENTORY_AUDITS, audits);
  
  // Create audit items for all products
  const products = getProducts();
  const auditItems: InventoryAuditItem[] = products.map(p => ({
    id: generateId(),
    auditId: newAudit.id,
    productId: p.id,
    productName: p.name,
    systemQuantity: p.quantity,
    actualQuantity: p.quantity,
    difference: 0,
  }));
  
  const existingItems = getItem<InventoryAuditItem[]>(STORAGE_KEYS.INVENTORY_AUDIT_ITEMS, []);
  setItem(STORAGE_KEYS.INVENTORY_AUDIT_ITEMS, [...existingItems, ...auditItems]);
  
  return newAudit;
}

export function updateAuditItem(itemId: string, actualQuantity: number): void {
  const items = getItem<InventoryAuditItem[]>(STORAGE_KEYS.INVENTORY_AUDIT_ITEMS, []);
  const index = items.findIndex(i => i.id === itemId);
  if (index !== -1) {
    items[index].actualQuantity = actualQuantity;
    items[index].difference = actualQuantity - items[index].systemQuantity;
    setItem(STORAGE_KEYS.INVENTORY_AUDIT_ITEMS, items);
  }
}

export function approveAudit(auditId: string): void {
  const audits = getInventoryAudits();
  const index = audits.findIndex(a => a.id === auditId);
  if (index === -1) return;
  
  audits[index].status = 'approved';
  audits[index].approvedAt = new Date().toISOString();
  setItem(STORAGE_KEYS.INVENTORY_AUDITS, audits);
  
  // Update product quantities based on audit
  const auditItems = getInventoryAuditItems(auditId);
  auditItems.forEach(item => {
    if (item.difference !== 0) {
      updateProduct(item.productId, { quantity: item.actualQuantity });
    }
  });
}

// Dashboard Stats
export function getDashboardStats(): import('@/types').DashboardStats {
  const products = getProducts();
  const customers = getCustomers();
  const suppliers = getSuppliers();
  const todayInvoices = getTodayInvoices();
  const now = new Date();
  const monthInvoices = getMonthInvoices(now.getFullYear(), now.getMonth() + 1);
  
  return {
    totalProducts: products.length,
    lowStockProducts: products.filter(p => p.quantity <= p.minimumQuantity).length,
    totalCustomers: customers.length,
    totalSuppliers: suppliers.length,
    todaySales: todayInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
    todayProfit: todayInvoices.reduce((sum, i) => sum + i.totalProfit, 0),
    monthlySales: monthInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
    monthlyProfit: monthInvoices.reduce((sum, i) => sum + i.totalProfit, 0),
    totalCustomerDebt: customers.reduce((sum, c) => sum + c.balance, 0),
    totalSupplierDebt: suppliers.reduce((sum, s) => sum + s.balance, 0),
  };
}
