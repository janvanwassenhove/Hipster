# Hitster - Music Timeline Game

A Progressive Web App inspired by the party game Hitster, built with Vue.js 3 and integrated with Spotify's Web API.

## 🎵 About

Hitster is a music guessing game where players take turns listening to song previews and placing them correctly on their personal timeline based on release year. The game supports 2-4 players in a "pass & play" format on a single device.

## ✨ Features

- **Progressive Web App**: Install on mobile, tablet, or desktop
- **Spotify Integration**: Real music previews via Spotify Web API
- **Multilingual**: Support for English, Dutch, French, and German
- **Three Difficulty Levels**:
  - Original: Timeline placement only
  - Pro: Title and artist revealed
  - Expert: Full track information
- **Multiple Themes**: 90s, Guilty Pleasures, Schlager, TikTok, Rock, Pop, Hip-Hop, Electronic, Indie, Country
- **Local Storage**: Save game progress and player preferences
- **Touch-Friendly**: Optimized for mobile gameplay with drag & drop

## 🚀 Live Demo

Play the game at: [https://janvanwassenhove.github.io/Hipster/](https://janvanwassenhove.github.io/Hipster/)

## 🛠️ Technology Stack

- **Frontend**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Internationalization**: Vue I18n
- **PWA Features**: Vite PWA Plugin
- **Authentication**: Spotify OAuth 2.0 with PKCE
- **Deployment**: GitHub Pages

## 🎮 How to Play

1. **Setup**: 2-4 players enter their names
2. **Spotify Login**: Connect to Spotify for music access
3. **Choose Settings**: Select difficulty and optional theme
4. **Gameplay**: 
   - Current player gets a random track
   - Listen to the 30-second preview
   - Drag the card to the correct position on your timeline
   - Score points for correct placement
5. **Winning**: First to 10 correct tracks or highest score after set rounds wins

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Spotify Developer Account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/janvanwassenhove/Hipster.git
cd Hipster
```

2. Install dependencies:
```bash
npm install
```

3. Configure Spotify:
   - Create a Spotify app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Add your redirect URI (e.g., `http://localhost:3000/Hipster/` for development)
   - Update the `SPOTIFY_CLIENT_ID` in `src/services/spotify.ts`

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

### Spotify Configuration

For production deployment, make sure to:
1. Add your production URL to Spotify app settings
2. Update the redirect URI in the Spotify service
3. Ensure GitHub Pages is configured correctly

## 📱 PWA Features

- Installable on devices
- Offline capability (limited to cached content)
- App-like experience
- Optimized for mobile screens

## 🌍 Supported Languages

- 🇺🇸 English
- 🇳🇱 Nederlands (Dutch)
- 🇫🇷 Français (French)  
- 🇩🇪 Deutsch (German)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎵 Credits

- Inspired by the original Hitster board game
- Music data and previews provided by Spotify Web API
- Built with modern web technologies

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.
