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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/styles';

const { width } = Dimensions.get('window');

const AILessonPlanner = () => {
  const { student: studentParam } = useLocalSearchParams();
  const student = studentParam ? JSON.parse(studentParam as string) : {};
  const [subject, setSubject] = useState('');
  const [topic,setTopic]=useState('')
  const [curriculum,setCurriculum] = useState('')
  const [gradeLevel, setGradeLevel] = useState('');
  const [duration, setDuration] = useState('60');
  const [objectives, setObjectives] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(true);

  const gradeLevels = ['K-2', '3-5', '6-8', '9-12', 'College'];
  const durations = ['30', '45', '60', '90'];

  const handleGenerate = async () => {
    if (!subject || !gradeLevel) return;
    
    setIsGenerating(true);

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

  const LessonPlanDisplay = () => {
    const [expandedSections, setExpandedSections] = useState<any>({});
    const [currentActivity, setCurrentActivity] = useState(0);
  
    // Sample lesson plan data - replace with your actual data
    const lessonPlan = {
      lessonTitle: "Mastering Algebraic Expressions: Simplification and Factorization",
      objectives: [
        "By the end of this lesson, the student will be able to simplify and factor algebraic expressions accurately.",
        "The student will demonstrate understanding of algebraic manipulation by solving a set of problems involving simplification and factorization."
      ],
      prerequisites: [
        "Basic operations with integers and fractions",
        "Understanding of variables and constants",
        "Knowledge of the distributive property"
      ],
      activities: [
        {
          step: 1,
          title: "Introduction to Algebraic Expressions",
          description: "Start the lesson with a brief recap of what an algebraic expression is. Discuss terms, coefficients, and like terms. Use examples to illustrate these concepts.",
          time: "10 min",
          materials: ["Whiteboard and markers", "Sample algebraic expressions"],
          tutorScript: "Let's start by looking at this expression: 3x + 5y - 2x. Can you identify the like terms here?",
          studentEngagement: "Ask the student to explain what they understand by different terms and to identify like terms in given expressions."
        },
        {
          step: 2,
          title: "Simplifying Expressions",
          description: "Guide the student through the process of simplifying algebraic expressions. Present a few examples on the whiteboard and then have the student practice on a similar set of problems.",
          time: "20 min",
          materials: ["Whiteboard", "Sample problems for simplification"],
          tutorScript: "Now I want you to walk me through simplifying 4x + 3y + 2x - y. Talk me through each step.",
          studentEngagement: "Use a collaborative approach: have the student explain their thought process before solving."
        }
      ],
      homework: {
        assignment: "Complete a worksheet on simplifying and factoring algebraic expressions.",
        timeEstimate: "20-30 minutes",
        purpose: "This homework reinforces the lesson by providing additional practice and helping to solidify understanding."
      }
    };
  
    const toggleSection = (section:any) => {
      setExpandedSections((prev:any) => ({
        ...prev,
        [section]: !prev[section]
      }));
    };
  
    // const shareLesson = async () => {
    //   try {
    //     await Share.share({
    //       message: `Lesson Plan: ${lessonPlan.lessonTitle}`,
    //       title: 'Lesson Plan'
    //     });
    //   } catch (error) {
    //     console.log('Error sharing:', error);
    //   }
    // };
  
    const CollapsibleSection = ({ title, children, icon, sectionKey }:any) => (
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionKey)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name={icon} size={20} color="#2563eb" />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <Ionicons 
            name={expandedSections[sectionKey] ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#6b7280" 
          />
        </TouchableOpacity>
        {expandedSections[sectionKey] && (
          <View style={styles.sectionContent}>
            {children}
          </View>
        )}
      </View>
    );
  
    const ActivityCard = ({ activity, index }:any) => (
      <View style={[
        styles.activityCard,
        currentActivity === index && styles.activeActivityCard
      ]}>
        <View style={styles.activityHeader}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>{activity.step}</Text>
          </View>
          <View style={styles.activityTitleContainer}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityTime}>{activity.time}</Text>
          </View>
        </View>
        
        <Text style={styles.activityDescription}>{activity.description}</Text>
        
        {activity.tutorScript && (
          <View style={styles.scriptContainer}>
            <Ionicons name="chatbubble-outline" size={16} color="#059669" />
            <Text style={styles.scriptLabel}>Tutor Script:</Text>
            <Text style={styles.scriptText}>"{activity.tutorScript}"</Text>
          </View>
        )}
  
        <View style={styles.engagementContainer}>
          <Ionicons name="bulb-outline" size={16} color="#d97706" />
          <Text style={styles.engagementText}>{activity.studentEngagement}</Text>
        </View>
      </View>
    );
  
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView  showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.lessonTitle}>{lessonPlan.lessonTitle}</Text>
              <TouchableOpacity 
              // onPress={shareLesson} 
              style={styles.shareButton}>
                <Ionicons name="share-outline" size={24} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </View>
  
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <Text style={styles.statText}>60 min</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="list-outline" size={20} color="#6b7280" />
              <Text style={styles.statText}>{lessonPlan.activities.length} Activities</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trophy-outline" size={20} color="#6b7280" />
              <Text style={styles.statText}>{lessonPlan.objectives.length} Goals</Text>
            </View>
          </View>
  
          {/* Learning Objectives */}
          <CollapsibleSection 
            title="Learning Objectives" 
            icon="target-outline" 
            sectionKey="objectives"
          >
            {lessonPlan.objectives.map((objective, index) => (
              <View key={index} style={styles.objectiveItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.objectiveText}>{objective}</Text>
              </View>
            ))}
          </CollapsibleSection>
  
          {/* Prerequisites */}
          <CollapsibleSection 
            title="Prerequisites" 
            icon="checkmark-circle-outline" 
            sectionKey="prerequisites"
          >
            {lessonPlan.prerequisites.map((prereq, index) => (
              <View key={index} style={styles.prerequisiteItem}>
                <Ionicons name="checkmark" size={16} color="#059669" />
                <Text style={styles.prerequisiteText}>{prereq}</Text>
              </View>
            ))}
          </CollapsibleSection>
  
          {/* Activities */}
          <View style={styles.sectionContainer}>
            <View style={styles.activitiesHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="play-circle-outline" size={20} color="#2563eb" />
                <Text style={styles.sectionTitle}>Lesson Activities</Text>
              </View>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.activityNavContainer}
            >
              {lessonPlan.activities.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.activityNavButton,
                    currentActivity === index && styles.activeActivityNavButton
                  ]}
                  onPress={() => setCurrentActivity(index)}
                >
                  <Text style={[
                    styles.activityNavText,
                    currentActivity === index && styles.activeActivityNavText
                  ]}>
                    Step {index + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
  
            <ActivityCard 
              activity={lessonPlan.activities[currentActivity]} 
              index={currentActivity}
            />
          </View>
  
          {/* Homework */}
          <CollapsibleSection 
            title="Homework Assignment" 
            icon="book-outline" 
            sectionKey="homework"
          >
            <View style={styles.homeworkContainer}>
              <Text style={styles.homeworkTitle}>Assignment:</Text>
              <Text style={styles.homeworkText}>{lessonPlan.homework.assignment}</Text>
              
              <View style={styles.homeworkMeta}>
                <View style={styles.homeworkMetaItem}>
                  <Ionicons name="time-outline" size={16} color="#6b7280" />
                  <Text style={styles.homeworkMetaText}>{lessonPlan.homework.timeEstimate}</Text>
                </View>
              </View>
              
              <Text style={styles.homeworkPurpose}>{lessonPlan.homework.purpose}</Text>
            </View>
          </CollapsibleSection>
  
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <Ionicons name="download-outline" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Export PDF</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="create-outline" size={20} color="#2563eb" />
              <Text style={styles.secondaryButtonText}>Edit Plan</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  return (
    <View style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
          <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1E293B" />
          
        </TouchableOpacity>
            <View style={styles.titleTextContainer}>
              <Text style={styles.title}>AI Lesson Planner</Text>
              <Text style={styles.subtitle}>Create engaging lesson plans powered by AI</Text>
            </View>
          </View>
          {student && <Text style={{textAlign:'center',color:colors.textMuted,fontWeight:600, marginTop:10}}> Creating for {student.full_name}</Text> }
        </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        

            {/* Session Selection */}
            {/* <View style={styles.section}>
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
        </View> */}

        

        <View style={styles.formCard}>
        <View style={styles.inputContainer}>
      <Text style={styles.label}>Subject</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={(value)=>setSubject(value)}
        placeholder='e.g Mathematics, Science, English...'
        placeholderTextColor="#9CA3AF"
      />
      </View>

      <View style={styles.inputContainer}>
      <Text style={styles.label}>Topic</Text>
      <TextInput
        style={styles.input}
        value={topic}
        onChangeText={(value)=>setTopic(value)}
        placeholder='e.g Adjectives, World War 2...'
        placeholderTextColor="#9CA3AF"
      />
      </View>

      <View style={styles.inputContainer}>
      <Text style={styles.label}>Curriculum (optional)</Text>
      <TextInput
        style={styles.input}
        value={curriculum}
        onChangeText={(value)=>setCurriculum(value)}
        placeholder='e.g Adjectives, World War 2...'
        placeholderTextColor="#9CA3AF"
      />
      </View>
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

        {generatedPlan && <LessonPlanDisplay />}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    marginHorizontal: 10,
    marginTop: 24,
    padding: 8,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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

  },
  selectedOption: {
    backgroundColor: colors.primary,
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








  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  lessonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginRight: 10,
    lineHeight: 28,
  },
  shareButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  sectionContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
    marginTop: 8,
  },
  objectiveText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    flex: 1,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  prerequisiteText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  activityNavContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  activityNavButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  activeActivityNavButton: {
    backgroundColor: '#2563eb',
  },
  activityNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeActivityNavText: {
    color: 'white',
  },
  activityCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeActivityCard: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f7ff',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  activityTitleContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  activityDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 12,
  },
  scriptContainer: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
  },
  scriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  scriptText: {
    fontSize: 14,
    color: '#065f46',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  engagementContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
  },
  engagementText: {
    fontSize: 14,
    color: '#92400e',
    flex: 1,
    lineHeight: 20,
  },
  homeworkContainer: {
    gap: 12,
  },
  homeworkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  homeworkText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  homeworkMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  homeworkMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  homeworkMetaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  homeworkPurpose: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },



  
  bottomPadding: {
    height: 40,
  },
});

export default AILessonPlanner;