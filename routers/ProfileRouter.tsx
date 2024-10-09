
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PlayerDashboard from '../screens/PlayerDashboard';
import EditProfile from '../screens/EditProfile';

const Stack = createStackNavigator();

const ProfileRouter = () => {
  return (
    <Stack.Navigator initialRouteName="PlayerDashboard">
      <Stack.Screen
        name="PlayerDashboard"
        component={PlayerDashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Edit profile"
        component={EditProfile}
        options={{ title: 'Edit Profile' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileRouter;
