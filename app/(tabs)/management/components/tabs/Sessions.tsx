import axios from 'axios';
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import EditSession from '../modals/EditSession'

export default function Sessions({ student }: any) {
    const [sessions, setSessions] = useState<any>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [session, setSession] = useState(null);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [showSessionDetail, setShowSessionDetail] = useState(false);

    const fetchSessions = async () => {
        try {
            setLoading(true)
            const token = await SecureStore.getItemAsync('token')
            const response = await axios.get(`http://10.182.90.139:3000/sessions/studentsessions/${student.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (response.status === 200) {
                console.log(response.data);
                setSessions(response.data)
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchSessions()
    }, [])

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSessions()
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        if (!timeString || timeString.toLowerCase() === 'invalid date') return '';
        try {
            const time = new Date(`2000-01-01T${timeString}`);
            return time.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return timeString;
        }
    };

    const getStatusConfig = (status: any) => {
        switch (status) {
            case 'completed':
                return { color: '#10B981', bg: '#F0FDF4', icon: 'check-circle' };
            case 'scheduled':
                return { color: '#3B82F6', bg: '#EBF8FF', icon: 'schedule' };
            case 'in_progress':
                return { color: '#F59E0B', bg: '#FFFBEB', icon: 'sync' };
            case 'cancelled':
                return { color: '#EF4444', bg: '#FEF2F2', icon: 'cancel' };
            default:
                return { color: '#6B7280', bg: '#F9FAFB', icon: 'help' };
        }
    };

    const getPaymentConfig = (status: any) => {
        switch (status) {
            case 'paid':
                return { color: '#10B981', bg: '#F0FDF4', icon: 'check' };
            case 'unpaid':
                return { color: '#F59E0B', bg: '#FFFBEB', icon: 'schedule' };
            case 'refunded':
                return { color: '#8B5CF6', bg: '#FAF5FF', icon: 'undo' };
            default:
                return { color: '#6B7280', bg: '#F9FAFB', icon: 'help' };
        }
    };

    const parseDurationToHours = (duration: string): number => {
        const hourMatch = duration.match(/(\d+)h/);
        const minuteMatch = duration.match(/(\d+)m/);

        const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
        const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

        return hours + minutes / 60;
    };

    const calculateTotal = (duration: string, hourlyRate: string): number => {
        const hours = parseDurationToHours(duration);
        const rate = parseFloat(hourlyRate);
        return hours * rate;
    };

    const openSessionDetail = (sessionItem: any) => {
        setSelectedSession(sessionItem);
        setShowSessionDetail(true);
    };

    const editSession = (sessionItem: any) => {
        setSession(sessionItem);
        setShowEdit(true);
        setShowSessionDetail(false);
    };

    const deleteSession = (sessionItem: any) => {
        // Implement delete functionality
        console.log('Delete session:', sessionItem.id);
        setShowSessionDetail(false);
    };

    const generateInvoice = (sessionItem: any) => {
        // Implement invoice generation
        console.log('Generate invoice for session:', sessionItem.id);
        setShowSessionDetail(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading sessions...</Text>
            </View>
        )
    }

    // Compact list item component
    const renderSessionListItem = ({ item }: any) => {
        const statusConfig = getStatusConfig(item.completion_status);
        const paymentConfig = getPaymentConfig(item.payment_status);
        const total = item.duration ? calculateTotal(item.duration, item.hourly_rate) : 0;

        return (
            <TouchableOpacity 
                style={styles.listItem} 
                onPress={() => openSessionDetail(item)}
                activeOpacity={0.7}
            >
                <View style={styles.listItemContent}>
                    {/* Left side - Main info */}
                    <View style={styles.listItemLeft}>
                        <Text style={styles.listItemTitle}>{item.title}</Text>
                        <Text style={styles.listItemDate}>
                            {formatDate(item.date)} • {formatTime(item.start_time)}
                        </Text>
                        {item.duration && (
                            <Text style={styles.listItemDuration}>{item.duration}</Text>
                        )}
                    </View>

                    {/* Right side - Status and amount */}
                    <View style={styles.listItemRight}>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
                                {item.completion_status}
                            </Text>
                        </View>
                        
                        {total > 0 && (
                            <Text style={styles.listItemAmount}>${total.toFixed(2)}</Text>
                        )}
                        
                        <View style={styles.paymentRow}>
                            <MaterialIcons 
                                name={paymentConfig.icon as any} 
                                size={12} 
                                color={paymentConfig.color} 
                            />
                            <Text style={[styles.paymentLabel, { color: paymentConfig.color }]}>
                                {item.payment_status}
                            </Text>
                        </View>
                    </View>
                </View>

                <MaterialIcons name="chevron-right" size={20} color="#CBD5E0" />
            </TouchableOpacity>
        );
    };

    // Detailed session modal component
    const SessionDetailModal = () => {
        if (!selectedSession) return null;

        const statusConfig = getStatusConfig(selectedSession.completion_status);
        const paymentConfig = getPaymentConfig(selectedSession.payment_status);
        const total = selectedSession.duration ? calculateTotal(selectedSession.duration, selectedSession.hourly_rate) : 0;

        return (
            <Modal
                visible={showSessionDetail}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowSessionDetail(false)}
            >
                <View style={styles.modalContainer}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setShowSessionDetail(false)}
                            style={styles.closeButton}
                        >
                            <MaterialIcons name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Session Details</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        {/* Session Title and Date */}
                        <View style={styles.detailHeader}>
                            <Text style={styles.detailTitle}>{selectedSession.title}</Text>
                            <Text style={styles.detailDate}>{formatDate(selectedSession.date)}</Text>
                        </View>

                        {/* Status Cards */}
                        <View style={styles.statusCards}>
                            <View style={[styles.statusCard, { backgroundColor: statusConfig.bg }]}>
                                <MaterialIcons name={statusConfig.icon as any} size={20} color={statusConfig.color} />
                                <Text style={[styles.statusCardText, { color: statusConfig.color }]}>
                                    {selectedSession.completion_status}
                                </Text>
                            </View>
                            
                            <View style={[styles.statusCard, { backgroundColor: paymentConfig.bg }]}>
                                <MaterialIcons name={paymentConfig.icon as any} size={20} color={paymentConfig.color} />
                                <Text style={[styles.statusCardText, { color: paymentConfig.color }]}>
                                    {selectedSession.payment_status}
                                </Text>
                            </View>
                        </View>

                        {/* Time Details */}
                        <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>Time & Duration</Text>
                            <View style={styles.detailRow}>
                                <MaterialIcons name="schedule" size={20} color="#718096" />
                                <Text style={styles.detailText}>
                                    {formatTime(selectedSession.start_time)} - {formatTime(selectedSession.end_time)}
                                </Text>
                            </View>
                            {selectedSession.duration && (
                                <View style={styles.detailRow}>
                                    <MaterialIcons name="timer" size={20} color="#718096" />
                                    <Text style={styles.detailText}>{selectedSession.duration}</Text>
                                </View>
                            )}
                        </View>

                        {/* Event Type */}
                        {selectedSession.event_type && (
                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Type</Text>
                                <View style={styles.detailRow}>
                                    <MaterialIcons name="category" size={20} color="#718096" />
                                    <Text style={styles.detailText}>{selectedSession.event_type}</Text>
                                </View>
                            </View>
                        )}

                        {/* Payment Details */}
                        <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>Payment</Text>
                            <View style={styles.paymentDetails}>
                                <View style={styles.paymentRow}>
                                    <Text style={styles.paymentLabel}>Hourly Rate:</Text>
                                    <Text style={styles.paymentValue}>${selectedSession.hourly_rate}/hr</Text>
                                </View>
                                {selectedSession.duration && (
                                    <View style={styles.paymentRow}>
                                        <Text style={styles.paymentLabel}>Duration:</Text>
                                        <Text style={styles.paymentValue}>{selectedSession.duration}</Text>
                                    </View>
                                )}
                                {total > 0 && (
                                    <View style={[styles.paymentRow, styles.totalRow]}>
                                        <Text style={styles.totalLabel}>Total Amount:</Text>
                                        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Notes */}
                        {selectedSession.notes && (
                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Notes</Text>
                                <View style={styles.notesContainer}>
                                    <Text style={styles.notesText}>{selectedSession.notes}</Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={styles.editButton}
                            onPress={() => editSession(selectedSession)}
                        >
                            <MaterialIcons name="edit" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={() => deleteSession(selectedSession)}
                        >
                            <MaterialIcons name="delete-outline" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Delete</Text>
                        </TouchableOpacity>

                        {selectedSession.payment_status?.toLowerCase() === 'unpaid' && (
                            <TouchableOpacity 
                                style={styles.invoiceButton}
                                onPress={() => generateInvoice(selectedSession)}
                            >
                                <MaterialIcons name="receipt-long" size={20} color="#fff" />
                                <Text style={styles.buttonText}>Invoice</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
                <MaterialIcons name="event-note" size={48} color="#CBD5E0" />
            </View>
            <Text style={styles.emptyTitle}>No Sessions Yet</Text>
            <Text style={styles.emptySubtitle}>
                Sessions will appear here once you schedule them with this student
            </Text>
        </View>
    );

    return (
        <>
            {showEdit && (
                <EditSession
                    visible={showEdit}
                    onClose={() => setShowEdit(false)}
                    student={student}
                    session={session}
                    setSessions={setSessions}
                />
            )}
            
            <SessionDetailModal />

            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Sessions</Text>
                    <Text style={styles.headerSubtitle}>{sessions.length} total sessions</Text>
                </View>

                <FlatList
                    data={sessions}
                    renderItem={renderSessionListItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={renderEmptyState}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#718096',
    },

    // Header
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A202C',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#718096',
        fontWeight: '500',
    },

    // List
    list: {
        flex: 1,
    },
    listItem: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    listItemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    listItemLeft: {
        flex: 1,
        marginRight: 12,
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A202C',
        marginBottom: 4,
    },
    listItemDate: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 2,
    },
    listItemDuration: {
        fontSize: 12,
        color: '#9CA3AF',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    listItemRight: {
        alignItems: 'flex-end',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    listItemAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A202C',
        marginBottom: 4,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentLabel: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'capitalize',
        marginLeft: 4,
    },
    separator: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 20,
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    closeButton: {
        padding: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A202C',
    },
    placeholder: {
        width: 32,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },

    // Detail Header
    detailHeader: {
        marginBottom: 24,
    },
    detailTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A202C',
        marginBottom: 8,
    },
    detailDate: {
        fontSize: 16,
        color: '#718096',
        fontWeight: '500',
    },

    // Status Cards
    statusCards: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statusCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    statusCardText: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'capitalize',
    },

    // Detail Sections
    detailSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A202C',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 15,
        color: '#374151',
        marginLeft: 12,
        fontWeight: '500',
    },

    // Payment Details
    paymentDetails: {
        gap: 8,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 8,
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A202C',
    },
    paymentValue: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
    },

    // Notes
    notesContainer: {
        backgroundColor: '#F8FAFC',
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
        padding: 12,
        borderRadius: 8,
    },
    notesText: {
        fontSize: 14,
        color: '#4A5568',
        lineHeight: 20,
        fontStyle: 'italic',
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    editButton: {
        flex: 1,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#EF4444',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
    },
    invoiceButton: {
        flex: 1,
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 20,
    },
});