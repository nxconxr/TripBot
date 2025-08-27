const axios = require('axios');
const moment = require('moment');

class HotelService {
  constructor() {
    this.bookingApiKey = process.env.BOOKING_API_KEY;
    this.bookingBaseURL = process.env.BOOKING_BASE_URL;
    
    this.bookingClient = axios.create({
      baseURL: this.bookingBaseURL,
      headers: {
        'X-RapidAPI-Key': this.bookingApiKey,
        'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
    });
  }

  async searchHotels(searchParams) {
    try {
      const {
        destination,
        checkIn,
        checkOut,
        guests = 1,
        rooms = 1,
        hotelStars,
        maxPrice,
        amenities = [],
      } = searchParams;

      // Validate required parameters
      if (!destination || !checkIn || !checkOut) {
        return {
          success: false,
          error: 'Missing required parameters: destination, checkIn, checkOut',
        };
      }

      // Try Booking.com first, fallback to mock data
      let hotels = await this.searchBookingCom(searchParams);
      
      if (!hotels.success || hotels.data.length === 0) {
        hotels = await this.getMockHotels(searchParams);
      }

      return hotels;
    } catch (error) {
      console.error('Hotel search error:', error);
      return {
        success: false,
        error: error.message || 'Hotel search failed',
      };
    }
  }

  async searchBookingCom(searchParams) {
    try {
      const {
        destination,
        checkIn,
        checkOut,
        guests = 1,
        rooms = 1,
        hotelStars,
        maxPrice,
      } = searchParams;

      const params = {
        dest_id: destination,
        search_type: 'city',
        arrival_date: checkIn,
        departure_date: checkOut,
        adults: guests,
        room_number: rooms,
        units: 'metric',
        currency: 'EUR',
        locale: 'de',
      };

      if (hotelStars) {
        params.stars = hotelStars;
      }

      const response = await this.bookingClient.get('/v1/hotels/search', { params });
      
      if (response.data && response.data.result) {
        const hotels = this.parseBookingComResponse(response.data.result, searchParams);
        return {
          success: true,
          data: hotels,
        };
      }

      return {
        success: false,
        error: 'No hotel data received from Booking.com',
      };
    } catch (error) {
      console.error('Booking.com search error:', error);
      return {
        success: false,
        error: 'Booking.com API error',
      };
    }
  }

  parseBookingComResponse(data, searchParams) {
    const hotels = [];
    
    if (data && Array.isArray(data)) {
      data.forEach((hotel, index) => {
        const hotelData = {
          id: hotel.hotel_id || `hotel_${index}`,
          name: hotel.hotel_name,
          address: hotel.address,
          city: hotel.city,
          country: hotel.country,
          stars: hotel.review_score || Math.floor(Math.random() * 5) + 1,
          rating: hotel.review_score ? hotel.review_score / 10 : (Math.random() * 2 + 3),
          price: hotel.min_total_price,
          currency: 'EUR',
          image: hotel.main_photo_url,
          images: hotel.photos || [],
          amenities: this.parseAmenities(hotel),
          description: hotel.description || 'Keine Beschreibung verfügbar',
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
          guests: searchParams.guests,
          rooms: searchParams.rooms,
          bookingLink: hotel.url,
          latitude: hotel.latitude,
          longitude: hotel.longitude,
          distance: hotel.distance,
          cancellationPolicy: hotel.cancellation_policy,
          breakfast: hotel.breakfast_included || false,
          wifi: hotel.wifi_available || true,
          parking: hotel.parking_available || false,
          pool: hotel.pool_available || false,
          gym: hotel.gym_available || false,
          spa: hotel.spa_available || false,
          restaurant: hotel.restaurant_available || true,
          bar: hotel.bar_available || true,
          roomService: hotel.room_service || false,
          airConditioning: hotel.air_conditioning || true,
          balcony: hotel.balcony || false,
          seaView: hotel.sea_view || false,
          mountainView: hotel.mountain_view || false,
          cityView: hotel.city_view || false,
          gardenView: hotel.garden_view || false,
          status: 'available',
          savings: this.calculateSavings(hotel.min_total_price),
          features: this.getHotelFeatures(hotel),
        };
        
        hotels.push(hotelData);
      });
    }

    return hotels;
  }

  async getMockHotels(searchParams) {
    const {
      destination,
      checkIn,
      checkOut,
      guests = 1,
      rooms = 1,
      hotelStars,
      maxPrice,
    } = searchParams;

    const mockHotels = [
      {
        name: 'Grand Hotel Europa',
        type: 'luxury',
        basePrice: 250,
        stars: 5,
        amenities: ['wifi', 'pool', 'spa', 'restaurant', 'bar', 'gym'],
      },
      {
        name: 'Comfort Inn Central',
        type: 'business',
        basePrice: 120,
        stars: 4,
        amenities: ['wifi', 'restaurant', 'bar', 'gym'],
      },
      {
        name: 'Budget Hostel Plus',
        type: 'budget',
        basePrice: 45,
        stars: 2,
        amenities: ['wifi', 'breakfast'],
      },
      {
        name: 'Boutique Hotel Am See',
        type: 'boutique',
        basePrice: 180,
        stars: 4,
        amenities: ['wifi', 'restaurant', 'bar', 'spa'],
      },
      {
        name: 'Business Center Hotel',
        type: 'business',
        basePrice: 150,
        stars: 4,
        amenities: ['wifi', 'restaurant', 'bar', 'gym', 'conference'],
      },
      {
        name: 'Family Resort Paradise',
        type: 'family',
        basePrice: 200,
        stars: 4,
        amenities: ['wifi', 'pool', 'restaurant', 'bar', 'kids_club'],
      },
      {
        name: 'Urban Loft Apartments',
        type: 'apartment',
        basePrice: 90,
        stars: 3,
        amenities: ['wifi', 'kitchen', 'laundry'],
      },
      {
        name: 'Historic Castle Hotel',
        type: 'luxury',
        basePrice: 350,
        stars: 5,
        amenities: ['wifi', 'pool', 'spa', 'restaurant', 'bar', 'gym', 'historic'],
      },
    ];

    const hotels = [];
    
    mockHotels.forEach((mockHotel, index) => {
      // Apply star filter if specified
      if (hotelStars && mockHotel.stars !== hotelStars) {
        return;
      }

      const price = mockHotel.basePrice + (Math.random() * 100) - 50;
      
      // Apply price filter if specified
      if (maxPrice && price > maxPrice) {
        return;
      }

      const hotel = {
        id: `mock_hotel_${index}`,
        name: mockHotel.name,
        address: `${Math.floor(Math.random() * 999) + 1} Hauptstraße, ${destination}`,
        city: destination,
        country: 'Deutschland',
        stars: mockHotel.stars,
        rating: mockHotel.stars * 0.8 + Math.random() * 0.4,
        price: Math.round(price * 100) / 100,
        currency: 'EUR',
        image: `https://example.com/hotel_${index}.jpg`,
        images: [
          `https://example.com/hotel_${index}_1.jpg`,
          `https://example.com/hotel_${index}_2.jpg`,
          `https://example.com/hotel_${index}_3.jpg`,
        ],
        amenities: mockHotel.amenities,
        description: `Ein ${mockHotel.type} Hotel in ${destination} mit ${mockHotel.stars} Sternen.`,
        checkIn: checkIn,
        checkOut: checkOut,
        guests: guests,
        rooms: rooms,
        bookingLink: `https://booking.example.com/hotel/${index}`,
        latitude: 52.5200 + (Math.random() - 0.5) * 0.1,
        longitude: 13.4050 + (Math.random() - 0.5) * 0.1,
        distance: Math.floor(Math.random() * 10) + 1,
        cancellationPolicy: 'Kostenlose Stornierung bis 24h vor Anreise',
        breakfast: mockHotel.amenities.includes('breakfast'),
        wifi: true,
        parking: Math.random() > 0.3,
        pool: mockHotel.amenities.includes('pool'),
        gym: mockHotel.amenities.includes('gym'),
        spa: mockHotel.amenities.includes('spa'),
        restaurant: mockHotel.amenities.includes('restaurant'),
        bar: mockHotel.amenities.includes('bar'),
        roomService: mockHotel.type === 'luxury',
        airConditioning: true,
        balcony: Math.random() > 0.5,
        seaView: Math.random() > 0.7,
        mountainView: Math.random() > 0.6,
        cityView: Math.random() > 0.4,
        gardenView: Math.random() > 0.5,
        status: 'available',
        savings: this.calculateSavings(price),
        features: this.getHotelFeatures({ stars: mockHotel.stars, price, amenities: mockHotel.amenities }),
        isMock: true,
      };
      
      hotels.push(hotel);
    });

    // Sort by price
    hotels.sort((a, b) => a.price - b.price);

    return {
      success: true,
      data: hotels,
    };
  }

  parseAmenities(hotel) {
    const amenities = [];
    
    if (hotel.wifi_available) amenities.push('wifi');
    if (hotel.pool_available) amenities.push('pool');
    if (hotel.spa_available) amenities.push('spa');
    if (hotel.restaurant_available) amenities.push('restaurant');
    if (hotel.bar_available) amenities.push('bar');
    if (hotel.gym_available) amenities.push('gym');
    if (hotel.breakfast_included) amenities.push('breakfast');
    if (hotel.parking_available) amenities.push('parking');
    if (hotel.air_conditioning) amenities.push('air_conditioning');
    if (hotel.room_service) amenities.push('room_service');
    
    return amenities;
  }

  calculateSavings(price) {
    const originalPrice = price * (1 + Math.random() * 0.25); // 0-25% savings
    const savings = originalPrice - price;
    return Math.round(savings * 100) / 100;
  }

  getHotelFeatures(hotel) {
    const features = [];
    
    if (hotel.stars >= 5) features.push('Luxury');
    if (hotel.stars >= 4) features.push('Premium');
    if (hotel.price < 100) features.push('Budget Friendly');
    if (hotel.amenities.includes('spa')) features.push('Spa');
    if (hotel.amenities.includes('pool')) features.push('Pool');
    if (hotel.amenities.includes('gym')) features.push('Fitness');
    if (hotel.amenities.includes('breakfast')) features.push('Breakfast Included');
    
    return features;
  }

  async getHotelDetails(hotelId) {
    try {
      // Mock hotel details
      const hotelDetails = {
        id: hotelId,
        name: 'Sample Hotel',
        description: 'Ein wunderschönes Hotel in der Innenstadt mit allen Annehmlichkeiten.',
        amenities: ['wifi', 'pool', 'spa', 'restaurant', 'bar', 'gym'],
        policies: {
          checkIn: '15:00',
          checkOut: '11:00',
          cancellation: 'Kostenlose Stornierung bis 24h vor Anreise',
          pets: 'Haustiere erlaubt (gegen Aufpreis)',
          smoking: 'Nichtraucher-Hotel',
        },
        rooms: [
          {
            type: 'Standard Zimmer',
            size: '25m²',
            capacity: 2,
            price: 120,
            amenities: ['Klimaanlage', 'TV', 'Minibar', 'Bad'],
          },
          {
            type: 'Deluxe Zimmer',
            size: '35m²',
            capacity: 2,
            price: 180,
            amenities: ['Klimaanlage', 'TV', 'Minibar', 'Bad', 'Balkon'],
          },
          {
            type: 'Suite',
            size: '50m²',
            capacity: 4,
            price: 280,
            amenities: ['Klimaanlage', 'TV', 'Minibar', 'Bad', 'Balkon', 'Wohnzimmer'],
          },
        ],
        reviews: [
          {
            author: 'Max Mustermann',
            rating: 5,
            comment: 'Perfekter Aufenthalt, sehr freundliches Personal!',
            date: '2024-01-15',
          },
          {
            author: 'Anna Schmidt',
            rating: 4,
            comment: 'Gutes Hotel, saubere Zimmer, zentrale Lage.',
            date: '2024-01-10',
          },
        ],
      };

      return {
        success: true,
        data: hotelDetails,
      };
    } catch (error) {
      console.error('Get hotel details error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get hotel details',
      };
    }
  }

  async getPopularDestinations() {
    const destinations = [
      { city: 'Berlin', country: 'Deutschland', image: 'https://example.com/berlin.jpg' },
      { city: 'München', country: 'Deutschland', image: 'https://example.com/munich.jpg' },
      { city: 'Hamburg', country: 'Deutschland', image: 'https://example.com/hamburg.jpg' },
      { city: 'Köln', country: 'Deutschland', image: 'https://example.com/cologne.jpg' },
      { city: 'Frankfurt', country: 'Deutschland', image: 'https://example.com/frankfurt.jpg' },
      { city: 'Düsseldorf', country: 'Deutschland', image: 'https://example.com/duesseldorf.jpg' },
    ];

    return {
      success: true,
      data: destinations,
    };
  }

  async getHotelDeals() {
    const deals = [
      {
        id: 'hotel_deal_1',
        hotelName: 'Grand Hotel Europa',
        destination: 'Berlin',
        price: 89,
        originalPrice: 150,
        validUntil: moment().add(7, 'days').format('YYYY-MM-DD'),
        description: 'Frühbucher-Rabatt für Sommer 2024',
        image: 'https://example.com/hotel_deal_1.jpg',
      },
      {
        id: 'hotel_deal_2',
        hotelName: 'Boutique Hotel Am See',
        destination: 'München',
        price: 120,
        originalPrice: 200,
        validUntil: moment().add(14, 'days').format('YYYY-MM-DD'),
        description: 'Last Minute Deal mit Frühstück inklusive',
        image: 'https://example.com/hotel_deal_2.jpg',
      },
      {
        id: 'hotel_deal_3',
        hotelName: 'Business Center Hotel',
        destination: 'Hamburg',
        price: 95,
        originalPrice: 160,
        validUntil: moment().add(5, 'days').format('YYYY-MM-DD'),
        description: 'Business Special mit kostenlosem WLAN',
        image: 'https://example.com/hotel_deal_3.jpg',
      },
    ];

    return {
      success: true,
      data: deals,
    };
  }
}

module.exports = new HotelService();