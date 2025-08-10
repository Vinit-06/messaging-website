import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { io } from 'socket.io-client'

/**
 * Hook for managing Supabase real-time subscriptions
 * @param {string} table - Table name to subscribe to
 * @param {Object} options - Subscription options
 * @returns {Object} - Subscription data and utilities
 */
export const useSupabaseSubscription = (table, options = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let subscription

    const setupSubscription = async () => {
      try {
        // Initial data fetch
        const { data: initialData, error: fetchError } = await supabase
          .from(table)
          .select(options.select || '*')
          .order(options.orderBy || 'created_at', { ascending: options.ascending || false })

        if (fetchError) throw fetchError

        setData(initialData || [])
        setLoading(false)

        // Set up real-time subscription
        subscription = supabase
          .channel(`public:${table}`)
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: table,
              filter: options.filter 
            }, 
            (payload) => {
              const { eventType, new: newRecord, old: oldRecord } = payload

              setData(prevData => {
                switch (eventType) {
                  case 'INSERT':
                    return [newRecord, ...prevData]
                  case 'UPDATE':
                    return prevData.map(item => 
                      item.id === newRecord.id ? newRecord : item
                    )
                  case 'DELETE':
                    return prevData.filter(item => item.id !== oldRecord.id)
                  default:
                    return prevData
                }
              })
            }
          )
          .subscribe()

      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [table, JSON.stringify(options)])

  return { data, loading, error, refetch: setupSubscription }
}

/**
 * Hook for managing WebSocket connections
 * @param {string} url - WebSocket server URL
 * @param {Object} options - Connection options
 * @returns {Object} - Socket instance and connection state
 */
export const useWebSocketConnection = (url, options = {}) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) return

    const socketInstance = io(url, {
      ...options,
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      setConnected(true)
      setError(null)
      console.log('WebSocket connected')
    })

    socketInstance.on('disconnect', (reason) => {
      setConnected(false)
      console.log('WebSocket disconnected:', reason)
    })

    socketInstance.on('connect_error', (err) => {
      setError(err.message)
      setConnected(false)
      console.error('WebSocket connection error:', err)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [url, JSON.stringify(options)])

  return { socket, connected, error }
}

/**
 * Hook for managing chat messages with real-time updates
 * @param {string} chatId - Chat ID to subscribe to
 * @returns {Object} - Messages and utilities
 */
export const useChatMessages = (chatId) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const { data, loading: subscriptionLoading } = useSupabaseSubscription('messages', {
    select: `
      *,
      sender:profiles(id, full_name, avatar_url),
      read_receipts(user_id, read_at)
    `,
    filter: `chat_id=eq.${chatId}`,
    orderBy: 'created_at',
    ascending: true
  })

  useEffect(() => {
    setMessages(data)
    setLoading(subscriptionLoading)
  }, [data, subscriptionLoading])

  const sendMessage = async (content, type = 'text', metadata = {}) => {
    try {
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          content,
          type,
          metadata,
          sender_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select(`
          *,
          sender:profiles(id, full_name, avatar_url)
        `)
        .single()

      if (error) throw error

      return newMessage
    } catch (err) {
      console.error('Error sending message:', err)
      throw err
    }
  }

  const markAsRead = async (messageId) => {
    try {
      const { error } = await supabase
        .from('read_receipts')
        .upsert({
          message_id: messageId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          read_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (err) {
      console.error('Error marking message as read:', err)
    }
  }

  return {
    messages,
    loading,
    sendMessage,
    markAsRead
  }
}

/**
 * Hook for managing user presence
 * @returns {Object} - Online users and utilities
 */
export const useUserPresence = () => {
  const [onlineUsers, setOnlineUsers] = useState([])
  const [userStatus, setUserStatus] = useState('online')

  useEffect(() => {
    const channel = supabase.channel('online-users')

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat()
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const user = (await supabase.auth.getUser()).data.user
          if (user) {
            await channel.track({
              user_id: user.id,
              email: user.email,
              online_at: new Date().toISOString()
            })
          }
        }
      })

    // Update user status
    const updateStatus = async (status) => {
      setUserStatus(status)
      if (status === 'offline') {
        await channel.untrack()
      } else {
        const user = (await supabase.auth.getUser()).data.user
        if (user) {
          await channel.track({
            user_id: user.id,
            email: user.email,
            status,
            online_at: new Date().toISOString()
          })
        }
      }
    }

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      updateStatus(document.hidden ? 'away' : 'online')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      channel.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return {
    onlineUsers,
    userStatus,
    setUserStatus
  }
}

/**
 * Hook for file uploads with progress tracking
 * @param {string} bucket - Supabase storage bucket name
 * @returns {Object} - Upload utilities
 */
export const useFileUpload = (bucket = 'chat-files') => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const uploadFile = async (file, options = {}) => {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = options.folder ? `${options.folder}/${fileName}` : fileName

      // Simulate progress for demo (replace with actual progress tracking)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          ...options
        })

      clearInterval(progressInterval)
      setProgress(100)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return {
        path: data.path,
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadFile,
    uploading,
    progress,
    error
  }
}

/**
 * Export all hooks for easy importing
 */
export default {
  useSupabaseSubscription,
  useWebSocketConnection,
  useChatMessages,
  useUserPresence,
  useFileUpload
}
