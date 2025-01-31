import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { useCountdown } from "@/hooks/use-countdown"
import { cn } from "@/lib/utils"

export default function MobileLeads() {
  const { seconds, formattedTime, isActive, stopTimer } = useCountdown(30)

  // Calculate the progress percentage
  const progress = (seconds / 30) * 100

  const handleAccept = () => {
    stopTimer()
    console.log("Accepted")
  }

  const handleReject = () => {
    stopTimer()
    console.log("Rejected")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-6">
          {/* Timer Circle with Progress */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="60" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={cn(
                  "text-3xl font-bold transition-colors",
                  isActive ? "text-primary" : "text-destructive",
                  seconds <= 10 && isActive && "animate-pulse text-destructive",
                )}
              >
                {formattedTime}
              </span>
            </div>
          </div>

          {/* Leads Data Section */}
          <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-500">Name</h3>
              <p className="text-lg">John Smith</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-500">Email</h3>
              <p className="text-lg">john.smith@example.com</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-500">Phone</h3>
              <p className="text-lg">+1 (555) 123-4567</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 gap-4">
          <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleAccept} disabled={!isActive}>
            <Check className="w-4 h-4 mr-2" />
            Accept
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleReject} disabled={!isActive}>
            <X className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

