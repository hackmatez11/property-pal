# Real Estate Marketplace - Complete System Documentation

## 📦 What's Included

This backend system provides:

1. **Complete REST API** with TypeScript, Express.js
2. **Supabase Integration** with RLS policies
3. **Authentication & Authorization** (JWT-based)
4. **Property Management** with lifecycle states
5. **Subscription System** with Stripe
6. **Media Management** with Cloudinary
7. **AI-Powered Search** with fallback
8. **Lead Management** with analytics
9. **Redis Caching** for performance
10. **Comprehensive Security** (rate limiting, validation, RLS)

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│                  http://localhost:5173                      │
└────────────────────────────────────────────────────────────┘
                            ↓ HTTP/HTTPS
┌────────────────────────────────────────────────────────────┐
│                  Express.js API Server                      │
│                  http://localhost:5000/api                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers → Services → Config → External Services │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
     ↓              ↓           ↓            ↓
┌─────────┐   ┌─────────┐  ┌──────────┐  ┌────────┐
│Supabase │   │  Redis  │  │Cloudinary│  │ Stripe │
│PostgreSQL   │  Cache  │  │  Media   │  │Payments│
└─────────┘   └─────────┘  └──────────┘  └────────┘
```

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── index.ts         # Main config (env variables)
│   │   ├── supabase.ts      # Supabase client setup
│   │   ├── cloudinary.ts    # Cloudinary config
│   │   ├── redis.ts         # Redis client
│   │   └── stripe.ts        # Stripe config
│   │
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── property.controller.ts
│   │   ├── subscription.controller.ts
│   │   ├── lead.controller.ts
│   │   ├── ai.controller.ts
│   │   └── media.controller.ts
│   │
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── property.service.ts
│   │   ├── subscription.service.ts
│   │   ├── media.service.ts
│   │   ├── ai.service.ts
│   │   └── lead.service.ts
│   │
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.ts          # JWT authentication
│   │   ├── errorHandler.ts  # Error handling
│   │   ├── rateLimiter.ts   # Rate limiting
│   │   ├── validation.ts    # Input validation rules
│   │   └── validate.ts      # Validation middleware
│   │
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   ├── property.routes.ts
│   │   ├── subscription.routes.ts
│   │   ├── lead.routes.ts
│   │   ├── ai.routes.ts
│   │   └── media.routes.ts
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── utils/               # Utility functions
│   │   ├── logger.ts        # Winston logger
│   │   └── response.ts      # Response formatters
│   │
│   ├── app.ts               # Express app setup
│   └── index.ts             # Entry point
│
├── docs/                    # Documentation
│   ├── SUPABASE_SCHEMA.md   # Database schema & RLS
│   ├── API_TESTING.md       # Testing guide
│   └── DEPLOYMENT.md        # Deployment guide
│
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔐 User Roles & Permissions

### 1. Admin
- Full access to all resources
- Can moderate properties
- View all subscriptions and leads
- Manage users

### 2. Dealer (Paid User)
- Create/edit/delete own properties
- View own leads
- Manage subscription
- Upload media
- Limited by subscription plan

### 3. Guest/Buyer
- Browse published properties
- Submit lead inquiries
- Use AI search
- No authentication required for browsing

---

## 🎯 Core Features

### Authentication System
- **Sign Up**: Email/password with role selection
- **Sign In**: JWT token generation
- **Auth Status**: Check authentication state
- **Feature Flags**: Dynamic UI capabilities based on subscription

### Property Management
- **Lifecycle States**: Draft → Published → Archived
- **CRUD Operations**: Create, Read, Update, Delete
- **Advanced Filtering**: By city, type, price, size, amenities
- **View Tracking**: Automatic view count increment
- **Dealer Dashboard**: View own properties

### Subscription System
- **Three Plans**: Basic (₹999), Premium (₹2,999), Enterprise (₹9,999)
- **Listing Limits**: 5, 25, 100 respectively
- **Stripe Integration**: Automatic billing
- **Webhooks**: Real-time subscription updates
- **Trial Period**: 14-day free trial on signup

### Media Management
- **Image Upload**: JPEG, PNG, WebP (max 10MB)
- **Video Upload**: MP4, MPEG, MOV (max 100MB)
- **Automatic Optimization**: Cloudinary transformations
- **Multiple Formats**: Thumbnail, standard, full-size URLs
- **Signed Uploads**: Client-side direct uploads

### AI-Powered Search
- **Natural Language**: "3 bedroom apartment in Mumbai under 1 crore"
- **Intelligent Parsing**: Extracts filters from queries
- **Fallback System**: Local parsing if AI service unavailable
- **Search Suggestions**: Auto-complete functionality

### Lead Management
- **Public Submission**: No auth required
- **Dealer Dashboard**: View and manage leads
- **Status Tracking**: New, Contacted, Qualified, Converted, Rejected
- **Analytics**: Lead statistics and insights
- **Email Notifications**: (Ready for integration)

---

## 🔒 Security Features

### Database Security (RLS)
- Row Level Security on all tables
- User can only access their own data
- Admins have elevated access
- Service role for backend operations

### API Security
- **Rate Limiting**: 
  - General: 100 req/15min
  - Auth: 5 attempts/15min
  - Search: 30 req/min
  - Upload: 50 files/hour
- **Input Validation**: Express-validator
- **Helmet.js**: Security headers
- **CORS**: Configured origins
- **JWT Authentication**: Secure token-based auth

### Data Protection
- Environment variables for secrets
- Service role key never exposed
- Parameterized queries (SQL injection prevention)
- File type and size validation

---

## 📊 Database Schema

### Tables
1. **profiles** - User profiles linked to auth.users
2. **subscriptions** - Dealer subscription plans
3. **properties** - Property listings
4. **property_media** - Images and videos
5. **leads** - User inquiries

### Key Features
- Foreign key relationships
- Proper indexing for performance
- Full-text search capabilities
- Automatic timestamp updates
- Atomic view count increment

---

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/signin` - Login
- `GET /api/auth/status` - Get auth status
- `GET /api/auth/features` - Get feature flags

### Properties
- `POST /api/properties` - Create property
- `GET /api/properties` - List with filters
- `GET /api/properties/:id` - Get by ID
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete (archive)
- `GET /api/properties/my-properties` - Dealer's properties

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/me` - Get current subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription
- `POST /api/subscriptions/webhook` - Stripe webhook

### Leads
- `POST /api/leads` - Submit lead
- `GET /api/leads` - Get dealer's leads
- `PUT /api/leads/:id/status` - Update status
- `GET /api/leads/analytics` - Lead analytics

### AI Search
- `POST /api/ai/search` - Natural language search
- `GET /api/ai/suggestions` - Search suggestions

### Media
- `POST /api/media/upload/image` - Upload image
- `POST /api/media/upload/video` - Upload video
- `GET /api/media/signature` - Get signed URL
- `DELETE /api/media/:publicId` - Delete media

---

## 🎨 UI-Safe Response Design

### Success Response
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

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message",
    "details": { ... }
  }
}
```

### Feature Flags (Prevents UI Breaks)
```json
{
  "canPostProperty": true,
  "remainingListings": 3,
  "canAccessAnalytics": false,
  "canExportLeads": false
}
```

---

## ⚡ Performance Optimization

### Caching Strategy
- Redis for property listings (5min TTL)
- Property details cached
- Automatic cache invalidation on updates

### Database Optimization
- Proper indexing on search columns
- Full-text search for properties
- Efficient pagination
- Query optimization

### Rate Limiting
- Prevents abuse
- Different limits per endpoint
- Graceful error messages

---

## 📈 Scalability

### Horizontal Scaling
- Stateless API design
- Shared Redis cache
- Supabase auto-scaling
- Load balancer ready

### Vertical Scaling
- PM2 cluster mode support
- Efficient memory usage
- Optimized queries

---

## 🧪 Testing

### Manual Testing
See `docs/API_TESTING.md` for:
- Postman collection
- cURL examples
- Test scenarios
- Error testing

### Automated Testing
Framework ready for:
- Unit tests (Jest)
- Integration tests
- E2E tests

---

## 🚢 Deployment Options

1. **Traditional VPS** (DigitalOcean, AWS EC2)
   - PM2 process manager
   - Nginx reverse proxy
   - Let's Encrypt SSL

2. **Docker** (Any platform)
   - Dockerfile provided
   - docker-compose.yml included
   - Redis container

3. **Cloud Platforms**
   - Heroku (one-click)
   - Railway (GitHub integration)
   - Render (automatic deployments)
   - AWS ECS (container service)

See `docs/DEPLOYMENT.md` for detailed guides.

---

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=development
PORT=5000
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
CLOUDINARY_CLOUD_NAME=...
STRIPE_SECRET_KEY=...
REDIS_HOST=localhost
AI_SERVICE_URL=...
CORS_ORIGIN=http://localhost:5173
```

### Subscription Plans
```javascript
{
  basic: { listingLimit: 5, price: 999 },
  premium: { listingLimit: 25, price: 2999 },
  enterprise: { listingLimit: 100, price: 9999 }
}
```

---

## 📝 Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing/invalid auth token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input data |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SUBSCRIPTION_INACTIVE` | Active subscription required |
| `LISTING_LIMIT_REACHED` | Max listings reached for plan |
| `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

## 🎯 Next Steps

### For Backend Development:
1. Install dependencies: `npm install`
2. Configure `.env` file
3. Setup Supabase database
4. Start Redis server
5. Run: `npm run dev`

### For Frontend Integration:
1. Use base URL: `http://localhost:5000/api`
2. Store JWT token from signin response
3. Include `Authorization: Bearer <token>` header
4. Handle error responses gracefully
5. Use feature flags for conditional UI

### For Production:
1. Follow deployment guide
2. Configure environment variables
3. Setup SSL certificate
4. Enable monitoring
5. Configure backups

---

## 📞 Support & Resources

### Documentation
- [Database Schema](docs/SUPABASE_SCHEMA.md)
- [API Testing Guide](docs/API_TESTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [Stripe API](https://stripe.com/docs/api)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

## ✅ System Checklist

- [x] Authentication & Authorization
- [x] Property CRUD with lifecycle
- [x] Subscription management
- [x] Media upload & optimization
- [x] AI-powered search
- [x] Lead management
- [x] Redis caching
- [x] Rate limiting
- [x] Input validation
- [x] Error handling
- [x] RLS policies
- [x] API documentation
- [x] Deployment guides
- [x] Docker support
- [x] UI-safe responses

---

**Built with ❤️ for scalable real estate marketplaces**

*Production-ready, secure, and optimized for performance.*
