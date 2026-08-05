# Hipster Project Documentation

This directory contains comprehensive documentation for the Hipster music timeline game project.

## Documentation Structure

- **[Architecture](./architecture.md)** - System architecture, components, and technical stack
- **[Sequence Diagrams](./sequence-diagrams.md)** - Key user flows and system interactions
- **[Use Cases](./use-cases.md)** - Functional requirements and user stories
- **[API Reference](./api-reference.md)** - Spotify integration and internal APIs
- **[Development Guide](./development.md)** - Setup, building, and deployment instructions

## Project Overview

Hipster is a Progressive Web App (PWA) inspired by the party game Hitster, built with Vue.js 3 and integrated with Spotify's Web API. Players compete to correctly place songs on a chronological timeline based on their release dates.

### Key Features

- **Multi-player Game**: 2-4 players with turn-based gameplay
- **Spotify Integration**: Real music previews and metadata via Spotify Web API
- **Progressive Web App**: Installable, offline-capable, mobile-optimized
- **Internationalization**: Support for English, Dutch, French, and German
- **Theme Variations**: Different music categories (classics, Belgian, pop-rock, etc.)
- **Token System**: Bonus abilities following official Hitster rules

### Technology Stack

- **Frontend**: Vue.js 3 with Composition API, TypeScript
- **Styling**: Tailwind CSS with custom gradients and animations
- **State Management**: Pinia stores for game state and player data
- **Routing**: Vue Router with hash-based routing for GitHub Pages
- **Build Tool**: Vite with PWA plugin
- **Authentication**: Spotify OAuth 2.0 with PKCE flow
- **Deployment**: GitHub Pages with GitHub Actions