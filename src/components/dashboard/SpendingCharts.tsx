
"use client";
import { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppData } from '@/contexts/app-data-context';
import type { Transaction } from '@/lib/types';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't render label if slice is too small

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};


export default function SpendingCharts() {
  const { transactions, categories } = useAppData();
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);
  
  const expenseTransactions = useMemo(() => transactions.filter(t => t.type === 'expense'), [transactions]);

  const chartData = useMemo(() => {
    if (!clientMounted || expenseTransactions.length === 0) return [];
    
    const dataByCategory = expenseTransactions.reduce((acc, transaction) => {
      const category = categories.find(c => c.id === transaction.categoryId);
      const categoryName = category ? category.name : 'Uncategorized';
      const categoryColor = category ? category.color : 'hsl(0, 0%, 80%)'; // Default color for uncategorized
      
      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, value: 0, color: categoryColor };
      }
      acc[categoryName].value += Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>);

    return Object.values(dataByCategory).sort((a,b) => b.value - a.value); // Sort for better readability in charts
  }, [expenseTransactions, categories, clientMounted]);

  if (!clientMounted || expenseTransactions.length === 0) {
    // This will be handled by parent component, but as a fallback:
    // return <p className="text-center text-muted-foreground py-4">No expense data available for charts.</p>;
    return null; // Parent shows this message
  }


  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={chartType} onValueChange={(value: 'pie' | 'bar') => setChartType(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pie">Pie Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={50} interval={0} />
              <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
              <RechartsTooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
              <Legend />
              <Bar dataKey="value" name="Spent" radius={[4, 4, 0, 0]}>
                 {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

