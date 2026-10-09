import { Tabs } from 'expo-router/js-tabs';

import { Icon, type IconName } from '@/components/Icon';
import { colors, fonts } from '@/theme';

const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'chat', title: 'Chat', icon: 'chat' },
  { name: 'plan', title: 'Plan', icon: 'plan' },
  { name: 'us', title: 'Us', icon: 'heart' },
  { name: 'calendar', title: 'Calendar', icon: 'calendar' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.coralText,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodySemi, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.page },
      }}>
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color }) => <Icon name={t.icon} size={24} color={color as string} />,
          }}
        />
      ))}
    </Tabs>
  );
}
