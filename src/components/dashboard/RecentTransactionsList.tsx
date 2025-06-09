
"use client";
import { useMemo, useState, useEffect } from 'react';
import { useAppData } from '@/contexts/app-data-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { Transaction, Category } from '@/lib/types';
import * as LucideIcons from 'lucide-react';
import AddTransactionDialog from './AddTransactionDialog'; // For editing
import { useToast } from '@/hooks/use-toast';

const { HelpCircle, Edit3, Trash2 } = LucideIcons;

const IconComponent = ({ iconName }: { iconName: string }) => {
  const Icon = (LucideIcons as any)[iconName] || HelpCircle;
  return <Icon className="h-4 w-4" />;
};

// Helper to format currency
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);


export default function RecentTransactionsList() {
  const { transactions, categories, deleteTransaction } = useAppData();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const recentTransactions = useMemo(() => {
    if (!clientMounted) return [];
    return [...transactions] // Create a shallow copy before sorting
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10); // Show latest 10 or so
  }, [transactions, clientMounted]);

  const getCategoryInfo = (categoryId: string): Partial<Category> => {
    return categories.find(c => c.id === categoryId) || { name: 'Uncategorized', icon: 'HelpCircle' };
  };
  
  const handleEdit = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (transactionId: string) => {
    // Basic confirmation, ideally use an AlertDialog
    if (window.confirm("Are you sure you want to delete this transaction?")) {
        try {
            deleteTransaction(transactionId);
            toast({ title: "Transaction Deleted", description: "The transaction has been removed." });
        } catch(e) {
            toast({ title: "Error", description: "Could not delete transaction.", variant: "destructive" });
        }
    }
  };


  if (!clientMounted) {
     return <p className="text-center text-muted-foreground py-4">Loading transactions...</p>;
  }

  if (recentTransactions.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No transactions yet. Add one to get started!</p>;
  }

  return (
    <>
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentTransactions.map(transaction => {
            const categoryInfo = getCategoryInfo(transaction.categoryId);
            const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
            return (
              <TableRow key={transaction.id} className="hover:bg-muted/50">
                <TableCell className="whitespace-nowrap">{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">{transaction.description}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="flex items-center gap-1.5 w-fit" style={{ borderColor: categoryInfo.color, color: categoryInfo.color }}>
                    <IconComponent iconName={categoryInfo.icon!} />
                    {categoryInfo.name}
                  </Badge>
                </TableCell>
                <TableCell className={`text-right font-semibold whitespace-nowrap ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(transaction)}>
                        <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(transaction.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
    {transactionToEdit && (
        <AddTransactionDialog 
            isOpen={isEditDialogOpen} 
            onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) setTransactionToEdit(null); // Clear selection when dialog closes
            }}
            transactionToEdit={transactionToEdit}
        />
    )}
    </>
  );
}
