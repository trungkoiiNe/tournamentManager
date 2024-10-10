import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TournamentsManagement from "../screens/TournamentsManagement";
import AddTournament from "../screens/AddTournament";
import TournamentDetail from "../screens/TournamentDetail";
import UpdateTournaments from "../screens/UpdateTournaments";
const Stack = createStackNavigator();

const TournamentRouter = () => {
  return (
    <Stack.Navigator initialRouteName="PlayerDashboard">
      <Stack.Screen
        name="Tournaments"
        component={TournamentsManagement}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddTournament"
        component={AddTournament}
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen
        name="TournamentDetail"
        component={TournamentDetail}
        options={{ title: "Tournament Detail" }}
      />
      <Stack.Screen
        name="UpdateTournament"
        component={UpdateTournaments}
        options={{ title: "Update Tournament" }}
      />
    </Stack.Navigator>
  );
};

export default TournamentRouter;
