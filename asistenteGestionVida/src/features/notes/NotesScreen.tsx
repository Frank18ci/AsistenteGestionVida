import { ScrollView, StyleSheet, Text } from "react-native";

export default function NotesScreen() {
    
    return(
        <ScrollView>
            <Text>Notes Screen</Text>
        </ScrollView>
    )
    
}


const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' },
  subText: { color: 'gray', marginTop: 10 }
});