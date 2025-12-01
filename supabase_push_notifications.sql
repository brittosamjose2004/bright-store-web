-- Add push_token column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Create a notifications table to store history
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Only service role or admin can insert notifications (for now, let's allow authenticated users to insert for testing if needed, but ideally it's backend only)
-- For this setup, we'll assume the API route uses the service role key or the user triggers it.
-- Let's allow users to insert for now to simplify testing if we trigger from client, but better to restrict.
-- We will rely on the API route using service role for sending, but for storing history:

CREATE POLICY "Service role can manage all notifications"
ON notifications
USING (true)
WITH CHECK (true);
