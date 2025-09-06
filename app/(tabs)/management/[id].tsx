import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native'
import React, { useEffect, useState,useCallback } from 'react'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import CreateSession from './components/modals/CreateSession';
import Sessions from './components/tabs/Sessions';
import { SafeAreaView } from 'react-native-safe-area-context';
import EditStudent from './components/modals/EditStudent';


export default function StudentProfile() {
    const { id } = useLocalSearchParams();
    const [student, setStudent] = useState<any>({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editStudent,setEditStudent]=useState(false)
    const [activeTab, setActiveTab] = useState('overview')
    const [loading,setLoading] = useState(false)


    const fetchStudent = async () => {
        setLoading(true)
          const token = await SecureStore.getItemAsync('token')
          try {
              const response = await axios.get(`http://10.182.90.139:3000/students/student/${id}`, {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              })
              if (response.status === 200) {
                  console.log("this is student data",response.data);
                  setStudent(response.data)
              } else {
                  alert("Something went wrong " + response.statusText)
              }
          }
          catch (error) {
              console.error(error)
          }finally{
            setLoading(false)
          } 
      }
    useEffect(() => {

        fetchStudent()
    }, [])


    useFocusEffect(
        useCallback(() => {
          fetchStudent();
        }, [])
      );
    
if(loading){
  return <ActivityIndicator size={"large"} color={colors.primary}/>
}



    const formatDay = (day: any) => {
        const date = new Date(day);
        const formatted = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
        return formatted
    }

    const { full_name, subject, grade, created_at, is_minor, email, phone, hourly_rate, notes, address, age, status,parent_name,parent_email,parent_phone
    } = student
 
    const upcomingSessions=student.upcomingSessions || []
    return (
        <View style={styles.container}>
            <CreateSession
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                student={student}
            />
            <EditStudent
            visible={editStudent}
            onClose={() => setEditStudent(false)}
            student={student}
            setStudent={setStudent}
            />
            {/* Enhanced Header Section */}
            <View style={styles.headerWrapper}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editButton} onPress={()=>setEditStudent(true)}>
                        <MaterialIcons name="edit" size={20} color="#718096" />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {full_name?.split(' ').map((n:any) => n[0]).join('').toUpperCase() || 'S'}
                            </Text>
                        </View>

                    </View>

                    <View style={styles.studentInfo}>
                        <View style={styles.studentNameContainer}>
                        <Text style={styles.studentName}>{full_name} </Text>
                        <View style={styles.studentStatus}>
                            <Text style={styles.studentStatusText}>{status}</Text>
                        </View>
                        </View>
                        
                        <View style={styles.metaRow}>
                            <Text style={styles.metaText}>{subject}</Text>
                            <View style={styles.metaDot} />
                            <Text style={styles.metaText}>Grade/Level: {grade}</Text>
                            <View style={styles.metaDot} />
                            <Text style={styles.metaText}>Age {age}</Text>
                        </View>
                        <View style={styles.rateContainer}>
                            <MaterialIcons name="attach-money" size={16} color={colors.primary} />
                            <Text style={styles.hourlyRate}>{hourly_rate}/hour</Text>
                        </View>
                        <Text style={styles.joinDate}>Student since {formatDay(created_at)}</Text>
                    </View>
                </View>
            </View>

            {/* Enhanced Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    onPress={() => setActiveTab('overview')}
                    style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                >
                    <MaterialIcons 
                        name="dashboard" 
                        size={18} 
                        color={activeTab === 'overview' ? colors.primary : '#718096'} 
                    />
                    <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                        Overview
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'sessions' && styles.activeTab]}
                    onPress={() => setActiveTab('sessions')}
                >
                    <MaterialIcons 
                        name="event" 
                        size={18} 
                        color={activeTab === 'sessions' ? colors.primary : '#718096'} 
                    />
                    <Text style={[styles.tabText, activeTab === 'sessions' && styles.activeTabText]}>
                        Sessions
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'overview' && (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Quick Actions - Enhanced */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.actionGrid}>
                            <TouchableOpacity style={[styles.actionCard,{backgroundColor:'#EBF8FF'}]} onPress={() => setIsModalVisible(true)}>
                                <View style={[styles.actionIcon]}>
                                    <MaterialIcons name="calendar-today" size={20} color="#3182CE" />
                                </View>
                                <Text style={styles.actionText}>Add Session</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.actionCard,{backgroundColor:colors.lightGreen}]} 
                            onPress={() => router.push({
                                pathname:'/(tabs)/management/planner/lessons',
                                params: { student: JSON.stringify(student)}
                            })}>
                                <View style={[styles.actionIcon, { backgroundColor: '#F0FFF4',display:'flex',flexDirection:'row' }]}>
                                    <MaterialIcons name="auto-awesome" size={14} color='purple' />
                                    <FontAwesome name="book" size={20} color="#38A169" />
                                </View>
                                <Text style={styles.actionText}>AI Lesson Planner</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                            onPress={() => router.push({
                                pathname:'/(tabs)/management/invoice/invoice',
                                params: { student: JSON.stringify(student)}
                            })}
                            style={[styles.actionCard,{backgroundColor:colors.lightOrange}]}>
                                <View style={[styles.actionIcon, { backgroundColor: '#FFFBEB' }]}>
                                    <MaterialIcons name="payment" size={20} color="#D69E2E" />
                                </View>
                                <Text style={styles.actionText}>Invoice</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.actionCard,{backgroundColor:colors.lightPurple}]}
                                onPress={() => router.push(`/(tabs)/management/transactions/${student.id}`)}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: '#FAF5FF' }]}>
                                    <MaterialIcons name="trending-up" size={20} color="#805AD5" />
                                </View>
                                <Text style={styles.actionText}>Transactions</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Upcoming Sessions - Enhanced */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                            <TouchableOpacity onPress={()=>setActiveTab('sessions')}>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        {upcomingSessions.length > 0 && upcomingSessions.map((session:any) => {
                        const date:any = new Date(session.date);
                        
                        const day = date.toLocaleString('default', { day: 'numeric' })     
                        const month = date.toLocaleString('default', { month: 'short' })
                        return ( 
                            <View style={styles.upcomingCard} key={session.id}>
                            <View style={styles.sessionDateRow}>
                                <View style={styles.dateContainer}>
                                    <Text style={styles.dateDay}>{day}</Text>
                                    <Text style={styles.dateMonth}>{month}</Text>
                                </View>
                                <View style={styles.sessionDetails}>
                                    <Text style={styles.sessionTime}>{session.start_time} - {session.end_time}</Text>
                                    <Text style={styles.sessionSubject}>{session.title}</Text>
                                </View>
                                <View style={styles.sessionStatus}>
                                    <View style={styles.confirmedBadge}>
                                        <Text style={styles.confirmedText}>{session.completion_status}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        )})}
                        {upcomingSessions.length === 0 && (
                            <View style={styles.upcomingCard}>
                                <Text style={{ fontSize: 16, color: '#718096', textAlign: 'center' }}>
                                    No upcoming sessions scheduled. Add a session to get started.
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Contact Information - Enhanced */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Information</Text>

                        {is_minor  && (
                            <View style={styles.contactCard}>
                                <View style={styles.contactHeader}>
                                    <Text style={styles.contactLabel}>Parent/Guardian</Text>
                                </View>
                                <View style={styles.contactInfoContainer}>
                                
                                    <ContactRow icon="person" text={parent_name} />
                                    <TouchableOpacity style={styles.contactRow}
                                    onPress={() => Linking.openURL(`tel:${parent_phone}`)}
                                    >
                                    <View style={styles.contactIconContainer}>
                                    <MaterialIcons name='phone' size={16} color="#718096" />
                                    </View>
                                    <Text style={styles.contactText}>{parent_phone}</Text>
                                    </TouchableOpacity>
                                    {/* <ContactRow icon="phone" text={parent_phone} /> */}

                                    <TouchableOpacity style={styles.contactRow}
                                    onPress={() => {
                                        if(parent_email){
                                            Linking.openURL(`mailto:${parent_email}`)
                                        }
                                    }}>
                                    <View style={styles.contactIconContainer}>
                                    <MaterialIcons name='email' size={16} color="#718096" />
                                    </View>
                                    <Text style={styles.contactText}>{parent_email|| 'No email'}</Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        )}

                        <View style={styles.contactCard}>
                            <View style={styles.contactHeader}>
                                <Text style={styles.contactLabel}>Student</Text>
                            </View>
                            <View style={styles.contactInfoContainer}>
                                <TouchableOpacity style={styles.contactRow}
                                    onPress={() => {
                                        if(phone){
                                            Linking.openURL(`tel:${phone}`)
                                        }
                                    }}>
                                    <View style={styles.contactIconContainer}>
                                    <MaterialIcons name='phone' size={16} color="#718096" />
                                    </View>
                                    <Text style={styles.contactText}>{phone|| 'No phone number'}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.contactRow}
                                    onPress={() => {
                                        if(email){
                                            Linking.openURL(`mailto:${email}`)
                                        }
                                    }}>
                                    <View style={styles.contactIconContainer}>
                                    <MaterialIcons name='email' size={16} color="#718096" />
                                    </View>
                                    <Text style={styles.contactText}>{email|| 'No email'}</Text>
                                    </TouchableOpacity>
                                <ContactRow icon="house" text={address || 'No address entered'} />
                            </View>
                        </View>
                    </View>

                    {/* Student Notes - Enhanced */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Student Notes</Text>
                        </View>
                        <View style={styles.notesCard}>
                            <Text style={styles.notesText}>
                                {notes || 'No notes added yet. Add notes to track student progress, preferences, and important information.'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            )}

            {activeTab === 'sessions' && <Sessions student={student} />}
        </View>
    )
}

// Helper component for contact rows
const ContactRow = ({ icon, text }:any) => (
    <View style={styles.contactRow}>
        <View style={styles.contactIconContainer}>
            <MaterialIcons name={icon} size={16} color="#718096" />
        </View>
        <Text style={styles.contactText}>{text}</Text>
    </View>
);





const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },

    // Enhanced Header
    headerWrapper: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F7FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F7FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    // Profile Section
    profileSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },

    studentInfo: {
        flex: 1,
        paddingTop: 4,
    },
    studentNameContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        alignItems:'center',
        justifyContent: 'space-between',
    },
    studentName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A202C',
        marginBottom: 6,
    },
    studentStatus: {
        padding:4,
        backgroundColor:colors.lightOrange,
        borderRadius: 8,
    },
    studentStatusText:{
        fontSize:14,
        fontWeight:'400',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    metaText: {
        fontSize: 14,
        color: '#718096',
        fontWeight: '500',
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#CBD5E0',
        marginHorizontal: 8,
    },
    rateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    hourlyRate: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    joinDate: {
        fontSize: 12,
        color: '#A0AEC0',
    },

    // Enhanced Tab Navigation
    tabContainer: {
        flexDirection: 'row',
        justifyContent:'space-around',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.greyBg,
    },
    activeTab: {
        backgroundColor: '#EBF8FF',
        borderWidth: 1,
        borderColor: colors.primary + '20',
    },
    tabText: {
        fontSize: 14,
        color: '#718096',
        fontWeight: '500',
        marginLeft: 6,
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: '600',
    },

    // Content
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },

    // Enhanced Action Grid
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#FAFBFC',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    actionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textMuted,
        textAlign: 'center',
    },

    // Enhanced Upcoming Sessions
    upcomingCard: {
        backgroundColor: '#FAFBFC',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sessionDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateContainer: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
        marginRight: 16,
        minWidth: 44,
    },
    dateDay: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        lineHeight: 18,
    },
    dateMonth: {
        fontSize: 11,
        fontWeight: '500',
        color: '#fff',
        textTransform: 'uppercase',
    },
    sessionDetails: {
        flex: 1,
    },
    sessionTime: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 2,
    },
    sessionSubject: {
        fontSize: 13,
        color: '#718096',
    },
    sessionStatus: {
        alignItems: 'flex-end',
    },
    confirmedBadge: {
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#10B981' + '20',
    },
    confirmedText: {
        fontSize: 11,
        color: '#10B981',
        fontWeight: '600',
    },
    pendingBadge: {
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F59E0B' + '20',
    },
    pendingText: {
        fontSize: 11,
        color: '#F59E0B',
        fontWeight: '600',
    },

    // Enhanced Contact Cards
    contactCard: {
        backgroundColor:"#fff",
        borderRadius: 12,
        padding: 8,
        marginBottom: 16,
    },
    contactHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    contactLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
    },
    editContactButton: {
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        gap:'4',
        // backgroundColor:colors.lightGreen,
        // borderWidth:1,
        // borderColor:colors.primaryLight,
        // borderRadius:8,
        padding: 4,
    },
    contactInfoContainer: {
        gap: 8,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactText: {
        fontSize: 14,
        color: '#4A5568',
        flex: 1,
    },

    // Enhanced Notes
    notesCard: {
        backgroundColor: '#FAFBFC',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    notesText: {
        fontSize: 14,
        color: '#4A5568',
        lineHeight: 20,
    },
    editNotesButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editNotesText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
        marginLeft: 4,
    },

    bottomSpacer: {
        height: 100,
    },
});