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
import TeamsManagementRouter from "../routers/TeamsManagementRouter";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); // Create a StackNavigator instance

// Define a mapping of route names to icon names
const iconMap: { [key: string]: [string, string] } = {
  Players: ["account-group-outline", "account-group"],
  Coaches: ["whistle-outline", "whistle"],
  Tournamentss: ["trophy-outline", "trophy"],
  Teams: ["account-group-outline", "account-group"],
  Profile: ["account-outline", "account"],
  Home: ["home-outline", "home"],
};

// Define the tabBarIcon function using the mapping
const getTabBarIcon = (route: any, focused: any, color: any, size: any) => {
  const [outlineIcon, filledIcon] = iconMap[route.name] || ["", ""];
  const iconName = focused ? filledIcon : outlineIcon;
  return <Icon name={iconName} size={size} color={color} />;
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
        <Tab.Screen
          name="Tournamentss"
          component={TournamentRouter}
          options={{
            headerShown: false,
            headerTitle: "Tournaments",
          }}
        />
        <Tab.Screen name="Teams" component={TeamsManagementRouter} />
        <Tab.Screen name="Profile" component={ProfileRouter} />
      </Tab.Navigator>
    </PaperProvider>
  );
}
