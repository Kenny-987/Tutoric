import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { colors } from '@/styles/styles';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function TransactionsScreen() {
  const { id } = useLocalSearchParams(); // student id
  const [student, setStudent] = useState<any>(null);
  const [transactions, setTransactions] = useState<any>([]);
  const [unpaidSessions, setUnpaidSessions] = useState<any>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add Payment Form State
  const [selectedSession, setSelectedSession] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [transaction_date, setTransactionDate] = useState<Date | null>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('token');
      
      // Fetch student info
      const studentRes = await axios.get(`http://10.182.90.139:3000/students/student/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudent(studentRes.data);

      // Fetch transactions
      const transactionsRes = await axios.get(`http://10.182.90.139:3000/transactions/student/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(transactionsRes.data);

      // Fetch unpaid sessions
      const sessions = await axios.get(`http://10.182.90.139:3000/sessions/studentsessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filteredSessions = sessions.data.filter((session: any) => session.payment_status !== 'paid');
      setUnpaidSessions(filteredSessions);

    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAddPayment = async () => {
    if (!paymentAmount) {
      Alert.alert('Error', 'Please enter payment amount');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('token');
      
      const paymentData = {
        student_id: id,
        session_id: selectedSession || null,
        type: 'payment',
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        description: paymentDescription || `Payment ${selectedSession ? 'for session' : 'from student'}`,
        reference_number: referenceNumber,
        transaction_date: transaction_date?.toISOString()
      };

      await axios.post('http://10.182.90.139:3000/transactions/add', paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form and close modal
      resetForm();
      setShowAddPayment(false);

      // Refresh data
      fetchData();
      Alert.alert('Success', 'Payment recorded successfully');

    } catch (error) {
      console.error('Error adding payment:', error);
      Alert.alert('Error', 'Failed to record payment');
    }
  };

  const resetForm = () => {
    setSelectedSession('');
    setPaymentAmount('');
    setPaymentDescription('');
    setReferenceNumber('');
    setPaymentMethod('cash');
    setTransactionDate(new Date());
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: any) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getTransactionIcon = (type: any) => {
    switch (type) {
      case 'payment':
        return { icon: 'trending-up', color: '#10B981', bg: '#DCFCE7' };
      case 'refund':
        return { icon: 'trending-down', color: '#EF4444', bg: '#FEE2E2' };
      case 'fee':
        return { icon: 'attach-money', color: '#F59E0B', bg: '#FEF3C7' };
      default:
        return { icon: 'swap-horiz', color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const calculateOutstandingBalance = () => {
    return unpaidSessions.reduce((total: any, session: any) => {
      const hours = parseDurationToHours(session.duration);
      const rate = parseFloat(session.hourly_rate);
      return total + (hours * rate);
    }, 0);
  };

  const parseDurationToHours = (duration: any) => {
    const hourMatch = duration?.match(/(\d+)h/);
    const minuteMatch = duration?.match(/(\d+)m/);
    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
    return hours + minutes / 60;
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (selectedDate: Date) => {
    setTransactionDate(selectedDate);
    hideDatePicker();
  };

  const renderTransactionItem = ({ item }: any) => {
    const iconData = getTransactionIcon(item.type);
    return (
      <View style={styles.transactionCard}>
        <View style={[styles.transactionIcon, { backgroundColor: iconData.bg }]}>
          <MaterialIcons name={iconData.icon as any} size={20} color={iconData.color} />
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {item.description || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionDate}>{formatDate(item.transaction_date)}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.transactionMethod}>{item.payment_method}</Text>
          </View>
        </View>
        
        <Text style={[
          styles.amountText,
          { color: item.type === 'payment' ? '#10B981' : '#EF4444' }
        ]}>
          {item.type === 'payment' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
      </View>
    );
  };

  const renderUnpaidSession = ({ item }: any) => {
    const sessionAmount = parseDurationToHours(item.duration) * parseFloat(item.hourly_rate);
    
    return (
      <View style={styles.unpaidCard}>
        <View style={styles.unpaidHeader}>
          <View style={styles.unpaidInfo}>
            <Text style={styles.sessionTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.sessionMeta}>
              <Text style={styles.sessionDate}>{formatDate(item.date)}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.sessionDuration}>{item.duration}</Text>
            </View>
          </View>
          <View style={styles.unpaidActions}>
            <Text style={styles.amountOwed}>{formatCurrency(sessionAmount)}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  // Generate invoice logic here
                  Alert.alert('Info', 'Invoice generation feature coming soon');
                }}
              >
                <Text style={[styles.actionText,{color:colors.textDark}]}>Invoice</Text>
                {/* <MaterialIcons name="receipt" size={16} color="#6B7280" /> */}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setSelectedSession(item.id.toString());
                  setPaymentAmount(sessionAmount.toFixed(2));
                  setPaymentDescription(`Payment for ${item.title}`);
                  setShowAddPayment(true);
                }}
              >
                <Text style={styles.actionText}>Mark Paid</Text>
                {/* <MaterialIcons name="check" size={16} color="#fff" /> */}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading financial data...</Text>
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Unable to load student data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const outstandingBalance = calculateOutstandingBalance();
  const thisMonthPayments = transactions
    .filter((t: any) => t.type === 'payment' && new Date(t.transaction_date).getMonth() === new Date().getMonth())
    .reduce((sum: any, t: any) => sum + parseFloat(t.amount), 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Financials</Text>
          <Text style={styles.headerSubtitle}>{student.full_name}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddPayment(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Financial Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryIconContainer}>
              <MaterialIcons name="account-balance-wallet" size={24} color="#EF4444" />
            </View>
            <View style={styles.summaryDetails}>
              <Text style={styles.summaryLabel}>Outstanding</Text>
              <Text style={[styles.summaryAmount, { color: '#EF4444' }]}>
                {formatCurrency(outstandingBalance)}
              </Text>
            </View>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <View style={styles.summaryIconContainer}>
              <MaterialIcons name="trending-up" size={24} color="#10B981" />
            </View>
            <View style={styles.summaryDetails}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={[styles.summaryAmount, { color: '#10B981' }]}>
                {formatCurrency(thisMonthPayments)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={[]}
        renderItem={() => null}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        ListHeaderComponent={() => (
          <>
            {/* Unpaid Sessions */}
            {unpaidSessions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Unpaid Sessions</Text>
                  <Text style={styles.sectionBadge}>{unpaidSessions.length}</Text>
                </View>
                <FlatList
                  data={unpaidSessions}
                  renderItem={renderUnpaidSession}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}

            {/* Recent Transactions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                {transactions.length > 0 && (
                  <TouchableOpacity>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {transactions.length > 0 ? (
                <FlatList
                  data={transactions.slice(0, 10)}
                  renderItem={renderTransactionItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyTransactions}>
                  <MaterialIcons name="receipt-long" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No transactions yet</Text>
                  <Text style={styles.emptySubtext}>Payments will appear here</Text>
                </View>
              )}
            </View>
          </>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Add Payment Modal */}
      <Modal
        visible={showAddPayment}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddPayment(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowAddPayment(false)}
              style={styles.modalButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Add Payment</Text>
            
            <TouchableOpacity 
              onPress={handleAddPayment}
              style={styles.modalButton}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Session Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Session (Optional)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedSession}
                  onValueChange={setSelectedSession}
                >
                  <Picker.Item label="General Payment" value="" />
                  {unpaidSessions.map((session: any) => (
                    <Picker.Item
                      key={session.id}
                      label={`${session.title} - ${formatDate(session.date)}`}
                      value={session.id.toString()}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount *</Text>
              <TextInput
                style={styles.textInput}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Payment Method */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <Picker.Item label="Cash" value="cash" />
                  <Picker.Item label="Bank Transfer" value="bank_transfer" />
                  <Picker.Item label="Check" value="check" />
                  <Picker.Item label="Card" value="card" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            </View>

            {/* Reference Number */}
            {paymentMethod !== 'cash' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reference Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={referenceNumber}
                  onChangeText={setReferenceNumber}
                  placeholder="Enter reference number..."
                />
              </View>
            )}

            {/* Payment Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Date</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={showDatePicker}
              >
                <Text style={styles.dateText}>
                  {transaction_date ? formatDate(transaction_date) : "Select date"}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#6B7280" />
              </TouchableOpacity>
              
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={paymentDescription}
                onChangeText={setPaymentDescription}
                placeholder="Payment description..."
                multiline
                numberOfLines={3}
              />
            </View>
            <TouchableOpacity>
              <Text>Save</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 40,
  },
  
  errorText: {
    fontSize: 18,
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },

  headerSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
  },

  addButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  summaryDetails: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },

  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
  },

  summaryDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
  },

  listContent: {
    paddingBottom: 20,
  },

  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },

  sectionBadge: {
    backgroundColor: colors.primary,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  viewAllText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },

  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  transactionDetails: {
    flex: 1,
  },

  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },

  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  transactionDate: {
    fontSize: 14,
    color: '#64748B',
  },

  metaDot: {
    fontSize: 14,
    color: '#CBD5E1',
    marginHorizontal: 8,
  },

  transactionMethod: {
    fontSize: 14,
    color: '#64748B',
    textTransform: 'capitalize',
  },

  amountText: {
    fontSize: 18,
    fontWeight: '700',
  },

  unpaidCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  unpaidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  unpaidInfo: {
    flex: 1,
    marginRight: 16,
  },

  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },

  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sessionDate: {
    fontSize: 14,
    color: '#64748B',
  },

  sessionDuration: {
    fontSize: 14,
    color: '#64748B',
  },

  unpaidActions: {
    alignItems: 'flex-end',
  },

  amountOwed: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    // width: 36,
    // height: 36,
    padding:6,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
actionText:{
fontWeight:'700',
color:'#fff',
},
  secondaryButton: {
    backgroundColor: colors.lightOrange,
    padding:6,
    // width: 36,
    // height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 4,
  },

  emptySubtext: {
    fontSize: 16,
    color: '#64748B',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },

  modalButton: {
    minWidth: 60,
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },

  saveText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },

  modalContent: {
    flex: 1,
    padding: 20,
  },

  inputGroup: {
    marginBottom: 24,
  },

  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },

  dateText: {
    fontSize: 16,
    color: '#1E293B',
  },
});