# 🎮 Arachisya - 2D Action RPG

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-blue?style=for-the-badge&logo=github)](https://ofir-roz.github.io/RPGweb_friendly/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#license)
[![C++](https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white)](#)
[![Raylib](https://img.shields.io/badge/Raylib-Framework-orange?style=for-the-badge)](#)

An exciting 2D Action RPG game built with C++ and Raylib, compiled to WebAssembly for browser play.

## 🌟 Live Demo

**🎯 [Play Arachisya Now!](https://ofir-roz.github.io/RPGweb_friendly/)**

## 📖 About

Arachisya is a 2D Action RPG that combines classic gameplay mechanics with modern web technology. Built using C++ and the Raylib game development framework, the game is compiled to WebAssembly to run seamlessly in web browsers.

### ✨ Key Features

- 🎮 **Classic RPG Gameplay** - Engaging action-oriented combat system
- 🌐 **Web-Based** - Play directly in your browser, no downloads required
- 📱 **Mobile Friendly** - Responsive design with touch controls for mobile devices
- 🎨 **Modern UI** - Beautiful gradient-based interface with glassmorphic design
- ⚡ **WebAssembly Performance** - Native C++ performance in the browser
- 🎵 **Audio System** - Immersive sound effects and background music

## 🕹️ Controls

### Desktop
- **WASD** - Movement
- **Space** - Action/Attack
- **Enter** - Interact/Confirm

### Mobile
- **Touch Controls** - On-screen directional pad and action buttons
- **Responsive Layout** - Optimized for various screen sizes

## 🛠️ Technology Stack

- **Language**: C++
- **Game Framework**: [Raylib](https://www.raylib.com/)
- **Web Technology**: WebAssembly (Emscripten)
- **Frontend**: HTML5, CSS3, JavaScript
- **Build System**: Makefile
- **Deployment**: GitHub Pages

## 🎯 Game Features

### Characters & Entities
- Multiple character types with unique animations
- Enemy AI systems
- Sprite-based animation system

### Assets
- **Characters**: Goblins, Knights, Slimes, Intellect Devourers
- **Weapons**: Swords, Laser Swords
- **Environment**: Desert world maps, nature tilesets
- **Audio**: Combat sounds, walking effects, ambient music

## 🚀 Getting Started

### Prerequisites
- C++ compiler (GCC recommended)
- Raylib development libraries
- Emscripten (for web compilation)
- Make

### Building from Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ofir-Roz/RPGweb_friendly.git
   cd RPGweb_friendly
   ```

2. **Build for Desktop**
   ```bash
   make
   ```

3. **Build for Web**
   ```bash
   # Run the web build script
   ./build_web.bat
   ```

4. **Run locally**
   - For desktop: Run the generated executable
   - For web: Serve the files with a local web server

### Project Structure
```
RPGweb_friendly/
├── src/                    # C++ source code
│   ├── main.cpp           # Main game entry point
│   ├── Character.cpp/h    # Character system
│   ├── Enemy.cpp/h        # Enemy entities
│   ├── Prop.cpp/h         # Game props/objects
│   └── ...
├── characters/            # Character sprites and assets
├── nature_tileset/        # Environment and audio assets
├── web/                   # Web build output (legacy)
├── Arachisya.html        # Main game page
├── style.css             # Modern UI styling
├── index.html            # Landing page
├── Makefile              # Build configuration
└── README.md             # This file
```

## 🎨 UI/UX Features

### Modern Header Design
- **Glassmorphic Design** - Semi-transparent header with blur effects
- **Gradient Backgrounds** - Beautiful multi-color gradients
- **Social Media Integration** - Direct links to developer profiles
- **Responsive Layout** - Adapts to different screen sizes

### Game Interface
- **Loading System** - Animated spinner with status updates
- **Mobile Controls** - Touch-friendly on-screen controls
- **Progress Tracking** - Visual feedback for game loading
- **Audio Controls** - Toggle sound on/off

## 📱 Mobile Support

The game includes comprehensive mobile support:
- Touch-based movement controls
- Responsive canvas sizing
- Optimized button layouts
- Mobile-first design considerations

## 🔧 Development

### Key Components

- **BaseCharacter**: Core character functionality
- **Character**: Player character implementation
- **Enemy**: AI-driven enemy entities
- **DynamicScreen**: Screen management system
- **Prop**: Interactive game objects

### Asset Management
- Sprite sheets for character animations
- Tileset system for environments
- Audio asset integration
- Resource loading optimization

## 🚀 Deployment

The game is automatically deployed to GitHub Pages:
- **Live URL**: https://ofir-roz.github.io/RPGweb_friendly/
- **Auto-deployment** on push to main branch
- **CDN Distribution** for global accessibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Ofir Rozanes**
- 🐙 GitHub: [@Ofir-Roz](https://github.com/Ofir-Roz)
- 💼 LinkedIn: [Ofir Rozanes](https://www.linkedin.com/in/ofir-rozanes/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔮 Future Plans

- [ ] Additional character classes
- [ ] Multiplayer support
- [ ] Level editor
- [ ] Achievement system
- [ ] Save/load functionality
- [ ] More environments and levels

---

<div align="center">

**⭐ Star this repository if you found it interesting! ⭐**

Made with ❤️ by [Ofir Rozanes](https://github.com/Ofir-Roz)

</div>
