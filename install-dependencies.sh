#!/bin/bash

# Install Dependencies Script for Linux/macOS

echo "🚀 Crypto Trading Chart - Dependency Installation"

# Check Node.js installation
echo "📦 Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js version: $NODE_VERSION"
else
    echo "❌ Node.js is not installed. Please install from https://nodejs.org/"
    exit 1
fi

# Check npm installation
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm version: $NPM_VERSION"
else
    echo "❌ npm is not available. Please reinstall Node.js."
    exit 1
fi

# Install dependencies
echo "📥 Installing project dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo "🎯 You can now run: npm run dev"
else
    echo "❌ Failed to install dependencies. Check the error messages above."
    exit 1
fi
