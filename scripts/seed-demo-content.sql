-- Alpha Marketplace Demo Content Seeding
-- Run this in the Supabase SQL Editor to add demo posts for Mike Davies and Dave Palumbo
-- https://supabase.com/dashboard/project/xigukyglicivnvsloshg/sql/new

-- Mike Davies Posts (creator_id = a1b2c3d4-e5f6-7890-abcd-ef1234567890)
-- Dave Palumbo Posts (creator_id = b2c3d4e5-f6a7-8901-bcde-f12345678901)

-- First, clean up any existing demo posts
DELETE FROM posts WHERE creator_id IN (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901'
);

-- ============================================
-- MIKE DAVIES POSTS
-- ============================================

-- Post 1: Welcome/Pinned Post (Public)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-mike-001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Welcome to My Alpha Community!',
  'Welcome to the official Mike Davies Fitness Factory community!

I''m thrilled to have you here. Whether you''re just starting your fitness journey or you''re a seasoned athlete looking to level up, this is YOUR space to transform.

What you''ll get as a member:
- Weekly workout programs designed for real results
- Nutrition guidance that actually works
- Direct access to me for Q&A
- Exclusive behind-the-scenes content
- A community of like-minded Alphas pushing each other

Remember: We don''t just build bodies here. We build CHAMPIONS.

Let''s get to work. 💪

#WeEmpowerAlphas',
  ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop'],
  'public',
  true,
  342,
  28,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
);

-- Post 2: Training Philosophy (Public)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-mike-002',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'The 3 Principles That Changed Everything',
  'After 20+ years in this game, I''ve learned that success comes down to three principles:

1. CONSISTENCY OVER INTENSITY
You don''t need to destroy yourself every workout. Show up. Do the work. Repeat. The guy who trains 4x a week for 10 years beats the guy who goes hard for 3 months and quits.

2. PROGRESSIVE OVERLOAD IS KING
If you''re not progressively challenging your muscles, you''re not growing. Period. Track your lifts. Add weight. Add reps. Push harder than last time.

3. RECOVERY IS WHERE GROWTH HAPPENS
You don''t grow in the gym - you grow when you rest. Sleep 7-8 hours. Eat enough protein. Take your rest days seriously.

These aren''t secrets. They''re fundamentals. The problem is most people ignore them chasing the next "hack."

Stop looking for shortcuts. Start mastering the basics.

What principle do you struggle with most? Drop a comment below.',
  ARRAY['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&h=800&fit=crop'],
  'public',
  false,
  289,
  45,
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '25 days'
);

-- Post 3: Subscriber-only workout (Subscribers Only)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-mike-003',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'EXCLUSIVE: My Personal Push Day Routine',
  'Alright members, here''s the exact push day I''m running right now. This is the same routine that helped me add 15lbs to my bench in 8 weeks.

**WARM-UP** (10 min)
- Band pull-aparts: 3x20
- Shoulder circles: 2 min each direction
- Light dumbbell press: 2x15

**MAIN WORKOUT**

A1. Incline Barbell Press
- 4 sets x 6-8 reps
- Rest 2-3 min between sets
- Focus on controlled negatives (3 seconds down)

A2. Flat Dumbbell Press
- 4 sets x 8-10 reps
- Rest 90 seconds
- Full stretch at bottom, squeeze at top

B1. Overhead Press (Standing)
- 3 sets x 8-10 reps
- Strict form - no leg drive

B2. Lateral Raises
- 4 sets x 12-15 reps
- Light weight, perfect form

C1. Cable Flyes (Low to High)
- 3 sets x 12-15 reps
- Squeeze for 2 seconds at top

C2. Tricep Pushdowns
- 4 sets x 10-12 reps
- Keep elbows pinned

D1. Overhead Tricep Extension
- 3 sets x 12-15 reps
- Full stretch at bottom

**NOTES:**
- Take this workout and run it for 4-6 weeks
- Increase weight when you hit the top of the rep range
- Film your sets and review form

Questions? Drop them in the comments. Let''s build those pecs! 🔥',
  ARRAY[
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=600&h=600&fit=crop'
  ],
  'subscribers_only',
  false,
  456,
  67,
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days'
);

-- Post 4: Motivation (Public)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-mike-004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'When You Feel Like Quitting, Read This',
  'Got a message today from someone who wanted to quit.

"Mike, I''ve been at this for 6 months and I don''t see the results I want. Maybe this isn''t for me."

Here''s what I told them:

6 months? That''s nothing. I didn''t see REAL results until year 2. Most people quit at month 3 when the initial motivation fades.

The transformation you want takes YEARS, not months. And you know what? That''s actually GOOD news.

Why? Because if it was easy, everyone would look like a Greek god. The difficulty is what makes it valuable. The struggle is what separates you from the crowd.

Every rep you grind out when you don''t feel like it.
Every meal you prep on Sunday.
Every early morning you choose the gym over sleep.

That''s you building something most people will never have. Not just a physique - but DISCIPLINE. MENTAL TOUGHNESS. SELF-RESPECT.

Don''t quit when it gets hard. That''s when the magic happens.

Keep going. I''m right here with you.

#NeverQuit #WeEmpowerAlphas',
  ARRAY['https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&h=800&fit=crop'],
  'public',
  false,
  523,
  89,
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days'
);

-- Post 5: Nutrition Guide (Subscribers Only)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-mike-005',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'My Complete Bulking Meal Plan (3,500 Calories)',
  'Members asked, I delivered. Here''s my complete bulking meal plan that I use during off-season.

**DAILY TARGETS:**
- Calories: 3,500
- Protein: 250g
- Carbs: 400g
- Fat: 90g

---

**MEAL 1 - 6:00 AM** (Post-Wake)
- 6 whole eggs scrambled
- 1 cup oatmeal with banana
- 2 tbsp peanut butter
*~850 calories, 45g protein*

**MEAL 2 - 9:30 AM** (Pre-Workout)
- 8oz chicken breast
- 2 cups white rice
- Mixed vegetables
*~650 calories, 55g protein*

**MEAL 3 - 1:00 PM** (Post-Workout)
- 2 scoops whey protein
- 1 large banana
- 2 cups Cheerios with milk
*~600 calories, 50g protein*

**MEAL 4 - 4:00 PM**
- 8oz 93% lean ground beef
- 2 cups pasta
- Marinara sauce
*~750 calories, 55g protein*

**MEAL 5 - 7:30 PM**
- 8oz salmon
- 1 large sweet potato
- Broccoli
*~550 calories, 45g protein*

**MEAL 6 - 10:00 PM** (Before Bed)
- 1 cup Greek yogurt
- 1 scoop casein protein
- Handful of almonds
*~450 calories, 50g protein*

---

**TIPS:**
- Prep meals on Sunday and Wednesday
- Season everything - bland food = failed diet
- Drink 1 gallon of water daily
- Adjust portions based on scale weight

Questions? Comment below!',
  ARRAY['https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=800&fit=crop'],
  'subscribers_only',
  false,
  387,
  52,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
);

-- Post 6: Recent Training (Public)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-mike-006',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Back Day Hits Different at 5 AM',
  'There''s something about being in the gym when the sun comes up. No crowds. No distractions. Just you and the iron.

Hit a PR on deadlifts today - 545 for a clean triple. Form was dialed in. That''s what 20 years of perfecting technique gets you.

Morning workouts aren''t for everyone, but if you can make them work, the benefits are real:
- Empty gym = better focus
- Sets the tone for your entire day
- Gets it done before life gets in the way

What time do you train? Early bird or night owl?',
  ARRAY[
    'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop'
  ],
  'public',
  false,
  198,
  34,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
);

-- Post 7: Q&A Announcement (Public)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-mike-007',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'LIVE Q&A This Saturday - Members Only',
  'Heads up Alpha fam! 🗓️

This Saturday at 2 PM EST, I''m doing a LIVE Q&A exclusively for subscribers.

Bring your questions about:
- Training splits and exercise selection
- Nutrition and supplementation
- Competition prep
- Building your fitness business
- Mindset and motivation
- Anything else you want to know

I''ll be answering questions for a full hour. This is your chance to get personalized advice.

Not a member yet? Subscribe now and you''ll have access to the live session plus the recording.

See you Saturday! 💪',
  ARRAY['https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1200&h=800&fit=crop'],
  'public',
  false,
  156,
  22,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- ============================================
-- DAVE PALUMBO POSTS
-- ============================================

-- Post 1: Welcome/Pinned Post (Public)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-dave-001',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Welcome to My Inner Circle',
  'Welcome to my exclusive community on Alpha!

For those who don''t know me - I''m Dave Palumbo. I''ve been in competitive bodybuilding for over 30 years. I''ve competed at the highest levels, trained countless champions, and built RXMuscle into one of the biggest bodybuilding media platforms in the world.

But more importantly, I''ve dedicated my life to understanding the SCIENCE behind building muscle and optimizing performance.

Here, you''ll get:
✅ Science-based training protocols
✅ Advanced nutrition strategies
✅ Supplement deep-dives (what works, what doesn''t)
✅ Contest prep guidance
✅ Exclusive interviews and content

No bro-science. No BS. Just real knowledge from real experience.

Let''s get to work.',
  ARRAY['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=800&fit=crop'],
  'public',
  true,
  278,
  41,
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '28 days'
);

-- Post 2: Keto Talk (Public)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-dave-002',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'The Truth About Keto for Bodybuilders',
  'I get asked about keto ALL the time. Here''s my honest take after years of experimenting and coaching athletes:

**THE GOOD:**
- Excellent for fat loss when done correctly
- Reduces water retention - great for competition
- Can improve mental clarity and energy
- Protein sparing when adapted

**THE BAD:**
- Initial strength loss (temporary)
- Requires strict adherence
- Not ideal for heavy training days
- Social eating becomes difficult

**MY APPROACH:**
I use a modified approach I call "keto with a kick" - essentially cycling carbs around training while staying ketogenic most of the time.

Training days: Add 50-100g carbs pre/post workout
Non-training days: Stay under 30g carbs

This gives you the fat-burning benefits while maintaining workout performance.

**BOTTOM LINE:**
Keto CAN work for bodybuilders, but it''s not magic and it''s not for everyone. The best diet is the one you can stick to.

Want the full breakdown of my carb-cycling keto protocol? It''s in the members section.',
  ARRAY['https://images.unsplash.com/photo-1432139509613-5c4255815697?w=1200&h=800&fit=crop'],
  'public',
  false,
  312,
  56,
  NOW() - INTERVAL '22 days',
  NOW() - INTERVAL '22 days'
);

-- Post 3: Contest Prep (Subscribers Only)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-dave-003',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Contest Prep 101: The 16-Week Blueprint',
  'Members, here''s my complete 16-week contest prep blueprint. This is the same approach I use with my competitive athletes.

**PHASE 1: WEEKS 16-12** (Foundation)
- Calories: 15-16 x bodyweight
- Cardio: 3x per week, 30 min low intensity
- Training: Normal off-season split
- Focus: Establish baseline, dial in nutrition

**PHASE 2: WEEKS 12-8** (Acceleration)
- Reduce calories by 10%
- Cardio: 4-5x per week, 40 min
- Add one HIIT session per week
- Focus: Fat loss should be 1-1.5 lbs/week

**PHASE 3: WEEKS 8-4** (Push Phase)
- Reduce calories another 10%
- Cardio: Daily, 45-60 min
- Training: Higher reps, shorter rest
- Focus: Getting lean while preserving muscle

**PHASE 4: WEEKS 4-1** (Peak Week)
- Water/sodium manipulation begins week out
- Carb depletion then loading
- Final cardio adjustments
- Focus: Details, details, details

**KEY METRICS TO TRACK:**
- Morning weight (daily)
- Progress photos (weekly)
- Measurements (bi-weekly)
- Training weights (every session)

**SUPPLEMENTS THAT ACTUALLY HELP:**
- Whey/Casein protein
- Creatine (yes, even when cutting)
- Fish oil
- Multivitamin
- Caffeine (pre-workout)

Save this post. You''ll reference it many times.

Questions? Drop them below.',
  ARRAY[
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&h=600&fit=crop'
  ],
  'subscribers_only',
  false,
  423,
  78,
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '18 days'
);

-- Post 4: Supplement Review (Public)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-dave-004',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Supplements That Actually Work (And Ones That Don''t)',
  'Let me save you hundreds of dollars. Here''s my honest supplement tier list after 30 years in this industry:

**TIER 1 - ESSENTIAL** (Actually work)
🟢 Creatine Monohydrate - Most researched supplement ever. 5g daily. Just take it.
🟢 Whey Protein - Convenient protein source. Nothing magical, just practical.
🟢 Caffeine - Proven performance enhancer. 200-400mg pre-workout.
🟢 Fish Oil - Inflammation, heart health, joint support. 2-3g EPA/DHA daily.

**TIER 2 - SITUATIONAL** (Work for specific goals)
🟡 Citrulline Malate - Decent pumps and endurance. 6-8g pre-workout.
🟡 Beta-Alanine - Helps with high-rep training. 3-5g daily.
🟡 Vitamin D - Most people are deficient. Get bloodwork first.

**TIER 3 - PROBABLY USELESS** (Save your money)
🔴 BCAAs - Waste of money if you eat enough protein.
🔴 Testosterone boosters - None of them actually work.
🔴 Fat burners - Just expensive caffeine with marketing.
🔴 Most pre-workouts - Overpriced caffeine with tingle.

**THE BOTTOM LINE:**
90% of your results come from training, nutrition, and sleep. Supplements are the last 10%, and most of that 10% is protein and creatine.

Stop chasing the next magic pill. Master the basics first.',
  ARRAY['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=1200&h=800&fit=crop'],
  'public',
  false,
  445,
  92,
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '12 days'
);

-- Post 5: Training Split (Subscribers Only)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-dave-005',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'My Off-Season Training Split (Full Breakdown)',
  'Members, you asked for it - here''s my complete off-season training split with exercise selection and rep schemes.

**TRAINING PHILOSOPHY:**
- Heavy compound movements for strength
- Isolation work for detail
- Each muscle 2x per week
- Progressive overload is priority #1

---

**DAY 1: CHEST/SHOULDERS**
- Incline Barbell Press: 4x6-8
- Flat Dumbbell Press: 4x8-10
- Seated Overhead Press: 4x8-10
- Lateral Raises: 4x12-15
- Rear Delt Flyes: 3x15-20
- Cable Crossovers: 3x12-15

**DAY 2: BACK/TRAPS**
- Deadlifts: 4x5-6
- Weighted Pull-ups: 4x6-8
- Barbell Rows: 4x8-10
- Seated Cable Rows: 3x10-12
- Lat Pulldowns: 3x10-12
- Barbell Shrugs: 4x10-12

**DAY 3: LEGS**
- Squats: 4x6-8
- Leg Press: 4x10-12
- Romanian Deadlifts: 4x8-10
- Leg Curls: 4x10-12
- Leg Extensions: 3x12-15
- Standing Calf Raises: 5x10-15

**DAY 4: REST**

**DAY 5: CHEST/SHOULDERS (Volume)**
- Dumbbell Incline Press: 4x10-12
- Machine Chest Press: 3x12-15
- Arnold Press: 4x10-12
- Cable Lateral Raises: 4x15-20
- Face Pulls: 3x15-20

**DAY 6: BACK/ARMS**
- T-Bar Rows: 4x8-10
- One-Arm Dumbbell Rows: 3x10-12
- Straight Arm Pulldowns: 3x12-15
- Barbell Curls: 4x8-10
- Skull Crushers: 4x10-12
- Hammer Curls: 3x12-15
- Tricep Pushdowns: 3x12-15

**DAY 7: LEGS (Volume) + REST**
- Hack Squats: 4x10-12
- Walking Lunges: 3x12 each leg
- Leg Curls: 4x12-15
- Seated Calf Raises: 4x15-20

---

**NOTES:**
- Rest periods: 2-3 min for compounds, 60-90 sec for isolation
- Warm-up properly before heavy movements
- Log every workout - track progress weekly',
  ARRAY[
    'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=1200&h=800&fit=crop'
  ],
  'subscribers_only',
  false,
  356,
  63,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
);

-- Post 6: RXMuscle Interview (Public)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-dave-006',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Just Dropped: My Interview with a 3x Olympia Champion',
  'NEW on RXMuscle! 🎬

Just finished recording an incredible 2-hour interview that goes DEEP into what it takes to win at the highest level.

We covered:
- His exact training approach leading up to each Olympia
- The mental game of competing at that level
- Nutrition secrets most people don''t know
- What he''d do differently if starting over
- Honest talk about the realities of pro bodybuilding

This is the most candid interview I''ve ever done. No scripted answers, no BS - just real talk between two guys who''ve been in the trenches.

The full interview drops next week on RXMuscle. But Alpha members get early access - check the members section tonight!

Who else should I interview next? Drop names below! 👇',
  ARRAY['https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1200&h=800&fit=crop'],
  'public',
  false,
  234,
  47,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- Post 7: Recent Training Video (Public)
INSERT INTO posts (
  id, creator_id, title, content, media_urls, visibility, is_pinned, like_count, comment_count, published_at, created_at
) VALUES (
  'post-dave-007',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Arm Day at 52 - Still Making Gains',
  'Quick arm session today. People ask if you can still make progress after 50. The answer is YES - you just have to be smarter about it.

Key adjustments I''ve made:
- More warm-up time (15-20 min minimum)
- Higher reps, controlled eccentrics
- Focus on mind-muscle connection over weight
- Better recovery between sessions
- Prioritize joint health

Today''s workout:
- Preacher Curls: 4x12-15
- Incline Dumbbell Curls: 3x12
- Cable Curls: 3x15
- Close-Grip Bench: 4x10-12
- Overhead Cable Extensions: 3x15
- Tricep Dips: 3x failure

The pump was ridiculous. Age is just a number if you train smart.

Drop your age and years of training in the comments! 💪',
  ARRAY[
    'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop'
  ],
  'public',
  false,
  187,
  38,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- Verify the data was inserted
SELECT
  p.title,
  p.visibility,
  p.is_pinned,
  p.like_count,
  p.comment_count,
  pr.full_name as creator_name,
  p.published_at
FROM posts p
JOIN profiles pr ON p.creator_id = pr.id
WHERE p.creator_id IN (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901'
)
ORDER BY p.published_at DESC;
