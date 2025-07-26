# Lovelane - Dating App

## Overview

Lovelane is a modern dating application built with a React frontend and Express backend, featuring real-time chat capabilities and a swipe-based matching system. The application uses Firebase for authentication and Firestore for real-time data synchronization. All user data, matches, messages, and swipes are stored in Firebase Firestore. The app includes complete Tinder-style functionality with swipe cards, match detection, real-time chat, and Cloudinary image uploads.

## Recent Changes (January 26, 2025)

✓ Fixed Firebase configuration with user-provided secrets
✓ Enhanced match display with user profiles and photos  
✓ Implemented full chat navigation between matches and chat screens
✓ Added Cloudinary integration for image uploads with credentials
✓ Fixed Firestore query compatibility issues
✓ Removed unused PostgreSQL/Drizzle storage interface
✓ Completed all core dating app features: swipe, match, chat

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Firebase Auth integration
- **Real-time Data**: Firebase Firestore for live updates

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Storage Interface**: Abstract storage layer with in-memory implementation for development

### Mobile-First Design
- Responsive design optimized for mobile devices
- Touch-friendly swipe gestures for card interactions
- Bottom navigation pattern for mobile app feel

## Key Components

### Authentication System
- Firebase Authentication for user management
- Protected routes based on authentication state
- User profile setup flow for new users
- Session persistence across app reloads

### Core Features
1. **User Profiles**: Complete profile management with multiple photos, bio, interests, and preferences
2. **Discovery System**: Swipe-based interface for browsing potential matches
3. **Matching Algorithm**: Bidirectional matching system (both users must like each other)
4. **Real-time Chat**: Firebase Firestore-powered messaging between matched users
5. **Image Upload**: Cloudinary integration for profile photo management

### Data Models
- **UserProfile**: Comprehensive user information including preferences and photos
- **Match**: Relationship records between matched users
- **Swipe**: User interaction records (like/dislike)
- **Message**: Chat message data with real-time synchronization

## Data Flow

### User Registration Flow
1. Firebase Auth creates user account
2. User completes profile setup with photos and preferences
3. Profile data stored in Firestore for real-time access
4. User can begin discovering potential matches

### Matching Process
1. Users swipe on potential matches based on preferences
2. Swipe data recorded in Firestore
3. When mutual likes occur, a match is created
4. Match modal displayed to both users
5. Chat becomes available between matched users

### Real-time Chat
1. Messages stored in Firestore with automatic real-time updates
2. Message ordering by timestamp
3. Image sharing capabilities through Cloudinary
4. Auto-scroll to new messages

## External Dependencies

### Authentication & Database
- **Firebase**: Authentication, Firestore real-time database
- **Neon Database**: PostgreSQL hosting for structured data
- **Drizzle ORM**: Type-safe database operations

### Media & Storage
- **Cloudinary**: Image upload, transformation, and CDN delivery

### Development & Build Tools
- **Vite**: Fast development server and build optimization
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first styling framework
- **Replit Integration**: Development environment optimization

### UI & Interaction
- **Radix UI**: Accessible, unstyled component primitives
- **TanStack Query**: Server state management and caching
- **Embla Carousel**: Touch-friendly image carousels
- **React Hook Form**: Form validation and management

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend development
- Express server with tsx for TypeScript execution
- Environment variables for Firebase and Cloudinary configuration
- Replit-specific optimizations for cloud development

### Production Build
- Vite builds optimized static assets
- esbuild bundles Express server for Node.js deployment
- Database migrations managed through Drizzle Kit
- Environment-based configuration for different deployment stages

### Database Management
- Drizzle migrations for schema versioning
- Connection pooling through Neon's serverless architecture
- Shared schema definitions between frontend and backend

The application follows a modern full-stack architecture with clear separation between client and server concerns, leveraging cloud services for scalability and real-time capabilities while maintaining type safety throughout the codebase.