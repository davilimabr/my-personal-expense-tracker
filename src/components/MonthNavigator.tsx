import { ChevronLeft, ChevronRight } from "lucide-react"
import { useData } from "../context/DataContext"
import { Button } from "./ui/button"
import { addMonths, format, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"

export function MonthNavigator() {
    const { currentDate, setCurrentDate } = useData()

    const handlePrevious = () => setCurrentDate(subMonths(currentDate, 1))
    const handleNext = () => setCurrentDate(addMonths(currentDate, 1))

    return (
        <div className="flex items-center gap-4 bg-card border border-border rounded-lg p-1 shadow-sm">
            <Button variant="ghost" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
