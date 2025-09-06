import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { colors } from '@/styles/styles';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const CreateSession = ({ visible, onClose, onSubmit, student }: any) => {
  const student_id = student.id
  const [event_type, setEventType] = useState<string>("lesson")
  const [title, setTitle] = useState<string>("")
  const [date, setDate] = useState(new Date())
  const [start_time, setStartTime] = useState<Date | null>(null);
  const [end_time, setEndTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<any>(null)
  const [hourly_rate, setHourlyRate] = useState<any>(student.hourly_rate)
  const [payment_amount, setPaymentAmount] = useState("")
  const [payment_status, setPaymentStatus] = useState('unpaid')
  const [completion_status, setCompletionStatus] = useState('scheduled')
  const [notes, setNotes] = useState("")

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<"start" | "end" | null>(null);
  const [isTimeCorrect, setIsTimeCorrect] = useState(true)

  const eventTypes = ['lesson', 'consultation', 'assessment', 'review'];
  const completionStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];


  // Date picker handlers
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  // Time picker handlers
  const showTimePicker = (mode: "start" | "end") => {
    setTimePickerMode(mode);
    setTimePickerVisibility(true);
  };
  const hideTimePicker = () => setTimePickerVisibility(false);
  const handleTimeConfirm = (selectedTime: Date) => {
    if (timePickerMode === "start") setStartTime(selectedTime);
    if (timePickerMode === "end") setEndTime(selectedTime);
    hideTimePicker();
  };

  // Calculate duration
  useEffect(() => {
    if (!start_time || !end_time) {
      setDuration(null);
      return;
    }

    const diffMs = end_time.getTime() - start_time.getTime();

    if (diffMs < 0) {
      setIsTimeCorrect(false);
      setDuration(null);
    } else {
      setIsTimeCorrect(true);
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      setDuration(`${hours}h ${minutes}m`);
    }
  }, [start_time, end_time]);

  const formatTime = (time: Date | null) => {
    if (!time) return null;
    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const validateForm = () => {
    if (!date) {
      Alert.alert('Error', 'Please select a date');
      return false;
    }
    if (title.trim() === '') {
      Alert.alert('Error', 'Please enter a session title');
      return false;
    }
    if (!isTimeCorrect) {
      Alert.alert('Error', 'End time must be after start time');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const token = await SecureStore.getItemAsync('token')
      const startLocal = formatTime(start_time);
      const endLocal = formatTime(end_time);

      const data = {
        event_type, title, date, startLocal, endLocal, duration,
        hourly_rate, payment_amount, completion_status, payment_status, notes, student_id
      }

      const response = await axios.post('http://10.182.90.139:3000/sessions/create', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 200) {
        console.log('Session created successfully');
        onClose();
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to create session. Please try again.');
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return 'school';
      case 'consultation': return 'chat';
      case 'assessment': return 'assignment';
      case 'review': return 'rate-review';
      default: return 'event';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#718096" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>New Session</Text>
            <Text style={styles.subtitle}>with {student.full_name}</Text>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Session Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Type</Text>
            <View style={styles.typeGrid}>
              {eventTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeCard,
                    event_type === type && styles.selectedTypeCard
                  ]}
                  onPress={() => setEventType(type)}
                >
                  <MaterialIcons
                    name={getEventTypeIcon(type)}
                    size={24}
                    color={event_type === type ? colors.primary : '#718096'}
                  />
                  <Text style={[
                    styles.typeText,
                    event_type === type && styles.selectedTypeText
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Algebra Review Session"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
                <MaterialIcons name="calendar-today" size={20} color="#718096" />
                <Text style={styles.dateText}>
                  {date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#718096" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time</Text>
            
            <View style={styles.timeRow}>
              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => showTimePicker('start')}
                >
                  <MaterialIcons name="access-time" size={18} color="#718096" />
                  <Text style={styles.timeButtonText}>
                    {start_time ? formatTime(start_time) : 'Select time'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timeSeparator}>
                <MaterialIcons name="arrow-forward" size={16} color="#CBD5E0" />
              </View>

              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>End Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => showTimePicker('end')}
                >
                  <MaterialIcons name="access-time" size={18} color="#718096" />
                  <Text style={styles.timeButtonText}>
                    {end_time ? formatTime(end_time) : 'Select time'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Duration Display */}
            {duration && isTimeCorrect && (
              <View style={styles.durationContainer}>
                <MaterialIcons name="timer" size={16} color={colors.primary} />
                <Text style={styles.durationText}>Duration: {duration}</Text>
              </View>
            )}

            {!isTimeCorrect && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={16} color="#EF4444" />
                <Text style={styles.errorText}>End time must be after start time</Text>
              </View>
            )}
          </View>

          {/* Payment Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment</Text>
            
            <View style={styles.paymentRow}>
              <View style={styles.rateContainer}>
                <Text style={styles.label}>Hourly Rate</Text>
                <View style={styles.currencyInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.rateInput}
                    value={hourly_rate}
                    onChangeText={setHourlyRate}
                    placeholder="0.00"
                    placeholderTextColor="#A0AEC0"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Session Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusGrid}>
              {completionStatuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusCard,
                    completion_status === status && styles.selectedStatusCard
                  ]}
                  onPress={() => setCompletionStatus(status)}
                >
                  <Text style={[
                    styles.statusCardText,
                    completion_status === status && styles.selectedStatusText
                  ]}>
                    {status.replace('_', ' ').charAt(0).toUpperCase() + 
                     status.replace('_', ' ').slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add session notes, objectives, or reminders..."
              placeholderTextColor="#A0AEC0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Date Time Pickers */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
        />

        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={hideTimePicker}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Enhanced Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Form Structure
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },

  // Event Type Grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTypeCard: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.lightGreen,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#718096',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedTypeText: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Input Groups
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Date Button
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 12,
  },

  // Time Selection
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeButtonText: {
    fontSize: 15,
    color: '#2D3748',
    marginLeft: 8,
    fontWeight: '500',
  },
  timeSeparator: {
    alignItems: 'center',
    paddingTop: 28,
  },

  // Duration Display
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  durationText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 8,
  },

  // Payment Section
  paymentRow: {
    flexDirection: 'row',
    gap: 16,
  },
  rateContainer: {
    flex: 1,
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '600',
    paddingLeft: 16,
  },
  rateInput: {
    flex: 1,
    padding: 16,
    paddingLeft: 8,
    fontSize: 16,
    color: '#2D3748',
  },
  paymentStatusContainer: {
    flex: 1,
  },
  statusPicker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    height: 52,
  },

  // Status Grid
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedStatusCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  statusCardText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#718096',
    textAlign: 'center',
  },
  selectedStatusText: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Notes Input
  notesInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  bottomSpacer: {
    height: 40,
  },
});

export default CreateSession