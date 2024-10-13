import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
// import PlayerDashboard from '../screens/PlayerDashboard';
// import EditProfile from '../screens/EditProfile';
import Home from "../screens/Home";
import TournamentDetail from "../screens/TournamentDetail";
// import TournamentAboutScreen from "../screens/TournamentAbout";
import TeamDetail from "../screens/TeamDetail";
import { Notifier, Easing } from 'react-native-notifier';

// Notifier.showNotification({
//   title: 'John Doe',
//   description: 'Hello! Can you help me with notifications?',
//   duration: 0,
//   showAnimationDuration: 800,
//   showEasing: Easing.bounce,
//   onHidden: () => console.log('Hidden'),
//   onPress: () => console.log('Press'),
//   hideOnPress: false,
// });
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
      <Stack.Screen
        name="TeamDetail"
        component={TeamDetail}
        options={{ title: "Team details" }}
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
