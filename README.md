# Hipster Web - Music Trivia Game

A web-based music trivia game powered by Spotify. Players compete to guess songs and place timeline bets on when tracks were released.

## 🎵 Features

- **Spotify Integration** - Play real 30-second song previews
- **Multiple Game Modes** - Original, Timeline, and Token Betting modes
- **Themed Categories** - 90s, 2000s, Pop, Rock, and more
- **Multiplayer Support** - Add multiple players and track scores
- **Web-Based** - No installation required, works on any device

## 🚀 Quick Start

### Prerequisites
- Node.js installed on your system
- A Spotify account (free or premium)

### Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/janvanwassenhove/hipster.git
   cd hipster
   npm install
   ```

2. **Configure Spotify:** 
   Follow the detailed guide in [`SPOTIFY_SETUP.md`](SPOTIFY_SETUP.md) to set up your Spotify app and get your Client ID.

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:8081` and start playing!

## 🌐 Deployment

### GitHub Pages
```bash
npm run build
npm run deploy
```

### Netlify
```bash
npm run build
npx netlify deploy --dir=dist --prod
```

### Vercel
```bash
npm run build
npx vercel --prod
```

## 🎮 How to Play

1. **Login with Spotify** - Connect your account to access music
2. **Add Players** - Set up player names and choose game mode
3. **Guess the Song** - Listen to 30-second previews and make your guesses
4. **Timeline Mode** - Bet on when songs were released for bonus points
5. **Track Scores** - Compete with friends across multiple rounds

## 🛠️ Technology Stack

- **React Native Web** - Cross-platform UI framework
- **Expo Router** - File-based routing
- **TypeScript** - Type-safe development
- **Spotify Web API** - Music data and previews
- **Expo Linear Gradient** - Beautiful UI gradients

## 📁 Project Structure

```
app/
├── (tabs)/           # Tab-based navigation
│   ├── index.tsx     # Main game tab
│   ├── scores.tsx    # Statistics and scores
│   └── settings.tsx  # App settings
├── spotify-auth.tsx  # OAuth callback handler
components/
├── GameScreen.tsx    # Main game interface
├── SpotifyLogin.tsx  # Login component
├── PlayerSetup.tsx   # Player configuration
└── ...
services/
└── spotify.ts        # Spotify API integration
```

## 🔧 Configuration

The app requires Spotify API credentials. See [`SPOTIFY_SETUP.md`](SPOTIFY_SETUP.md) for detailed setup instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and entertainment purposes. Spotify integration requires compliance with Spotify's Terms of Service.

## 🎯 Demo

Try the live demo: [https://janvanwassenhove.github.io/hipster](https://janvanwassenhove.github.io/hipster)

---

**Note:** You'll need your own Spotify Client ID to run the app. The demo requires Spotify account authentication.
