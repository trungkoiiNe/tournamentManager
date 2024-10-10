import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
// import PlayerDashboard from '../screens/PlayerDashboard';
// import EditProfile from '../screens/EditProfile';
import Home from "../screens/Home";
import TournamentDetail from "../screens/TournamentDetail";
// import TournamentAboutScreen from "../screens/TournamentAbout";
const Stack = createStackNavigator();

const HomeRouter = () => {
  return (
    <Stack.Navigator initialRouteName="PlayerDashboard">
      <Stack.Screen
        name="HomePage"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TournamentDetail"
        component={TournamentDetail}
        options={{ title: "Tournament details" }}
      />
       {/* <Stack.Screen
        name="TournamentAbout"
        component={TournamentAboutScreen}
        options={{ title: "Tournament details" }}
      /> */}
    </Stack.Navigator>
  );
};

export default HomeRouter;
