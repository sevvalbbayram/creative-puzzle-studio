# Creativity Jigsaw Puzzle Game

## Overview

A classroom-ready, web-based jigsaw puzzle game where players assemble an elephant-themed image while matching the stages of creativity (Preparation, Incubation, Illumination, Evaluation, Elaboration) with their corresponding quotes. Features a Game Master role with full control and a real-time multiplayer experience.

## Core Features

### 1. Landing Page & Game Lobby

- Clean, inviting landing page with the game title "Creativity is..." and a playful design
- **Game Master**: Can create a new game session, generating a unique shareable link
- **Players**: Join via the shared link, enter a nickname, and wait in a lobby
- Game Master sees a live list of connected players and can start the round when ready

### 2. The Puzzle Image

- A well-designed, aesthetically pleasing elephant illustration (whimsical, colorful, classroom-friendly) used as the puzzle background
- The image is embedded as a static asset

### 3. Jigsaw Puzzle Mechanics

- **Two-phase gameplay:**
  - **Phase 1 – Stage Names**: Players first place the 5 creativity stage name pieces (Preparation, Incubation, Illumination, Evaluation, Elaboration) into the correct positions on the puzzle board
  - **Phase 2 – Quotes**: After stages are placed, quote pieces become available to match with their corresponding stage
- True jigsaw-style piece segmentation with drag-and-drop on desktop and touch/tap on mobile
- Snap-to-grid behavior — pieces lock into place when dropped near the correct position
- Visual and audio feedback for correct placements and incorrect attempts

### 4. Game Master Controls

- Start/stop game rounds
- Set difficulty level (Easy / Medium / Hard / Very Hard — affects time limits)
- View live scoreboard during gameplay
- Kick players from the session
- Reset or start a new round

### 5. Scoring & Feedback

- **Timer**: Counts elapsed time per player
- **Points system**: Points awarded based on speed and accuracy (fewer incorrect attempts = higher score)
- **Correct/Incorrect alerts**: Clear visual feedback (green flash for correct, red shake for incorrect)
- **Difficulty multiplier**: Harder difficulty levels award more points

### 6. Real-Time Leaderboard & Scoreboard

- Live scoreboard visible to Game Master during the game
- Post-round results screen showing rankings for all players
- Persistent all-time leaderboard saved across sessions

### 7. Backend (Supabase)

- **Database tables**: Players, game sessions, scores, leaderboard history
- **Real-time**: Live updates for lobby, scoreboard, and game state using Supabase Realtime
- **Authentication**: Simple nickname-based entry (no full account signup required), Game Master identified via session creator role
- **Persistent storage**: All-time leaderboard and past game results saved to the database

### 8. Responsive Design (Desktop & Mobile)

- Fully responsive layout that adapts to phone, tablet, and desktop screens
- Touch-optimized interactions for mobile devices
- Puzzle board scales appropriately to screen size
- Large, tappable UI elements for mobile users
- Tested for 20–30 simultaneous users

### 9. Additional UX Polish

- Smooth animations for piece movement and snapping
- Progress indicator showing how many pieces are placed
- Confetti or celebration animation on puzzle completion
- Clear instructions/rules modal for first-time players
- Dark/light theme support for classroom projector compatibility

## Getting Started

### Prerequisites

- Node.js and npm (or yarn/bun)

### Install and run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### Build for production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Environment

Create a `.env` file with your Supabase credentials (see `.env.example` if present). The app expects `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the Supabase client.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Supabase (PostgreSQL, Realtime, Auth)
