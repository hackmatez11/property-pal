# Real Estate Marketplace Backend

A scalable, production-ready backend system for a centralized real estate marketplace platform. Built with Node.js, Express, TypeScript, Supabase, Redis, Cloudinary, and Stripe.

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend      │────▶│   Express API    │────▶│    Supabase      │
│   (React)       │     │   (Node.js)      │     │   (PostgreSQL)   │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                               │                           │
                               │                           │
                               ▼                           ▼
                        ┌──────────────┐          ┌──────────────┐
                        │   Redis      │          │  Cloudinary  │
                        │   (Cache)    │          │   (Media)    │
                        └──────────────┘          └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │    Stripe    │
                        │  (Payments)  │
                        └──────────────┘
```

## 🚀 Features

### Core Features
- ✅ **Authentication & Authorization** - Supabase Auth with JWT
- ✅ **Role-Based Access Control** - Admin, Dealer, Guest roles
- ✅ **Property Management** - Full CRUD with lifecycle (Draft → Published → Archived)
- ✅ **Subscription Management** - Stripe integration with plan limits
- ✅ **Media Management** - Cloudinary integration for images/videos
- ✅ **Property Discovery** - Advanced filtering and search
- ✅ **AI-Powered Search** - Natural language property search
- ✅ **Lead Management** - Track and manage property inquiries
- ✅ **Caching** - Redis for performance optimization

### UI-Safe Features
- ✅ **Predictable API Responses** - Consistent error/success formats
- ✅ **Feature Flags** - Dynamic UI capabilities based on subscription
- ✅ **Pagination** - Prevents layout overflow
- ✅ **Default Values** - No null/undefined breaking UI states
- ✅ **Error Boundaries** - Comprehensive error handling

### Security Features
- ✅ **Row Level Security (RLS)** - Supabase database-level security
- ✅ **Rate Limiting** - Protect against abuse
- ✅ **Input Validation** - Express-validator
- ✅ **Helmet.js** - Security headers
- ✅ **CORS** - Configured cross-origin access

## 📋 Prerequisites

- Node.js >= 18.x
- PostgreSQL (via Supabase)
- Redis >= 6.x
- Cloudinary account
- Stripe account

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Fill in your credentials:

```env
# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AI Service (optional)
AI_SERVICE_URL=https://your-ai-service.com
AI_SERVICE_API_KEY=your_api_key
```

### 3. Database Setup

Run the SQL scripts in Supabase:

```bash
# See docs/SUPABASE_SCHEMA.md for complete schema
```

### 4. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install locally
redis-server
```

### 5. Run the Server

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

### Response Format

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## 🔐 Authentication Endpoints

### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "dealer@example.com",
  "password": "securepassword123",
  "role": "dealer",
  "companyName": "ABC Realty",
  "contactPhone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "message": "User created successfully"
  }
}
```

### Sign In
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "dealer@example.com",
  "password": "securepassword123"
}
```

**UI-Safe Response:**
```json
{
  "success": true,
  "data": {
    "isAuthenticated": true,
    "role": "dealer",
    "subscriptionStatus": "active",
    "userId": "uuid",
    "email": "dealer@example.com",
    "accessToken": "jwt_token_here"
  }
}
```

### Get Auth Status
```http
GET /api/auth/status
Authorization: Bearer <token>
```

### Get Feature Flags
```http
GET /api/auth/features
Authorization: Bearer <token>
```

**UI-Safe Response:**
```json
{
  "success": true,
  "data": {
    "canPostProperty": true,
    "remainingListings": 3,
    "canAccessAnalytics": true,
    "canExportLeads": false
  }
}
```

## 🏠 Property Endpoints

### Create Property
```http
POST /api/properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Luxury 3BHK Apartment",
  "description": "Spacious apartment with modern amenities...",
  "price": 8500000,
  "location": "Bandra West, Mumbai",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400050",
  "latitude": 19.0596,
  "longitude": 72.8295,
  "size": 1500,
  "size_unit": "sqft",
  "bedrooms": 3,
  "bathrooms": 2,
  "property_type": "apartment",
  "amenities": ["Parking", "Gym", "Swimming Pool"]
}
```

### List Properties (with filters)
```http
GET /api/properties?city=Mumbai&property_type=apartment&min_price=5000000&max_price=10000000&bedrooms=3&page=1&limit=20
```

### Get Property by ID
```http
GET /api/properties/:id
```

### Update Property
```http
PUT /api/properties/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "published",
  "price": 8000000
}
```

### Delete Property
```http
DELETE /api/properties/:id
Authorization: Bearer <token>
```

### Get My Properties (Dealer)
```http
GET /api/properties/my-properties?page=1&limit=20
Authorization: Bearer <token>
```

## 💳 Subscription Endpoints

### Create Subscription
```http
POST /api/subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "premium",
  "paymentMethodId": "pm_xxxxxxxxx"
}
```

### Get My Subscription
```http
GET /api/subscriptions/me
Authorization: Bearer <token>
```

### Cancel Subscription
```http
DELETE /api/subscriptions/:id
Authorization: Bearer <token>
```

## 🤖 AI Search Endpoints

### Natural Language Property Search
```http
POST /api/ai/search
Content-Type: application/json

{
  "query": "3 bedroom apartment in Mumbai under 1 crore with gym and parking"
}
```

**UI-Safe Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Found 15 properties with an average price of ₹85 lakhs in Mumbai. Showing top 10 results.",
    "properties": [ ... ],
    "suggestedFilters": {
      "city": "Mumbai",
      "bedrooms": 3,
      "property_type": "apartment",
      "max_price": 10000000,
      "amenities": ["Gym", "Parking"]
    },
    "totalResults": 15
  }
}
```

### Get Search Suggestions
```http
GET /api/ai/suggestions?q=3bhk
```

## 📊 Lead Endpoints

### Create Lead
```http
POST /api/leads
Content-Type: application/json

{
  "property_id": "uuid",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "user_phone": "+919876543210",
  "message": "Interested in scheduling a visit"
}
```

### Get My Leads (Dealer)
```http
GET /api/leads?page=1&limit=20&property_id=uuid
Authorization: Bearer <token>
```

### Update Lead Status
```http
PUT /api/leads/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "contacted"
}
```

### Get Lead Analytics
```http
GET /api/leads/analytics
Authorization: Bearer <token>
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── index.ts      # Main config
│   │   ├── supabase.ts   # Supabase client
│   │   ├── cloudinary.ts # Cloudinary config
│   │   ├── redis.ts      # Redis client
│   │   └── stripe.ts     # Stripe config
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   └── property.controller.ts
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.ts       # Authentication
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   ├── validation.ts
│   │   └── validate.ts
│   ├── models/           # Database models (types)
│   ├── routes/           # API routes
│   │   ├── auth.routes.ts
│   │   └── property.routes.ts
│   ├── services/         # Business logic
│   │   ├── auth.service.ts
│   │   ├── property.service.ts
│   │   ├── subscription.service.ts
│   │   ├── media.service.ts
│   │   ├── ai.service.ts
│   │   └── lead.service.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── logger.ts
│   │   └── response.ts
│   ├── app.ts            # Express app setup
│   └── index.ts          # Entry point
├── docs/                 # Documentation
│   └── SUPABASE_SCHEMA.md
├── .env.example          # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security Best Practices

1. **Never expose service role key** to frontend
2. **Always use RLS** for database security
3. **Validate all inputs** using express-validator
4. **Rate limit** sensitive endpoints
5. **Use HTTPS** in production
6. **Sanitize user inputs** to prevent XSS
7. **Keep dependencies updated**
8. **Use environment variables** for secrets

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Option 1: Traditional VPS

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/index.js --name real-estate-api

# Setup nginx reverse proxy
# Configure SSL with Let's Encrypt
```

### Option 2: Docker

```bash
# Build image
docker build -t real-estate-api .

# Run container
docker run -d -p 5000:5000 --env-file .env real-estate-api
```

### Option 3: Cloud Platforms

- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo
- **AWS ECS**: Use provided Dockerfile

## 🐛 Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid auth token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SUBSCRIPTION_INACTIVE` | Subscription required |
| `LISTING_LIMIT_REACHED` | Max listings reached |
| `INTERNAL_SERVER_ERROR` | Server error |

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](#)
- Email: support@example.com

---

Built with ❤️ for scalable real estate marketplaces
