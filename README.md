DayLog:-

DayLog is a simple offline-first personal diary and daily activity tracking mobile application built with React Native and Expo.

It allows users to record their daily thoughts, track their mood, manage activities, view entries on a calendar, and analyze their personal habits — all while keeping their data stored locally on the device.

Features:

Digital Diary:
- Create diary entries
- Add a title and personal thoughts
- Select a mood
- View individual entries
- Edit existing entries
- Delete entries

Mood Tracking:
- Five mood options
- Mood displayed with diary entries
- Today's mood shown on the Home dashboard
- Mood statistics in Analytics

Calendar:
- Monthly calendar view
- Days containing diary entries are marked
- Select a date to view entries from that day
- Open individual entries directly from the calendar

Activity Tracking:
Track the time spent on different activities:
- Study
- Project
- Exercise
- Reading
- Work
- Other

Activities can be added and deleted, with daily activity totals displayed on the Home screen.

Analytics:
DayLog provides personal usage statistics including:
- Total diary entries
- Total words written
- Total activity time
- Writing streak
- Mood overview
- Activity breakdown
- Weekly activity chart
- Weekly diary chart
- Personalized rule-based insights

Dashboard:
The Home screen provides a quick overview of the current day:
- Dynamic greeting
- Today's date
- Current mood
- Diary summary
- Activity summary
- Recent diary entries
- Analytics shortcut

Tech Stack:
- React Native
- Expo
- TypeScript
- Expo Router
- AsyncStorage
- React Native Calendars
- Git & GitHub

Architecture:

DayLog
│
├── Diary
│   ├── Add Entry
│   ├── View Entry
│   ├── Edit Entry
│   ├── Delete Entry
│   └── Local Storage
│
├── Calendar
│   ├── Monthly View
│   ├── Entry Dates
│   └── Date Filtering
│
├── Activities
│   ├── Activity Types
│   ├── Duration Tracking
│   ├── Save Activity
│   └── Delete Activity
│
├── Dashboard
│   ├── Today's Mood
│   ├── Entry Statistics
│   ├── Word Count
│   └── Activity Statistics
│
└── Analytics
    ├── Mood Statistics
    ├── Activity Breakdown
    ├── Weekly Activity
    ├── Weekly Diary
    └── Writing Streak