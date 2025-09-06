import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AILessonPlanner = () => {
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [duration, setDuration] = useState('60');
  const [objectives, setObjectives] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const gradeLevels = ['K-2', '3-5', '6-8', '9-12', 'College'];
  const durations = ['30', '45', '60', '90'];

  const handleGenerate = async () => {
    if (!subject || !gradeLevel) return;
    
    setIsGenerating(true);
    // Simulate API call - replace with your actual AI service
    setTimeout(() => {
      setGeneratedPlan({
        title: `${subject} Lesson Plan`,
        duration: `${duration} minutes`,
        objectives: objectives.split('\n').filter(obj => obj.trim()),
        activities: [
          { name: 'Introduction & Hook', duration: '10 min', description: 'Engage students with an interactive opener' },
          { name: 'Direct Instruction', duration: '20 min', description: 'Present core concepts with visual aids' },
          { name: 'Guided Practice', duration: '15 min', description: 'Students practice with teacher support' },
          { name: 'Independent Work', duration: '10 min', description: 'Individual or small group activities' },
          { name: 'Wrap-up & Assessment', duration: '5 min', description: 'Review key points and check understanding' }
        ],
        materials: ['Whiteboard', 'Handouts', 'Digital presentation', 'Student worksheets'],
        assessment: 'Formative assessment through questioning and exit tickets'
      });
      setIsGenerating(false);
    }, 2000);
  };

  const InputField = ({ label, value, onChangeText, placeholder, multiline = false, numberOfLines = 1 }:any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );

  const SelectButton = ({ options, selected, onSelect, label }:any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.optionsContainer}
        contentContainerStyle={styles.optionsContent}
      >
        {options.map((option:any) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selected === option && styles.selectedOption
            ]}
            onPress={() => onSelect(option)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.optionText,
              selected === option && styles.selectedOptionText
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const GeneratedPlanCard = () => (
    <View style={styles.planCard}>
      <View style={styles.planHeader}>
        <MaterialIcons name="auto-awesome" size={28} color="#6366F1" />
        <Text style={styles.planTitle}>{generatedPlan.title}</Text>
      </View>
      
      <View style={styles.planSection}>
        <View style={styles.durationBadge}>
          <MaterialIcons name="schedule" size={16} color="#6366F1" />
          <Text style={styles.durationText}>{generatedPlan.duration}</Text>
        </View>
      </View>

      {generatedPlan.objectives.length > 0 && (
        <View style={styles.planSection}>
          <Text style={styles.sectionTitle}>Learning Objectives</Text>
          {generatedPlan.objectives.map((obj:any, index:any) => (
            <View key={index} style={styles.objectiveItem}>
              <MaterialIcons name="check-circle" size={18} color="#10B981" />
              <Text style={styles.objectiveText}>{obj}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.planSection}>
        <Text style={styles.sectionTitle}>Activities Timeline</Text>
        {generatedPlan.activities.map((activity:any, index:any) => (
          <View key={index} style={styles.activityItem}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityName}>{activity.name}</Text>
              <View style={styles.durationChip}>
                <Text style={styles.activityDuration}>{activity.duration}</Text>
              </View>
            </View>
            <Text style={styles.activityDescription}>{activity.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.planSection}>
        <Text style={styles.sectionTitle}>Materials Needed</Text>
        <View style={styles.materialsContainer}>
          {generatedPlan.materials.map((material:any, index:any) => (
            <View key={index} style={styles.materialTag}>
              <MaterialIcons name="inventory" size={14} color="#6366F1" />
              <Text style={styles.materialText}>{material}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.planSection}>
        <Text style={styles.sectionTitle}>Assessment Strategy</Text>
        <View style={styles.assessmentCard}>
          <MaterialIcons name="assessment" size={20} color="#059669" />
          <Text style={styles.assessmentText}>{generatedPlan.assessment}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
          <MaterialIcons name="edit" size={20} color="#6366F1" />
          <Text style={styles.secondaryButtonText}>Edit Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.7}>
          <MaterialIcons name="save" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Save Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="psychology" size={32} color="#6366F1" />
            </View>
            <View style={styles.titleTextContainer}>
              <Text style={styles.title}>AI Lesson Planner</Text>
              <Text style={styles.subtitle}>Create engaging lesson plans powered by AI</Text>
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <InputField
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            placeholder="e.g., Mathematics, Science, History..."
          />

          <SelectButton
            label="Grade Level"
            options={gradeLevels}
            selected={gradeLevel}
            onSelect={setGradeLevel}
          />

          <SelectButton
            label="Duration (minutes)"
            options={durations}
            selected={duration}
            onSelect={setDuration}
          />

          <InputField
            label="Learning Objectives (optional)"
            value={objectives}
            onChangeText={setObjectives}
            placeholder="Enter each objective on a new line..."
            multiline={true}
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[
              styles.generateButton, 
              isGenerating && styles.generatingButton,
              (!subject || !gradeLevel) && styles.disabledButton
            ]}
            onPress={handleGenerate}
            disabled={isGenerating || !subject || !gradeLevel}
            activeOpacity={0.8}
          >
            {isGenerating ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Generating Plan...</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="auto-awesome" size={24} color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Generate Lesson Plan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {generatedPlan && <GeneratedPlanCard />}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  optionsContent: {
    paddingRight: 16,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  selectedOption: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  generateButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generatingButton: {
    backgroundColor: '#9CA3AF',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  planSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  durationText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    marginLeft: 6,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  objectiveText: {
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 10,
    flex: 1,
    lineHeight: 22,
  },
  activityItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  durationChip: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityDuration: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  materialTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  materialText: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
    marginLeft: 6,
  },
  assessmentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  assessmentText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#6366F1',
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  bottomPadding: {
    height: 40,
  },
});

export default AILessonPlanner;