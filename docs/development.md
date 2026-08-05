# Development Guide

This guide provides comprehensive instructions for setting up, developing, building, and deploying the Hipster music timeline game.

## Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control
- **Spotify Developer Account**: For API access
- **Modern Browser**: Chrome 90+, Firefox 90+, Safari 14+, or Edge 90+

## Quick Start

1. **Clone Repository**:
   ```bash
   git clone https://github.com/janvanwassenhove/Hipster.git
   cd Hipster
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment**:
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit with your Spotify credentials
   nano .env.local
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Browser**: Navigate to `http://localhost:5173`

## Environment Setup

### Spotify Developer Configuration

1. **Create Spotify App**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Click "Create App"
   - Fill in app details:
     - App name: "Hipster Local Development"
     - App description: "Music timeline game"
     - Redirect URI: `http://localhost:5173/`
     - API/SDK: Check both boxes

2. **Configure Environment Variables**:
   ```bash
   # .env.local
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   ```

3. **Production Deployment**:
   - Add production redirect URI: `https://yourdomain.github.io/Hipster/`
   - Update GitHub repository secrets with production client ID

### Local Development Environment

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Format code
npm run format
```

## Project Structure

```
hipster/
├── public/                 # Static assets
│   ├── favicon.ico
│   ├── hipster.png
│   └── pwa-*.png          # PWA icons
├── src/
│   ├── components/        # Reusable Vue components
│   │   ├── PlayerTimeline.vue
│   │   └── TrackPlayer.vue
│   ├── data/             # Static data files
│   │   └── songs_by_category.json
│   ├── locales/          # Internationalization
│   │   ├── en.ts
│   │   ├── nl.ts
│   │   ├── fr.ts
│   │   ├── de.ts
│   │   └── index.ts
│   ├── router/           # Vue Router configuration
│   │   └── index.ts
│   ├── services/         # Business logic services
│   │   └── spotify.ts
│   ├── stores/           # Pinia state management
│   │   └── game.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── views/            # Page components
│   │   ├── HomeView.vue
│   │   ├── GameView.vue
│   │   └── SettingsView.vue
│   ├── App.vue           # Root component
│   ├── main.ts           # Application entry point
│   └── style.css         # Global styles
├── docs/                 # Project documentation
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite build configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Development Workflows

### Component Development

1. **Create New Component**:
   ```bash
   # Create component file
   touch src/components/NewComponent.vue
   ```

2. **Component Template**:
   ```vue
   <template>
     <div class="new-component">
       <!-- Component markup -->
     </div>
   </template>

   <script setup lang="ts">
   import { ref, computed } from 'vue'
   
   // Props
   interface Props {
     // Define props here
   }
   
   const props = defineProps<Props>()
   
   // Reactive state
   const localState = ref('')
   
   // Computed properties
   const computedValue = computed(() => {
     return props.someProp + localState.value
   })
   
   // Methods
   function handleAction() {
     // Handle user interaction
   }
   </script>

   <style scoped>
   .new-component {
     /* Component-specific styles */
   }
   </style>
   ```

3. **Import and Use**:
   ```vue
   <script setup lang="ts">
   import NewComponent from '@/components/NewComponent.vue'
   </script>

   <template>
     <NewComponent :prop="value" @event="handler" />
   </template>
   ```

### Adding New Features

1. **Plan Feature**:
   - Update documentation in `docs/use-cases.md`
   - Design component interfaces
   - Plan state management needs

2. **Implement Types**:
   ```typescript
   // src/types/index.ts
   export interface NewFeature {
     id: string
     name: string
     // ... other properties
   }
   ```

3. **Update Store**:
   ```typescript
   // src/stores/game.ts
   const newFeatureState = ref<NewFeature[]>([])
   
   function addNewFeature(feature: NewFeature) {
     newFeatureState.value.push(feature)
     saveGameState()
   }
   ```

4. **Create Components**:
   - Implement UI components
   - Add to appropriate views
   - Test integration

5. **Add Internationalization**:
   ```typescript
   // src/locales/en.ts
   export default {
     newFeature: {
       title: 'New Feature',
       description: 'Feature description'
     }
   }
   ```

### State Management Guidelines

#### Pinia Store Structure
```typescript
// stores/feature.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFeatureStore = defineStore('feature', () => {
  // State
  const items = ref<Item[]>([])
  const loading = ref(false)
  
  // Getters
  const itemCount = computed(() => items.value.length)
  
  // Actions
  async function fetchItems() {
    loading.value = true
    try {
      // Fetch logic
    } finally {
      loading.value = false
    }
  }
  
  return {
    // State
    items,
    loading,
    // Getters
    itemCount,
    // Actions
    fetchItems
  }
})
```

#### Store Usage in Components
```vue
<script setup lang="ts">
import { useFeatureStore } from '@/stores/feature'

const featureStore = useFeatureStore()

// Access state
const items = computed(() => featureStore.items)

// Call actions
function handleAction() {
  featureStore.fetchItems()
}
</script>
```

## Testing

### Manual Testing Checklist

#### Authentication Flow
- [ ] Spotify login redirects correctly
- [ ] Tokens are stored and refreshed
- [ ] Logout clears authentication state
- [ ] Error handling for denied permissions

#### Game Setup
- [ ] Player name validation (2-4 players, no duplicates)
- [ ] Settings persist across sessions
- [ ] Theme selection affects track selection
- [ ] Game state initializes correctly

#### Gameplay
- [ ] Tracks load and play correctly
- [ ] Timeline placement validation works
- [ ] Scoring system calculates correctly
- [ ] Token system functions properly
- [ ] Game end conditions trigger appropriately

#### Progressive Web App
- [ ] App installs on mobile devices
- [ ] Offline functionality works as expected
- [ ] Service worker updates correctly
- [ ] App manifest is valid

#### Cross-Browser Testing
- [ ] Chrome (desktop and mobile)
- [ ] Safari (desktop and mobile)
- [ ] Firefox (desktop)
- [ ] Edge (desktop)

### Automated Testing Setup

```bash
# Install testing dependencies
npm install --save-dev vitest @vue/test-utils

# Add test script to package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}

# Create test file
touch src/components/__tests__/Component.test.ts
```

Example test:
```typescript
// src/components/__tests__/PlayerTimeline.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlayerTimeline from '../PlayerTimeline.vue'

describe('PlayerTimeline', () => {
  it('renders correctly with empty timeline', () => {
    const wrapper = mount(PlayerTimeline, {
      props: {
        player: {
          id: '1',
          name: 'Test Player',
          score: 0,
          timeline: [],
          tokens: 0
        },
        isActive: true,
        allowDrop: true
      }
    })
    
    expect(wrapper.find('.timeline-empty').exists()).toBe(true)
  })
})
```

## Building and Deployment

### Local Build

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

### Build Output

The build process creates a `dist/` directory with:
- Optimized JavaScript bundles
- Compressed CSS files
- PWA manifest and service worker
- Static assets with cache-busting hashes

### GitHub Pages Deployment

#### Automatic Deployment

The repository uses GitHub Actions for automatic deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_SPOTIFY_CLIENT_ID: ${{ secrets.VITE_SPOTIFY_CLIENT_ID }}
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### Manual Deployment

```bash
# Build for production
npm run build

# Deploy to gh-pages branch
npx gh-pages -d dist
```

### Environment Configuration

#### Development
```bash
# .env.local
VITE_SPOTIFY_CLIENT_ID=your_dev_client_id
```

#### Production
Set up GitHub repository secrets:
- `VITE_SPOTIFY_CLIENT_ID`: Production Spotify client ID

## Code Style and Standards

### TypeScript Guidelines

- Use strict type checking
- Prefer interfaces over types for object shapes
- Use proper nullability (`| null` vs `| undefined`)
- Document complex types with JSDoc comments

### Vue.js Guidelines

- Use Composition API with `<script setup>`
- Prefer `const` over `let` where possible
- Use descriptive component and prop names
- Implement proper prop validation

### CSS Guidelines

- Use Tailwind CSS utility classes
- Create custom CSS classes only when necessary
- Follow mobile-first responsive design
- Use CSS custom properties for theming

### Commit Message Format

```
type(scope): description

Examples:
feat(game): add token ability system
fix(auth): resolve token refresh issue
docs(api): update Spotify integration guide
style(ui): improve mobile responsiveness
refactor(store): simplify game state management
```

## Debugging

### Development Tools

#### Vue DevTools
Install browser extension for Vue.js debugging:
- Component inspection
- State management (Pinia)
- Router navigation
- Performance profiling

#### Browser Developer Tools
- **Network Tab**: Monitor API requests
- **Application Tab**: Inspect localStorage and PWA features
- **Console**: View application logs and errors

### Common Issues

#### Spotify Authentication
```bash
# Check environment variables
echo $VITE_SPOTIFY_CLIENT_ID

# Verify redirect URI matches Spotify app settings
# Development: http://localhost:5173/
# Production: https://yourdomain.github.io/Hipster/
```

#### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Verify all imports are correct
npm run lint
```

#### PWA Issues
```bash
# Test service worker in development
npm run build && npm run preview

# Clear browser cache and application data
# Check Application tab in DevTools
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load components
const GameView = defineAsyncComponent(() => import('@/views/GameView.vue'))

// Dynamic imports for large dependencies
async function loadHeavyLibrary() {
  const lib = await import('heavy-library')
  return lib.default
}
```

### Asset Optimization

```typescript
// Optimize images
// Use WebP format where supported
// Implement lazy loading for large images

// Preload critical assets
const link = document.createElement('link')
link.rel = 'preload'
link.href = '/critical-asset.css'
link.as = 'style'
document.head.appendChild(link)
```

### Bundle Analysis

```bash
# Analyze bundle size
npm install --save-dev rollup-plugin-analyzer
npm run build -- --analyze
```

## Contributing Guidelines

### Development Process

1. **Fork Repository**: Create personal fork on GitHub
2. **Create Branch**: Use descriptive branch names
   ```bash
   git checkout -b feature/new-game-mode
   git checkout -b fix/audio-playback-issue
   ```
3. **Make Changes**: Follow coding standards
4. **Test Changes**: Verify functionality works
5. **Submit PR**: Create pull request with description

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] Cross-browser testing
- [ ] Mobile testing

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

### Code Review Process

1. **Automated Checks**: CI/CD pipeline runs
2. **Manual Review**: Maintainer reviews code
3. **Testing**: Reviewer tests changes
4. **Approval**: Changes approved for merge
5. **Deployment**: Automatic deployment to production

## Troubleshooting

### Common Development Issues

#### Module Resolution Errors
```bash
# Ensure correct TypeScript paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

#### Spotify API Errors
- **Rate Limiting**: Implement exponential backoff
- **CORS Issues**: Verify requests go to correct endpoints
- **Token Expiry**: Implement automatic refresh logic

#### Build Failures
- **Memory Issues**: Increase Node.js heap size
  ```bash
  export NODE_OPTIONS="--max-old-space-size=4096"
  npm run build
  ```
- **Dependency Conflicts**: Use `npm ls` to identify issues

### Getting Help

1. **Documentation**: Check this guide and API reference
2. **Issues**: Search existing GitHub issues
3. **Community**: Join project discussions
4. **Maintainers**: Contact project maintainers for complex issues

## Roadmap and Future Development

### Planned Features
- Real-time multiplayer support
- Additional music streaming services
- Enhanced analytics and statistics
- Advanced game modes and variations
- Backend integration for user accounts

### Architecture Improvements
- Microservice architecture for scalability
- GraphQL API for efficient data fetching
- WebSocket integration for real-time features
- Enhanced PWA capabilities

### Contributing to Roadmap
- Submit feature requests via GitHub issues
- Participate in roadmap discussions
- Contribute to feature specifications
- Implement and submit PRs for approved features