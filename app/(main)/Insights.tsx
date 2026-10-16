import React, { useState, useEffect, useMemo } from "react";
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');
const CARD_MARGIN = 20;
const CHART_BAR_MAX_WIDTH = width - (CARD_MARGIN * 2) - 170;
const COLOR_PALETTE = {
    primary: '#008080',
    background: '#f8f8f8',
    card: '#fff',
    text: '#333',
    secondaryText: '#777',
    border: '#eee',
    leisure: '#4caf50',
    work: '#ff9800',
    sleep: '#2196f3',
    freeTime: '#e91e63',
    gaming: '#00bcd4',
};

const MOCK_ACTIVITY_DATA = {
    work: 8,
    leisure: 3,
    sleep: 7,
};

const MOCK_GAMING_DATA = [
    { day: 'Mon', hours: 1.5 },
    { day: 'Tue', hours: 0.5 },
    { day: 'Wed', hours: 2.0 },
    { day: 'Thu', hours: 1.0 },
    { day: 'Fri', hours: 3.5 },
    { day: 'Sat', hours: 5.0 },
    { day: 'Sun', hours: 4.0 },
];

const TimeSpentGraph: React.FC<{ data: typeof MOCK_ACTIVITY_DATA }> = ({ data }) => {
    const totalHours = 24;
    const activities = [
        { key: 'work', label: 'Work/Study', hours: data.work, color: COLOR_PALETTE.work, icon: 'briefcase-outline' },
        { key: 'sleep', label: 'Sleep', hours: data.sleep, color: COLOR_PALETTE.sleep, icon: 'bed-outline' },
        { key: 'leisure', label: 'Leisure/Hobbies', hours: data.leisure, color: COLOR_PALETTE.leisure, icon: 'game-controller-outline' },
    ];

    return (
        <View style={graphStyles.container}>
            <Text style={graphStyles.title}>Daily Time Allocation (24h Average)</Text>
            {activities.map(activity => {
                const barWidth = (activity.hours / totalHours) * CHART_BAR_MAX_WIDTH;
                return (
                    <View key={activity.key} style={graphStyles.barRow}>
                        <Ionicons name={activity.icon as any} size={20} color={activity.color} style={{ width: 25, marginRight: 8 }} />
                        <Text style={graphStyles.label}>{activity.label}</Text>
                        <View style={graphStyles.barWrapper}>
                            <View style={[graphStyles.bar, { width: barWidth, backgroundColor: activity.color }]} />
                        </View>
                        <Text style={graphStyles.hoursText}>{activity.hours}h</Text>
                    </View>
                );
            })}
        </View>
    );
};

const WeeklyGamingGraph: React.FC<{ data: typeof MOCK_GAMING_DATA }> = ({ data }) => {
    const absoluteMaxHours = 6;
    const scaleFactor = CHART_BAR_MAX_WIDTH / absoluteMaxHours;

    return (
        <View style={graphStyles.container}>
            <Text style={graphStyles.title}>Time Spent Gaming (Weekly)</Text>
            {data.map(dayData => {
                const barWidth = dayData.hours * scaleFactor;
                return (
                    <View key={dayData.day} style={graphStyles.barRow}>
                        <Text style={[graphStyles.label, { width: 50, fontWeight: 'bold' }]}>{dayData.day}</Text>
                        <View style={graphStyles.barWrapper}>
                            <View style={[graphStyles.bar, { width: barWidth, backgroundColor: COLOR_PALETTE.gaming }]} />
                        </View>
                        <Text style={graphStyles.hoursText}>{dayData.hours.toFixed(1)}h</Text>
                    </View>
                );
            })}
        </View>
    );
};

const InsightCard: React.FC<{ title: string; value: string; icon: string; color: string }> = ({ title, value, icon, color }) => (
    <View style={[insightStyles.card, { borderLeftColor: color }]}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={insightStyles.value}>{value}</Text>
        <Text style={insightStyles.title}>{title}</Text>
    </View>
);

export default function Insights() {
    const auth = getAuth();
    const user = auth.currentUser;
    const [activityData, setActivityData] = useState<typeof MOCK_ACTIVITY_DATA | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const fetchInsights = async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            setActivityData(MOCK_ACTIVITY_DATA);
            setIsLoading(false);
        };
        fetchInsights();
    }, [user]);

    const freeTimeHours = useMemo(() => {
        if (!activityData) return 0;
        const occupied = activityData.work + activityData.leisure + activityData.sleep;
        return 24 - occupied;
    }, [activityData]);

    const mostSpentActivity = useMemo(() => {
        if (!activityData) return "N/A";
        const activities = [
            { name: 'Work', hours: activityData.work },
            { name: 'Leisure', hours: activityData.leisure },
            { name: 'Sleep', hours: activityData.sleep }
        ];
        return activities.reduce((max, current) => current.hours > max.hours ? current : max, activities[0]).name;
    }, [activityData]);

    if (isLoading || !activityData) {
        return (
            <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
                <Text style={styles.loadingText}>Loading Insights...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/(main)/(tabs)/Home')} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={COLOR_PALETTE.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Your Daily Insights</Text>
            </View>

            <View style={insightStyles.cardRow}>
                <InsightCard title="Available Free Time (Avg.)" value={`${freeTimeHours}h`} icon="timer-outline" color={COLOR_PALETTE.freeTime} />
                <InsightCard title="Most Spent Time" value={mostSpentActivity} icon="stats-chart-outline" color={COLOR_PALETTE.work} />
            </View>

            <TimeSpentGraph data={activityData} />
            <WeeklyGamingGraph data={MOCK_GAMING_DATA} />


        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR_PALETTE.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLOR_PALETTE.background,
    },
    loadingText: {
        fontSize: 18,
        color: COLOR_PALETTE.secondaryText,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLOR_PALETTE.card,
    },
    backButton: {
        paddingRight: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: COLOR_PALETTE.text,
        flex: 1,
    },
    noteContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noteText: {
        fontSize: 12,
        color: COLOR_PALETTE.secondaryText,
    },
});

const insightStyles = StyleSheet.create({
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        gap: 10,
    },
    card: {
        flex: 1,
        backgroundColor: COLOR_PALETTE.card,
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        borderLeftWidth: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    title: {
        fontSize: 12,
        color: COLOR_PALETTE.secondaryText,
        textAlign: 'center',
        marginTop: 5,
    },
    value: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLOR_PALETTE.text,
        marginTop: 5,
    },
});

const graphStyles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        padding: 20,
        backgroundColor: COLOR_PALETTE.card,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: COLOR_PALETTE.text,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    label: {
        width: 90,
        fontSize: 14,
        color: COLOR_PALETTE.text,
    },
    barWrapper: {
        flex: 1,
        height: 10,
        backgroundColor: COLOR_PALETTE.border,
        borderRadius: 5,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: 5,
    },
    hoursText: {
        fontSize: 14,
        fontWeight: 'bold',
        width: 40,
        textAlign: 'right',
        color: COLOR_PALETTE.secondaryText,
    },
});
