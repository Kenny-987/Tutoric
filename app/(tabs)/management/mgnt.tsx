import { colors } from "@/styles/styles"
import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    container:{
      flex: 1,
      backgroundColor: '#fff',
      padding: 20,
    },
    header: {
      paddingTop: 10,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: colors.border2,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    add: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 20,
    },
    shadowWrapper: {
      borderRadius: 30,
      shadowColor: colors.primaryLight,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    circleBtn: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primaryLight  ,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addIcon: {
      fontSize: 24,
      color: '#fff',
    },

    searchContainer: {
      width:'100%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 12,
      marginTop: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: '#2D3748',
      paddingVertical: 4,
    },
    
    // Filter Styles
    filterContainer: {
      flexGrow: 0,
      // borderWidth:1,
      marginBottom: 16,
    },
    filterContent: {
      // paddingHorizontal: 16,
    },
    filterChip: {
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border2,
      // shadowColor: '#000',
      // shadowOffset: { width: 0, height: 1 },
      // shadowOpacity: 0.05,
      // shadowRadius: 1,
      // elevation: 1,
    },
    activeFilterChip: {
      backgroundColor: colors.primary,
      // borderColor: '#84CC16',
    },
    filterText: {
      fontSize: 14,
      color: '#718096',
      fontWeight: '500',
    },
    activeFilterText: {
      color: '#fff',
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#F7FAFC',
        paddingHorizontal: 16,
      },
      
      // Student Card
      studentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
      
      // Card Header
      cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      },
      studentInfo: {
        flex: 1,
      },
      studentName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 4,
      },
      studentSubject: {
        fontSize: 14,
        color: '#718096',
      },
      
      // Status Badge
      statusBadge: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
      },
      activeDot: {
        backgroundColor: '#10B981',
      },
      newBadge: {
        backgroundColor: '#84CC16',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
      },
      newText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
      },
      
      // Card Body
      cardBody: {
        marginBottom: 16,
      },
      infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
      },
      infoText: {
        fontSize: 14,
        color: '#718096',
        marginLeft: 8,
      },
      paidText: {
        color: '#10B981',
        fontWeight: '500',
      },
      unpaidText: {
        color: '#F59E0B',
        fontWeight: '500',
      },
      
      // Card Footer
      cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      quickAction: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
      },
      primaryAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#84CC16',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginLeft: 8,
      },
      actionText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
        marginLeft: 4,
      },
  })