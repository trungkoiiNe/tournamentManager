import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useStore } from "../store/store";

const Home = ({ navigation }) => {
  const { tournaments, fetchTournaments } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTournaments();
  }, []);

  const filteredTournaments = tournaments.filter((tournament) => {
    return (
      tournament?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament?.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const renderTournamentItem = ({ item }) => {
    const startDate = item.startDate.toDate().toLocaleDateString();
    const endDate = item.endDate.toDate().toLocaleDateString();

    return (
      <TouchableOpacity
        style={styles.tournamentItem}
        onPress={() => {
          console.log(item);
          navigation.navigate("TournamentDetail", { tournamentId: item.id });
        }}
      >
        <Image source={{ uri: item.bannerUrl }} style={styles.banner} />
        <Image source={{ uri: item.logoUrl }} style={styles.logo} />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.purpose}</Text>
        <Text style={styles.dateTime}>{`${startDate} - ${endDate}`}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Text style={styles.searchLabel}>Search Tournaments:</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search tournaments..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredTournaments}
        renderItem={renderTournamentItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchLabel: {
    marginRight: 10,
    fontSize: 16,
  },
  searchBar: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    flex: 1,
  },
  row: {
    justifyContent: "space-between",
  },
  tournamentItem: {
    width: "48%",
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "white",
    elevation: 3,
  },
  banner: {
    width: "100%",
    height: 100,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: "absolute",
    top: 75,
    left: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 30,
    marginHorizontal: 10,
  },
  description: {
    fontSize: 14,
    marginHorizontal: 10,
    marginTop: 5,
  },
  dateTime: {
    fontSize: 12,
    color: "gray",
    marginHorizontal: 10,
    marginTop: 5,
    marginBottom: 10,
  },
});

export default Home;
