import { useCallback, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useFocusEffect } from 'expo-router';

import {
    Activity,
    deleteActivity,
    getActivities,
    saveActivity,
} from '@/storage/activityStorage';

const activityTypes = [
    { name: 'Study', emoji: '📚' },
    { name: 'Project', emoji: '💻' },
    { name: 'Exercise', emoji: '🏃' },
    { name: 'Reading', emoji: '📖' },
    { name: 'Work', emoji: '💼' },
    { name: 'Other', emoji: '✨' },
];

export default function ActivitiesScreen() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [selectedType, setSelectedType] = useState(activityTypes[0]);
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadActivities = async () => {
        setLoading(true);

        const savedActivities = await getActivities();

        setActivities(savedActivities);

        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadActivities();
        }, [])
    );

    const todayActivities = activities.filter(
        (activity) =>
            getDateKey(activity.createdAt) === getTodayDateKey()
    );

    const totalMinutes = todayActivities.reduce(
        (total, activity) => total + activity.duration,
        0
    );

    const handleSave = async () => {
        const minutes = Number(duration);

        if (!duration.trim()) {
            Alert.alert(
                'Missing duration',
                'Please enter how many minutes you spent.'
            );
            return;
        }

        if (!Number.isFinite(minutes) || minutes <= 0) {
            Alert.alert(
                'Invalid duration',
                'Please enter a valid number of minutes.'
            );
            return;
        }

        setSaving(true);

        const newActivity: Activity = {
            id: Date.now().toString(),
            name: selectedType.name,
            emoji: selectedType.emoji,
            duration: minutes,
            createdAt: new Date().toISOString(),
        };

        await saveActivity(newActivity);

        setDuration('');

        await loadActivities();

        setSaving(false);

        Alert.alert(
            'Activity Added 🎉',
            `${selectedType.name} activity has been recorded.`
        );
    };

    const handleDelete = (activity: Activity) => {
        Alert.alert(
            'Delete Activity',
            `Delete this ${activity.name} activity?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteActivity(activity.id);
                        await loadActivities();
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>
                    Activities
                </Text>

                <Text style={styles.subtitle}>
                    Track how you spend your time
                </Text>

                {/* Activity Type */}

                <Text style={styles.sectionTitle}>
                    What did you do?
                </Text>

                <View style={styles.typeGrid}>
                    {activityTypes.map((type) => (
                        <Pressable
                            key={type.name}
                            style={[
                                styles.typeButton,
                                selectedType.name === type.name &&
                                styles.selectedTypeButton,
                            ]}
                            onPress={() => setSelectedType(type)}
                        >
                            <Text style={styles.typeEmoji}>
                                {type.emoji}
                            </Text>

                            <Text
                                style={[
                                    styles.typeText,
                                    selectedType.name === type.name &&
                                    styles.selectedTypeText,
                                ]}
                            >
                                {type.name}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Duration */}

                <Text style={styles.sectionTitle}>
                    How long?
                </Text>

                <View style={styles.durationRow}>
                    <TextInput
                        style={styles.durationInput}
                        value={duration}
                        onChangeText={setDuration}
                        placeholder="30"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                    />

                    <Text style={styles.minutesText}>
                        minutes
                    </Text>
                </View>

                {/* Save */}

                <Pressable
                    style={[
                        styles.saveButton,
                        saving && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>
                        {saving
                            ? 'Saving...'
                            : 'Add Activity'}
                    </Text>
                </Pressable>

                {/* Today's Summary */}

                <View style={styles.summarySection}>
                    <Text style={styles.sectionTitle}>
                        Today's Activity
                    </Text>

                    <View style={styles.totalCard}>
                        <Text style={styles.totalEmoji}>
                            ⏱️
                        </Text>

                        <View>
                            <Text style={styles.totalValue}>
                                {formatDuration(totalMinutes)}
                            </Text>

                            <Text style={styles.totalLabel}>
                                Total activity time
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Activity List */}

                <Text style={styles.sectionTitle}>
                    Today's Activities
                </Text>

                {loading ? (
                    <ActivityIndicator size="small" />
                ) : todayActivities.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyEmoji}>
                            🏃
                        </Text>

                        <Text style={styles.emptyTitle}>
                            No activities yet
                        </Text>

                        <Text style={styles.emptyText}>
                            Record your first activity above.
                        </Text>
                    </View>
                ) : (
                    todayActivities.map((activity) => (
                        <View
                            key={activity.id}
                            style={styles.activityCard}
                        >
                            <Text style={styles.activityEmoji}>
                                {activity.emoji}
                            </Text>

                            <View style={styles.activityInfo}>
                                <Text style={styles.activityName}>
                                    {activity.name}
                                </Text>

                                <Text style={styles.activityDuration}>
                                    {formatDuration(activity.duration)}
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => handleDelete(activity)}
                            >
                                <Text style={styles.deleteText}>
                                    Delete
                                </Text>
                            </Pressable>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

/* ---------------- HELPERS ---------------- */

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

    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 28,
    },

    typeButton: {
        width: '31%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 10,
    },

    selectedTypeButton: {
        borderWidth: 2,
        borderColor: '#111827',
    },

    typeEmoji: {
        fontSize: 27,
        marginBottom: 6,
    },

    typeText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
    },

    selectedTypeText: {
        color: '#111827',
    },

    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },

    durationInput: {
        width: 100,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 18,
        color: '#111827',
        textAlign: 'center',
    },

    minutesText: {
        fontSize: 16,
        color: '#6B7280',
        marginLeft: 12,
    },

    saveButton: {
        backgroundColor: '#111827',
        borderRadius: 15,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 30,
    },

    saveButtonDisabled: {
        opacity: 0.6,
    },

    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    summarySection: {
        marginBottom: 28,
    },

    totalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },

    totalEmoji: {
        fontSize: 38,
        marginRight: 15,
    },

    totalValue: {
        fontSize: 26,
        fontWeight: '700',
        color: '#111827',
    },

    totalLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 3,
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

    activityCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 17,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    activityEmoji: {
        fontSize: 30,
        marginRight: 14,
    },

    activityInfo: {
        flex: 1,
    },

    activityName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },

    activityDuration: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 3,
    },

    deleteText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#B91C1C',
    },
});