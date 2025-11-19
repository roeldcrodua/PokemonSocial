# Web Development Final Project - Pokemon Social

**Deployed Site:** https://pokemonsocial.vercel.app

**Submitted by:** Roel Crodua

### This web app: 
- **Pokemon Social** is a full-featured social media web application built with React and Supabase that allows users to share and interact with Pokemon-themed posts.

- **Core Features:**
  - **Post Creation:** Users can create posts with titles, content, images (external URLs), and select Pokemon characters
  - **Interactive Feed:** Browse posts with sorting options (by time, likes, or comments) and search functionality
  - **Engagement System:** Like/unlike posts, add nested comments with edit capabilities, and view real-time interaction counts
  - **User Authentication:** Full Supabase authentication with profile management (avatars, display names, bios)
  - **Post Management:** Edit and delete your own posts with intuitive in-card controls
  - **Pokemon Integration:** Browse and search 1000+ Pokemon from PokeAPI in an 8×8 grid with hover previews
- **Technical Stack:**
  - **Frontend:** React 19 + Vite
  - **Backend:** Supabase (PostgreSQL with Row Level Security)
  - **APIs:** PokeAPI for Pokemon data
- **Features:** Infinite scroll pagination, optimistic UI updates, real-time count synchronization, image URL validation

**Time spent:** 20 hours spent in total

## Required Features

The following **required** functionality is completed:


- [x] **Web app includes a create form that allows the user to create posts**
  - Form requires users to add a post title
  - Forms should have the *option* for users to add: 
    - additional textual content
    - an image added as an external image URL
- [x] **Web app includes a home feed displaying previously created posts**
  - Web app must include home feed displaying previously created posts
  - By default, each post on the posts feed should show only the post's:
    - creation time
    - title 
    - upvotes count
  - Clicking on a post should direct the user to a new page for the selected post
- [x] **Users can view posts in different ways**
  - Users can sort posts by either:
    -  creation time
    -  upvotes count
  - Users can search for posts by title
- [x] **Users can interact with each post in different ways**
  - The app includes a separate post page for each created post when clicked, where any additional information is shown, including:
    - content
    - image
    - comments
  - Users can leave comments underneath a post on the post page
  - Each post includes an upvote button on the post page. 
    - Each click increases the post's upvotes count by one
    - Users can upvote any post any number of times

- [x] **A post that a user previously created can be edited or deleted from its post pages**
  - After a user creates a new post, they can go back and edit the post
  - A previously created post can be deleted from its post page

## Optional  Features
The following **optional** features are implemented:

- [x] Web app implements pseudo-authentication
  - Users can only edit and delete posts or delete comments by entering the secret key, which is set by the user during post creation
  - **or** upon launching the web app, the user is assigned a random user ID. It will be associated with all posts and comments that they make and displayed on them
  - For both options, only the original user author of a post can update or delete it
- [x] Users can repost a previous post by referencing its post ID
  - Users can repost a previous post by referencing its post ID
  - On the post page of the new post, the referenced post is displayed and linked, creating a thread
- [x] Users can customize the interface
  - e.g., selecting the color scheme or showing the content and image of each post on the home feed
- [x] Users can add more characterics to their posts
  - Users can share and view web videos
  - Users can set flags such as "Question" or "Opinion" while creating a post
  - Users can filter posts by flags on the home feed
  - Users can upload images directly from their local machine as an image file
- [x] Web app displays a loading animation whenever data is being fetched


## Video Walkthrough

Here's a walkthrough of implemented user stories:

<img src='https://github.com/roeldcrodua/PokemonSocial/blob/master/src/assets/demo.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />
<img src='https://github.com/roeldcrodua/PokemonSocial/blob/master/src/assets/demo1.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />
<img src='https://github.com/roeldcrodua/PokemonSocial/blob/master/src/assets/demo2.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />

<!-- Replace this with whatever GIF tool you used! -->
GIF created with Wondershare Uniconverter 14 Tool - GIF Maker
<!-- Recommended tools:
[Kap](https://getkap.co/) for macOS
[ScreenToGif](https://www.screentogif.com/) for Windows
[peek](https://github.com/phw/peek) for Linux. -->

## Notes

- Describe any challenges encountered while building the app.
  -- Supabase DB setup.
  -- Authorization setup in supabase.
- This project uses **Supabase** for backend, which handles auth, database, and storage
- **Pokemon data** is fetched from PokeAPI and cached locally
- **Image URLs** are external (not uploaded) to simplify storage
- **Repost feature** creates a new post with reference to original
- **Infinite scroll** improves UX for browsing large feeds
  
## 📁 Project Structure

```
PokemonSocial/
│
├── public/                          # Static assets
│   └── (favicon, images, etc.)
│
├── src/                             # Source code directory
│   ├── assets/                      # Application assets
│   │
│   ├── components/                  # React components (organized by feature)
│   │   ├── Auth/                    # Authentication components
│   │   │   ├── AuthModal.jsx        # Main authentication modal wrapper
│   │   │   ├── LoginForm.jsx        # Login form component
│   │   │   ├── SignupForm.jsx       # Registration form component
│   │   │   ├── ForgotPasswordForm.jsx # Password recovery form
│   │   │   └── Auth.css             # Authentication styling
│   │   │
│   │   ├── Comments/                # Comment system components
│   │   │   ├── CommentForm.jsx      # Comment creation/edit form
│   │   │   ├── CommentList.jsx      # Comment display with nested replies
│   │   │   └── Comments.css         # Comment styling
│   │   │
│   │   ├── Layout/                  # Layout components
│   │   │   ├── Navbar.jsx           # Top navigation bar
│   │   │   └── Footer.jsx           # Page footer
│   │   │
│   │   ├── Pokemon/                 # Pokemon-related components
│   │   │   └── (future components)
│   │   │
│   │   ├── Posts/                   # Post management components
│   │   │   ├── PostCard.jsx         # Individual post display card
│   │   │   ├── PostForm.jsx         # Post creation/edit form with repost
│   │   │   ├── PokemonSelector.jsx  # Pokemon selection modal (8×8 grid)
│   │   │   └── Posts.css            # Post styling
│   │   │
│   │   └── Profile/                 # User profile components
│   │       ├── ProfileHeader.jsx    # Profile header with avatar/bio
│   │       ├── ProfileStats.jsx     # User statistics display
│   │       └── Profile.css          # Profile styling
│   │
│   ├── context/                     # React Context providers
│   │   └── AuthContext.jsx          # Authentication state management
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── usePosts.js              # Hook for post data fetching
│   │   └── useProfile.js            # Hook for profile data fetching
│   │
│   ├── pages/                       # Page-level components (routes)
│   │   ├── HomePage.jsx             # Main feed with infinite scroll
│   │   ├── PostDetailPage.jsx       # Single post view with comments
│   │   ├── ProfilePage.jsx          # User profile page
│   │   ├── MyHeroesPage.jsx         # User's Pokemon collection
│   │   └── SearchPage.jsx           # Search results page
│   │
│   ├── services/                    # API service layer
│   │   ├── supabase.js              # Supabase client configuration
│   │   ├── postService.js           # Post CRUD operations
│   │   ├── commentService.js        # Comment CRUD operations
│   │   └── pokemonService.js        # PokeAPI integration
│   │
│   ├── utils/                       # Utility functions
│   │   └── dateUtils.js             # Date formatting utilities
│   │
│   ├── App.jsx                      # Main application component
│   ├── App.css                      # Global application styles
│   ├── main.jsx                     # Application entry point
│   └── index.css                    # Root CSS styles
│
├── .env                             # Environment variables (not in git)
├── .gitignore                       # Git ignore rules
├── eslint.config.js                 # ESLint configuration
├── index.html                       # HTML entry point
├── package.json                     # Dependencies and scripts
├── vite.config.js                   # Vite build configuration
└── README.md                        # Project documentation

```
### Data Flow
```
User Interaction
    ↓
Page Component
    ↓
Custom Hooks (usePosts, useProfile)
    ↓
Service Layer (postService, commentService)
    ↓
Supabase Client
    ↓
PostgreSQL Database
```

### Database Tables Summary
Here's a brief overview of all database tables and their columns
| **Table Name** | **Columns** |
|----------------|-------------|
| **profiles** | `user_id` (PK), `username`, `display_name`, `bio`, `avatar_url`, `created_at`, `updated_at` |
| **pokemon** | `pokemon_id` (PK), `name`, `imageUrl`, `smallUrl`, `types[]`, `height`, `weight`, `abilities[]`, `created_at` |
| **posts** | `post_id` (PK), `user_id` (FK), `content`, `image_url`, `pokemon_id` (FK), `repost_id` (FK), `repost_link`, `likes_count`, `comments_count`, `created_at`, `updated_at` |
| **comments** | `comment_id` (PK), `post_id` (FK), `user_id` (FK), `parent_id` (FK), `content`, `created_at`, `updated_at` |
| **likes** | `like_id` (PK), `post_id` (FK), `user_id` (FK), `created_at` |

### Key Relationships:
- **profiles** ↔ **posts** (1:N - user can create many posts)
- **pokemon** ↔ **posts** (1:N - one Pokemon can appear in many posts)
- **posts** ↔ **comments** (1:N - one post can have many comments)
- **posts** ↔ **likes** (1:N - one post can have many likes)
- **posts** ↔ **posts** (self-reference via `repost_id` for reposts)
- **comments** ↔ **comments** (self-reference via `parent_id` for nested replies)

---
### Entity Relationship Diagram
```
┌─────────────┐
│   auth.users│ (Supabase built-in)
└──────┬──────┘
       │
       │ 1:1
       ▼
┌─────────────┐         ┌──────────────┐
│  profiles   │         │   pokemon    │
│             │         │              │
│ user_id (PK)│         │ pokemon_id(PK)│
│ username    │         │ name         │
│ display_name│         │ imageUrl     │
│ bio         │         │ types[]      │
│ avatar_url  │         │ abilities[]  │
└──────┬──────┘         └──────┬───────┘
       │                       │
       │ 1:N                   │ 1:N
       │                       │
       │    ┌──────────────────┘
       │    │
       ▼    ▼
┌──────────────────┐
│      posts       │◄────┐ (self-referencing)
│                  │     │ repost_id
│ post_id (PK)     │─────┘
│ user_id (FK)     │
│ pokemon_id (FK)  │
│ content          │
│ repost_id (FK)   │
│ repost_link      │
│ likes_count      │
│ comments_count   │
└────┬────┬────────┘
     │    │
     │    │ 1:N
     │    │
     │    ▼
     │  ┌──────────────┐
     │  │   comments   │◄───┐ (self-referencing)
     │  │              │    │ parent_id
     │  │ comment_id(PK)────┘
     │  │ post_id (FK) │
     │  │ user_id (FK) │
     │  │ parent_id(FK)│
     │  │ content      │
     │  └──────────────┘
     │
     │ 1:N
     │
     ▼
┌──────────────┐
│    likes     │
│              │
│ like_id (PK) │
│ post_id (FK) │
│ user_id (FK) │
│              │
│ UNIQUE(post, │
│        user) │
└──────────────┘
```

### Application Routes

| Route              | Component          | Description                    | Auth Required |
|--------------------|--------------------|--------------------------------|---------------|
| `/`                | HomePage           | Main feed with posts           | No            |
| `/post/:postId`    | PostDetailPage     | Single post with comments      | No            |
| `/profile/:userId` | ProfilePage        | User profile view              | No            |
| `/my-heroes`       | MyHeroesPage       | User's Pokemon collection      | Yes           |
| `/search`          | SearchPage         | Search results                 | No            |

### Data Flow Examples

#### Creating a Post
1. User fills PostForm component
2. PostForm validates input
3. Calls `postService.createPost()`
4. Service inserts into Supabase
5. Database triggers update counts
6. UI updates via state refresh

#### Liking a Post
1. User clicks like button
2. Optimistic UI update (immediate feedback)
3. PostCard calls `postService` to toggle like
4. Database inserts/deletes like record
5. RPC function updates cached count
6. Actual count reloaded from database

#### Reposting
1. User clicks 🔁 Repost button
2. Navigate to home with `?repost=ID` parameter
3. HomePage detects parameter, opens PostForm
4. PostForm auto-fetches original post data
5. User adds commentary, submits
6. New post created with `repost_id` and `repost_link`
7. Original post link displayed in new post card
   
## License

    Copyright 2025 Roel Crodua

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
