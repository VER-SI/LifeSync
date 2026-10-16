import { Stack, router } from "expo-router";
import React from "react";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLOR_PALETTE = {
    primary: '#008080',
    background: '#f8f8f8',
    card: '#fff',
    text: '#333',
    secondaryText: '#777',
    border: '#eee',
    highlight: '#E53935',
    icon: '#444',
};

const MOCK_USER = {
    name: "Haziq Hazri",
    email: "haziq@gmail.com",
    avatarUrl: "https://picsum.photos/seed/haziq/100/100",
    cheeseIcon: "https://www.flaticon.com/svg/v3/svg/668/668045.svg",
};

const ProfileMenuItem: React.FC<{
    iconName: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap | keyof typeof Feather.glyphMap;
    title: string;
    onPress: () => void;
    color?: string;
    library?: 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
}> = ({ iconName, title, onPress, color = COLOR_PALETTE.icon, library = 'Ionicons' }) => {
    let IconComponent;
    if (library === 'MaterialCommunityIcons') {
        IconComponent = MaterialCommunityIcons;
    } else if (library === 'Feather') {
        IconComponent = Feather;
    } else {
        IconComponent = Ionicons;
    }

    return (
        <TouchableOpacity style={menuStyles.itemContainer} onPress={onPress}>
            <View style={menuStyles.iconBackground}>
                <IconComponent name={iconName as any} size={24} color={color} />
            </View>
            <Text style={menuStyles.itemTitle}>{title}</Text>
            <Ionicons name="chevron-forward-outline" size={20} color={COLOR_PALETTE.secondaryText} />
        </TouchableOpacity>
    );
};

export default function Profile() {
    const insets = useSafeAreaInsets();

    const handleAction = (action: string) => {
        console.log(`Action: ${action}`);
        if (action === 'Log Out') {
            router.replace('/(main)/(tabs)/Home');
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen 
                options={{
                    headerShown: true,
                    title: "Profile",
                    headerTitleAlign: 'left',
                    headerTintColor: "black",
                    headerStyle: {
                        backgroundColor: COLOR_PALETTE.card,
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color={COLOR_PALETTE.icon} />
                        </TouchableOpacity>
                    ),
                }} 
            />
            <ScrollView style={styles.scrollContainer}>
                <View style={profileStyles.headerCard}>
                    <Image 
                        source={{ uri: "https://www.pngall.com/wp-content/uploads/2016/06/Cheese-PNG-Image.png" }}
                        style={profileStyles.avatar}
                        resizeMode="contain"
                    />
                    <View style={profileStyles.info}>
                        <Text style={profileStyles.name}>{MOCK_USER.name}</Text>
                        <Text style={profileStyles.email}>{MOCK_USER.email}</Text>
                    </View>
                </View>
                <View style={menuStyles.menuGroup}>
                    <ProfileMenuItem
                        title="Edit Profile"
                        iconName="create-outline"
                        onPress={() => handleAction('Edit Profile')}
                    />
                    <ProfileMenuItem
                        title="Change Account"
                        iconName="people-outline"
                        onPress={() => handleAction('Change Account')}
                    />
                    <ProfileMenuItem
                        title="Change Password"
                        iconName="lock-closed-outline"
                        onPress={() => handleAction('Change Password')}
                    />
                    <ProfileMenuItem
                        title="Log Out"
                        iconName="log-out-outline"
                        color={COLOR_PALETTE.highlight}
                        onPress={() => handleAction('Log Out')}
                    />
                </View>
                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR_PALETTE.background,
    },
    scrollContainer: {
        flex: 1,
    },
});

const profileStyles = StyleSheet.create({
    headerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLOR_PALETTE.card,
        padding: 20,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLOR_PALETTE.border,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLOR_PALETTE.text,
    },
    email: {
        fontSize: 14,
        color: COLOR_PALETTE.secondaryText,
    },
});

const menuStyles = StyleSheet.create({
    menuGroup: {
        backgroundColor: COLOR_PALETTE.card,
        marginHorizontal: 0,
        borderRadius: 0,
        borderTopWidth: 1,
        borderTopColor: COLOR_PALETTE.border,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLOR_PALETTE.border,
        backgroundColor: COLOR_PALETTE.card,
    },
    iconBackground: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    itemTitle: {
        flex: 1,
        fontSize: 16,
        color: COLOR_PALETTE.text,
    },
});
