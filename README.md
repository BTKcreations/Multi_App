# Multi App Dashboard

> 🚀 A modern, user-friendly dashboard that brings together a suite of productivity tools, utilities, and games — all in one place!

[Live Demo](https://btkcreations.github.io/Multi_App/)

![Multi App Dashboard Screenshot](https://placeholder.co/1000x300/03a9f4/ffffff?text=AppDash+Screenshot)

## ✨ Features

- 🔑 **Google Sign-In Authentication**
- 🗂️ **Sidebar with Category Navigation and Search**
- ⚡ **Instant App Launch via Iframe**
- 📝 **User Activity Logging (localStorage)**
- 🌙 **Dark/Light Theme Support**
- 📱 **Progressive Web App (PWA) – Installable on Desktop & Mobile**
- 🎮 **Games & Productivity Apps in One Place**

## 📦 Apps Included

- Fake News Detection
- PDF Extractor
- Math Problem Solver
- Equation Grapher
- Advanced Meeting Notes Formatter
- Language Translator
- Image Resizer
- AI Markdown Formatter
- AskAI (Latest Addition)
- Clash of Castles, Tap Dash, Circle Bounce Ball, Dots & Boxes (Games)
- ...and more!

## 🖥️ Tech Stack

- [Tailwind CSS](https://tailwindcss.com/)
- Vanilla JavaScript (ES6)
- Google Identity Services
- PWA (Service Worker, Manifest)

## 🛠️ Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/BTKcreations/Multi_App.git
   cd Multi_App
   ```

2. **Run locally:**
   - Just open `index.html` in your browser. No build step required!

3. **Google Sign-In:**
   - The app uses a public OAuth client for sign-in. No backend needed.

## 📋 How to Use the Dashboard

### Initial Access
1. **Open the Application**: Navigate to [Live Demo](https://btkcreations.github.io/Multi_App/) or open `index.html` locally
2. **Sign In**: Click the "Sign in with Google" button to authenticate (required for full functionality)
3. **Dashboard Overview**: After signing in, you'll see the main dashboard with:
   - **Header**: Contains user profile, theme toggle, and main navigation
   - **Sidebar**: Categorized app navigation with search functionality
   - **Main Content Area**: App launcher grid and iframe container for running apps

### Navigation & Interface
- **Sidebar Navigation**: 
  - Browse apps by categories (Productivity, Games, Utilities, etc.)
  - Use the search bar to quickly find specific apps
  - Collapse/expand sidebar for more screen space
- **Theme Toggle**: Switch between light and dark modes using the theme button
- **App Grid**: Click on any app card to launch it instantly in the main content area
- **User Profile**: Access account information and sign-out option

### App Management
- **Launch Apps**: Simply click on any app tile to open it in an iframe
- **Full-Screen Mode**: Most apps support full-screen viewing
- **Back to Dashboard**: Use the dashboard button to return to the main app grid
- **Recent Activity**: Your app usage is automatically logged and can be viewed in your profile

## 🔄 Example Workflows

### Using the PDF Extractor
1. **Launch the App**: Click on "PDF Extractor" from the Productivity category
2. **Upload File**: Drag and drop your PDF file or use the file selector
3. **Extract Content**: The app will process your PDF and extract text content
4. **Download/Copy**: Use the provided options to download extracted text or copy to clipboard
5. **Return**: Click the dashboard button to return to the main interface

### Using the Math Problem Solver
1. **Access the Tool**: Navigate to "Math Problem Solver" in the Education category
2. **Input Problem**: 
   - Type your mathematical equation or problem
   - Use the provided calculator interface for complex expressions
   - Upload an image of handwritten math problems (if supported)
3. **Solve**: Click "Solve" to get step-by-step solutions
4. **Review Steps**: The app will show detailed solution steps
5. **Export**: Save solutions as PDF or share via integrated options

### Gaming Experience
1. **Browse Games**: Navigate to the Games category in the sidebar
2. **Select Game**: Choose from Clash of Castles, Tap Dash, Circle Bounce Ball, or Dots & Boxes
3. **Play**: Games launch in full-screen mode for optimal experience
4. **Progress Tracking**: Game scores and progress are automatically saved
5. **Leaderboards**: Compare your scores with other users (where applicable)

### Using AskAI (Latest Feature)
1. **Launch AskAI**: Click on the "AskAI" app from the AI category
2. **Ask Questions**: Type your questions in natural language
3. **Get Responses**: Receive AI-powered answers and explanations
4. **Context Awareness**: The AI maintains conversation context for follow-up questions
5. **Export Conversations**: Save important Q&A sessions for future reference

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Multi App Dashboard                      │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
  ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
  │   Frontend UI   │ │   Service   │ │  Authentication │
  │    (Tailwind)   │ │   Worker    │ │   (Google GIS)  │
  └─────────────────┘ └─────────────┘ └─────────────────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────────┐
            │           Core Components           │
            ├─────────────────────────────────────┤
            │  • App Registry (apps.json)        │
            │  • Dynamic Iframe Loader           │
            │  • Theme Manager                   │
            │  • Activity Logger                 │
            │  • Search & Filter Engine          │
            └─────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
  ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
  │   Individual    │ │   Local     │ │      PWA        │
  │   Apps (HTML)   │ │   Storage   │ │   Capabilities  │
  └─────────────────┘ └─────────────┘ └─────────────────┘
```

### Architecture Components:

**Frontend Layer**:
- **Tailwind CSS**: Responsive design system with dark/light theme support
- **Vanilla JavaScript**: ES6+ modules for app logic and interactivity
- **Dynamic UI**: Component-based approach for reusable interface elements

**Authentication Layer**:
- **Google Identity Services**: OAuth2 authentication flow
- **User Session Management**: Secure token handling and user state persistence
- **Profile Integration**: User data and preferences synchronization

**Core Application Logic**:
- **App Registry**: JSON-based configuration for all available applications
- **Iframe Manager**: Secure sandboxing and communication with individual apps
- **Theme Controller**: CSS custom properties management for theming
- **Activity Tracker**: User interaction logging and analytics
- **Search Engine**: Real-time app filtering and categorization

**Data Layer**:
- **LocalStorage**: User preferences, activity logs, and app states
- **Session Storage**: Temporary data and cache management
- **IndexedDB**: Large data storage for offline capabilities

**PWA Features**:
- **Service Worker**: Offline functionality and caching strategies
- **Web App Manifest**: Installation and native app-like experience
- **Background Sync**: Data synchronization when connectivity is restored

## 🎯 User Experience Flow

### Authentication Flow
```
User Visits App → Check Auth Status → [Not Authenticated]
     ↓                                        ↓
 Show Login Screen ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
     ↓
 Click "Sign in with Google"
     ↓
 Google OAuth Popup
     ↓
 [Success] → Store User Token → Load Dashboard
     ↓
 [Failure] → Show Error Message → Return to Login
```

### Navigation Flow
```
Dashboard Load → Initialize Sidebar → Load App Registry
     ↓                    ↓                 ↓
Render App Grid → Setup Search → Apply Categories
     ↓
User Interaction:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Search Apps   │  │ Browse Category │  │  Click App Tile │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                     │                     │
         ▼                     ▼                     ▼
   Filter Results        Show Filtered Apps     Launch in Iframe
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               ▼
                      Update Activity Log
```

### App Launch Flow
```
User Clicks App → Validate Selection → Check App Config
     ↓                    ↓                 ↓
Show Loading State → Initialize Iframe → Load App HTML
     ↓                    ↓                 ↓
Setup Communication → Apply Theme → App Ready
     ↓                    ↓                 ↓
Log Activity → Enable Full-Screen → User Interaction
     ↓
[App Close] → Return to Dashboard → Update Session
```

### Theme Management Flow
```
App Initialize → Check Stored Theme → Apply Theme
     ↓                    ↓                 ↓
User Toggle → Update CSS Variables → Save Preference
     ↓                    ↓                 ↓
Propagate to Apps → Update UI Elements → Log Change
```

### PWA Installation Flow
```
User Visits → Check Install Eligibility → Show Install Prompt
     ↓                    ↓                      ↓
User Accepts → Register Service Worker → Download Assets
     ↓                    ↓                      ↓
Create Shortcuts → Enable Offline Mode → Installation Complete
```

### Error Handling Flow
```
Error Occurs → Categorize Error Type → Show User-Friendly Message
     ↓              ↓                     ↓
Log Error → [Network Issue] → Show Offline Mode
     ↓              ↓                     ↓
Attempt Recovery → [Auth Issue] → Redirect to Login
                   ↓
                [App Issue] → Reload App in Iframe
```

## 📲 Install as PWA

- Open the [Live Demo](https://btkcreations.github.io/Multi_App/) in your browser.
- Look for the install icon in your browser's address bar or menu, and "Install AppDash" to your device.

## 🧑‍💻 Contributing

### Development Setup
1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature
4. Make your changes
5. Test thoroughly
6. Submit a pull request

### Adding New Apps
1. Create your app HTML file in the `Apps/` directory
2. Add app configuration to `apps.json`:
   ```json
   {
     "id": "your-app-id",
     "name": "Your App Name",
     "description": "Brief description",
     "category": "Productivity",
     "icon": "🛠️",
     "url": "Apps/your-app.html",
     "featured": false
   }
   ```
3. Test the integration
4. Submit a pull request with your addition

### Guidelines
- Follow existing code style and structure
- Ensure responsive design compatibility
- Test in both light and dark themes
- Include proper error handling
- Update documentation as needed

Pull requests are welcome! If you have new app ideas or improvements, open an issue or fork and submit a PR.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Author:** [TharunKumar](https://github.com/BTKcreations)

**Last Updated:** October 2025

---

*Made with ❤️ for developers and productivity enthusiasts*
