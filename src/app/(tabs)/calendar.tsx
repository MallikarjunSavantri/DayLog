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

import { Calendar } from 'react-native-calendars';

import { router, useFocusEffect } from 'expo-router';

import {
    DiaryEntry,
    getDiaryEntries,
} from '@/storage/diaryStorage';

export default function CalendarScreen() {
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [selectedDate, setSelectedDate] = useState(
        getTodayDate()
    );
    const [loading, setLoading] = useState(true);

    const loadEntries = async () => {
        setLoading(true);

        const savedEntries = await getDiaryEntries();

        setEntries(savedEntries);

        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadEntries();
        }, [])
    );

    const selectedEntries = entries.filter(
        (entry) => getDateKey(entry.createdAt) === selectedDate
    );

    const markedDates = entries.reduce(
        (acc, entry) => {
            const dateKey = getDateKey(entry.createdAt);

            acc[dateKey] = {
                marked: true,
                dotColor: '#111827',
            };

            return acc;
        },
        {} as Record<string, any>
    );

    markedDates[selectedDate] = {
        ...(markedDates[selectedDate] || {}),
        selected: true,
        selectedColor: '#111827',
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Calendar</Text>

                <Text style={styles.subtitle}>
                    Your diary timeline
                </Text>

                <View style={styles.calendarCard}>
                    <Calendar
                        current={selectedDate}
                        onDayPress={(day) => {
                            setSelectedDate(day.dateString);
                        }}
                        markedDates={markedDates}
                        enableSwipeMonths
                        theme={{
                            textSectionTitleColor: '#6B7280',
                            selectedDayBackgroundColor: '#111827',
                            selectedDayTextColor: '#FFFFFF',
                            todayTextColor: '#111827',
                            dayTextColor: '#111827',
                            monthTextColor: '#111827',
                            arrowColor: '#111827',
                            textDisabledColor: '#D1D5DB',
                        }}
                    />
                </View>

                <View style={styles.entriesSection}>
                    <Text style={styles.sectionTitle}>
                        {formatSelectedDate(selectedDate)}
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="small" />
                    ) : selectedEntries.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyEmoji}>📝</Text>

                            <Text style={styles.emptyTitle}>
                                No entries
                            </Text>

                            <Text style={styles.emptyText}>
                                You don't have any diary entries for this day.
                            </Text>
                        </View>
                    ) : (
                        selectedEntries.map((entry) => (
                            <Pressable
                                key={entry.id}
                                style={({ pressed }) => [
                                    styles.entryCard,
                                    pressed && styles.entryCardPressed,
                                ]}
                                onPress={() =>
                                    router.push({
                                        pathname: '/entry/[id]',
                                        params: { id: entry.id },
                                    })
                                }
                            >
                                <View style={styles.entryHeader}>
                                    <Text style={styles.mood}>
                                        {entry.mood}
                                    </Text>

                                    <Text style={styles.entryTime}>
                                        {formatTime(entry.createdAt)}
                                    </Text>
                                </View>

                                <Text style={styles.entryTitle}>
                                    {entry.title}
                                </Text>

                                <Text
                                    style={styles.entryThoughts}
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

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getDateKey(dateString: string) {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatSelectedDate(dateString: string) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatTime(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },

    container: {
        padding: 20,
        paddingBottom: 40,
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
        marginBottom: 22,
    },

    calendarCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        overflow: 'hidden',
    },

    entriesSection: {
        marginTop: 28,
    },

    sectionTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
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

    entryCardPressed: {
        opacity: 0.7,
    },

    entryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 7,
    },

    mood: {
        fontSize: 25,
    },

    entryTime: {
        fontSize: 13,
        color: '#6B7280',
    },

    entryTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },

    entryThoughts: {
        fontSize: 14,
        lineHeight: 21,
        color: '#6B7280',
    },
});