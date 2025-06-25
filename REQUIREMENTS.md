# Requirements and Installation Guide

## System Requirements

### Node.js and Package Manager
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Git**: For version control (optional but recommended)

### Operating System
- Windows 10/11
- macOS 10.15 or higher
- Linux (Ubuntu 18.04+ or equivalent)

## Project Dependencies

### Production Dependencies
```json
{
  "@google/genai": "^0.14.0",
  "lightweight-charts": "^5.0.7",
  "lucide-react": "^0.400.0",
  "react": "^19.1.0",
  "react-dom": "^19.1.0"
}
```

### Development Dependencies
```json
{
  "@types/node": "^22.14.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0",
  "@vitejs/plugin-react": "^4.5.1",
  "typescript": "~5.7.2",
  "vite": "^6.2.0"
}
```

## Installation Instructions

### 1. Install Node.js
Download and install Node.js from [https://nodejs.org/](https://nodejs.org/)
- Choose the LTS (Long Term Support) version
- Verify installation:
```bash
node --version
npm --version
```

### 2. Clone or Download Project
If using Git:
```bash
git clone <repository-url>
cd new-interface-crypto-trading-chart
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

### 6. Preview Production Build
```bash
npm run preview
```

## Quick Setup Commands

For a fresh installation, run these commands in order:

```bash
# Check if Node.js is installed
node --version

# Install project dependencies
npm install

# Start the development server
npm run dev
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - The app will automatically find an available port (usually 5173, 5174, etc.)
   - Check terminal output for the correct URL

2. **Module Not Found Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Delete `node_modules` folder and `package-lock.json`, then run `npm install`

3. **TypeScript Errors**
   - Ensure TypeScript version matches the project requirements
   - Run `npm run build` to check for type errors

4. **WebSocket Connection Issues**
   - Check internet connection
   - Some corporate firewalls may block WebSocket connections
   - Try accessing from a different network

### Environment Variables
No environment variables are required for basic functionality. The app uses:
- Binance public API endpoints
- WebSocket connections to Binance

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Tools (Recommended)
- **VS Code**: With React and TypeScript extensions
- **Chrome DevTools**: For debugging
- **React DevTools**: Browser extension for React debugging

## License
This project is private and not licensed for public distribution.
