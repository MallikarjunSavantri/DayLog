import { useCallback, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
    router,
    useFocusEffect,
    useLocalSearchParams,
} from 'expo-router';

import {
    DiaryEntry,
    getDiaryEntries,
    deleteDiaryEntry,
} from '@/storage/diaryStorage';

export default function EntryScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [entry, setEntry] = useState<DiaryEntry | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadEntry();
        }, [id])
    );

    const loadEntry = async () => {
        const entries = await getDiaryEntries();

        const foundEntry = entries.find(
            (item) => item.id === id
        );

        setEntry(foundEntry ?? null);
        setLoading(false);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    if (!entry) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.notFoundTitle}>
                    Entry not found
                </Text>

                <Pressable
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>
                        Go Back
                    </Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >

                {/* Back */}
                <Pressable
                    onPress={() => router.back()}
                    style={styles.backRow}
                >
                    <Text style={styles.backArrow}>
                        ←
                    </Text>

                    <Text style={styles.backText}>
                        Back
                    </Text>
                </Pressable>

                {/* Mood */}
                <Text style={styles.mood}>
                    {entry.mood}
                </Text>

                {/* Title */}
                <Text style={styles.title}>
                    {entry.title}
                </Text>

                {/* Date */}
                <Text style={styles.date}>
                    {formatFullDate(entry.createdAt)}
                </Text>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Thoughts */}
                <Text style={styles.thoughts}>
                    {entry.thoughts}
                </Text>

                <Pressable
                    style={styles.editButton}
                    onPress={() => router.push(`/entry/edit/${entry.id}`)}
                >
                    <Text style={styles.editText}>
                        Edit Entry
                    </Text>
                </Pressable>

                {/* Delete */}
                <Pressable
                    style={styles.deleteButton}
                    onPress={() =>
                        Alert.alert(
                            'Delete Entry',
                            'Are you sure you want to delete this entry?',
                            [
                                {
                                    text: 'Cancel',
                                    style: 'cancel',
                                },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: async () => {
                                        await deleteDiaryEntry(entry.id);

                                        Alert.alert(
                                            'Deleted',
                                            'Your diary entry has been deleted.',
                                            [
                                                {
                                                    text: 'OK',
                                                    onPress: () => router.back(),
                                                },
                                            ]
                                        );
                                    },
                                },
                            ]
                        )
                    }
                >
                    <Text style={styles.deleteText}>
                        Delete Entry
                    </Text>
                </Pressable>

            </ScrollView>
        </SafeAreaView>
    );
}

function formatFullDate(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

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
        padding: 20,
    },

    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 35,
    },

    backArrow: {
        fontSize: 28,
        color: '#111827',
    },

    backText: {
        fontSize: 16,
        color: '#374151',
        marginLeft: 6,
    },

    mood: {
        fontSize: 48,
        marginBottom: 12,
    },

    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#111827',
        lineHeight: 38,
    },

    date: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
    },

    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 28,
    },

    thoughts: {
        fontSize: 17,
        lineHeight: 28,
        color: '#374151',
    },

    deleteButton: {
        marginTop: 12,
        paddingVertical: 15,
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    deleteText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#B91C1C',
    },

    notFoundTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
    },

    backButton: {
        backgroundColor: '#111827',
        paddingHorizontal: 25,
        paddingVertical: 13,
        borderRadius: 12,
    },

    backButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    editButton: {
        marginTop: 45,
        paddingVertical: 15,
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: '#111827',
    },

    editText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});