import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store/store";

const TournamentAboutScreen = () => {
  const navigation = useNavigation();
  const tournaments = useStore((state) => state.tournaments);

  // Assuming you have a way to get the tournament ID from navigation params
  const tournamentId =
    navigation.getState().routes[navigation.getState().index].params
      .tournamentId;
  const tournament = tournaments.find((t) => t.id === tournamentId);

  if (!tournament) {
    return <Text>Tournament not found</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: tournament.bannerUrl }}
        style={styles.banner}
        resizeMode={"cover"}
      />
      <View style={styles.contentContainer}>
        <Image source={{ uri: tournament.logo }} style={styles.logo} />
        <Text style={styles.name}>{tournament.name}</Text>
        <Text style={styles.time}>
          {tournament.startDate} - {tournament.endDate}
        </Text>
        <Text style={styles.info}>Type: {tournament.format}</Text>
        <Text style={styles.info}>Max Teams: {tournament.numberOfTeams}</Text>
        {/* Add other information as needed */}
      </View>
    </ScrollView>
  );
};

export default TournamentAboutScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
  },
  banner: {
    width: "100%",
    height: 200,
  },
  contentContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  time: {
    fontSize: 16,
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
  },
});
