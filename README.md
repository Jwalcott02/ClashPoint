# Web Development Final Project - *ClashPoint*

Submitted by: **Justice Walcott**

This web app: **ClashPoint is a debate forum where users can create debate posts, upvote their favorite arguments, leave comments, and get AI-generated summaries of debates. It's a place where ideas collide.**

Time spent: **10** hours spent in total

https://clashpoint-debates.netlify.app/

## Required Features

The following **required** functionality is completed:

- [x] **Web app includes a create form that allows the user to create posts**
  - Form requires users to add a post title
  - Forms have the *option* for users to add: 
    - additional textual content
    - an image added as an external image URL
- [x] **Web app includes a home feed displaying previously created posts**
  - Web app includes home feed displaying previously created posts
  - By default, each post on the posts feed shows only the post's:
    - creation time
    - title 
    - upvotes count
  - Clicking on a post directs the user to a new page for the selected post
- [x] **Users can view posts in different ways**
  - Users can sort posts by either:
    - creation time
    - upvotes count
  - Users can search for posts by title
- [x] **Users can interact with each post in different ways**
  - The app includes a separate post page for each created post when clicked, where any additional information is shown, including:
    - content
    - image
    - comments
  - Users can leave comments underneath a post on the post page
  - Each post includes an upvote button on the post page
    - Each click increases the post's upvotes count by one
    - Users can upvote any post any number of times

- [x] **A post that a user previously created can be edited or deleted from its post pages**
  - After a user creates a new post, they can go back and edit the post
  - A previously created post can be deleted from its post page

The following **optional** features are implemented:

- [x] Web app implements pseudo-authentication
  - Users can only edit and delete posts by entering the secret key, which is set by the user during post creation
  - Only the original author of a post can update or delete it
- [x] Users can repost a previous post by referencing its post ID
  - Users can repost a previous post by referencing its post ID
  - On the post page of the new post, the referenced post is displayed and linked, creating a thread

The following **additional** features are implemented:

* AI-powered debate summary using Groq's LLaMA model — generates a 2-3 sentence summary of any debate including upvotes and comment sentiment
* Dark theme UI inspired by Reddit's layout with ClashPoint's own visual identity
* Search bar to filter debates by title in real time
* Popular and Explore views in the left sidebar
* Post ID displayed on feed cards for easy reposting
* Secret key protection modal for editing and deleting posts
* Access denied screen if someone tries to bypass edit protection via URL

## Video Walkthrough

Here's a walkthrough of implemented user stories:
<div>
    <a href="https://www.loom.com/share/1243a35aea7f4ca2956fdb727bcb1376">
      <p>ClashPoint - Watch Video</p>
    </a>
    <a href="https://www.loom.com/share/1243a35aea7f4ca2956fdb727bcb1376">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/1243a35aea7f4ca2956fdb727bcb1376-b8fe746d5b07bca6-full-play.gif#t=0.1">
    </a>
  </div>


GIF created with Loom

## Notes

The biggest challenge was implementing the comments system using a jsonb column in Supabase instead of a separate table, and getting the AI summary to work cross-origin without exposing the API key. Ended up using Groq's free LLaMA API which supports browser-based requests.

## License

    Copyright 2026 Justice Walcott

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
