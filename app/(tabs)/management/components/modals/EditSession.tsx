import React, { useState,useEffect } from 'react';
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
  Button
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { colors } from '@/styles/styles';
import {MaterialIcons,Ionicons, FontAwesome} from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


const EditSessionModal = ({  visible,  onClose,  session, setSessions, student}:any) => {

  const student_id = student?.id || session.student_id; 
const session_id = session.id; 




  const [event_type,setEventType] = useState<string>(session.event_type)
  const [title,setTitle] = useState<string>(session.title)
  const [date,setDate] = useState<Date | null>(null)
  const [start_time, setStartTime] = useState<Date | null>(null);
  const [end_time, setEndTime] = useState<Date | null>(null);
  const [duration,setDuration] = useState<any>(session.duration)
  const [hourly_rate,setHourlyRate] = useState(student?.hourly_rate|| session.hourly_rate || '0.00') // Default to 0.00 if not set
  const [payment_amount,setPaymentAmount] = useState(session.payment_amount)
  const [payment_status,setPaymentStatus] = useState(session.payment_status)
  const [completion_status,setCompletionStatus]=useState(session.completion_status)
  const [notes,setNotes] = useState(session.notes)

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const [isPickerVisible, setPickerVisible] = useState(false);
  const [mode, setMode] = useState<"start" | "end" | null>(null);

  const [isTimeCorrect,setIsTimeCorrect]=useState(true)


  const eventTypes = ['lesson', 'consultation', 'assessment', 'review'];
  const completionStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
  const paymentStatuses = ['unpaid', 'paid', 'pending', 'refunded'];


  const parseDatasetDate = (dateString: string): Date => {
    if (dateString.includes('T')) {
      // Handle ISO string with timezone (e.g., "2025-08-28T22:00:00.000Z")
      // The database stored a DATE but it got converted to UTC timestamp
      const utcDate = new Date(dateString);
      
      // Get UTC components and add 1 day to get the original date
      const year = utcDate.getUTCFullYear();
      const month = utcDate.getUTCMonth();
      const day = utcDate.getUTCDate();
      
      // Create local date with the corrected day
      return new Date(year, month, day + 1);
    } else {
      // Handle simple date string (e.g., "2025-08-29")
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
  };
  
  // UPDATED combineDateAndTime function:
  // Also update this function to handle the corrected date:
  
  const combineDateAndTime = (dateString: string, timeString: string): Date => {
    let year, month, day;
    
    if (dateString.includes('T')) {
      // Handle ISO string - extract UTC date and add 1 day
      const utcDate = new Date(dateString);
      year = utcDate.getUTCFullYear();
      month = utcDate.getUTCMonth();
      day = utcDate.getUTCDate() + 1; // Add 1 to get original date
    } else {
      // Handle simple date string
      [year, month, day] = dateString.split("-").map(Number);
      month = month - 1; // Adjust for 0-based months
    }
    
    const [hours, minutes] = timeString.split(":").map(Number);
    return new Date(year, month, day, hours, minutes, 0, 0);
  };

  // const combineDateAndTime = (dateString: string, timeString: string): Date => {


  useEffect(() => {
    setStartTime(combineDateAndTime(session.date, session.start_time));
    setEndTime(combineDateAndTime(session.date, session.end_time));
    setDate(parseDatasetDate(session.date))
  }, []);

const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    hideDatePicker();
  };


  const showPicker = (type: "start" | "end") => {
    setMode(type);
    setPickerVisible(true);
  };

  const hidePicker = () => setPickerVisible(false);

  const handleConfirmTime = (selectedTime: Date) => {
    if (mode === "start") setStartTime(selectedTime);
    if (mode === "end") setEndTime(selectedTime);
    hidePicker();
  };

  // Calculate duration in hours + minutes
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
  }, [start_time, end_time]); // ✅ only runs when times change


  const start = new Date(String(start_time));
  const end = new Date(String(end_time));
  
  // Format to local time, only hours + minutes
  const startLocal = start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }) || null;
  const endLocal = end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })|| null;
  

  const validateForm = () => {
    if (!date) {
      Alert.alert('Error', 'Please Enter a Date');
      return false;
    }
    if (title.trim()=='') {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if(!isTimeCorrect){
      Alert.alert('Error', 'Please enter a proper times');
      return false;
    }
    return true;
  };

  const handleSubmit = async() => {
    if (!validateForm()) return;

    try {
      const token = await SecureStore.getItemAsync('token')
      
      const data = {event_type,title,date,startLocal,endLocal,duration,hourly_rate,payment_amount,completion_status,payment_status,notes,student_id,session_id:session.id}
      const response = await axios.patch('http://10.182.90.139:3000/sessions/edit',data,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if(response.status===200){
        console.log('data saved');
        setSessions((prev:any) => 
            prev.map((session:any) => 
              session.id === session_id 
                ? { ...session, ...response.data }
                : session
            )
          );
        onClose();
      }
    } catch (error) {
      console.log(error);
      
    }

  };


  const handleClose = () => {
    onClose();
  };

  const formatDateTime = (date:any) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Session</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>

            <Text style={styles.studentName}>Editing session with {student?.full_name|| session.full_name}</Text>
          {/* Event Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={event_type}
                onValueChange={(value) => setEventType(value)}
                style={styles.picker}
              >
                {eventTypes.map((type) => (
                  <Picker.Item 
                    key={type} 
                    label={type.charAt(0).toUpperCase() + type.slice(1)} 
                    value={type} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={(value) => setTitle(value)}
              placeholder="Enter session title"
              placeholderTextColor="#999"
            />
          </View>

                {/* DATE   */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={showDatePicker}
            >
              <Text>{date ? date.toDateString() : "No date selected"}</Text>
              
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
            </TouchableOpacity>
          </View>
      <View style={styles.timesContainer}>
        <View style={styles.timeContainer}>
        <TouchableOpacity style={styles.timeButton} onPress={()=>showPicker('start')}>
        <Text style={styles.timeText}>Pick Start Time</Text>
      </TouchableOpacity>
      <Text style={styles.times}>
        Start: {start_time? start_time.toLocaleTimeString() : "Not set"}
      </Text>
        </View>
      <View>
      <TouchableOpacity style={styles.timeButton} onPress={()=>showPicker('end')}>
        <Text style={styles.timeText}>Pick End Time</Text>
      </TouchableOpacity>
      <Text style={styles.times} >End: {end_time ? end_time.toLocaleTimeString() : "Not set"}</Text>
      </View>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={hidePicker}
      />
    </View>

          {/* Duration Display */}
          <View style={[styles.inputGroup,{marginTop:10}]}>
          
            <Text style={styles.label}>Duration</Text>
            {isTimeCorrect && 
            <Text style={styles.durationText}>{duration}</Text>
            }
            
            {!isTimeCorrect && (
        <Text style={{ color: "red", fontSize:16 }}>
          <FontAwesome name="warning" size={16} color="red" /> End
          time is earlier than start time!
        </Text>
      )}
          </View>

          {/* Hourly Rate */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hourly Rate</Text>
            <TextInput
              style={styles.textInput}
              value={hourly_rate}
              onChangeText={(value) => setHourlyRate(value)}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>


          {/* Completion Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Completion Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={completion_status}
                onValueChange={(value) => setCompletionStatus( value)}
                style={styles.picker}
              >
                {completionStatuses.map((status) => (
                  <Picker.Item 
                    key={status} 
                    label={status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)} 
                    value={status} 
                  />
                ))}
              </Picker>
            </View>
          </View>


          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={(value) => setNotes( value)}
              placeholder="Add any additional notes..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    zIndex: 1000, // Ensure modal is on top
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6c757d',
  },
  saveButton: {
    backgroundColor:colors.primaryLight,
    padding:8,
    borderRadius:8
  },
  saveText:{
    fontWeight:700
  },
  form: {
    flex: 1,
    paddingHorizontal: 10,
  },
  studentName:{
    textAlign:'center',
    fontSize:18,
    fontWeight:700,
    marginTop:10,
    marginBottom:10
  },
  inputGroup: {
    marginBottom: 24,
    backgroundColor:colors.greyBg,
    padding:8,
    borderRadius:10
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: colors.textPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 100,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 50,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  durationText: {
    fontSize: 16,
    color: colors.textMuted,
    fontStyle: 'italic',
    fontWeight:'600'
    // paddingVertical: 8,
  },
  timesContainer:{
    backgroundColor:colors.lightBg
  },
  timeContainer:{
    marginBottom:12
  },
  timeButton:{
    backgroundColor:colors.textDark,
  width:120,
  padding:6,
  borderRadius:8
  },
  timeText:{
    textAlign:'center',
    fontSize:16,
    fontWeight:'700',
    color:"#fff"
  },
  times:{
    fontSize:18,
    marginLeft:10,
    color:colors.textMuted
  }
});

export default EditSessionModal;