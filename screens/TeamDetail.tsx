import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useStore } from "../store/store";
import { useAuthStore } from "../store/authStore";
import { alert } from "@baronha/ting";

const { width, height } = Dimensions.get("window");

export default function TeamDetail({ route, navigation }) {
  const { teamId } = route.params;
  const {
    teams,
    fetchAllPlayers,
    invitePlayersToTeam,
    fetchTeamMembers,
    fetchTeams,
  } = useStore();
  const coachId = useAuthStore((state) => state.user?.email);
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const blankImageUrl =
    "https://firebasestorage.googleapis.com/v0/b/tournament-manager-d7665.appspot.com/o/noimages.png?alt=media&token=5dd2c160-9ea2-44b9-b913-5aba4f6fc3b8";
  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchTeams();
    const currentTeam = teams.find((t) => t.id === teamId);
    setTeam(currentTeam);
    console.log(teams.map((team) => team.teamName));
    const [members, players] = await Promise.all([
      fetchTeamMembers(teamId),
      fetchAllPlayers(),
    ]);

    setTeamMembers(members);
    setAllPlayers(players);
    setLoading(false);
  }, [teamId, fetchTeams, fetchTeamMembers, fetchAllPlayers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPlayers = useMemo(() => {
    return allPlayers.filter(
      (player) =>
        !teamMembers.some((member) => member.id === player.id) &&
        (player.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          player.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allPlayers, teamMembers, searchQuery]);

  const togglePlayerSelection = useCallback((playerId) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  }, []);

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
        <Text style={styles.coachName}>Coach: {coachId}</Text>
      </View>

      <View style={styles.membersContainer}>
        <Text style={styles.sectionTitle}>Team Members</Text>
        {teamMembers.map((member) => (
          <Text key={member.id} style={styles.memberItem}>
            {member.name || "Unknown"} ({member.id || "Unknown"})
          </Text>
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

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite Players</Text>
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
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  memberItem: {
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
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
});
