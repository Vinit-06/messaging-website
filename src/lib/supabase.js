import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Auth helpers
export const signInWithProvider = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin + '/dashboard'
    }
  })
  return { data, error }
}

export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signUpWithEmail = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

export const getCurrentSession = () => {
  return supabase.auth.getSession()
}

// Chat Operations
export const createChat = async (name, type = 'group', description = '') => {
  const { data, error } = await supabase
    .from('chats')
    .insert({
      name,
      type,
      description,
      created_by: (await getCurrentUser()).data.user?.id
    })
    .select()
    .single()

  if (error) return { data: null, error }

  // Add creator as admin member
  const { error: memberError } = await supabase
    .from('chat_members')
    .insert({
      chat_id: data.id,
      user_id: (await getCurrentUser()).data.user?.id,
      role: 'admin'
    })

  return { data, error: memberError }
}

export const getUserChats = async () => {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      *,
      chat_members!inner(role),
      messages(content, created_at)
    `)
    .eq('chat_members.user_id', (await getCurrentUser()).data.user?.id)
    .order('last_message_at', { ascending: false })

  return { data, error }
}

export const getChatMessages = async (chatId, limit = 50) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      profiles!messages_user_id_fkey(full_name, avatar_url)
    `)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

export const sendMessage = async (chatId, content, messageType = 'text', fileUrl = null, fileName = null, fileSize = null) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      user_id: (await getCurrentUser()).data.user?.id,
      content,
      message_type: messageType,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize
    })
    .select(`
      *,
      profiles!messages_user_id_fkey(full_name, avatar_url)
    `)
    .single()

  return { data, error }
}

export const addChatMember = async (chatId, userId, role = 'member') => {
  const { data, error } = await supabase
    .from('chat_members')
    .insert({
      chat_id: chatId,
      user_id: userId,
      role
    })

  return { data, error }
}

export const removeChatMember = async (chatId, userId) => {
  const { data, error } = await supabase
    .from('chat_members')
    .delete()
    .eq('chat_id', chatId)
    .eq('user_id', userId)

  return { data, error }
}

export const updateUserStatus = async (status) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      status,
      last_seen: new Date().toISOString()
    })
    .eq('id', (await getCurrentUser()).data.user?.id)

  return { data, error }
}

export const searchUsers = async (query) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, status')
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(10)

  return { data, error }
}

// File Upload
export const uploadFile = async (file, userId) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('chat-files')
    .upload(fileName, file)

  if (error) return { data: null, error }

  const { data: { publicUrl } } = supabase.storage
    .from('chat-files')
    .getPublicUrl(fileName)

  return { data: { ...data, publicUrl }, error: null }
}

// Real-time subscriptions
export const subscribeToMessages = (chatId, callback) => {
  return supabase
    .channel(`messages:${chatId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
      callback
    )
    .subscribe()
}

export const subscribeToChats = (userId, callback) => {
  return supabase
    .channel(`chats:${userId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'chats' },
      callback
    )
    .subscribe()
}
