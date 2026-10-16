import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { DrawerActions, NavigationProp, useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../../FirebaseConfig';


const { width } = Dimensions.get('window');

const TILE_WIDTH = width / 8;
const COLOR_PALETTE = {
    primary: '#008080',
    accent1: '#66D2B1',
    accent2: '#FFB880',
    accent3: '#AA88FF',
    text: '#333',
    lightGray: '#ccc',
    white: '#fff',
    background: '#f8f8f8',
};

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

type RootStackParamList = {
    Calendar: undefined;
    Notifications: undefined;
};

interface Event {
    id: string;
    title: string;
    time: string;
    subtitle: string;
    color: string;
    location: string;
    date: string;
    userId: string;
}


const Calendar = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const auth = getAuth();
    const user = auth.currentUser;
    const eventsCollection = collection(db, 'events');

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [monthEvents, setMonthEvents] = useState<Event[]>([]);
    const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newSubtitle, setNewSubtitle] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newColor, setNewColor] = useState(COLOR_PALETTE.accent1);

    const getFirstDayOfMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), 1);
    const getLastDayOfMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const fetchMonthEvents = useCallback(async () => {
        if (!user) return;
        const q = query(eventsCollection, where('userId', '==', user.uid));
        try {
            const snapshot = await getDocs(q);
            const fetchedEvents: Event[] = snapshot.docs.map(
                (doc) => ({ ...doc.data(), id: doc.id } as Event)
            );
            const currentMonth = formatDate(currentDate).substring(0, 7);
            const monthFiltered = fetchedEvents.filter(
                (e) => e.date.substring(0, 7) === currentMonth
            );
            setMonthEvents(monthFiltered);
            setSelectedEvents(
                monthFiltered.filter((e) => e.date === formatDate(selectedDate))
            );
        } catch (err) {
            console.error(err);
        }
    }, [user, currentDate, selectedDate]);

    useEffect(() => {
        fetchMonthEvents();
    }, [fetchMonthEvents]);

    const changeMonth = (direction: 'next' | 'prev') => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        setCurrentDate(newDate);
        setSelectedDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    };

    const openAddModal = () => {
        setEditingEvent(null);
        setNewTitle('');
        setNewTime('');
        setNewSubtitle('');
        setNewLocation('');
        setNewColor(COLOR_PALETTE.accent1);
        setModalVisible(true);
    };

    const openEditModal = (event: Event) => {
        setEditingEvent(event);
        setNewTitle(event.title);
        setNewTime(event.time);
        setNewSubtitle(event.subtitle);
        setNewLocation(event.location);
        setNewColor(event.color);
        setModalVisible(true);
    };

    const saveEvent = async () => {
        if (!user) return;
        if (!newTitle) {
            console.log('Title required');
            return;
        }

        try {
            if (editingEvent) {
                const eventDoc = doc(db, 'events', editingEvent.id);
                await updateDoc(eventDoc, {
                    title: newTitle,
                    time: newTime,
                    subtitle: newSubtitle,
                    location: newLocation,
                    color: newColor,
                });
            } else {
                await addDoc(eventsCollection, {
                    title: newTitle,
                    time:
                        newTime ||
                        new Date().toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        }),
                    subtitle: newSubtitle,
                    location: newLocation,
                    color: newColor,
                    date: formatDate(selectedDate),
                    userId: user.uid,
                });
            }
            setModalVisible(false);
            fetchMonthEvents();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteEvent = async (id: string) => {
        Alert.alert('Delete Event', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteDoc(doc(db, 'events', id));
                    fetchMonthEvents();
                },
            },
        ]);
    };

    const renderCalendarDays = () => {
        const firstDay = getFirstDayOfMonth(currentDate);
        const lastDay = getLastDayOfMonth(currentDate);
        const numDays = lastDay.getDate();
        const startingDay = firstDay.getDay();
        const days = [];

        for (let i = 0; i < startingDay; i++)
            days.push(
                <View key={`empty-${i}`} style={styles.calendarDayCell} />
            );

        for (let i = 1; i <= numDays; i++) {
            const dayDate = new Date(
                `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${i}T12:00:00`
            );
            const isSelected = formatDate(dayDate) === formatDate(selectedDate);
            const dayEvents = monthEvents.filter(
                (e) => e.date === formatDate(dayDate)
            );

            days.push(
                <TouchableOpacity
                    key={i}
                    style={[styles.calendarDayCell, isSelected && styles.selectedCalendarDay]}
                    onPress={() => {
                        setSelectedDate(dayDate);
                        setSelectedEvents(dayEvents);
                    }}
                >
                    <Text style={[styles.dayNumber, isSelected && styles.selectedDayNumber]}>
                        {i}
                    </Text>
                    <View style={styles.eventDotContainer}>
                        {dayEvents.slice(0, 3).map((event, idx) => (
                            <View
                                key={idx}
                                style={[styles.eventDot, { backgroundColor: event.color }]}
                            />
                        ))}
                    </View>
                </TouchableOpacity>
            );
        }
        return days;
    };

    const renderSelectedEventCard = (event: Event, index: number) => (
        <View key={index} style={[styles.eventDetailCard, { borderLeftColor: event.color }]}>
            <View style={[styles.cardIcon, { backgroundColor: event.color }]}>
                <Ionicons name="cube-outline" size={20} color="white" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTime}>{event.time}</Text>
                <Text style={styles.cardTitle}>{event.title}</Text>
                <Text style={styles.cardSubtitle}>{event.subtitle || 'No description'}</Text>
                <Text style={styles.cardLocationText}>{event.location || 'Unknown'}</Text>
            </View>
            <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEditModal(event)}>
                    <Feather name="more-vertical" size={20} color="#888" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => deleteEvent(event.id)}
                    style={styles.cardActionDelete}
                >
                    <Feather name="trash-2" size={20} color="#f55" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.topBar}>
                <TouchableOpacity
                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                >
                    <Feather name="menu" size={24} color={COLOR_PALETTE.text} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Notifications' as any)}>
                    <Feather name="bell" size={24} color={COLOR_PALETTE.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.monthSelector}>
                <TouchableOpacity
                    onPress={() => changeMonth('prev')}
                    style={styles.monthNavButton}
                >
                    <Ionicons name="chevron-back" size={24} color={COLOR_PALETTE.text} />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>{`${monthName} ${year}`}</Text>
                <TouchableOpacity
                    onPress={() => changeMonth('next')}
                    style={styles.monthNavButton}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={COLOR_PALETTE.text}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.weekHeader}>
                {daysOfWeek.map((day, i) => (
                    <Text key={i} style={styles.weekDayText}>
                        {day}
                    </Text>
                ))}
            </View>

            <View style={styles.calendarGrid}>{renderCalendarDays()}</View>
            <View style={styles.divider} />

            <ScrollView
                style={styles.eventListContainer}
                contentContainerStyle={styles.eventListContent}
            >
                {selectedEvents.length
                    ? selectedEvents.map(renderSelectedEventCard)
                    : (
                        <Text style={styles.noEventsText}>
                            No planned events for {selectedDate.toDateString()}.
                        </Text>
                    )}
            </ScrollView>

            <TouchableOpacity style={styles.floatingButton} onPress={openAddModal}>
                <AntDesign name="plus" size={30} color={COLOR_PALETTE.white} />
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{editingEvent ? 'Edit Event' : 'Add Event'}</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Title"
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Time (e.g. 09:00 AM)"
                            value={newTime}
                            onChangeText={setNewTime}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Description"
                            value={newSubtitle}
                            onChangeText={setNewSubtitle}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Location"
                            value={newLocation}
                            onChangeText={setNewLocation}
                        />

                        <View style={styles.colorPalette}>
                            {Object.values(COLOR_PALETTE)
                                .filter(
                                    (c) =>
                                        c !== COLOR_PALETTE.text &&
                                        c !== COLOR_PALETTE.white &&
                                        c !== COLOR_PALETTE.lightGray &&
                                        c !== COLOR_PALETTE.background
                                )
                                .map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorOption,
                                            { backgroundColor: color },
                                            newColor === color && styles.selectedColor,
                                        ]}
                                        onPress={() => setNewColor(color)}
                                    />
                                ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={[styles.modalButton, styles.modalButtonCancel]}
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={saveEvent}
                                style={[styles.modalButton, styles.modalButtonSave]}
                            >
                                <Text style={styles.modalButtonTextSave}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR_PALETTE.white
    },
    
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    
    monthSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    
    monthNavButton: {
        padding: 5
    },
    
    monthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1
    },
    
    weekHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    
    weekDayText: {
        width: TILE_WIDTH,
        textAlign: 'center',
        fontWeight: 'bold',
        color: COLOR_PALETTE.text
    },
    
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 5,
        justifyContent: 'flex-start'
    },
    
    calendarDayCell: {
        width: TILE_WIDTH,
        height: TILE_WIDTH * 1.3,
        alignItems: 'center',
        paddingVertical: 3,
        justifyContent: 'flex-start',
        marginHorizontal: 2,
        marginBottom: 4
    },
    
    selectedCalendarDay: {
        backgroundColor: '#E6F0FF',
        borderRadius: 8
    },
    
    dayNumber: {
        fontSize: 14,
        color: COLOR_PALETTE.text
    },
    
    selectedDayNumber: {
        fontWeight: 'bold',
        color: COLOR_PALETTE.primary
    },
    
    eventDotContainer: {
        flexDirection: 'row',
        marginTop: 3,
        height: 5
    },
    
    eventDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 1
    },
    
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 8
    },
    
    eventListContainer: {
        flex: 1
    },
    
    eventListContent: {
        paddingHorizontal: 15,
        paddingBottom: 60
    },
    
    eventDetailCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderLeftWidth: 4,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        elevation: 1,
    },
    
    cardIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginTop: 2
    },
    
    cardContent: {
        flex: 1
    },
    
    cardTime: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4
    },
    
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLOR_PALETTE.text,
        marginBottom: 3
    },
    
    cardSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6
    },
    
    cardLocationText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic'
    },
    
    cardActions: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginLeft: 10,
        paddingTop: 5,
    },
    
    cardActionDelete: {
        marginLeft: 10
    },
    
    noEventsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
        color: '#888'
    },
    
    floatingButton: {
        position: 'absolute',
        bottom: 60,
        right: 18,
        backgroundColor: COLOR_PALETTE.primary,
        width: 55,
        height: 55,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
    },
    
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
    },
    
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15
    },
    
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 10,
        backgroundColor: '#fff'
    },
    
    colorPalette: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10
    },
    
    colorOption: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 12,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    
    selectedColor: {
        borderColor: COLOR_PALETTE.primary,
        borderWidth: 3,
    },
    
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15
    },
    
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    modalButtonCancel: {
        backgroundColor: '#f0f0f0'
    },
    
    modalButtonSave: {
        backgroundColor: COLOR_PALETTE.primary
    },
    
    modalButtonTextSave: {
        color: 'white',
        fontWeight: 'bold'
    }
});

export default Calendar;
