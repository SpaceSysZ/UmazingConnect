"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ImageIcon,
  Calendar,
  MapPin,
  Users,
  Megaphone,
} from "lucide-react"

interface Post {
  id: string
  author: {
    name: string
    avatar: string
    role: "student" | "faculty" | "admin"
    year?: string
  }
  content: string
  timestamp: string
  type: "post" | "announcement" | "event" | "club"
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  image?: string
  eventDetails?: {
    date: string
    location: string
  }
  clubInfo?: {
    name: string
    memberCount: number
  }
}

const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Principal Johnson",
      avatar: "/school-principal.png",
      role: "admin",
    },
    content:
      "Reminder: Parent-Teacher conferences are scheduled for next week. Please check your email for your assigned time slots. Looking forward to discussing your child's progress!",
    timestamp: "2 hours ago",
    type: "announcement",
    likes: 24,
    comments: 8,
    shares: 12,
    isLiked: false,
  },
  {
    id: "2",
    author: {
      name: "Sarah Chen",
      avatar: "/student-sarah.png",
      role: "student",
      year: "Senior",
    },
    content:
      "Just finished our robotics competition! Our team placed 2nd in the regional finals. So proud of everyone's hard work this semester. Next stop: state championships! 🤖",
    timestamp: "4 hours ago",
    type: "post",
    likes: 89,
    comments: 23,
    shares: 15,
    isLiked: true,
    image: "/robotics-competition.png",
  },
  {
    id: "3",
    author: {
      name: "Drama Club",
      avatar: "/drama-masks.png",
      role: "student",
    },
    content:
      "Auditions for our spring musical 'Hamilton' are now open! We're looking for talented singers, dancers, and actors. No experience necessary - just bring your passion!",
    timestamp: "6 hours ago",
    type: "club",
    likes: 45,
    comments: 18,
    shares: 28,
    isLiked: false,
    eventDetails: {
      date: "March 15-16, 2024",
      location: "Main Auditorium",
    },
    clubInfo: {
      name: "Drama Club",
      memberCount: 67,
    },
  },
  {
    id: "4",
    author: {
      name: "Mr. Rodriguez",
      avatar: "/teacher-rodriguez.png",
      role: "faculty",
    },
    content:
      "Congratulations to all students who participated in the Science Fair! The creativity and dedication shown in your projects was truly inspiring. Special shoutout to the winners!",
    timestamp: "1 day ago",
    type: "post",
    likes: 156,
    comments: 34,
    shares: 22,
    isLiked: true,
  },
]

export function HomeContent() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [newPost, setNewPost] = useState("")

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post: Post = {
        id: Date.now().toString(),
        author: {
          name: "John Smith",
          avatar: "/student-john.png",
          role: "student",
          year: "Junior",
        },
        content: newPost,
        timestamp: "Just now",
        type: "post",
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
      }
      setPosts([post, ...posts])
      setNewPost("")
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "faculty":
        return "bg-green-100 text-green-800"
      case "student":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPostIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Megaphone className="h-4 w-4" />
      case "event":
        return <Calendar className="h-4 w-4" />
      case "club":
        return <Users className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Create Post Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/student-john.png" alt="Your avatar" />
              <AvatarFallback className="bg-primary text-primary-foreground">JS</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's happening at school today?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[80px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ImageIcon className="h-4 w-4 mr-2" />
                Photo
              </Button>
            </div>
            <Button onClick={handleCreatePost} disabled={!newPost.trim()} className="px-6">
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {post.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-card-foreground">{post.author.name}</h3>
                      <Badge variant="secondary" className={getRoleColor(post.author.role)}>
                        {post.author.role === "student" && post.author.year ? post.author.year : post.author.role}
                      </Badge>
                      {getPostIcon(post.type) && <div className="text-muted-foreground">{getPostIcon(post.type)}</div>}
                    </div>
                    <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
              <p className="text-card-foreground leading-relaxed">{post.content}</p>

              {post.image && (
                <div className="rounded-lg overflow-hidden">
                  <img src={post.image || "/placeholder.svg"} alt="Post content" className="w-full h-64 object-cover" />
                </div>
              )}

              {post.eventDetails && (
                <div className="bg-muted rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{post.eventDetails.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{post.eventDetails.location}</span>
                  </div>
                </div>
              )}

              {post.clubInfo && (
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{post.clubInfo.memberCount} members</span>
                  </div>
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`gap-2 ${post.isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"}`}
                  >
                    <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                    <span>{post.likes}</span>
                  </Button>

                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </Button>

                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <Share2 className="h-4 w-4" />
                    <span>{post.shares}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
