import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";
import { db } from "../../FirebaseConfig"; 
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLOR_PALETTE = {
    primary: '#008080',
    text: '#333',
    lightGray: '#ccc',
    border: '#eee',
    icon: '#555',
    white: '#fff',
};

interface SettingItemProps {
    iconName: string;
    iconLibrary?: 'Feather' | 'Ionicons' | 'AntDesign';
    label: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    onPress?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
    iconName, 
    iconLibrary = 'Feather', 
    label, 
    value, 
    onValueChange, 
    onPress 
}) => {
    const IconComponent = iconLibrary === 'Ionicons' 
        ? Ionicons 
        : iconLibrary === 'AntDesign' 
        ? AntDesign 
        : Feather;

    const isSwitch = onValueChange !== undefined;

    return (
        <TouchableOpacity 
            style={styles.row} 
            onPress={onPress} 
            disabled={isSwitch}
        >
            <View style={styles.iconContainer}>
                <IconComponent name={iconName as any} size={22} color={COLOR_PALETTE.icon} />
            </View>
            
            <Text style={styles.label}>{label}</Text>

            <View style={styles.actionContainer}>
                {isSwitch ? (
                    <Switch
                        value={value}
                        onValueChange={onValueChange}
                        trackColor={{ false: COLOR_PALETTE.lightGray, true: COLOR_PALETTE.primary }}
                        thumbColor={COLOR_PALETTE.white}
                    />
                ) : (
                    <Feather name="chevron-right" size={20} color={COLOR_PALETTE.lightGray} />
                )}
            </View>
        </TouchableOpacity>
    );
};

export default function Settings() {
    const navigation = useNavigation();
    const auth = getAuth();
    const user = auth.currentUser;
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const fetchPreferences = async () => {
            if (user) {
                try {
                    const prefRef = doc(db, "preferences", user.uid);
                    const snapshot = await getDoc(prefRef);

                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        setTheme(data.theme || "light");
                        setNotificationsEnabled(data.notificationsEnabled ?? true);
                    } else {
                        await setDoc(prefRef, {
                            theme: "light",
                            notificationsEnabled: true,
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        };

        fetchPreferences();
    }, [user]);

    const updatePreferences = async (field: string, value: any) => {
        if (user) {
            try {
                const prefRef = doc(db, "preferences", user.uid);
                await setDoc(prefRef, { [field]: value }, { merge: true });
            } catch (error) {
                console.error(error);
                Alert.alert("Error", `Could not save preference for ${field}.`);
            }
        }
    };
    
    const handleThemeToggle = (val: boolean) => {
        const newTheme = val ? "dark" : "light";
        setTheme(newTheme);
        updatePreferences("theme", newTheme);
    };

    const handleNotificationsToggle = (val: boolean) => {
        setNotificationsEnabled(val);
        updatePreferences("notificationsEnabled", val);
    };

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: () => {
                console.log("User logged out");
            }},
        ]);
    };
    
    const showPlaceholder = (item: string) => {
        Alert.alert("Navigation", `Navigating to ${item}...`);
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={COLOR_PALETTE.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
            </View>

            <View style={styles.settingsList}>
                <SettingItem
                    iconName="notifications-outline"
                    iconLibrary="Ionicons"
                    label="Notification"
                    value={notificationsEnabled}
                    onValueChange={handleNotificationsToggle}
                />
                <SettingItem
                    iconName={theme === 'dark' ? "moon-o" : "sun-o"}
                    iconLibrary="AntDesign"
                    label="Dark Mode"
                    value={theme === "dark"}
                    onValueChange={handleThemeToggle}
                />
                <SettingItem
                    iconName="star-outline"
                    iconLibrary="Ionicons"
                    label="Rate App"
                    onPress={() => showPlaceholder("Rate App")}
                />
                <SettingItem
                    iconName="share-2"
                    iconLibrary="Feather"
                    label="Share App"
                    onPress={() => showPlaceholder("Share App")}
                />
                <SettingItem
                    iconName="lock"
                    iconLibrary="Feather"
                    label="Privacy Policy"
                    onPress={() => showPlaceholder("Privacy Policy")}
                />
                <SettingItem
                    iconName="file-text-o"
                    iconLibrary="AntDesign"
                    label="Terms and Conditions"
                    onPress={() => showPlaceholder("Terms and Conditions")}
                />
                <SettingItem
                    iconName="book-outline"
                    iconLibrary="Ionicons"
                    label="Cookies Policy"
                    onPress={() => showPlaceholder("Cookies Policy")}
                />
                <SettingItem
                    iconName="mail-outline"
                    iconLibrary="Ionicons"
                    label="Contact"
                    onPress={() => showPlaceholder("Contact")}
                />
                <SettingItem
                    iconName="message-square"
                    iconLibrary="Feather"
                    label="Feedback"
                    onPress={() => showPlaceholder("Feedback")}
                />
                <SettingItem
                    iconName="log-out"
                    iconLibrary="Feather"
                    label="Logout"
                    onPress={handleLogout}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLOR_PALETTE.white 
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLOR_PALETTE.border,
    },
    backButton: {
        paddingRight: 15,
    },
    title: { 
        fontSize: 22, 
        fontWeight: "bold", 
        flex: 1 
    },
    settingsList: {
        paddingHorizontal: 15,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLOR_PALETTE.border,
    },
    iconContainer: {
        width: 35,
        marginRight: 10,
        alignItems: 'center',
    },
    label: { 
        fontSize: 16, 
        color: COLOR_PALETTE.text, 
        flex: 1 
    },
    actionContainer: {
        paddingLeft: 10,
    }
});
