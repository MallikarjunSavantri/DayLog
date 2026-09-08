import { useState } from 'react';
import { saveDiaryEntry } from '@/storage/diaryStorage'; import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const moods = ['😊', '🙂', '😐', '😔', '😡'];

export default function AddEntryScreen() {
    const [title, setTitle] = useState('');
    const [thoughts, setThoughts] = useState('');
    const [selectedMood, setSelectedMood] = useState('');

    const handleSave = async () => {
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
                'Please select how you are feeling today.'
            );
            return;
        }

        const newEntry = {
            id: Date.now().toString(),
            title: title.trim(),
            thoughts: thoughts.trim(),
            mood: selectedMood,
            createdAt: new Date().toISOString(),
        };

        await saveDiaryEntry(newEntry);

        Alert.alert('Saved! 🎉', 'Your diary entry has been saved.');

        setTitle('');
        setThoughts('');
        setSelectedMood('');
    };
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.heading}>New Entry</Text>
                <Text style={styles.subtitle}>
                    Take a moment to write about your day.
                </Text>

                {/* Title */}
                <View style={styles.section}>
                    <Text style={styles.label}>Title</Text>

                    <TextInput
                        style={styles.titleInput}
                        placeholder="How my day went"
                        placeholderTextColor="#9CA3AF"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Thoughts */}
                <View style={styles.section}>
                    <Text style={styles.label}>Your thoughts</Text>

                    <TextInput
                        style={styles.thoughtsInput}
                        placeholder="Write about your day..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        value={thoughts}
                        onChangeText={setThoughts}
                    />
                </View>

                {/* Mood */}
                <View style={styles.section}>
                    <Text style={styles.label}>How are you feeling?</Text>

                    <View style={styles.moodsContainer}>
                        {moods.map((mood) => (
                            <Pressable
                                key={mood}
                                onPress={() => setSelectedMood(mood)}
                                style={[
                                    styles.moodButton,
                                    selectedMood === mood && styles.selectedMood,
                                ]}
                            >
                                <Text style={styles.mood}>{mood}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Save */}
                <Pressable style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save Entry</Text>
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
        paddingBottom: 40,
    },

    heading: {
        fontSize: 30,
        fontWeight: '700',
        color: '#111827',
    },

    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        marginTop: 6,
        marginBottom: 30,
    },

    section: {
        marginBottom: 25,
    },

    label: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 10,
    },

    titleInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 16,
        color: '#111827',
    },

    thoughtsInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 16,
        height: 180,
        fontSize: 16,
        color: '#111827',
    },

    moodsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    moodButton: {
        width: 55,
        height: 55,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    selectedMood: {
        borderWidth: 2,
        borderColor: '#111827',
    },

    mood: {
        fontSize: 28,
    },

    saveButton: {
        backgroundColor: '#111827',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 5,
    },

    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
});