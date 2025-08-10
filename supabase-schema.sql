-- ChatApp Database Schema for Supabase
-- Execute this in your Supabase SQL Editor

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

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

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

-- Enable RLS on chats
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

-- Enable RLS on chat_members
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

-- Enable RLS on messages
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

-- Enable realtime for tables
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.chats;
alter publication supabase_realtime add table public.chat_members;
alter publication supabase_realtime add table public.profiles;

-- Create storage bucket for chat files (run this after creating the bucket in UI)
-- insert into storage.buckets (id, name, public) values ('chat-files', 'chat-files', true);

-- Storage policies for chat files
create policy "Users can upload files" on storage.objects
  for insert with check (bucket_id = 'chat-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view files" on storage.objects
  for select using (bucket_id = 'chat-files');

create policy "Users can delete their own files" on storage.objects
  for delete using (bucket_id = 'chat-files' and auth.uid()::text = (storage.foldername(name))[1]);
