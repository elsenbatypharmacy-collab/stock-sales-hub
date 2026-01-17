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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Trash2, ShoppingCart, Search } from 'lucide-react';
import { Product, Customer, InvoiceItem, PaymentType } from '@/types';
import { getProducts, getCustomers, createInvoice } from '@/services/storage';
import { toast } from 'sonner';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  useEffect(() => {
    setProducts(getProducts());
    setCustomers(getCustomers());
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) && p.quantity > 0
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast.error('الكمية المطلوبة غير متوفرة');
        return;
      }
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, unitPrice: product.salePrice }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id !== productId) return item;
      
      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) return item;
      if (newQuantity > item.product.quantity) {
        toast.error('الكمية المطلوبة غير متوفرة');
        return item;
      }
      return { ...item, quantity: newQuantity };
    }));
  };

  const updatePrice = (productId: string, newPrice: number) => {
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, unitPrice: newPrice }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setPaymentType('cash');
    setSelectedCustomerId('');
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalProfit = cart.reduce((sum, item) => 
    sum + ((item.unitPrice - item.product.purchasePrice) * item.quantity), 0
  );

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    if (paymentType === 'credit' && !selectedCustomerId) {
      toast.error('يرجى اختيار العميل للبيع الآجل');
      return;
    }

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    const invoiceItems: InvoiceItem[] = cart.map(item => ({
      id: '',
      invoiceId: '',
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      purchasePrice: item.product.purchasePrice,
      profit: (item.unitPrice - item.product.purchasePrice) * item.quantity,
    }));

    createInvoice({
      invoiceDate: new Date().toISOString(),
      paymentType,
      customerId: paymentType === 'credit' ? selectedCustomerId : null,
      customerName: paymentType === 'credit' ? selectedCustomer?.name || null : null,
      totalAmount,
      totalProfit,
      items: invoiceItems,
    });

    toast.success('تم إتمام عملية البيع بنجاح');
    clearCart();
    setProducts(getProducts());
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* Products List */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>الأصناف المتاحة</CardTitle>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث عن صنف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors text-right"
                  >
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatCurrency(product.salePrice)}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      متوفر: {product.quantity}
                    </Badge>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد أصناف متاحة'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart */}
        <div className="flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                سلة المشتريات
                <Badge variant="secondary" className="mr-auto">
                  {cart.length} صنف
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto py-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>السلة فارغة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product.id, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-left">
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                            className="w-24 h-8 text-left"
                          />
                          <p className="text-sm font-bold mt-1">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 mr-2"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            {/* Checkout Section */}
            <div className="border-t p-4 space-y-4">
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <Select value={paymentType} onValueChange={(v) => setPaymentType(v as PaymentType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="credit">آجل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentType === 'credit' && (
                <div className="space-y-2">
                  <Label>العميل</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg">
                  <span>الإجمالي:</span>
                  <span className="font-bold">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>الربح:</span>
                  <span className="text-green-600">{formatCurrency(totalProfit)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                >
                  مسح
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  إتمام البيع
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
