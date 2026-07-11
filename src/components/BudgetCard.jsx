import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import { categoryDict } from "@/dummydata/data";
import { useNavigate } from "react-router-dom";


//for each budget, query transactions matching category within timeframe. Add up total. 
export default function BudgetCard({ budget, period, amount_spent}) { 
    const navigate = useNavigate()
    const progress = amount_spent / budget.amount_cents // both in cents
    const start = period.start
    const end = period.end
    const now = new Date()
    const timeProgress =(now - start) / (end - start)
    const clampedTime = Math.min(Math.max(timeProgress, 0), 1)
    function formatDate(dateString) {
        const date = new Date(dateString)

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
        })
    }

    const getProgressColor = () => {
        if (progress > 1) return "[&>div]:bg-[var(--budget-high)]"
        if (progress > 0.8) return "[&>div]:bg-[var(--budget-mid)]"
        return "[&>div]:bg-[var(--budget-low)]"
    }

    return (
        <Card onClick = {()=> navigate(`/budget-details/${budget.id}`)} className="p-2">
            <div className="flex justify-between">
                <div className = "flex items-center gap-2">
                    <img src = {categoryDict[budget.category_id]} />
                    <p className="text-sm font-semibold">{budget.name}</p>
                    <p className="text-sm text-gray-600 align-right"> ${(budget.amount_cents/100).toFixed(2)}</p>
                    {budget.is_recurring && (
                       <Badge variant="secondary" className="text-xs">Recurring</Badge>
                    )}
                </div>
                <p className="text-sm text-gray-600 align-right"> {Math.round(progress * 100)}% </p>
            </div>
 
            <Progress
                value={Math.min(progress * 100, 100)}
                className= {`h-2 ${getProgressColor()}`}
            />
            <div className="space-y-1.5">
                <div className="relative h-1 w-full flex items-center">
                    <div className="h-0.5 bg-gray-300" style={{ width: `${clampedTime * 100}%` }}/>
                    <div className="flex-1 h-1.5 bg-[radial-gradient(gray_1px,transparent_1px)] bg-[length:6px_6px] opacity-50" />
                </div>

                <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatDate(start)}</span>
                    <span>{formatDate(end)}</span>
                </div>
            </div>
        </Card>
    )
}


