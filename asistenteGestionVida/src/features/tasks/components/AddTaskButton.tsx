import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface Props {
  open: () => void;
}

export default function AddTaskButton({ open }: Props) {
  return (
    <TouchableOpacity style={styles.btn} onPress={open}>
      <Text style={styles.text}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
});
