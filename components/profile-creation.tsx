"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { UserProfile } from "@/lib/auth-config"

export function ProfileCreation() {
  const { createProfile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    role: "student" as "student" | "sponsor" | "admin",
    grade: "",
    department: "",
    bio: "",
    interests: [] as string[],
  })
  const [newInterest, setNewInterest] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await createProfile(formData)
    } catch (error) {
      console.error("Error creating profile:", error)
      alert("Failed to create profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }))
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addInterest()
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Create Your Profile</CardTitle>
          <CardDescription>
            Complete your profile to start using SchoolConnect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">I am a:</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "student" | "sponsor" | "admin") =>
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="sponsor">Club Sponsor</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grade (for students) */}
            {formData.role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="grade">Grade Level:</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, grade: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">9th Grade</SelectItem>
                    <SelectItem value="10">10th Grade</SelectItem>
                    <SelectItem value="11">11th Grade</SelectItem>
                    <SelectItem value="12">12th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Department (for sponsors) */}
            {formData.role === "sponsor" && (
              <div className="space-y-2">
                <Label htmlFor="department">Department:</Label>
                <Input
                  id="department"
                  placeholder="e.g., Science, Arts, Athletics"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, department: e.target.value }))
                  }
                />
              </div>
            )}

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional):</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, bio: e.target.value }))
                }
                rows={3}
              />
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label>Interests (Optional):</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an interest..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addInterest}
                  disabled={!newInterest.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Display interests */}
              {formData.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="gap-1">
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Profile..." : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
