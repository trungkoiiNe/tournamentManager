import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomActivityIndicator from "../components/CustomActivityIndicator";
import { FlatList } from "react-native-gesture-handler";
import { ActivityIndicator } from "react-native-paper";

import { alert } from "@baronha/ting";
import { MaterialIcons } from "@expo/vector-icons";
import CheckBox from "@react-native-community/checkbox";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import GroupsTable from "../components/GroupsTable";
import { useAuthStore } from "../store/authStore";
import { useStore } from "../store/store";
import FootballLoadingIndicator from "../components/FootballLoadingIndicator";
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
    fetchRegisteredTeams,
    registeredTeams,
    fetchTournamentSchedules,
  } = useStore();
  const { user } = useAuthStore();
  const [prizes, setPrizes] = useState([]);
  // const [modalVisible, setModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  // const [coachTeams, setCoachTeams] = useState([]);
  const [teamSelectionModalVisible, setTeamSelectionModalVisible] =
    useState(false);
  const [teamsModalVisible, setTeamsModalVisible] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [schedulesModalVisible, setSchedulesModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const getSchedules = async () => {
    setLoading(true);
    const fetchedSchedules = await fetchTournamentSchedules(tournamentId);
    setSchedules(fetchedSchedules);
    setLoading(false);
  };

  const tournament = tournaments.find((t) => t.id === tournamentId);
  const blankImageUrl =
    "https://firebasestorage.googleapis.com/v0/b/tournament-manager-d7665.appspot.com/o/noimages.png?alt=media&token=5dd2c160-9ea2-44b9-b913-5aba4f6fc3b8";
  useEffect(() => {
    if (!tournament) return;

    const loadPrizes = async () => {
      const fetchedPrizes = await fetchPrizes(tournamentId);
      setPrizes(fetchedPrizes);
    };
    loadPrizes();
    console.log(tournament.groups);
    if (user && user.role === "coach") {
      fetchTeamsSpecifiedCoachId(user.email);
    }

    const unsubscribe = fetchRegisteredTeams(tournamentId);

    return () => {
      unsubscribe();
    };
  }, [tournamentId, user, tournament]);

  if (!tournament) return <Text>Tournament not found</Text>;

  const startDate = tournament.startDate.toDate().toLocaleDateString();
  const endDate = tournament.endDate.toDate().toLocaleDateString();

  const navigateTo = (screen: string) => {
    if (screen === "Teams") {
      setTeamsModalVisible(true);
    } else if (screen === "Schedule") {
      const groupA = tournament.groups[0];
      // const teamNames = groupA.teams.map((team) => team.teamName);
      // console.log(teamNames);
      // console.log(JSON.stringify(tournament.groups));
      // console.log(JSON.stringify(tournament.groups[0].teams));
      getSchedules();
      setSchedulesModalVisible(true);
    } else {
      navigation.navigate(screen, { tournamentId });
    }
  };
  const DetailItem = ({ icon, text }) => (
    <View style={styles.detailItem}>
      <MaterialIcons name={icon} size={24} color="#3498db" />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
  const handleJoinTournament = async () => {
    if (!selectedTeam || !isAgreed) {
      alert({
        title: "Error",
        message: "Please select a team and agree to the terms.",
        preset: "error",
      });
      return;
    }

    try {
      await joinTournament(tournamentId, selectedTeam);
      alert({
        title: "Success",
        message: "You have joined the tournament successfully",
        preset: "done",
      });
      setTeamSelectionModalVisible(false);
    } catch (error) {
      // console.error("Error joining tournament:", error);
      const errorMessage = (error as any).message;
      if (errorMessage === "Team has already joined this tournament") {
        alert({
          title: "Error",
          message: "Team has already joined this tournament",
          preset: "error",
        });
      } else {
        alert({
          title: "Error",
          message: "Failed to join the tournament. Please try again.",
          preset: "error",
        });
      }
    }
  };
  const renderScheduleItem = ({
    item,
    index,
    section,
  }: {
    item: any;
    index: number;
    section: any;
  }) => (
    <View>
      {index === 0 && (
        <View style={styles.roundHeader}>
          <Text style={styles.roundHeaderText}>Round {section.round}</Text>
        </View>
      )}
      <View style={styles.scheduleItem}>
        <Text style={styles.scheduleGroup}>{item.group || "-"}</Text>
        <Text style={styles.scheduleTeam}>{item.team1.teamName}</Text>
        <Text style={styles.scheduleScore}>{item.score1 || "-"}</Text>
        <Text style={styles.scheduleVs}>vs</Text>
        <Text style={styles.scheduleScore}>{item.score2 || "-"}</Text>
        <Text style={styles.scheduleTeam}>{item.team2.teamName}</Text>
        <Text style={styles.scheduleTimestamp}>
          {item.timestamp ? new Date(item.timestamp).toLocaleString() : "TBD"}
        </Text>
      </View>
    </View>
  );

  const groupSchedulesByRound = (schedules: any) => {
    const grouped = schedules.reduce((acc: any, schedule: any) => {
      if (!acc[schedule.round]) {
        acc[schedule.round] = [];
      }
      acc[schedule.round].push(schedule);
      return acc;
    }, {});

    return Object.entries(grouped).map(([round, data]) => ({
      round,
      data,
    }));
  };
  const renderItem = ({ item, section }) => {
    switch (section.type) {
      case "info":
        return (
          <View>
            {/* Render tournament info */}
            <Image
              source={{ uri: tournament.bannerUrl }}
              style={styles.banner}
            />
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
                  text={`Max Coaches: ${
                    tournament.maxCoaches || "To be determined"
                  }`}
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
                {/* {tournament.groups && (
                  <GroupsTable groups={tournament.groups} />
                )} */}
              </View>
            </View>
            <View style={styles.buttonContainer}>
              {["Schedule", "Teams", "Statistics", "News"].map((item) => (
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
                onPress={() => setTeamSelectionModalVisible(true)}
              >
                <Text style={styles.joinButtonText}>Join Tournament</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      case "groups":
        return <GroupsTable groups={tournament.groups} />;
      default:
        return null;
    }
  };
  const sections = [
    { type: "info", data: [{}] },
    { type: "groups", data: [{}] },
  ];
  const renderTeamItem = ({ item }: { item: Team }) => (
    <TouchableOpacity
      style={styles.teamItem}
      // onPress={() => navigation.navigate("TeamDetail", { teamId: item.id })}
    >
      <Image
        source={{
          uri: item.bannerUrl || blankImageUrl,
        }}
        style={styles.teamBanner}
      />
      <Image
        source={{
          uri: item.logoUrl || blankImageUrl,
        }}
        style={styles.teamLogo}
      />
      <Text style={styles.teamName}>{item.teamName}</Text>
      <Text style={styles.coachName}>Coach: {item.coachId}</Text>
      <Text style={styles.playerCount}>Players: {item.players.length}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        renderSectionHeader={() => null}
      />
      {/* <View style={styles.buttonContainer}>
        {["Schedule", "Teams", "Statistics", "News"].map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.button}
            onPress={() => navigateTo(item)}
          >
            <Text style={styles.buttonText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View> */}

      {user && user.role === "coach" && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => setTeamSelectionModalVisible(true)}
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
            <Text style={styles.modalTitle}>Join Tournament</Text>
            <Picker
              selectedValue={selectedTeam}
              onValueChange={(itemValue) => setSelectedTeam(itemValue)}
            >
              <Picker.Item label="Select a team" value="" />
              {teams.map((team) => (
                <Picker.Item
                  key={team.id}
                  label={team.teamName}
                  value={team.id}
                />
              ))}
            </Picker>
            <View style={styles.checkboxContainer}>
              <CheckBox value={isAgreed} onValueChange={setIsAgreed} />
              <Text style={styles.checkboxLabel}>
                I agree to join this tournament
              </Text>
            </View>
            <TouchableOpacity
              style={styles.joinTournamentButton}
              onPress={handleJoinTournament}
            >
              <Text style={styles.joinTournamentButtonText}>
                Join Tournament
              </Text>
            </TouchableOpacity>
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
        visible={schedulesModalVisible}
        onRequestClose={() => setSchedulesModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedules</Text>
            {loading ? (
              <FootballLoadingIndicator size="small" color="black" />
            ) : (
              <>
                {schedules.length > 0 ? (
                  <SectionList
                    sections={groupSchedulesByRound(schedules)}
                    renderItem={renderScheduleItem}
                    renderSectionHeader={({ section: { round } }) => (
                      <View style={styles.roundHeader}>
                        <Text style={styles.roundHeaderText}>
                          Round {round}
                        </Text>
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.noSchedulesText}>
                    No schedules yet. Please check back later.
                  </Text>
                )}
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSchedulesModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
  scheduleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",

    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    // padding: 10,
    backgroundColor: "#fff",
  },
  groupItem: {
    marginBottom: 20,
  },
  scheduleGroup: {
    width: "10%",
    textAlign: "center",
    fontWeight: "bold",
  },
  scheduleTeam: {
    width: "25%",
    textAlign: "center",
  },
  scheduleScore: {
    width: "10%",
    textAlign: "center",
    fontWeight: "bold",
  },
  scheduleVs: {
    width: "10%",
    textAlign: "center",
    fontWeight: "bold",
  },
  scheduleTimestamp: {
    width: "20%",
    textAlign: "center",
    fontSize: 12,
  },
  roundHeader: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginTop: 10,
  },
  roundHeaderText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: "#bdbdbd",
    marginVertical: 5,
  },
  noSchedulesText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});
