import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVITIES_KEY = '@daylog_activities';

export type Activity = {
    id: string;
    name: string;
    emoji: string;
    duration: number;
    createdAt: string;
};

export async function getActivities(): Promise<Activity[]> {
    try {
        const data = await AsyncStorage.getItem(ACTIVITIES_KEY);

        if (!data) {
            return [];
        }

        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading activities:', error);
        return [];
    }
}

export async function saveActivity(
    activity: Activity
): Promise<void> {
    try {
        const existingActivities = await getActivities();

        const updatedActivities = [
            activity,
            ...existingActivities,
        ];

        await AsyncStorage.setItem(
            ACTIVITIES_KEY,
            JSON.stringify(updatedActivities)
        );
    } catch (error) {
        console.error('Error saving activity:', error);
    }
}

export async function deleteActivity(
    id: string
): Promise<void> {
    try {
        const existingActivities = await getActivities();

        const updatedActivities = existingActivities.filter(
            (activity) => activity.id !== id
        );

        await AsyncStorage.setItem(
            ACTIVITIES_KEY,
            JSON.stringify(updatedActivities)
        );
    } catch (error) {
        console.error('Error deleting activity:', error);
    }
}