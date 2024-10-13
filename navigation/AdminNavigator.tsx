import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack"; // Import StackNavigator

import { Provider as PaperProvider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// import PlayersManagement from './PlayersManagement';
// import CoachesManagement from './CoachesManagement';
// import TournamentsManagement from './TournamentsManagement';
import PlayersManagement from "../screens/PlayersManagement";
// import CoachesManagement from "../screens/Admin/CoachesManagement";
import TeamsManagement from "../screens/TeamsManagement";
import ProfileRouter from "../routers/ProfileRouter";
import TournamentRouter from "../routers/TournamentRouter";
// import Home from "../screens/Home";
import HomeRouter from "../routers/HomeRouter";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); // Create a StackNavigator instance

// Define the tabBarIcon function outside of the component
const getTabBarIcon = (route: any, focused: any, color: any, size: any) => {
  let iconName;

  if (route.name === "Players") {
    iconName = focused ? "account-group" : "account-group-outline";
  } else if (route.name === "Coaches") {
    iconName = focused ? "whistle" : "whistle-outline";
  } else if (route.name === "Tournaments") {
    iconName = focused ? "trophy" : "trophy-outline";
  }

  return <Icon name={iconName ?? ""} size={size} color={color} />;
};

export default function AdminNavigator() {
  return (
    <PaperProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) =>
            getTabBarIcon(route, focused, color, size),
        })}
      >
        <Tab.Screen name="Home" component={HomeRouter} />
        <Tab.Screen name="Players" component={PlayersManagement} />
        <Tab.Screen name="Tournamentss" component={TournamentRouter} />
        <Tab.Screen name="TeamsManagement" component={TeamsManagement} />
        <Tab.Screen name="Profile" component={ProfileRouter} />

        {/* <Tab.Screen name="Dashboard" component={PlayerDashboard} /> */}
      </Tab.Navigator>
    </PaperProvider>
  );
}
