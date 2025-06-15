# Burnout Prevention Dashboard \& AI Chat

## Members:
- Aarzoo Bansal
- Anjali Pathak
- Mandar Ambulkar

## Overview

The **Burnout Prevention Dashboard \& AI Chat** is a modern web application designed to help users monitor their well-being and prevent burnout by integrating health, work, and lifestyle data into a single, user-friendly interface. The application combines a wellness dashboard with an AI-powered chat assistant, providing actionable insights and personalized recommendations.

---

## Features

- **Wellness Dashboard**
    - Visualizes key health and work metrics: meeting frequency, break duration, after-hours work, heart rate, sleep hours, and stress levels.
    - Displays data in interactive, easy-to-read cards with actionable insights and wellness tips.
- **AI Chat Assistant ("Alex")**
    - Users can chat with Alex, an AI wellness coach, for personalized burnout prevention advice.
    - Supports both proactive wellness messages (triggered by user data) and conversational chat.
    - Maintains a history of conversations, including timestamps and message context.
- **Health Device Integration**
    - Connects to health tracking services such as Google Fit, Apple Health, and Samsung Health.
    - Enables real-time data collection from health devices.
- **Calendar Integration**
    - Aggregates work and meeting data from calendar APIs for a holistic view of workload.
- **API Integration**
    - Uses the GMI API for AI-driven chat and proactive recommendations.
    - Leverages Supabase for backend data storage and authentication.
- **Error Handling \& Resilience**
    - Implements robust error handling, retry logic, and user-friendly error messages.
    - Tracks failed requests and allows users to retry operations.
- **User Experience**
    - Responsive, visually appealing interface with smooth transitions between dashboard and chat modes.
    - Displays loading states and disables input during API requests for a seamless experience.
- **Type Safety \& Maintainability**
    - Built with TypeScript and React for strong typing and maintainability.
    - Uses Zustand for state management, ensuring efficient updates and clear separation of concerns.

---

## Technology Stack

- **Frontend:** TypeScript, React, Next.js, Zustand
- **UI Components:** Custom components styled with Tailwind CSS
- **API Integration:** GMI API (AI chat), Supabase (backend), Google Fit, Apple Health, Samsung Health, and calendar APIs
- **State Management:** Zustand
- **Error Handling:** Custom error management with retry logic

---

## Getting Started

### Prerequisites

- **Node.js** (v16 or later)
- **npm** or **yarn**
- **Supabase** account and project
- **GMI API** token
- **Google Cloud Project** (for Google Fit integration)
- **Apple Developer Account** (for Apple Health integration, if needed on iOS)
- **Samsung Health Account** (optional, for Samsung Health integration)

---

### Installation

1. **Clone the Repository**

```bash
git clone https://github.com/Mandar77/hackathon.git
cd burnout-prevention-dashboard
```

2. **Install Dependencies**

```bash
npm install
# or
yarn install
```

3. **Configure Environment Variables**

Create a `.env.local` file in the root directory and add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GMI_API_TOKEN=your_gmi_api_token
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the Development Server**

```bash
npm run dev
# or
yarn dev
```

5. **Open in Browser**

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

- **Dashboard:** View your health and work metrics at a glance.
- **Connect Health Devices:** Link your Google Fit, Apple Health, or Samsung Health account to sync your health data.
- **Chat with Alex:** Ask for advice or receive proactive wellness insights based on your data.
- **Proactive Insights:** Get personalized recommendations triggered by your activity and health data.

---

## Folder Structure

```
src/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── dashboard/        # Dashboard page and related components
│   └── ...               # Other pages and utilities
├── lib/                  # Utility libraries (e.g., gmi.ts for AI API)
├── store/                # Zustand stores for state management
└── styles/               # Global styles
```


---

## API Integration Details

- **GMI API:** Powers the AI chat assistant and proactive wellness messages.
- **Supabase:** Handles user authentication, data storage, and backend logic.
- **Google Fit/Apple Health/Samsung Health:** Collect health metrics via OAuth and native integrations.
- **Calendar APIs:** Aggregate meeting and work data for workload analysis.

---

## Error Handling

- **User-Friendly Messages:** Clear error messages for failed operations.
- **Retry Logic:** Users can retry failed API calls directly from the UI.
- **Loading States:** Visual feedback during data fetching and processing.

---

## Contributing

We welcome contributions! Please open issues or submit pull requests for improvements, bug fixes, or new features.

---

## License

This project is licensed under the **MIT License**.

---

## Acknowledgments

- **Inspired by:** The need for better workplace wellness tools.
- **Powered by:** GMI AI API, Supabase, and the open-source community.
- **Thanks to:** All contributors and developers who made this project possible.

---

## Support

For support or questions, please open an issue in the repository or contact the project maintainers.

---

**Burnout Prevention Dashboard \& AI Chat** is designed to help you stay healthy, productive, and balanced in your daily life. We hope you find it useful!