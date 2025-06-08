
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, ArrowDownLeft, ArrowUpRight, PieChart, BarChart2, PiggyBank, ListChecks } from "lucide-react";
import AddTransactionDialog from "@/components/dashboard/AddTransactionDialog";
import SpendingCharts from "@/components/dashboard/SpendingCharts";
import BudgetOverview from "@/components/dashboard/BudgetOverview";
import RecentTransactionsList from "@/components/dashboard/RecentTransactionsList";
import { useAppData } from "@/contexts/app-data-context";
import { useState, useMemo, useEffect } from "react";
import type { Transaction } from "@/lib/types";

// Helper to format currency consistently
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function DashboardPage() {
  const { transactions, categories } = useAppData();
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [clientLoaded, setClientLoaded] = useState(false);

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  const summaryStats = useMemo(() => {
    if (!clientLoaded) return { totalIncome: 0, totalExpenses: 0, netBalance: 0 };
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
    };
  }, [transactions, clientLoaded]);

  if (!clientLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <PiggyBank className="h-12 w-12 text-primary animate-bounce" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your financial insights...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Dashboard</h1>
        <Button onClick={() => setIsAddTransactionOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
            <ArrowUpRight className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{formatCurrency(summaryStats.totalIncome)}</div>
            <p className="text-xs text-muted-foreground">All income received</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            <ArrowDownLeft className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{formatCurrency(summaryStats.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">All expenses paid</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Balance</CardTitle>
            <PiggyBank className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${summaryStats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summaryStats.netBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Your current financial standing</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Budgets */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <BarChart2 className="h-6 w-6 text-primary" /> Spending Analysis
            </CardTitle>
            <CardDescription>Visual breakdown of your income and expenses.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {transactions.length > 0 ? <SpendingCharts /> : <p className="text-muted-foreground text-center py-8">No transaction data yet to display charts.</p>}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <ListChecks className="h-6 w-6 text-accent" /> Budget Goals
            </CardTitle>
            <CardDescription>Track your progress towards monthly budget goals.</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetOverview />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-700">Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTransactionsList />
        </CardContent>
        {transactions.length === 0 && <CardFooter><p className="text-muted-foreground text-center w-full pb-4">No transactions recorded yet.</p></CardFooter>}
      </Card>

      <AddTransactionDialog isOpen={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen} />
    </div>
  );
}

