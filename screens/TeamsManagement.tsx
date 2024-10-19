import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  Alert,
} from "react-native";
import { useStore } from "../store/store";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const DEFAULT_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/tournament-manager-d7665.appspot.com/o/noimages.png?alt=media&token=5dd2c160-9ea2-44b9-b913-5aba4f6fc3b8";

export default function TeamsManagement({navigation}: {navigation: any}) {
  const { teams, fetchTeams, addTeam, updateTeam, deleteTeam } = useStore();
  const [newTeamName, setNewTeamName] = useState("");
  const [editingTeam, setEditingTeam] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleAddTeam = async () => {
    if (newTeamName.trim()) {
      await addTeam({
        teamName: newTeamName.trim(),
        players: [],
        coachId: "",
        schedule: {},
        logoUrl: DEFAULT_IMAGE,
        bannerUrl: DEFAULT_IMAGE,
      });
      setNewTeamName("");
    }
  };

  const handleUpdateTeam = async (id: string, newName: string) => {
    const team = teams.find((t) => t.id === id);
    if (team) {
      await updateTeam({ ...team, teamName: newName });
      setEditingTeam(null);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    Alert.alert("Delete Team", "Are you sure you want to delete this team?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTeam(id) },
    ]);
  };

  const renderTeamItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("TeamDetail", { teamId: item.id })}
    >
      <View style={styles.teamItem}>
        <Image
          source={{ uri: item.logoUrl || DEFAULT_IMAGE }}
          style={styles.teamLogo}
        />
        <View style={styles.teamInfo}>
          {editingTeam === item.id ? (
            <TextInput
              style={styles.editInput}
              value={item.teamName}
              onChangeText={(text) => handleUpdateTeam(item.id, text)}
              onBlur={() => setEditingTeam(null)}
              autoFocus
            />
          ) : (
            <Text style={styles.teamName}>{item.teamName}</Text>
          )}
          <Text style={styles.playerCount}>{item.players.length} players</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => setEditingTeam(item.id)}
            style={styles.iconButton}
          >
            <Ionicons name="pencil" size={24} color="#4a69bd" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteTeam(item.id)}
            style={styles.iconButton}
          >
            <Ionicons name="trash" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={{ uri: DEFAULT_IMAGE }}
      style={styles.container}
      blurRadius={5}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]}
        style={styles.overlay}
      >
        <Text style={styles.title}>Teams Management</Text>
        <View style={styles.addTeamContainer}>
          <TextInput
            style={styles.input}
            value={newTeamName}
            onChangeText={setNewTeamName}
            placeholder="New team name"
            placeholderTextColor="#ccc"
          />
          <TouchableOpacity onPress={handleAddTeam} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={teams}
          renderItem={renderTeamItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  addTeamContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 25,
    padding: 15,
    marginRight: 10,
    color: "#fff",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#4a69bd",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  teamItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  playerCount: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
  },
  editInput: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#4a69bd",
    paddingVertical: 5,
  },
});
