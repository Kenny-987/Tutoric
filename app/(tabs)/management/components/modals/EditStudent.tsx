import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform, 
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { colors } from '@/styles/styles';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


const EditStudent = ({ visible, onClose, student,setStudent }:any) => {
  const [loading,setLoading] = useState(false)
  const [formData, setFormData] = useState({
    studentName: student.full_name|| "",
    subject: student.subject||"",
    grade: student.grade || '',
    age: student.age || '',
    ageGroup: student.is_minor? 'Minor': "",
    parentName: student.parent?.parent_name||"",
    parentPhone: student.parent?.parent_phone||"",
    parentEmail: student.parent?.parent_phone||"",
    studentPhone: student.phone||"",
    address:student.address||'',
    studentEmail:student.email||"",
    hourlyRate: student.hourly_rate||'',
    notes: student.notes||''
  });

  const handleInputChange = (field:any, value:any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-toggle minor status based on age
    if (field === 'age' && value) {
      const ageNum = parseInt(value);
      setFormData(prev => ({
        ...prev,
        isMinor: ageNum < 18
      }));
    }
  };

  const handleSave =async () => {
    // Basic validation
    if (!formData.studentName || !formData.subject) {
      alert('Please fill in required fields');
      return;
    }
    if(formData.ageGroup=='Minor' && !formData.parentName || !formData.parentPhone){
      alert('Please fill in parent details for minors');
      return;
    }
    const token = await SecureStore.getItemAsync('token');
    try {
      const response = await axios.patch(`http://10.182.90.139:3000/students/edit/${student.id}`,formData,{
        headers: {
              Authorization: `Bearer ${token}`,
            },
      })
      if(response.status===200){

        setStudent((prev: any) => ({
            ...prev,
            ...response.data,  // spread the fields from API response
          }));
        onClose();
      }else{
        alert("Something went wrong " + response.statusText)
      }
    } catch (error) {
      console.error(error)
    }
    
  };

  const handleClose = () => {
    // resetForm();
    onClose();
  };
  const options = ["Minor", "Adult"];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#718096" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Student Details</Text>
          <TouchableOpacity onPress={handleSave}
          disabled={loading}
          style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          
          {/* Student Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Student Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Student Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter student name"
                value={formData.studentName}
                onChangeText={(text) => handleInputChange('studentName', text)}
                placeholderTextColor="#718096"
              />
            </View>
            <View>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={styles.option}
          onPress={() => handleInputChange("ageGroup",option)}
        >
          <View style={[styles.radioCircle, formData.ageGroup === option && styles.selected]} />
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Subject *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Mathematics"
                  value={formData.subject}
                  onChangeText={(text) => handleInputChange('subject', text)}
                  placeholderTextColor="#718096"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Grade/Level</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 11"
                  value={formData.grade}
                  onChangeText={(text) => handleInputChange('grade', text)}
                  keyboardType="default"
                  placeholderTextColor="#718096"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter age"
                value={formData.age}
                onChangeText={(text) => handleInputChange('age', text)}
                keyboardType="numeric"
                placeholderTextColor="#718096"
              />
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            {formData.ageGroup.toLocaleLowerCase() == 'minor' && (
              <>
                <Text style={styles.subsectionTitle}>Parent/Guardian</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Parent/Guardian Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter parent/guardian name"
                    value={formData.parentName}
                    onChangeText={(text) => handleInputChange('parentName', text)}
                    placeholderTextColor="#718096"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Parent/Guardian Phone *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="(555) 123-4567"
                    value={formData.parentPhone}
                    onChangeText={(text) => handleInputChange('parentPhone', text)}
                    keyboardType="phone-pad"
                    placeholderTextColor="#718096"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Parent/Guardian Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="parent@email.com"
                    value={formData.parentEmail}
                    onChangeText={(text) => handleInputChange('parentEmail', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#718096"
                  />
                </View>

                <Text style={styles.subsectionTitle}>Student</Text>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {formData.ageGroup.toLocaleLowerCase()==="minor" ? 'Student Phone (Optional)' : 'Phone'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="(555) 987-6543"
                value={formData.studentPhone}
                onChangeText={(text) => handleInputChange('studentPhone', text)}
                keyboardType="phone-pad"
                placeholderTextColor="#718096"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {formData.ageGroup.toLocaleLowerCase()==='minor' ? 'Student Email (Optional)' : 'Email'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="student@mail.com"
                value={formData.studentEmail}
                onChangeText={(text) => handleInputChange('studentEmail', text)}
                keyboardType="email-address"
                placeholderTextColor="#718096"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="14 Bakerfield Cli"
                value={formData.address}
                onChangeText={(text) => handleInputChange('address', text)}
                keyboardType="default"
                placeholderTextColor="#718096"
              />
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hourly Rate</Text>
              <TextInput
                style={styles.input}
                placeholder="$45"
                value={formData.hourlyRate}
                onChangeText={(text) => handleInputChange('hourlyRate', text)}
                keyboardType="numeric"
                placeholderTextColor="#718096"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Learning style, goals, preferences..."
                value={formData.notes}
                onChangeText={(text) => handleInputChange('notes', text)}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#718096"
              />
            </View>
            {loading ? <ActivityIndicator size={'small'} color={colors.primaryLight}/>:
            <TouchableOpacity style={styles.bottomSaveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
            }
            
          </View>

          {/* Bottom spacing for keyboard */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create(
    {
        container: {
          flex: 1,
          backgroundColor: '#F7FAFC',
        },
        
        // Header
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        },
        closeButton: {
          padding: 4,
        },
        headerTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#2D3748',
        },
        saveButton: {
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 6,
        },
        saveButtonText: {
          fontSize: 16,
          color: '#fff',
          fontWeight: '600',
        },
      
        // Form
        form: {
          flex: 1,
          paddingHorizontal: 20,
        },
        section: {
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 20,
          marginTop: 16,
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#2D3748',
          marginBottom: 16,
        },
        subsectionTitle: {
          fontSize: 14,
          fontWeight: '600',
          color: '#718096',
          marginBottom: 12,
          marginTop: 8,
        },
        option: {
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 15,
        },
        radioCircle: {
          height: 20,
          width: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: "#007bff",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
        },
        selected: {
          backgroundColor: "#007bff",
        },
        optionText: {
          fontSize: 16,
        },
        result: {
          marginTop: 20,
          fontSize: 16,
          fontWeight: "bold",
        },
        // Input Groups
        inputGroup: {
          marginBottom: 16,
        },
        row: {
          flexDirection: 'row',
          gap: 12,
        },
        halfWidth: {
          flex: 1,
        },
        label: {
          fontSize: 14,
          fontWeight: '500',
          color: '#2D3748',
          marginBottom: 8,
        },
        input: {
          borderWidth: 1,
          borderColor: '#E2E8F0',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          fontSize: 16,
          color: '#2D3748',
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
        textArea: {
          height: 80,
          paddingTop: 12,
        },
        bottomSaveButton:{
          backgroundColor:colors.primary,
          padding:12,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          borderRadius:8
        },
        saveText:{
          fontSize:18,
          fontWeight:600,
          color:'#fff'
        },
        // Spacing
        bottomSpacing: {
          height: 40,
        },
      }
) 


export default EditStudent;