import { useState, useEffect, useCallback } from 'react'
import { supabase, getChatMessages, sendMessage as sendMessageToDb } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useRealTimeMessages = (chatId) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [typingUsers, setTypingUsers] = useState([])
  const { user } = useAuth()

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!chatId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getChatMessages(chatId)
      
      if (fetchError) throw fetchError

      // Sort messages by created_at ascending (oldest first)
      const sortedMessages = (data || []).reverse().map(msg => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.user_id,
        senderName: msg.profiles?.full_name || 'Unknown User',
        senderAvatar: msg.profiles?.avatar_url,
        timestamp: new Date(msg.created_at),
        type: msg.message_type || 'text',
        fileUrl: msg.file_url,
        fileName: msg.file_name,
        fileSize: msg.file_size,
        readBy: [msg.user_id], // TODO: Implement read receipts
        status: 'sent',
        editedAt: msg.edited_at,
        repliedTo: msg.replied_to
      }))

      setMessages(sortedMessages)
    } catch (err) {
      console.error('Error loading messages:', err)
      setError(err.message)
      
      // Set demo messages if database fails
      setMessages(getDemoMessages(chatId, user))
    } finally {
      setLoading(false)
    }
  }, [chatId, user])

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!chatId) return

    loadMessages()

    // Subscribe to new messages in this chat
    const messagesChannel = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          console.log('New message received:', payload)
          
          // Get user profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single()

          const newMessage = {
            id: payload.new.id,
            content: payload.new.content,
            senderId: payload.new.user_id,
            senderName: profile?.full_name || 'Unknown User',
            senderAvatar: profile?.avatar_url,
            timestamp: new Date(payload.new.created_at),
            type: payload.new.message_type || 'text',
            fileUrl: payload.new.file_url,
            fileName: payload.new.file_name,
            fileSize: payload.new.file_size,
            readBy: [payload.new.user_id],
            status: 'sent',
            editedAt: payload.new.edited_at,
            repliedTo: payload.new.replied_to
          }

          // Only add if it's not from the current user (to avoid duplicates)
          if (payload.new.user_id !== user?.id) {
            setMessages(prev => [...prev, newMessage])
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          console.log('Message updated:', payload)
          
          // Update the message in the local state
          setMessages(prev => prev.map(msg => 
            msg.id === payload.new.id 
              ? { 
                  ...msg, 
                  content: payload.new.content,
                  editedAt: payload.new.edited_at
                }
              : msg
          ))
        }
      )
      .on('postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('Message deleted:', payload)
          
          // Remove the message from local state
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
        }
      )
      .subscribe()

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing:${chatId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = typingChannel.presenceState()
        const typingUsersList = Object.values(presenceState).flat()
          .filter(user => user.user_id !== user?.id && user.is_typing)
        setTypingUsers(typingUsersList)
      })
      .subscribe()

    // Cleanup function
    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(typingChannel)
    }
  }, [chatId, user?.id, loadMessages])

  // Send a new message
  const sendMessage = useCallback(async (content, messageType = 'text', fileData = null) => {
    if (!chatId || !user?.id || !content.trim()) return

    // Create optimistic message for immediate UI update
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      senderId: user.id,
      senderName: user.user_metadata?.full_name || user.email || 'You',
      senderAvatar: user.user_metadata?.avatar_url,
      timestamp: new Date(),
      type: messageType,
      fileUrl: fileData?.url,
      fileName: fileData?.name,
      fileSize: fileData?.size,
      readBy: [user.id],
      status: 'sending'
    }

    // Add optimistic message to UI
    setMessages(prev => [...prev, optimisticMessage])

    try {
      // Send message to database
      const { data, error } = await sendMessageToDb(
        chatId,
        content.trim(),
        messageType,
        fileData?.url,
        fileData?.name,
        fileData?.size
      )

      if (error) throw error

      // Update the optimistic message with real data
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id 
          ? {
              ...msg,
              id: data.id,
              status: 'sent',
              timestamp: new Date(data.created_at)
            }
          : msg
      ))

      return { success: true, message: data }
    } catch (err) {
      console.error('Error sending message:', err)
      
      // Update message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id 
          ? { ...msg, status: 'failed' }
          : msg
      ))

      return { success: false, error: err.message }
    }
  }, [chatId, user])

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping) => {
    if (!chatId || !user?.id) return

    const typingChannel = supabase.channel(`typing:${chatId}`)
    
    if (isTyping) {
      typingChannel.track({
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email,
        is_typing: true,
        timestamp: new Date().toISOString()
      })
    } else {
      typingChannel.untrack()
    }
  }, [chatId, user])

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds) => {
    if (!chatId || !user?.id || !messageIds.length) return

    try {
      // Update read receipts in database
      // This would require a separate read_receipts table
      // For now, we'll just update the local state
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id)
          ? { ...msg, readBy: [...new Set([...msg.readBy, user.id])] }
          : msg
      ))
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }, [chatId, user?.id])

  // Retry failed message
  const retryMessage = useCallback(async (messageId) => {
    const failedMessage = messages.find(msg => msg.id === messageId && msg.status === 'failed')
    if (!failedMessage) return

    // Update status to sending
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: 'sending' } : msg
    ))

    return sendMessage(failedMessage.content, failedMessage.type, {
      url: failedMessage.fileUrl,
      name: failedMessage.fileName,
      size: failedMessage.fileSize
    })
  }, [messages, sendMessage])

  // Delete message
  const deleteMessage = useCallback(async (messageId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user?.id) // Only allow users to delete their own messages

      if (error) throw error

      // Message will be removed via real-time subscription
      return { success: true }
    } catch (err) {
      console.error('Error deleting message:', err)
      return { success: false, error: err.message }
    }
  }, [user?.id])

  // Edit message
  const editMessage = useCallback(async (messageId, newContent) => {
    if (!newContent.trim()) return

    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: newContent.trim(),
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', user?.id) // Only allow users to edit their own messages

      if (error) throw error

      // Message will be updated via real-time subscription
      return { success: true }
    } catch (err) {
      console.error('Error editing message:', err)
      return { success: false, error: err.message }
    }
  }, [user?.id])

  return {
    messages,
    loading,
    error,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    retryMessage,
    deleteMessage,
    editMessage,
    refresh: loadMessages
  }
}

// Demo messages for when database is not configured
const getDemoMessages = (chatId, user) => {
  const otherUserId = chatId === '1' ? 'demo-user-1' : 'demo-user-2'
  const otherUserName = chatId === '1' ? 'John Doe' : 'Jane Smith'

  return [
    {
      id: '1',
      content: 'Hey! How are you doing?',
      senderId: otherUserId,
      senderName: otherUserName,
      senderAvatar: `https://images.unsplash.com/photo-${chatId === '1' ? '1472099645785-5658abf4ff4e' : '1494790108755-2616c2b9a6fe'}?w=256&h=256&fit=face`,
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      type: 'text',
      readBy: [user?.id],
      status: 'sent'
    },
    {
      id: '2',
      content: "I'm doing great! Just working on this messaging app. How about you?",
      senderId: user?.id,
      senderName: user?.user_metadata?.full_name || user?.email || 'You',
      senderAvatar: user?.user_metadata?.avatar_url,
      timestamp: new Date(Date.now() - 50 * 60 * 1000),
      type: 'text',
      readBy: [user?.id, otherUserId],
      status: 'sent'
    },
    {
      id: '3',
      content: 'That sounds exciting! What features are you adding?',
      senderId: otherUserId,
      senderName: otherUserName,
      senderAvatar: `https://images.unsplash.com/photo-${chatId === '1' ? '1472099645785-5658abf4ff4e' : '1494790108755-2616c2b9a6fe'}?w=256&h=256&fit=face`,
      timestamp: new Date(Date.now() - 40 * 60 * 1000),
      type: 'text',
      readBy: [user?.id],
      status: 'sent'
    },
    {
      id: '4',
      content: 'Real-time messaging, file sharing, AI features, and more! Want to test it out? 🚀',
      senderId: user?.id,
      senderName: user?.user_metadata?.full_name || user?.email || 'You',
      senderAvatar: user?.user_metadata?.avatar_url,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'text',
      readBy: [user?.id, otherUserId],
      status: 'sent'
    }
  ]
}

export default useRealTimeMessages
