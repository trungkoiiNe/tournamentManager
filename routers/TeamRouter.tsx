import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TeamDetail from "../screens/TeamDetail";
import CoachDashboard from "../screens/CoachDashboard";
const Stack = createStackNavigator();

const TeamRouter = () => {
  return (
    <Stack.Navigator initialRouteName="PlayerDashboard">
      <Stack.Screen
        name="CoachDashboard"
        component={CoachDashboard}
        options={{ title: "Dashboard" }}
      />
      <Stack.Screen
        name="TeamDetail"
        component={TeamDetail}
        options={{ title: "Team details" }}
      />
    </Stack.Navigator>
  );
};

export default TeamRouter;
