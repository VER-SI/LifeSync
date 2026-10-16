import React from "react";
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- Color Palette ---
const COLOR_PALETTE = {
    primary: '#008080',
    background: '#f8f8f8',
    card: '#fff',
    text: '#333',
    secondaryText: '#777',
    border: '#eee',
    // Notification Icon Colors (simulating different types)
    meeting: '#e91e63', // Red/Pink for urgent/time-based
    task: '#ff9800',    // Orange for tasks
    general: '#2196f3', // Blue for general info
};

// --- Mock Data ---
const MOCK_NOTIFICATIONS = [
    {
        group: "TODAY",
        items: [
            {
                id: 1,
                icon: "calendar-outline",
                color: COLOR_PALETTE.meeting,
                time: "2 MIN AGO",
                message: "Reminder: Test starts in two minutes!",
                urgent: true,
            },
            {
                id: 2,
                icon: "checkmark-circle-outline",
                color: COLOR_PALETTE.task,
                time: "11.00 AM",
                message: "Task 'Assigment' completed successfully.",
            },
            {
                id: 3,
                icon: "time-outline",
                color: COLOR_PALETTE.general,
                time: "08.00 AM",
                message: "You've been active for 3 hours straight. Time for a quick break!",
            },
        ],
    },
    {
        group: "YESTERDAY",
        items: [
            {
                id: 4,
                icon: "document-text-outline",
                color: COLOR_PALETTE.general,
                time: "04.30 PM",
                message: "New weekly report is available for review.",
            },
        ],
    },
];


interface NotificationItemProps {
    iconName: string;
    iconColor: string;
    time: string;
    message: string;
    urgent?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ iconName, iconColor, time, message, urgent }) => (
    <TouchableOpacity 
        style={styles.itemContainer}
        onPress={() => Alert.alert("Notification", message)} 
    >
        <View style={[styles.iconWrapper, { borderColor: iconColor }]}>
            <Ionicons name={iconName as any} size={20} color={iconColor} />
        </View>
        
        <View style={styles.textWrapper}>
            <Text 
                style={[
                    styles.message, 
                    urgent && { fontWeight: 'bold', color: COLOR_PALETTE.meeting }
                ]}
            >
                {message}
            </Text>
            <Text style={styles.time}>{time}</Text>
        </View>
    </TouchableOpacity>
);

export default function Notifications() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/(main)/(tabs)/Home')} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={COLOR_PALETTE.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Notifications</Text>
                <View style={{ width: 24, paddingRight: 15 }} /> 
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {MOCK_NOTIFICATIONS.map(group => (
                    <View key={group.group} style={styles.groupContainer}>
                        <Text style={styles.groupTitle}>{group.group}</Text>
                        <View style={styles.groupItems}>
                            {group.items.map(item => (
                                <NotificationItem
                                    key={item.id}
                                    iconName={item.icon}
                                    iconColor={item.color}
                                    time={item.time}
                                    message={item.message}
                                    urgent={item.urgent}
                                />
                            ))}
                        </View>
                    </View>
                ))}
                
                {MOCK_NOTIFICATIONS.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>You're all caught up!</Text>
                        <Text style={styles.emptySubText}>No new notifications.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR_PALETTE.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: COLOR_PALETTE.card,
        borderBottomWidth: 1,
        borderBottomColor: COLOR_PALETTE.border,
    },
    backButton: {
        paddingRight: 15,
    },
    title: { 
        fontSize: 22, 
        fontWeight: "bold", 
        color: COLOR_PALETTE.text,
        flex: 1,
        textAlign: 'center',
        marginLeft: -24, 
    },
    scrollViewContent: {
        paddingVertical: 10,
    },
    groupContainer: {
        marginBottom: 20,
    },
    groupTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLOR_PALETTE.secondaryText,
        paddingHorizontal: 20,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    groupItems: {
        backgroundColor: COLOR_PALETTE.card,
        paddingHorizontal: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLOR_PALETTE.border,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        fontSize: 15,
        color: COLOR_PALETTE.text,
        marginBottom: 2,
    },
    time: {
        fontSize: 12,
        color: COLOR_PALETTE.secondaryText,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 18,
        color: COLOR_PALETTE.secondaryText,
        fontWeight: 'bold',
    },
    emptySubText: {
        fontSize: 14,
        color: COLOR_PALETTE.secondaryText,
        marginTop: 5,
    }
});
