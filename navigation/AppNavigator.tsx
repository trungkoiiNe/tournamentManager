import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuthStore } from "../store/authStore";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
// import AdminDashboard from '../screens/Admin/AdminDashboard';
// import CoachDashboard from '../screens/Coach/CoachDashboard';
// import PlayerDashboard from '../screens/Player/PlayerDashboard';
import AdminNavigator from "./AdminNavigator";
import CoachNavigator from "./CoachNavigator";
import PlayerNavigator from "./PlayerNavigator";
const Stack = createStackNavigator();

const AppNavigator = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            {user.role === "admin" && (
              <Stack.Screen name="AdminDashboard" component={AdminNavigator} />
            )}
            {user.role === "coach" && (
              <Stack.Screen name="CoachDashboard" component={CoachNavigator} />
            )}
            {user.role === "player" && (
              <Stack.Screen
                name="PlayerDashboard"
                component={PlayerNavigator}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
