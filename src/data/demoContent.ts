import type { Post, Profile, CreatorProfile } from '@/types/database'

// Demo creator profiles
export const DEMO_CREATORS = {
  mikedavies: {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    email: 'mike@iamanalpha.com',
    full_name: 'Mike Davies',
    username: 'mikedavies',
    avatar_url: 'https://images.squarespace-cdn.com/content/v1/5c4e0b8a85ede1a5a1b0f43f/1548688539419-LQHQZ0N8LQY1TLXJLZQZ/Mike+Davies.jpg',
    bio: 'Founder & CEO of Alpha and Mike Davies Fitness Factory. With over 20 years of experience as a professional bodybuilder and fitness entrepreneur, I help Alphas transform their bodies, businesses, and mindsets. We Empower Alphas.',
    tagline: 'We Empower Alphas',
    subscription_price_cents: 2999,
    subscriber_count: 2450,
    banner_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=400&fit=crop',
  },
  davepalumbo: {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    email: 'dave@iamanalpha.com',
    full_name: 'Dave Palumbo',
    username: 'davepalumbo',
    avatar_url: 'https://images.squarespace-cdn.com/content/v1/5c4e0b8a85ede1a5a1b0f43f/1548690124219-8F3U3VXQG9EWNQLPFZ0T/Dave+Palumbo.jpg',
    bio: 'Professional bodybuilder, nutritionist, and founder of RXMuscle.com. With decades of experience in competitive bodybuilding and sports nutrition, I provide science-based guidance on contest prep, nutrition protocols, and training methodologies.',
    tagline: 'Science-Based Bodybuilding & Nutrition',
    subscription_price_cents: 2499,
    subscriber_count: 1890,
    banner_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=400&fit=crop',
  },
}

// Helper to get date relative to now
const daysAgo = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

// Demo posts for Mike Davies
export const MIKE_DAVIES_POSTS: Post[] = [
  {
    id: 'post-mike-001',
    creator_id: DEMO_CREATORS.mikedavies.id,
    title: 'Welcome to My Alpha Community!',
    content: `Welcome to the official Mike Davies Fitness Factory community!

I'm thrilled to have you here. Whether you're just starting your fitness journey or you're a seasoned athlete looking to level up, this is YOUR space to transform.

What you'll get as a member:
- Weekly workout programs designed for real results
- Nutrition guidance that actually works
- Direct access to me for Q&A
- Exclusive behind-the-scenes content
- A community of like-minded Alphas pushing each other

Remember: We don't just build bodies here. We build CHAMPIONS.

Let's get to work.

#WeEmpowerAlphas`,
    media_urls: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop'],
    visibility: 'public',
    is_pinned: true,
    like_count: 342,
    comment_count: 28,
    published_at: daysAgo(30),
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
  },
  {
    id: 'post-mike-002',
    creator_id: DEMO_CREATORS.mikedavies.id,
    title: 'The 3 Principles That Changed Everything',
    content: `After 20+ years in this game, I've learned that success comes down to three principles:

1. CONSISTENCY OVER INTENSITY
You don't need to destroy yourself every workout. Show up. Do the work. Repeat. The guy who trains 4x a week for 10 years beats the guy who goes hard for 3 months and quits.

2. PROGRESSIVE OVERLOAD IS KING
If you're not progressively challenging your muscles, you're not growing. Period. Track your lifts. Add weight. Add reps. Push harder than last time.

3. RECOVERY IS WHERE GROWTH HAPPENS
You don't grow in the gym - you grow when you rest. Sleep 7-8 hours. Eat enough protein. Take your rest days seriously.

These aren't secrets. They're fundamentals. The problem is most people ignore them chasing the next "hack."

Stop looking for shortcuts. Start mastering the basics.

What principle do you struggle with most? Drop a comment below.`,
    media_urls: ['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&h=800&fit=crop'],
    visibility: 'public',
    is_pinned: false,
    like_count: 289,
    comment_count: 45,
    published_at: daysAgo(25),
    created_at: daysAgo(25),
    updated_at: daysAgo(25),
  },
  {
    id: 'post-mike-003',
    creator_id: DEMO_CREATORS.mikedavies.id,
    title: 'EXCLUSIVE: My Personal Push Day Routine',
    content: `Alright members, here's the exact push day I'm running right now. This is the same routine that helped me add 15lbs to my bench in 8 weeks.

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

Take this workout and run it for 4-6 weeks. Increase weight when you hit the top of the rep range. Film your sets and review form.

Questions? Drop them in the comments. Let's build those pecs!`,
    media_urls: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=600&h=600&fit=crop'
    ],
    visibility: 'subscribers_only',
    is_pinned: false,
    like_count: 456,
    comment_count: 67,
    published_at: daysAgo(20),
    created_at: daysAgo(20),
    updated_at: daysAgo(20),
  },
  {
    id: 'post-mike-004',
    creator_id: DEMO_CREATORS.mikedavies.id,
    title: 'When You Feel Like Quitting, Read This',
    content: `Got a message today from someone who wanted to quit.

"Mike, I've been at this for 6 months and I don't see the results I want. Maybe this isn't for me."

Here's what I told them:

6 months? That's nothing. I didn't see REAL results until year 2. Most people quit at month 3 when the initial motivation fades.

The transformation you want takes YEARS, not months. And you know what? That's actually GOOD news.

Why? Because if it was easy, everyone would look like a Greek god. The difficulty is what makes it valuable. The struggle is what separates you from the crowd.

Every rep you grind out when you don't feel like it.
Every meal you prep on Sunday.
Every early morning you choose the gym over sleep.

That's you building something most people will never have. Not just a physique - but DISCIPLINE. MENTAL TOUGHNESS. SELF-RESPECT.

Don't quit when it gets hard. That's when the magic happens.

Keep going. I'm right here with you.

#NeverQuit #WeEmpowerAlphas`,
    media_urls: ['https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&h=800&fit=crop'],
    visibility: 'public',
    is_pinned: false,
    like_count: 523,
    comment_count: 89,
    published_at: daysAgo(15),
    created_at: daysAgo(15),
    updated_at: daysAgo(15),
  },
  {
    id: 'post-mike-005',
    creator_id: DEMO_CREATORS.mikedavies.id,
    title: 'My Complete Bulking Meal Plan (3,500 Calories)',
    content: `Members asked, I delivered. Here's my complete bulking meal plan that I use during off-season.

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

Questions? Comment below!`,
    media_urls: ['https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=800&fit=crop'],
    visibility: 'subscribers_only',
    is_pinned: false,
    like_count: 387,
    comment_count: 52,
    published_at: daysAgo(10),
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
  },
  {
    id: 'post-mike-006',
    creator_id: DEMO_CREATORS.mikedavies.id,
    title: 'Back Day Hits Different at 5 AM',
    content: `There's something about being in the gym when the sun comes up. No crowds. No distractions. Just you and the iron.

Hit a PR on deadlifts today - 545 for a clean triple. Form was dialed in. That's what 20 years of perfecting technique gets you.

Morning workouts aren't for everyone, but if you can make them work, the benefits are real:
- Empty gym = better focus
- Sets the tone for your entire day
- Gets it done before life gets in the way

What time do you train? Early bird or night owl?`,
    media_urls: [
      'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop'
    ],
    visibility: 'public',
    is_pinned: false,
    like_count: 198,
    comment_count: 34,
    published_at: daysAgo(5),
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
  },
  {
    id: 'post-mike-007',
    creator_id: DEMO_CREATORS.mikedavies.id,
    title: 'LIVE Q&A This Saturday - Members Only',
    content: `Heads up Alpha fam!

This Saturday at 2 PM EST, I'm doing a LIVE Q&A exclusively for subscribers.

Bring your questions about:
- Training splits and exercise selection
- Nutrition and supplementation
- Competition prep
- Building your fitness business
- Mindset and motivation
- Anything else you want to know

I'll be answering questions for a full hour. This is your chance to get personalized advice.

Not a member yet? Subscribe now and you'll have access to the live session plus the recording.

See you Saturday!`,
    media_urls: ['https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1200&h=800&fit=crop'],
    visibility: 'public',
    is_pinned: false,
    like_count: 156,
    comment_count: 22,
    published_at: daysAgo(2),
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
  },
]

// Demo posts for Dave Palumbo
export const DAVE_PALUMBO_POSTS: Post[] = [
  {
    id: 'post-dave-001',
    creator_id: DEMO_CREATORS.davepalumbo.id,
    title: 'Welcome to My Inner Circle',
    content: `Welcome to my exclusive community on Alpha!

For those who don't know me - I'm Dave Palumbo. I've been in competitive bodybuilding for over 30 years. I've competed at the highest levels, trained countless champions, and built RXMuscle into one of the biggest bodybuilding media platforms in the world.

But more importantly, I've dedicated my life to understanding the SCIENCE behind building muscle and optimizing performance.

Here, you'll get:
- Science-based training protocols
- Advanced nutrition strategies
- Supplement deep-dives (what works, what doesn't)
- Contest prep guidance
- Exclusive interviews and content

No bro-science. No BS. Just real knowledge from real experience.

Let's get to work.`,
    media_urls: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=800&fit=crop'],
    visibility: 'public',
    is_pinned: true,
    like_count: 278,
    comment_count: 41,
    published_at: daysAgo(28),
    created_at: daysAgo(28),
    updated_at: daysAgo(28),
  },
  {
    id: 'post-dave-002',
    creator_id: DEMO_CREATORS.davepalumbo.id,
    title: 'The Truth About Keto for Bodybuilders',
    content: `I get asked about keto ALL the time. Here's my honest take after years of experimenting and coaching athletes:

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
Keto CAN work for bodybuilders, but it's not magic and it's not for everyone. The best diet is the one you can stick to.

Want the full breakdown of my carb-cycling keto protocol? It's in the members section.`,
    media_urls: ['https://images.unsplash.com/photo-1432139509613-5c4255815697?w=1200&h=800&fit=crop'],
    visibility: 'public',
    is_pinned: false,
    like_count: 312,
    comment_count: 56,
    published_at: daysAgo(22),
    created_at: daysAgo(22),
    updated_at: daysAgo(22),
  },
  {
    id: 'post-dave-003',
    creator_id: DEMO_CREATORS.davepalumbo.id,
    title: 'Contest Prep 101: The 16-Week Blueprint',
    content: `Members, here's my complete 16-week contest prep blueprint. This is the same approach I use with my competitive athletes.

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

Save this post. You'll reference it many times.

Questions? Drop them below.`,
    media_urls: [
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&h=600&fit=crop'
    ],
    visibility: 'subscribers_only',
    is_pinned: false,
    like_count: 423,
    comment_count: 78,
    published_at: daysAgo(18),
    created_at: daysAgo(18),
    updated_at: daysAgo(18),
  },
  {
    id: 'post-dave-004',
    creator_id: DEMO_CREATORS.davepalumbo.id,
    title: "Supplements That Actually Work (And Ones That Don't)",
    content: `Let me save you hundreds of dollars. Here's my honest supplement tier list after 30 years in this industry:

**TIER 1 - ESSENTIAL** (Actually work)
- Creatine Monohydrate - Most researched supplement ever. 5g daily. Just take it.
- Whey Protein - Convenient protein source. Nothing magical, just practical.
- Caffeine - Proven performance enhancer. 200-400mg pre-workout.
- Fish Oil - Inflammation, heart health, joint support. 2-3g EPA/DHA daily.

**TIER 2 - SITUATIONAL** (Work for specific goals)
- Citrulline Malate - Decent pumps and endurance. 6-8g pre-workout.
- Beta-Alanine - Helps with high-rep training. 3-5g daily.
- Vitamin D - Most people are deficient. Get bloodwork first.

**TIER 3 - PROBABLY USELESS** (Save your money)
- BCAAs - Waste of money if you eat enough protein.
- Testosterone boosters - None of them actually work.
- Fat burners - Just expensive caffeine with marketing.
- Most pre-workouts - Overpriced caffeine with tingle.

**THE BOTTOM LINE:**
90% of your results come from training, nutrition, and sleep. Supplements are the last 10%, and most of that 10% is protein and creatine.

Stop chasing the next magic pill. Master the basics first.`,
    media_urls: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=1200&h=800&fit=crop'],
    visibility: 'public',
    is_pinned: false,
    like_count: 445,
    comment_count: 92,
    published_at: daysAgo(12),
    created_at: daysAgo(12),
    updated_at: daysAgo(12),
  },
  {
    id: 'post-dave-005',
    creator_id: DEMO_CREATORS.davepalumbo.id,
    title: 'My Off-Season Training Split (Full Breakdown)',
    content: `Members, you asked for it - here's my complete off-season training split with exercise selection and rep schemes.

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
- Log every workout - track progress weekly`,
    media_urls: ['https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=1200&h=800&fit=crop'],
    visibility: 'subscribers_only',
    is_pinned: false,
    like_count: 356,
    comment_count: 63,
    published_at: daysAgo(7),
    created_at: daysAgo(7),
    updated_at: daysAgo(7),
  },
  {
    id: 'post-dave-006',
    creator_id: DEMO_CREATORS.davepalumbo.id,
    title: 'Just Dropped: My Interview with a 3x Olympia Champion',
    content: `NEW on RXMuscle!

Just finished recording an incredible 2-hour interview that goes DEEP into what it takes to win at the highest level.

We covered:
- His exact training approach leading up to each Olympia
- The mental game of competing at that level
- Nutrition secrets most people don't know
- What he'd do differently if starting over
- Honest talk about the realities of pro bodybuilding

This is the most candid interview I've ever done. No scripted answers, no BS - just real talk between two guys who've been in the trenches.

The full interview drops next week on RXMuscle. But Alpha members get early access - check the members section tonight!

Who else should I interview next? Drop names below!`,
    media_urls: ['https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1200&h=800&fit=crop'],
    visibility: 'public',
    is_pinned: false,
    like_count: 234,
    comment_count: 47,
    published_at: daysAgo(3),
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
  },
  {
    id: 'post-dave-007',
    creator_id: DEMO_CREATORS.davepalumbo.id,
    title: 'Arm Day at 52 - Still Making Gains',
    content: `Quick arm session today. People ask if you can still make progress after 50. The answer is YES - you just have to be smarter about it.

Key adjustments I've made:
- More warm-up time (15-20 min minimum)
- Higher reps, controlled eccentrics
- Focus on mind-muscle connection over weight
- Better recovery between sessions
- Prioritize joint health

Today's workout:
- Preacher Curls: 4x12-15
- Incline Dumbbell Curls: 3x12
- Cable Curls: 3x15
- Close-Grip Bench: 4x10-12
- Overhead Cable Extensions: 3x15
- Tricep Dips: 3x failure

The pump was ridiculous. Age is just a number if you train smart.

Drop your age and years of training in the comments!`,
    media_urls: [
      'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop'
    ],
    visibility: 'public',
    is_pinned: false,
    like_count: 187,
    comment_count: 38,
    published_at: daysAgo(1),
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
]

// Combined demo posts
export const ALL_DEMO_POSTS: Post[] = [...MIKE_DAVIES_POSTS, ...DAVE_PALUMBO_POSTS]

// Helper function to get posts by creator username
export function getDemoPostsByCreator(username: string, isSubscribed: boolean = false): Post[] {
  const creatorId = username.toLowerCase() === 'mikedavies'
    ? DEMO_CREATORS.mikedavies.id
    : username.toLowerCase() === 'davepalumbo'
    ? DEMO_CREATORS.davepalumbo.id
    : null

  if (!creatorId) return []

  const creatorPosts = ALL_DEMO_POSTS.filter(p => p.creator_id === creatorId)

  if (isSubscribed) {
    return creatorPosts
  }

  // Only return public posts if not subscribed
  return creatorPosts.filter(p => p.visibility === 'public')
}

// Helper function to get demo creator profile data
export function getDemoCreatorProfile(username: string): {
  profile: Profile
  creatorProfile: CreatorProfile
} | null {
  const key = username.toLowerCase() as keyof typeof DEMO_CREATORS
  const creator = DEMO_CREATORS[key]

  if (!creator) return null

  return {
    profile: {
      id: creator.id,
      email: creator.email,
      full_name: creator.full_name,
      username: creator.username,
      avatar_url: creator.avatar_url,
      role: 'creator',
      created_at: daysAgo(365),
      updated_at: daysAgo(1),
    },
    creatorProfile: {
      id: creator.id,
      user_id: creator.id,
      bio: creator.bio,
      tagline: creator.tagline,
      banner_url: creator.banner_url,
      category_id: null,
      subscription_price_cents: creator.subscription_price_cents,
      stripe_account_id: null,
      stripe_onboarding_complete: false,
      subscriber_count: creator.subscriber_count,
      is_featured: true,
      is_active: true,
      social_links: {
        instagram: `https://instagram.com/${creator.username}`,
        youtube: `https://youtube.com/@${creator.username}`,
        website: 'https://iamanalpha.com'
      },
      created_at: daysAgo(365),
      updated_at: daysAgo(1),
    }
  }
}

// Check if a username is a demo creator
export function isDemoCreator(username: string): boolean {
  const key = username.toLowerCase()
  return key === 'mikedavies' || key === 'davepalumbo'
}
