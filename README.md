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

<!-- Replace this with whatever GIF tool you used! -->
GIF created with Wondershare Uniconverter 14 Tool - GIF Maker
<!-- Recommended tools:
[Kap](https://getkap.co/) for macOS
[ScreenToGif](https://www.screentogif.com/) for Windows
[peek](https://github.com/phw/peek) for Linux. -->

## Notes

Describe any challenges encountered while building the app.
 - Supabase DB setup.
 - Authorization setup in supabase.
 
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