import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useStore } from "../store/store";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { alert } from "@baronha/ting";
export default function TournamentsManagement({ navigation }) {
  const { tournaments, fetchTournaments, deleteTournament } = useStore();

  useEffect(() => {
    fetchTournaments();
  }, []);

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
            alert({
              title: "Success",
              message: "Tournament deleted successfully",
              preset: "done",
            });
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.tournamentItem}>
      <Image source={{ uri: item.bannerUrl }} style={styles.banner} />
      <Image source={{ uri: item.logoUrl }} style={styles.logo} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.purpose}</Text>
        <Text style={styles.dateTime}>
          {item.startDate.toDate().toLocaleDateString()} -{" "}
          {item.endDate.toDate().toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("UpdateTournament", { tournament: item })
          }
          style={styles.iconButton}
        >
          <Ionicons name="create-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteTournament(item.id)}
          style={styles.iconButton}
        >
          <Ionicons name="trash-outline" size={24} color="#F44336" />
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
          style={styles.gradient}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.buttonText}>Add New Tournament</Text>
        </LinearGradient>
      </TouchableOpacity>
      <FlatList
        data={tournaments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
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
  addButton: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  tournamentItem: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
  },
  banner: {
    width: "100%",
    height: 150,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: "absolute",
    top: 120,
    left: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  infoContainer: {
    padding: 15,
    paddingTop: 30,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  dateTime: {
    fontSize: 12,
    color: "#999",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  iconButton: {
    padding: 10,
  },
});
