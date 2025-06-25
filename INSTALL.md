# Package Installation Commands

## Quick Installation (Choose one method)

### Method 1: Using npm (Recommended)
```bash
npm install
```

### Method 2: Using yarn (if preferred)
```bash
yarn install
```

### Method 3: Fresh Installation (if having issues)
```bash
# Remove existing dependencies
rm -rf node_modules package-lock.json

# Reinstall everything
npm install
```

## Individual Package Installation (if needed)

### Core Dependencies
```bash
npm install react@^19.1.0
npm install react-dom@^19.1.0
npm install lightweight-charts@^5.0.7
npm install lucide-react@^0.400.0
npm install @google/genai@^0.14.0
```

### Development Dependencies
```bash
npm install --save-dev @types/react@^19.0.0
npm install --save-dev @types/react-dom@^19.0.0
npm install --save-dev @types/node@^22.14.0
npm install --save-dev @vitejs/plugin-react@^4.5.1
npm install --save-dev typescript@~5.7.2
npm install --save-dev vite@^6.2.0
```

## Global Dependencies (Optional)
```bash
# TypeScript compiler (optional, for global use)
npm install -g typescript

# Vite CLI (optional, for global use)
npm install -g vite
```

## Verification Commands
```bash
# Check installed packages
npm list

# Check outdated packages
npm outdated

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

## Update Commands
```bash
# Update all packages to latest versions
npm update

# Update specific package
npm install package-name@latest

# Check for major version updates
npx npm-check-updates
```
