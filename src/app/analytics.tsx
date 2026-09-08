import { useCallback, useState } from 'react';

import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useFocusEffect } from 'expo-router';

import {
    DiaryEntry,
    getDiaryEntries,
} from '@/storage/diaryStorage';

import {
    Activity,
    getActivities,
} from '@/storage/activityStorage';

const MOODS = ['😊', '🙂', '😐', '😔', '😡'];

const DAYS = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
];

export default function AnalyticsScreen() {
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

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" />

                <Text style={styles.loadingText}>
                    Loading analytics...
                </Text>
            </SafeAreaView>
        );
    }

    const totalWords = entries.reduce(
        (total, entry) => {
            return (
                total +
                entry.thoughts
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean).length
            );
        },
        0
    );

    const totalActivityMinutes = activities.reduce(
        (total, activity) =>
            total + activity.duration,
        0
    );

    const currentStreak = calculateStreak(entries);

    const moodCounts = getMoodCounts(entries);

    const mostCommonMood = getMostCommonMood(
        moodCounts
    );

    const activityBreakdown =
        getActivityBreakdown(activities);

    const weeklyActivity =
        getWeeklyActivity(activities);

    const weeklyEntries =
        getWeeklyEntries(entries);

    const maxActivityMinutes = Math.max(
        ...weeklyActivity.map((day) => day.minutes),
        1
    );

    const maxEntryCount = Math.max(
        ...weeklyEntries.map((day) => day.count),
        1
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}

                <Text style={styles.title}>
                    Analytics
                </Text>

                <Text style={styles.subtitle}>
                    Understand your days and habits
                </Text>

                {/* Overview */}

                <Text style={styles.sectionTitle}>
                    Overview
                </Text>

                <View style={styles.statsGrid}>
                    <StatCard
                        value={String(entries.length)}
                        label="Entries"
                        emoji="📝"
                    />

                    <StatCard
                        value={String(totalWords)}
                        label="Words"
                        emoji="✍️"
                    />

                    <StatCard
                        value={formatDuration(totalActivityMinutes)}
                        label="Activity"
                        emoji="⏱️"
                    />

                    <StatCard
                        value={`${currentStreak} day${currentStreak === 1 ? '' : 's'
                            }`}
                        label="Streak"
                        emoji="🔥"
                    />
                </View>

                {/* Mood */}

                <Text style={styles.sectionTitle}>
                    Mood Overview
                </Text>

                <View style={styles.card}>
                    <View style={styles.moodHeader}>
                        <View>
                            <Text style={styles.cardTitle}>
                                Most Common Mood
                            </Text>

                            <Text style={styles.cardSubtitle}>
                                Based on your diary entries
                            </Text>
                        </View>

                        <Text style={styles.largeMood}>
                            {mostCommonMood ?? '—'}
                        </Text>
                    </View>

                    <View style={styles.moodRow}>
                        {MOODS.map((mood) => (
                            <View
                                key={mood}
                                style={styles.moodItem}
                            >
                                <Text style={styles.moodEmoji}>
                                    {mood}
                                </Text>

                                <Text style={styles.moodCount}>
                                    {moodCounts[mood] || 0}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Activity Breakdown */}

                <Text style={styles.sectionTitle}>
                    Activity Breakdown
                </Text>

                <View style={styles.card}>
                    {activityBreakdown.length === 0 ? (
                        <EmptyMessage
                            emoji="⏱️"
                            text="No activity data yet."
                        />
                    ) : (
                        activityBreakdown.map((item) => (
                            <View
                                key={item.name}
                                style={styles.breakdownRow}
                            >
                                <View style={styles.breakdownLeft}>
                                    <Text style={styles.breakdownEmoji}>
                                        {item.emoji}
                                    </Text>

                                    <Text style={styles.breakdownName}>
                                        {item.name}
                                    </Text>
                                </View>

                                <Text style={styles.breakdownValue}>
                                    {formatDuration(item.minutes)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Weekly Activity */}

                <Text style={styles.sectionTitle}>
                    Activity This Week
                </Text>

                <View style={styles.card}>
                    <View style={styles.chart}>
                        {weeklyActivity.map((day) => {
                            const height =
                                day.minutes === 0
                                    ? 4
                                    : Math.max(
                                        (day.minutes /
                                            maxActivityMinutes) *
                                        120,
                                        8
                                    );

                            return (
                                <View
                                    key={day.date}
                                    style={styles.chartColumn}
                                >
                                    <Text style={styles.chartValue}>
                                        {day.minutes > 0
                                            ? formatShortDuration(
                                                day.minutes
                                            )
                                            : ''}
                                    </Text>

                                    <View style={styles.barContainer}>
                                        <View
                                            style={[
                                                styles.bar,
                                                { height },
                                            ]}
                                        />
                                    </View>

                                    <Text style={styles.chartLabel}>
                                        {day.day}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Weekly Diary */}

                <Text style={styles.sectionTitle}>
                    Diary This Week
                </Text>

                <View style={styles.card}>
                    <View style={styles.chart}>
                        {weeklyEntries.map((day) => {
                            const height =
                                day.count === 0
                                    ? 4
                                    : Math.max(
                                        (day.count /
                                            maxEntryCount) *
                                        120,
                                        8
                                    );

                            return (
                                <View
                                    key={day.date}
                                    style={styles.chartColumn}
                                >
                                    <Text style={styles.chartValue}>
                                        {day.count > 0
                                            ? day.count
                                            : ''}
                                    </Text>

                                    <View style={styles.barContainer}>
                                        <View
                                            style={[
                                                styles.bar,
                                                { height },
                                            ]}
                                        />
                                    </View>

                                    <Text style={styles.chartLabel}>
                                        {day.day}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Insight */}

                <Text style={styles.sectionTitle}>
                    Your Insight
                </Text>

                <View style={styles.insightCard}>
                    <Text style={styles.insightEmoji}>
                        💡
                    </Text>

                    <Text style={styles.insightText}>
                        {getInsight(
                            entries,
                            activities,
                            currentStreak,
                            totalActivityMinutes
                        )}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({
    value,
    label,
    emoji,
}: {
    value: string;
    label: string;
    emoji: string;
}) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statEmoji}>
                {emoji}
            </Text>

            <Text style={styles.statValue}>
                {value}
            </Text>

            <Text style={styles.statLabel}>
                {label}
            </Text>
        </View>
    );
}

function EmptyMessage({
    emoji,
    text,
}: {
    emoji: string;
    text: string;
}) {
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>
                {emoji}
            </Text>

            <Text style={styles.emptyText}>
                {text}
            </Text>
        </View>
    );
}

/* ---------------- DATA FUNCTIONS ---------------- */

function getMoodCounts(
    entries: DiaryEntry[]
): Record<string, number> {
    const counts: Record<string, number> = {};

    entries.forEach((entry) => {
        counts[entry.mood] =
            (counts[entry.mood] || 0) + 1;
    });

    return counts;
}

function getMostCommonMood(
    counts: Record<string, number>
) {
    let mostCommon: string | null = null;
    let highestCount = 0;

    Object.entries(counts).forEach(
        ([mood, count]) => {
            if (count > highestCount) {
                highestCount = count;
                mostCommon = mood;
            }
        }
    );

    return mostCommon;
}

function getActivityBreakdown(
    activities: Activity[]
) {
    const map: Record<
        string,
        {
            name: string;
            emoji: string;
            minutes: number;
        }
    > = {};

    activities.forEach((activity) => {
        if (!map[activity.name]) {
            map[activity.name] = {
                name: activity.name,
                emoji: activity.emoji,
                minutes: 0,
            };
        }

        map[activity.name].minutes +=
            activity.duration;
    });

    return Object.values(map).sort(
        (a, b) => b.minutes - a.minutes
    );
}

function getWeeklyActivity(
    activities: Activity[]
) {
    const today = new Date();

    const startOfWeek = new Date(today);

    startOfWeek.setDate(
        today.getDate() - today.getDay()
    );

    startOfWeek.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(startOfWeek);

        date.setDate(
            startOfWeek.getDate() + index
        );

        const dateKey = getDateKey(
            date.toISOString()
        );

        const minutes = activities
            .filter(
                (activity) =>
                    getDateKey(activity.createdAt) ===
                    dateKey
            )
            .reduce(
                (total, activity) =>
                    total + activity.duration,
                0
            );

        return {
            date: dateKey,
            day: DAYS[date.getDay()],
            minutes,
        };
    });
}

function getWeeklyEntries(
    entries: DiaryEntry[]
) {
    const today = new Date();

    const startOfWeek = new Date(today);

    startOfWeek.setDate(
        today.getDate() - today.getDay()
    );

    startOfWeek.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(startOfWeek);

        date.setDate(
            startOfWeek.getDate() + index
        );

        const dateKey = getDateKey(
            date.toISOString()
        );

        const count = entries.filter(
            (entry) =>
                getDateKey(entry.createdAt) ===
                dateKey
        ).length;

        return {
            date: dateKey,
            day: DAYS[date.getDay()],
            count,
        };
    });
}

function calculateStreak(
    entries: DiaryEntry[]
) {
    const uniqueDates = [
        ...new Set(
            entries.map((entry) =>
                getDateKey(entry.createdAt)
            )
        ),
    ].sort();

    if (uniqueDates.length === 0) {
        return 0;
    }

    const today = new Date();

    const todayKey = getDateKey(
        today.toISOString()
    );

    const yesterday = new Date(today);

    yesterday.setDate(
        today.getDate() - 1
    );

    const yesterdayKey = getDateKey(
        yesterday.toISOString()
    );

    const latestDate =
        uniqueDates[uniqueDates.length - 1];

    if (
        latestDate !== todayKey &&
        latestDate !== yesterdayKey
    ) {
        return 0;
    }

    let streak = 0;

    let currentDate =
        latestDate === todayKey
            ? new Date(today)
            : new Date(yesterday);

    while (true) {
        const key = getDateKey(
            currentDate.toISOString()
        );

        if (!uniqueDates.includes(key)) {
            break;
        }

        streak++;

        currentDate.setDate(
            currentDate.getDate() - 1
        );
    }

    return streak;
}

/* ---------------- HELPERS ---------------- */

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

function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);

    const remainingMinutes =
        minutes % 60;

    if (hours === 0) {
        return `${remainingMinutes}m`;
    }

    if (remainingMinutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
}

function formatShortDuration(minutes: number) {
    if (minutes < 60) {
        return `${minutes}m`;
    }

    return `${Math.floor(minutes / 60)}h`;
}

function getInsight(
    entries: DiaryEntry[],
    activities: Activity[],
    streak: number,
    totalActivityMinutes: number
) {
    if (entries.length === 0) {
        return 'Start writing your first diary entry. Your analytics will grow as you use DayLog.';
    }

    if (streak >= 7) {
        return `Amazing! You have maintained a ${streak}-day writing streak. Keep it going!`;
    }

    if (activities.length === 0) {
        return 'You are writing consistently. Start tracking activities to understand how you spend your time.';
    }

    if (totalActivityMinutes >= 600) {
        return 'You have spent more than 10 hours tracking activities. Great job staying aware of your time!';
    }

    return `You have ${entries.length} diary ${entries.length === 1
            ? 'entry'
            : 'entries'
        } and ${formatDuration(
            totalActivityMinutes
        )} of tracked activity. Keep building your daily history!`;
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },

    container: {
        padding: 20,
        paddingBottom: 50,
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
    },

    loadingText: {
        marginTop: 10,
        color: '#6B7280',
    },

    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#111827',
    },

    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        marginTop: 6,
        marginBottom: 28,
    },

    sectionTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 28,
    },

    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        marginBottom: 10,
    },

    statEmoji: {
        fontSize: 24,
    },

    statValue: {
        fontSize: 23,
        fontWeight: '700',
        color: '#111827',
        marginTop: 8,
    },

    statLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 3,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 20,
        marginBottom: 28,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },

    cardSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
    },

    moodHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    largeMood: {
        fontSize: 42,
    },

    moodRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25,
    },

    moodItem: {
        alignItems: 'center',
    },

    moodEmoji: {
        fontSize: 25,
    },

    moodCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginTop: 5,
    },

    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    breakdownLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    breakdownEmoji: {
        fontSize: 24,
        marginRight: 12,
    },

    breakdownName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },

    breakdownValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },

    chart: {
        height: 170,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },

    chartColumn: {
        flex: 1,
        alignItems: 'center',
        height: '100%',
        justifyContent: 'flex-end',
    },

    chartValue: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 5,
    },

    barContainer: {
        height: 120,
        justifyContent: 'flex-end',
    },

    bar: {
        width: 24,
        minHeight: 4,
        backgroundColor: '#111827',
        borderRadius: 6,
    },

    chartLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 7,
    },

    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 15,
    },

    emptyEmoji: {
        fontSize: 30,
        marginBottom: 7,
    },

    emptyText: {
        fontSize: 14,
        color: '#6B7280',
    },

    insightCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    insightEmoji: {
        fontSize: 28,
        marginRight: 12,
    },

    insightText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 23,
        color: '#374151',
    },
});