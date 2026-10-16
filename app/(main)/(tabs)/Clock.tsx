import React, { useState, useEffect } from 'react';
import {StyleSheet,View,Text,ScrollView,TouchableOpacity,Switch,Modal,TextInput,Alert,Platform,} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, AntDesign } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { db, auth } from "../../../FirebaseConfig";
import {collection,addDoc,getDocs,updateDoc,deleteDoc,doc,} from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

const COLOR_PALETTE = {
  primary: '#008080',
  textDark: '#333',
  textLight: '#888',
  background: '#fff',
  cardBackground: '#f5f5f5',
  switchActive: '#FF4500',
  switchInactive: '#e0e0e0',
  darkBackground: '#1c1c1e',
  darkText: '#fff',
  darkCardBackground: '#2c2c2e',
  secondary: '#FFD700',
};

interface Alarm {
  id: string;
  time: string;
  label: string;
  repeat: string;
  repeatDays: string[];
  isActive: boolean;
}

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface RepeatDaysSelectorProps {
  selectedDays: string[];
  onToggleDay: (day: string) => void;
}

const RepeatDaysSelector = ({ selectedDays, onToggleDay }: RepeatDaysSelectorProps) => (
  <View style={repeatDaysStyles.container}>
    {daysOfWeek.map((day) => {
      const isSelected = selectedDays.includes(day);
      return (
        <TouchableOpacity
          key={day}
          style={[
            repeatDaysStyles.dayButton,
            isSelected ? repeatDaysStyles.dayButtonSelected : repeatDaysStyles.dayButtonUnselected
          ]}
          onPress={() => onToggleDay(day)}
        >
          <Text style={[
            repeatDaysStyles.dayText,
            isSelected ? repeatDaysStyles.dayTextSelected : repeatDaysStyles.dayTextUnselected
          ]}>
            {day[0]}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const repeatDaysStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 10,
  },
  dayButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonUnselected: {
    backgroundColor: COLOR_PALETTE.cardBackground,
  },
  dayButtonSelected: {
    backgroundColor: COLOR_PALETTE.primary,
    borderWidth: 1,
    borderColor: COLOR_PALETTE.secondary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dayTextUnselected: {
    color: COLOR_PALETTE.textDark,
  },
  dayTextSelected: {
    color: COLOR_PALETTE.darkText,
  },
});

const Clock = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [currentDisplayTime, setCurrentDisplayTime] = useState(new Date());
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [pickerTime, setPickerTime] = useState<Date>(new Date());
  const [editRepeatDays, setEditRepeatDays] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const parseTimeStringToDate = (timeStr: string): Date => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const sortAlarms = (list: Alarm[]) => {
    return list.sort((a, b) => {
      const parseTime = (t: string) => {
        const [time, modifier] = t.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      return parseTime(a.time) - parseTime(b.time);
    });
  };

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'alarms'));
        const alarmList: Alarm[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          alarmList.push({
            id: docSnap.id,
            time: data.time || '12:00 AM',
            label: data.label || 'Alarm',
            repeat: data.repeat || 'Once',
            isActive: data.isActive ?? true,
            repeatDays: data.repeatDays || [],
          });
        });
        setAlarms(sortAlarms(alarmList));
      } catch (error) {
        console.error('Error loading alarms:', error);
      }
    };
    fetchAlarms();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDisplayTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleAlarm = async (id: string, currentValue: boolean) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const alarmRef = doc(db, 'users', user.uid, 'alarms', id);
      await updateDoc(alarmRef, { isActive: !currentValue });
      setAlarms((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
      );
    } catch (error) {
      console.error('Error toggling alarm:', error);
    }
  };

  const startNewAlarm = () => {
    const now = new Date();
    setSelectedAlarm(null);
    setEditTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    setEditLabel('Alarm');
    setPickerTime(now);
    setEditRepeatDays([]);
    setModalVisible(true);
    setShowPicker(false);
  };

  const openEditModal = (alarm: Alarm) => {
    setSelectedAlarm(alarm);
    setEditTime(alarm.time);
    setEditLabel(alarm.label);
    setPickerTime(parseTimeStringToDate(alarm.time));
    setEditRepeatDays(alarm.repeatDays || []);
    setModalVisible(true);
    setShowPicker(false);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowPicker(false);
    if (event.type === 'dismissed') return;
    if (selectedTime) {
      setPickerTime(selectedTime);
      const formatted = selectedTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setEditTime(formatted);
    }
  };

  const onToggleDay = (day: string) => {
    setEditRepeatDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const saveEdit = async () => {
    try {
      if (!editTime || !editLabel) {
        Alert.alert('⚠️ Missing Info', 'Please select time and enter a label.');
        return;
      }
      const repeatDisplay = editRepeatDays.length === 0
        ? 'Once'
        : editRepeatDays.map(d => d[0]).join('');

      const user = auth.currentUser;
      if (!user) return;

      if (selectedAlarm) {
        const alarmRef = doc(db, 'users', user.uid, 'alarms', selectedAlarm.id);
        await updateDoc(alarmRef, {
          time: editTime,
          label: editLabel,
          repeat: repeatDisplay,
          repeatDays: editRepeatDays,
        });
        setAlarms(prev =>
          sortAlarms(
            prev.map(a => a.id === selectedAlarm.id
              ? { ...a, time: editTime, label: editLabel, repeat: repeatDisplay, repeatDays: editRepeatDays }
              : a
            )
          )
        );
      } else {
        const newAlarm: Omit<Alarm, 'id'> = {
          time: editTime,
          label: editLabel,
          repeat: repeatDisplay,
          repeatDays: editRepeatDays,
          isActive: true,
        };
        const docRef = await addDoc(collection(db, 'users', user.uid, 'alarms'), newAlarm);
        setAlarms(prev => sortAlarms([...prev, { id: docRef.id, ...newAlarm } as Alarm]));
      }

      setModalVisible(false);
      setSelectedAlarm(null);
      setEditTime('');
      setEditLabel('');
      setEditRepeatDays([]);
      Alert.alert('Success', selectedAlarm ? 'Alarm updated!' : 'New alarm added!');
    } catch (error) {
      console.error('Error saving alarm:', error);
      Alert.alert('Error', 'Failed to save alarm.');
    }
  };

  const deleteAlarm = async () => {
    if (!selectedAlarm) return;
    try {
      const user = auth.currentUser;
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'alarms', selectedAlarm.id));
      setAlarms(prev => prev.filter(a => a.id !== selectedAlarm.id));
      setModalVisible(false);
      Alert.alert('🗑️ Deleted', 'Alarm removed successfully.');
    } catch (error) {
      console.error('Error deleting alarm:', error);
      Alert.alert('Error', 'Failed to delete alarm.');
    }
  };

  const formattedTime = currentDisplayTime
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    .split(' ');

  const renderAlarmCard = (alarm: Alarm) => {
    const repeatText = alarm.repeatDays.length > 0 ? alarm.repeatDays.map(d => d[0]).join('') : 'Once';
    return (
      <TouchableOpacity key={alarm.id} style={styles.alarmCard} onPress={() => openEditModal(alarm)}>
        <View style={styles.alarmContent}>
          <Text style={styles.alarmTime}>{alarm.time}</Text>
          <Text style={styles.alarmRepeat}>{alarm.label} ({repeatText})</Text>
        </View>
        <Switch
          trackColor={{ false: COLOR_PALETTE.switchInactive, true: COLOR_PALETTE.switchActive }}
          thumbColor={COLOR_PALETTE.background}
          onValueChange={() => toggleAlarm(alarm.id, alarm.isActive)}
          value={alarm.isActive}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Feather name="menu" size={24} color={COLOR_PALETTE.textDark} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications' as never)}>
          <Feather name="bell" size={24} color={COLOR_PALETTE.textDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.timeDisplayContainer}>
        <Text style={styles.mainTime}>{formattedTime[0]}</Text>
        <Text style={styles.ampmText}>{formattedTime[1]}</Text>
      </View>

      <ScrollView style={styles.alarmsContainer}>
        <View style={styles.alarmsHeader}>
          <Text style={styles.alarmsTitle}>Alarms</Text>
          <TouchableOpacity onPress={startNewAlarm}>
            <AntDesign name="plus" size={24} color={COLOR_PALETTE.textDark} />
          </TouchableOpacity>
        </View>

        {alarms.map(renderAlarmCard)}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal transparent animationType="slide" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: COLOR_PALETTE.darkBackground }]}>
            <Text style={[styles.modalTitle, { color: COLOR_PALETTE.darkText }]}>{selectedAlarm ? 'Edit Alarm' : 'New Alarm'}</Text>
            <Text style={[styles.modalTimeDisplay, { color: COLOR_PALETTE.darkText }]}>{editTime || 'Select Time'}</Text>

            <TouchableOpacity style={styles.timeSelectButton} onPress={() => setShowPicker(true)}>
              <Text style={styles.buttonText}>Change Time</Text>
            </TouchableOpacity>

            {showPicker && pickerTime && (
              <DateTimePicker
                value={pickerTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
              />
            )}

            <RepeatDaysSelector selectedDays={editRepeatDays} onToggleDay={onToggleDay} />

            <TextInput
              style={[styles.input, { borderColor: COLOR_PALETTE.darkText, color: COLOR_PALETTE.darkText, backgroundColor: COLOR_PALETTE.darkCardBackground }]}
              value={editLabel}
              onChangeText={setEditLabel}
              placeholder="Enter label"
              placeholderTextColor={COLOR_PALETTE.textLight}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              {selectedAlarm && (
                <TouchableOpacity style={styles.deleteButton} onPress={deleteAlarm}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
 
  container: { 
    flex: 1, 
    backgroundColor: COLOR_PALETTE.background 
  },

 
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  timeDisplayContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    paddingVertical: 40,
  },
  mainTime: { 
    fontSize: 72, 
    fontWeight: '300', 
    color: COLOR_PALETTE.textDark 
  },
  ampmText: { 
    fontSize: 24, 
    fontWeight: '500', 
    color: COLOR_PALETTE.textDark, 
    marginLeft: 5 
  },

  alarmsContainer: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  alarmsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  alarmsTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLOR_PALETTE.textDark 
  },
  alarmCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLOR_PALETTE.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alarmContent: { 
    flexDirection: 'column', 
    alignItems: 'flex-start' 
  },
  alarmTime: { 
    fontSize: 36, 
    fontWeight: '500', 
    color: COLOR_PALETTE.textDark, 
    marginRight: 15 
  },
  alarmRepeat: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: COLOR_PALETTE.textLight, 
    marginTop: 5 
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { 
    borderRadius: 20, 
    padding: 20, 
    width: '90%', 
    elevation: 5 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  modalTimeDisplay: { 
    fontSize: 50, 
    fontWeight: '300', 
    textAlign: 'center', 
    marginTop: 10, 
    marginBottom: 10 
  },
  timeSelectButton: { 
    backgroundColor: COLOR_PALETTE.switchActive, 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginBottom: 20 
  },

  input: { 
    borderWidth: 1, 
    borderRadius: 10, 
    padding: 10, 
    marginBottom: 15 
  },


  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },
  saveButton: { 
    backgroundColor: COLOR_PALETTE.primary, 
    padding: 10, 
    borderRadius: 10, 
    flex: 1, 
    marginRight: 10, 
    alignItems: 'center' 
  },
  deleteButton: { 
    backgroundColor: COLOR_PALETTE.switchActive, 
    padding: 10, 
    borderRadius: 10, 
    flex: 1, 
    marginLeft: 10, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  cancelText: { 
    color: COLOR_PALETTE.textLight, 
    textAlign: 'center', 
    marginTop: 15, 
    fontWeight: '500' 
  },
});

export default Clock;

