import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "../store/store";
import { useAuthStore } from "../store/authStore";
import { alert } from "@baronha/ting";
import CustomModal from "../components/CustomModal";

const { width, height } = Dimensions.get("window");

export default function TeamDetail({ route, navigation }: any) {
  const { teamId } = route.params;
  const {
    teams,
    fetchAllPlayers,
    invitePlayersToTeam,
    fetchTeamMembers,
    fetchTeams,
    requestJoinTeam,
  } = useStore();
  const coachId = useAuthStore((state) => state.user?.email) as string;
  const role = useAuthStore((state) => state.user?.role) as string;
  const [team, setTeam] = useState(null as any);
  const [teamMembers, setTeamMembers] = useState([] as any);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState([] as any);
  const [allPlayers, setAllPlayers] = useState([] as any);
  const [loading, setLoading] = useState(true);
  const kickTeamMember = useStore((state) => state.kickTeamMember);
  const blankImageUrl =
    "https://firebasestorage.googleapis.com/v0/b/tournament-manager-d7665.appspot.com/o/noimages.png?alt=media&token=5dd2c160-9ea2-44b9-b913-5aba4f6fc3b8";
  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchTeams();
    // console.log(teamId);
    const currentTeam = teams.find((t) => t.id === teamId);
    setTeam(currentTeam);
    // console.log(currentTeam);
    const [members, players] = await Promise.all([
      fetchTeamMembers(teamId),
      fetchAllPlayers(),
    ]);
    setTeamMembers(members);
    setAllPlayers(players);
    setLoading(false);
    // console.log(team);
  }, [teamId, fetchTeams, fetchTeamMembers, fetchAllPlayers]);
  async function handleKickPlayer(playerId: string) {
    Alert.alert("Kick Player", `Are you sure you want to kick ${playerId}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Kick",
        onPress: async () => {
          await kickTeamMember(teamId, playerId);
          loadData();
        },
      },
    ]);
  }
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedPlayers([]);
  };
  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData();
    navigation.setOptions({ title: team?.teamName });
  }, [loadData, team, navigation]);

  const filteredPlayers = useMemo(() => {
    return allPlayers.filter(
      (player: any) =>
        !teamMembers.some((member: any) => member.id === player.id) &&
        (player.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          player.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allPlayers, teamMembers, searchQuery]);

  const togglePlayerSelection = useCallback((playerId: any) => {
    setSelectedPlayers((prev: any) =>
      prev.includes(playerId)
        ? prev.filter((id: any) => id !== playerId)
        : [...prev, playerId]
    );
  }, []);
  const handleRequestJoin = useCallback(async () => {
    try {
      await requestJoinTeam(coachId, teamId);
      alert({
        title: "Success",
        message: "Invitations sent successfully",
        preset: "done",
      });
    } catch (error) {
      alert({
        title: "Error",
        message: "Failed to invite players",
        preset: "error",
      });
    }
  }, [teamId, coachId, requestJoinTeam]);

  const handleInvitePlayers = useCallback(async () => {
    try {
      await invitePlayersToTeam(teamId, selectedPlayers);
      alert({
        title: "Success",
        message: "Invitations sent successfully",
        preset: "done",
      });
      setIsModalVisible(false);
      setSelectedPlayers([]);
    } catch (error) {
      alert({
        title: "Error",
        message: "Failed to invite players",
        preset: "error",
      });
    }
  }, [teamId, selectedPlayers, invitePlayersToTeam]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!team) return <Text>Team not found</Text>;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri: team.bannerUrl || blankImageUrl,
        }}
        style={styles.banner}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "transparent"]}
        style={styles.gradient}
      />
      <View style={styles.infoContainer}>
        <Image
          source={{
            uri: team.logoUrl || blankImageUrl,
          }}
          style={styles.logo}
        />
        <Text style={styles.name}>{team.teamName}</Text>
        <Text style={styles.coachName}>Coach: {team.coachId}</Text>
      </View>

      <View style={styles.membersContainer}>
        <Text style={styles.sectionTitle}>Team Members</Text>
        {teamMembers.map((member: any) => (
          <View style={styles.memberRow} key={member.id}>
            <Text style={styles.memberItem}>
              {member.name || "Unknown"} ({member.id || "Unknown"})
            </Text>
            <TouchableOpacity
              style={styles.kickButton}
              onPress={() => handleKickPlayer(member.id)}
            >
              <Text style={styles.kickButtonText}>Kick</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {team.coachId === coachId && (
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.inviteButtonText}>Invite Players</Text>
        </TouchableOpacity>
      )}
      {role === "player" && !team.players.includes(coachId) && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleRequestJoin}>
            <Text style={styles.buttonText}>Request Join {team.teamName}</Text>
          </TouchableOpacity>
        </View>
      )}
      <CustomModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        title="Invite Players"
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Search players..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.playerItem,
                selectedPlayers.includes(item.id) && styles.selectedPlayer,
              ]}
              onPress={() => togglePlayerSelection(item.id)}
            >
              <Text>{item.id}</Text>
              <Text>{item.name || "Unknown"}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={handleInvitePlayers}
        >
          <Text style={styles.inviteButtonText}>Send Invitations</Text>
        </TouchableOpacity>
      </CustomModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  banner: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 200,
  },
  infoContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "white",
    marginTop: -60,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 10,
  },
  coachName: {
    fontSize: 18,
    color: "#7f8c8d",
    marginTop: 5,
  },
  membersContainer: {
    backgroundColor: "white",
    padding: 20,
    marginTop: 20,
    borderRadius: 15,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 15,
  },
  inviteButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: "center",
    marginVertical: 20,
  },
  inviteButtonText: {
    color: "white",
    fontSize: 18,
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
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  searchInput: {
    height: 40,
    borderColor: "#bdc3c7",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  playerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    color: "black",
  },
  selectedPlayer: {
    backgroundColor: "#e8f4fd",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: "center",
    marginTop: 15,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#007AFF", // iOS blue color, you can change it to any color you prefer
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // for Android shadow
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  memberItem: {
    flex: 1,
    // fontSize: 16,
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
  },
  kickButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  kickButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
