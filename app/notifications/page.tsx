"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bell,
  BellOff,
  ArrowLeft,
  Check,
  CheckCheck,
  Users,
  Globe,
  Settings,
  Trash2,
  RefreshCw,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  user_id: string
  club_id: string | null
  post_id: string | null
  type: string
  title: string
  body: string
  is_read: boolean
  created_at: string
  club_name?: string
  club_image?: string
}

interface NotificationPreferences {
  push_enabled: boolean
  filter_mode: 'all' | 'my_clubs'
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push_enabled: true,
    filter_mode: 'all',
  })
  const [loading, setLoading] = useState(true)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications')
  const [pushSupported, setPushSupported] = useState(false)
  const [pushSubscribed, setPushSubscribed] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true)
      checkPushSubscription()
    }

    loadNotifications()
    loadPreferences()
  }, [user, router])

  const checkPushSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setPushSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking push subscription:', error)
    }
  }

  const loadNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data || [])
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadPreferences = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/notifications/preferences?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.data)
      }
    } catch (error) {
      console.error("Error loading preferences:", error)
    }
  }

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user) return

    try {
      setSavingPrefs(true)
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          pushEnabled: updates.push_enabled,
          filterMode: updates.filter_mode,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPreferences(data.data)
        // Reload notifications if filter changed
        if (updates.filter_mode !== undefined) {
          loadNotifications()
        }
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
    } finally {
      setSavingPrefs(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    if (!user) return

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          notificationIds,
        }),
      })

      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n.id) ? { ...n, is_read: true } : n
        )
      )
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          markAllRead: true,
        }),
      })

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      )
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const subscribeToPush = async () => {
    if (!user || !pushSupported) return

    try {
      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Please allow notifications to receive push updates')
        return
      }

      // Subscribe to push
      // Note: You need to replace this with your actual VAPID public key
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY_HERE'
        ),
      })

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          subscription: subscription.toJSON(),
        }),
      })

      setPushSubscribed(true)
    } catch (error) {
      console.error('Error subscribing to push:', error)
    }
  }

  const unsubscribeFromPush = async () => {
    if (!user) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        await fetch(`/api/notifications/subscribe?userId=${user.id}&endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: 'DELETE',
        })
      }

      setPushSubscribed(false)
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_post':
        return FileText
      case 'club_update':
        return Users
      default:
        return Bell
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-2 sm:mb-4" size="sm">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-foreground pb-2">
        <Button
          variant={activeTab === 'notifications' ? 'default' : 'outline'}
          onClick={() => setActiveTab('notifications')}
          className="gap-2"
        >
          <Bell className="h-4 w-4" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {unreadCount}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'default' : 'outline'}
          onClick={() => setActiveTab('settings')}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {activeTab === 'notifications' ? (
        <>
          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadNotifications()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notifications yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You'll see updates from your clubs here
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[600px]">
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type)
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                            !notification.is_read ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => {
                            if (!notification.is_read) {
                              markAsRead([notification.id])
                            }
                            // Navigate to club/post if available
                            if (notification.club_id) {
                              router.push(`/clubs/${notification.club_id}`)
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${!notification.is_read ? 'bg-primary/10' : 'bg-muted'}`}>
                              {notification.club_image ? (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={notification.club_image} />
                                  <AvatarFallback>
                                    <Icon className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <Icon className={`h-5 w-5 ${!notification.is_read ? 'text-primary' : 'text-muted-foreground'}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`font-semibold text-sm truncate ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </p>
                                {!notification.is_read && (
                                  <span className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {notification.body}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {notification.club_name && (
                                  <Badge variant="outline" className="text-xs">
                                    {notification.club_name}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead([notification.id])
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Settings Tab */
        <div className="space-y-6">
          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Receive notifications on your device when the app is installed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!pushSupported ? (
                <p className="text-sm text-muted-foreground">
                  Push notifications are not supported on this device/browser.
                  Install the app on your phone to receive push notifications.
                </p>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-toggle">Enable Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      {pushSubscribed
                        ? 'You will receive push notifications'
                        : 'Click to enable push notifications'}
                    </p>
                  </div>
                  <Switch
                    id="push-toggle"
                    checked={pushSubscribed}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        subscribeToPush()
                      } else {
                        unsubscribeFromPush()
                      }
                    }}
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications-enabled">In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Store notifications in your notification center
                  </p>
                </div>
                <Switch
                  id="notifications-enabled"
                  checked={preferences.push_enabled}
                  disabled={savingPrefs}
                  onCheckedChange={(checked) => {
                    updatePreferences({ push_enabled: checked })
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Filter Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Filter</CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={preferences.filter_mode}
                onValueChange={(value: 'all' | 'my_clubs') => {
                  updatePreferences({ filter_mode: value })
                }}
                disabled={savingPrefs}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg border-2 border-foreground hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="my_clubs" id="my_clubs" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="my_clubs" className="flex items-center gap-2 cursor-pointer">
                      <Users className="h-4 w-4" />
                      My Clubs Only
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Only receive notifications from clubs you have joined
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg border-2 border-foreground hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="all" id="all" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
                      <Globe className="h-4 w-4" />
                      All Clubs
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive notifications from all clubs (currently same as My Clubs)
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
