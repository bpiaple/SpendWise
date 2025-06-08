
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/contexts/app-data-context";
import type { CategorizeTransactionOutput } from "@/ai/flows/categorize-transaction";
import { AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";

interface AiCategorizationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  suggestion: CategorizeTransactionOutput;
  transactionDescription: string;
  onApprove: (approvedCategoryId: string) => void;
  currentCategoryId: string; // The category initially selected by user or default
}

export default function AiCategorizationDialog({
  isOpen,
  onOpenChange,
  suggestion,
  transactionDescription,
  onApprove,
  currentCategoryId,
}: AiCategorizationDialogProps) {
  const { categories } = useAppData();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(currentCategoryId);

  useEffect(() => {
    // Try to find a category that matches the AI's suggested name
    const suggestedCat = categories.find(c => c.name.toLowerCase() === suggestion.suggestedCategory.toLowerCase() && c.type === 'expense');
    if (suggestedCat) {
      setSelectedCategoryId(suggestedCat.id);
    } else {
        // Fallback to current user-selected category or first available if not found
        const defaultCat = categories.find(c => c.id === currentCategoryId && c.type === 'expense') || categories.find(c => c.type === 'expense');
        setSelectedCategoryId(defaultCat ? defaultCat.id : '');
    }
  }, [suggestion, categories, currentCategoryId]);
  
  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'all');

  const handleApprove = () => {
    onApprove(selectedCategoryId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lightbulb className="mr-2 h-6 w-6 text-yellow-500" />
            AI Category Suggestion
          </DialogTitle>
          <DialogDescription>
            Our AI has analyzed your transaction: <span className="font-semibold">{transactionDescription}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 space-y-3 p-4 border rounded-lg bg-background/50">
            <p className="text-sm">
                <span className="font-semibold">AI Suggests:</span> {suggestion.suggestedCategory}
            </p>
            <div className={`flex items-start text-sm p-3 rounded-md ${suggestion.deviationFromPatterns ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                {suggestion.deviationFromPatterns ? 
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 shrink-0" /> : 
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
                }
                <span><span className="font-semibold">Analysis:</span> {suggestion.reasoning}</span>
            </div>
        </div>

        <div className="space-y-2">
            <label htmlFor="category-select" className="text-sm font-medium">Confirm or change category:</label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger id="category-select">
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
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApprove} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Approve & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
