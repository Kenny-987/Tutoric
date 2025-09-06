import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

// Example: you’ll pass the session data via params or fetch from API
const mockSession = {
  id: 2,
  title: "Mathematics",
  event_type: "lesson",
  date: "2025-08-29T22:00:00.000Z",
  start_time: "Invalid Date",
  end_time: "Invalid Date",
  hourly_rate: "40.00",
  payment_status: "unpaid",
  payment_amount: "0.00",
  notes: "",
};

export default function SessionDetails() {
  const { id } = useLocalSearchParams(); // if you pass id from calendar
  const router = useRouter();

  // You could fetch actual session details by `id`
  const session = mockSession;

  const handleEdit = () => {
    router.push(`/edit-session/${session.id}`); // navigate to edit screen
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Session",
      "Are you sure you want to delete this session?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => console.log("Deleted", session.id) },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity onPress={()=>router.back()}>
            <Text>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{session.title}</Text>
        <Text style={styles.type}>{session.event_type.toUpperCase()}</Text>

        <View style={styles.row}>
          <MaterialIcons name="calendar-today" size={20} color="#64748b" />
          <Text style={styles.info}>
            {new Date(session.date).toLocaleDateString()}{" "}
          </Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="access-time" size={20} color="#64748b" />
          <Text style={styles.info}>
            {session.start_time !== "Invalid Date" ? session.start_time : "TBD"}{" "}
            - {session.end_time !== "Invalid Date" ? session.end_time : "TBD"}
          </Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="attach-money" size={20} color="#64748b" />
          <Text style={styles.info}>Rate: ${session.hourly_rate}/hr</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="payment" size={20} color="#64748b" />
          <Text style={[styles.info, session.payment_status === "unpaid" ? styles.unpaid : styles.paid]}>
            {session.payment_status} (${session.payment_amount})
          </Text>
        </View>

        {session.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesHeader}>Notes</Text>
            <Text style={styles.notes}>{session.notes}</Text>
          </View>
        ) : null}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleEdit}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4, color: "#0f172a" },
  type: { fontSize: 14, color: "#64748b", marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  info: { marginLeft: 8, fontSize: 16, color: "#334155" },
  unpaid: { color: "#dc2626", fontWeight: "bold" },
  paid: { color: "#16a34a", fontWeight: "bold" },
  notesBox: { marginTop: 12, padding: 12, backgroundColor: "#f1f5f9", borderRadius: 8 },
  notesHeader: { fontWeight: "bold", marginBottom: 4, color: "#0f172a" },
  notes: { color: "#475569" },
  actions: { flexDirection: "row", justifyContent: "space-between" },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 6,
  },
  editButton: { backgroundColor: "#0284c7" },
  deleteButton: { backgroundColor: "#dc2626" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
