import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Modal, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useStore } from '../store/store';

const NotificationButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { pendingInvitations, fetchPendingInvitations, respondToInvitation } = useStore();

  useEffect(() => {
    fetchPendingInvitations();
  }, []);

  const handleResponse = async (invitationId: string, response: 'Approved' | 'Declined') => {
    setLoading(true);
    try {
      await respondToInvitation(invitationId, response);
      await fetchPendingInvitations(); // Refresh the invitations list
    } catch (error) {
      console.error('Error responding to invitation:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const renderInvitation = ({ item }) => (
    <View style={[
      styles.invitationItem,
      item.status === 'Approved' && styles.approvedInvitation,
      item.status === 'Declined' && styles.declinedInvitation
    ]}>
      <Text>Team Invitation</Text>
      <Text>Team ID: {item.teamId}</Text>
      <Text>Status: {item.status}</Text>
      {item.status === 'Pending' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.responseButton, styles.approveButton]}
            onPress={() => handleResponse(item.id, 'Approved')}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.responseButton, styles.declineButton]}
            onPress={() => handleResponse(item.id, 'Declined')}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <>
      <TouchableOpacity style={styles.floatingButton} onPress={() => setModalVisible(true)}>
        <Icon name="notifications" size={24} color="white" />
        {pendingInvitations.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingInvitations.length}</Text>
          </View>
        )}
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Team Invitations</Text>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            <FlatList
              data={pendingInvitations}
              renderItem={renderInvitation}
              keyExtractor={item => item.id}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: -10,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  invitationItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  approvedInvitation: {
    backgroundColor: '#e6ffe6',
  },
  declinedInvitation: {
    backgroundColor: '#ffe6e6',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  responseButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  approveButton: {
    backgroundColor: 'green',
  },
  declineButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NotificationButton;