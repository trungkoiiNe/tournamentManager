import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ProfileRouter from "../routers/ProfileRouter";
import CoachDashboard from "../screens/CoachDashboard";
const Tab = createBottomTabNavigator();
export default function CoachNavigator() {
  return (
    <PaperProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Players") {
              iconName = focused ? "account-group" : "account-group-outline";
            } else if (route.name === "Coaches") {
              iconName = focused ? "whistle" : "whistle-outline";
            } else if (route.name === "Tournaments") {
              iconName = focused ? "trophy" : "trophy-outline";
            }

            return <Icon name={iconName ?? ""} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={ProfileRouter} />
        <Tab.Screen name="Dashboard2" component={CoachDashboard} />
      </Tab.Navigator>
    </PaperProvider>
  );
}
