-- Production Supabase Database Schema
-- Run these commands in Supabase SQL Editor for production setup

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_images table for AI-generated images
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_image_url TEXT,
  generated_image_url TEXT,
  prompt TEXT,
  upgrade_type TEXT,
  property_address TEXT,
  property_price INTEGER,
  property_bedrooms INTEGER,
  property_bathrooms INTEGER,
  property_sqft INTEGER,
  generation_status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on generated_images (CRITICAL - must be done before creating policies)
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Create property_data table for property information
CREATE TABLE IF NOT EXISTS property_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  price INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  sqft INTEGER,
  property_type TEXT,
  year_built INTEGER,
  lot_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for generated_images
CREATE POLICY "Users can view own images" ON generated_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON generated_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images" ON generated_images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON generated_images
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for property_data
CREATE POLICY "Users can view own properties" ON property_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties" ON property_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties" ON property_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties" ON property_data
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for image uploads
CREATE POLICY "Users can upload own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'generated-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'generated-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'generated-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'provider'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_data_user_id ON property_data(user_id);
CREATE INDEX IF NOT EXISTS idx_property_data_address ON property_data(address);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
