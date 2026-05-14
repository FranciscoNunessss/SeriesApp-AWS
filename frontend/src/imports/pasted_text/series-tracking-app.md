Design a clean, modern, responsive web app frontend for a project called “Series Tracking Platform”.

Project context:
This platform manages TV series, seasons, episodes, watched episodes, watch history, and user progress.
The backend API already exists, and the UI must be designed around these available endpoints.

Available API endpoints:

Health
- GET /health

Users
- GET /api/v1/users/
- POST /api/v1/users/
- GET /api/v1/users/{user_id}
- PUT /api/v1/users/{user_id}

Series
- GET /api/v1/series/
- POST /api/v1/series/
- GET /api/v1/series/{series_id}
- PUT /api/v1/series/{series_id}
- DELETE /api/v1/series/{series_id}

Seasons
- GET /api/v1/series/{series_id}/seasons
- POST /api/v1/series/{series_id}/seasons
- GET /api/v1/seasons/{season_id}
- PUT /api/v1/seasons/{season_id}
- DELETE /api/v1/seasons/{season_id}

Episodes
- GET /api/v1/seasons/{season_id}/episodes
- POST /api/v1/seasons/{season_id}/episodes
- GET /api/v1/episodes/{episode_id}
- PUT /api/v1/episodes/{episode_id}
- DELETE /api/v1/episodes/{episode_id}

Watched / History / Progress
- POST /api/v1/watched-episodes
- GET /api/v1/users/{user_id}/history
- GET /api/v1/users/{user_id}/progress/{series_id}

Important product constraints:
- There is no authentication yet
- There is no login screen
- The app should use a “Current Active User” selector
- The UI should be realistic and only include flows supported by the API
- User deletion is not supported
- Progress is available per user and per series, not as a global dashboard endpoint unless simulated in the design

Goal:
Design a basic but complete MVP frontend that fits these backend capabilities and is easy to implement later in React.

Main user flows:
1. Choose an active user
2. Create and edit users
3. Browse all series
4. Create, edit, and delete series
5. Open a series detail page
6. View and create seasons for a series
7. Open a season detail page
8. View and create episodes for a season
9. Mark an episode as watched
10. Optionally rate a watched episode
11. View a user’s watch history
12. View a user’s progress for a selected series

Design the following screens:

1. App shell / layout
- top navbar or left sidebar
- app title: Series Tracking Platform
- visible current active user selector in header
- navigation items: Users, Series, History
- responsive layout for desktop and tablet

2. Users page
Purpose:
Manage users and choose the active user.

Include:
- page title
- list of users
- create user form
- edit user modal or drawer
- active user selector
- fields: username, email
- empty state when no users exist
- success and error feedback states

3. Series list page
Purpose:
Browse and manage series.

Include:
- page title
- search input
- optional filters
- button to add new series
- grid or table of series
- each series card/row should show:
  - title
  - description preview
  - genre
  - release year
  - status
  - total seasons
- actions:
  - view details
  - edit
  - delete
- empty, loading, and error states

4. Create/Edit series form
Fields:
- title
- description
- genre
- release_year
- status
- total_seasons

Style:
- clean form layout
- form validation messages
- save and cancel actions

5. Series detail page
Purpose:
Show series info, seasons, and selected-user progress for this series.

Include:
- series header with title and metadata
- description block
- seasons list for that series
- button to create season
- edit series action
- delete series action
- progress widget for current active user in this series
- percentage watched
- watched episodes vs total episodes
- progress bar
- CTA to view season details

6. Create/Edit season form
Fields:
- season_number
- release_year

Context:
- season belongs to a specific series
- clean compact form or modal

7. Season detail page
Purpose:
Show season data and episodes.

Include:
- season header
- link back to parent series
- episodes table or card list
- button to add episode
- each episode should show:
  - episode_number
  - title
  - duration_minutes
  - synopsis
- actions:
  - edit episode
  - delete episode
  - mark as watched
- watched badge for episodes already watched by the active user
- optional rating UI when marking watched

8. Create/Edit episode form
Fields:
- episode_number
- title
- duration_minutes
- synopsis

9. Mark episode as watched interaction
Purpose:
Support POST /api/v1/watched-episodes

Include:
- modal, drawer, or inline action
- selected episode info
- current active user shown clearly
- optional rating input from 1 to 10
- confirm button
- already watched state should be visually distinct
- error state for duplicate watched action

10. User history page
Purpose:
Show watched history for the active user or selected user.

Include:
- page title
- selected user context
- list or table of watched items
- sort by watched date descending
- each item should show:
  - series title
  - season number
  - episode number
  - episode title
  - watched_at date
  - rating if available
- empty state when user has no watched history

11. User progress view
Purpose:
Show progress for one user in one selected series.

Include:
- selected user
- selected series
- progress percentage
- watched episodes count
- remaining episodes count
- progress bar
- clean summary card
- this can be a section inside Series Detail or a dedicated modal/panel

Design requirements:
- modern dashboard style
- simple and realistic MVP
- easy to implement in React
- clean information hierarchy
- accessible contrast
- consistent spacing
- rounded cards
- subtle shadows
- neutral color palette with one accent color
- polished but not overly complex
- reusable components
- clear CRUD actions
- include loading, empty, success, and error states
- include confirmation modal for delete actions

Components to design:
- navbar or sidebar
- page header
- user selector dropdown
- cards
- tables/lists
- forms
- modals
- badges
- progress bars
- buttons
- input fields
- textareas
- toast notifications
- confirmation dialog

Visual style:
- modern admin dashboard
- media tracking app feel
- light theme preferred
- clean, soft, minimal, professional
- UX clarity over decoration

Output requirements:
- produce all main desktop screens
- include tablet-responsive versions for key pages
- include a small design system section with:
  - color palette
  - typography
  - buttons
  - form fields
  - cards
  - badges
  - progress bar
  - modal
- keep the UI realistic and directly based on the provided API