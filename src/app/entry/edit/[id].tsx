import { useEffect, useState } from 'react';

import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
    router,
    useLocalSearchParams,
} from 'expo-router';

import {
    DiaryEntry,
    getDiaryEntries,
    updateDiaryEntry,
} from '@/storage/diaryStorage';

const moods = ['😊', '🙂', '😐', '😔', '😡'];

export default function EditEntryScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [entry, setEntry] = useState<DiaryEntry | null>(null);

    const [title, setTitle] = useState('');
    const [thoughts, setThoughts] = useState('');
    const [selectedMood, setSelectedMood] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadEntry();
    }, [id]);

    const loadEntry = async () => {
        const entries = await getDiaryEntries();

        const foundEntry = entries.find(
            (item) => item.id === id
        );

        if (foundEntry) {
            setEntry(foundEntry);
            setTitle(foundEntry.title);
            setThoughts(foundEntry.thoughts);
            setSelectedMood(foundEntry.mood);
        }

        setLoading(false);
    };

    const handleUpdate = async () => {
        if (!title.trim() || !thoughts.trim()) {
            Alert.alert(
                'Missing information',
                'Please enter a title and write something about your day.'
            );
            return;
        }

        if (!selectedMood) {
            Alert.alert(
                'Select your mood',
                'Please select how you are feeling.'
            );
            return;
        }

        if (!entry) {
            return;
        }

        setSaving(true);

        const updatedEntry: DiaryEntry = {
            ...entry,
            title: title.trim(),
            thoughts: thoughts.trim(),
            mood: selectedMood,
        };

        await updateDiaryEntry(updatedEntry);

        setSaving(false);

        Alert.alert(
            'Updated! 🎉',
            'Your diary entry has been updated.',
            [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.loadingText}>
                    Loading entry...
                </Text>
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
                {/* Header */}

                <Pressable
                    style={styles.backRow}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backArrow}>
                        ←
                    </Text>

                    <Text style={styles.backText}>
                        Back
                    </Text>
                </Pressable>

                <Text style={styles.pageTitle}>
                    Edit Entry
                </Text>

                {/* Title */}

                <Text style={styles.label}>
                    Title
                </Text>

                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Give your day a title"
                    placeholderTextColor="#9CA3AF"
                />

                {/* Mood */}

                <Text style={styles.label}>
                    How are you feeling?
                </Text>

                <View style={styles.moodContainer}>
                    {moods.map((mood) => (
                        <Pressable
                            key={mood}
                            style={[
                                styles.moodButton,
                                selectedMood === mood &&
                                styles.selectedMoodButton,
                            ]}
                            onPress={() => setSelectedMood(mood)}
                        >
                            <Text style={styles.moodEmoji}>
                                {mood}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Thoughts */}

                <Text style={styles.label}>
                    Your thoughts
                </Text>

                <TextInput
                    style={[
                        styles.input,
                        styles.thoughtsInput,
                    ]}
                    value={thoughts}
                    onChangeText={setThoughts}
                    placeholder="Write about your day..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                />

                {/* Save */}

                <Pressable
                    style={[
                        styles.saveButton,
                        saving && styles.saveButtonDisabled,
                    ]}
                    onPress={handleUpdate}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
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

    loadingText: {
        fontSize: 16,
        color: '#6B7280',
    },

    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
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

    pageTitle: {
        fontSize: 30,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 30,
    },

    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 10,
    },

    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 16,
        color: '#111827',
        marginBottom: 25,
    },

    thoughtsInput: {
        minHeight: 180,
        paddingTop: 15,
    },

    moodContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },

    moodButton: {
        width: 55,
        height: 55,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    selectedMoodButton: {
        borderWidth: 2,
        borderColor: '#111827',
    },

    moodEmoji: {
        fontSize: 28,
    },

    saveButton: {
        backgroundColor: '#111827',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },

    saveButtonDisabled: {
        opacity: 0.6,
    },

    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
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
});