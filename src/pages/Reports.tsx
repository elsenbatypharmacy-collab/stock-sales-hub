import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, TrendingUp, AlertTriangle, Calendar
} from 'lucide-react';
import { 
  getInvoices, getLowStockProducts, getTodayInvoices, getMonthInvoices,
  getInventoryAudits, getInventoryAuditItems
} from '@/services/storage';
import { Invoice, Product, InventoryAudit, InventoryAuditItem } from '@/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function Reports() {
  const [todayInvoices, setTodayInvoices] = useState<Invoice[]>([]);
  const [monthInvoices, setMonthInvoices] = useState<Invoice[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [audits, setAudits] = useState<InventoryAudit[]>([]);

  useEffect(() => {
    setTodayInvoices(getTodayInvoices());
    const now = new Date();
    setMonthInvoices(getMonthInvoices(now.getFullYear(), now.getMonth() + 1));
    setLowStockProducts(getLowStockProducts());
    setAudits(getInventoryAudits().filter(a => a.status === 'approved'));
  }, []);

  const todayTotal = todayInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const todayProfit = todayInvoices.reduce((sum, i) => sum + i.totalProfit, 0);
  const monthTotal = monthInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const monthProfit = monthInvoices.reduce((sum, i) => sum + i.totalProfit, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">التقارير</h1>
          <p className="text-muted-foreground">تقارير المبيعات والمخزون</p>
        </div>

        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">مبيعات اليوم</TabsTrigger>
            <TabsTrigger value="monthly">مبيعات الشهر</TabsTrigger>
            <TabsTrigger value="lowstock">أصناف ناقصة</TabsTrigger>
            <TabsTrigger value="audits">فروق الجرد</TabsTrigger>
          </TabsList>

          {/* Daily Sales */}
          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  مبيعات اليوم - {new Date().toLocaleDateString('ar-EG')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">عدد الفواتير</p>
                    <p className="text-2xl font-bold">{todayInvoices.length}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(todayTotal)}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">إجمالي الربح</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(todayProfit)}</p>
                  </div>
                </div>

                {todayInvoices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد مبيعات اليوم</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الفاتورة</TableHead>
                        <TableHead>الوقت</TableHead>
                        <TableHead>العميل</TableHead>
                        <TableHead>الإجمالي</TableHead>
                        <TableHead>الربح</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>#{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            {new Date(invoice.invoiceDate).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>{invoice.customerName || 'نقدي'}</TableCell>
                          <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                          <TableCell className="text-green-600">
                            {formatCurrency(invoice.totalProfit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monthly Sales */}
          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  مبيعات الشهر الحالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">عدد الفواتير</p>
                    <p className="text-2xl font-bold">{monthInvoices.length}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(monthTotal)}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">إجمالي الربح</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(monthProfit)}</p>
                  </div>
                </div>

                {monthInvoices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد مبيعات هذا الشهر</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الفاتورة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>العميل</TableHead>
                        <TableHead>الإجمالي</TableHead>
                        <TableHead>الربح</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>#{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            {new Date(invoice.invoiceDate).toLocaleDateString('ar-EG')}
                          </TableCell>
                          <TableCell>{invoice.customerName || 'نقدي'}</TableCell>
                          <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                          <TableCell className="text-green-600">
                            {formatCurrency(invoice.totalProfit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Low Stock */}
          <TabsContent value="lowstock">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  أصناف تحتاج إعادة طلب
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    جميع الأصناف متوفرة بكميات كافية
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الصنف</TableHead>
                        <TableHead>الكمية الحالية</TableHead>
                        <TableHead>الحد الأدنى</TableHead>
                        <TableHead>العجز</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{product.quantity}</Badge>
                          </TableCell>
                          <TableCell>{product.minimumQuantity}</TableCell>
                          <TableCell className="text-destructive font-medium">
                            {product.minimumQuantity - product.quantity}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Differences */}
          <TabsContent value="audits">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  تقرير فروق الجرد
                </CardTitle>
              </CardHeader>
              <CardContent>
                {audits.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد عمليات جرد معتمدة
                  </p>
                ) : (
                  <div className="space-y-6">
                    {audits.map((audit) => {
                      const items = getInventoryAuditItems(audit.id).filter(i => i.difference !== 0);
                      if (items.length === 0) return null;
                      
                      return (
                        <div key={audit.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">
                              جرد {new Date(audit.auditDate).toLocaleDateString('ar-EG')}
                            </h4>
                            <Badge>{items.length} فروقات</Badge>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>الصنف</TableHead>
                                <TableHead>كمية النظام</TableHead>
                                <TableHead>الكمية الفعلية</TableHead>
                                <TableHead>الفرق</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.productName}</TableCell>
                                  <TableCell>{item.systemQuantity}</TableCell>
                                  <TableCell>{item.actualQuantity}</TableCell>
                                  <TableCell>
                                    <Badge variant={item.difference > 0 ? 'default' : 'destructive'}>
                                      {item.difference > 0 ? '+' : ''}{item.difference}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
