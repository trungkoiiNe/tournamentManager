import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useStore } from "../store/store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import firestore from "@react-native-firebase/firestore";
import ImagePicker from "react-native-image-crop-picker";
import { Card } from "react-native-elements";

const UpdateTournament = ({ route, navigation }) => {
  const { tournament } = route.params;
  const [tournamentData, setTournamentData] = useState({
    ...tournament,
    startDate: tournament.startDate.toDate(),
    endDate: tournament.endDate.toDate(),
  });

  // Add these new state variables
  const [newBannerImage, setNewBannerImage] = useState(null);
  const [newLogoImage, setNewLogoImage] = useState(null);

  const [prizes, setPrizes] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { updateTournament, uploadTournamentImages, fetchPrizes } = useStore();

  useEffect(() => {
    const loadPrizes = async () => {
      const fetchedPrizes = await fetchPrizes(tournament.id);
      setPrizes(fetchedPrizes);
    };
    loadPrizes();
  }, [tournament.id, fetchPrizes]);

  const handleInputChange = useCallback((field, value) => {
    setTournamentData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const onChangeDate = useCallback(
    (field, event, selectedDate) => {
      if (selectedDate) {
        handleInputChange(field, selectedDate);
      }
      field === "startDate"
        ? setShowStartDatePicker(false)
        : setShowEndDatePicker(false);
    },
    [handleInputChange]
  );

  const pickImage = useCallback(
    async (type) => {
      try {
        const image = await ImagePicker.openPicker({
          width: 300,
          height: 300,
          cropping: true,
          mediaType: "photo",
        });
        if (type === "banner") {
          setNewBannerImage(image);
        } else {
          setNewLogoImage(image);
        }
      } catch (error) {
        console.log("ImagePicker Error: ", error);
        Alert.alert("Error", "Failed to pick image. Please try again.");
      }
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      const updatedTournament = {
        ...tournamentData,
        numberOfTeams: parseInt(tournamentData.numberOfTeams),
        startDate: firestore.Timestamp.fromDate(tournamentData.startDate),
        endDate: firestore.Timestamp.fromDate(tournamentData.endDate),
        budget: parseFloat(tournamentData.budget),
        organizers: Array.isArray(tournamentData.organizers)
          ? tournamentData.organizers
          : tournamentData.organizers.split(','),
        sponsors: Array.isArray(tournamentData.sponsors)
          ? tournamentData.sponsors
          : tournamentData.sponsors.split(','),
        maxPlayersPerTeam: parseInt(tournamentData.maxPlayersPerTeam),
        maxCoaches: parseInt(tournamentData.maxCoaches),
        roundsPerMatch: parseInt(tournamentData.roundsPerMatch),
        timePerRound: parseInt(tournamentData.timePerRound),
      };

      await updateTournament(updatedTournament);

      if (newBannerImage || newLogoImage) {
        await uploadTournamentImages(
          tournament.id,
          newBannerImage?.path,
          newLogoImage?.path
        );
      }

      Alert.alert("Success", "Tournament updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error updating tournament:", error);
      Alert.alert("Error", `Failed to update tournament: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    tournamentData,
    updateTournament,
    uploadTournamentImages,
    navigation,
    tournament.id,
    newBannerImage,
    newLogoImage,
  ]);

  const addPrize = useCallback(() => {
    setPrizes((prev) => [
      ...prev,
      { category: "", numberOfPrizes: "", moneyPerPrize: "" },
    ]);
  }, []);

  const updatePrize = useCallback((index, field, value) => {
    setPrizes((prev) => {
      const newPrizes = [...prev];
      newPrizes[index][field] = value;
      return newPrizes;
    });
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Updating Tournament...</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Update Tournament</Text>

      <TouchableOpacity
        style={styles.imageButton}
        onPress={() => pickImage("banner")}
      >
        <Text style={styles.imageButtonText}>Update Banner Image</Text>
      </TouchableOpacity>
      {(newBannerImage || tournamentData.bannerUrl) && (
        <Image
          source={{ uri: newBannerImage ? newBannerImage.path : tournamentData.bannerUrl }}
          style={styles.previewImage}
        />
      )}

      <TouchableOpacity
        style={styles.imageButton}
        onPress={() => pickImage("logo")}
      >
        <Text style={styles.imageButtonText}>Update Logo Image</Text>
      </TouchableOpacity>
      {(newLogoImage || tournamentData.logoUrl) && (
        <Image
          source={{ uri: newLogoImage ? newLogoImage.path : tournamentData.logoUrl }}
          style={styles.previewImage}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Tournament Name"
        placeholderTextColor="#999"
        value={tournamentData.name}
        onChangeText={(value) => handleInputChange("name", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Purpose"
        placeholderTextColor="#999"
        value={tournamentData.purpose}
        onChangeText={(value) => handleInputChange("purpose", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Number of Teams"
        placeholderTextColor="#999"
        value={tournamentData.numberOfTeams.toString()}
        onChangeText={(value) => handleInputChange("numberOfTeams", value)}
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowStartDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>
          Start Date: {tournamentData.startDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker
          value={tournamentData.startDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) =>
            onChangeDate("startDate", event, selectedDate)
          }
        />
      )}

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowEndDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>
          End Date: {tournamentData.endDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showEndDatePicker && (
        <DateTimePicker
          value={tournamentData.endDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) =>
            onChangeDate("endDate", event, selectedDate)
          }
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Location"
        placeholderTextColor="#999"
        value={tournamentData.location}
        onChangeText={(value) => handleInputChange("location", value)}
      />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tournamentData.format}
          onValueChange={(itemValue) => handleInputChange("format", itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Format" value="" />
          <Picker.Item label="Round Robin" value="roundRobin" />
          <Picker.Item label="Knockout" value="knockout" />
          <Picker.Item label="Group Stage + Knockout" value="groupKnockout" />
        </Picker>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Budget"
        placeholderTextColor="#999"
        value={tournamentData.budget.toString()}
        onChangeText={(value) => handleInputChange("budget", value)}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Organizers (comma-separated)"
        placeholderTextColor="#999"
        value={Array.isArray(tournamentData.organizers) ? tournamentData.organizers.join(',') : tournamentData.organizers}
        onChangeText={(value) => handleInputChange("organizers", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Sponsors (comma-separated)"
        placeholderTextColor="#999"
        value={Array.isArray(tournamentData.sponsors) ? tournamentData.sponsors.join(',') : tournamentData.sponsors}
        onChangeText={(value) => handleInputChange("sponsors", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Max Players per Team"
        placeholderTextColor="#999"
        value={tournamentData.maxPlayersPerTeam.toString()}
        onChangeText={(value) => handleInputChange("maxPlayersPerTeam", value)}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Max Coaches"
        placeholderTextColor="#999"
        value={tournamentData.maxCoaches.toString()}
        onChangeText={(value) => handleInputChange("maxCoaches", value)}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Rounds per Match"
        placeholderTextColor="#999"
        value={tournamentData.roundsPerMatch.toString()}
        onChangeText={(value) => handleInputChange("roundsPerMatch", value)}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Time per Round (in minutes)"
        placeholderTextColor="#999"
        value={tournamentData.timePerRound.toString()}
        onChangeText={(value) => handleInputChange("timePerRound", value)}
        keyboardType="numeric"
      />
      <Text style={styles.sectionHeader}>Prizes</Text>
      {prizes.map((prize, index) => (
        <Card key={index} containerStyle={styles.prizeContainer}>
          <TextInput
            style={styles.input}
            placeholder="Prize Category"
            placeholderTextColor="#999"
            value={prize.category}
            onChangeText={(text) => updatePrize(index, "category", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Number of Prizes"
            placeholderTextColor="#999"
            value={prize.numberOfPrizes.toString()}
            onChangeText={(text) => updatePrize(index, "numberOfPrizes", text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Money per Prize"
            placeholderTextColor="#999"
            value={prize.moneyPerPrize.toString()}
            onChangeText={(text) => updatePrize(index, "moneyPerPrize", text)}
            keyboardType="numeric"
          />
        </Card>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={addPrize}>
        <Text style={styles.addButtonText}>Add Prize</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Update Tournament</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ... (same styles as in AddTournament.tsx)
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 15,
    color: "#333",
  },
  prizeContainer: {
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
  },
  addButton: {
    backgroundColor: "#3498db",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  imageButton: {
    backgroundColor: "#2980b9",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 15,
  },
  imageButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  previewImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    marginBottom: 15,
    borderRadius: 10,
  },
  dateButton: {
    backgroundColor: "#34495e",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 15,
  },
  dateButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  pickerContainer: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#333",
  },
});

export default UpdateTournament;