import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useStore } from "../store/store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import firestore from "@react-native-firebase/firestore";
import ImagePicker from "react-native-image-crop-picker";
import { Card } from "react-native-elements";
import { alert } from "@baronha/ting";
const AddTournament = ({ navigation }) => {
  const [tournamentData, setTournamentData] = useState({
    name: "",
    purpose: "",
    numberOfTeams: "",
    startDate: new Date(),
    endDate: new Date(),
    location: "",
    format: "",
    budget: "",
    organizers: "",
    sponsors: "",
    bannerImage: null,
    logoImage: null,
    maxPlayersPerTeam: "",
    maxCoaches: "",
    roundsPerMatch: "",
    timePerRound: "",
  });

  const [prizes, setPrizes] = useState([
    { category: "", numberOfPrizes: "", moneyPerPrize: "" },
  ]);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { addTournament, uploadTournamentImages } = useStore();

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
        handleInputChange(
          type === "banner" ? "bannerImage" : "logoImage",
          image
        );
      } catch (error) {
        console.log("ImagePicker Error: ", error);
        alert({
          title: "Lỗi",
          message: "Không thể chọn ảnh. Vui lòng thử lại.",
          preset: "error",
        });
      }
    },
    [handleInputChange]
  );

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      const newTournament = {
        ...tournamentData,
        numberOfTeams: parseInt(tournamentData.numberOfTeams),
        startDate: firestore.Timestamp.fromDate(tournamentData.startDate),
        endDate: firestore.Timestamp.fromDate(tournamentData.endDate),
        budget: parseFloat(tournamentData.budget),
        organizers: tournamentData.organizers.split(","),
        sponsors: tournamentData.sponsors.split(","),
        maxPlayersPerTeam: parseInt(tournamentData.maxPlayersPerTeam),
        maxCoaches: parseInt(tournamentData.maxCoaches),
        roundsPerMatch: parseInt(tournamentData.roundsPerMatch),
        timePerRound: parseInt(tournamentData.timePerRound),
        teams: [],
        schedule: {},
        scores: {},
      };

      const result = await addTournament(newTournament, prizes);

      if (!result || !result.id) {
        throw new Error("Failed to get tournament ID after adding");
      }

      if (tournamentData.bannerImage || tournamentData.logoImage) {
        await uploadTournamentImages(
          result.id,
          tournamentData.bannerImage?.path,
          tournamentData.logoImage?.path
        );
      }

      alert({
        title: "Thành công",
        message: "Thêm giải đấu thành công",
        haptic: "success",
      });
      navigation.goBack();
    } catch (error: any) {
      console.error("Error adding tournament:", error);
      alert({
        title: "Lỗi",
        message: `Không thể thêm giải đấu: ${error.message}`,
        preset: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    tournamentData,
    prizes,
    addTournament,
    uploadTournamentImages,
    navigation,
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
        <Text style={styles.loadingText}>Adding Tournament...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add New Tournament</Text>

      <TouchableOpacity
        style={styles.imageButton}
        onPress={() => pickImage("banner")}
      >
        <Text style={styles.imageButtonText}>Select Banner Image</Text>
      </TouchableOpacity>
      {tournamentData.bannerImage && (
        <Image
          source={{ uri: tournamentData.bannerImage.path }}
          style={styles.previewImage}
        />
      )}

      <TouchableOpacity
        style={styles.imageButton}
        onPress={() => pickImage("logo")}
      >
        <Text style={styles.imageButtonText}>Select Logo Image</Text>
      </TouchableOpacity>
      {tournamentData.logoImage && (
        <Image
          source={{ uri: tournamentData.logoImage.path }}
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
        value={tournamentData.numberOfTeams}
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
        value={tournamentData.budget}
        onChangeText={(value) => handleInputChange("budget", value)}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Organizers (comma-separated)"
        placeholderTextColor="#999"
        value={tournamentData.organizers}
        onChangeText={(value) => handleInputChange("organizers", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Sponsors (comma-separated)"
        placeholderTextColor="#999"
        value={tournamentData.sponsors}
        onChangeText={(value) => handleInputChange("sponsors", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Max Players per Team"
        placeholderTextColor="#999"
        value={tournamentData.maxPlayersPerTeam}
        onChangeText={(value) => handleInputChange("maxPlayersPerTeam", value)}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Max Coaches"
        placeholderTextColor="#999"
        value={tournamentData.maxCoaches}
        onChangeText={(value) => handleInputChange("maxCoaches", value)}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Rounds per Match"
        placeholderTextColor="#999"
        value={tournamentData.roundsPerMatch}
        onChangeText={(value) => handleInputChange("roundsPerMatch", value)}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Time per Round (in minutes)"
        placeholderTextColor="#999"
        value={tournamentData.timePerRound}
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
            value={prize.numberOfPrizes}
            onChangeText={(text) => updatePrize(index, "numberOfPrizes", text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Money per Prize"
            placeholderTextColor="#999"
            value={prize.moneyPerPrize}
            onChangeText={(text) => updatePrize(index, "moneyPerPrize", text)}
            keyboardType="numeric"
          />
        </Card>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={addPrize}>
        <Text style={styles.addButtonText}>Add Prize</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Add Tournament</Text>
      </TouchableOpacity>
    </ScrollView>
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

export default AddTournament;
