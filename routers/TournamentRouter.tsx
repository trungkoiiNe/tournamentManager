
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TournamentsManagement from '../screens/TournamentsManagement';
import AddTournament from '../screens/AddTournament';
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
        options={{ title: 'Edit Profile' }}
      />
    </Stack.Navigator>
  );
};

export default TournamentRouter;
