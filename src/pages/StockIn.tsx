import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackagePlus } from 'lucide-react';
import { Product, Supplier } from '@/types';
import { getProducts, getSuppliers, addStockIn, addSupplierPurchase } from '@/services/storage';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function StockIn() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [isCredit, setIsCredit] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setProducts(getProducts());
    setSuppliers(getSuppliers());
  }, []);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId) {
      toast.error('يرجى اختيار الصنف');
      return;
    }

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      toast.error('يرجى إدخال كمية صحيحة');
      return;
    }

    const reason = notes || 'إضافة مخزون';
    addStockIn(selectedProductId, qty, reason);

    // If credit purchase with supplier
    if (isCredit && selectedSupplierId) {
      const price = parseFloat(purchasePrice) || 0;
      const totalAmount = price * qty;
      const supplier = suppliers.find(s => s.id === selectedSupplierId);
      addSupplierPurchase(
        selectedSupplierId, 
        totalAmount, 
        `شراء ${qty} ${selectedProduct?.name} من ${supplier?.name}`
      );
    }

    toast.success('تم إضافة المخزون بنجاح');
    
    // Reset form
    setSelectedProductId('');
    setSelectedSupplierId('');
    setQuantity('');
    setPurchasePrice('');
    setIsCredit(false);
    setNotes('');
    
    // Reload products
    setProducts(getProducts());
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">إضافة مخزون</h1>
          <p className="text-muted-foreground">إضافة كميات جديدة للمخزون</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5" />
              بيانات الإضافة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>الصنف</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصنف" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (المتوفر: {product.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">سعر الشراء</p>
                      <p className="font-medium">{formatCurrency(selectedProduct.purchasePrice)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">سعر البيع</p>
                      <p className="font-medium">{formatCurrency(selectedProduct.salePrice)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">الكمية الحالية</p>
                      <p className="font-medium">{selectedProduct.quantity}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>الكمية المضافة</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="أدخل الكمية"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCredit"
                  checked={isCredit}
                  onChange={(e) => setIsCredit(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isCredit">شراء آجل من مورد</Label>
              </div>

              {isCredit && (
                <>
                  <div className="space-y-2">
                    <Label>المورد</Label>
                    <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المورد" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>سعر الشراء للوحدة</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="أدخل سعر الشراء"
                    />
                  </div>

                  {quantity && purchasePrice && (
                    <div className="p-4 bg-destructive/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">إجمالي المديونية للمورد</p>
                      <p className="text-xl font-bold text-destructive">
                        {formatCurrency(parseFloat(quantity) * parseFloat(purchasePrice))}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات إضافية (اختياري)"
                />
              </div>

              <Button type="submit" className="w-full">
                إضافة المخزون
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
