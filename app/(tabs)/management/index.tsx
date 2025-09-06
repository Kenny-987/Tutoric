import { StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput, FlatList, ActivityIndicator, Linking } from 'react-native'
import React, { useEffect, useState, useCallback, use } from 'react'
import { colors } from '@/styles/styles'
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import AddStudentModal from './components/modals/AddStudentModal';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import CreateSession from './components/modals/CreateSession';



export default function Management() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addSession,setAddSession]=useState(false)
  const [students, setStudents] = useState<any>([])
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [student,setStudent]=useState(null)



  const fetchStudents = async () => {
    console.log('fetching...');
    setLoading(true)
    const token = await SecureStore.getItemAsync('token');
    try {
      const response = await axios.get('http://10.182.90.139:3000/students', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.status === 200) {
        console.log("student list", response.data);
        setStudents(response.data)
      } else {
        alert('Something went wrong fetching students ' + response.statusText)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  }, []);

  const filters = [
    { name: 'All', count: 12 },
    { name: 'Active', count: 10 },
    { name: 'Unpaid', count: 3 },
    { name: 'Recent', count: 5 }
  ]

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    )
  }

  const handleAddSession=(student:any)=>{
    setStudent(student)
    console.log('why');
    
    setAddSession(true)
  }

  function formatDate(dateString:any) {
    if(dateString === null || dateString === undefined) return 'Not scheduled';
    const date = new Date(dateString); // parses UTC string
    return date.toLocaleString(undefined, {
      weekday: "short",   // Thu
      year: "numeric",    // 2025
      month: "short",     // Aug
      day: "numeric",     // 21
    });
  }
  const renderStudentCard = ({ item }: { item: typeof students[0] }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/management/${item.id}`)}
      style={styles.studentCard}
      activeOpacity={0.7}
    >
      {/* Student Avatar & Info */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.full_name?.split(' ').map((n:any) => n[0]).join('').toUpperCase() || 'S'}
            </Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName} numberOfLines={1}>{item.full_name}</Text>
            <View style={styles.subjectContainer}>
              <Text style={styles.studentSubject}>{item.subject}</Text>
              <View style={styles.dot} />
              <Text style={styles.studentGrade}>{item.grade}</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.statusBadge, item.status === "Active" ? styles.activeStatus : styles.inactiveStatus]}>
          <Text style={[styles.statusText, item.status === "Active" ? styles.activeStatusText : styles.inactiveStatusText]}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Session Info */}
      <View style={styles.sessionInfo}>
        <MaterialIcons name="calendar-month" size={16} color="#64748B" />
        <Text style={styles.sessionText}>Next session: {formatDate(item.date)|| 'Not scheduled'}</Text>
      </View>

      {/* Contact Actions */}
      <View style={styles.contactActions}>
        {(item.parent_phone || item.phone )&& 
          <TouchableOpacity style={styles.contactButton} onPress={()=>{
            if(item.is_minor && item.phone){
              Linking.openURL(`tel:${item.parent_phone}`)
          }else{
            Linking.openURL(`tel:${item.phone}`)
          }
          
          }}>
            <MaterialIcons name="call" size={18} color="#64748B" />
          </TouchableOpacity>}

        {(item.parent_email || item.email) &&
        <TouchableOpacity style={styles.contactButton} onPress={()=>{
          if(item.is_minor && item.parent_email!==''){
            Linking.openURL(`mailto:${item.parent_email}`)
          }else{
            Linking.openURL(`mailto:${item.email}`)
        }}}>
        <MaterialIcons name="email" size={18} color="#64748B" />
      </TouchableOpacity>
        }
        
        <TouchableOpacity style={styles.scheduleButton} onPress={()=>handleAddSession(item)}>
          <MaterialIcons name="calendar-today" size={16} color="#fff" />
          <Text style={styles.scheduleButtonText}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Feather name="users" size={48} color="#CBD5E1" />
      </View>
      <Text style={styles.emptyTitle}>No students yet</Text>
      <Text style={styles.emptySubtitle}>Add your first student to get started</Text>
      <TouchableOpacity 
        style={styles.emptyActionButton}
        onPress={() => setIsModalVisible(true)}
      >
        <MaterialIcons name="add" size={20} color="#fff" />
        <Text style={styles.emptyActionText}>Add Student</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {isModalVisible && 
       <AddStudentModal
       visible={isModalVisible}
       onClose={() => setIsModalVisible(false)}
       setStudents={setStudents}
     />
      }
     
           {student && (
  <CreateSession
    visible={addSession}
    onClose={() => setAddSession(false)}
    student={student}
  />
)}
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Students</Text>
          <Text style={styles.subtitle}>Manage your students</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <MaterialIcons name="close" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      {/* <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity 
            key={filter.name}
            style={[
              styles.filterChip, 
              activeFilter === filter.name && styles.activeFilterChip
            ]}
            onPress={() => setActiveFilter(filter.name)}
          >
            <Text style={[
              styles.filterText, 
              activeFilter === filter.name && styles.activeFilterText
            ]}>
              {filter.name} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView> */}

      {/* Student List */}
      {students.length > 0 ? (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStudentCard}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '400',
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  searchIcon: {
    marginRight: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },

  clearButton: {
    padding: 4,
  },

  filterContainer: {
    marginBottom: 24,
  },

  filterContent: {
    paddingHorizontal: 20,
  },

  filterChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  activeFilterChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },

  filterText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  activeFilterText: {
    color: '#fff',
  },

  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },

  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  studentSubject: {
    fontSize: 14,
    color: '#64748B',
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },

  studentGrade: {
    fontSize: 14,
    color: '#64748B',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  activeStatus: {
    backgroundColor: '#DCFCE7',
  },

  inactiveStatus: {
    backgroundColor: '#FEF3C7',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  activeStatusText: {
    color: '#16A34A',
  },

  inactiveStatusText: {
    color: '#D97706',
  },

  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  sessionText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },

  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },

  scheduleButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },

  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },

  emptyActionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});