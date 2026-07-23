import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
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
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { categoryDict } from "@/dummydata/data.js"
import { createClient } from "@/lib/supabase/client"


export default function BudgetForm( {
    initialValues, //budget instance
    onSubmit, // function to run
    create // true if create, false if edit
}) {
    const [name, setName] = useState(initialValues?.name || "")
    const [categories, setCategories] = useState([])
    const [date, setDate] = useState(initialValues?.start_datetime ? new Date(initialValues.start_datetime) : null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [budgetAmount, setBudgetAmount] = useState(initialValues?.amount_cents / 100 || '')
    const [duration, setDuration] = useState(initialValues?.duration || "1 Month")
    const [isRecurring, setRecurring] = useState(initialValues?.is_recurring || false)
    const [drawerOpen, setOpen]= useState(false)
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

        setName(initialValues.name || "")
        setDate(initialValues.start_datetime ? new Date(initialValues.start_datetime) : null)
        setBudgetAmount(initialValues.amount_cents / 100 || 0)
        setDuration(initialValues.duration || "1 Month")
        setRecurring(initialValues.is_recurring || false)
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
        //const formData = new formData(e.target)
        const amount = Math.round(Number(budgetAmount)*100)
        const start_date = date.toISOString()// how to save as timestampz?
        //const end_date = calculateEndDate(date, duration).toISOString()

        const payload = {
            name : name,
            category_id: selectedCategory.id,
            amount_cents: amount,
            start_datetime: start_date,
            //end_datetime: end_date,
            duration: duration,
            is_recurring: isRecurring
        }
        onSubmit(payload)
    }
    
    return (
        <div className="w-full max-w-md p-5 text-base">
            <form onSubmit = {handleSubmit}>

                <FieldGroup className="max-w-sm pb-5">
                    <Field>
                        <FieldLabel>Budget Name</FieldLabel>
                        <Input className = "text-base font-normal h-11" value = {name} onChange={(e) => setName(e.target.value)} id="budget-name" placeholder="Meow..." type="text" required/>
                    </Field>
                </FieldGroup>

                <FieldGroup className="grid max-w-sm grid-cols-2 pb-5">
                    <Field>
                        <FieldLabel>Category</FieldLabel>
                        <Drawer open = {drawerOpen} onOpenChange = {setOpen}> 
                            <DrawerTrigger asChild>
                                <Button variant="outline" className = "justify-start h-11 font-normal">
                                    {selectedCategory? 
                                    (<div className = "flex items-center text-base gap-1.5"><img src={categoryDict[selectedCategory.id]}/><span>{selectedCategory.category_name}</span></div>) 
                                    : (<div className = "text-muted-foreground text-base font-normal">Select Category</div>)}
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <div className="grid grid-cols-4 gap-4 m-5">
                                {categories.map(category => (
                                    <button className="flex flex-col items-center gap-2 border p-3"
                                        key={category.id}
                                        type="button"
                                        onClick={() =>{ setSelectedCategory(category) 
                                                        setOpen(false)}}
                                    >
                                    <img
                                        src={categoryDict[category.id]}
                                        alt={category.category_name}
                                        className="h-8 w-8"
                                    />
                                    <span className="text-sm">
                                        {category.category_name}
                                    </span>
                                    </button>
                                ))}
                                </div>
                            </DrawerContent>

                        </Drawer>
                    </Field>
                    <Field>
                        <FieldLabel>Amount</FieldLabel>
                        <Input className = "text-base font-normal h-11" value = {budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} id="budget-amount" placeholder="Enter amount" type="number" inputMode="decimal" step="0.01"/>
                    </Field>
                    <Field>
                        <FieldLabel>Start Date</FieldLabel> 
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button id="budget-start-date" variant = "outline" className="justify-between text-base font-normal text-left h-11">
                                   {date ? (<div className="text-base">{format(date, "PPP")}</div>): (<div className = "text-muted-foreground ">Pick a Date</div>)}
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
                        <FieldLabel>Duration</FieldLabel>
                        <Select value={duration} onValueChange={setDuration} className="w-full">
                            <SelectTrigger id = "budget-duration" className="w-full">
                                <SelectValue placeholder = "Select duration" />
                            </SelectTrigger>
                            <SelectContent>
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
                
                <FieldGroup className = "grid max-w-sm grid-cols-2 pt-5 pb-5">
                    <Field className="self-start">
                        <div className="flex items-center gap-2">
                            <FieldLabel>Recurrence</FieldLabel>
                            <Switch checked = {isRecurring} onCheckedChange ={setRecurring} id="budget-recurrence" />
                        </div>
                    </Field>
                </FieldGroup>

                <FieldSeparator className="pb-5"/>

                <div className="mt-4 float-right">
                    <Button variant="outline" className="mt-4 mr-4" onClick={() => window.location.href = "/budgets"}>
                        Cancel
                    </Button>
                    { create ? 
                    <Button type="submit" className="mt-4">
                        Create Budget
                    </Button>  :    
                    <Button type="submit" className="mt-4">
                        Edit Budget
                    </Button> }

                </div>

            </form>
        </div> 
    )

}