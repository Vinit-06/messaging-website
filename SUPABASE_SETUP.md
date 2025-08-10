# Supabase Configuration Guide

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New project"
3. Choose your organization
4. Enter project name (e.g., "chatapp-messaging")
5. Create a strong database password
6. Select a region close to your users
7. Click "Create new project"

## Step 2: Get Your Project Credentials

1. Go to Project Settings → API
2. Copy your Project URL (starts with `https://`)
3. Copy your `anon` public key from the API Keys section

## Step 3: Configure Environment Variables

Replace the values in your `.env` file with your actual Supabase credentials:

```env
# Replace these with your actual Supabase values
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here

# Keep other existing variables
VITE_WEBSOCKET_URL=ws://localhost:3001
VITE_APP_NAME=ChatApp
```

## Step 4: Set Up Database Schema

Execute the following SQL in your Supabase SQL Editor:

### 1. Enable Realtime
```sql
-- Enable realtime on public schema
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.chats;
alter publication supabase_realtime add table public.chat_members;
```

### 2. Create User Profiles Table
```sql
-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  status text default 'offline' check (status in ('online', 'offline', 'away', 'busy')),
  last_seen timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);
```

### 3. Create Chats Table
```sql
-- Create chats table
create table public.chats (
  id uuid default gen_random_uuid() primary key,
  name text,
  description text,
  type text default 'direct' check (type in ('direct', 'group')),
  avatar_url text,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_message_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.chats enable row level security;

-- Chats policies
create policy "Users can view chats they are members of" on public.chats
  for select using (
    exists (
      select 1 from public.chat_members
      where chat_members.chat_id = chats.id
      and chat_members.user_id = auth.uid()
    )
  );

create policy "Users can create chats" on public.chats
  for insert with check (auth.uid() = created_by);

create policy "Chat creators and admins can update chats" on public.chats
  for update using (
    auth.uid() = created_by or
    exists (
      select 1 from public.chat_members
      where chat_members.chat_id = chats.id
      and chat_members.user_id = auth.uid()
      and chat_members.role = 'admin'
    )
  );
```

### 4. Create Chat Members Table
```sql
-- Create chat_members table
create table public.chat_members (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member' check (role in ('admin', 'moderator', 'member')),
  joined_at timestamp with time zone default now(),
  last_read_at timestamp with time zone default now(),
  unique(chat_id, user_id)
);

-- Enable RLS
alter table public.chat_members enable row level security;

-- Chat members policies
create policy "Users can view chat members for chats they belong to" on public.chat_members
  for select using (
    exists (
      select 1 from public.chat_members cm
      where cm.chat_id = chat_members.chat_id
      and cm.user_id = auth.uid()
    )
  );

create policy "Chat admins can manage members" on public.chat_members
  for all using (
    exists (
      select 1 from public.chat_members cm
      where cm.chat_id = chat_members.chat_id
      and cm.user_id = auth.uid()
      and cm.role in ('admin')
    )
  );

create policy "Users can join chats (insert themselves)" on public.chat_members
  for insert with check (auth.uid() = user_id);
```

### 5. Create Messages Table
```sql
-- Create messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text,
  message_type text default 'text' check (message_type in ('text', 'image', 'file', 'system')),
  file_url text,
  file_name text,
  file_size bigint,
  edited_at timestamp with time zone,
  replied_to uuid references public.messages(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.messages enable row level security;

-- Messages policies
create policy "Users can view messages in chats they belong to" on public.messages
  for select using (
    exists (
      select 1 from public.chat_members
      where chat_members.chat_id = messages.chat_id
      and chat_members.user_id = auth.uid()
    )
  );

create policy "Users can send messages to chats they belong to" on public.messages
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.chat_members
      where chat_members.chat_id = messages.chat_id
      and chat_members.user_id = auth.uid()
    )
  );

create policy "Users can edit their own messages" on public.messages
  for update using (auth.uid() = user_id);

create policy "Users can delete their own messages" on public.messages
  for delete using (auth.uid() = user_id);
```

### 6. Create Functions and Triggers
```sql
-- Function to handle new user signups
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update last_message_at in chats
create or replace function public.update_chat_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.chats
  set last_message_at = now()
  where id = new.chat_id;
  return new;
end;
$$;

-- Trigger to update chat timestamp on new message
create trigger on_message_created
  after insert on public.messages
  for each row execute procedure public.update_chat_last_message();
```

### 7. Enable Realtime
```sql
-- Enable realtime for tables
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.chats;
alter publication supabase_realtime add table public.chat_members;
alter publication supabase_realtime add table public.profiles;
```

## Step 5: Configure OAuth Providers (Optional)

### Google OAuth
1. Go to Project Settings → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials

### GitHub OAuth
1. Go to Project Settings → Authentication → Providers
2. Enable GitHub provider
3. Add your GitHub OAuth credentials

## Step 6: Configure Storage for File Uploads

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `chat-files`
3. Set it to public or configure appropriate policies

```sql
-- Storage policies for chat files
create policy "Users can upload files" on storage.objects
  for insert with check (bucket_id = 'chat-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view files" on storage.objects
  for select using (bucket_id = 'chat-files');

create policy "Users can delete their own files" on storage.objects
  for delete using (bucket_id = 'chat-files' and auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 7: Test Your Configuration

1. Restart your development server
2. Try signing up with email
3. Try logging in
4. Create a test chat
5. Send a test message

Your app should now be fully connected to Supabase!
