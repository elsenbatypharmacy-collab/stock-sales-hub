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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, ClipboardList, CheckCircle, Eye } from 'lucide-react';
import { InventoryAudit as IAudit, InventoryAuditItem } from '@/types';
import { 
  getInventoryAudits, createInventoryAudit, getInventoryAuditItems,
  updateAuditItem, approveAudit 
} from '@/services/storage';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

export default function InventoryAudit() {
  const [audits, setAudits] = useState<IAudit[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<IAudit | null>(null);
  const [auditItems, setAuditItems] = useState<InventoryAuditItem[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = () => {
    setAudits(getInventoryAudits().sort((a, b) => 
      new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime()
    ));
  };

  const handleCreateAudit = () => {
    createInventoryAudit(notes);
    toast.success('تم إنشاء الجرد بنجاح');
    setIsCreateDialogOpen(false);
    setNotes('');
    loadAudits();
  };

  const openAuditDialog = (audit: IAudit) => {
    setSelectedAudit(audit);
    setAuditItems(getInventoryAuditItems(audit.id));
    setIsAuditDialogOpen(true);
  };

  const handleUpdateItem = (itemId: string, actualQuantity: number) => {
    updateAuditItem(itemId, actualQuantity);
    setAuditItems(getInventoryAuditItems(selectedAudit!.id));
  };

  const handleApproveAudit = () => {
    if (!selectedAudit) return;
    
    if (confirm('هل أنت متأكد من اعتماد هذا الجرد؟ سيتم تحديث كميات المخزون.')) {
      approveAudit(selectedAudit.id);
      toast.success('تم اعتماد الجرد بنجاح');
      setIsAuditDialogOpen(false);
      loadAudits();
    }
  };

  const totalDifference = auditItems.reduce((sum, item) => sum + Math.abs(item.difference), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">الجرد الدوري</h1>
            <p className="text-muted-foreground">إدارة عمليات جرد المخزون</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 ml-2" />
            جرد جديد
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              سجل الجرد
            </CardTitle>
          </CardHeader>
          <CardContent>
            {audits.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  لا توجد عمليات جرد. ابدأ بإنشاء جرد جديد.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>ملاحظات</TableHead>
                    <TableHead>تاريخ الاعتماد</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell>
                        {new Date(audit.auditDate).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={audit.status === 'approved' ? 'default' : 'secondary'}>
                          {audit.status === 'approved' ? 'معتمد' : 'مسودة'}
                        </Badge>
                      </TableCell>
                      <TableCell>{audit.notes || '-'}</TableCell>
                      <TableCell>
                        {audit.approvedAt 
                          ? new Date(audit.approvedAt).toLocaleDateString('ar-EG')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openAuditDialog(audit)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Audit Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء جرد جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                سيتم إنشاء جرد جديد يحتوي على جميع الأصناف الحالية.
                يمكنك تعديل الكميات الفعلية ثم اعتماد الجرد لتحديث المخزون.
              </p>
              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف ملاحظات للجرد"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateAudit}>إنشاء الجرد</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Audit Details Dialog */}
        <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>
                  جرد {selectedAudit && new Date(selectedAudit.auditDate).toLocaleDateString('ar-EG')}
                </span>
                <Badge variant={selectedAudit?.status === 'approved' ? 'default' : 'secondary'}>
                  {selectedAudit?.status === 'approved' ? 'معتمد' : 'مسودة'}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            {selectedAudit && (
              <div className="space-y-4">
                {totalDifference > 0 && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-700">
                      يوجد فروقات في {auditItems.filter(i => i.difference !== 0).length} صنف
                    </p>
                  </div>
                )}

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
                    {auditItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.systemQuantity}</TableCell>
                        <TableCell>
                          {selectedAudit.status === 'draft' ? (
                            <Input
                              type="number"
                              min="0"
                              value={item.actualQuantity}
                              onChange={(e) => handleUpdateItem(item.id, parseInt(e.target.value) || 0)}
                              className="w-24"
                            />
                          ) : (
                            item.actualQuantity
                          )}
                        </TableCell>
                        <TableCell>
                          {item.difference !== 0 ? (
                            <Badge variant={item.difference > 0 ? 'default' : 'destructive'}>
                              {item.difference > 0 ? '+' : ''}{item.difference}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {selectedAudit.status === 'draft' && (
                  <div className="flex justify-end">
                    <Button onClick={handleApproveAudit} className="gap-2">
                      <CheckCircle className="h-4 w-4" />
                      اعتماد الجرد
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
