const axios = require('axios');
const { searchFlights } = require('./flights');
const { searchHotels } = require('./hotels');

class GPTService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseURL = process.env.OPENROUTER_BASE_URL;
    this.model = process.env.OPENROUTER_MODEL || 'gpt-4';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tripbot.ai',
        'X-Title': 'TripBot AI',
      },
    });
  }

  async generateTravelSuggestion(userPrompt) {
    try {
      const functions = [
        {
          name: 'search_travel_options',
          description: 'Search for flights and hotels based on user requirements',
          parameters: {
            type: 'object',
            properties: {
              origin: {
                type: 'string',
                description: 'Departure city or airport code (IATA)',
              },
              destination: {
                type: 'string',
                description: 'Destination city or airport code (IATA)',
              },
              departureDate: {
                type: 'string',
                description: 'Departure date in YYYY-MM-DD format',
              },
              returnDate: {
                type: 'string',
                description: 'Return date in YYYY-MM-DD format (optional for one-way trips)',
              },
              budget: {
                type: 'number',
                description: 'Maximum budget in EUR',
              },
              travelers: {
                type: 'number',
                description: 'Number of travelers',
              },
              tripType: {
                type: 'string',
                enum: ['one-way', 'round-trip', 'multi-city'],
                description: 'Type of trip',
              },
              preferences: {
                type: 'object',
                properties: {
                  hotelStars: {
                    type: 'number',
                    description: 'Preferred hotel star rating (1-5)',
                  },
                  directFlights: {
                    type: 'boolean',
                    description: 'Prefer direct flights only',
                  },
                  cabinClass: {
                    type: 'string',
                    enum: ['economy', 'premium_economy', 'business', 'first'],
                    description: 'Preferred cabin class',
                  },
                },
              },
            },
            required: ['origin', 'destination', 'departureDate', 'budget'],
          },
        },
      ];

      const systemPrompt = `You are TripBot AI, an expert travel agent. Your job is to understand user travel requests and search for the best travel options.

Key responsibilities:
1. Parse user requests for travel details (origin, destination, dates, budget, preferences)
2. Use the search_travel_options function to find flights and hotels
3. Provide personalized travel recommendations
4. Consider user preferences and budget constraints
5. Suggest travel hacks and tips when relevant

Always respond in German and be helpful, friendly, and professional.`;

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        functions,
        function_call: { name: 'search_travel_options' },
        temperature: 0.7,
        max_tokens: 1000,
      });

      const functionCall = response.data.choices[0].message.function_call;
      
      if (functionCall && functionCall.name === 'search_travel_options') {
        const searchParams = JSON.parse(functionCall.arguments);
        const travelOptions = await this.searchTravelOptions(searchParams);
        
        // Generate final recommendation
        const recommendation = await this.generateRecommendation(userPrompt, travelOptions);
        
        return {
          success: true,
          data: {
            originalPrompt: userPrompt,
            searchParams,
            travelOptions,
            recommendation,
          },
        };
      }

      return {
        success: false,
        error: 'No travel search function called',
      };
    } catch (error) {
      console.error('GPT travel suggestion error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate travel suggestion',
      };
    }
  }

  async searchTravelOptions(params) {
    try {
      const [flights, hotels] = await Promise.all([
        searchFlights(params),
        searchHotels(params),
      ]);

      return {
        flights: flights.success ? flights.data : [],
        hotels: hotels.success ? hotels.data : [],
        searchParams: params,
      };
    } catch (error) {
      console.error('Search travel options error:', error);
      return {
        flights: [],
        hotels: [],
        searchParams: params,
        error: error.message,
      };
    }
  }

  async generateRecommendation(userPrompt, travelOptions) {
    try {
      const recommendationPrompt = `Based on the user's request: "${userPrompt}"

And the available travel options:
Flights: ${JSON.stringify(travelOptions.flights, null, 2)}
Hotels: ${JSON.stringify(travelOptions.hotels, null, 2)}

Please provide a personalized travel recommendation in German that includes:
1. A summary of the best options found
2. Price analysis and savings opportunities
3. Travel tips and hacks for this destination
4. Alternative suggestions if the options don't fully match the request
5. Next steps for booking

Be conversational, helpful, and include specific details about the options.`;

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'user', content: recommendationPrompt },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Generate recommendation error:', error);
      return 'Entschuldigung, ich konnte keine Empfehlung generieren.';
    }
  }

  async generateTravelHacks(bookingDetails) {
    try {
      const hacksPrompt = `Generate comprehensive travel hacks and tips for this booking:

Destination: ${bookingDetails.destination}
Travel Dates: ${bookingDetails.departureDate} - ${bookingDetails.returnDate}
Flight: ${bookingDetails.flight?.airline || 'N/A'}
Hotel: ${bookingDetails.hotel?.name || 'N/A'}

Please include:
1. Skiplagging opportunities and tips
2. Error fare monitoring strategies
3. Smart stopover suggestions
4. Local transportation hacks
5. Money-saving tips for this destination
6. Packing recommendations
7. Local customs and etiquette
8. Emergency contact information

Format the response as a structured guide in German.`;

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'user', content: hacksPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Generate travel hacks error:', error);
      return 'Reise-Tipps konnten nicht generiert werden.';
    }
  }

  async chatWithUser(message, conversationHistory = []) {
    try {
      const systemPrompt = `Du bist TripBot AI, ein hilfreicher Reiseassistent. Du hilfst Nutzern bei allen Reisefragen und -planungen.

Deine Fähigkeiten:
- Reiseplanung und -buchung
- Flug- und Hotelrecherche
- Reisetipps und -hacks
- Preisvergleiche
- Allgemeine Reiseberatung

Antworte immer auf Deutsch und sei freundlich, professionell und hilfsbereit.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message },
      ];

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages,
        temperature: 0.8,
        max_tokens: 1000,
      });

      return {
        success: true,
        data: {
          response: response.data.choices[0].message.content,
          conversationHistory: [...messages, response.data.choices[0].message],
        },
      };
    } catch (error) {
      console.error('Chat with user error:', error);
      return {
        success: false,
        error: error.message || 'Chat failed',
      };
    }
  }

  async analyzeTravelTrends(destination, dateRange) {
    try {
      const trendsPrompt = `Analysiere die Reisetrends für ${destination} im Zeitraum ${dateRange}.

Bitte berücksichtige:
1. Beste Reisezeit
2. Preistrends
3. Beliebte Aktivitäten
4. Wetterbedingungen
5. Touristenströme
6. Spezielle Events oder Festivals
7. Empfohlene Reisedauer
8. Budget-Empfehlungen

Gib eine strukturierte Analyse auf Deutsch zurück.`;

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'user', content: trendsPrompt },
        ],
        temperature: 0.6,
        max_tokens: 1500,
      });

      return {
        success: true,
        data: {
          destination,
          dateRange,
          analysis: response.data.choices[0].message.content,
        },
      };
    } catch (error) {
      console.error('Analyze travel trends error:', error);
      return {
        success: false,
        error: error.message || 'Trend analysis failed',
      };
    }
  }
}

module.exports = new GPTService();