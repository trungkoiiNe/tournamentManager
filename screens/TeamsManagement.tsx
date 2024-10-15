import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { useStore } from "../store/store";

export default function TeamsManagement() {
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
    await deleteTeam(id);
  };

  const renderTeamItem = ({ item }: { item: any }) => (
    <View style={styles.teamItem}>
      {editingTeam === item.id ? (
        <TextInput
          style={styles.input}
          value={item.teamName}
          onChangeText={(text) => handleUpdateTeam(item.id, text)}
          onBlur={() => setEditingTeam(null)}
          autoFocus
        />
      ) : (
        <Text>{item.teamName}</Text>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => setEditingTeam(item.id)}
          style={styles.button}
        >
          <Text>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteTeam(item.id)}
          style={styles.button}
        >
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teams Management</Text>
      <View style={styles.addTeamContainer}>
        <TextInput
          style={styles.input}
          value={newTeamName}
          onChangeText={setNewTeamName}
          placeholder="New team name"
        />
        <TouchableOpacity onPress={handleAddTeam} style={styles.button}>
          <Text>Add Team</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={teams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  addTeamContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginRight: 10,
  },
  teamItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#ddd",
    padding: 10,
    marginLeft: 10,
  },
});
