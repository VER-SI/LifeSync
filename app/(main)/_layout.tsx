import { Drawer } from 'expo-router/drawer';
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Drawer
      initialRouteName="(tabs)"
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: "#008080",
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Tasks",
          drawerIcon: ({ color, size }) => (
            <Feather name="check-square" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        options={{
          title: "Profile",
          drawerIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        options={{
          title: "Settings",
          drawerIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Insights"
        options={{
          title: "Insights",
          drawerIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Notifications"
        options={{
          title: "Notifications",
          drawerIcon: ({ color, size }) => (
            <Feather name="bell" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
