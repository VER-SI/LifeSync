import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";


export default function TabsLayout() {
  return ( 
  <Tabs
    screenOptions={{
        tabBarActiveTintColor: 'blue',  //ani gradient 
        headerStyle:{
            backgroundColor: "white",
        },
        headerShadowVisible:false,
        headerTintColor:"Black",
        tabBarStyle: {
            backgroundColor: "white",
        },
    }}
  >

    <Tabs.Screen 
    name="Clock"
    options={{
      headerShown: false,
      tabBarIcon: ({focused,color}) => (
      <Ionicons 
      name={focused ? "time":"time-outline"} // Changed to Clock icon
      color={color}
      size={24} 
      />
    ),
    }}
    />

    <Tabs.Screen 
    name="Home" 
    options={{
      headerShown: false,
      tabBarIcon: ({focused,color}) => (
      <Ionicons 
      name={focused ? "home":"home-outline"}
      color={color} 
      size={24} 
      />
    ),
    }}
    />

    <Tabs.Screen 
    name="Calender"
    options={{
      headerShown: false,
      tabBarIcon: ({focused,color}) => (
      <Ionicons 
      name={focused ? "calendar":"calendar-outline"} // Changed to Calendar icon
      color={color}
      size={24} 
      />
    ),
    }}
    />
    
    {/* Added the new Insights tab using the recommended icon */}
    <Tabs.Screen 
    name="Insights"
    options={{
      headerShown: false,
      tabBarIcon: ({focused,color}) => (
      <Ionicons 
      name={focused ? "bar-chart":"bar-chart-outline"} // Recommended icon for data/insights
      color={color}
      size={24} 
      />
    ),
    }}
    />
    
  </Tabs>
  );
}
