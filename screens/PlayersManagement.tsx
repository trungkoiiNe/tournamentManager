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
import { alert } from "@baronha/ting";

export default function PlayersManagement() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [teamId, setTeamId] = useState("");
  const [stats, setStats] = useState("");

  const { users, fetchUsers, addUser, updateUser, deleteUser } = useStore();
  const [selectedUserType, setSelectedUserType] = useState("all");

  const filteredUsers = users.filter(
    (user) => selectedUserType === "all" || user.role === selectedUserType
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!name || !role || !stats) {
      alert({
        title: "Error",
        message: "Please fill in all fields",
        preset: "error",
      });
      return;
    }
    await addUser({ name, role, stats, teamId: "", email: "" });
    setName("");
    setRole("");
    setTeamId("");
    setStats("");
    alert({
      title: "Success",
      message: "User added successfully",
      preset: "done",
    });
  };

  const handleUpdateUser = async (user) => {
    alert({
      title: "Update User",
      message: "Implement update functionality",
      preset: "spinner",
    });
  };

  const handleDeleteUser = async (id) => {
    Alert.alert("Delete User", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await deleteUser(id);
          // Alert.alert("Success", "User deleted successfully");
        },
      },
    ]);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "player":
        return "football-outline";
      case "coach":
        return "megaphone-outline"; // Alternative icon for coach
      case "organizer":
        return "calendar-outline";
      default:
        return "person-outline";
    }
  };
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>
        <Ionicons name={getRoleIcon(item.role)} size={16} color="#333" />{" "}
        {item.name}
      </Text>
      <Text style={styles.itemText}>
        <Ionicons name="briefcase" size={16} color="#333" /> {item.role}
      </Text>
      {/* <Text style={styles.itemText}>
        <Ionicons name="people" size={16} color="#333" /> Team ID: {item.teamId}
      </Text> */}
      <Text style={styles.itemText}>
        <Ionicons name="stats-chart" size={16} color="#333" /> Stats:{" "}
        {item.stats}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => handleUpdateUser(item)}
          style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteUser(item.id)}
          style={[styles.actionButton, { backgroundColor: "#F44336" }]}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRoleOption = (roleValue, label) => (
    <TouchableOpacity
      style={styles.radioOption}
      onPress={() => setRole(roleValue)}
    >
      <Ionicons
        name={role === roleValue ? "radio-button-on" : "radio-button-off"}
        size={20}
        color="#333"
      />
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Players Management</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <View style={styles.radioGroup}>
          {renderRoleOption("player", "Player")}
          {renderRoleOption("coach", "Coach")}
          {/* {renderRoleOption("organizer", "Organizer")} */}
        </View>
        {/* <TextInput
          style={styles.input}
          placeholder="Team ID"
          value={teamId}
          onChangeText={setTeamId}
        /> */}
        <TextInput
          style={styles.input}
          placeholder="Stats"
          value={stats}
          onChangeText={setStats}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <LinearGradient
            colors={["#4c669f", "#3b5998", "#192f6a"]}
            style={{ borderRadius: 5 }}
          >
            <Text style={styles.buttonText}>Add Player</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredUsers}
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
    backgroundColor: "#fff",
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioLabel: {
    marginLeft: 5,
    fontSize: 16,
    color: "#333",
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
