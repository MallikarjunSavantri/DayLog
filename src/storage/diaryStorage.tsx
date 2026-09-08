import AsyncStorage from '@react-native-async-storage/async-storage';

const DIARY_ENTRIES_KEY = '@daylog_diary_entries';

export type DiaryEntry = {
    id: string;
    title: string;
    thoughts: string;
    mood: string;
    createdAt: string;
};

export async function getDiaryEntries(): Promise<DiaryEntry[]> {
    try {
        const data = await AsyncStorage.getItem(DIARY_ENTRIES_KEY);

        if (!data) {
            return [];
        }

        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading diary entries:', error);
        return [];
    }
}

export async function saveDiaryEntry(entry: DiaryEntry): Promise<void> {
    try {
        const existingEntries = await getDiaryEntries();

        const updatedEntries = [entry, ...existingEntries];

        await AsyncStorage.setItem(
            DIARY_ENTRIES_KEY,
            JSON.stringify(updatedEntries)
        );
    } catch (error) {
        console.error('Error saving diary entry:', error);
    }
}

export async function updateDiaryEntry(
    updatedEntry: DiaryEntry
): Promise<void> {
    try {
        const existingEntries = await getDiaryEntries();

        const updatedEntries = existingEntries.map((entry) =>
            entry.id === updatedEntry.id ? updatedEntry : entry
        );

        await AsyncStorage.setItem(
            DIARY_ENTRIES_KEY,
            JSON.stringify(updatedEntries)
        );
    } catch (error) {
        console.error('Error updating diary entry:', error);
    }
}

export async function deleteDiaryEntry(id: string): Promise<void> {
    try {
        const existingEntries = await getDiaryEntries();

        const updatedEntries = existingEntries.filter(
            (entry) => entry.id !== id
        );

        await AsyncStorage.setItem(
            DIARY_ENTRIES_KEY,
            JSON.stringify(updatedEntries)
        );
    } catch (error) {
        console.error('Error deleting diary entry:', error);
    }
}