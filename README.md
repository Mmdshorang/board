# Trello Clone (Interview Project)

Implementation of a simplified Trello-style board built with Next.js, TypeScript, and SCSS based on the interview requirements.

## Tech Stack

- Next.js (App Router)
- TypeScript (strict)
- SCSS (module + partials + mixins + variables)
- @dnd-kit (drag and drop for lists and cards)
- LocalStorage (client-side data persistence)
- Biome (lint/format)

## Implemented Features

- Board Management
  - Default fixed board: `Demo Board`
  - Inline editing for board title
- List Management
  - Create new lists
  - Delete lists
  - Inline editing for list title
  - Horizontal drag and drop for lists
- Card Management
  - Create cards in each list
  - Inline editing for card title
  - Drag and drop cards within and across lists
  - Support dropping into empty lists
- Comments Modal
  - View each card's comments in a dedicated modal
  - Add new comments to cards
- Responsive Design
  - Desktop-friendly layout
  - Basic mobile support

## Project Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.scss
  features/board/
    components/
    hooks/
    state/
    utils/
  styles/
    _variables.scss
    _mixins.scss
    _reset.scss
  types/
    board.ts
```

## Architecture Notes

- State management with `useReducer` in `state/board-reducer.ts`
- Data logic and persistence in a custom hook:
  - `features/board/hooks/use-board-state.ts`
- Separation of UI and logic:
  - Components handle rendering and events
  - Data operations are handled in reducer/actions
- Full type safety with dedicated interfaces/types

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
```

## Run Locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Persistence

Data is stored client-side in `localStorage` and persists after page refresh.

## Notes

- No backend or API is used (fully client-side).
- The UI/UX is implemented to be as close as possible to the interview reference.
