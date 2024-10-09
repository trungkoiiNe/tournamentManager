import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useStore } from "../store/store";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

export default function TournamentsManagement({ navigation }) {
  const [name, setName] = useState("");
  const [teams, setTeams] = useState<string[]>([]);
  const [schedule, setSchedule] = useState("");
  const [scores, setScores] = useState("");
  const goToAddTournament = () => {
    navigation.navigate("AddTournament");
  };
  const {
    tournaments,
    fetchTournaments,
    addTournament,
    updateTournament,
    deleteTournament,
  } = useStore();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleAddTournament = async () => {
    if (!name || teams.length === 0 || !schedule || !scores) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    await addTournament({ name, teams, schedule, scores });
    setName("");
    setTeams([]);
    setSchedule("");
    setScores("");
    Alert.alert("Success", "Tournament added successfully");
  };

  const handleUpdateTournament = async (tournament: any) => {
    // Implement an edit form or modal here
    Alert.alert("Update Tournament", "Implement update functionality");
  };

  const handleDeleteTournament = async (id: string) => {
    Alert.alert(
      "Delete Tournament",
      "Are you sure you want to delete this tournament?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            await deleteTournament(id);
            Alert.alert("Success", "Tournament deleted successfully");
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>
        <Ionicons name="trophy" size={16} color="#333" /> {item.name}
      </Text>
      <Text style={styles.itemText}>
        {/* <Ionicons name="people" size={16} color="#333" /> Teams: {item.teams.join(", ")} */}
      </Text>
      <Text style={styles.itemText}>
        <Ionicons name="calendar" size={16} color="#333" /> Schedule:{" "}
        {JSON.stringify(item.schedule)}
      </Text>
      <Text style={styles.itemText}>
        <Ionicons name="bar-chart" size={16} color="#333" /> Scores:{" "}
        {JSON.stringify(item.scores)}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => handleUpdateTournament(item)}
          style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteTournament(item.id)}
          style={[styles.actionButton, { backgroundColor: "#F44336" }]}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tournaments Management</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddTournament")}
      >
        <LinearGradient
          colors={["#4c669f", "#3b5998", "#192f6a"]}
          style={{ borderRadius: 5 }}
        >
          <Text style={styles.buttonText}>Add New Tournament</Text>
        </LinearGradient>
      </TouchableOpacity>
      <FlatList
        data={tournaments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
    fontSize: 16,
  },
  addButton: {
    borderRadius: 5,
    overflow: "hidden",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    padding: 12,
    fontSize: 16,
  },
  item: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 5,
    padding: 8,
    marginHorizontal: 5,
  },
});
