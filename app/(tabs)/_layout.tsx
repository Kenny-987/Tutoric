import { colors } from "@/styles/styles"
import { Ionicons } from "@expo/vector-icons"
import { Tabs } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';


export default function TabLayout() {

  
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarShowLabel:true,
        headerShown:false,
        tabBarActiveTintColor:colors.textDark,
        tabBarInactiveTintColor:colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          textTransform: 'capitalize',
        },
        tabBarLabelPosition: 'below-icon',
        tabBarStyle:{
          backgroundColor:"#fff",
          borderTopWidth:0,
          position:"absolute",
          elevation:0,
          height:70,
          paddingBottom:10,
        }
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon:({size,color})=> <MaterialIcons name="home" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="management"
        
        options={{
          title: "Students",
          tabBarIcon:({size,color})=> <MaterialIcons name="people" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon:({size,color})=> <MaterialIcons name="calendar-month" size={size} color={color} />
        }}
      />
            <Tabs.Screen
        name="planner"
        options={{
          tabBarIcon:({size,color})=> <MaterialIcons name="menu-book" size={size} color={color}/>
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          tabBarIcon:({size,color})=> <MaterialIcons name="menu" size={size} color={color}/>
        }}
      />


     
       
    </Tabs>
  ) 
}