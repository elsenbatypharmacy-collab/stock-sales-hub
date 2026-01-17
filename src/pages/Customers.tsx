import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Users, CreditCard, FileText } from 'lucide-react';
import { Customer, CustomerTransaction } from '@/types';
import { 
  getCustomers, createCustomer, updateCustomer, deleteCustomer,
  addCustomerPayment, getCustomerTransactions 
} from '@/services/storage';
import { toast } from 'sonner';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isTransactionsDialogOpen, setIsTransactionsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    setCustomers(getCustomers());
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '' });
    setEditingCustomer(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
    });
    setIsDialogOpen(true);
  };

  const openPaymentDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPaymentAmount('');
    setIsPaymentDialogOpen(true);
  };

  const openTransactionsDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setTransactions(getCustomerTransactions(customer.id));
    setIsTransactionsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };

    if (!customerData.name) {
      toast.error('يرجى إدخال اسم العميل');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, customerData);
      toast.success('تم تحديث بيانات العميل');
    } else {
      createCustomer(customerData);
      toast.success('تم إضافة العميل بنجاح');
    }

    setIsDialogOpen(false);
    resetForm();
    loadCustomers();
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    addCustomerPayment(selectedCustomer.id, amount, 'تحصيل نقدي');
    toast.success('تم تسجيل التحصيل بنجاح');
    setIsPaymentDialogOpen(false);
    loadCustomers();
  };

  const handleDelete = (customer: Customer) => {
    if (customer.balance !== 0) {
      toast.error('لا يمكن حذف عميل لديه رصيد');
      return;
    }
    if (confirm(`هل أنت متأكد من حذف "${customer.name}"؟`)) {
      deleteCustomer(customer.id);
      toast.success('تم حذف العميل بنجاح');
      loadCustomers();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">العملاء</h1>
            <p className="text-muted-foreground">إدارة بيانات العملاء والمديونيات</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة عميل
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Badge variant="secondary">
                {filteredCustomers.length} عميل
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد عملاء. ابدأ بإضافة عميل جديد.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الرصيد</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell>{customer.address || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={customer.balance > 0 ? 'destructive' : 'secondary'}>
                          {formatCurrency(customer.balance)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openTransactionsDialog(customer)}
                            title="كشف حساب"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {customer.balance > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openPaymentDialog(customer)}
                              title="تحصيل"
                            >
                              <CreditCard className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(customer)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(customer)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم العميل</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسم العميل"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="أدخل العنوان"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingCustomer ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تحصيل من {selectedCustomer?.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePayment}>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
                  <p className="text-2xl font-bold text-destructive">
                    {formatCurrency(selectedCustomer?.balance || 0)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">مبلغ التحصيل</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="أدخل المبلغ"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">تسجيل التحصيل</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Transactions Dialog */}
        <Dialog open={isTransactionsDialogOpen} onOpenChange={setIsTransactionsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>كشف حساب: {selectedCustomer?.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-muted rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
                <p className={`text-2xl font-bold ${selectedCustomer?.balance && selectedCustomer.balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {formatCurrency(selectedCustomer?.balance || 0)}
                </p>
              </div>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد معاملات</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{new Date(t.date).toLocaleDateString('ar-EG')}</TableCell>
                        <TableCell>
                          <Badge variant={t.type === 'payment' ? 'secondary' : 'outline'}>
                            {t.type === 'sale' ? 'بيع' : t.type === 'payment' ? 'تحصيل' : 'تسوية'}
                          </Badge>
                        </TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell className={t.amount > 0 ? 'text-destructive' : 'text-green-600'}>
                          {formatCurrency(Math.abs(t.amount))}
                          {t.amount > 0 ? ' (عليه)' : ' (له)'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
