import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface ProfileCardProps {
  user: {
    name: string;
    role: string;
    position: string;
  };
  avatarUrl: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, avatarUrl }) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Image source={avatarUrl ? {uri: avatarUrl} : require("../assets/messi.png")} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>
        <View style={styles.locationContainer}>
          <Icon name="map-pin" size={16} color="#4B5563" style={styles.icon} />
          <Text style={styles.location}>{user.position}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 24,
    width: '100%',
  },
  content: {
    alignItems: 'center',
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
  },
  role: {
    color: '#4B5563',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  icon: {
    marginRight: 4,
  },
  location: {
    color: '#4B5563',
  },
});

export default ProfileCard;