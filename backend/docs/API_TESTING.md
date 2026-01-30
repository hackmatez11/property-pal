# API Testing Guide

## Quick Start with Postman/Insomnia

### 1. Setup Environment Variables

Create environment with:
```
base_url: http://localhost:5000/api
token: (will be set after login)
```

### 2. Authentication Flow

#### Step 1: Sign Up (Dealer)
```
POST {{base_url}}/auth/signup
Content-Type: application/json

{
  "email": "dealer@test.com",
  "password": "Test@123456",
  "role": "dealer",
  "companyName": "Test Realty",
  "contactPhone": "+919876543210"
}
```

#### Step 2: Sign In
```
POST {{base_url}}/auth/signin
Content-Type: application/json

{
  "email": "dealer@test.com",
  "password": "Test@123456"
}
```

**Copy the `accessToken` from response and set as environment variable `token`**

#### Step 3: Check Auth Status
```
GET {{base_url}}/auth/status
Authorization: Bearer {{token}}
```

#### Step 4: Get Feature Flags
```
GET {{base_url}}/auth/features
Authorization: Bearer {{token}}
```

---

### 3. Property Management Flow

#### Create Property (Draft)
```
POST {{base_url}}/properties
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Luxury 3BHK Apartment in Bandra",
  "description": "Spacious 3BHK apartment with modern amenities, sea view, and premium finishes. Located in the heart of Bandra West with easy access to all major facilities.",
  "price": 15000000,
  "location": "Bandra West, Near Linking Road",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400050",
  "latitude": 19.0596,
  "longitude": 72.8295,
  "size": 1800,
  "size_unit": "sqft",
  "bedrooms": 3,
  "bathrooms": 2,
  "property_type": "apartment",
  "amenities": ["Parking", "Gym", "Swimming Pool", "24/7 Security", "Power Backup"]
}
```

**Copy the `id` from response for next steps**

#### Update Property (Publish)
```
PUT {{base_url}}/properties/:id
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "status": "published"
}
```

#### Get Single Property
```
GET {{base_url}}/properties/:id
Authorization: Bearer {{token}}
```

#### List All Properties (Public)
```
GET {{base_url}}/properties?page=1&limit=20
```

#### Filter Properties
```
GET {{base_url}}/properties?city=Mumbai&property_type=apartment&min_price=10000000&max_price=20000000&bedrooms=3&page=1&limit=20
```

#### Get My Properties (Dealer)
```
GET {{base_url}}/properties/my-properties?page=1&limit=20
Authorization: Bearer {{token}}
```

#### Delete Property
```
DELETE {{base_url}}/properties/:id
Authorization: Bearer {{token}}
```

---

### 4. Media Upload Flow

#### Get Upload Signature (Client-side uploads)
```
GET {{base_url}}/media/signature?folder=properties
Authorization: Bearer {{token}}
```

#### Upload Image (Server-side)
```
POST {{base_url}}/media/upload/image
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

file: [select image file]
```

#### Upload Video
```
POST {{base_url}}/media/upload/video
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

file: [select video file]
```

#### Delete Media
```
DELETE {{base_url}}/media/:cloudinaryPublicId
Authorization: Bearer {{token}}
```

---

### 5. Subscription Management

#### Create Subscription
```
POST {{base_url}}/subscriptions
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "plan": "premium",
  "paymentMethodId": "pm_card_visa"
}
```

#### Get My Subscription
```
GET {{base_url}}/subscriptions/me
Authorization: Bearer {{token}}
```

#### Cancel Subscription
```
DELETE {{base_url}}/subscriptions/:subscriptionId
Authorization: Bearer {{token}}
```

---

### 6. Lead Management

#### Submit Lead (Public - No Auth)
```
POST {{base_url}}/leads
Content-Type: application/json

{
  "property_id": "uuid-of-property",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "user_phone": "+919876543210",
  "message": "I am interested in this property. Please contact me."
}
```

#### Get My Leads (Dealer)
```
GET {{base_url}}/leads?page=1&limit=20
Authorization: Bearer {{token}}
```

#### Filter Leads by Property
```
GET {{base_url}}/leads?property_id=uuid&page=1&limit=20
Authorization: Bearer {{token}}
```

#### Update Lead Status
```
PUT {{base_url}}/leads/:leadId/status
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "status": "contacted"
}
```

Lead Status Options:
- `new` - Just received
- `contacted` - Dealer has contacted
- `qualified` - Lead is qualified
- `converted` - Lead converted to sale
- `rejected` - Lead rejected

#### Get Lead Analytics (Premium+)
```
GET {{base_url}}/leads/analytics
Authorization: Bearer {{token}}
```

---

### 7. AI-Powered Search

#### Natural Language Search
```
POST {{base_url}}/ai/search
Content-Type: application/json

{
  "query": "3 bedroom apartment in Mumbai under 1 crore with gym and parking"
}
```

More examples:
- "luxury villa in Bangalore with swimming pool"
- "2bhk flat in Pune under 50 lakhs"
- "commercial property near highway in Delhi"
- "4 bedroom house with garden in Hyderabad"

#### Get Search Suggestions
```
GET {{base_url}}/ai/suggestions?q=3bhk
```

---

## Testing Error Scenarios

### 1. Unauthorized Access
```
GET {{base_url}}/properties/my-properties
# Without Authorization header
```

Expected: 401 Unauthorized

### 2. Invalid Token
```
GET {{base_url}}/auth/status
Authorization: Bearer invalid_token
```

Expected: 401 Unauthorized

### 3. Validation Error
```
POST {{base_url}}/properties
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Short",
  "price": -1000
}
```

Expected: 400 Validation Error

### 4. Rate Limit Test
```
# Make 31 requests in 1 minute to search endpoint
POST {{base_url}}/ai/search
```

Expected: 429 Rate Limit Exceeded

### 5. Subscription Limit Test
```
# Create 6 properties (when limit is 5)
POST {{base_url}}/properties
# (6th request)
```

Expected: 403 Listing Limit Reached

---

## Response Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Property Title",
    ...
  },
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
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "title",
        "message": "Title must be at least 10 characters"
      }
    ]
  }
}
```

---

## Postman Collection

Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "Real Estate Marketplace API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

Save the collection and configure variables as shown above.

---

## cURL Examples

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dealer@test.com",
    "password": "Test@123456",
    "role": "dealer",
    "companyName": "Test Realty"
  }'
```

### Sign In
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dealer@test.com",
    "password": "Test@123456"
  }'
```

### Create Property
```bash
curl -X POST http://localhost:5000/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury 3BHK Apartment",
    "description": "Spacious apartment...",
    "price": 15000000,
    "city": "Mumbai",
    "property_type": "apartment"
  }'
```

---

## Testing Checklist

- [ ] User signup and signin
- [ ] Get auth status and feature flags
- [ ] Create property (draft)
- [ ] Update property (publish)
- [ ] List properties with filters
- [ ] Upload images/videos
- [ ] Create subscription
- [ ] Submit lead
- [ ] View leads as dealer
- [ ] AI-powered search
- [ ] Test error scenarios
- [ ] Test rate limiting
- [ ] Test subscription limits
- [ ] Test RLS policies

---

## Notes

- Default trial period: 14 days, 5 listings (basic plan)
- Rate limits: 100 requests per 15 minutes (general), 30 searches per minute
- Media limits: Images (10MB), Videos (100MB)
- Supported image formats: JPEG, PNG, WebP
- Supported video formats: MP4, MPEG, MOV
