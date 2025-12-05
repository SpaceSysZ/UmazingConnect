"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"

interface ClaimSponsorDialogProps {
  clubId: string
  clubName: string
  userId: string
  userName: string
  userEmail: string
  userType?: string
  onClaimSuccess: () => void
}

export function ClaimSponsorDialog({ 
  clubId, 
  clubName, 
  userId, 
  userName, 
  userEmail,
  userType,
  onClaimSuccess 
}: ClaimSponsorDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if user is verified teacher (email in curated list)
  const [isVerifiedTeacher, setIsVerifiedTeacher] = useState(false)
  const [isAlreadySponsor, setIsAlreadySponsor] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setCheckingStatus(true)
        
        // Check if email is in teacher list
        const teacherResponse = await fetch(`/api/users/check-teacher?email=${encodeURIComponent(userEmail)}`)
        if (teacherResponse.ok) {
          const teacherData = await teacherResponse.json()
          setIsVerifiedTeacher(teacherData.isTeacher)
        }

        // Check if already a sponsor of this club
        const sponsorResponse = await fetch(`/api/clubs/${clubId}/check-sponsor?userId=${userId}`)
        if (sponsorResponse.ok) {
          const sponsorData = await sponsorResponse.json()
          setIsAlreadySponsor(sponsorData.isSponsor)
        }
      } catch (error) {
        console.error("Error checking status:", error)
      } finally {
        setCheckingStatus(false)
      }
    }
    checkStatus()
  }, [userEmail, userId, clubId])

  const handleClaim = async () => {
    if (!isConfirmed) {
      alert("Please confirm that you are a sponsor/teacher of this club")
      return
    }

    if (!isVerifiedTeacher) {
      alert("Only verified teachers can claim clubs as sponsors. Please contact an administrator.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/clubs/${clubId}/claim-sponsor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          confirmed: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || "You are now a sponsor of this club!")
        setIsOpen(false)
        setIsConfirmed(false)
        onClaimSuccess()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to claim club as sponsor")
      }
    } catch (error) {
      console.error("Error claiming club as sponsor:", error)
      alert("Failed to claim club as sponsor. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show button if already a sponsor or not a teacher
  if (checkingStatus) return null
  if (isAlreadySponsor) return null
  if (!isVerifiedTeacher) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Shield className="h-4 w-4 mr-2" />
          Claim as Sponsor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
            Claim as Sponsor - {clubName}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Claim this club as a faculty sponsor/advisor. You will be able to moderate and approve leadership changes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {isVerifiedTeacher ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3 flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-green-800">
                <p className="font-medium">Verified Teacher Account</p>
                <p>Your account is verified as a teacher. You can claim clubs as a sponsor.</p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-red-800">
                <p className="font-medium">Not Verified</p>
                <p>Only verified teacher accounts can claim clubs as sponsors. Please contact an administrator.</p>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 sm:p-3 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs sm:text-sm text-yellow-800">
              <p className="font-medium">Sponsor Role:</p>
              <p>As a sponsor, you will oversee the club but not manage day-to-day operations. You will approve leadership changes and moderate content.</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3">
            <p className="text-xs sm:text-sm text-blue-800">
              <span className="font-medium">Claiming as:</span> {userName}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Email: {userEmail}
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="confirm-sponsor"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
              disabled={!isVerifiedTeacher}
              className="mt-0.5 h-4 w-4 border-2 border-solid border-slate-900 data-[state=checked]:border-primary"
            />
            <div className="grid gap-1 leading-none flex-1">
              <label
                htmlFor="confirm-sponsor"
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I confirm that I am a faculty sponsor/advisor of this club
              </label>
              <p className="text-xs text-muted-foreground">
                I acknowledge that I will oversee this club and approve leadership changes.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 h-9 sm:h-10 text-sm border-2"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClaim}
              className="flex-1 h-9 sm:h-10 text-sm border-2"
              disabled={!isConfirmed || isLoading || !isVerifiedTeacher}
            >
              {isLoading ? "Claiming..." : "Claim as Sponsor"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
