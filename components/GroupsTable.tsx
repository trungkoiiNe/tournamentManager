import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const GroupsTable = ({ groups }: { groups: any }) => {
  // console.log(groups);
  const renderTeam = ({ item }: { item: any }) => (
    <View style={styles.teamRow}>
      <Text style={styles.teamCell}>{item.teamName}</Text>
      <Text style={styles.dataCell}>{item.stats.P || 0}</Text>
      <Text style={styles.dataCell}>{item.stats.W || 0}</Text>
      <Text style={styles.dataCell}>{item.stats.D || 0}</Text>
      <Text style={styles.dataCell}>{item.stats.L || 0}</Text>
      <Text style={styles.dataCell}>{item.stats.GD || 0}</Text>
      <Text style={styles.dataCell}>{item.stats.Pts || 0}</Text>
    </View>
  );

  const renderGroup = ({ item }: { item: any }) => (
    <View style={styles.groupContainer}>
      <Text style={styles.groupHeader}>Group {item.name}</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Team</Text>
        <Text style={styles.headerCell}>P</Text>
        <Text style={styles.headerCell}>W</Text>
        <Text style={styles.headerCell}>D</Text>
        <Text style={styles.headerCell}>L</Text>
        <Text style={styles.headerCell}>GD</Text>
        <Text style={styles.headerCell}>Pts</Text>
      </View>
      <FlatList
        data={Object.values(item.teams)}
        keyExtractor={(team: any) => team.id}
        renderItem={renderTeam}
      />
    </View>
  );

  const groupsArray = Object.entries(groups).map(([name, teams]) => ({
    name,
    teams,
  }));

  return (
    <>
      {groups.length > 0 ? (
        <FlatList
          data={groupsArray}
          keyExtractor={(item: any) => item.name}
          renderItem={renderGroup}
        />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  groupContainer: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
  },
  groupHeader: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
    backgroundColor: "#3498db",
    color: "white",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ecf0f1",
    paddingVertical: 5,
  },
  headerCell: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
  teamRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    paddingVertical: 5,
  },
  teamCell: {
    flex: 3,
    paddingLeft: 10,
  },
  dataCell: {
    flex: 1,
    textAlign: "center",
  },
});

export default GroupsTable;
