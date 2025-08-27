#!/bin/bash

# TripBot AI Setup Script
# This script automates the initial setup of the TripBot AI project

set -e

echo "🚀 TripBot AI Setup Script"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
    
    # Check Flutter
    if ! command -v flutter &> /dev/null; then
        print_warning "Flutter is not installed. Please install Flutter SDK."
        print_warning "You can continue with backend setup, but frontend setup will be skipped."
        FLUTTER_AVAILABLE=false
    else
        print_success "Flutter $(flutter --version | head -n1 | cut -d' ' -f2) is installed"
        FLUTTER_AVAILABLE=true
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_warning "Git is not installed. Some features may not work properly."
    else
        print_success "Git $(git --version | cut -d' ' -f3) is installed"
    fi
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please edit backend/.env file with your API keys"
    else
        print_success ".env file already exists"
    fi
    
    cd ..
    print_success "Backend setup completed"
}

# Setup frontend
setup_frontend() {
    if [ "$FLUTTER_AVAILABLE" = false ]; then
        print_warning "Skipping frontend setup - Flutter not available"
        return
    fi
    
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install Flutter dependencies
    print_status "Installing Flutter dependencies..."
    flutter pub get
    
    # Check Flutter doctor
    print_status "Running Flutter doctor..."
    flutter doctor
    
    cd ..
    print_success "Frontend setup completed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Create assets directories
    mkdir -p frontend/assets/images
    mkdir -p frontend/assets/icons
    mkdir -p frontend/assets/animations
    mkdir -p frontend/assets/fonts
    
    # Create placeholder files
    touch frontend/assets/images/.gitkeep
    touch frontend/assets/icons/.gitkeep
    touch frontend/assets/animations/.gitkeep
    touch frontend/assets/fonts/.gitkeep
    
    print_success "Directories created"
}

# Setup Git hooks (optional)
setup_git_hooks() {
    if command -v git &> /dev/null; then
        print_status "Setting up Git hooks..."
        
        # Create .git/hooks directory if it doesn't exist
        mkdir -p .git/hooks
        
        # Create pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Check if backend dependencies are installed
if [ -d "backend" ] && [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if frontend dependencies are installed
if [ -d "frontend" ] && [ ! -d "frontend/.dart_tool" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && flutter pub get && cd ..
fi

echo "Pre-commit checks completed"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_success "Git hooks configured"
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Configure API Keys:"
    echo "   - Edit backend/.env file with your API keys"
    echo "   - Get API keys from:"
    echo "     * OpenRouter (GPT): https://openrouter.ai/"
    echo "     * Travelpayouts (Flights): https://www.travelpayouts.com/"
    echo "     * Booking.com (Hotels): https://rapidapi.com/3b-data-3b-data-default/api/booking-com/"
    echo "     * Geoapify (Location): https://www.geoapify.com/"
    echo "     * Stripe (Payments): https://stripe.com/"
    echo "     * Firebase (Auth/DB): https://console.firebase.google.com/"
    echo ""
    echo "2. Start the backend:"
    echo "   cd backend && npm run dev"
    echo ""
    if [ "$FLUTTER_AVAILABLE" = true ]; then
        echo "3. Start the frontend:"
        echo "   cd frontend && flutter run"
        echo ""
    fi
    echo "4. Test the API:"
    echo "   curl http://localhost:3000/health"
    echo ""
    echo "5. View API documentation:"
    echo "   http://localhost:3000/"
    echo ""
    echo "For detailed setup instructions, see docs/SETUP.md"
    echo ""
}

# Main setup function
main() {
    echo "Starting TripBot AI setup..."
    echo ""
    
    check_requirements
    echo ""
    
    create_directories
    echo ""
    
    setup_backend
    echo ""
    
    setup_frontend
    echo ""
    
    setup_git_hooks
    echo ""
    
    show_next_steps
}

# Run main function
main "$@"