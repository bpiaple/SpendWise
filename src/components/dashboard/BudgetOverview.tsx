
"use client";
import { useMemo, useState, useEffect } from 'react';
import { useAppData } from '@/contexts/app-data-context';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PlusCircle, Edit3, Trash2, Target } from 'lucide-react';
import type { Budget } from '@/lib/types';
import { useToast } from '../ui/use-toast';
import { format } from 'date-fns';

const budgetFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
});
type BudgetFormValues = z.infer<typeof budgetFormSchema>;

// Helper to format currency
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function BudgetOverview() {
  const { budgets, categories, transactions, addBudget, updateBudget, deleteBudget } = useAppData();
  const { toast } = useToast();
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: { categoryId: "", amount: 0 },
  });

  const currentMonth = format(new Date(), "yyyy-MM");

  const monthlyBudgets = useMemo(() => {
    if (!clientMounted) return [];
    return budgets.filter(b => b.month === currentMonth);
  }, [budgets, currentMonth, clientMounted]);

  const budgetProgressData = useMemo(() => {
    if (!clientMounted) return [];
    return monthlyBudgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      const spent = transactions
        .filter(t => t.categoryId === budget.categoryId && t.type === 'expense' && format(new Date(t.date), "yyyy-MM") === currentMonth)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return {
        ...budget,
        categoryName: category?.name || 'Unknown Category',
        categoryIcon: category?.icon || 'HelpCircle',
        spent,
        progress: Math.min(progress, 100), // Cap progress at 100% visually
        isOverBudget: spent > budget.amount,
      };
    }).sort((a,b) => (a.categoryName || "").localeCompare(b.categoryName || ""));
  }, [monthlyBudgets, categories, transactions, currentMonth, clientMounted]);

  const openAddBudgetDialog = () => {
    setEditingBudget(null);
    form.reset({ categoryId: "", amount: 0 });
    setIsBudgetDialogOpen(true);
  };

  const openEditBudgetDialog = (budget: Budget) => {
    setEditingBudget(budget);
    form.reset({ categoryId: budget.categoryId, amount: budget.amount });
    setIsBudgetDialogOpen(true);
  };

  const handleBudgetSubmit = (data: BudgetFormValues) => {
    try {
      if (editingBudget) {
        updateBudget({ ...editingBudget, ...data, month: currentMonth });
        toast({ title: "Budget Updated", description: "Budget goal successfully updated." });
      } else {
        const existingBudgetForCategory = monthlyBudgets.find(b => b.categoryId === data.categoryId);
        if (existingBudgetForCategory) {
            toast({ title: "Budget Exists", description: `A budget for this category already exists this month. Edit the existing one.`, variant: "destructive" });
            return;
        }
        addBudget({ ...data, month: currentMonth });
        toast({ title: "Budget Set", description: "New budget goal successfully set." });
      }
      setIsBudgetDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleDeleteBudget = (budgetId: string) => {
    try {
        deleteBudget(budgetId);
        toast({ title: "Budget Deleted", description: "Budget goal removed." });
    } catch (error) {
        toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (!clientMounted) return <p className="text-center text-muted-foreground py-4">Loading budgets...</p>;


  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-4">
      {budgetProgressData.length === 0 ? (
        <div className="text-center text-muted-foreground py-6">
          <Target className="mx-auto h-12 w-12 mb-2 text-gray-400" />
          <p>No budget goals set for this month.</p>
          <p className="text-sm">Click below to add your first budget!</p>
        </div>
      ) : (
        budgetProgressData.map(item => (
          <div key={item.id} className="mb-3 p-3 rounded-md border bg-card hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">{item.categoryName}</span>
              <div className="text-xs">
                <span className={item.isOverBudget ? "text-red-500 font-semibold" : "text-gray-600"}>
                  {formatCurrency(item.spent)}
                </span> / {formatCurrency(item.amount)}
              </div>
            </div>
            <Progress value={item.progress} className={`h-2 ${item.isOverBudget ? '[&>div]:bg-red-500' : '[&>div]:bg-primary'}`} />
             <div className="mt-2 flex justify-end space-x-2">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditBudgetDialog(item)}>
                    <Edit3 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDeleteBudget(item.id)}>
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
          </div>
        ))
      )}
      <Button onClick={openAddBudgetDialog} variant="outline" className="w-full mt-4 border-dashed hover:border-primary hover:text-primary">
        <PlusCircle className="mr-2 h-4 w-4" /> Set New Budget Goal
      </Button>

      <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>{editingBudget ? "Edit" : "Set"} Budget Goal for {format(new Date(), "MMMM yyyy")}</DialogTitle>
            <DialogDescription>
              Define how much you plan to spend in a category this month.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleBudgetSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingBudget}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <Input type="number" placeholder="Budget amount" {...field} step="0.01" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                 </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingBudget ? "Update" : "Set"} Budget</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

