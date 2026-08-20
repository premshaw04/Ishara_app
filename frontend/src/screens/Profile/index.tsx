import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme, List, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { toggleTheme } from '../../store/slices/appSlice';
import { logout } from '../../store/slices/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { showToast } from '../../components';
import { themeConstants } from '../../theme/themeConstants';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const settings = useSelector((state: RootState) => state.settings);
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);
  const user = useSelector((state: RootState) => state.auth.user);
  
  console.log('ProfileScreen Rendered! user object:', user);

  const handleNavigate = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as any);
  };

  const renderListItem = (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    onPress?: () => void,
    rightText?: string,
    showChevron = true
  ) => (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <View style={styles.listItemLeft}>
        <Ionicons name={icon} size={24} color={theme.colors.onSurfaceVariant} style={styles.listIcon} />
        <Text style={[styles.listTitle, { color: theme.colors.onBackground }]}>{title}</Text>
      </View>
      <View style={styles.listItemRight}>
        {rightText ? (
          <Text style={[styles.listRightText, { color: theme.colors.onSurfaceVariant }]}>{rightText}</Text>
        ) : null}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.userInfo}>
            {user?.profilePic ? (
              <Image 
                key={user.profilePic}
                source={{ uri: user.profilePic }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarPlaceholderText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View style={[styles.userDetails, { flex: 1 }]}>
              <Text style={styles.userName} numberOfLines={1}>{user?.name || 'Guest User'}</Text>
              <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">{user?.email || 'No email provided'}</Text>
              {user?.phoneNumber ? (
                <Text style={[styles.userPhone, { marginTop: 4 }]} numberOfLines={1}>{user.phoneNumber}</Text>
              ) : null}
              {user?.bio ? (
                <Text style={[styles.userBio, { marginTop: 4 }]} numberOfLines={2}>{user.bio}</Text>
              ) : null}
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleNavigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Settings List */}
        <View style={styles.section}>
          {renderListItem('Glove Settings', 'hardware-chip-outline', () => handleNavigate('GloveSettings'))}
          <Divider style={styles.divider} />
          {renderListItem('App Language', 'language-outline', undefined, settings.ttsLanguage)}
          <Divider style={styles.divider} />
          {renderListItem('Speech Voice', 'volume-medium-outline', undefined, settings.ttsVoiceName || 'Default')}
          <Divider style={styles.divider} />
          {renderListItem('Theme', isDarkMode ? 'moon-outline' : 'sunny-outline', () => dispatch(toggleTheme()), isDarkMode ? 'Dark' : 'Light')}
          <Divider style={styles.divider} />
          {renderListItem('Help & Support', 'help-circle-outline')}
          <Divider style={styles.divider} />
          {renderListItem('About Ishara', 'information-circle-outline', () => handleNavigate('About'), 'v1.0.0')}
        </View>

        {/* Logout */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={async () => {
            await dispatch(logout());
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              })
            );
          }}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: themeConstants.spacing.m,
    paddingVertical: themeConstants.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: themeConstants.typography.size.xl,
    fontFamily: themeConstants.typography.fontFamily.bold,
  },
  scrollContent: {
    paddingHorizontal: themeConstants.spacing.m,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: themeConstants.spacing.m,
    borderRadius: themeConstants.radii.l,
    marginBottom: themeConstants.spacing.l,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: themeConstants.spacing.m,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: '#FFF',
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: 24,
  },
  userDetails: {
    marginLeft: themeConstants.spacing.m,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: themeConstants.typography.size.l,
    fontFamily: themeConstants.typography.fontFamily.bold,
    marginBottom: themeConstants.spacing.xs,
  },
  userEmail: {
    color: '#E3EFFF',
    fontSize: themeConstants.typography.size.s,
    fontFamily: themeConstants.typography.fontFamily.regular,
  },
  userPhone: {
    color: '#E3EFFF',
    fontSize: themeConstants.typography.size.xs,
    fontFamily: themeConstants.typography.fontFamily.medium,
  },
  userBio: {
    color: '#FFFFFF',
    fontSize: themeConstants.typography.size.xs,
    fontFamily: themeConstants.typography.fontFamily.regular,
    opacity: 0.9,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: themeConstants.spacing.m,
    paddingVertical: themeConstants.spacing.s,
    borderRadius: themeConstants.radii.m,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: themeConstants.typography.size.s,
    fontFamily: themeConstants.typography.fontFamily.medium,
  },
  section: {
    marginBottom: themeConstants.spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: themeConstants.spacing.m,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    marginRight: themeConstants.spacing.m,
  },
  listTitle: {
    fontSize: themeConstants.typography.size.m,
    fontFamily: themeConstants.typography.fontFamily.medium,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listRightText: {
    fontSize: themeConstants.typography.size.s,
    fontFamily: themeConstants.typography.fontFamily.regular,
    marginRight: themeConstants.spacing.xs,
  },
  divider: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: themeConstants.spacing.m,
    marginBottom: themeConstants.spacing.l,
  },
  logoutText: {
    fontSize: themeConstants.typography.size.m,
    fontFamily: themeConstants.typography.fontFamily.medium,
    marginLeft: themeConstants.spacing.s,
  },
  bottomPadding: {
    height: 40,
  }
});

