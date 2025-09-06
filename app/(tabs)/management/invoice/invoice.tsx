import React, { use, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/styles';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useUserStore } from '@/app/context/useUserStore';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from "expo-file-system";

const Invoice = () => {
  const user = useUserStore(state => (state.user))
  const { student: studentParam } = useLocalSearchParams();
  const student = studentParam ? JSON.parse(studentParam as string) : {};
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [tutorName, setTutorName] = useState(user?.fullname || '');
  const [tutorEmail, setTutorEmail] = useState(user?.email || '');
  const [tutorPhone, setTutorPhone] = useState(user?.phone || '');
  const [studentName, setStudentName] = useState(student?.full_name || '');
  const [studentPhone, setStudentPhone] = useState(student?.phone || '');
  const [studentEmail, setStudentEmail] = useState(student?.email || '');
  const [parentName, setParentName] = useState(student?.parent_name || '');
  const [parentPhone, setParentPhone] = useState(student?.parent_phone || '');
  const [parentEmail, setParentEmail] = useState(student?.parent_email || '');
  const [address, setAddress] = useState(student?.address || '');

  const [sessions, setSessions] = useState<any>([]);
  const [selectedSessions, setSelectedSessions] = useState<any>([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDueDatePickerVisible, setDueDatePickerVisibility] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [notes, setNotes] = useState('');

  const formatDate = (dateString:any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFullDate = (date:any) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const showDueDatePicker = () => setDueDatePickerVisibility(true);
  const hideDueDatePicker = () => setDueDatePickerVisibility(false);

  const handleDateConfirm = (selectedDate:any) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const handleDueDateConfirm = (selectedDate:any) => {
    setDueDate(selectedDate);
    hideDueDatePicker();
  };

  const fetchData = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const sessions = await axios.get(`http://10.182.90.139:3000/sessions/studentsessions/${student.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filteredSessions = sessions.data.filter((session:any) => session.payment_status !== 'paid');
      setSessions(filteredSessions);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load session data');
    }
  };

  const generateInvoiceNumber = async () => {
    try {
      const lastInvoiceNumber = await AsyncStorage.getItem('lastInvoiceNumber');
      const nextNumber = lastInvoiceNumber ? parseInt(lastInvoiceNumber) + 1 : 1;
      return `INV-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return `INV-${Date.now()}`;
    }
  };

  useEffect(() => {
    const generateNumber = async () => {
      const newNumber = await generateInvoiceNumber();
      setInvoiceNumber(newNumber);
    };
    generateNumber();
    fetchData();
  }, []);

  const toggleSessionSelection = (sessionId:any) => {
    setSelectedSessions((prev:any) => 
      prev.includes(sessionId) 
        ? prev.filter((id:any) => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const getSelectedSessionsData = () => {
    return sessions.filter((session:any) => selectedSessions.includes(session.id));
  };

  const calculateSubtotal = () => {
    return getSelectedSessionsData().reduce((sum:any, session:any) => 
      sum + (durationToHours(session.duration) * session.hourly_rate), 0
    );
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return (subtotal * discount) / 100;
    }
    return discount;
  };

  const calculateTax = () => {
    const afterDiscount = calculateSubtotal() - calculateDiscount();
    return (afterDiscount * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };



  function durationToHours(str:any) {
    const h = /(\d+)\s*h/i.exec(str)?.[1] ?? 0;
    const m = /(\d+)\s*m/i.exec(str)?.[1] ?? 0;
    const s = /(\d+)\s*s/i.exec(str)?.[1] ?? 0;
  
    const hours = Number(h);
    const minutes = Number(m);
    const seconds = Number(s);
  
    return hours + minutes / 60 + seconds / 3600;
  }





  const generatePDFOptimizedHTML = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    const tax = calculateTax();
    const total = calculateTotal();
    const selectedSessionsData = getSelectedSessionsData();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #${invoiceNumber}</title>
    <style>
        @page { size: A4; margin: 15mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Helvetica', 'Arial', sans-serif; 
            font-size: 14px; 
            line-height: 1.6; 
            color: #1E293B; 
            background: white; 
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4A90E2;
        }
        
        .logo-container { display: flex; align-items: center; }
        .logo-text {
            color: #4A90E2;
            font-weight: 700;
            font-size: 18px;
            letter-spacing: 2px;
            margin-left: 10px;
        }
        
        .invoice-info { text-align: right; }
        .invoice-title {
            font-size: 36px;
            font-weight: 700;
            color: #1E293B;
            margin-bottom: 8px;
        }
        .invoice-number {
            font-size: 18px;
            color: #4A90E2;
            font-weight: 600;
        }
        
        .dates-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .date-label {
            font-size: 12px;
            color: #64748B;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 6px;
        }
        .date-value {
            font-size: 16px;
            color: #1E293B;
            font-weight: 600;
        }
        
        .addresses-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            gap: 40px;
        }
        .address-block { flex: 1; }
        .address-block.right { text-align: right; }
        .address-title {
            font-size: 12px;
            color: #4A90E2;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 15px;
        }
        .address-name {
            font-size: 16px;
            font-weight: 700;
            color: #1E293B;
            margin-bottom: 6px;
        }
        .address-detail {
            font-size: 14px;
            color: #64748B;
            margin-bottom: 4px;
        }
        
        .services-table {
            width: 100%;
            margin-bottom: 30px;
            border-collapse: collapse;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .services-table th {
            background: #1E293B;
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .services-table th:nth-child(2),
        .services-table th:nth-child(3) { text-align: center; }
        .services-table th:nth-child(4) { text-align: right; }
        
        .services-table td { 
            padding: 16px 12px; 
            border-bottom: 1px solid #F1F5F9; 
        }
        .services-table tr:nth-child(even) { background: #F8FAFC; }
        
        .service-name {
            font-size: 14px;
            font-weight: 600;
            color: #1E293B;
            margin-bottom: 4px;
        }
        .service-date {
            font-size: 12px;
            color: #64748B;
        }
        
        .totals-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #E2E8F0;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        .totals-final {
            border-top: 3px solid #4A90E2;
            margin-top: 15px;
            padding-top: 15px;
        }
        .totals-final-label {
            font-size: 18px;
            font-weight: 700;
            color: #4A90E2;
        }
        .totals-final-value {
            font-size: 22px;
            font-weight: 700;
            color: #4A90E2;
        }
        
        .invoice-footer {
            margin-top: 50px;
            padding-top: 25px;
            border-top: 1px solid #E2E8F0;
            text-align: center;
        }
        .thank-you-text {
            font-size: 18px;
            font-weight: 600;
            color: #059669;
            margin-bottom: 10px;
        }
        .payment-text {
            font-size: 14px;
            color: #64748B;
            background: #FEF3C7;
            padding: 12px;
            border-radius: 6px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="logo-container">
                <span style="font-size: 24px;">🎓</span>
                <div class="logo-text">TUTORING SERVICES</div>
            </div>
            <div class="invoice-info">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#${invoiceNumber}</div>
            </div>
        </div>

        <div class="dates-container">
            <div class="date-item">
                <div class="date-label">Invoice Date:</div>
                <div class="date-value">${formatFullDate(date)}</div>
            </div>
            <div class="date-item" style="text-align: right;">
                <div class="date-label">Due Date:</div>
                <div class="date-value">${formatFullDate(dueDate)}</div>
            </div>
        </div>

        <div class="addresses-container">
            <div class="address-block">
                <div class="address-title">FROM:</div>
                <div class="address-name">${tutorName || '—'}</div>
                <div class="address-detail">${tutorEmail}</div>
                <div class="address-detail">${tutorPhone}</div>
            </div>
            <div class="address-block right">
                <div class="address-title">BILL TO:</div>
                <div class="address-name">
                    ${student.is_minor ? (parentName || '—') : (studentName || '—')}
                </div>
                <div class="address-detail">Student: ${studentName}</div>
                <div class="address-detail">
                    ${student.is_minor ? parentEmail : studentEmail}
                </div>
                <div class="address-detail">
                    ${student.is_minor ? parentPhone : studentPhone}
                </div>
                ${address ? `<div class="address-detail">${address}</div>` : ''}
            </div>
        </div>

        ${selectedSessionsData.length > 0 ? `
        <table class="services-table">
            <thead>
                <tr>
                    <th style="width: 40%;">Service</th>
                    <th style="width: 20%;">Duration</th>
                    <th style="width: 20%;">Rate</th>
                    <th style="width: 20%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${selectedSessionsData.map((session:any) => `
                    <tr>
                        <td>
                            <div class="service-name">${session.title || 'Tutoring Session'}</div>
                            <div class="service-date">${formatDate(session.date)}</div>
                        </td>
                        <td style="text-align: center;">${session.duration}</td>
                        <td style="text-align: center;">$${session.hourly_rate}/hr</td>
                        <td style="text-align: right; font-weight: 600;">$${(durationToHours(session.duration) * session.hourly_rate).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        ${selectedSessionsData.length > 0 ? `
        <div class="totals-section">
            <div class="totals-row">
                <span>Subtotal:</span>
                <span style="font-weight: 600;">$${subtotal.toFixed(2)}</span>
            </div>
            ${discountAmount > 0 ? `
            <div class="totals-row">
                <span>Discount (${discountType === 'percentage' ? `${discount}%` : `$${discount}`}):</span>
                <span style="font-weight: 600; color: #EF4444;">-$${discountAmount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="totals-row">
                <span>Tax (${taxRate}%):</span>
                <span style="font-weight: 600;">$${tax.toFixed(2)}</span>
            </div>
            <div class="totals-row totals-final">
                <span class="totals-final-label">TOTAL DUE:</span>
                <span class="totals-final-value">$${total.toFixed(2)}</span>
            </div>
        </div>
        ` : ''}

        ${notes ? `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
            <div style="font-weight: 700; margin-bottom: 10px;">Notes:</div>
            <div style="background: #F8FAFC; padding: 15px; border-radius: 6px; border-left: 4px solid #4A90E2;">
                ${notes}
            </div>
        </div>
        ` : ''}

        <div class="invoice-footer">
            <div class="thank-you-text">Thank you for choosing our tutoring services!</div>
            <div class="payment-text">Payment is due by ${formatFullDate(dueDate)}</div>
        </div>
    </div>
</body>
</html>`;
  }

  const saveInvoiceNumber = async (invoiceNumber:any) => {
    try {
      const currentNumber = invoiceNumber.split('-')[1];
      await AsyncStorage.setItem('lastInvoiceNumber', currentNumber);
    } catch (error) {
      console.error('Error saving invoice number:', error);
    }
  };


  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      
      // Validate required fields
      if (!invoiceNumber || !tutorName || !studentName) {
        Alert.alert('Validation Error', 'Please fill in all required fields');
        return null;
      }
  
      if (selectedSessions.length === 0) {
        Alert.alert('No Sessions Selected', 'Please select at least one session to include in the invoice');
        return null;
      }
  
      const htmlContent = generatePDFOptimizedHTML();
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
  
      // Save the invoice number after successful generation
      await saveInvoiceNumber(invoiceNumber);
      
      return uri;
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF invoice');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };




  const saveInvoice = async (fileName: string) => {
    try {
      // 1. Generate PDF first
      const pdfUri = await generatePDF();
      if (!pdfUri) {
        return; // stop if generation failed
      }
  
      // 2. Copy to app’s document directory
      const newPath = FileSystem.documentDirectory + fileName;
      await FileSystem.copyAsync({
        from: pdfUri,
        to: newPath,
      });
  
      // 3. Handle Android vs iOS saving
      if (Platform.OS === "android") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Cannot save file without storage permission.");
          return;
        }
  
        // Add to Downloads
        const asset = await MediaLibrary.createAssetAsync(newPath);
        await MediaLibrary.createAlbumAsync("Download", asset, false);
  
        Alert.alert("Saved ✅", `Invoice saved to Downloads as ${fileName}`);
      } else {
        Alert.alert(
          "Saved ✅",
          `Invoice saved in app's Documents folder.\nOpen Files app to view.`
        );
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save invoice. Try Share instead.");
    }
  };
  const shareInvoice = async () => {
    try {
      setIsGenerating(true);
      
      // Validate required fields
      if (!invoiceNumber || !tutorName || !studentName) {
        Alert.alert('Validation Error', 'Please fill in all required fields');
        return;
      }
  
      if (selectedSessions.length === 0) {
        Alert.alert('No Sessions Selected', 'Please select at least one session to include in the invoice');
        return;
      }
  
      const pdfUri = await generatePDF();
      if (!pdfUri) return;
  
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing Not Available', 'Sharing is not available on this device');
        return;
      }
  
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Share Invoice ${invoiceNumber}`,
        UTI: 'com.adobe.pdf'
      });
  
      // Save invoice number after successful sharing
      // await saveInvoiceNumber(invoiceNumber);
      
    } catch (error) {
      console.error('Error sharing invoice:', error);
      Alert.alert('Share Error', 'Failed to share invoice');
    } finally {
      setIsGenerating(false);
    }
  };


  // const printInvoice = async () => {
  //   try {
  //     setIsGenerating(true);
      
  //     // Validate required fields
  //     if (!invoiceNumber || !tutorName || !studentName) {
  //       Alert.alert('Validation Error', 'Please fill in all required fields');
  //       return;
  //     }
  
  //     if (selectedSessions.length === 0) {
  //       Alert.alert('No Sessions Selected', 'Please select at least one session to include in the invoice');
  //       return;
  //     }
  
  //     const htmlContent = generatePDFOptimizedHTML();
      
  //     // Check if printing is available
  //     const isAvailable = await Print.isAvailableAsync();
  //     if (!isAvailable) {
  //       Alert.alert('Print Not Available', 'Printing is not available on this device');
  //       return;
  //     }
  
  //     await Print.printAsync({
  //       html: htmlContent,
  //       printerUrl: undefined, // Let user choose printer
  //     });
  
  //     // Save the invoice number after successful printing
  //     await saveInvoiceNumber(invoiceNumber);
      
  //   } catch (error) {
  //     console.error('Error printing invoice:', error);
  //     Alert.alert('Error', 'Failed to print invoice');
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };


  // const shareInvoice = async () => {
  //   try {
  //     setIsGenerating(true);
      
  //     const pdfUri = await generatePDF();
  //     if (!pdfUri) return;
  
  //     // Check if sharing is available
  //     const isAvailable = await Sharing.isAvailableAsync();
  //     if (!isAvailable) {
  //       Alert.alert('Sharing Not Available', 'Sharing is not available on this device');
  //       return;
  //     }
  
  //     await Sharing.shareAsync(pdfUri, {
  //       mimeType: 'application/pdf',
  //       dialogTitle: `Share Invoice ${invoiceNumber}`,
  //       UTI: 'com.adobe.pdf'
  //     });
      
  //   } catch (error) {
  //     console.error('Error sharing invoice:', error);
  //     Alert.alert('Error', 'Failed to share invoice');
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };
  
  const emailInvoice = async () => {
    try {
      setIsGenerating(true);
  
      // 1. Generate PDF
      const pdfUri = await generatePDF();
      if (!pdfUri) return;
  
      // 2. Check email availability
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Email Not Available", "Email is not configured on this device");
        return;
      }
  
      // 3. Determine recipient
      const emailRecipient = student.is_minor ? parentEmail : studentEmail;
      const recipientName = student.is_minor ? parentName : studentName;
  
      // 4. Build email
      const emailOptions = {
        recipients: emailRecipient ? [emailRecipient] : [],
        subject: `Invoice ${invoiceNumber} - Tutoring Services`,
        body: `Dear ${recipientName || "Valued Client"},
  
  Please find attached your invoice for tutoring services.
  
  Invoice Details:
  - Invoice Number: ${invoiceNumber}
  - Invoice Date: ${formatFullDate(date)}
  - Due Date: ${formatFullDate(dueDate)}
  - Total Amount Due: $${calculateTotal().toFixed(2)}
  
  If you have any questions about this invoice, please don't hesitate to contact us.
  
  Thank you for choosing our tutoring services!
  
  Best regards,
  ${tutorName}
  ${tutorEmail}
  ${tutorPhone}
        `,
        attachments: [pdfUri], // ✅ Just URIs
      };
  
      // 5. Send email
      const result = await MailComposer.composeAsync(emailOptions);
  
      if (result.status === "sent") {
        Alert.alert("Success", "Invoice email sent successfully!");
      } else if (result.status === "cancelled") {
        // User cancelled – no alert needed
      } else {
        Alert.alert("Email Failed", "Failed to send invoice email");
      }
    } catch (error) {
      console.error("Error emailing invoice:", error);
      Alert.alert("Error", "Failed to email invoice");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const [isGenerating, setIsGenerating] = useState(false);




  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Generate Invoice</Text>
          <Text style={styles.headerSubtitle}>{studentName || 'Student'}</Text>
        </View>
        
        <View style={styles.headerActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.emailButton]} 
          onPress={emailInvoice}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialIcons name="email" size={20} color="#fff" />
              <Text style={styles.buttonText}>Email</Text>
            </>
          )}
        </TouchableOpacity>


        <TouchableOpacity 
          style={[styles.actionButton, styles.shareButton]} 
          onPress={shareInvoice}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialIcons name="share" size={20} color="#fff" />
              <Text style={styles.buttonText}>Share</Text>
            </>
          )}
        </TouchableOpacity>


          <TouchableOpacity 
          style={[styles.actionButton, styles.saveButton]} 
          onPress={()=>saveInvoice(`Invoice_${invoiceNumber}.pdf`)}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="#fff" />
              <Text style={styles.buttonText}>Save</Text>
            </>
          )}
        </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
        />
        <DateTimePickerModal
          isVisible={isDueDatePickerVisible}
          mode="date"
          onConfirm={handleDueDateConfirm}
          onCancel={hideDueDatePicker}
        />

        {/* Invoice Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="description" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Invoice Details</Text>
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Invoice Number *</Text>
              <TextInput
                style={styles.input}
                value={invoiceNumber}
                onChangeText={setInvoiceNumber}
                placeholder="INV-001"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Invoice Date *</Text>
              <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
                <MaterialIcons name="calendar-today" size={18} color="#718096" />
                <Text style={styles.dateText}>
                  {formatFullDate(date)}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={18} color="#718096" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>Due Date *</Text>
          <TouchableOpacity style={styles.dateButton} onPress={showDueDatePicker}>
            <MaterialIcons name="calendar-today" size={18} color="#718096" />
            <Text style={styles.dateText}>
              {formatFullDate(dueDate)}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={18} color="#718096" />
          </TouchableOpacity>
        </View>

        {/* Tutor Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Tutor Information</Text>
          </View>
          
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={tutorName}
            onChangeText={setTutorName}
            placeholder="Your full name"
          />
          
          {/* <View style={styles.row}> */}
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={tutorEmail}
                onChangeText={setTutorEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                value={tutorPhone}
                onChangeText={setTutorPhone}
                placeholder="(555) 123-4567"
                keyboardType="phone-pad"
              />
            </View>
          {/* </View> */}
        </View>

        {/* Student & Parent Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Billing Information</Text>
          </View>
          
          <Text style={styles.label}>Student Name *</Text>
          <TextInput
            style={styles.input}
            value={studentName}
            onChangeText={setStudentName}
            placeholder="Student's full name"
          />

          {!student.is_minor ? (
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Student Email</Text>
                <TextInput
                  style={styles.input}
                  value={studentEmail}
                  onChangeText={setStudentEmail}
                  placeholder="student@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Student Phone</Text>
                <TextInput
                  style={styles.input}
                  value={studentPhone}
                  onChangeText={setStudentPhone}
                  placeholder="Student's phone"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.label}>Parent/Guardian Name *</Text>
              <TextInput
                style={styles.input}
                value={parentName}
                onChangeText={setParentName}
                placeholder="Parent or guardian name"
              />
              {/* <View style={styles.row}> */}
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Parent Email</Text>
                  <TextInput
                    style={styles.input}
                    value={parentEmail}
                    onChangeText={setParentEmail}
                    placeholder="parent@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Parent Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={parentPhone}
                    onChangeText={setParentPhone}
                    placeholder="(555) 123-4567"
                    keyboardType="phone-pad"
                  />
                </View>
              {/* </View> */}
            </>
          )}

          <Text style={styles.label}>Billing Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Full billing address"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Session Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="event" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Select Sessions to Invoice</Text>
            <View style={styles.sessionCounter}>
              <Text style={styles.sessionCounterText}>
                {selectedSessions.length} of {sessions.length} selected
              </Text>
            </View>
          </View>

          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={48} color={colors.primary} />
              <Text style={styles.emptyStateText}>No unpaid sessions available</Text>
              <Text style={styles.emptyStateSubtext}>
                Sessions will appear here once they are completed and unpaid.
              </Text>
            </View>
          ) : (
            sessions.map((session:any) => (
              <TouchableOpacity
                key={session.id}
                style={[
                  styles.sessionCard,
                  selectedSessions.includes(session.id) && styles.sessionCardSelected
                ]}
                onPress={() => toggleSessionSelection(session.id)}
                activeOpacity={0.7}
              >
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>{session.title || 'Tutoring Session'}</Text>
                    <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                  </View>
                  <View style={styles.sessionDetails}>
                    <Text style={styles.sessionDuration}>{session.duration||'No duration'}</Text>
                    <Text style={styles.sessionRate}>${session.hourly_rate}/hr</Text>
                    <Text style={styles.sessionAmount}>
                      ${(durationToHours(session.duration)* session.hourly_rate).toFixed(2)}
                    </Text>
                  </View>
                  <View style={[
                    styles.checkbox,
                    selectedSessions.includes(session.id) && styles.checkboxSelected
                  ]}>
                    {selectedSessions.includes(session.id) && (
                      <MaterialIcons name="check" size={16} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Discount & Tax */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="calculate" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Adjustments</Text>
          </View>
          
          {/* <View style={styles.row}> */}
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Discount</Text>
              <View style={styles.discountContainer}>
                <TextInput
                  style={[styles.input, styles.discountInput]}
                  value={discount.toString()}
                  onChangeText={(value) => setDiscount(parseFloat(value) || 0)}
                  keyboardType="decimal-pad"
                  placeholder="0"
                />
                <TouchableOpacity
                  style={[
                    styles.discountToggle,
                    discountType === 'percentage' && styles.discountToggleActive
                  ]}
                  onPress={() => setDiscountType(discountType === 'percentage' ? 'fixed' : 'percentage')}
                >
                  <Text style={[
                    styles.discountToggleText,
                    discountType === 'percentage' && styles.discountToggleTextActive
                  ]}>
                    {discountType === 'percentage' ? '%' : '$'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Tax Rate (%)</Text>
              <TextInput
                style={styles.input}
                value={taxRate.toString()}
                onChangeText={(value) => setTaxRate(parseFloat(value) || 0)}
                keyboardType="decimal-pad"
                placeholder="0"
              />
            </View>
          {/* </View> */}

          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes or payment terms..."
            multiline
            numberOfLines={3}
          />

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>${calculateSubtotal().toFixed(2)}</Text>
            </View>
            {calculateDiscount() > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Discount ({discountType === 'percentage' ? `${discount}%` : `$${discount}`}):
                </Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -${calculateDiscount().toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax ({taxRate}%):</Text>
              <Text style={styles.summaryValue}>${calculateTax().toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>TOTAL DUE:</Text>
              <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Invoice Preview */}
        <View style={[styles.section,styles.previewSection]}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="preview" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Invoice Preview</Text>
          </View>
          
          <View style={styles.previewContainer}>
            {/* Invoice Header */}
            <View style={styles.invoiceHeader}>
              <View style={styles.logoContainer}>
                <MaterialIcons name="school" size={32} color="#4A90E2" />
                <Text style={styles.logoText}>TUTORING SERVICES</Text>
              </View>
              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceTitle}>INVOICE</Text>
                <Text style={styles.invoiceNumber}>#{invoiceNumber}</Text>
              </View>
            </View>

            {/* Dates */}
            <View style={styles.datesContainer}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Invoice Date:</Text>
                <Text style={styles.dateValue}>{formatFullDate(date)}</Text>
              </View>
              <View style={[styles.dateItem,styles.dateItem2]}>
                <Text style={styles.dateLabel}>Due Date:</Text>
                <Text style={styles.dateValue}>{formatFullDate(dueDate)}</Text>
              </View>
            </View>

            {/* Addresses */}
            <View style={styles.addressesContainer}>
              <View style={styles.addressBlock}>
                <Text style={styles.addressTitle}>FROM:</Text>
                <Text style={styles.addressName}>{tutorName || '—'}</Text>
                <Text style={styles.addressDetail}>{tutorEmail}</Text>
                <Text style={styles.addressDetail}>{tutorPhone}</Text>
              </View>
              <View style={styles.addressBlock2}>
                <Text style={styles.addressTitle}>BILL TO:</Text>
                <Text style={styles.addressName}>
                  {student.is_minor ? parentName || '—' : studentName || '—'}
                </Text>
                <Text style={styles.addressDetail}>Student: {studentName}</Text>
                <Text style={styles.addressDetail}>
                  {student.is_minor ? parentEmail : studentEmail}
                </Text>
                <Text style={styles.addressDetail}>
                  {student.is_minor ? parentPhone : studentPhone}
                </Text>
                {address && <Text style={styles.addressDetail}>{address}</Text>}
              </View>
            </View>

            {/* Services Table */}
            {getSelectedSessionsData().length > 0 ? (
              <View style={styles.servicesTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>Service</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Duration</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Rate</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
                </View>
                
                {getSelectedSessionsData().map((session:any, index:any) => (
                  <View
                    key={session.id}
                    style={[
                      styles.tableRow,
                      { backgroundColor: index % 2 === 0 ? '#F8FAFC' : '#FFFFFF' }
                    ]}
                  >
                    <View style={{ flex: 2 }}>
                      <Text style={styles.serviceName}>{session.title || 'Tutoring Session'}</Text>
                      <Text style={styles.serviceDate}>{formatDate(session.date)}</Text>
                    </View>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                      {(session.duration)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                      ${session.hourly_rate}/hr
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', fontWeight: '600' }]}>
                      ${(durationToHours(session.duration) * session.hourly_rate).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noSelectionMessage}>
                <MaterialIcons name="info-outline" size={20} color="#CBD5E0" />
                <Text style={styles.noSelectionText}>
                  Select sessions above to see them in the invoice preview
                </Text>
              </View>
            )}

            {/* Totals */}
            {getSelectedSessionsData().length > 0 && (
              <View style={styles.totalsPreview}>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Subtotal:</Text>
                  <Text style={styles.totalsValue}>${calculateSubtotal().toFixed(2)}</Text>
                </View>
                {calculateDiscount() > 0 && (
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>
                      Discount ({discountType === 'percentage' ? `${discount}%` : `$${discount}`}):
                    </Text>
                    <Text style={[styles.totalsValue, styles.discountValue]}>
                      -${calculateDiscount().toFixed(2)}
                    </Text>
                  </View>
                )}
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Tax ({taxRate}%):</Text>
                  <Text style={styles.totalsValue}>${calculateTax().toFixed(2)}</Text>
                </View>
                <View style={[styles.totalsRow, styles.totalsFinal]}>
                  <Text style={styles.totalsFinalLabel}>TOTAL DUE:</Text>
                  <Text style={styles.totalsFinalValue}>${calculateTotal().toFixed(2)}</Text>
                </View>
              </View>
            )}

            {/* Footer */}
            {notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesTitle}>Notes:</Text>
                <Text style={styles.notesText}>{notes}</Text>
              </View>
            )}

            <View style={styles.invoiceFooter}>
              <Text style={styles.thankYouText}>Thank you for choosing our tutoring services!</Text>
              <Text style={styles.paymentText}>Payment is due by {formatFullDate(dueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    marginBottom:60
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
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
    color: '#1E293B',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    marginVertical: 8,
    padding: 20,
    // borderRadius: 16,
    borderBottomWidth:1,
    borderColor: colors.border2,
  },
  previewSection: {
    padding:10
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 12,
    flex: 1,
  },
  sessionCounter: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sessionCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  sessionCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  sessionCardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4A90E2',
    borderWidth: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: '#64748B',
  },
  sessionDetails: {
    alignItems: 'flex-end',
    marginRight: 16,
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 2,
  },
  sessionRate: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  sessionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountInput: {
    flex: 1,
    marginRight: 8,
    marginTop: 0,
  },
  discountToggle: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  discountToggleActive: {
    backgroundColor: colors.primary,
    // borderColor: '#4A90E2',
  },
  discountToggleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  discountToggleTextActive: {
    color: '#fff',
  },
  summaryContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  discountValue: {
    color: '#DC2626',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#4A90E2',
    marginTop: 12,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A90E2',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90E2',
  },
  previewContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#4A90E2',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 1,
  },
  invoiceInfo: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    // borderWidth:1,
    // borderColor:'black'
  },
  dateItem: {
    flex: 1,
    // borderWidth:1,
    // borderColor:'red',
    alignItems:'flex-start',
  },
  dateItem2:{
    flex: 1,
    alignItems:'flex-end',
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  addressesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 4,
  },
  addressBlock: {
    flex: 1,
    alignItems: 'flex-start',
    // borderWidth:1,
    // borderColor:'red',
  },
  addressBlock2: {
    flex: 1,
    alignItems: 'flex-end',
    // borderWidth:1,
    // borderColor:'red',
  },
  addressTitle: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
    lineHeight: 20,
  },
  servicesTable: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 14,
    color: '#374151',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  serviceDate: {
    fontSize: 12,
    color: '#64748B',
  },
  noSelectionMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  noSelectionText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  totalsPreview: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalsLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  totalsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalsFinal: {
    borderTopWidth: 2,
    borderTopColor: '#4A90E2',
    marginTop: 12,
    paddingTop: 12,
  },
  totalsFinalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A90E2',
  },
  totalsFinalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A90E2',
  },
  notesSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  invoiceFooter: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 8,
  },
  paymentText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  bottomPadding: {
    paddingBottom: 32,
  },
  emailButton: {
    backgroundColor: '#4A90E2',
  },
  printButton: {
    backgroundColor: '#059669',
  },
  shareButton: {
    backgroundColor: '#7C3AED',
  },
  saveButton: {
    backgroundColor: '#F59E0B',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default Invoice;