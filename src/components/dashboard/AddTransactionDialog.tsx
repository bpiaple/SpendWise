
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/contexts/app-data-context";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Transaction } from "@/lib/types";
import { categorizeTransaction, type CategorizeTransactionInput } from "@/ai/flows/categorize-transaction";
import AiCategorizationDialog from "./AiCategorizationDialog";
import React, { useState }_ from "react";

const transactionFormSchema = z.object({
  description: z.string().min(1, { message: "Description is required." }),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  date: z.date({ required_error: "Date is required." }),
  type: z.enum(["income", "expense"], { required_error: "Type is required." }),
  categoryId: z.string().min(1, { message: "Category is required." }),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface AddTransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  transactionToEdit?: Transaction | null;
}

export default function AddTransactionDialog({ isOpen, onOpenChange, transactionToEdit }: AddTransactionDialogProps) {
  const { categories, addTransaction, updateTransaction, getHistoricalSpendingPatterns } = useAppData();
  const { toast } = useToast();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<Awaited<ReturnType<typeof categorizeTransaction>> | null>(null);
  const [transactionDataForAi, setTransactionDataForAi] = useState<TransactionFormValues | null>(null);
  const [isAiDialogVisible, setIsAiDialogVisible] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: transactionToEdit
      ? {
          ...transactionToEdit,
          date: new Date(transactionToEdit.date),
          amount: Math.abs(transactionToEdit.amount), // Amount is stored as positive
        }
      : {
          description: "",
          amount: 0,
          date: new Date(),
          type: "expense",
          categoryId: "",
        },
  });
  
  React.useEffect(() => {
    if (transactionToEdit) {
      form.reset({
        ...transactionToEdit,
        date: new Date(transactionToEdit.date),
        amount: Math.abs(transactionToEdit.amount),
      });
    } else {
      form.reset({
        description: "",
        amount: 0,
        date: new Date(),
        type: "expense",
        categoryId: "",
      });
    }
  }, [transactionToEdit, form, isOpen]);


  const onSubmit = async (data: TransactionFormValues) => {
    // If it's an expense and not already AI categorized (or being edited)
    if (data.type === 'expense' && (!transactionToEdit || !transactionToEdit.isCategorizedByAI)) {
      setIsAiLoading(true);
      setTransactionDataForAi(data);
      try {
        const aiInput: CategorizeTransactionInput = {
          transactionDescription: data.description,
          historicalSpendingPatterns: getHistoricalSpendingPatterns(),
        };
        const suggestion = await categorizeTransaction(aiInput);
        setAiSuggestion(suggestion);
        setIsAiDialogVisible(true); // Show AI suggestion dialog
      } catch (error) {
        console.error("AI categorization failed:", error);
        toast({ title: "AI Error", description: "Could not get AI suggestion. Please categorize manually.", variant: "destructive" });
        // Proceed with manual categorization if AI fails
        saveTransaction(data, data.categoryId);
      } finally {
        setIsAiLoading(false);
      }
    } else {
      // For income or edits of AI-categorized items, save directly
      saveTransaction(data, data.categoryId);
    }
  };

  const saveTransaction = (data: TransactionFormValues, categoryIdToSave: string) => {
    const finalAmount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
    const transactionPayload = {
      description: data.description,
      amount: finalAmount, // Storing expenses as negative
      date: data.date.toISOString(),
      type: data.type,
      categoryId: categoryIdToSave,
      isCategorizedByAI: aiSuggestion ? true : (transactionToEdit?.isCategorizedByAI || false),
      needsReview: aiSuggestion ? true : (transactionToEdit?.needsReview || false),
    };

    try {
      if (transactionToEdit) {
        updateTransaction({ ...transactionPayload, id: transactionToEdit.id, userId: transactionToEdit.userId });
        toast({ title: "Transaction Updated", description: "Your transaction has been successfully updated." });
      } else {
        addTransaction(transactionPayload);
        toast({ title: "Transaction Added", description: "Your transaction has been successfully added." });
      }
      form.reset();
      onOpenChange(false);
      setAiSuggestion(null);
      setTransactionDataForAi(null);
    } catch (error) {
       toast({ title: "Save Failed", description: (error as Error).message, variant: "destructive" });
    }
  };
  
  const handleAiApproval = (approvedCategory: string) => {
    if (transactionDataForAi) {
      saveTransaction(transactionDataForAi, approvedCategory);
    }
    setIsAiDialogVisible(false);
  };


  const currentType = form.watch("type");
  const filteredCategories = categories.filter(cat => cat.type === currentType || cat.type === 'all');

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { form.reset(); setAiSuggestion(null); setTransactionDataForAi(null); } onOpenChange(open); }}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>{transactionToEdit ? "Edit" : "Add New"} Transaction</DialogTitle>
            <DialogDescription>
              {transactionToEdit ? "Update the details of your transaction." : "Enter the details of your new income or expense."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Groceries, Salary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.map(category => (
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
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isAiLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isAiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {transactionToEdit ? "Update" : "Add"} Transaction
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {aiSuggestion && transactionDataForAi && (
         <AiCategorizationDialog
            isOpen={isAiDialogVisible}
            onOpenChange={setIsAiDialogVisible}
            suggestion={aiSuggestion}
            transactionDescription={transactionDataForAi.description}
            onApprove={handleAiApproval}
            currentCategoryId={transactionDataForAi.categoryId}
        />
      )}
    </>
  );
}

