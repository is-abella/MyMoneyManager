import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldDescription
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { categoryDict } from "@/dummydata/data.js"
import { createClient } from "@/lib/supabase/client"


export default function TransactionForm( {
    initialValues, //budget instance
    onSubmit, // function to run
    create, // true if create, false if edit
    onDelete
}) {
    const [notes, setNotes] = useState(initialValues?.notes || "")
    const [categories, setCategories] = useState([])
    const [date, setDate] = useState(initialValues?.transaction_datetime ? new Date(initialValues.transaction_datetime) : new Date())
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [transactionAmount, setTransactionAmount] = useState(initialValues?.amount_cents / 100 || null)
    const [duration, setDuration] = useState(initialValues?.recurring_duration || "")
    const [isRecurring, setRecurring] = useState(initialValues?.is_recurring || false)
    const [type, setType] = useState(initialValues?.type || "")
    const [drawerOpen, setOpen]= useState(false)
    //const [editScope, setEditScope] = useState("individual") // "individual" or "all"

    const supabase = createClient()

    useEffect(()=> {
        fetchCategories()
    }, [])

    async function fetchCategories() {
        const { data, error } = await supabase
        .from("categories")
        .select("*")
        console.log(data)

        if (error) {
        console.error(error)
        return
        }
        setCategories(data)
    }

    useEffect(() => {
        if (!initialValues) return

        setNotes(initialValues.notes || "")
        setDate(initialValues.transaction_datetime ? new Date(initialValues.transaction_datetime) : null)
        setTransactionAmount(initialValues.amount_cents / 100 || 0)
        setDuration(initialValues.recurring_duration || "")
        setRecurring(initialValues.is_recurring || false)
        setType(initialValues.type || "")
    }, [initialValues])

    useEffect(() => {
        if (!categories.length || !initialValues) return
        const cat = categories.find(
            c => c.id === initialValues.category_id
        )
        setSelectedCategory(cat)
    }, [categories, initialValues])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!selectedCategory) {
            alert("Please select a category")
            return
        }
        if (!transactionAmount || Number(transactionAmount) <= 0) {
            alert("Please enter a valid amount")
            return
        }
        if (!date) {
            alert("Please pick a date")
            return
        }
        if (create && isRecurring && !duration) {
            alert("Please select a recurrence duration")
            return
        }
        //const formData = new formData(e.target)
        const amount = Math.round(Number(transactionAmount)*100)
        const transaction_datetime = date.toISOString()// how to save as timestampz?

        const payload = {
            notes : notes,
            category_id: selectedCategory.id,
            amount_cents: amount,
            transaction_datetime: transaction_datetime,
            recurring_duration: duration,
            is_recurring: isRecurring,
            type: type
        }

        onSubmit(payload) //editScope
    }

    const handleDelete = () => {
        const confirmed = window.confirm("Delete this transaction?")
        if (!confirmed) return
        onDelete()
    }

    const hasAnyChanges = useMemo(() => {
        if (!initialValues) return true // creating new, always "changed"
        return (
            notes !== (initialValues.notes || "") ||
            selectedCategory?.id !== initialValues.category_id ||
            Number(transactionAmount) !== (initialValues.amount_cents / 100) ||
            date?.toISOString() !== new Date(initialValues.transaction_datetime).toISOString()
        )
    }, [notes, selectedCategory, transactionAmount, date, initialValues])

    /* const hasRecurrenceChanges = useMemo(() => {
        if (!initialValues) return false
        return (
            isRecurring !== !!initialValues.recurring_id ||
            duration !== (initialValues.recurring_duration || "")
        )
    }, [isRecurring, duration, initialValues])*/
    
    return (
        <div className="w-full max-w-md p-5 text-base">
            <form onSubmit = {handleSubmit}>
                <FieldGroup className="grid max-w-sm grid-cols-2 pb-5">
                    <Field>
                        <FieldLabel>Category</FieldLabel>
                        <Drawer open = {drawerOpen} onOpenChange = {setOpen} > 
                            <DrawerTrigger asChild>
                                <Button variant="outline" className = "justify-start h-11 font-normal text-base">
                                    {selectedCategory? 
                                    (<div className = "flex items-center gap-1.5"><img src={categoryDict[selectedCategory.id]}/><span>{selectedCategory.category_name}</span></div>) 
                                    : (<div className = "text-muted-foreground">Select Category</div>)}
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <div className="grid grid-cols-4 gap-3 m-3">
                                {categories.map(category => (
                                    <button className="flex flex-col items-center gap-2 border p-1.5"
                                        key={category.id}
                                        type="button"
                                        onClick={() =>{ setSelectedCategory(category) 
                                        setType(category.category_type)
                                        setOpen(false)}}
                                    >
                                    <img
                                        src={categoryDict[category.id]}
                                        alt={category.category_name}
                                        className="h-8 w-8"
                                    />
                                    <span className="text-sm truncate w-full text-center">
                                        {category.category_name}
                                    </span>
                                    </button>
                                ))}
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </Field>

                    <Field>
                        <FieldLabel>Amount
                            {selectedCategory && <Badge variant="secondary" className="text-xs">{type}</Badge>}
                        </FieldLabel>
                        <Input className = "text-base font-normal h-11" value = {transactionAmount} 
                        onChange={(e) => setTransactionAmount(e.target.value)} placeholder="Enter amount" type="number" inputMode="decimal" step="0.01"/>
                    </Field>
                </FieldGroup>

                <FieldGroup className="grid max-w-sm grid-cols-2 pb-5">
                    <Field>
                        <FieldLabel>Transaction Date</FieldLabel> 
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant = "outline" className="justify-between text-left h-11 text-base font-normal">
                                    {date ? format(date, "PPP") : <span >Pick a date</span>}
                                </Button>
                            </PopoverTrigger >
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar 
                                    mode="single" 
                                    selected={date} 
                                    onSelect={setDate}
                                    defaultMonth={date}>
                                </Calendar>
                            </PopoverContent>
                        </Popover>
                    </Field>
                                  
                    <Field>
                        <FieldLabel>Notes</FieldLabel>
                        <Input className = "h-11 font-normal text-base" value = {notes} onChange={(e) => setNotes(e.target.value)}  placeholder="Meow..." type="text"/>
                    </Field>
                </FieldGroup>
                <FieldSeparator />

                { create &&
                <div>
                <FieldGroup className = "grid max-w-sm grid-cols-2 pt-5 pb-5">
                    <Field className="self-start">
                        <div className="flex items-center gap-2">
                            <FieldLabel>Recurrence</FieldLabel>
                            <Switch checked = {isRecurring} onCheckedChange ={(checked) => {setRecurring(checked)
                             !checked ? setDuration("") : {}
                            }} /> 
                        </div>
                    </Field>
       
                    <Field>
                        <FieldLabel>Duration</FieldLabel>
                        <Select value={duration} onValueChange={setDuration} disabled={!isRecurring} >
                            <SelectTrigger className="w-full h-11">
                                <SelectValue className="font-normal text-base" placeholder = "Select duration"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1 Day">1 Day</SelectItem>
                                <SelectItem value="1 Week">1 Week</SelectItem>
                                <SelectItem value="2 Weeks">2 Weeks</SelectItem>
                                <SelectItem value="1 Month">1 Month</SelectItem>
                                <SelectItem value="6 Months">6 Months</SelectItem>
                                <SelectItem value="1 Year">1 Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </FieldGroup>
                <FieldSeparator />
                </div>}


                <div className="mt-4 flex">
                    {!create &&
                    <div className="float-left">
                        <Button type="button" variant="destructive" className="mt-4 transition-colors active:accent active:scale-95" onClick = {handleDelete}> 
                            Delete 
                        </Button>
                    </div>
                    }
                
                    <div className="ml-auto flex gap-2">
                        <Button type= "button" variant="outline" className="mt-4 mr-4 transition-colors active:bg-accent active:scale-95" onClick={() => window.location.href = "/transactions"}>
                            Cancel
                        </Button>

                        { create &&
                        <Button type="submit" className="mt-4 transition-colors active:accent active:scale-95">
                            Create Transaction
                        </Button>
                        }
                            
                        {!create  &&
                            <Button type="submit" className="mt-4 ml-4 transition-colors active:accent active:scale-95" disabled={!hasAnyChanges}> 
                                Edit 
                            </Button>
                        }
                    </div>
                </div>
            </form>
        </div> 
    )
}