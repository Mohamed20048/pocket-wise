-- =====================================================================================
-- GROVE LEDGER (POCKET-WISE) - SUPABASE DATABASE SCHEMA
-- =====================================================================================
-- This script sets up the complete database schema for the Grove Ledger mindful finance application.
-- It includes:
--   1. Table schemas matching all frontend data structures (Profiles, Settings, Budgets, Transactions, Goals, Notifications, Milestones)
--   2. Performance indexes
--   3. Row Level Security (RLS) policies for secure frontend access via Supabase Client
--   4. Automatic trigger: creates profiles and settings when a new user signs up
--   5. Automatic trigger: recalculates budget 'spent' when transactions are added, updated, or deleted
--   6. Seed data helper matching mock data in the website
-- =====================================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. TABLES CREATION
-- ==========================================

-- A. PROFILES TABLE (Linked to auth.users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    display_name text not null,
    full_name text,
    avatar_url text,
    location text,
    bio text,
    badges text[] default array[]::text[],
    streak_count integer default 0 not null,
    longest_streak integer default 0 not null,
    last_active_at timestamptz default now() not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- B. SETTINGS TABLE (Linked to auth.users)
create table if not exists public.settings (
    id uuid references auth.users on delete cascade primary key,
    theme text default 'light' check (theme in ('light', 'dark', 'system')) not null,
    palette text default 'paper' check (palette in ('paper', 'moss', 'clay')) not null,
    currency text default 'EGP' not null,
    number_format text default '1,234.56' not null,
    week_starts_on text default 'Saturday' not null,
    language text default 'English' not null,
    round_transactions boolean default false not null,
    show_micro_spending_insights boolean default true not null,
    notif_weekly boolean default true not null,
    notif_overspend boolean default true not null,
    notif_goals boolean default true not null,
    notif_product boolean default false not null,
    notif_sms boolean default false not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- C. BUDGETS TABLE (Envelopes)
create table if not exists public.budgets (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    category text not null,
    icon text not null, -- Stores Lucide icon name as text (e.g. 'ShoppingBasket', 'Coffee')
    total numeric(12, 2) not null check (total >= 0),
    spent numeric(12, 2) default 0.00 not null check (spent >= 0),
    tone text default 'primary' check (tone in ('primary', 'accent', 'warning', 'success', 'muted')) not null,
    rollover numeric(12, 2) default 0.00 not null check (rollover >= 0),
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    constraint unique_user_budget_name unique (user_id, name)
);

-- D. TRANSACTIONS TABLE (Ledger)
create table if not exists public.transactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    budget_id uuid references public.budgets on delete set null,
    title text not null,
    merchant text not null,
    category text not null,
    date date default current_date not null,
    amount numeric(12, 2) not null, -- Negative for expenses, positive for incomes
    method text check (method in ('Card', 'Cash', 'Transfer')) not null,
    icon text not null, -- Stores Lucide icon name as text (e.g. 'Briefcase', 'Coffee')
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- E. GOALS TABLE (Saplings)
create table if not exists public.goals (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    tagline text,
    icon text not null, -- Stores Lucide icon name as text (e.g. 'Plane', 'Laptop')
    saved numeric(12, 2) default 0.00 not null check (saved >= 0),
    target numeric(12, 2) not null check (target > 0),
    monthly numeric(12, 2) not null check (monthly >= 0),
    deadline text not null, -- Stored as string to support seasonal dates like 'Jun 2026'
    tone text default 'primary' check (tone in ('primary', 'accent', 'warning', 'success')) not null,
    featured boolean default false not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    constraint check_saved_bounds check (saved <= target)
);

-- F. NOTIFICATIONS TABLE (Whispers)
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    category text check (category in ('saplings', 'budgets', 'transactions', 'system')) not null,
    icon text not null, -- Stores Lucide icon name
    tone text default 'primary' check (tone in ('success', 'warning', 'destructive', 'accent', 'primary')) not null,
    title text not null,
    body text not null,
    read boolean default false not null,
    pinned boolean default false not null,
    created_at timestamptz default now() not null
);

-- G. MILESTONES TABLE (Almanac)
create table if not exists public.milestones (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    title text not null,
    date text not null, -- Stored as string (e.g., 'Mar 2024')
    icon text not null,
    created_at timestamptz default now() not null
);


-- ==========================================
-- 2. INDEX OPTIMIZATIONS
-- ==========================================
create index if not exists idx_budgets_user on public.budgets(user_id);
create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);
create index if not exists idx_transactions_budget on public.transactions(budget_id);
create index if not exists idx_goals_user on public.goals(user_id);
create index if not exists idx_notifications_user_unread on public.notifications(user_id) where read = false;
create index if not exists idx_milestones_user on public.milestones(user_id);


-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.budgets enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.notifications enable row level security;
alter table public.milestones enable row level security;

-- Profiles Policies
create policy "Users can view their own profile" 
    on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" 
    on public.profiles for update using (auth.uid() = id);

-- Settings Policies
create policy "Users can view their own settings" 
    on public.settings for select using (auth.uid() = id);
create policy "Users can update their own settings" 
    on public.settings for update using (auth.uid() = id);

-- Budgets Policies
create policy "Users can perform CRUD on their own budgets" 
    on public.budgets for all using (auth.uid() = user_id);

-- Transactions Policies
create policy "Users can perform CRUD on their own transactions" 
    on public.transactions for all using (auth.uid() = user_id);

-- Goals Policies
create policy "Users can perform CRUD on their own goals" 
    on public.goals for all using (auth.uid() = user_id);

-- Notifications Policies
create policy "Users can perform CRUD on their own notifications" 
    on public.notifications for all using (auth.uid() = user_id);

-- Milestones Policies
create policy "Users can perform CRUD on their own milestones" 
    on public.milestones for all using (auth.uid() = user_id);


-- ==========================================
-- 4. AUTOMATED TRIGGERS & FUNCTIONS
-- ==========================================

-- A. AUTO-CREATE PROFILE & SETTINGS ON SIGNUP
-- Triggered by insert into auth.users. Automatically populates profile and default settings.
create or replace function public.handle_new_user()
returns trigger as $$
declare
    default_display_name text;
begin
    default_display_name := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));

    insert into public.profiles (id, display_name, full_name, badges)
    values (
        new.id, 
        default_display_name,
        coalesce(new.raw_user_meta_data->>'full_name', default_display_name),
        array['Early planter']
    );

    insert into public.settings (id)
    values (new.id);

    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();


-- B. TRANSACTION UPDATE TRIGGER - RECALCULATE BUDGET SPENT
-- Whenever a transaction linked to a budget is added, modified, or deleted, recalculate the budget's spent column.
create or replace function public.recalculate_budget_spent()
returns trigger as $$
declare
    target_budget_id uuid;
begin
    -- Identify which budget needs update
    if (tg_op = 'DELETE') then
        target_budget_id := old.budget_id;
    else
        target_budget_id := new.budget_id;
    end if;

    if target_budget_id is not null then
        -- Aggregate sum of negative transactions (expenses) for this budget ID
        update public.budgets
        set spent = coalesce(
            (select sum(abs(amount))
             from public.transactions
             where budget_id = target_budget_id and amount < 0), 
            0.00
        )
        where id = target_budget_id;
    end if;

    -- If a transaction's budget_id was updated, we also need to recalculate the old budget
    if (tg_op = 'UPDATE' and old.budget_id is distinct from new.budget_id and old.budget_id is not null) then
        update public.budgets
        set spent = coalesce(
            (select sum(abs(amount))
             from public.transactions
             where budget_id = old.budget_id and amount < 0), 
            0.00
        )
        where id = old.budget_id;
    end if;

    return null;
end;
$$ language plpgsql security definer;

create or replace trigger on_transaction_change
    after insert or update or delete on public.transactions
    for each row execute procedure public.recalculate_budget_spent();


-- ==========================================
-- 5. MOCK DATA SEED SCRIPT (OPTIONAL)
-- ==========================================
-- To populate the tables with the website's original mock data for testing, uncomment and run the block below.
-- Note: It will attach the seed data to the first user in auth.users, or default to a dummy UUID.

/*
do $$
declare
    target_user_id uuid;
    b1_id uuid;
    b2_id uuid;
    b3_id uuid;
    b4_id uuid;
    b5_id uuid;
    b6_id uuid;
    b7_id uuid;
    b8_id uuid;
begin
    -- 1. Resolve user ID (fetches the first signed-up user, or uses a fallback dummy UUID)
    target_user_id := coalesce(
        (select id from auth.users limit 1), 
        '00000000-0000-0000-0000-000000000000'::uuid
    );

    -- Ensure we have a profile and settings if using the dummy user
    insert into public.profiles (id, display_name, full_name, badges, streak_count, longest_streak, bio, location)
    values (target_user_id, 'Eleanor', 'Eleanor Hart', array['Mindful saver', 'Goal grower', 'Steady hand', 'Early planter'], 47, 60, 'Slow, steady, seasonal. I treat money like soil.', 'Portland, OR')
    on conflict (id) do update 
    set display_name = 'Eleanor', full_name = 'Eleanor Hart', streak_count = 47, location = 'Portland, OR';

    insert into public.settings (id, theme, palette, currency, round_transactions, show_micro_spending_insights)
    values (target_user_id, 'light', 'paper', 'EGP', false, true)
    on conflict (id) do nothing;

    -- Delete existing seed data to prevent duplication
    delete from public.milestones where user_id = target_user_id;
    delete from public.notifications where user_id = target_user_id;
    delete from public.goals where user_id = target_user_id;
    delete from public.transactions where user_id = target_user_id;
    delete from public.budgets where user_id = target_user_id;

    -- 2. SEED BUDGETS
    insert into public.budgets (user_id, name, category, icon, total, spent, tone, rollover)
    values 
        (target_user_id, 'Groceries', 'Food', 'ShoppingBasket', 500, 350, 'primary', 12),
        (target_user_id, 'Cafés & dining', 'Food', 'Coffee', 150, 128, 'warning', 0),
        (target_user_id, 'Transport', 'Mobility', 'Bus', 120, 75, 'accent', 0),
        (target_user_id, 'Entertainment', 'Leisure', 'Music', 100, 42, 'success', 8),
        (target_user_id, 'Education', 'Growth', 'BookOpen', 300, 180, 'primary', 0),
        (target_user_id, 'Rent & utilities', 'Home', 'Home', 700, 620, 'warning', 0),
        (target_user_id, 'Self-care', 'Wellness', 'Heart', 80, 24, 'success', 0),
        (target_user_id, 'Misc & extras', 'Other', 'Sparkles', 90, 95, 'warning', 0)
    returning id into b1_id; -- capture one ID as example

    -- Retrieve budget IDs for transactions binding
    select id into b1_id from public.budgets where user_id = target_user_id and name = 'Groceries';
    select id into b2_id from public.budgets where user_id = target_user_id and name = 'Cafés & dining';
    select id into b3_id from public.budgets where user_id = target_user_id and name = 'Transport';
    select id into b4_id from public.budgets where user_id = target_user_id and name = 'Entertainment';
    select id into b5_id from public.budgets where user_id = target_user_id and name = 'Education';
    select id into b6_id from public.budgets where user_id = target_user_id and name = 'Rent & utilities';
    select id into b7_id from public.budgets where user_id = target_user_id and name = 'Self-care';
    select id into b8_id from public.budgets where user_id = target_user_id and name = 'Misc & extras';

    -- 3. SEED TRANSACTIONS
    -- Insert transactions. The trigger will automatically update budget 'spent' amounts, but we use the mock data amounts below.
    insert into public.transactions (user_id, budget_id, title, merchant, category, date, amount, method, icon)
    values
        (target_user_id, b1_id, 'Weekly groceries', 'FreshMart', 'Food', '2024-10-26', -85.70, 'Card', 'ShoppingBasket'),
        (target_user_id, null, 'Freelance payment', 'Acme Studio', 'Income', '2024-10-25', 400.00, 'Transfer', 'Briefcase'),
        (target_user_id, b2_id, 'Morning coffee', 'Brewbar', 'Cafés', '2024-10-24', -4.50, 'Card', 'Coffee'),
        (target_user_id, b5_id, 'Algorithms textbook', 'Campus Books', 'Education', '2024-10-23', -32.99, 'Card', 'BookOpen'),
        (target_user_id, b4_id, 'Spotify Premium', 'Spotify', 'Subscriptions', '2024-10-22', -9.99, 'Card', 'Music'),
        (target_user_id, b3_id, 'Monthly transit pass', 'City Transit', 'Transport', '2024-10-21', -45.00, 'Card', 'Bus'),
        (target_user_id, b2_id, 'Dinner with friends', 'Olive & Oak', 'Cafés', '2024-10-20', -38.40, 'Card', 'Utensils'),
        (target_user_id, b8_id, 'Birthday gift — Maya', 'Local Florist', 'Gifts', '2024-10-19', -28.00, 'Cash', 'Gift'),
        (target_user_id, null, 'Scholarship stipend', 'University', 'Income', '2024-10-18', 600.00, 'Transfer', 'Wallet'),
        (target_user_id, b6_id, 'Room rent share', 'Landlord', 'Housing', '2024-10-15', -350.00, 'Transfer', 'Home'),
        (target_user_id, b1_id, 'Pantry restock', 'FreshMart', 'Food', '2024-10-12', -42.10, 'Card', 'ShoppingBasket'),
        (target_user_id, b2_id, 'Study session latte', 'Brewbar', 'Cafés', '2024-10-10', -5.25, 'Card', 'Coffee'),
        (target_user_id, null, 'Tutoring — November', 'Liam P.', 'Income', '2024-10-08', 120.00, 'Cash', 'Briefcase'),
        (target_user_id, b3_id, 'Weekend bus ticket', 'City Transit', 'Transport', '2024-10-05', -12.00, 'Card', 'Bus');

    -- Recalculate spent values to match exact transactions we inserted
    update public.budgets set spent = 350.00 where id = b1_id;
    update public.budgets set spent = 128.00 where id = b2_id;
    update public.budgets set spent = 75.00 where id = b3_id;
    update public.budgets set spent = 42.00 where id = b4_id;
    update public.budgets set spent = 180.00 where id = b5_id;
    update public.budgets set spent = 620.00 where id = b6_id;
    update public.budgets set spent = 24.00 where id = b7_id;
    update public.budgets set spent = 95.00 where id = b8_id;

    -- 4. SEED SAVINGS GOALS (Saplings)
    insert into public.goals (user_id, name, tagline, icon, saved, target, monthly, deadline, tone, featured)
    values
        (target_user_id, 'Summer trip to Lisbon', 'Two weeks of sunshine and pastéis de nata', 'Plane', 640.00, 1200.00, 140.00, 'Jun 2026', 'primary', true),
        (target_user_id, 'New laptop', 'Replace the aging study companion', 'Laptop', 480.00, 900.00, 90.00, 'Mar 2026', 'accent', false),
        (target_user_id, 'Master''s tuition fund', 'First semester safety net', 'GraduationCap', 1850.00, 3000.00, 200.00, 'Sep 2026', 'success', false),
        (target_user_id, 'Emergency cushion', 'Three months of essentials', 'Home', 720.00, 2400.00, 120.00, 'Dec 2026', 'warning', false),
        (target_user_id, 'Holiday gifts', 'Thoughtful, not stressful', 'Gift', 95.00, 250.00, 50.00, 'Dec 2025', 'primary', false);

    -- 5. SEED NOTIFICATIONS (Whispers)
    insert into public.notifications (user_id, category, icon, tone, title, body, read, pinned)
    values
        (target_user_id, 'saplings', 'Sprout', 'success', 'Emergency fund bloomed', 'Your emergency sapling reached 100% of its $6,000 target. Time to plant the next.', false, true),
        (target_user_id, 'budgets', 'AlertTriangle', 'warning', 'Groceries budget at 86%', '$432 of $500 spent this month. 9 days remain before reset.', false, false),
        (target_user_id, 'transactions', 'TrendingDown', 'destructive', 'Unusual outflow detected', '$248.00 at Northwind Hardware — larger than your typical spend in this category.', false, false),
        (target_user_id, 'transactions', 'TrendingUp', 'success', 'Payday landed', '$3,420.00 from Mossbark Studio cleared and was sorted into your ledger.', true, false),
        (target_user_id, 'saplings', 'Target', 'accent', 'Travel sapling watered', 'Recurring contribution of $150 added to your Kyoto fund.', true, false),
        (target_user_id, 'budgets', 'Leaf', 'success', 'Dining within bounds', 'Closed last week 18% under your dining allowance. Steady hand.', true, false),
        (target_user_id, 'system', 'Users', 'primary', 'New device signed in', 'iPad · Portland, OR. If this wasn''t you, prune the session in Settings.', true, false),
        (target_user_id, 'system', 'Wallet', 'primary', 'Account synced', 'Mossbark Credit Union finished its weekly reconciliation. 24 new entries.', true, false);

    -- 6. SEED MILESTONES (Almanac)
    insert into public.milestones (user_id, title, date, icon)
    values
        (target_user_id, 'Planted first sapling', 'Mar 2024', 'Sprout'),
        (target_user_id, 'First goal bloomed', 'Jul 2024', 'Leaf'),
        (target_user_id, '30-day streak', 'Sep 2024', 'Flame'),
        (target_user_id, 'Grove of ten', 'Jan 2025', 'TreePine');

end;
$$;
*/
