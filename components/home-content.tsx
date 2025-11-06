"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

interface ClubPost {
  id: string
  club_id: string
  club_name?: string
  club_avatar?: string
  author_name: string
  author_avatar: string | null
  author_email: string
  content: string
  image_url: string | null
  likes_count: number
  comments_count: number
  created_at: string
  isLiked?: boolean
}

export function HomeContent() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<ClubPost[]>([])
  const [loading, setLoading] = useState(true)
  const [clubNames, setClubNames] = useState<Map<string, { name: string; avatar: string | null }>>(new Map())

  // Load all posts from all clubs
  const loadPosts = async () => {
    try {
      setLoading(true)
      
      // First, get all clubs to map IDs to names
      const clubsResponse = await fetch("/api/clubs")
      if (clubsResponse.ok) {
        const clubsData = await clubsResponse.json()
        const clubMap = new Map()
        clubsData.data.forEach((club: any) => {
          clubMap.set(club.id, {
            name: club.name,
            avatar: club.image_url,
          })
        })
        setClubNames(clubMap)
      }

      // Get all clubs and their posts
      const clubsRes = await fetch("/api/clubs")
      if (!clubsRes.ok) return

      const clubsData = await clubsRes.json()
      const allPosts: ClubPost[] = []

      // Fetch posts for each club
      for (const club of clubsData.data) {
        const postsUrl = user?.id
          ? `/api/clubs/${club.id}/posts?userId=${user.id}`
          : `/api/clubs/${club.id}/posts`
        
        const postsRes = await fetch(postsUrl)
        if (postsRes.ok) {
          const postsData = await postsRes.json()
          const clubPosts = postsData.data.map((post: any) => ({
            ...post,
            club_name: club.name,
            club_avatar: club.image_url,
            club_id: club.id,
          }))
          allPosts.push(...clubPosts)
        }
      }

      // Sort by date (newest first)
      allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setPosts(allPosts)
    } catch (error) {
      console.error("Error loading posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [user?.id])

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user?.id) {
      alert("Please log in to like posts")
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: data.liked,
                  likes_count: data.liked ? post.likes_count + 1 : post.likes_count - 1,
                }
              : post
          )
        )
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading club posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Club Feed</h1>
        <p className="text-muted-foreground">Posts from all school clubs</p>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg text-muted-foreground">No club posts yet</p>
              <p className="text-sm text-muted-foreground mt-2">Join a club to see posts from your clubs!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.club_avatar || "/placeholder.svg"} alt={post.club_name || "Club"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(post.club_name || "C")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-card-foreground">{post.club_name || "Club"}</h3>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Users className="h-3 w-3 mr-1" />
                          Club
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Posted by {post.author_name}</span>
                        <span>•</span>
                        <span>{formatTimestamp(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                <p className="text-card-foreground leading-relaxed">{post.content}</p>

                {post.image_url && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={post.image_url.startsWith("data:") ? post.image_url : post.image_url}
                      alt="Post content"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id, post.isLiked || false)}
                      className={`gap-2 ${post.isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"}`}
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                      <span>{post.likes_count || 0}</span>
                    </Button>

                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments_count || 0}</span>
                    </Button>

                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
