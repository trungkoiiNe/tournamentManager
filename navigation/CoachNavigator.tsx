import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import React from "react";
import {Provider as PaperProvider} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HomeRouter from "../routers/HomeRouter";
import ProfileRouter from "../routers/ProfileRouter";
import TeamRouter from "../routers/TeamRouter";

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
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeRouter} />
        <Tab.Screen name="Dashboard" component={TeamRouter}  />
        <Tab.Screen name="Profile" component={ProfileRouter} />
      </Tab.Navigator>
    </PaperProvider>
  );
}
