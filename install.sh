#!/bin/bash

# n8n-nodes-reminders Installation Script
# This script helps install the n8n-nodes-reminders package

set -e

echo "🚀 n8n-nodes-reminders Installation Script"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! printf '%s\n%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V -C; then
    print_error "Node.js version $NODE_VERSION is too old. Required: $REQUIRED_VERSION or higher"
    exit 1
fi

print_status "Node.js version $NODE_VERSION detected ✓"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "npm detected ✓"

# Check if n8n is installed
if ! command -v n8n &> /dev/null && ! npm list -g n8n &> /dev/null; then
    print_warning "n8n is not installed globally."
    echo ""
    echo "Would you like to install n8n globally? (y/N)"
    read -r install_n8n
    if [[ $install_n8n =~ ^[Yy]$ ]]; then
        print_status "Installing n8n globally..."
        npm install -g n8n
        print_status "n8n installed successfully ✓"
    else
        print_warning "Proceeding without installing n8n. Make sure n8n is available in your project."
    fi
else
    print_status "n8n detected ✓"
fi

echo ""
print_header "Installation Options:"
echo "1. Install from GitHub (recommended)"
echo "2. Install from npm registry"
echo "3. Install from GitHub Packages"
echo "4. Clone and build from source"
echo ""
echo -n "Choose installation method (1-4): "
read -r choice

case $choice in
    1)
        print_header "Installing from GitHub..."
        
        echo ""
        echo "Enter GitHub repository (e.g., your-username/n8n-nodes-reminders):"
        read -r github_repo
        
        if [[ -z "$github_repo" ]]; then
            print_error "Repository name cannot be empty"
            exit 1
        fi
        
        echo ""
        echo "Enter version/tag (optional, press Enter for latest):"
        read -r version
        
        if [[ -n "$version" ]]; then
            INSTALL_TARGET="${github_repo}#${version}"
        else
            INSTALL_TARGET="$github_repo"
        fi
        
        print_status "Installing from GitHub: $INSTALL_TARGET"
        npm install "$INSTALL_TARGET"
        ;;
        
    2)
        print_header "Installing from npm registry..."
        print_status "Installing n8n-nodes-reminders from npm"
        npm install n8n-nodes-reminders
        ;;
        
    3)
        print_header "Installing from GitHub Packages..."
        
        echo ""
        echo "Enter GitHub username/organization:"
        read -r github_user
        
        if [[ -z "$github_user" ]]; then
            print_error "GitHub username cannot be empty"
            exit 1
        fi
        
        print_status "Configuring npm for GitHub Packages..."
        echo "@${github_user}:registry=https://npm.pkg.github.com" >> ~/.npmrc
        
        print_status "Installing from GitHub Packages..."
        npm install "@${github_user}/n8n-nodes-reminders"
        ;;
        
    4)
        print_header "Cloning and building from source..."
        
        echo ""
        echo "Enter GitHub repository URL:"
        read -r repo_url
        
        if [[ -z "$repo_url" ]]; then
            print_error "Repository URL cannot be empty"
            exit 1
        fi
        
        REPO_NAME=$(basename "$repo_url" .git)
        
        print_status "Cloning repository..."
        git clone "$repo_url"
        
        print_status "Building from source..."
        cd "$REPO_NAME"
        npm install
        npm run build
        npm pack
        
        print_status "Installing built package..."
        npm install -g ./*.tgz
        
        cd ..
        ;;
        
    *)
        print_error "Invalid choice. Please run the script again and choose 1-4."
        exit 1
        ;;
esac

echo ""
print_status "Installation completed successfully! ✓"

echo ""
print_header "Next Steps:"
echo "1. Start/restart your n8n instance"
echo "2. Look for 'Reminders' and 'Reminders AI Tool' nodes in the node palette"
echo "3. Create 'Reminders API' credentials with your server URL and token"
echo "4. Start building workflows with macOS Reminders!"

echo ""
print_header "Useful Commands:"
echo "• Start n8n: n8n start"
echo "• Check installed packages: npm list"
echo "• Update package: npm update n8n-nodes-reminders"

echo ""
print_status "For support and documentation, visit:"
echo "https://github.com/${github_repo:-your-username/n8n-nodes-reminders}"

echo ""
print_status "Happy automating! 🎉"