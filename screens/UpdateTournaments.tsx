import React, { useState, useCallback, useEffect, useMemo } from "react";
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
  FlatList,
} from "react-native";
import { useStore } from "../store/store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import firestore from "@react-native-firebase/firestore";
import ImagePicker from "react-native-image-crop-picker";
import { Card } from "react-native-elements";
import { alert, toast } from "@baronha/ting";
const UpdateTournament = ({ route, navigation }) => {
  const { tournament } = route.params;
  const [tournamentData, setTournamentData] = useState({
    ...tournament,
    startDate: tournament.startDate.toDate(),
    endDate: tournament.endDate.toDate(),
  });

  const [newBannerImage, setNewBannerImage] = useState(null);
  const [newLogoImage, setNewLogoImage] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoSchedule, setDemoSchedule] = useState([]);

  const {
    updateTournament,
    uploadTournamentImages,
    fetchPrizes,
    fetchRegisteredTeams,
    registeredTeams,
  } = useStore();

  useEffect(() => {
    const loadPrizes = async () => {
      const fetchedPrizes = await fetchPrizes(tournament.id);
      setPrizes(fetchedPrizes);
    };
    loadPrizes();

    const unsubscribe = fetchRegisteredTeams(tournament.id);

    return () => {
      unsubscribe();
    };
  }, [tournament.id, fetchPrizes, fetchRegisteredTeams]);

  const handleInputChange = useCallback((field, value) => {
    setTournamentData((prev) => ({ ...prev, [field]: value }));
  }, []);

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

  const pickImage = useCallback(async (type) => {
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
      alert({
        title: "Error",
        message: "Failed to pick image. Please try again.",
        preset: "error",
      });
    }
  }, []);

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
          : tournamentData.organizers.split(","),
        sponsors: Array.isArray(tournamentData.sponsors)
          ? tournamentData.sponsors
          : tournamentData.sponsors.split(","),
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

      alert({
        title: "Success",
        message: "Tournament updated successfully!",
        preset: "done",
      });
      navigation.goBack();
    } catch (error) {
      console.error("Error updating tournament:", error);
      alert({
        title: "Error",
        message: `Failed to update tournament: ${error.message}`,
        preset: "error",
      });
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

  const generateDemoSchedule = useCallback(() => {
    if (registeredTeams.length < 2) {
      alert({
        title: "Error",
        message: "Not enough teams to generate a schedule",
        preset: "error",
      });
      return;
    }

    let schedule = [];

    if (tournamentData.format === "roundRobin") {
      schedule = generateRoundRobinSchedule(registeredTeams);
    } else if (tournamentData.format === "knockout") {
      schedule = generateKnockoutSchedule(registeredTeams);
    } else if (tournamentData.format === "groupKnockout") {
      schedule = generateGroupKnockoutSchedule(registeredTeams);
    }

    setDemoSchedule(schedule);
  }, [registeredTeams, tournamentData.format]);

  const generateRoundRobinSchedule = useCallback((teams) => {
    let schedule = [];
    for (let i = 0; i < teams.length - 1; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        schedule.push({
          round: i + 1,
          team1: teams[i].teamName,
          team2: teams[j].teamName,
        });
      }
    }
    return schedule;
  }, []);

  const generateKnockoutSchedule = useCallback((teams) => {
    let schedule = [];
    let round = 1;
    let remainingTeams = [...teams];

    while (remainingTeams.length > 1) {
      let roundMatches = [];
      for (let i = 0; i < remainingTeams.length; i += 2) {
        if (i + 1 < remainingTeams.length) {
          roundMatches.push({
            round: round,
            team1: remainingTeams[i].teamName,
            team2: remainingTeams[i + 1].teamName,
          });
        } else {
          roundMatches.push({
            round: round,
            team1: remainingTeams[i].teamName,
            team2: "BYE",
          });
        }
      }
      schedule = [...schedule, ...roundMatches];
      remainingTeams = remainingTeams.filter((_, index) => index % 2 === 0);
      round++;
    }

    return schedule;
  }, []);
  const generateGroupKnockoutSchedule = useCallback(
    (teams) => {
      const numberOfGroups = Math.min(Math.floor(teams.length / 3), 4);
      const groups = Array.from({ length: numberOfGroups }, (_, i) => ({
        name: String.fromCharCode(65 + i),
        teams: [],
      }));

      // Distribute teams to groups
      teams.forEach((team, index) => {
        groups[index % numberOfGroups].teams.push(team);
      });

      // Generate group stage matches
      const groupStage = groups.flatMap((group) =>
        generateRoundRobinSchedule(group.teams).map((match) => ({
          ...match,
          group: group.name,
        }))
      );

      // Generate knockout stage (simplified)
      const knockoutTeams = groups.flatMap((group) => group.teams.slice(0, 2));
      const knockoutStage = generateKnockoutSchedule(knockoutTeams);

      return { groups, groupStage, knockoutStage };
    },
    [generateRoundRobinSchedule, generateKnockoutSchedule]
  );
  const renderGroupStage = useCallback(
    ({ groups, groupStage }) => (
      <View>
        <Text style={styles.stageHeader}>Group Stage</Text>
        {groups.map((group) => (
          <View key={group.name} style={styles.groupContainer}>
            <Text style={styles.groupHeader}>Group {group.name}</Text>
            {group.teams.map((team) => (
              <Text key={team.id} style={styles.groupTeam}>
                {team.teamName}
              </Text>
            ))}
          </View>
        ))}
        <Text style={styles.subHeader}>Group Matches</Text>
        {groupStage.map((match) => (
          <View key={`${match.team1}-${match.team2}`} style={styles.matchItem}>
            <Text style={styles.matchGroup}>Group {match.group}</Text>
            <Text style={styles.matchTeams}>
              {match.team1} vs {match.team2}
            </Text>
          </View>
        ))}
      </View>
    ),
    []
  );

  const renderKnockoutStage = useCallback(
    (knockoutStage) => (
      <View>
        <Text style={styles.stageHeader}>Knockout Stage</Text>
        {knockoutStage.map((match) => (
          <View key={`${match.team1}-${match.team2}`} style={styles.matchItem}>
            <Text style={styles.matchRound}>Round {match.round}</Text>
            <Text style={styles.matchTeams}>
              {match.team1} vs {match.team2}
            </Text>
          </View>
        ))}
      </View>
    ),
    []
  );

  const renderSchedule = useMemo(() => {
    if (
      !demoSchedule ||
      (Array.isArray(demoSchedule) && demoSchedule.length === 0)
    )
      return null;

    if (tournamentData.format === "groupKnockout") {
      return (
        <ScrollView>
          {renderGroupStage(demoSchedule)}
          {renderKnockoutStage(demoSchedule.knockoutStage)}
        </ScrollView>
      );
    } else {
      return (
        <FlatList
          data={demoSchedule}
          keyExtractor={(item, index) => `${item.round}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.matchItem}>
              <Text style={styles.matchRound}>Round {item.round}</Text>
              <Text style={styles.matchTeams}>
                {item.team1} vs {item.team2}
              </Text>
            </View>
          )}
        />
      );
    }
  }, [
    demoSchedule,
    tournamentData.format,
    renderGroupStage,
    renderKnockoutStage,
  ]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Updating tournament...</Text>
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
          source={{
            uri: newBannerImage
              ? newBannerImage.path
              : tournamentData.bannerUrl,
          }}
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
          source={{
            uri: newLogoImage ? newLogoImage.path : tournamentData.logoUrl,
          }}
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
        value={
          Array.isArray(tournamentData.organizers)
            ? tournamentData.organizers.join(",")
            : tournamentData.organizers
        }
        onChangeText={(value) => handleInputChange("organizers", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Sponsors (comma-separated)"
        placeholderTextColor="#999"
        value={
          Array.isArray(tournamentData.sponsors)
            ? tournamentData.sponsors.join(",")
            : tournamentData.sponsors
        }
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
      {prizes.map((prize) => (
        <Card key={prize.id} containerStyle={styles.prizeContainer}>
          <TextInput
            style={styles.input}
            placeholder="Prize Category"
            placeholderTextColor="#999"
            value={prize.category}
            onChangeText={(text) => updatePrize(prize.id, "category", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Number of Prizes"
            placeholderTextColor="#999"
            value={prize.numberOfPrizes.toString()}
            onChangeText={(text) =>
              updatePrize(prize.id, "numberOfPrizes", text)
            }
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Money per Prize"
            placeholderTextColor="#999"
            value={prize.moneyPerPrize.toString()}
            onChangeText={(text) =>
              updatePrize(prize.id, "moneyPerPrize", text)
            }
            keyboardType="numeric"
          />
        </Card>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addPrize}>
        <Text style={styles.addButtonText}>Add Prize</Text>
      </TouchableOpacity>
      {/*
      <Text style={styles.sectionHeader}>Registered Teams</Text>
      <FlatList
        data={registeredTeams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.teamItem}>{item.teamName}</Text>
        )}
        ListEmptyComponent={<Text>No teams have joined yet.</Text>}
      /> */}
      {/*
      <TouchableOpacity
        style={styles.generateButton}
        onPress={generateDemoSchedule}
      >
        <Text style={styles.generateButtonText}>Generate Demo Schedule</Text>
      </TouchableOpacity>

      {demoSchedule.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>Demo Schedule</Text>
          <FlatList
            data={demoSchedule}
            keyExtractor={(item, index) => `${item.round}-${index}`}
            renderItem={renderSchedule}
          />
        </>
      )} */}

      <Text style={styles.sectionHeader}>Registered Teams</Text>
      <FlatList
        data={registeredTeams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.teamItem}>{item.teamName}</Text>
        )}
        ListEmptyComponent={<Text>No teams have joined yet.</Text>}
      />

      <TouchableOpacity
        style={styles.generateButton}
        onPress={generateDemoSchedule}
      >
        <Text style={styles.generateButtonText}>Generate Demo Schedule</Text>
      </TouchableOpacity>

      {demoSchedule &&
        (Array.isArray(demoSchedule) ? demoSchedule.length > 0 : true) && (
          <>
            <Text style={styles.sectionHeader}>Demo Schedule</Text>
            {renderSchedule}
          </>
        )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Update Tournament</Text>
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
  teamItem: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  generateButton: {
    backgroundColor: "#3498db",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  generateButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  scheduleItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  scheduleRound: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  scheduleMatch: {
    fontSize: 14,
  },
  stageHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  groupContainer: {
    marginBottom: 15,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
  groupHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  groupTeam: {
    fontSize: 14,
    marginLeft: 10,
  },
  matchItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  matchGroup: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  matchRound: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  matchTeams: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default UpdateTournament;
