import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  Image,
  Modal,
} from "react-native";
import { useStore } from "../store/store";
import { useAuthStore } from "../store/authStore";
import ImagePicker from "react-native-image-crop-picker";

interface User {
  id: string;
  role: string;
  name: string;
  teamId?: string;
  stats: any;
  email: string;
}

interface Team {
  id: string;
  teamName: string;
  players: string[];
  coachId: string;
  schedule: any;
  avatar?: string;
}

const CoachDashboard = () => {
  const {
    users,
    teams,
    fetchUsers,
    addTeam,
    updateTeam,
    fetchTeamsSpecifiedCoachId,
  } = useStore();
  const { user } = useAuthStore();
  const [teamName, setTeamName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [teamAvatar, setTeamAvatar] = useState("");

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
      });
      setTeamAvatar(image.path);
    } catch (error) {
      console.error("ImagePicker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  useEffect(() => {
    fetchUsers();
    if (user) {
      // Check if user is defined
      fetchTeamsSpecifiedCoachId(user.email);
    }
  }, []);

  const createTeam = async () => {
    if (teamName.trim() === "") {
      Alert.alert("Error", "Please enter a team name");
      return;
    }

    const coach = users.find((user) => user.role === "coach");
    if (!coach) {
      Alert.alert("Error", "Coach not found");
      return;
    }

    await addTeam({
      teamName,
      players: [],
      coachId: coach.id,
      schedule: {},
      avatar: teamAvatar || "placeholder_avatar_url",
    });

    setTeamName("");
    setTeamAvatar("");
    setIsModalVisible(false);
    Alert.alert("Success", "Team created successfully");
  };

  const invitePlayer = async (teamId: string) => {
    if (playerEmail.trim() === "") {
      Alert.alert("Error", "Please enter a player email");
      return;
    }

    const player = users.find(
      (user) => user.role === "player" && user.email === playerEmail
    );
    if (!player) {
      Alert.alert("Error", "Player not found");
      return;
    }

    if (player.teamId) {
      Alert.alert("Error", "This player is already in a team");
      return;
    }

    const team = teams.find((t) => t.id === teamId);
    if (!team) {
      Alert.alert("Error", "Team not found");
      return;
    }

    await updateTeam({
      ...team,
      players: [...team.players, player.id],
    });

    setPlayerEmail("");
    Alert.alert("Success", "Player invited successfully");
  };

  return (
    <View>
      <Text>Coach Dashboard</Text>

      <Button title="Create New Team" onPress={() => setIsModalVisible(true)} />

      <Modal visible={isModalVisible} animationType="slide">
        <View>
          <Text>Create a new team</Text>
          <TextInput
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Enter team name"
          />
          <Button title="Pick Team Avatar" onPress={pickImage} />
          {teamAvatar && (
            <Image
              source={{ uri: teamAvatar }}
              style={{ width: 100, height: 100 }}
            />
          )}
          <Button title="Create Team" onPress={createTeam} />
          <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
        </View>
      </Modal>

      <FlatList
        data={teams.filter(
          (team) => team.coachId === users.find((u) => u.role === "coach")?.id
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View key={item.id}>
            {item.avatar && (
              <Image
                source={{ uri: item.avatar }}
                style={{ width: 50, height: 50 }}
              />
            )}
            <Text>{item.teamName}</Text>
            <TextInput
              value={playerEmail}
              onChangeText={setPlayerEmail}
              placeholder="Enter player email"
            />
            <Button
              title="Invite Player"
              onPress={() => invitePlayer(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
};

export default CoachDashboard;
