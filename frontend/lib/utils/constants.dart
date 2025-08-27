import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors
  static const Color primary = Color(0xFF6366F1);
  static const Color primaryLight = Color(0xFF818CF8);
  static const Color primaryDark = Color(0xFF4F46E5);
  
  // Secondary Colors
  static const Color secondary = Color(0xFF10B981);
  static const Color secondaryLight = Color(0xFF34D399);
  static const Color secondaryDark = Color(0xFF059669);
  
  // Background Colors
  static const Color background = Color(0xFF0F0F23);
  static const Color surface = Color(0xFF1A1A2E);
  static const Color surfaceLight = Color(0xFF16213E);
  static const Color surfaceDark = Color(0xFF0F0F23);
  
  // Text Colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textTertiary = Color(0xFF64748B);
  
  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
  
  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient backgroundGradient = LinearGradient(
    colors: [background, surface],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
  
  // Card Colors
  static const Color cardBackground = Color(0xFF1E1E2E);
  static const Color cardBorder = Color(0xFF2D2D3F);
  
  // Input Colors
  static const Color inputBackground = Color(0xFF1A1A2E);
  static const Color inputBorder = Color(0xFF2D2D3F);
  static const Color inputFocused = Color(0xFF6366F1);
}

class AppSizes {
  // Spacing
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
  
  // Border Radius
  static const double radiusXs = 4.0;
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 24.0;
  static const double radius2xl = 32.0;
  
  // Icon Sizes
  static const double iconXs = 16.0;
  static const double iconSm = 20.0;
  static const double iconMd = 24.0;
  static const double iconLg = 32.0;
  static const double iconXl = 48.0;
  
  // Button Heights
  static const double buttonHeight = 56.0;
  static const double buttonHeightSm = 44.0;
  static const double buttonHeightLg = 64.0;
  
  // Input Heights
  static const double inputHeight = 56.0;
  static const double inputHeightSm = 44.0;
  
  // Card Heights
  static const double cardHeight = 200.0;
  static const double cardHeightSm = 120.0;
  static const double cardHeightLg = 280.0;
}

class AppStrings {
  // App Info
  static const String appName = 'TripBot AI';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'AI-driven travel platform';
  
  // Navigation
  static const String home = 'Home';
  static const String search = 'Search';
  static const String favorites = 'Favorites';
  static const String chat = 'AI Chat';
  static const String profile = 'Profile';
  
  // Authentication
  static const String login = 'Login';
  static const String register = 'Register';
  static const String logout = 'Logout';
  static const String email = 'Email';
  static const String password = 'Password';
  static const String confirmPassword = 'Confirm Password';
  static const String forgotPassword = 'Forgot Password?';
  
  // Search
  static const String searchFlights = 'Search Flights';
  static const String searchHotels = 'Search Hotels';
  static const String from = 'From';
  static const String to = 'To';
  static const String departure = 'Departure';
  static const String returnDate = 'Return';
  static const String passengers = 'Passengers';
  static const String searchButton = 'Search';
  
  // AI Chat
  static const String aiChatTitle = 'TripBot AI Assistant';
  static const String aiChatPlaceholder = 'Ask me about travel...';
  static const String aiChatHint = 'e.g., "Find me a cheap flight to Paris"';
  
  // Favorites
  static const String favoritesTitle = 'My Favorites';
  static const String noFavorites = 'No favorites yet';
  static const String addToFavorites = 'Add to Favorites';
  static const String removeFromFavorites = 'Remove from Favorites';
  
  // Profile
  static const String profileTitle = 'Profile';
  static const String settings = 'Settings';
  static const String preferences = 'Preferences';
  static const String bookings = 'My Bookings';
  static const String paymentMethods = 'Payment Methods';
  static const String help = 'Help & Support';
  static const String about = 'About';
  
  // Common
  static const String loading = 'Loading...';
  static const String error = 'Error';
  static const String success = 'Success';
  static const String cancel = 'Cancel';
  static const String save = 'Save';
  static const String delete = 'Delete';
  static const String edit = 'Edit';
  static const String view = 'View';
  static const String book = 'Book';
  static const String price = 'Price';
  static const String duration = 'Duration';
  static const String rating = 'Rating';
  static const String reviews = 'Reviews';
  
  // Error Messages
  static const String networkError = 'Network error. Please check your connection.';
  static const String serverError = 'Server error. Please try again later.';
  static const String invalidEmail = 'Please enter a valid email address.';
  static const String invalidPassword = 'Password must be at least 6 characters.';
  static const String passwordsDontMatch = 'Passwords do not match.';
  static const String fieldRequired = 'This field is required.';
  
  // Success Messages
  static const String loginSuccess = 'Login successful!';
  static const String registerSuccess = 'Registration successful!';
  static const String bookingSuccess = 'Booking successful!';
  static const String paymentSuccess = 'Payment successful!';
  static const String addedToFavorites = 'Added to favorites!';
  static const String removedFromFavorites = 'Removed from favorites!';
}

class AppConfig {
  // API Configuration
  static const String baseUrl = 'http://localhost:3000/api';
  static const String apiVersion = 'v1';
  static const int timeoutDuration = 30000; // 30 seconds
  
  // Firebase Configuration
  static const String firebaseProjectId = 'tripbot-ai';
  
  // Stripe Configuration
  static const String stripePublishableKey = 'pk_test_your_stripe_key';
  
  // Feature Flags
  static const bool enableAI = true;
  static const bool enablePayments = true;
  static const bool enableNotifications = true;
  static const bool enableAnalytics = true;
  
  // Cache Configuration
  static const int cacheExpirationHours = 24;
  static const int maxCacheSize = 100; // MB
  
  // Animation Durations
  static const Duration animationFast = Duration(milliseconds: 200);
  static const Duration animationNormal = Duration(milliseconds: 300);
  static const Duration animationSlow = Duration(milliseconds: 500);
  
  // Debounce Duration
  static const Duration debounceDuration = Duration(milliseconds: 500);
  
  // Pagination
  static const int pageSize = 20;
  static const int maxPages = 50;
}

class AppAssets {
  // Images
  static const String logo = 'assets/images/logo.png';
  static const String logoDark = 'assets/images/logo_dark.png';
  static const String placeholder = 'assets/images/placeholder.png';
  static const String avatar = 'assets/images/avatar.png';
  
  // Icons
  static const String iconHome = 'assets/icons/home.svg';
  static const String iconSearch = 'assets/icons/search.svg';
  static const String iconFavorites = 'assets/icons/favorites.svg';
  static const String iconChat = 'assets/icons/chat.svg';
  static const String iconProfile = 'assets/icons/profile.svg';
  static const String iconFlight = 'assets/icons/flight.svg';
  static const String iconHotel = 'assets/icons/hotel.svg';
  static const String iconPayment = 'assets/icons/payment.svg';
  
  // Animations
  static const String animationLoading = 'assets/animations/loading.json';
  static const String animationSuccess = 'assets/animations/success.json';
  static const String animationError = 'assets/animations/error.json';
  static const String animationEmpty = 'assets/animations/empty.json';
}

class AppRoutes {
  // Main Routes
  static const String splash = '/';
  static const String home = '/home';
  static const String search = '/search';
  static const String favorites = '/favorites';
  static const String chat = '/chat';
  static const String profile = '/profile';
  
  // Auth Routes
  static const String login = '/login';
  static const String register = '/register';
  
  // Search Routes
  static const String flightSearch = '/flights/search';
  static const String hotelSearch = '/hotels/search';
  
  // Detail Routes
  static const String flightDetails = '/flights/details';
  static const String hotelDetails = '/hotels/details';
  
  // Payment Routes
  static const String payment = '/payment';
  static const String paymentSuccess = '/payment/success';
  static const String paymentError = '/payment/error';
  
  // Settings Routes
  static const String settings = '/settings';
  static const String preferences = '/preferences';
  static const String help = '/help';
  static const String about = '/about';
}