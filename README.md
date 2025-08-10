# ChatApp - Real-time Messaging Application

A modern, real-time messaging web application built with React, Supabase, and AI-powered features using the Vercel AI SDK.

## 🚀 Features

### Core Messaging
- **Real-time messaging** with WebSocket integration
- **Individual and group chats** with member management
- **Message status indicators** (sent, delivered, read)
- **Typing indicators** for enhanced user experience
- **File and image sharing** with upload progress
- **Message read receipts** and timestamps

### AI-Powered Features
- **AI Chat Assistant** for intelligent conversations
- **Smart Translation** supporting 10+ languages
- **Conversation Summarization** for long chat threads
- **Reply Suggestions** powered by AI
- Integrated with **Vercel AI SDK** for extensibility

### Authentication & Security
- **Supabase Auth** with email/password and social login
- **Google & GitHub OAuth** integration
- **Email verification** and password reset
- **Role-based access control** (User, Moderator, Admin)
- **Secure file uploads** with type and size validation

### User Experience
- **Mobile-first responsive design** with PWA support
- **Dark/Light theme** with system preference detection
- **Accessibility compliant** (WCAG 2.1 AA)
- **Keyboard navigation** and screen reader support
- **Offline-first** architecture with service workers

### Admin Features
- **User management** dashboard with moderation tools
- **Real-time analytics** and system monitoring
- **Content moderation** with automated flagging
- **Bulk operations** for user management

## 🛠️ Tech Stack

### Frontend
- **React 18** with Hooks and Context API
- **React Router** for navigation
- **Vite** for development and building
- **CSS Variables** for theming
- **Lucide React** for icons

### Backend & Services
- **Supabase** for authentication, database, and real-time features
- **WebSocket** for instant messaging
- **Vercel AI SDK** for AI capabilities
- **Supabase Storage** for file uploads

### Development Tools
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** (optional, can be added)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/chatapp.git
   cd chatapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_WEBSOCKET_URL=ws://localhost:3001
   ```

4. **Set up Supabase** 📖 [Detailed Setup Guide](SUPABASE_SETUP.md)

   **Quick Setup:**
   ```bash
   # Option 1: Use the setup script
   node setup-supabase.js "https://your-project.supabase.co" "your-anon-key"

   # Option 2: Manual setup
   # 1. Create project at supabase.com
   # 2. Copy Project URL and anon key to .env
   # 3. Execute supabase-schema.sql in SQL Editor
   ```

   **Database Setup:**
   - Execute the complete schema: `supabase-schema.sql`
   - Configure Row Level Security policies
   - Set up storage buckets for file uploads
   - Enable real-time subscriptions

5. **Configure AI Backend** 🤖 [AI Setup Guide](AI_BACKEND_SETUP.md)

   **Quick AI Setup:**
   ```bash
   # Add AI API keys to .env
   VITE_OPENAI_API_KEY=sk-your-openai-key
   VITE_ANTHROPIC_API_KEY=your-anthropic-key
   VITE_GOOGLE_TRANSLATE_API_KEY=your-google-key
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ai/             # AI-related components
│   ├── chat/           # Chat functionality
│   └── dashboard/      # Dashboard components
├── contexts/           # React contexts
│   ├── AuthContext.jsx # Authentication state
│   └── WebSocketContext.jsx # WebSocket management
├── hooks/              # Custom React hooks
├��─ lib/                # Utility libraries
├── pages/              # Route components
├── styles/             # Global styles
└── api/                # API integration
```

## 🎨 Builder.io Integration

This project includes a comprehensive Builder.io schema for visual development:

- **Exportable React components** with proper props
- **JSON component schema** for Builder.io CMS
- **Custom data models** for users, chats, and messages
- **Pre-configured integrations** for Supabase and AI services

Import `src/builder-schema.json` into your Builder.io project to get started.

## 🔧 Configuration

### Supabase Setup

1. **Database Tables**
   ```sql
   -- Users profiles table
   create table profiles (
     id uuid references auth.users on delete cascade,
     full_name text,
     avatar_url text,
     bio text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     primary key (id)
   );

   -- Chats table
   create table chats (
     id uuid default gen_random_uuid() primary key,
     name text not null,
     type text check (type in ('direct', 'group')) default 'direct',
     avatar_url text,
     description text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Messages table
   create table messages (
     id uuid default gen_random_uuid() primary key,
     chat_id uuid references chats(id) on delete cascade,
     sender_id uuid references auth.users(id) on delete cascade,
     content text not null,
     type text check (type in ('text', 'file', 'image', 'video', 'audio')) default 'text',
     file_url text,
     file_name text,
     file_size bigint,
     metadata jsonb,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```

2. **Row Level Security (RLS)**
   ```sql
   alter table profiles enable row level security;
   alter table chats enable row level security;
   alter table messages enable row level security;

   -- Add appropriate RLS policies
   ```

3. **Storage Buckets**
   - `avatars` - User profile pictures
   - `chat-files` - Shared files and media

### WebSocket Server

For real-time messaging, you'll need a WebSocket server. Example using Socket.io:

```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('send-message', (messageData) => {
    io.to(messageData.chatId).emit('new-message', messageData);
  });

  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('user-typing', data);
  });
});
```

## 🔐 Authentication Flow

1. **Sign Up** - Email/password or social OAuth
2. **Email Verification** - Required for new accounts
3. **Profile Setup** - Complete user profile
4. **Dashboard Access** - Full chat functionality

### Supported Providers
- Google OAuth
- GitHub OAuth
- Email/Password
- Magic Link (optional)

## 🤖 AI Features

### Vercel AI SDK Integration

```javascript
import { useChat } from 'ai/react'

const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: '/api/chat',
  initialMessages: []
})
```

### Available AI Features
- **Chat Assistant** - General purpose AI chat
- **Translation** - Multi-language message translation
- **Summarization** - Conversation summary generation
- **Smart Replies** - AI-generated response suggestions

## 📱 Mobile Features

- **Responsive design** optimized for mobile devices
- **Touch gestures** for navigation
- **PWA support** with offline capabilities
- **Push notifications** (configurable)
- **App-like experience** with proper viewport settings

## ♿ Accessibility

- **WCAG 2.1 AA compliant**
- **Keyboard navigation** throughout the app
- **Screen reader support** with proper ARIA labels
- **High contrast mode** support
- **Reduced motion** respect for user preferences
- **Focus management** for modals and navigation

## 🔧 Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Code Style
- Use functional components with hooks
- Follow React best practices
- Maintain component modularity
- Use semantic HTML elements
- Implement proper error boundaries

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variables

### Self-hosting
1. Run `npm run build`
2. Serve the `dist` directory
3. Configure WebSocket server separately

## 🔒 Security Considerations

- **Input sanitization** for all user inputs
- **File type validation** for uploads
- **Rate limiting** on API endpoints
- **CORS configuration** for production
- **Environment variable security**
- **Regular dependency updates**

## 📊 Performance

- **Code splitting** with React.lazy
- **Image optimization** with lazy loading
- **Caching strategies** for API responses
- **Bundle size optimization**
- **WebSocket connection pooling**

## 🧪 Testing

```bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:coverage # Generate coverage report
```

### Testing Strategy
- Unit tests for components and hooks
- Integration tests for user flows
- E2E tests for critical paths
- Accessibility testing with axe

## 📈 Analytics & Monitoring

- **User engagement** tracking
- **Performance monitoring** with Core Web Vitals
- **Error tracking** with proper logging
- **Real-time usage** statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Update documentation for new features
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: Use GitHub Discussions for questions
- **Email**: support@chatapp.com

## 🔮 Roadmap

- [ ] Voice/Video calling integration
- [ ] Message encryption (E2E)
- [ ] Advanced AI features (sentiment analysis)
- [ ] Multi-language UI support
- [ ] Desktop app (Electron)
- [ ] Advanced admin analytics
- [ ] Plugin system for extensions

## 💰 Pricing & Plans

This is an open-source project. For commercial use or hosted solutions, contact us for enterprise licensing.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Vercel](https://vercel.com) for AI SDK and hosting
- [Lucide](https://lucide.dev) for the beautiful icons
- [React](https://reactjs.org) team for the amazing framework

---

**Built with ❤️ by the ChatApp Team**
