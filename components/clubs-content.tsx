"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Calendar, MapPin, Search, Filter, Palette, Gamepad2, BookOpen, Trophy, Heart, Code } from "lucide-react"

interface Club {
  id: string
  name: string
  description: string
  category: "academic" | "arts" | "sports" | "technology" | "service" | "hobby"
  memberCount: number
  meetingTime: string
  location: string
  image: string
  isJoined: boolean
  president: {
    name: string
    avatar: string
  }
  tags: string[]
}

const mockClubs: Club[] = [
  {
    id: "1",
    name: "Drama Club",
    description:
      "Express yourself through theater! We perform plays, musicals, and host acting workshops throughout the year.",
    category: "arts",
    memberCount: 67,
    meetingTime: "Tuesdays & Thursdays, 3:30 PM",
    location: "Main Auditorium",
    image: "/drama-masks.png",
    isJoined: false,
    president: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg?key=emma",
    },
    tags: ["Theater", "Performance", "Creative"],
  },
  {
    id: "2",
    name: "Robotics Team",
    description:
      "Build, program, and compete with robots! Perfect for students interested in engineering and technology.",
    category: "technology",
    memberCount: 34,
    meetingTime: "Mondays & Wednesdays, 4:00 PM",
    location: "Tech Lab",
    image: "/robotics-competition.png",
    isJoined: true,
    president: {
      name: "Alex Chen",
      avatar: "/placeholder.svg?key=alex",
    },
    tags: ["Engineering", "Programming", "Competition"],
  },
  {
    id: "3",
    name: "Environmental Club",
    description:
      "Make a difference! Join us in sustainability projects, campus cleanups, and environmental awareness campaigns.",
    category: "service",
    memberCount: 89,
    meetingTime: "Fridays, 3:15 PM",
    location: "Room 204",
    image: "/placeholder.svg?key=env",
    isJoined: false,
    president: {
      name: "Maya Patel",
      avatar: "/placeholder.svg?key=maya",
    },
    tags: ["Sustainability", "Community", "Activism"],
  },
  {
    id: "4",
    name: "Chess Club",
    description:
      "Sharpen your strategic thinking! Weekly tournaments, lessons for beginners, and preparation for competitions.",
    category: "hobby",
    memberCount: 23,
    meetingTime: "Wednesdays, 3:30 PM",
    location: "Library",
    image: "/placeholder.svg?key=chess",
    isJoined: false,
    president: {
      name: "David Kim",
      avatar: "/placeholder.svg?key=david",
    },
    tags: ["Strategy", "Competition", "Logic"],
  },
  {
    id: "5",
    name: "Photography Club",
    description:
      "Capture the world through your lens! Learn techniques, share your work, and participate in photo walks.",
    category: "arts",
    memberCount: 45,
    meetingTime: "Thursdays, 3:45 PM",
    location: "Art Room",
    image: "/placeholder.svg?key=photo",
    isJoined: true,
    president: {
      name: "Sophie Martinez",
      avatar: "/placeholder.svg?key=sophie",
    },
    tags: ["Visual Arts", "Creative", "Digital"],
  },
  {
    id: "6",
    name: "Debate Team",
    description:
      "Develop your public speaking and critical thinking skills through competitive debates and discussions.",
    category: "academic",
    memberCount: 28,
    meetingTime: "Tuesdays, 4:00 PM",
    location: "Room 301",
    image: "/placeholder.svg?key=debate",
    isJoined: false,
    president: {
      name: "Jordan Taylor",
      avatar: "/placeholder.svg?key=jordan",
    },
    tags: ["Public Speaking", "Critical Thinking", "Competition"],
  },
]

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
  const [clubs, setClubs] = useState<Club[]>(mockClubs)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const handleJoinLeave = (clubId: string) => {
    setClubs(
      clubs.map((club) =>
        club.id === clubId
          ? {
              ...club,
              isJoined: !club.isJoined,
              memberCount: club.isJoined ? club.memberCount - 1 : club.memberCount + 1,
            }
          : club,
      ),
    )
  }

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || club.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "academic", label: "Academic" },
    { value: "arts", label: "Arts" },
    { value: "sports", label: "Sports" },
    { value: "technology", label: "Technology" },
    { value: "service", label: "Service" },
    { value: "hobby", label: "Hobby" },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">School Clubs</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover and join clubs that match your interests. Connect with like-minded students and explore new passions.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clubs, descriptions, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
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

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredClubs.length} of {clubs.length} clubs
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map((club) => {
          const CategoryIcon = categoryIcons[club.category]

          return (
            <Card key={club.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <img src={club.image || "/placeholder.svg"} alt={club.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">
                  <Badge className={categoryColors[club.category]}>
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    {club.category}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{club.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{club.memberCount} members</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-3">{club.description}</CardDescription>

                {/* Meeting Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{club.meetingTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{club.location}</span>
                  </div>
                </div>

                {/* President */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={club.president.avatar || "/placeholder.svg"} alt={club.president.name} />
                    <AvatarFallback className="text-xs">
                      {club.president.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">President: {club.president.name}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {club.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Join/Leave Button */}
                <Button
                  onClick={() => handleJoinLeave(club.id)}
                  variant={club.isJoined ? "outline" : "default"}
                  className="w-full"
                >
                  {club.isJoined ? "Leave Club" : "Join Club"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* No results */}
      {filteredClubs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No clubs found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      )}
    </div>
  )
}
