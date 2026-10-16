import { AntDesign, Feather } from '@expo/vector-icons';
import { DrawerActions, NavigationProp, useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, DocumentData, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../../FirebaseConfig';

const { width } = Dimensions.get('window');

interface Event extends DocumentData {
  id: string;
  title: string;
  time: string;
  subtitle: string;
  color: string;
  userId: string;
  date: string;
}

type RootStackParamList = {
  Home: undefined;
  Notifications: undefined;
};

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

const COLOR_PALETTE = [
  '#66D2B1',
  '#FFB880',
  '#FF8888',
  '#AA88FF',
  '#88B8FF',
  '#E0E0E0',
];

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const timeToMinutes = (timeString: string): number => {
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 0;
  let [, hourStr, minuteStr, period] = match;
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (period) {
    period = period.toUpperCase();
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
  }
  return hour * 60 + minute;
};

const Home = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [task, setTask] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [weekEvents, setWeekEvents] = useState<Event[]>([]);
  const [activeDate, setActiveDate] = useState(new Date());
  const [today, setToday] = useState(new Date());
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingTime, setEditingTime] = useState('');
  const [editingSubtitle, setEditingSubtitle] = useState('');
  const [editingColor, setEditingColor] = useState('');

  const auth = getAuth();
  const user = auth.currentUser;
  const eventsCollection = collection(db, 'events');

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setActiveDate(now);
  }, []);

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, activeDate]);

  const fetchEvents = async () => {
    if (!user) return;

    const q = query(eventsCollection, where('userId', '==', user.uid));
    const data = await getDocs(q);
    const allEvents: Event[] = data.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Event[];

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(today.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const filteredWeekEvents = allEvents.filter(ev => {
      const evDate = new Date(ev.date);
      return evDate >= start && evDate <= end;
    });

    setWeekEvents(filteredWeekEvents);

    const activeDateEvents = filteredWeekEvents
      .filter(ev => ev.date === formatDate(activeDate))
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    setEvents(activeDateEvents);
  };

  const addEvent = async () => {
    if (user && task.trim().length > 0) {
      const newEventTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      await addDoc(eventsCollection, {
        title: task,
        time: newEventTime.replace(/\s/g, ' ').toUpperCase(),
        subtitle: '',
        color: COLOR_PALETTE[0],
        userId: user.uid,
        date: formatDate(activeDate),
      });
      setTask('');
      fetchEvents();
    } else {
      Alert.alert('Please enter a task.');
    }
  };

  const deleteEvent = async (id: string) => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          const eventDoc = doc(db, 'events', id);
          await deleteDoc(eventDoc);
          fetchEvents();
        },
        style: 'destructive',
      },
    ]);
  };

  const updateEvent = async () => {
    if (!editingEventId) return;
    const eventDoc = doc(db, 'events', editingEventId);
    await updateDoc(eventDoc, {
      title: editingTitle,
      time: editingTime.replace(/\s/g, ' ').toUpperCase(),
      subtitle: editingSubtitle,
      color: editingColor,
    });
    setEditingEventId(null);
    fetchEvents();
  };

  const handleEditPress = (event: Event) => {
    setEditingEventId(event.id);
    setEditingTitle(event.title);
    setEditingTime(event.time);
    setEditingSubtitle(event.subtitle);
    setEditingColor(event.color);
  };

  const getWeekDates = () => {
    const start = new Date(today);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderEvent = (event: Event, index: number) => {
    const isEditing = editingEventId === event.id;

    return (
      <View key={index} style={styles.eventRow}>
        <View style={styles.eventTimeContainer}>
          <Text style={styles.eventTime}>{event.time}</Text>
          <View style={styles.eventTimeLine} />
        </View>
        <View style={[styles.eventCard, { backgroundColor: event.color }]}>
          {isEditing ? (
            <View style={styles.editCard}>
              <TextInput
                style={styles.editInput}
                value={editingTitle}
                onChangeText={setEditingTitle}
              />
              <TextInput
                style={styles.editTimeInput}
                value={editingTime}
                onChangeText={setEditingTime}
                placeholder="Time (e.g. 09:00 AM)"
                placeholderTextColor="rgba(255,255,255,0.7)"
              />
              <TextInput
                style={styles.editSubtitleInput}
                value={editingSubtitle}
                onChangeText={setEditingSubtitle}
                placeholder="Description"
                placeholderTextColor="rgba(255,255,255,0.7)"
              />
              <View style={styles.colorPalette}>
                {COLOR_PALETTE.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      editingColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setEditingColor(color)}
                  />
                ))}
              </View>
              <TouchableOpacity onPress={updateEvent} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity onPress={() => handleEditPress(event)} style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.subtitle ? <Text style={styles.eventSubtitle}>{event.subtitle}</Text> : null}
              </TouchableOpacity>
              <View style={styles.eventActions}>
                <TouchableOpacity onPress={() => deleteEvent(event.id)}>
                  <Feather name="trash-2" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Feather name="menu" size={22} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.menuTextContainer}>
        <Text style={styles.headerDateTitle}>
          Today: {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>
        <Text style={styles.menuText}>
          Selected date: {activeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>
      </View>

      <View style={styles.weekSelector}>
        {weekDates.map((dayDate, index) => {
          const dayName = daysOfWeek[dayDate.getDay()];
          const isSelected = formatDate(dayDate) === formatDate(activeDate);
          const dayColors = weekEvents
            .filter(ev => ev.date === formatDate(dayDate))
            .map(ev => ev.color);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveDate(new Date(dayDate))}
              style={[styles.dayBox, isSelected && styles.selectedDayBox]}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{dayName}</Text>
              <Text style={[styles.dateNumber, isSelected && styles.selectedDateNumber]}>
                {dayDate.getDate()}
              </Text>
              <View style={styles.dotsContainer}>
                {dayColors.map((color, i) => (
                  <View key={i} style={[styles.dot, { backgroundColor: color }]} />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.timelineContainer} showsVerticalScrollIndicator={false}>
        {events.length > 0 ? events.map(renderEvent) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.noEventsText}>No events for this day.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          placeholderTextColor="#A0A0A0"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addEvent} activeOpacity={0.8}>
          <AntDesign name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 12 
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F7F7F7',
  },
  menuTextContainer: { 
    paddingHorizontal: 20, 
    paddingBottom: 10 
  },
  headerDateTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#1A1A1A', 
    letterSpacing: -0.3 
  },
  menuText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#666', 
    marginTop: 2 
  },
  weekSelector: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10
  },
  dayBox: { 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 44,
    backgroundColor: 'transparent'
  },
  selectedDayBox: { 
    backgroundColor: '#008080', 
    shadowColor: '#008080',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  dayText: { 
    fontSize: 12, 
    fontWeight: '600',
    color: '#8E8E93' 
  },
  selectedDayText: { 
    color: 'rgba(255,255,255,0.85)' 
  },
  dateNumber: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1C1C1E',
    marginTop: 4 
  },
  selectedDateNumber: { 
    color: '#FFFFFF' 
  },
  dotsContainer: { 
    flexDirection: 'row', 
    marginTop: 4,
    minHeight: 6
  },
  dot: { 
    width: 5, 
    height: 5, 
    borderRadius: 2.5, 
    marginHorizontal: 1.5 
  },
  timelineContainer: { 
    flex: 1, 
    paddingHorizontal: 20,
    paddingTop: 5
  },
  eventRow: { 
    flexDirection: 'row', 
    marginBottom: 16,
    alignItems: 'stretch'
  },
  eventTimeContainer: { 
    alignItems: 'flex-end', 
    width: 70, 
    marginRight: 15,
    paddingTop: 2
  },
  eventTime: { 
    fontSize: 13, 
    fontWeight: '600',
    color: '#666' 
  },
  eventTimeLine: { 
    flex: 1, 
    width: 2, 
    backgroundColor: '#F0F0F0', 
    marginTop: 8,
    borderRadius: 1,
    alignSelf: 'flex-end',
    marginRight: 10
  },
  eventCard: { 
    flex: 1, 
    borderRadius: 16, 
    padding: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 2 
  },
  eventTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#FFFFFF', 
  },
  eventSubtitle: { 
    fontSize: 13, 
    color: 'rgba(255,255,255,0.9)', 
    marginTop: 4 
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  noEventsText: { 
    fontSize: 15, 
    color: '#A0A0A0',
    fontWeight: '500'
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5'
  },
  input: { 
    flex: 1, 
    backgroundColor: '#F8F9FA',
    borderRadius: 24, 
    paddingVertical: 12, 
    paddingHorizontal: 18, 
    fontSize: 15, 
    color: '#1A1A1A', 
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },
  addButton: { 
    backgroundColor: '#008080', 
    width: 48,
    height: 48,
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#008080',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3
  },
  editCard: { 
    flex: 1, 
    flexDirection: 'column' 
  },
  editInput: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.6)', 
    marginBottom: 8,
    paddingVertical: 2
  },
  editTimeInput: { 
    fontSize: 14, 
    color: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.6)', 
    marginBottom: 8,
    paddingVertical: 2
  },
  editSubtitleInput: { 
    fontSize: 14, 
    color: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.6)', 
    marginBottom: 12, 
    minHeight: 36, 
    paddingVertical: 2 
  },
  colorPalette: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 12 
  },
  colorOption: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    marginRight: 8, 
    borderWidth: 2, 
    borderColor: 'transparent' 
  },
  selectedColor: { 
    borderColor: '#FFFFFF' 
  },
  saveButton: { 
    backgroundColor: 'rgba(255,255,255,0.25)', 
    borderRadius: 8, 
    paddingVertical: 6, 
    paddingHorizontal: 14, 
    alignSelf: 'flex-start' 
  },
  saveButtonText: { 
    color: 'white', 
    fontWeight: '700',
    fontSize: 13
  },
  eventActions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingLeft: 10 
  }
});

export default Home;