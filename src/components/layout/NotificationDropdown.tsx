import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell, Heart, MessageCircle, UserPlus, DollarSign } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'

interface Notification {
  id: string
  type: 'like' | 'comment' | 'subscription' | 'message'
  message: string
  created_at: string
  read: boolean
  link?: string
}

export function NotificationDropdown() {
  const { user, isCreator } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Fetch notifications - for now we'll simulate with recent activity
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return []

      // For now, generate notifications from recent likes and comments
      // In production, you'd have a dedicated notifications table
      const notifs: Notification[] = []

      if (isCreator) {
        // Get recent likes on creator's posts
        const { data: recentLikes } = await supabase
          .from('post_likes')
          .select(`
            id,
            created_at,
            posts!inner(id, title, creator_id),
            profiles!post_likes_user_id_fkey(full_name)
          `)
          .eq('posts.creator_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        recentLikes?.forEach((like: any) => {
          notifs.push({
            id: like.id,
            type: 'like',
            message: `${like.profiles?.full_name || 'Someone'} liked your post "${like.posts?.title || 'Untitled'}"`,
            created_at: like.created_at,
            read: false,
            link: `/dashboard/posts`,
          })
        })

        // Get recent subscriptions
        const { data: recentSubs } = await supabase
          .from('subscriptions')
          .select(`
            id,
            created_at,
            profiles!subscriptions_subscriber_id_fkey(full_name)
          `)
          .eq('creator_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(3)

        recentSubs?.forEach((sub: any) => {
          notifs.push({
            id: sub.id,
            type: 'subscription',
            message: `${sub.profiles?.full_name || 'Someone'} subscribed to you!`,
            created_at: sub.created_at,
            read: false,
            link: `/dashboard`,
          })
        })
      }

      // Sort by date
      return notifs.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 10)
    },
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  })

  const unreadCount = notifications?.filter(n => !n.read).length || 0

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'subscription':
        return <DollarSign className="h-4 w-4 text-green-500" />
      case 'message':
        return <MessageCircle className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  if (!user) return null

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">{unreadCount} new</span>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link to={notification.link || '#'}>
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          )}
        </div>
        {notifications && notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Mark all as read
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
