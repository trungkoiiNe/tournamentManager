import { alert, toast } from "@baronha/ting";
import DateTimePicker from "@react-native-community/datetimepicker";
import firestore from "@react-native-firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "react-native-elements";
import ImagePicker from "react-native-image-crop-picker";
import { useStore } from "../store/store";

import Icon from "react-native-vector-icons/FontAwesome";
import FootballLoadingIndicator from "../components/FootballLoadingIndicator";
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
  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState([]);
  const [showMatchTimePicker, setShowMatchTimePicker] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(null);

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

  // const updatePrize = useCallback((index, field, value) => {
  //   setPrizes((prev) => {
  //     const newPrizes = [...prev];
  //     newPrizes[index][field] = value;
  //     return newPrizes;
  //   });
  // }, []);
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
      toast({
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
        prizes: prizes,
        groups: groups,
      };
      const updatedPrizes = prizes.map((prize: any) => ({
        category: prize.category,
        numberOfPrizes: parseInt(prize.numberOfPrizes),
        moneyPerPrize: parseInt(prize.moneyPerPrize),
      }));
      // console.log(groups.map((group) => group.));
      await updateTournament(updatedTournament, updatedPrizes, matches, groups);

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
    prizes,
    matches,
    groups,
  ]);
  const updateTeamStats = useCallback((groupName, teamId, newStats) => {
    setGroups((prevGroups) => ({
      ...prevGroups,
      [groupName]: {
        ...prevGroups[groupName],
        teams: {
          ...prevGroups[groupName].teams,
          [teamId]: {
            ...prevGroups[groupName].teams[teamId],
            stats: newStats,
          },
        },
      },
    }));
  }, []);
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
    setMatches([]); // Clear matches when generating a new schedule

    if (tournamentData.format === "roundRobin") {
      schedule = generateRoundRobinSchedule(registeredTeams);
    } else if (tournamentData.format === "knockout") {
      schedule = generateKnockoutSchedule(registeredTeams);
    } else if (tournamentData.format === "groupKnockout") {
      schedule = generateGroupKnockoutSchedule(registeredTeams);
    }

    setDemoSchedule(schedule);
    setMatches(schedule);
  }, [registeredTeams, tournamentData.format]);

  const calculateGroupStats = useCallback(() => {
    const newGroups = groups.map((group) => {
      const teamStats = {};
      group.teams.forEach((team) => {
        teamStats[team.id] = { P: 0, W: 0, D: 0, L: 0, GD: 0, Pts: 0 };
      });

      matches
        .filter((match) => match.group === group.name)
        .forEach((match) => {
          if (match.score1 !== "" && match.score2 !== "") {
            const score1 = parseInt(match.score1);
            const score2 = parseInt(match.score2);
            const team1 = teamStats[match.team1.id];
            const team2 = teamStats[match.team2.id];

            team1.P++;
            team2.P++;
            team1.GD += score1 - score2;
            team2.GD += score2 - score1;

            if (score1 > score2) {
              team1.W++;
              team2.L++;
              team1.Pts += 3;
            } else if (score2 > score1) {
              team2.W++;
              team1.L++;
              team2.Pts += 3;
            } else {
              team1.D++;
              team2.D++;
              team1.Pts += 1;
              team2.Pts += 1;
            }
          }
        });

      return {
        ...group,
        teams: group.teams.map((team) => ({
          ...team,
          stats: teamStats[team.id],
        })),
      };
    });

    setGroups(newGroups);
  }, [groups, matches]);
  const generateRoundRobinSchedule = useCallback((teams) => {
    let schedule = [];
    for (let i = 0; i < teams.length - 1; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        schedule.push({
          round: i + 1,
          team1: teams[i],
          team2: teams[j],
          score1: "",
          score2: "",
          timestamp: null,
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
            team1: remainingTeams[i],
            team2: remainingTeams[i + 1],
            score1: "",
            score2: "",
            timestamp: null,
          });
        } else {
          roundMatches.push({
            round: round,
            team1: remainingTeams[i],
            team2: { teamName: "BYE" },
            score1: "",
            score2: "",
            timestamp: null,
          });
        }
      }
      schedule = [...schedule, ...roundMatches];
      remainingTeams = remainingTeams.filter((_, index) => index % 2 === 0);
      round++;
    }

    return schedule;
  }, []);
  const generateKnockoutMatches = useCallback(() => {
    // Calculate points for each team
    const teamPoints: { [key: string]: number } = {};
    groups.forEach((group) => {
      group.teams.forEach((team) => {
        teamPoints[team.id] = 0;
      });
    });

    matches.forEach((match) => {
      if (match.score1 !== "" && match.score2 !== "") {
        const score1 = parseInt(match.score1);
        const score2 = parseInt(match.score2);
        if (score1 > score2) {
          teamPoints[match.team1.id] += 3;
        } else if (score2 > score1) {
          teamPoints[match.team2.id] += 3;
        } else {
          teamPoints[match.team1.id] += 1;
          teamPoints[match.team2.id] += 1;
        }
      }
    });

    // Get top two teams from each group
    const knockoutTeams = groups.flatMap((group) =>
      group.teams
        .sort((a, b) => teamPoints[b.id] - teamPoints[a.id])
        .slice(0, 2)
    );

    // Generate knockout matches
    const knockoutMatches = generateKnockoutSchedule(knockoutTeams);
    setMatches((prevMatches) => [...prevMatches, ...knockoutMatches]);
  }, [groups, matches, generateKnockoutSchedule]);

  const generateGroupKnockoutSchedule = useCallback(
    (teams) => {
      const numberOfGroups = Math.min(Math.floor(teams.length / 3), 4);
      const newGroups = Array.from({ length: numberOfGroups }, (_, i) => ({
        name: String.fromCharCode(65 + i),
        teams: [],
      }));

      // Distribute teams to groups
      teams.forEach((team, index) => {
        newGroups[index % numberOfGroups].teams.push(team);
      });

      setGroups(newGroups);

      // Generate group stage matches
      const groupMatches = newGroups.flatMap((group) =>
        generateRoundRobinSchedule(group.teams).map((match) => ({
          ...match,
          group: group.name,
        }))
      );

      return groupMatches;
    },
    [generateRoundRobinSchedule]
  );

  const swapTeams = useCallback(
    (groupIndex1, teamIndex1, groupIndex2, teamIndex2) => {
      setGroups((prevGroups) => {
        const newGroups = [...prevGroups];
        const temp = newGroups[groupIndex1].teams[teamIndex1];
        newGroups[groupIndex1].teams[teamIndex1] =
          newGroups[groupIndex2].teams[teamIndex2];
        newGroups[groupIndex2].teams[teamIndex2] = temp;
        return newGroups;
      });
    },
    []
  );
  const generateMatches = useCallback(() => {
    const newMatches = groups.flatMap((group) =>
      generateRoundRobinSchedule(group.teams).map((match) => ({
        ...match,
        group: group.name,
        timestamp: null,
        score1: "",
        score2: "",
      }))
    );
    setMatches(newMatches);
    calculateGroupStats();
  }, [groups, generateRoundRobinSchedule, calculateGroupStats]);
  const updateMatchResult = useCallback(
    (index, field, value) => {
      setMatches((prevMatches) => {
        const newMatches = [...prevMatches];
        newMatches[index][field] = value;
        return newMatches;
      });
      calculateGroupStats();
    },
    [calculateGroupStats]
  );
  const updateMatchTimestamp = useCallback((index, timestamp) => {
    setMatches((prevMatches) => {
      const newMatches = [...prevMatches];
      newMatches[index].timestamp = timestamp;
      return newMatches;
    });
  }, []);
  const renderGroupStage = useCallback(
    () => (
      <View>
        <Text style={styles.stageHeader}>Group Stage</Text>
        {groups.map((group, groupIndex) => (
          <View key={group.name} style={styles.groupContainer}>
            <Text style={styles.groupHeader}>Group {group.name}</Text>
            <View style={styles.statsHeader}>
              <Text style={styles.statsHeaderText}>Team</Text>
              <Text style={styles.statsHeaderText}>P</Text>
              <Text style={styles.statsHeaderText}>W</Text>
              <Text style={styles.statsHeaderText}>D</Text>
              <Text style={styles.statsHeaderText}>L</Text>
              <Text style={styles.statsHeaderText}>GD</Text>
              <Text style={styles.statsHeaderText}>Pts</Text>
            </View>
            {group.teams.map((team, teamIndex) => (
              <View key={team.id} style={styles.groupTeamContainer}>
                <Text style={styles.groupTeam}>{team.teamName}</Text>
                {team.stats && (
                  <>
                    <Text style={styles.statText}>{team.stats.P}</Text>
                    <Text style={styles.statText}>{team.stats.W}</Text>
                    <Text style={styles.statText}>{team.stats.D}</Text>
                    <Text style={styles.statText}>{team.stats.L}</Text>
                    <Text style={styles.statText}>{team.stats.GD}</Text>
                    <Text style={styles.statText}>{team.stats.Pts}</Text>
                  </>
                )}
                <TouchableOpacity
                  onPress={() => {
                    const nextGroupIndex = (groupIndex + 1) % groups.length;
                    swapTeams(groupIndex, teamIndex, nextGroupIndex, 0);
                  }}
                >
                  <Icon name="exchange" size={20} color="#3498db" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateMatches}
        >
          <Text style={styles.generateButtonText}>Generate Matches</Text>
        </TouchableOpacity>
      </View>
    ),
    [groups, swapTeams, generateMatches]
  );

  const renderMatches = useCallback(() => {
    if (!matches || matches.length === 0) {
      return <Text>No matches generated yet.</Text>;
    }
    return (
      <View>
        <Text style={styles.stageHeader}>Matches</Text>
        {matches.map((match, index) => (
          <View key={index} style={styles.matchItem}>
            {match.group && (
              <Text style={styles.matchGroup}>Group {match.group}</Text>
            )}
            <Text style={styles.matchRound}>Round {match.round}</Text>
            <Text style={styles.matchTeams}>
              {match.team1.teamName} vs {match.team2.teamName}
            </Text>
            <View style={styles.matchResultContainer}>
              <TextInput
                style={styles.scoreInput}
                value={match.score1}
                onChangeText={(value) =>
                  updateMatchResult(index, "score1", value)
                }
                keyboardType="numeric"
              />
              <Text style={styles.scoreSeparator}>-</Text>
              <TextInput
                style={styles.scoreInput}
                value={match.score2}
                onChangeText={(value) =>
                  updateMatchResult(index, "score2", value)
                }
                keyboardType="numeric"
              />
              <TouchableOpacity
                onPress={() => {
                  setCurrentMatchIndex(index);
                  setShowMatchTimePicker(true);
                }}
              >
                <Icon name="calendar" size={20} color="#3498db" />
              </TouchableOpacity>
            </View>
            {match.timestamp && (
              <Text style={styles.matchTimestamp}>
                {new Date(match.timestamp).toLocaleString()}
              </Text>
            )}
          </View>
        ))}
        {showMatchTimePicker &&
          currentMatchIndex !== null &&
          matches[currentMatchIndex] && (
            <DateTimePicker
              value={
                currentMatchIndex !== null && matches[currentMatchIndex]
                  ? matches[currentMatchIndex].timestamp || new Date()
                  : new Date()
              }
              mode="datetime"
              isVisible={showMatchTimePicker}
              // is24Hour={true}
              display="default"
              onChange={(event, selectedDate) => {
                setShowMatchTimePicker(false);
                if (selectedDate && currentMatchIndex !== null) {
                  updateMatchTimestamp(
                    currentMatchIndex,
                    selectedDate.getTime()
                  );
                }
              }}
            />
          )}
      </View>
    );
  }, [
    matches,
    showMatchTimePicker,
    currentMatchIndex,
    updateMatchResult,
    updateMatchTimestamp,
  ]);
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <FootballLoadingIndicator size="big" color="black" />
        {/* <Text style={styles.loadingText}>Updating tournament...</Text> */}
      </View>
    );
  }
  return (
    <FlatList
      ListHeaderComponent={
        <>
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
              onValueChange={(itemValue) =>
                handleInputChange("format", itemValue)
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Format" value="" />
              <Picker.Item label="Round Robin" value="roundRobin" />
              <Picker.Item label="Knockout" value="knockout" />
              <Picker.Item
                label="Group Stage + Knockout"
                value="groupKnockout"
              />
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
            onChangeText={(value) =>
              handleInputChange("maxPlayersPerTeam", value)
            }
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
                onChangeText={(text) =>
                  updatePrize(index, "numberOfPrizes", text)
                }
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Money per Prize"
                placeholderTextColor="#999"
                value={prize.moneyPerPrize.toString()}
                onChangeText={(text) =>
                  updatePrize(index, "moneyPerPrize", text)
                }
                keyboardType="numeric"
              />
            </Card>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addPrize}>
            <Text style={styles.addButtonText}>Add Prize</Text>
          </TouchableOpacity>
        </>
      }
      data={registeredTeams}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Text style={styles.teamItem}>{item.teamName}</Text>
      )}
      ListEmptyComponent={<Text>No teams have joined yet.</Text>}
      ListFooterComponent={
        <>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateDemoSchedule}
          >
            <Text style={styles.generateButtonText}>Generate Schedule</Text>
          </TouchableOpacity>

          {tournamentData.format === "groupKnockout" &&
            groups.length > 0 &&
            renderGroupStage()}
          {matches.length > 0 && renderMatches()}

          {tournamentData.format === "groupKnockout" && matches.length > 0 && (
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateKnockoutMatches}
            >
              <Text style={styles.generateButtonText}>
                Generate Knockout Matches
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Update Tournament</Text>
          </TouchableOpacity>
        </>
      }
    />
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
  groupTeamContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 10,
    marginBottom: 5,
  },
  scoreInput: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    textAlign: "center",
  },
  scoreSeparator: {
    marginHorizontal: 10,
  },
  matchResultContainer: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: 'centerTop'
  },
  matchTimestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  statsHeaderText: {
    fontWeight: "bold",
    width: 30,
    textAlign: "center",
  },
  statText: {
    width: 30,
    textAlign: "center",
  },
});

export default UpdateTournament;
