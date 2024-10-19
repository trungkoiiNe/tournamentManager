import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TeamDetail from "../screens/TeamDetail";
import CoachDashboard from "../screens/CoachDashboard";
import JoinTeam from "../screens/JoinTeam";
const Stack = createStackNavigator();

const TeamRouter = () => {
  return (
    <Stack.Navigator initialRouteName="PlayerDashboard">
      <Stack.Screen
        name="CoachDashboard"
        component={CoachDashboard}
        options={{ title: "Dashboard",headerShown:false }}
      />
      <Stack.Screen
        name="TeamDetail"
        component={TeamDetail}
        options={{ title: "Team details" }}
      />
      <Stack.Screen
        name="JoinTeam"
        component={JoinTeam}
        options={{ title: "Join Team" }}
      />
    </Stack.Navigator>
  );
};

export default TeamRouter;
