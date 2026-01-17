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
import { Plus, Pencil, Trash2, Search, Truck, CreditCard, FileText } from 'lucide-react';
import { Supplier, SupplierTransaction } from '@/types';
import { 
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  addSupplierPayment, getSupplierTransactions 
} from '@/services/storage';
import { toast } from 'sonner';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isTransactionsDialogOpen, setIsTransactionsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [transactions, setTransactions] = useState<SupplierTransaction[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    setSuppliers(getSuppliers());
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '' });
    setEditingSupplier(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address,
    });
    setIsDialogOpen(true);
  };

  const openPaymentDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setPaymentAmount('');
    setIsPaymentDialogOpen(true);
  };

  const openTransactionsDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setTransactions(getSupplierTransactions(supplier.id));
    setIsTransactionsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplierData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };

    if (!supplierData.name) {
      toast.error('يرجى إدخال اسم المورد');
      return;
    }

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplierData);
      toast.success('تم تحديث بيانات المورد');
    } else {
      createSupplier(supplierData);
      toast.success('تم إضافة المورد بنجاح');
    }

    setIsDialogOpen(false);
    resetForm();
    loadSuppliers();
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    addSupplierPayment(selectedSupplier.id, amount, 'سداد للمورد');
    toast.success('تم تسجيل السداد بنجاح');
    setIsPaymentDialogOpen(false);
    loadSuppliers();
  };

  const handleDelete = (supplier: Supplier) => {
    if (supplier.balance !== 0) {
      toast.error('لا يمكن حذف مورد لديه رصيد');
      return;
    }
    if (confirm(`هل أنت متأكد من حذف "${supplier.name}"؟`)) {
      deleteSupplier(supplier.id);
      toast.success('تم حذف المورد بنجاح');
      loadSuppliers();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">الموردين</h1>
            <p className="text-muted-foreground">إدارة بيانات الموردين والمديونيات</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة مورد
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
                {filteredSuppliers.length} مورد
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد موردين. ابدأ بإضافة مورد جديد.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المورد</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الرصيد</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.phone || '-'}</TableCell>
                      <TableCell>{supplier.address || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={supplier.balance > 0 ? 'destructive' : 'secondary'}>
                          {formatCurrency(supplier.balance)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openTransactionsDialog(supplier)}
                            title="كشف حساب"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {supplier.balance > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openPaymentDialog(supplier)}
                              title="سداد"
                            >
                              <CreditCard className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(supplier)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(supplier)}
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
                {editingSupplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المورد</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسم المورد"
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
                  {editingSupplier ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>سداد لـ {selectedSupplier?.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePayment}>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">الرصيد المستحق</p>
                  <p className="text-2xl font-bold text-destructive">
                    {formatCurrency(selectedSupplier?.balance || 0)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">مبلغ السداد</Label>
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
                <Button type="submit">تسجيل السداد</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Transactions Dialog */}
        <Dialog open={isTransactionsDialogOpen} onOpenChange={setIsTransactionsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>كشف حساب: {selectedSupplier?.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-muted rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">الرصيد المستحق</p>
                <p className={`text-2xl font-bold ${selectedSupplier?.balance && selectedSupplier.balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {formatCurrency(selectedSupplier?.balance || 0)}
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
                            {t.type === 'purchase' ? 'شراء' : t.type === 'payment' ? 'سداد' : 'تسوية'}
                          </Badge>
                        </TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell className={t.amount > 0 ? 'text-destructive' : 'text-green-600'}>
                          {formatCurrency(Math.abs(t.amount))}
                          {t.amount > 0 ? ' (علينا)' : ' (لنا)'}
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
