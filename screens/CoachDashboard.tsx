import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useStore } from "../store/store";
import ImagePicker from "react-native-image-crop-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAuthStore } from "../store/authStore";
import { alert, toast } from "@baronha/ting";
import CustomModal from "../components/CustomModal";

const CoachDashboard = ({ navigation }) => {
  const {
    teams,
    fetchTeamsSpecifiedCoachId,
    addTeam,
    uploadTeamImages,
    fetchTeams,
    fetchTeamsSpecifiedPlayerId,
  } = useStore();
  // const { user } = useAuthStore();
  const coachId = useAuthStore((state) => state.user?.email) as string;
  const role = useAuthStore((state) => state.user?.role) as string;
  // const user = useAuthStore((state) => state.user);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState<any>(null);
  const [newTeamBanner, setNewTeamBanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalJoinVisible, setIsModalJoinVisible] = useState(false);

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setNewTeamName("");
    setNewTeamLogo(null);
    setNewTeamBanner(null);
  };

  const handleCloseJoinModal = () => {
    setIsModalJoinVisible(false);
  };

  const loadTeams = useCallback(async () => {
    // console.log(role);
    if (role === "coach") {
      setLoading(true);
      // console.log(coachId);
      await fetchTeamsSpecifiedCoachId(coachId);
      setLoading(false);
    } else if (role === "player") {
      // console.log(coachId);
      setLoading(true);
      await fetchTeamsSpecifiedPlayerId(coachId);
      setLoading(false);
    }
  }, [coachId, fetchTeamsSpecifiedPlayerId, fetchTeamsSpecifiedCoachId]);

  useFocusEffect(
    useCallback(() => {
      loadTeams();
    }, [loadTeams])
  );

  const pickImage = useCallback(async (type: string) => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        mediaType: "photo",
      });
      if (type === "logo") {
        setNewTeamLogo(image);
      } else {
        setNewTeamBanner(image);
      }
    } catch (error) {
      // console.error("ImagePicker Error:", error);
      toast({
        title: "Lỗi",
        message: `Không thể chọn ảnh ${type}. Vui lòng thử lại.`,
        preset: "error",
      });
    }
  }, []);

  const handleOpenJoinModal = () => {
    navigation.navigate("JoinTeam");
    // setIsModalJoinVisible(true);
  };

  const handleCreateTeam = useCallback(async () => {
    if (newTeamName.trim() === "") {
      alert({
        title: "Lỗi",
        message: "Vui lòng nhập tên đội",
        preset: "error",
      });
      return;
    }

    try {
      const newTeam = {
        teamName: newTeamName,
        coachId: coachId,
        players: [],
        schedule: {},
      };

      const result = await addTeam(newTeam);

      if (!result.id) {
        throw new Error("Failed to create team: No ID returned");
      }

      if (newTeamLogo || newTeamBanner) {
        await uploadTeamImages(
          result.id,
          newTeamLogo?.path,
          newTeamBanner?.path
        );
      }

      setNewTeamName("");
      setNewTeamLogo(null);
      setNewTeamBanner(null);
      setIsModalVisible(false);
      alert({
        title: "Thành công",
        message: "Đội bạn đã tạo thành công",
        haptic: "success",
      });
      loadTeams();
    } catch (error: any) {
      console.error("Error creating team:", error);
      alert({
        title: "Lỗi",
        message: `Không thể tạo đội: ${error.message}`,
        preset: "error",
      });
    }
  }, [
    newTeamName,
    coachId,
    addTeam,
    uploadTeamImages,
    newTeamLogo,
    newTeamBanner,
  ]);

  const renderTeamItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.teamItem}
        onPress={() => navigation.navigate("TeamDetail", { teamId: item.id })}
      >
        <Image
          source={
            item.bannerUrl
              ? { uri: item.bannerUrl }
              : {
                  uri: "https://firebasestorage.googleapis.com/v0/b/tournament-manager-d7665.appspot.com/o/noimages.png?alt=media&token=5dd2c160-9ea2-44b9-b913-5aba4f6fc3b8",
                }
          }
          style={styles.banner}
        />
        <Image
          source={
            item.logoUrl
              ? { uri: item.logoUrl }
              : {
                  uri: "https://firebasestorage.googleapis.com/v0/b/tournament-manager-d7665.appspot.com/o/noimages.png?alt=media&token=5dd2c160-9ea2-44b9-b913-5aba4f6fc3b8",
                }
          }
          style={styles.logo}
        />
        <Text style={styles.teamName}>{item.teamName}</Text>
        <Text
          style={styles.playerCount}
        >{`Players: ${item.players.length}`}</Text>
      </TouchableOpacity>
    ),
    [navigation]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My teams</Text>
      {role === "coach" && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
      {role === "player" && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleOpenJoinModal}
        >
          <Text style={styles.joinButtonText}>Don't have a team? Join Now</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={teams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
      <CustomModal
        visible={isModalVisible}
        onClose={() => handleCloseModal()}
        title="Create New Team"
      >
        <TextInput
          style={styles.input}
          placeholder="Enter team name"
          value={newTeamName}
          onChangeText={setNewTeamName}
        />
        <TouchableOpacity
          style={styles.imageButton}
          onPress={() => pickImage("logo")}
        >
          <Text style={styles.imageButtonText}>Select Logo</Text>
        </TouchableOpacity>
        {newTeamLogo && (
          <Image
            source={{ uri: newTeamLogo.path }}
            style={styles.previewImage}
          />
        )}
        <TouchableOpacity
          style={styles.imageButton}
          onPress={() => pickImage("banner")}
        >
          <Text style={styles.imageButtonText}>Select Banner</Text>
        </TouchableOpacity>
        {newTeamBanner && (
          <Image
            source={{ uri: newTeamBanner.path }}
            style={styles.previewImage}
          />
        )}
        <TouchableOpacity
          style={styles.createTeamButton}
          onPress={handleCreateTeam}
        >
          <Text style={styles.createTeamButtonText}>Create Team</Text>
        </TouchableOpacity>
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  createButton: {
    position: "absolute",
    right: 20,
    top: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  joinButton: {
    backgroundColor: "#FF5722",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  joinButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  row: {
    justifyContent: "space-between",
  },
  teamItem: {
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
  teamName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 30,
    marginHorizontal: 10,
  },
  playerCount: {
    fontSize: 14,
    color: "gray",
    marginHorizontal: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  imageButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  imageButtonText: {
    color: "white",
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    borderRadius: 5,
    marginBottom: 10,
  },
  createTeamButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  createTeamButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CoachDashboard;
