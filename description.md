# LingoFlash Project Description

## 1. Website Functionality & Features

### Core Learning Modules
*   **Smart Flashcards:** Interactive 3D flip cards with native audio playback (selectable Male/Female voices) and phonetic transcriptions.
*   **AI Speaking Coach:** Real-time speech recording and analysis providing detailed feedback on fluency, grammar, vocabulary, and pronunciation. Includes "Better Choice" suggestions.
*   **Pronunciation Lab:** Dedicated tool for mastering difficult sounds and intonation with visual audio feedback and native speaker comparisons.
*   **Listening Digests:** Curated audio lessons/podcasts with integrated comprehension tests.

### Progression & Personalization
*   **Adaptive Onboarding:** Diagnostic assessment to determine CEFR level (A1-C1) and tailor the initial learning path.
*   **Goal Setting:** Customizable learning focus based on user interests (e.g., Travel, Business, Academic Exams).
*   **Gamified Dashboard:** Comprehensive progress tracking with XP points, daily streaks, and visual level indicators.
*   **Leaderboards:** Competitive ranking system featuring weekly/monthly leagues, podium views, and movement indicators (up/down).

### Content Library
*   **Curated Decks:** Professionally designed vocabulary sets categorized by level (A1-C1) and topic.
*   **Custom Decks:** Functionality for users to create and manage their own study sets.
*   **Subscription Management:** "LingoFlash Plus" tier for offline access and unlimited AI practice.

## 2. Key Selling Points (USPs)
*   **"Private Tutor" Experience:** The AI Speaking Coach provides instant, granular feedback that usually requires a human teacher.
*   **Context-First Learning:** Focus on real-world usage (Business, Travel) rather than isolated vocabulary.
*   **Visually Engaging:** A polished, "juicy" UI with high-quality animations and interactions that makes studying feel like a game.
*   **Scientific Foundation:** Built on CEFR standards and spaced repetition principles for effective retention.

## 3. Design System Specification

### Color Palette
*   **Primary:** Indigo (`bg-indigo-600`, `text-indigo-600`, `shadow-indigo-200`). Used for primary actions, branding, and progress bars.
*   **Backgrounds:**
    *   **App Background:** `bg-slate-50` (Light grey/blue tint).
    *   **Card Background:** `bg-white`.
*   **Neutral Text:**
    *   **Headings:** `text-slate-800` or `text-slate-900`.
    *   **Body:** `text-slate-600`.
    *   **Subtle/Labels:** `text-slate-400`.
*   **Semantic Accents:**
    *   **Rose:** Female voice, errors, "hot" streaks (`bg-rose-50`, `text-rose-600`).
    *   **Blue:** Male voice, information (`bg-blue-50`, `text-blue-600`).
    *   **Emerald:** Success, high scores (`bg-emerald-50`, `text-emerald-700`).
    *   **Amber:** Trophies, warnings (`bg-amber-50`, `text-amber-700`).

### Typography
*   **Font Family:** Sans-serif (Tailwind default `font-sans`).
*   **Headings:**
    *   Style: `font-extrabold tracking-tight`.
    *   Sizes: `text-3xl`, `text-4xl`.
*   **Labels & Micro-copy:**
    *   Style: `font-bold uppercase tracking-wider`.
    *   Size: `text-xs` or `text-sm`.

### UI Components & Shape Language
*   **Cards:** `rounded-2xl`, `border border-slate-200`, `shadow-xl` (often with `overflow-hidden`).
*   **Buttons:**
    *   **Shape:** `rounded-full`.
    *   **Primary:** `bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95`.
    *   **Secondary/Icon:** `bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-50`.
*   **Icons:** Lucide React icons, frequently wrapped in a rounded container with a pastel background (e.g., `bg-indigo-50 text-indigo-600`).

### Interactions
*   **Hover:** `hover:-translate-y-1` for cards, `hover:shadow-lg`.
*   **Active:** `active:scale-95` for buttons.
*   **Transitions:** `transition-all duration-200` or `duration-300`.

## 4. Prompt for Promo Website Creation

"Develop a high-converting, visually stunning promotional landing page for **LingoFlash**, an AI-powered language learning application.

**Objective:** Drive user sign-ups and app downloads by showcasing the app's premium design and AI capabilities.

**Content Structure:**
1.  **Hero Section:**
    *   **Headline:** Impactful and bold (e.g., 'Master a Language with your AI Tutor').
    *   **Subhead:** Focus on speaking confidence and real-time feedback.
    *   **CTA:** 'Start Learning for Free' (Primary Button).
    *   **Visual:** A placeholder for a 3D perspective app screenshot or mockups of the 'Speaking Coach' interface.
2.  **Features Grid:**
    *   Showcase 3-4 key features (Smart Flashcards, AI Speaking Coach, Pronunciation Lab).
    *   Use the project's **Card** design (rounded-2xl, shadow-xl) and **Lucide Icons** in colored circles.
3.  **Interactive Demo/Teaser:**
    *   A section that visually represents the 'Feedback' loop (e.g., 'You say...' -> 'AI Corrects...').
4.  **Social Proof:**
    *   User stats (e.g., '10k+ Active Learners', '50k Lessons Completed').
    *   Testimonial cards in the style of the app's UI.
5.  **Pricing Tier:**
    *   Simple toggle between 'Free' and 'LingoFlash Plus'.
    *   Highlight benefits like 'Offline Mode' and 'Unlimited AI'.
6.  **Footer:**
    *   Links to privacy, terms, and social media.

**Design Guidelines:**
*   **Strict Adherence to LingoFlash Design System:**
    *   Use `bg-slate-50` for the page background.
    *   Use `text-slate-900` for headings (`font-extrabold tracking-tight`) and `text-slate-600` for body.
    *   Primary Action Color: `indigo-600`.
    *   Use colored shadows (`shadow-indigo-200`) for depth.
*   **Tech Stack:** React, Tailwind CSS, Lucide React.
*   **Vibe:** Modern, Clean, Professional, Enthusiastic."
