# Supabase Database Schema & RLS Policies

## Database Tables

### 1. profiles
Stores user profile information linked to Supabase Auth users.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'dealer', 'guest')),
  company_name VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### RLS Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

### 2. subscriptions
Manages dealer subscription plans and billing.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('basic', 'premium', 'enterprise')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'expired', 'cancelled')),
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  listing_limit INTEGER NOT NULL DEFAULT 5,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### RLS Policies

```sql
-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Dealers can read their own subscriptions
CREATE POLICY "Dealers can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all subscriptions
CREATE POLICY "Admins can read all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can manage subscriptions (for backend operations)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
```

---

### 3. properties
Stores property listings from dealers.

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(15, 2) NOT NULL CHECK (price >= 0),
  location TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  size DECIMAL(10, 2) NOT NULL CHECK (size >= 0),
  size_unit VARCHAR(10) NOT NULL CHECK (size_unit IN ('sqft', 'sqm', 'acres')),
  bedrooms INTEGER CHECK (bedrooms >= 0),
  bathrooms INTEGER CHECK (bathrooms >= 0),
  property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('apartment', 'house', 'villa', 'plot', 'commercial')),
  amenities TEXT[] DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for search and filtering
CREATE INDEX idx_properties_dealer_id ON properties(dealer_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_state ON properties(state);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);

-- Full-text search index
CREATE INDEX idx_properties_search ON properties USING gin(to_tsvector('english', title || ' ' || description));

-- Trigger for updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### RLS Policies

```sql
-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Everyone can read published properties
CREATE POLICY "Anyone can read published properties"
  ON properties FOR SELECT
  USING (status = 'published');

-- Dealers can read their own properties (all statuses)
CREATE POLICY "Dealers can read own properties"
  ON properties FOR SELECT
  USING (auth.uid() = dealer_id);

-- Dealers can insert properties (enforced by subscription limits in backend)
CREATE POLICY "Dealers can insert properties"
  ON properties FOR INSERT
  WITH CHECK (
    auth.uid() = dealer_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'dealer'
    )
  );

-- Dealers can update their own properties
CREATE POLICY "Dealers can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = dealer_id);

-- Dealers can delete (archive) their own properties
CREATE POLICY "Dealers can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = dealer_id);

-- Admins can manage all properties
CREATE POLICY "Admins can manage all properties"
  ON properties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

### 4. property_media
Stores media (images/videos) associated with properties.

```sql
CREATE TABLE property_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  cloudinary_public_id VARCHAR(255) NOT NULL,
  secure_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  standard_url TEXT NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_property_media_property_id ON property_media(property_id);
CREATE INDEX idx_property_media_display_order ON property_media(property_id, display_order);

-- Ensure unique Cloudinary public IDs
CREATE UNIQUE INDEX idx_property_media_cloudinary_id ON property_media(cloudinary_public_id);
```

#### RLS Policies

```sql
-- Enable RLS
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;

-- Anyone can read media for published properties
CREATE POLICY "Anyone can read media for published properties"
  ON property_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_media.property_id
      AND properties.status = 'published'
    )
  );

-- Dealers can read media for their own properties
CREATE POLICY "Dealers can read own property media"
  ON property_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_media.property_id
      AND properties.dealer_id = auth.uid()
    )
  );

-- Dealers can manage media for their own properties
CREATE POLICY "Dealers can manage own property media"
  ON property_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_media.property_id
      AND properties.dealer_id = auth.uid()
    )
  );
```

---

### 5. leads
Stores user inquiries about properties.

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_phone VARCHAR(20) NOT NULL,
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_property_id ON leads(property_id);
CREATE INDEX idx_leads_dealer_id ON leads(dealer_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
```

#### RLS Policies

```sql
-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Dealers can read their own leads
CREATE POLICY "Dealers can read own leads"
  ON leads FOR SELECT
  USING (auth.uid() = dealer_id);

-- Dealers can update their own leads (status)
CREATE POLICY "Dealers can update own leads"
  ON leads FOR UPDATE
  USING (auth.uid() = dealer_id);

-- Service role can insert leads (for public lead submission)
CREATE POLICY "Service role can insert leads"
  ON leads FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Admins can read all leads
CREATE POLICY "Admins can read all leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Helper Functions

### Update timestamp trigger function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Increment property views (atomic)

```sql
CREATE OR REPLACE FUNCTION increment_property_views(property_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE properties
  SET views_count = views_count + 1
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Subscription Plan Limits

| Plan       | Listing Limit | Price (INR/month) | Features                                    |
|------------|---------------|-------------------|---------------------------------------------|
| Basic      | 5             | ₹999              | Basic listings, lead tracking               |
| Premium    | 25            | ₹2,999            | All basic + analytics, priority support     |
| Enterprise | 100           | ₹9,999            | All premium + export leads, dedicated       |

---

## Setup Instructions

1. Run these SQL scripts in your Supabase SQL Editor in order:
   - Helper functions
   - Table creation scripts
   - Index creation
   - RLS policy creation

2. Verify RLS is enabled on all tables:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

3. Test policies with different user roles before deploying.

---

## Security Notes

- **RLS is mandatory** for all tables
- Service role key should only be used in backend (never exposed to frontend)
- Anon key is safe for frontend use (RLS protects data)
- Always use parameterized queries to prevent SQL injection
- Subscription limits are enforced in backend, not database constraints
