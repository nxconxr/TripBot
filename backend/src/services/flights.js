const axios = require('axios');
const moment = require('moment');

class FlightService {
  constructor() {
    this.travelpayoutsToken = process.env.TRAVELPAYOUTS_TOKEN;
    this.travelpayoutsBaseURL = process.env.TRAVELPAYOUTS_BASE_URL;
    this.skyscannerApiKey = process.env.SKYSCANNER_API_KEY;
    
    this.travelpayoutsClient = axios.create({
      baseURL: this.travelpayoutsBaseURL,
      headers: {
        'Authorization': `Token ${this.travelpayoutsToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async searchFlights(searchParams) {
    try {
      const {
        origin,
        destination,
        departureDate,
        returnDate,
        travelers = 1,
        cabinClass = 'economy',
        directFlights = false,
        maxPrice,
      } = searchParams;

      // Validate required parameters
      if (!origin || !destination || !departureDate) {
        return {
          success: false,
          error: 'Missing required parameters: origin, destination, departureDate',
        };
      }

      // Try Travelpayouts first, fallback to mock data
      let flights = await this.searchTravelpayouts(searchParams);
      
      if (!flights.success || flights.data.length === 0) {
        flights = await this.getMockFlights(searchParams);
      }

      return flights;
    } catch (error) {
      console.error('Flight search error:', error);
      return {
        success: false,
        error: error.message || 'Flight search failed',
      };
    }
  }

  async searchTravelpayouts(searchParams) {
    try {
      const {
        origin,
        destination,
        departureDate,
        returnDate,
        travelers = 1,
        cabinClass = 'economy',
      } = searchParams;

      const searchData = {
        origin,
        destination,
        depart_date: departureDate,
        return_date: returnDate,
        passengers_count: travelers,
        cabin_class: cabinClass,
        currency: 'EUR',
        locale: 'de',
      };

      const response = await this.travelpayoutsClient.post('/flight_search', searchData);
      
      if (response.data && response.data.data) {
        const flights = this.parseTravelpayoutsResponse(response.data.data, searchParams);
        return {
          success: true,
          data: flights,
        };
      }

      return {
        success: false,
        error: 'No flight data received from Travelpayouts',
      };
    } catch (error) {
      console.error('Travelpayouts search error:', error);
      return {
        success: false,
        error: 'Travelpayouts API error',
      };
    }
  }

  parseTravelpayoutsResponse(data, searchParams) {
    const flights = [];
    
    if (data.results && Array.isArray(data.results)) {
      data.results.forEach((result, index) => {
        const flight = {
          id: `flight_${index}`,
          airline: result.airline || 'Unknown',
          flightNumber: result.flight_number || 'N/A',
          origin: searchParams.origin,
          destination: searchParams.destination,
          departureTime: result.departure_time,
          arrivalTime: result.arrival_time,
          duration: result.duration,
          stops: result.stops || 0,
          price: result.price,
          currency: 'EUR',
          cabinClass: searchParams.cabinClass,
          bookingLink: result.booking_link,
          airlineLogo: result.airline_logo,
          aircraft: result.aircraft,
          terminal: result.terminal,
          gate: result.gate,
          status: 'available',
          savings: this.calculateSavings(result.price),
          features: this.getFlightFeatures(result),
        };
        
        flights.push(flight);
      });
    }

    return flights;
  }

  async getMockFlights(searchParams) {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      travelers = 1,
      cabinClass = 'economy',
      maxPrice,
    } = searchParams;

    const mockAirlines = [
      { name: 'Lufthansa', code: 'LH', logo: 'https://example.com/lh.png' },
      { name: 'Air France', code: 'AF', logo: 'https://example.com/af.png' },
      { name: 'KLM', code: 'KL', logo: 'https://example.com/kl.png' },
      { name: 'British Airways', code: 'BA', logo: 'https://example.com/ba.png' },
      { name: 'EasyJet', code: 'U2', logo: 'https://example.com/u2.png' },
      { name: 'Ryanair', code: 'FR', logo: 'https://example.com/fr.png' },
    ];

    const flights = [];
    const basePrice = 150 + Math.random() * 300;
    
    for (let i = 0; i < 8; i++) {
      const airline = mockAirlines[Math.floor(Math.random() * mockAirlines.length)];
      const price = basePrice + (Math.random() * 200) - 100;
      const stops = Math.random() > 0.6 ? Math.floor(Math.random() * 2) : 0;
      
      const flight = {
        id: `mock_flight_${i}`,
        airline: airline.name,
        airlineCode: airline.code,
        airlineLogo: airline.logo,
        flightNumber: `${airline.code}${Math.floor(Math.random() * 9999) + 1000}`,
        origin,
        destination,
        departureTime: this.generateMockTime(departureDate, 'morning'),
        arrivalTime: this.generateMockTime(departureDate, 'afternoon'),
        duration: `${Math.floor(Math.random() * 4) + 1}h ${Math.floor(Math.random() * 60)}m`,
        stops,
        price: Math.round(price * 100) / 100,
        currency: 'EUR',
        cabinClass,
        bookingLink: `https://booking.example.com/flight/${i}`,
        aircraft: 'Airbus A320',
        terminal: `${Math.floor(Math.random() * 3) + 1}`,
        gate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 50) + 1}`,
        status: 'available',
        savings: this.calculateSavings(price),
        features: this.getFlightFeatures({ stops, price, cabinClass }),
        isMock: true,
      };
      
      flights.push(flight);
    }

    // Sort by price
    flights.sort((a, b) => a.price - b.price);

    return {
      success: true,
      data: flights,
    };
  }

  generateMockTime(date, timeOfDay) {
    const baseDate = moment(date);
    let hour;
    
    switch (timeOfDay) {
      case 'morning':
        hour = 6 + Math.floor(Math.random() * 6); // 6-12
        break;
      case 'afternoon':
        hour = 12 + Math.floor(Math.random() * 6); // 12-18
        break;
      case 'evening':
        hour = 18 + Math.floor(Math.random() * 6); // 18-24
        break;
      default:
        hour = Math.floor(Math.random() * 24);
    }
    
    const minute = Math.floor(Math.random() * 60);
    return baseDate.hour(hour).minute(minute).format('YYYY-MM-DD HH:mm');
  }

  calculateSavings(price) {
    const originalPrice = price * (1 + Math.random() * 0.3); // 0-30% savings
    const savings = originalPrice - price;
    return Math.round(savings * 100) / 100;
  }

  getFlightFeatures(flight) {
    const features = [];
    
    if (flight.stops === 0) features.push('Direct Flight');
    if (flight.price < 200) features.push('Budget Friendly');
    if (flight.cabinClass === 'business') features.push('Business Class');
    if (flight.cabinClass === 'first') features.push('First Class');
    if (flight.price > 500) features.push('Premium');
    
    return features;
  }

  async getFlightStatus(flightNumber) {
    try {
      // Mock flight status for now
      const statuses = ['On Time', 'Delayed', 'Boarding', 'Departed', 'Arrived'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        success: true,
        data: {
          flightNumber,
          status: randomStatus,
          departureTime: moment().add(2, 'hours').format('YYYY-MM-DD HH:mm'),
          arrivalTime: moment().add(4, 'hours').format('YYYY-MM-DD HH:mm'),
          gate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 50) + 1}`,
          terminal: `${Math.floor(Math.random() * 3) + 1}`,
          updatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Get flight status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get flight status',
      };
    }
  }

  async getPopularRoutes() {
    const popularRoutes = [
      { origin: 'BER', destination: 'MUC', name: 'Berlin - München' },
      { origin: 'FRA', destination: 'LHR', name: 'Frankfurt - London' },
      { origin: 'MUC', destination: 'CDG', name: 'München - Paris' },
      { origin: 'HAM', destination: 'AMS', name: 'Hamburg - Amsterdam' },
      { origin: 'DUS', destination: 'VIE', name: 'Düsseldorf - Wien' },
      { origin: 'CGN', destination: 'ZRH', name: 'Köln - Zürich' },
    ];

    return {
      success: true,
      data: popularRoutes,
    };
  }

  async getFlightDeals() {
    const deals = [
      {
        id: 'deal_1',
        origin: 'BER',
        destination: 'BCN',
        name: 'Berlin - Barcelona',
        price: 89,
        originalPrice: 150,
        validUntil: moment().add(7, 'days').format('YYYY-MM-DD'),
        airline: 'EasyJet',
        description: 'Frühbucher-Rabatt für Sommer 2024',
      },
      {
        id: 'deal_2',
        origin: 'MUC',
        destination: 'NYC',
        name: 'München - New York',
        price: 399,
        originalPrice: 650,
        validUntil: moment().add(14, 'days').format('YYYY-MM-DD'),
        airline: 'Lufthansa',
        description: 'Last Minute Deal für Business Class',
      },
      {
        id: 'deal_3',
        origin: 'FRA',
        destination: 'DXB',
        name: 'Frankfurt - Dubai',
        price: 299,
        originalPrice: 450,
        validUntil: moment().add(5, 'days').format('YYYY-MM-DD'),
        airline: 'Emirates',
        description: 'Herbst-Special mit Hotel inklusive',
      },
    ];

    return {
      success: true,
      data: deals,
    };
  }
}

module.exports = new FlightService();