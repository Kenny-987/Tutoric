import { colors } from '@/styles/styles';
import axios from 'axios';
import React, { useState, useMemo, useEffect, useCallback,useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons, Feather,FontAwesome } from '@expo/vector-icons';
import CreateSession from '../management/components/modals/CreateSession';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import EditSessionModal from '../management/components/modals/EditSession';



const formatDate = (date:any) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const useCalendar = (initialDate:any) => {
  const [currentDate, setCurrentDate] = useState<any>(initialDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return { currentDate, year, month, daysInMonth, startingDayOfWeek, goToPreviousMonth, goToNextMonth, monthName };
};

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessionsData, setSessionsData] = useState<any>({});
  const { year, month, daysInMonth, startingDayOfWeek, goToPreviousMonth, goToNextMonth, monthName } = useCalendar(new Date());

  const selectedDateString = useMemo(() => formatDate(selectedDate), [selectedDate]);
  const todayString = useMemo(() => formatDate(new Date()), []);

  const selectedDaySessions = sessionsData[selectedDateString] || [];
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '70%'], []);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [addSession,setAddSession]=useState(false)

    const getSessions = async()=>{
      const token = await SecureStore.getItemAsync('token');
    try {
      const response = await axios.get('http://10.182.90.139:3000/sessions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.status === 200) {
        console.log("sessions", response.data);
        
        // Transform API data to calendar format
        const transformedSessions:any = {};
        
        response.data.forEach((session:any) => {
          // Convert UTC date to local date string
          const sessionDate = new Date(session.date);
          const dateKey = formatDate(sessionDate);
          
          // Format time display
          let timeDisplay = 'TBD';
          if (session.start_time && session.start_time !== 'Invalid Date') {
            if (session.end_time && session.end_time !== 'Invalid Date') {
              timeDisplay = `${session.start_time} - ${session.end_time}`;
            } else {
              timeDisplay = session.start_time;
            }
          }
          
          const calendarSession = {
            id: session.id.toString(),
            time: timeDisplay,
            title: session.title,
            // Optional: add more fields if needed
            duration: session.duration,
            status: session.completion_status,
            paymentStatus: session.payment_status
          };
          
          // Group sessions by date
          if (!transformedSessions[dateKey]) {
            transformedSessions[dateKey] = [];
          }
          transformedSessions[dateKey].push(calendarSession);
        });
        
        setSessionsData(transformedSessions);
      } else {
        alert('Something went wrong fetching students ' + response.statusText)
      }
    } catch (error) {
      console.error(error)
    } finally {
      // setLoading(false)
    }
    }
 
    useFocusEffect(
      useCallback(() => {
        getSessions();
      }, [])
    );


  const openSessionDetails = async (sessionId:string) => {
    setSelectedSession(null);
    setLoadingSession(true);
    bottomSheetRef.current?.snapToIndex(1); // Open bottom sheet

    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`http://10.182.90.139:3000/sessions/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        console.log(response.data);
        
        setSelectedSession(response.data);
      } else {
        Alert.alert('Error', 'Failed to fetch session details');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch session details');
    } finally {
      setLoadingSession(false);
    }
  };
  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<View key={`blank-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = formatDate(date);
      const hasSession = sessionsData[dateString]?.length > 0;
      const isSelected = dateString === selectedDateString;
      const isToday = dateString === todayString;

      days.push(
        <View key={day} style={styles.dayCell}>
          <TouchableOpacity
            style={[
              styles.dayButton,
              isSelected && styles.selectedDay,
              isToday && !isSelected && styles.today,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text style={{ color: isSelected ? 'white' : 'white' }}>{day}</Text>
            {hasSession && <View style={styles.sessionDot} />}
          </TouchableOpacity>
        </View>
      );
    }
    return days;
  };


  return (
    <>
          {showEdit && 
<EditSessionModal
  session={selectedSession}
  visible={showEdit}
  student
  onClose={() => setShowEdit(false)}
  />}
  {addSession &&
    <CreateSession
    visible={addSession}
    onClose={() => setAddSession(false)}
  
    />
  }

      <GestureHandlerRootView style={{flex:1}}>

<View style={styles.container}>


  
      {/* <CreateSession/> */}
      <View style={styles.heading}>
        <Text style={styles.headingText}>My Schedule</Text>
      </View>
      <View style={styles.calendarContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{monthName} {year}</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
              <Text style={styles.navText}>◀</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
              <Text style={styles.navText}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.weekDays}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <Text key={d} style={styles.weekDayText}>{d}</Text>)}
        </View>

        <View style={styles.daysGrid}>
          {renderCalendarDays()}
        </View>
      </View>

      <View style={styles.sessionsContainer}>
      <View style={styles.sessionsHeaderContainer}>
          <Text style={styles.sessionsHeader}>Activities for {selectedDateString}</Text>
          <TouchableOpacity 
            style={styles.addSessionButton} 
            onPress={() => setAddSession(true)}
          >
            <Text style={styles.addSessionButtonText}>+ Add Session</Text>
          </TouchableOpacity>
        </View>
  
  <ScrollView style={styles.sessionsList}>
    {selectedDaySessions.length > 0 ? selectedDaySessions.map((item:any) => (
      <TouchableOpacity key={item.id} style={styles.sessionItem} onPress={()=>openSessionDetails(item.id)}>
          <View >
        <Text style={styles.sessionTime}><FontAwesome name='clock-o'/> {item.time}</Text>
        <Text style={styles.sessionTitle}>{item.title}</Text>
      </View>
      </TouchableOpacity>
      
    )) : (
      <View style={styles.noSessions}>
        <Text style={{ color: 'grey' }}>No sessions scheduled for this day.</Text>
      </View>
    )}
  </ScrollView>


</View>
{/* Bottom Sheet */}
<BottomSheet 
  ref={bottomSheetRef} 
  index={-1} 
  snapPoints={snapPoints} 
  enablePanDownToClose 
  backgroundStyle={{ backgroundColor: colors.greyBg }}
  handleIndicatorStyle={{ backgroundColor: '#000' }}
  backdropComponent={(props) => (
    <BottomSheetBackdrop 
      {...props} 
      disappearsOnIndex={-1} 
      appearsOnIndex={0}
      opacity={0.5}
    />
  )}
>
  {loadingSession ? (
    <BottomSheetView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size='large' color={colors.textDark}/>
      <Text>Loading...</Text>
    </BottomSheetView>
  ) : selectedSession ? (
    <BottomSheetView style={styles.buttonView}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{selectedSession.title}</Text>
      <Text style={{ fontSize: 16, marginBottom: 4 }}>Time: {selectedSession.start_time} - {selectedSession.end_time}</Text>
      <Text style={{ fontSize: 16, marginBottom: 4 }}>Student: {selectedSession.student_name?selectedSession.full_name: 'N/A'}</Text>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>Notes: {selectedSession.notes || 'No notes'}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          style={[styles.addSessionButton, { flex: 1, marginRight: 6, backgroundColor: '#0284c7' }]}
          onPress={() => {setShowEdit(true); bottomSheetRef.current?.close()}}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addSessionButton, { flex: 1, marginLeft: 6, backgroundColor: '#dc2626' }]}
          onPress={() => Alert.alert(
            'Delete Session',
            `Are you sure you want to delete ${selectedSession.title}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => console.log('Deleted', selectedSession.id) }
            ]
          )}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetView>
  ) : (
    <BottomSheetView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>No session selected</Text>
    </BottomSheetView>
  )}
</BottomSheet>
    </View>
    </GestureHandlerRootView>
    </>
  
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, 
    backgroundColor: "#fff", 
    padding: 10, 
    paddingTop: 20 ,
  },
  heading:{

  },
  headingText:{
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  calendarContainer: { 
    backgroundColor: colors.primaryBlue,
    borderRadius: 20, 
    padding: 10 
    },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10 
  },
  headerText: { color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold'
   },
  navButton: { 
    marginHorizontal: 5,
     padding: 5 
    },
  navText: { 
    color: 'white', 
    fontSize: 18 
  },
  weekDays: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 5,
    //  borderWidth:1,
    borderColor:'red'
  },
  weekDayText: { 
    color: colors.lightBg, 
    width: '14.28%', // 100% / 7 days = 14.28%
    textAlign: 'center' ,
    // borderWidth:1,
    borderColor:'white'
  }
    ,
  daysGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
     justifyContent: 'flex-start',
    //  borderWidth:1,
    borderColor:'red'
  },
  dayCell: {
    width: '14.28%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center', // add this
    paddingVertical: 2,
    //  borderWidth:1,
    borderColor:'red'
    // position: 'relative',
  },
  dayButton: {
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: colors.grey3
  },
  selectedDay: { 
    backgroundColor: colors.primary 
  },
  today: { 
    borderWidth: 1, 
    borderColor: colors.primaryLight 
  },
  sessionDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: colors.primaryLight, 
    position: 'absolute', 
    bottom: 2 
  },
  sessionsContainer: { 
    flex: 1, 
    marginTop: 20 
  },
  sessionsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionsHeader: { 
    color: colors.textPrimary, 
    fontSize: 18, 
    fontWeight: '600',
    flex: 1,
  },

  sessionsList: { 
    flex: 1 
  },
  sessionItem: { 
    flexDirection: 'row', 
    gap:6,
    padding: 16, 
    marginBottom: 8, 
    backgroundColor:colors.lightGreen, 
    borderRadius: 8 ,
    borderColor:colors.primaryLight,
    borderWidth:1
  },
  sessionTime: { 
    // width: 80, 
    color:colors.textMuted, 
    fontWeight: 'bold',
  },
  sessionTitle: { 
    flex: 1, 
    color: colors.textDark,
    fontWeight:700 
  },
  noSessions: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 100 
  },
  addSessionButton: {
    padding: 8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  addSessionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonView:{
    flex: 1, 
    padding:20
    // backgroundColor: colors.primaryBlue,
  }
});
