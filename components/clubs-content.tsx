"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Calendar,
  MapPin,
  Search,
  Palette,
  Gamepad2,
  BookOpen,
  Trophy,
  Heart,
  Code,
  Crown,
  MessageSquare,
  Upload,
  X,
  UserCog,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AdminClubImport } from "./admin-club-import"

interface Club {
  id: string
  name: string
  description: string
  category: "academic" | "arts" | "sports" | "technology" | "service" | "hobby"
  member_count: number
  meeting_time: string | null
  location: string | null
  image_url: string | null
  is_joined?: boolean
  is_claimed: boolean
  president_name?: string | null
  president_avatar?: string | null
  president_email?: string | null
  tags: string[]
  memberRole?: string | null
}

const categoryIcons = {
  academic: BookOpen,
  arts: Palette,
  sports: Trophy,
  technology: Code,
  service: Heart,
  hobby: Gamepad2,
}

const categoryColors = {
  academic: "bg-blue-100 text-blue-800",
  arts: "bg-purple-100 text-purple-800",
  sports: "bg-green-100 text-green-800",
  technology: "bg-orange-100 text-orange-800",
  service: "bg-red-100 text-red-800",
  hobby: "bg-yellow-100 text-yellow-800",
}

export function ClubsContent() {
  const { user } = useAuth()
  const [clubs, setClubs] = useState<Club[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [transferUserId, setTransferUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAdmin, setShowAdmin] = useState(false)

  // Load clubs from API
  const loadClubs = async () => {
    try {
      setLoading(true)
      const url = user?.id ? `/api/clubs?userId=${user.id}` : "/api/clubs"
      const response = await fetch(url)
      
      if (response.ok) {
        const result = await response.json()
        setClubs(result.data || [])
      }
    } catch (error) {
      console.error("Error loading clubs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClubs()
  }, [user?.id])

  const handleJoinLeave = async (clubId: string, isJoined: boolean) => {
    if (!user?.id) return

    try {
      if (isJoined) {
        // Leave club
        const response = await fetch(`/api/clubs/${clubId}/join?userId=${user.id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          await loadClubs()
        }
      } else {
        // Join club
        const response = await fetch(`/api/clubs/${clubId}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        })
        if (response.ok) {
          await loadClubs()
        }
      }
    } catch (error) {
      console.error("Error joining/leaving club:", error)
      alert("Failed to update membership. Please try again.")
    }
  }

  const handleClaimClub = async (clubId: string) => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/clubs/${clubId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        await loadClubs()
        alert("Club claimed successfully! You are now the president.")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to claim club")
      }
    } catch (error) {
      console.error("Error claiming club:", error)
      alert("Failed to claim club. Please try again.")
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB")
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleCreatePost = async () => {
    if (!selectedClub || !newPostContent.trim() || !user?.id) return

    try {
      let imageUrl = ""

      // Upload image if selected
      if (selectedImage) {
        const formData = new FormData()
        formData.append("file", selectedImage)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.data.url
        }
      }

      // Create post
      const response = await fetch(`/api/clubs/${selectedClub.id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          content: newPostContent,
          imageUrl,
        }),
      })

      if (response.ok) {
        setNewPostContent("")
        setSelectedImage(null)
        setImagePreview(null)
        setIsDialogOpen(false)
        alert("Post created successfully!")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create post")
      }
    } catch (error) {
      console.error("Error creating post:", error)
      alert("Failed to create post. Please try again.")
    }
  }

  const handleTransferPresidency = async () => {
    if (!selectedClub || !transferUserId || !user?.id) return

    try {
      const response = await fetch(`/api/clubs/${selectedClub.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: user.id,
          toUserId: transferUserId,
        }),
      })

      if (response.ok) {
        setIsTransferDialogOpen(false)
        setTransferUserId("")
        await loadClubs()
        alert("Presidency transferred successfully!")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to transfer presidency")
      }
    } catch (error) {
      console.error("Error transferring presidency:", error)
      alert("Failed to transfer presidency. Please try again.")
    }
  }

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || club.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const joinedClubs = filteredClubs.filter((club) => club.is_joined)
  const unclaimedClubs = filteredClubs.filter((club) => !club.is_claimed)

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "academic", label: "Academic" },
    { value: "arts", label: "Arts" },
    { value: "sports", label: "Sports" },
    { value: "technology", label: "Technology" },
    { value: "service", label: "Service" },
    { value: "hobby", label: "Hobby" },
  ]

  const renderClubCard = (club: Club) => {
    const CategoryIcon = categoryIcons[club.category]

    return (
      <Card key={club.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={club.image_url || "/placeholder.svg"}
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <Badge className={categoryColors[club.category]}>
              <CategoryIcon className="h-3 w-3 mr-1" />
              {club.category}
            </Badge>
          </div>
          {!club.is_claimed && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Unclaimed
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{club.name}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{club.member_count || 0} members</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <CardDescription className="line-clamp-3">{club.description}</CardDescription>

          {club.is_claimed && club.meeting_time && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{club.meeting_time}</span>
              </div>
              {club.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{club.location}</span>
                </div>
              )}
            </div>
          )}

          {club.is_claimed && club.president_name && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={club.president_avatar || "/placeholder.svg"} alt={club.president_name} />
                <AvatarFallback className="text-xs">
                  {club.president_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Crown className="h-3 w-3" />
                President: {club.president_name}
              </span>
            </div>
          )}

          {club.tags && club.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {club.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {!club.is_claimed ? (
              <Button onClick={() => handleClaimClub(club.id)} className="w-full" variant="default">
                <Crown className="h-4 w-4 mr-2" />
                Claim Club
              </Button>
            ) : (
              <>
                {club.is_joined && (
                  <>
                    <Dialog
                      open={isDialogOpen && selectedClub?.id === club.id}
                      onOpenChange={(open) => {
                        setIsDialogOpen(open)
                        if (open) setSelectedClub(club)
                        else {
                          setSelectedClub(null)
                          setNewPostContent("")
                          setSelectedImage(null)
                          setImagePreview(null)
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Post
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create Post for {club.name}</DialogTitle>
                          <DialogDescription>Share an update with club members</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="post-content">Post Content</Label>
                            <Textarea
                              id="post-content"
                              placeholder="What's happening in your club?"
                              value={newPostContent}
                              onChange={(e) => setNewPostContent(e.target.value)}
                              className="min-h-[120px]"
                            />
                          </div>

                          {/* Image Upload */}
                          <div className="space-y-2">
                            <Label htmlFor="post-image">Image (Optional)</Label>
                            {!imagePreview ? (
                              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                                <input
                                  type="file"
                                  id="post-image"
                                  accept="image/*"
                                  onChange={handleImageSelect}
                                  className="hidden"
                                />
                                <label htmlFor="post-image" className="cursor-pointer">
                                  <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Click to upload image</span>
                                  </div>
                                </label>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="aspect-video rounded-lg overflow-hidden border">
                                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={removeImage}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          <Button onClick={handleCreatePost} className="w-full" disabled={!newPostContent.trim()}>
                            Post
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {club.memberRole === "president" && (
                      <Dialog
                        open={isTransferDialogOpen && selectedClub?.id === club.id}
                        onOpenChange={(open) => {
                          setIsTransferDialogOpen(open)
                          if (open) setSelectedClub(club)
                          else {
                            setSelectedClub(null)
                            setTransferUserId("")
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" title="Transfer Presidency">
                            <UserCog className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Transfer Presidency</DialogTitle>
                            <DialogDescription>
                              Transfer club presidency to another member by their user ID
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="transfer-user-id">User ID</Label>
                              <Input
                                id="transfer-user-id"
                                placeholder="Enter user ID to transfer to"
                                value={transferUserId}
                                onChange={(e) => setTransferUserId(e.target.value)}
                              />
                            </div>
                            <Button onClick={handleTransferPresidency} className="w-full" disabled={!transferUserId}>
                              Transfer
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </>
                )}
                <Button
                  onClick={() => handleJoinLeave(club.id, club.is_joined || false)}
                  variant={club.is_joined ? "outline" : "default"}
                  className={club.is_joined ? "flex-1" : "flex-1"}
                >
                  {club.is_joined ? "Leave" : "Join"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading clubs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">School Clubs</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover and join clubs, or claim an unclaimed club to become its president.
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            {user?.role === "admin" && (
              <Button variant="outline" onClick={() => setShowAdmin(!showAdmin)}>
                {showAdmin ? "Hide" : "Show"} Admin
              </Button>
            )}
          </div>
        </div>
      </div>

      {showAdmin && user?.role === "admin" && (
        <div className="mb-8">
          <AdminClubImport />
        </div>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Clubs</TabsTrigger>
          <TabsTrigger value="my-clubs">My Clubs</TabsTrigger>
          <TabsTrigger value="unclaimed">Unclaimed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">Showing {filteredClubs.length} clubs</div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map(renderClubCard)}
          </div>

          {filteredClubs.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No clubs found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-clubs" className="space-y-6">
          <div className="text-sm text-muted-foreground">{joinedClubs.length} joined clubs</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedClubs.map(renderClubCard)}
          </div>
          {joinedClubs.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">You haven't joined any clubs yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="unclaimed" className="space-y-6">
          <div className="text-sm text-muted-foreground">{unclaimedClubs.length} unclaimed clubs available</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unclaimedClubs.map(renderClubCard)}
          </div>
          {unclaimedClubs.length === 0 && (
            <div className="text-center py-12">
              <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">All clubs have been claimed!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
