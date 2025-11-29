import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function NotesRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notes Module</Text>
      <Text style={styles.subText}>Member C Workspace</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' },
  subText: { color: 'gray', marginTop: 10 }
});