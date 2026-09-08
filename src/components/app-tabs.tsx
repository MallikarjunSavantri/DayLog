import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function AppTabs() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger
        name="index"
        labelVisibilityMode="labeled"
      >
        <NativeTabs.Trigger.Icon md="home" />
        <NativeTabs.Trigger.Label>
          Home
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="calendar"
        labelVisibilityMode="labeled"
      >
        <NativeTabs.Trigger.Icon md="calendar_month" />
        <NativeTabs.Trigger.Label>
          Calendar
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="add-entry"
        labelVisibilityMode="labeled"
      >
        <NativeTabs.Trigger.Icon md="add_circle" />
        <NativeTabs.Trigger.Label>
          Add
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="activities"
        labelVisibilityMode="labeled"
      >
        <NativeTabs.Trigger.Icon md="timer" />
        <NativeTabs.Trigger.Label>
          Activity
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="settings"
        labelVisibilityMode="labeled"
      >

        <NativeTabs.Trigger.Icon md="settings" />
        <NativeTabs.Trigger.Label>
          Settings
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}