# Croch-Aide: Crochet Learning & Tutoring Platform

A modern web application for connecting crochet enthusiasts with tutors, managing events, and getting real-time help with crochet projects.

## Features

- User authentication (Email/Password and Google login)
- Interactive event booking system
- Real-time chat with tutors
- Image sharing for project help
- Admin dashboard for event and user management
- Real-time notifications

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth & Firestore)
- **Real-time Features**: Socket.io
- **Image Storage**: Cloudinary
- **Calendar Integration**: Google Calendar API

## Project Structure

```
src/
├── app/                    # Next.js 14 app directory
├── components/            
│   ├── auth/              # Authentication components
│   ├── events/            # Event booking components
│   ├── chat/              # Chat interface components
│   ├── admin/             # Admin dashboard components
│   └── ui/                # Shared UI components
├── lib/                   # Utility functions and configurations
└── styles/                # Global styles and Tailwind config

```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
   NEXT_PUBLIC_CLOUDINARY_API_KEY=
   NEXT_PUBLIC_CLOUDINARY_API_SECRET=
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Workflow

1. Create a new branch for each feature
2. Follow TypeScript best practices
3. Use Tailwind CSS for styling
4. Test components thoroughly
5. Submit PR for review

## Firebase Configuration

### Prerequisites
1. Node.js 18+ and npm
2. Firebase account and project
3. Firebase CLI (`npm install -g firebase-tools`)

### Firebase Setup
1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase project:
```bash
firebase init
```

4. Deploy Firebase configuration:
```bash
firebase deploy --only firestore:rules,storage:rules
```

### Security Rules
The application uses custom security rules for Firestore and Storage:
- Users can only read and update their own data
- Events are publicly readable but only admins can create/update
- Chat messages are only accessible to conversation participants
- File uploads are restricted based on user roles and ownership

### Database Structure
```
/users
  /{userId}
    - basic info
    - role (user/admin/tutor)
    - skill level

/events
  /{eventId}
    - details
    - capacity
    - skill level

/bookings
  /{bookingId}
    - user reference
    - event reference
    - status

/chatRooms
  /{roomId}
    - participants
    - messages
```

### Deployment
1. Build the application:
```bash
npm run build
```

2. Deploy to Firebase Hosting:
```bash
npm run deploy
```

Or deploy specific features:
```bash
npm run deploy:hosting    # Deploy only hosting
npm run deploy:rules      # Deploy only security rules
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
