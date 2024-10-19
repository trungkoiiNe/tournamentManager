import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TeamDetail from "../screens/TeamDetail";
import CoachDashboard from "../screens/CoachDashboard";
import JoinTeam from "../screens/JoinTeam";
import TeamsManagement from "../screens/TeamsManagement";
const Stack = createStackNavigator();

const TeamsManagementRouter = () => {
  return (
    <Stack.Navigator initialRouteName="CoachDashboard">
      <Stack.Screen
        name="CoachDashboard"
        component={TeamsManagement}
        options={{ title: "Dashboard", headerShown: false }}
      />
      <Stack.Screen
        name="TeamDetail"
        component={TeamDetail}
        options={{ title: "Team details" }}
      />
    </Stack.Navigator>
  );
};

export default TeamsManagementRouter;
