"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Mail, GraduationCap, Users, Crown, Shield } from "lucide-react"
import { UserProfile } from "@/lib/auth-config"
import Link from "next/link"

interface UserSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserProfile
}

interface UserClub {
  id: string
  name: string
  image_url: string | null
  memberRole: string
}

export function UserSettingsDialog({ open, onOpenChange, user }: UserSettingsDialogProps) {
  const [clubs, setClubs] = useState<UserClub[]>([])
  const [isTeacher, setIsTeacher] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && user) {
      loadUserData()
    }
  }, [open, user])

  const loadUserData = async () => {
    try {
      setLoading(true)

      // Check if teacher
      const teacherResponse = await fetch(`/api/users/check-teacher?email=${encodeURIComponent(user.email)}`)
      if (teacherResponse.ok) {
        const teacherData = await teacherResponse.json()
        setIsTeacher(teacherData.isTeacher)
      }

      // Get user's clubs
      const clubsResponse = await fetch(`/api/clubs?userId=${user.id}`)
      if (clubsResponse.ok) {
        const clubsData = await clubsResponse.json()
        const userClubs = clubsData.data.filter((club: any) => club.is_joined)
        setClubs(userClubs)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'sponsor': return Shield
      case 'president': return Crown
      case 'vice_president': return Shield
      case 'officer': return Users
      default: return Users
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'sponsor': return 'Sponsor'
      case 'president': return 'President'
      case 'vice_president': return 'Vice President'
      case 'officer': return 'Officer'
      default: return 'Member'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'sponsor': return 'bg-blue-100 text-blue-800'
      case 'president': return 'bg-sky-100 text-sky-800'
      case 'vice_president': return 'bg-blue-100 text-blue-800'
      case 'officer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile & Settings</DialogTitle>
          <DialogDescription>
            View your account information and club memberships
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-xl">
                {user.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {isTeacher ? (
                  <Badge className="bg-blue-100 text-blue-800">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Teacher
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <User className="h-3 w-3 mr-1" />
                    {user.role}
                  </Badge>
                )}
                {user.grade && (
                  <Badge variant="outline" className="text-xs">
                    Grade {user.grade}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Clubs Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                My Clubs ({clubs.length})
              </h4>
            </div>

            {loading ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Loading clubs...
              </div>
            ) : clubs.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {clubs.map((club) => {
                  const RoleIcon = getRoleIcon(club.memberRole)
                  return (
                    <Link key={club.id} href={`/clubs/${club.id}`} onClick={() => onOpenChange(false)}>
                      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={club.image_url || "/placeholder.svg"}
                              alt={club.name}
                              className="h-10 w-10 rounded object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{club.name}</p>
                              <Badge className={`${getRoleBadgeColor(club.memberRole)} text-xs mt-1`}>
                                <RoleIcon className="h-2.5 w-2.5 mr-1" />
                                {getRoleLabel(club.memberRole)}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>You haven't joined any clubs yet</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
