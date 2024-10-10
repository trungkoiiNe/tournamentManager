import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useStore } from "../store/store";
import ImagePicker from "react-native-image-crop-picker";
import { Card } from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAuthStore } from "../store/authStore";

const CoachDashboard = ({ navigation }) => {
  const { teams, fetchTeamsSpecifiedCoachId, addTeam, uploadTeamImages } =
    useStore();
  const coachId = useAuthStore((state) => state.user?.email);
  // console.log(useAuthStore((state) => state.user));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState(null);
  const [newTeamBanner, setNewTeamBanner] = useState(null);

  useEffect(() => {
    fetchTeamsSpecifiedCoachId(coachId);
  }, [coachId, fetchTeamsSpecifiedCoachId]);

  const pickImage = useCallback(async (type) => {
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
      console.error("ImagePicker Error:", error);
      Alert.alert("Error", `Failed to pick ${type} image. Please try again.`);
    }
  }, []);

  const handleCreateTeam = useCallback(async () => {
    if (newTeamName.trim() === "") {
      Alert.alert("Error", "Please enter a team name");
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

      if (!result || !result.id) {
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
      Alert.alert("Success", "Team created successfully");
    } catch (error) {
      console.error("Error creating team:", error);
      Alert.alert("Error", `Failed to create team: ${error.message}`);
    }
  }, [
    newTeamName,
    coachId,
    addTeam,
    uploadTeamImages,
    newTeamLogo,
    newTeamBanner,
  ]);

  const renderTeamItem = ({ item }) => (
    <TouchableOpacity
      style={styles.teamItem}
      onPress={() => navigation.navigate("TeamDetail", { teamId: item.id })}
    >
      <Image source={{ uri: item.bannerUrl }} style={styles.banner} />
      <Image source={{ uri: item.logoUrl }} style={styles.logo} />
      <Text style={styles.teamName}>{item.teamName}</Text>
      <Text
        style={styles.playerCount}
      >{`Players: ${item.players.length}`}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Coach Dashboard</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>
      <FlatList
        data={teams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Create New Team</Text>
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
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    top: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
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
});

export default CoachDashboard;
