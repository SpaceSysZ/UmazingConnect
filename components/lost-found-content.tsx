"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, MapPin, Calendar, Phone, Mail, Package, Smartphone, Book, Shirt, Key } from "lucide-react"

interface LostFoundItem {
  id: string
  title: string
  description: string
  category: "electronics" | "clothing" | "books" | "accessories" | "keys" | "other"
  type: "lost" | "found"
  location: string
  dateReported: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  image?: string
  status: "active" | "claimed" | "expired"
  reporter: {
    name: string
    avatar: string
  }
}

const mockItems: LostFoundItem[] = [
  {
    id: "1",
    title: "Black iPhone 14",
    description:
      "Black iPhone 14 with a clear case. Has a small crack on the bottom left corner. Last seen in the cafeteria during lunch.",
    category: "electronics",
    type: "lost",
    location: "Cafeteria",
    dateReported: "2 days ago",
    contactName: "Sarah Johnson",
    contactEmail: "sarah.j@school.edu",
    contactPhone: "(555) 123-4567",
    image: "/placeholder.svg?key=iphone",
    status: "active",
    reporter: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?key=sarah2",
    },
  },
  {
    id: "2",
    title: "Blue Nike Backpack",
    description: "Found a blue Nike backpack in the gym locker room. Contains some textbooks and a water bottle.",
    category: "accessories",
    type: "found",
    location: "Gym Locker Room",
    dateReported: "1 day ago",
    contactName: "Mike Chen",
    contactEmail: "mike.c@school.edu",
    image: "/placeholder.svg?key=backpack",
    status: "active",
    reporter: {
      name: "Mike Chen",
      avatar: "/placeholder.svg?key=mike",
    },
  },
  {
    id: "3",
    title: "Chemistry Textbook",
    description:
      "Lost my chemistry textbook 'Principles of Chemistry' by Atkins. Has my name written inside the front cover.",
    category: "books",
    type: "lost",
    location: "Science Building",
    dateReported: "3 days ago",
    contactName: "Emma Wilson",
    contactEmail: "emma.w@school.edu",
    image: "/placeholder.svg?key=textbook",
    status: "active",
    reporter: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg?key=emma2",
    },
  },
  {
    id: "4",
    title: "Set of Car Keys",
    description:
      "Found a set of car keys with a Honda keychain and a small flashlight attached. Found near the parking lot.",
    category: "keys",
    type: "found",
    location: "Student Parking Lot",
    dateReported: "4 hours ago",
    contactName: "Alex Rodriguez",
    contactEmail: "alex.r@school.edu",
    status: "active",
    reporter: {
      name: "Alex Rodriguez",
      avatar: "/placeholder.svg?key=alex2",
    },
  },
  {
    id: "5",
    title: "Red Hoodie",
    description:
      "Lost my red hoodie with 'State University' printed on the front. Size medium. Very sentimental value.",
    category: "clothing",
    type: "lost",
    location: "Library",
    dateReported: "1 week ago",
    contactName: "Jordan Smith",
    contactEmail: "jordan.s@school.edu",
    image: "/placeholder.svg?key=hoodie",
    status: "claimed",
    reporter: {
      name: "Jordan Smith",
      avatar: "/placeholder.svg?key=jordan2",
    },
  },
]

const categoryIcons = {
  electronics: Smartphone,
  clothing: Shirt,
  books: Book,
  accessories: Package,
  keys: Key,
  other: Package,
}

const categoryColors = {
  electronics: "bg-blue-100 text-blue-800",
  clothing: "bg-purple-100 text-purple-800",
  books: "bg-green-100 text-green-800",
  accessories: "bg-orange-100 text-orange-800",
  keys: "bg-yellow-100 text-yellow-800",
  other: "bg-gray-100 text-gray-800",
}

export function LostFoundContent() {
  const [items, setItems] = useState<LostFoundItem[]>(mockItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("browse")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form state for new item
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "",
    type: "lost" as "lost" | "found",
    location: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  })

  const handleSubmitItem = () => {
    if (
      newItem.title &&
      newItem.description &&
      newItem.category &&
      newItem.location &&
      newItem.contactName &&
      newItem.contactEmail
    ) {
      const item: LostFoundItem = {
        id: Date.now().toString(),
        ...newItem,
        dateReported: "Just now",
        status: "active",
        reporter: {
          name: newItem.contactName,
          avatar: "/placeholder.svg?key=user",
        },
      }
      setItems([item, ...items])
      setNewItem({
        title: "",
        description: "",
        category: "",
        type: "lost",
        location: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
      })
      setIsDialogOpen(false)
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory

    const matchesTab =
      activeTab === "browse" ||
      (activeTab === "lost" && item.type === "lost") ||
      (activeTab === "found" && item.type === "found")

    return matchesSearch && matchesCategory && matchesTab && item.status === "active"
  })

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "books", label: "Books" },
    { value: "accessories", label: "Accessories" },
    { value: "keys", label: "Keys" },
    { value: "other", label: "Other" },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Lost & Found</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Help reunite lost items with their owners. Report lost items or help others by reporting found items.
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Report Lost/Found Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Report an Item</DialogTitle>
              <DialogDescription>Help others by reporting a lost or found item</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newItem.type}
                  onValueChange={(value: "lost" | "found") => setNewItem({ ...newItem, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">Lost Item</SelectItem>
                    <SelectItem value="found">Found Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Item Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Black iPhone, Blue Backpack"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="keys">Keys</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about the item..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Where was it lost/found?"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactName">Your Name</Label>
                <Input
                  id="contactName"
                  placeholder="Full name"
                  value={newItem.contactName}
                  onChange={(e) => setNewItem({ ...newItem, contactName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="your.email@school.edu"
                  value={newItem.contactEmail}
                  onChange={(e) => setNewItem({ ...newItem, contactEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone (Optional)</Label>
                <Input
                  id="contactPhone"
                  placeholder="(555) 123-4567"
                  value={newItem.contactPhone}
                  onChange={(e) => setNewItem({ ...newItem, contactPhone: e.target.value })}
                />
              </div>

              <Button onClick={handleSubmitItem} className="w-full">
                Submit Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">All Items</TabsTrigger>
          <TabsTrigger value="lost">Lost Items</TabsTrigger>
          <TabsTrigger value="found">Found Items</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items, descriptions, or locations..."
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

          {/* Results count */}
          <div className="text-sm text-muted-foreground">Showing {filteredItems.length} items</div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const CategoryIcon = categoryIcons[item.category]

              return (
                <Card key={item.id} className="overflow-hidden">
                  {item.image && (
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.type === "lost" ? "destructive" : "default"}>
                            {item.type === "lost" ? "Lost" : "Found"}
                          </Badge>
                          <Badge className={categoryColors[item.category]}>
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {item.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-3">{item.description}</CardDescription>

                    {/* Location and Date */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Reported {item.dateReported}</span>
                      </div>
                    </div>

                    {/* Reporter */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={item.reporter.avatar || "/placeholder.svg"} alt={item.reporter.name} />
                        <AvatarFallback className="text-xs">
                          {item.reporter.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">Reported by {item.reporter.name}</span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 p-3 bg-muted rounded-lg">
                      <h4 className="text-sm font-medium">Contact Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{item.contactEmail}</span>
                        </div>
                        {item.contactPhone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{item.contactPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Button */}
                    <Button variant="outline" className="w-full bg-transparent">
                      Contact {item.contactName}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* No results */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No items found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
