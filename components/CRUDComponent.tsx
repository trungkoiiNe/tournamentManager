import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Button, Card, Title, Paragraph, Dialog, Portal, TextInput } from 'react-native-paper';

export default function CRUDComponent({ title, fields, data, onAdd, onUpdate, onDelete, onFetch }) {
  const [visible, setVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [dialogMode, setDialogMode] = useState('add');

  useEffect(() => {
    onFetch();
  }, [onFetch]);

  const showDialog = (mode, item = null) => {
    setDialogMode(mode);
    setCurrentItem(item || {});
    setVisible(true);
  };

  const hideDialog = () => setVisible(false);

  const handleSave = () => {
    if (dialogMode === 'add') {
      onAdd(currentItem);
    } else {
      onUpdate(currentItem);
    }
    hideDialog();
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        {Object.entries(item).map(([key, value]) => (
          key !== 'id' && key !== 'name' && (
            <Paragraph key={key}>{`${key}: ${value}`}</Paragraph>
          )
        ))}
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => showDialog('edit', item)}>Edit</Button>
        <Button onPress={() => onDelete(item.id)}>Delete</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={() => showDialog('add')} style={styles.addButton}>
        Add New {title}
      </Button>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>{dialogMode === 'add' ? `Add New ${title}` : `Edit ${title}`}</Dialog.Title>
          <Dialog.Content>
            {fields.map((field) => (
              <TextInput
                key={field.name}
                label={field.label}
                value={currentItem ? currentItem[field.name] : ''}
                onChangeText={(text) => setCurrentItem({ ...currentItem, [field.name]: text })}
                style={styles.input}
              />
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={handleSave}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
});