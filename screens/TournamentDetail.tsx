import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  Alert,
  // FlatList,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { FlatList } from "react-native-gesture-handler";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useStore } from "../store/store";
import CheckBox from "@react-native-community/checkbox";
import { useAuthStore } from "../store/authStore";
// import { FlatList } from "react-native-gesture-handler";
const { width } = Dimensions.get("window");

export default function TournamentDetail({ route, navigation }) {
  const { tournamentId } = route.params;
  const {
    tournaments,
    teams,
    fetchTeamsSpecifiedCoachId,
    joinTournament,
    fetchPrizes,
  } = useStore();
  const { user } = useAuthStore();
  const [prizes, setPrizes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [coachTeams, setCoachTeams] = useState([]);
  const [teamSelectionModalVisible, setTeamSelectionModalVisible] =
    useState(false);
  const [teamsModalVisible, setTeamsModalVisible] = useState(false);
  const [registeredTeams, setRegisteredTeams] = useState<Team[]>([]);

  const tournament = tournaments.find((t) => t.id === tournamentId);

  if (!tournament) return <Text>Tournament not found</Text>;

  const startDate = tournament.startDate.toDate().toLocaleDateString();
  const endDate = tournament.endDate.toDate().toLocaleDateString();

  const navigateTo = (screen) => {
    if (screen === "Teams") {
      setTeamsModalVisible(true);
    } else {
      navigation.navigate(screen, { tournamentId });
    }
  };

  useEffect(() => {
    const loadPrizes = async () => {
      const fetchedPrizes = await fetchPrizes(tournamentId);
      setPrizes(fetchedPrizes);
    };
    loadPrizes();

    if (user && user.role === "coach") {
      // console.log(user);
      fetchTeamsSpecifiedCoachId(user.email);
      console.log(teams);
    }

    if (tournament && tournament.teams) {
      fetchRegisteredTeams();
    }
  }, [tournamentId, user, tournament]);

  const fetchRegisteredTeams = async () => {
    if (!tournament || !tournament.teams) return;

    try {
      const teamPromises = tournament.teams.map((teamId) =>
        firestore().collection("teams").doc(teamId).get()
      );
      const teamDocs = await Promise.all(teamPromises);
      const teams = teamDocs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Team)
      );
      setRegisteredTeams(teams);
    } catch (error) {
      console.error("Error fetching registered teams:", error);
      Alert.alert("Error", "Failed to fetch registered teams");
    }
  };

  const handleJoinTournament = async () => {
    if (!selectedTeam || !isAgreed) {
      Alert.alert("Error", "Please select a team and agree to the terms.");
      return;
    }

    try {
      await joinTournament(tournamentId, selectedTeam);
      Alert.alert("Success", "You have successfully joined the tournament!");
      setModalVisible(false);
    } catch (error) {
      console.error("Error joining tournament:", error);
      Alert.alert("Error", "Failed to join the tournament. Please try again.");
    }
  };
  const renderTeamItem = ({ item }: { item: Team }) => (
    <TouchableOpacity style={styles.teamItem}>
      <Image source={{uri:item.bannerUrl}} style={styles.teamBanner}/>
      <Image source={{ uri: item.logoUrl }} style={styles.teamLogo} />
      <Text style={styles.teamName}>{item.teamName}</Text>
      <Text style={styles.coachName}>Coach: {item.coachId}</Text>
      <Text style={styles.playerCount}>Players: {item.players.length}</Text>
    </TouchableOpacity>
  );
  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: tournament.bannerUrl }} style={styles.banner} />
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "transparent"]}
        style={styles.gradient}
      />
      <View style={styles.infoContainer}>
        <Image source={{ uri: tournament.logoUrl }} style={styles.logo} />
        <Text style={styles.name}>{tournament.name}</Text>
        <Text style={styles.date}>{`${startDate} - ${endDate}`}</Text>
        <View style={styles.detailsContainer}>
          <DetailItem
            icon="format-list-bulleted"
            text={`Format: ${tournament.format || "Not specified"}`}
          />
          <DetailItem
            icon="group"
            text={`Max Teams: ${
              tournament.numberOfTeams || "To be determined"
            }`}
          />
          <DetailItem
            icon="person"
            text={`Max Players per Team: ${
              tournament.maxPlayersPerTeam || "Not specified"
            }`}
          />
          <DetailItem
            icon="sports"
            text={`Max Coaches: ${tournament.maxCoaches || "To be determined"}`}
          />
          <DetailItem
            icon="repeat"
            text={`Rounds per Match: ${
              tournament.roundsPerMatch || "Not specified"
            }`}
          />
          <DetailItem
            icon="timer"
            text={`Time per Round: ${
              tournament.timePerRound
                ? `${tournament.timePerRound} minutes`
                : "To be determined"
            }`}
          />
          <DetailItem
            icon="emoji-events"
            text={`Prizes: ${
              prizes.length > 0
                ? prizes
                    .map(
                      (prize) =>
                        `${prize.category}: ${
                          prize.numberOfPrizes
                        } x ${prize.moneyPerPrize.toLocaleString()} VND`
                    )
                    .join(", ")
                : "Not specified"
            }`}
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        {[
          "Schedule",
          "Results",
          "Ranking Board",
          "Teams",
          "Statistics",
          // "Prizes",
          "News",
        ].map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.button}
            onPress={() => navigateTo(item)}
          >
            <Text style={styles.buttonText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {user && user.role === "coach" && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.joinButtonText}>Join Tournament</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={teamsModalVisible}
        onRequestClose={() => setTeamsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registered Teams</Text>
            <FlatList
              data={registeredTeams}
              renderItem={renderTeamItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.teamRow}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setTeamsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={teamSelectionModalVisible}
        onRequestClose={() => setTeamSelectionModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Team</Text>
            <FlatList
              data={teams}
              renderItem={renderTeamItem}
              keyExtractor={(item) => item.id}
              style={styles.teamList}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setTeamSelectionModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={teamsModalVisible}
        onRequestClose={() => setTeamsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registered Teams</Text>
            <FlatList
              data={registeredTeams}
              renderItem={renderTeamItem}
              keyExtractor={(item) => item.id}
              style={styles.teamList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setTeamsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const DetailItem = ({ icon, text }) => (
  <View style={styles.detailItem}>
    <MaterialIcons name={icon} size={24} color="#3498db" />
    <Text style={styles.detailText}>{text}</Text>
  </View>
);
// ... (rest of the component code remains the same)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  banner: {
    width: "100%",
    height: 250,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 250,
  },
  infoContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: -60,
    borderWidth: 4,
    borderColor: "white",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 15,
    color: "#2c3e50",
  },
  date: {
    fontSize: 18,
    color: "#7f8c8d",
    marginTop: 5,
  },
  detailsContainer: {
    marginTop: 20,
    width: "100%",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#34495e",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
    width: width / 2 - 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  joinButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
    alignSelf: "center",
  },
  joinButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  joinTournamentButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
  },
  joinTournamentButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#3498db",
    fontSize: 16,
  },
  teamSelectionButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
  },
  teamSelectionButtonText: {
    fontSize: 16,
    textAlign: "center",
  },
  teamList: {
    maxHeight: "80%",
    width: "100%",
  },
  teamRow: {
    justifyContent: "space-between",
  },
  teamItem: {
    width: "48%",
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    padding: 15,
  },
  teamLogo: {
    // width: 60,
    // height: 60,
    // borderRadius: 30,
    alignSelf: "center",
    marginBottom: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    position: "absolute",
    top: 50,
    // left: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  teamName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  coachName: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
  playerCount: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  teamBanner: {
    width: "100%",
    height: 100,
    borderRadius: 10,
  },
});
