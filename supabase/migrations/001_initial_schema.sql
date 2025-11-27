-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_role AS ENUM ('fan', 'creator', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'incomplete');
CREATE TYPE post_visibility AS ENUM ('public', 'subscribers_only');

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'fan',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create creator_profiles table
CREATE TABLE creator_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    bio TEXT,
    tagline TEXT,
    banner_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    subscription_price_cents INTEGER NOT NULL DEFAULT 0,
    stripe_account_id TEXT,
    stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
    subscriber_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_subscriber_creator UNIQUE (subscriber_id, creator_id)
);

-- Create posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    media_urls TEXT[] DEFAULT '{}',
    visibility post_visibility NOT NULL DEFAULT 'public',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create post_likes table
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_post_user_like UNIQUE (post_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX idx_creator_profiles_category_id ON creator_profiles(category_id);
CREATE INDEX idx_creator_profiles_is_active ON creator_profiles(is_active);
CREATE INDEX idx_creator_profiles_is_featured ON creator_profiles(is_featured);
CREATE INDEX idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_creator_id ON subscriptions(creator_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_posts_creator_id ON posts(creator_id);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);

-- Helper function: Check if user has active subscription to creator
CREATE OR REPLACE FUNCTION has_active_subscription(
    subscriber UUID,
    creator UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM subscriptions
        WHERE subscriber_id = subscriber
        AND creator_id = creator
        AND status = 'active'
        AND (current_period_end IS NULL OR current_period_end > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function: Update subscriber count on subscription changes
CREATE OR REPLACE FUNCTION update_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'active' THEN
            UPDATE creator_profiles
            SET subscriber_count = subscriber_count + 1
            WHERE user_id = NEW.creator_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'active' AND NEW.status = 'active' THEN
            UPDATE creator_profiles
            SET subscriber_count = subscriber_count + 1
            WHERE user_id = NEW.creator_id;
        ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
            UPDATE creator_profiles
            SET subscriber_count = subscriber_count - 1
            WHERE user_id = NEW.creator_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'active' THEN
            UPDATE creator_profiles
            SET subscriber_count = subscriber_count - 1
            WHERE user_id = OLD.creator_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function: Update post like count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts
        SET like_count = like_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts
        SET like_count = like_count - 1
        WHERE id = OLD.post_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_subscription_change
    AFTER INSERT OR UPDATE OR DELETE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriber_count();

CREATE TRIGGER on_post_like_change
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_like_count();

-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Categories are publicly readable"
    ON categories FOR SELECT
    USING (TRUE);

-- RLS Policies for profiles
CREATE POLICY "Profiles are publicly readable"
    ON profiles FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for creator_profiles
CREATE POLICY "Active creator profiles are publicly readable"
    ON creator_profiles FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Users can create their own creator profile"
    ON creator_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creator profile"
    ON creator_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = subscriber_id);

CREATE POLICY "Creators can view their subscribers"
    ON subscriptions FOR SELECT
    USING (auth.uid() = creator_id);

CREATE POLICY "Users can create their own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can update their own subscriptions"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = subscriber_id);

-- RLS Policies for posts
CREATE POLICY "Public posts are visible to everyone"
    ON posts FOR SELECT
    USING (
        visibility = 'public'
        AND published_at IS NOT NULL
        AND published_at <= NOW()
    );

CREATE POLICY "Subscriber-only posts are visible to subscribers"
    ON posts FOR SELECT
    USING (
        visibility = 'subscribers_only'
        AND published_at IS NOT NULL
        AND published_at <= NOW()
        AND (
            auth.uid() = creator_id
            OR has_active_subscription(auth.uid(), creator_id)
        )
    );

CREATE POLICY "Creators can view all their own posts"
    ON posts FOR SELECT
    USING (auth.uid() = creator_id);

CREATE POLICY "Creators can create their own posts"
    ON posts FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own posts"
    ON posts FOR UPDATE
    USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own posts"
    ON posts FOR DELETE
    USING (auth.uid() = creator_id);

-- RLS Policies for post_likes
CREATE POLICY "Post likes are publicly readable"
    ON post_likes FOR SELECT
    USING (TRUE);

CREATE POLICY "Authenticated users can like accessible posts"
    ON post_likes FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM posts
            WHERE posts.id = post_id
            AND (
                (posts.visibility = 'public' AND posts.published_at IS NOT NULL AND posts.published_at <= NOW())
                OR (posts.visibility = 'subscribers_only' AND posts.published_at IS NOT NULL AND posts.published_at <= NOW() AND has_active_subscription(auth.uid(), posts.creator_id))
                OR posts.creator_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete their own likes"
    ON post_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Seed categories
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
    ('Fitness', 'fitness', 'General fitness and training content', '💪', 1),
    ('Nutrition', 'nutrition', 'Nutrition advice and meal plans', '🥗', 2),
    ('Bodybuilding', 'bodybuilding', 'Bodybuilding and muscle building', '🏋️', 3),
    ('Wellness', 'wellness', 'Mental and physical wellness', '🧘', 4),
    ('Yoga', 'yoga', 'Yoga practice and instruction', '🕉️', 5),
    ('Running', 'running', 'Running and endurance training', '🏃', 6),
    ('CrossFit', 'crossfit', 'CrossFit workouts and training', '⚡', 7),
    ('Sports', 'sports', 'Sports training and performance', '⚽', 8);
