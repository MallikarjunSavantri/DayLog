import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { router, useFocusEffect } from 'expo-router';

import {
  DiaryEntry,
  getDiaryEntries,
} from '@/storage/diaryStorage';

import {
  Activity,
  getActivities,
} from '@/storage/activityStorage';

export default function HomeScreen() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    const savedEntries = await getDiaryEntries();
    const savedActivities = await getActivities();

    setEntries(savedEntries);
    setActivities(savedActivities);

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const todayKey = getTodayDateKey();

  const todayEntries = entries.filter(
    (entry) => getDateKey(entry.createdAt) === todayKey
  );

  const todayActivities = activities.filter(
    (activity) =>
      getDateKey(activity.createdAt) === todayKey
  );

  const totalWords = todayEntries.reduce(
    (total, entry) => {
      const words = entry.thoughts
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

      return total + words;
    },
    0
  );

  const totalActivityMinutes = todayActivities.reduce(
    (total, activity) => total + activity.duration,
    0
  );

  const todayMood =
    todayEntries.length > 0
      ? todayEntries[0].mood
      : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()} 👋
          </Text>

          <Text style={styles.date}>
            {formatTodayDate()}
          </Text>
        </View>

        {/* Mood */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            How are you feeling today?
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.moodCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              router.push('/(tabs)/add-entry')
            }
          >
            <Text style={styles.moodEmoji}>
              {todayMood ?? '🙂'}
            </Text>

            <Text style={styles.moodText}>
              {todayMood
                ? getMoodName(todayMood)
                : "Add today's mood"}
            </Text>
          </Pressable>
        </View>

        {/* Today's Summary */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Today's Summary
          </Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {todayEntries.length}
              </Text>

              <Text style={styles.summaryLabel}>
                Entries
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.analyticsButton,
                pressed && styles.analyticsButtonPressed,
              ]}
              onPress={() => router.push('/analytics')}
            >
              <View>
                <Text style={styles.analyticsButtonTitle}>
                  📊 View Analytics
                </Text>

                <Text style={styles.analyticsButtonSubtitle}>
                  See your diary and activity insights
                </Text>
              </View>

              <Text style={styles.analyticsArrow}>
                →
              </Text>
            </Pressable>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {totalWords}
              </Text>

              <Text style={styles.summaryLabel}>
                Words
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryMood}>
                {todayMood ?? '—'}
              </Text>

              <Text style={styles.summaryLabel}>
                Mood
              </Text>
            </View>
          </View>
        </View>

        {/* Today's Activity */}

        <View style={styles.section}>
          <View style={styles.activityTitleRow}>
            <Text style={styles.sectionTitle}>
              Today's Activity
            </Text>

            <Pressable
              onPress={() =>
                router.push('/(tabs)/activities')
              }
            >
              <Text style={styles.viewAllText}>
                View All
              </Text>
            </Pressable>
          </View>

          {todayActivities.length === 0 ? (
            <Pressable
              style={styles.noActivityCard}
              onPress={() =>
                router.push('/(tabs)/activities')
              }
            >
              <Text style={styles.noActivityEmoji}>
                ⏱️
              </Text>

              <Text style={styles.noActivityTitle}>
                No activities recorded
              </Text>

              <Text style={styles.noActivityText}>
                Tap to start tracking your time.
              </Text>
            </Pressable>
          ) : (
            <View style={styles.activityCard}>
              {todayActivities
                .slice(0, 3)
                .map((activity) => (
                  <View
                    key={activity.id}
                    style={styles.activityRow}
                  >
                    <Text style={styles.activityName}>
                      {activity.emoji} {activity.name}
                    </Text>

                    <Text style={styles.activityTime}>
                      {formatDuration(activity.duration)}
                    </Text>
                  </View>
                ))}

              <View style={styles.totalActivityRow}>
                <Text style={styles.totalActivityLabel}>
                  Total
                </Text>

                <Text style={styles.totalActivityValue}>
                  {formatDuration(totalActivityMinutes)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick Add */}

        <Pressable
          style={({ pressed }) => [
            styles.writeButton,
            pressed && styles.writeButtonPressed,
          ]}
          onPress={() =>
            router.push('/(tabs)/add-entry')
          }
        >
          <Text style={styles.writeButtonText}>
            + Write Today's Entry
          </Text>
        </Pressable>

        {/* Recent Entries */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recent Entries
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
            </View>
          ) : entries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>
                📝
              </Text>

              <Text style={styles.emptyTitle}>
                No entries yet
              </Text>

              <Text style={styles.emptyText}>
                Start writing about your day.
              </Text>
            </View>
          ) : (
            entries.slice(0, 5).map((entry) => (
              <Pressable
                key={entry.id}
                style={({ pressed }) => [
                  styles.entryCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/entry/[id]',
                    params: {
                      id: entry.id,
                    },
                  })
                }
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.entryMood}>
                    {entry.mood}
                  </Text>

                  <Text style={styles.entryDate}>
                    {formatEntryDate(entry.createdAt)}
                  </Text>
                </View>

                <Text style={styles.entryTitle}>
                  {entry.title}
                </Text>

                <Text
                  style={styles.entryPreview}
                  numberOfLines={2}
                >
                  {entry.thoughts}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- HELPERS ---------------- */

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

function formatTodayDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function getTodayDateKey() {
  return getDateKey(new Date().toISOString());
}

function getDateKey(dateString: string) {
  const date = new Date(dateString);

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatEntryDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function getMoodName(mood: string) {
  const moods: Record<string, string> = {
    '😊': 'Great',
    '🙂': 'Good',
    '😐': 'Okay',
    '😔': 'Sad',
    '😡': 'Angry',
  };

  return moods[mood] ?? 'Mood';
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 28,
  },

  greeting: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },

  date: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 6,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  moodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },

  moodEmoji: {
    fontSize: 42,
  },

  moodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 6,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },

  summaryMood: {
    fontSize: 28,
  },

  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 5,
  },

  summaryDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#E5E7EB',
  },

  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
  },

  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  activityName: {
    fontSize: 16,
    color: '#374151',
  },

  activityTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  totalActivityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },

  totalActivityLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },

  totalActivityValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  noActivityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
  },

  noActivityEmoji: {
    fontSize: 32,
    marginBottom: 7,
  },

  noActivityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  noActivityText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },

  writeButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 28,
  },

  writeButtonPressed: {
    opacity: 0.8,
  },

  writeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  loadingContainer: {
    paddingVertical: 25,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
  },

  emptyEmoji: {
    fontSize: 35,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    textAlign: 'center',
  },

  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },

  cardPressed: {
    opacity: 0.7,
  },

  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },

  entryMood: {
    fontSize: 25,
  },

  entryDate: {
    fontSize: 13,
    color: '#6B7280',
  },

  entryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },

  entryPreview: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
  },
  analyticsButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  analyticsButtonPressed: {
    opacity: 0.7,
  },

  analyticsButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  analyticsButtonSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  analyticsArrow: {
    fontSize: 24,
    color: '#111827',
  },
});