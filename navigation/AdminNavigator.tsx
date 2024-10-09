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
import TournamentsManagement from "../screens/TournamentsManagement";
import TeamsManagement from "../screens/TeamsManagement";
import ProfileRouter from "../routers/ProfileRouter";
import AddTournament from "../screens/AddTournament";
import TournamentRouter from "../routers/TournamentRouter";
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); // Create a StackNavigator instance

export default function AdminNavigator() {
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
        <Tab.Screen name="Players" component={PlayersManagement} />
        {/* <Tab.Screen name="Coaches" component={CoachesManagement} /> */}
        {/* <Tab.Screen name="Edit profile" component={EditProfile} /> */}
        <Tab.Screen name="Profile" component={ProfileRouter} />
        <Tab.Screen name="Tournamentss" component={TournamentRouter} />
        <Tab.Screen name="TeamsManagement" component={TeamsManagement} />
        {/* <Tab.Screen name="Dashboard" component={PlayerDashboard} /> */}

      </Tab.Navigator>
    </PaperProvider>
  );
}
