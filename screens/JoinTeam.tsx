import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { useStore } from "../store/store";

const { width } = Dimensions.get("window");
const numColumns = 2;
const teamItemWidth = (width - 60) / numColumns;

export default function JoinTeam({ navigation }) {
  const { teams, fetchTeams } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTeams, setFilteredTeams] = useState([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = teams.filter((team) =>
        team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeams(filtered);
    } else {
      setFilteredTeams(teams);
    }
  }, [searchQuery, teams]);

  const renderTeamItem = ({ item }) => (
    <TouchableOpacity
      style={styles.teamItem}
      onPress={() => navigation.navigate("TeamDetail", { teamId: item.id })}
    >
      <Image
        source={
          item.logoUrl
            ? { uri: item.logoUrl }
            : {
                uri: "https://firebasestorage.googleapis.com/v0/b/tournament-manager-d7665.appspot.com/o/noimages.png?alt=media&token=5dd2c160-9ea2-44b9-b913-5aba4f6fc3b8",
              }
        }
        style={styles.teamLogo}
      />
      <Text style={styles.teamName}>{item.teamName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search for a team"
        />
      </View>
      {teams.length > 0 ? (
        <FlatList
          data={filteredTeams}
          renderItem={renderTeamItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.flatListContent}
        />
      ) : (
        <Text style={{ color: "gray", textAlign: "center" }}>
          No teams with keyword
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  flatListContent: {
    paddingBottom: 20,
  },
  teamItem: {
    width: teamItemWidth,
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
});
