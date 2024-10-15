import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ProfileRouter from "../routers/ProfileRouter";
import NotificationButton from "../components/NotificationButton";
import TeamRouter from "../routers/TeamRouter";
import HomeRouter from "../routers/HomeRouter";

const Tab = createBottomTabNavigator();

// Move the tabBarIcon function outside of the PlayerNavigator component
const getTabBarIcon =
  (route: any) =>
  ({ focused, color, size }: { focused: any; color: any; size: any }) => {
    let iconName;

    if (route.name === "Home") {
      iconName = focused ? "home" : "home-outline";
    } else if (route.name === "Team") {
      iconName = focused ? "account-group" : "account-group-outline";
    } else if (route.name === "Dashboard") {
      iconName = focused ? "trophy" : "trophy-outline";
    }

    return <Icon name={iconName ?? ""} size={size} color={color} />;
  };
function renderNotificationButton() {
  return <NotificationButton />;
}
export default function PlayerNavigator() {
  return (
    <PaperProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: getTabBarIcon(route),
          headerRight: () => renderNotificationButton(),
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeRouter} />
        <Tab.Screen name="Team" component={TeamRouter} />
        <Tab.Screen name="Dashboard" component={ProfileRouter} />
      </Tab.Navigator>
    </PaperProvider>
  );
}
