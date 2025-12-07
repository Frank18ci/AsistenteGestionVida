import { initDatabase } from '@/src/database/database';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Keyboard, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Note {
  id: number;
  title?: string;
  content: string;
  createdAt: string;
}


const THEME_COLORS = {
  background: '#F0F8FF', 
  darkBlue: '#1a3b5d',   
  white: '#FFFFFF',
  text: '#333333',
};

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotes = async () => {
    try {
      const db = await SQLite.openDatabaseAsync('asistente.db');
      const allRows = await db.getAllAsync('SELECT * FROM notes ORDER BY id DESC');
      setNotes(allRows as Note[]);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await initDatabase();
      fetchNotes();
    };
    initialize();
  }, []);

  const addNote = async () => {
    if (newNote.trim() === '') {
      Alert.alert('Error', 'El contenido de la nota no puede estar vacío');
      return;
    }

    try {
      const db = await SQLite.openDatabaseAsync('asistente.db');
      const createdAt = new Date().toISOString();
      
      // Logic: If title is empty, we save it as empty string or null in DB.
      // But for display purposes, we can handle it in render.
      // Or we can generate a default title here.
      // User request: "si no pone el titulo que se guarde automatico como 'NOTA 1'"
      // Let's generate it here to persist it.
      let titleToSave = newTitle.trim();
      if (!titleToSave) {
        titleToSave = `Nota ${notes.length + 1}`;
      }

      await db.runAsync('INSERT INTO notes (title, content, createdAt) VALUES (?, ?, ?)', titleToSave, newNote, createdAt);
      
      setNewTitle('');
      setNewNote('');
      Keyboard.dismiss();
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', 'Could not save note');
    }
  };

  const deleteNote = async (id: number) => {
    Alert.alert(
      "Eliminar Nota",
      "¿Estás seguro de que quieres eliminar esta nota?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              const db = await SQLite.openDatabaseAsync('asistente.db');
              await db.runAsync('DELETE FROM notes WHERE id = ?', id);
              fetchNotes();
            } catch (error) {
              console.error('Error deleting note:', error);
            }
          }
        }
      ]
    );
  };

  
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(note => 
      (note.content && note.content.toLowerCase().includes(query)) || 
      (note.title && note.title.toLowerCase().includes(query))
    );
  }, [notes, searchQuery]);

  const renderItem = ({ item }: { item: Note }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title || `Nota ${item.id}`}
        </Text>
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <Ionicons name="trash-outline" size={18} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardContent}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>MY NOTES</Text>
        <Text style={styles.headerSubtitle}>TO FULFILL ALL</Text>
      </View>

      {}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={THEME_COLORS.darkBlue} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar notas..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {}
      <View style={styles.inputSection}>
        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabelText}>New note</Text>
        </View>
        <View style={styles.inputsContainer}>
           <TextInput
            style={styles.titleInput}
            placeholder="Título:"
            placeholderTextColor="#999"
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={styles.contentInput}
            placeholder="Escribe tu nota aquí..."
            placeholderTextColor="#999"
            value={newNote}
            onChangeText={setNewNote}
            multiline
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addNote}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Notes Grid */}
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay notas aún.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: THEME_COLORS.darkBlue,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed', 
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 2,
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: THEME_COLORS.text,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  inputLabelContainer: {
    backgroundColor: THEME_COLORS.darkBlue,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    height: 100, 
    justifyContent: 'center',
  },
  inputLabelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inputsContainer: {
    flex: 1,
    height: 100,
  },
  titleInput: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME_COLORS.darkBlue,
  },
  contentInput: {
    backgroundColor: 'white',
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlignVertical: 'top',
    fontSize: 14,
    color: THEME_COLORS.text,
  },
  addButton: {
    backgroundColor: THEME_COLORS.darkBlue,
    height: 100,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    width: '100%', 
    marginBottom: 15,
    borderRadius: 0, // Changed to 0 to match the "sharp" look in the image if desired, or keep 8. The image has sharp corners on the header but maybe rounded on the card? The image looks like simple rectangles. Let's keep it simple.
    overflow: 'hidden',
    borderWidth: 2, // Thicker border as per image style
    borderColor: THEME_COLORS.darkBlue,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    backgroundColor: THEME_COLORS.darkBlue,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
    marginRight: 5,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
  },
  cardBody: {
    padding: 10,
    minHeight: 80,
    backgroundColor: 'white',
  },
  cardContent: {
    fontSize: 14,
    color: THEME_COLORS.text,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});
