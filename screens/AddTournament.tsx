import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useStore } from "../store/store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

export default function AddTournament({ navigation }) {
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [numberOfTeams, setNumberOfTeams] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [location, setLocation] = useState("");
  const [format, setFormat] = useState("");
  const [budget, setBudget] = useState("");
  const [organizers, setOrganizers] = useState("");
  const [sponsors, setSponsors] = useState("");

  const { addTournament } = useStore();

  const handleSubmit = async () => {
    const newTournament = {
      name,
      purpose,
      numberOfTeams: parseInt(numberOfTeams),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      location,
      format,
      budget: parseFloat(budget),
      organizers: organizers.split(","),
      sponsors: sponsors.split(","),
      teams: [],
      schedule: {},
      scores: {},
    };

    await addTournament(newTournament);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add New Tournament</Text>
      <TextInput
        style={styles.input}
        placeholder="Tournament Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Purpose"
        value={purpose}
        onChangeText={setPurpose}
      />
      <TextInput
        style={styles.input}
        placeholder="Number of Teams"
        value={numberOfTeams}
        onChangeText={setNumberOfTeams}
        keyboardType="numeric"
      />
      <DateTimePicker
        value={startDate}
        mode="date"
        display="default"
        onChange={(event, selectedDate) =>
          setStartDate(selectedDate || startDate)
        }
      />
      <DateTimePicker
        value={endDate}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => setEndDate(selectedDate || endDate)}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <Picker
        selectedValue={format}
        onValueChange={(itemValue) => setFormat(itemValue)}
      >
        <Picker.Item label="Round Robin" value="roundRobin" />
        <Picker.Item label="Knockout" value="knockout" />
        <Picker.Item label="Group Stage + Knockout" value="groupKnockout" />
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="Budget"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Organizers (comma-separated)"
        value={organizers}
        onChangeText={setOrganizers}
      />
      <TextInput
        style={styles.input}
        placeholder="Sponsors (comma-separated)"
        value={sponsors}
        onChangeText={setSponsors}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Add Tournament</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
