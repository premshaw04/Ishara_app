import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { AppDispatch, RootState } from '../../store';
import { updateUserProfile, updateLocalProfilePic } from '../../store/slices/authSlice';
import { editProfileSchema } from '../../utils/validationSchemas';
import { PrimaryButton, CustomInput, Header, showToast } from '../../components';
import { themeConstants } from '../../theme/themeConstants';
import { profileService } from '../../api/services/profileService';

export const EditProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(editProfileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      phoneNumber: user?.phoneNumber || '',
    }
  });

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      showToast('error', 'Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      const data = await profileService.uploadProfilePicture(uri);
      
      // Update the user profile globally so other screens see the new pic instantly
      dispatch(updateLocalProfilePic(data.profilePic));
      showToast('success', 'Success', 'Profile picture updated');
    } catch (error) {
      showToast('error', 'Upload Failed', 'Could not upload image to Cloudinary');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const resultAction = await dispatch(updateUserProfile(data));
      if (updateUserProfile.fulfilled.match(resultAction)) {
        showToast('success', 'Profile Updated', 'Your profile has been updated successfully.');
        navigation.goBack();
      } else {
        if (resultAction.payload) {
          showToast('error', 'Update Failed', resultAction.payload as string);
        }
      }
    } catch (error) {
      showToast('error', 'Update Failed', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Edit Profile" showBack />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.imageWrapper} disabled={loading}>
            {user?.profilePic ? (
              <Image key={user.profilePic} source={{ uri: user.profilePic }} style={styles.profileImage} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={[styles.placeholderText, { color: theme.colors.primary }]}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: theme.colors.primary }]}>
              <Icon name="camera" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Email (Read Only)</Text>
            <CustomInput
              value={user?.email || ''}
              editable={false}
              leftIcon="email-outline"
            />
          </View>
          
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Full Name"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                leftIcon="account-outline"
              />
            )}
          />

          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Bio"
                value={value}
                onChangeText={onChange}
                error={errors.bio?.message}
                leftIcon="text-short"
                multiline
                numberOfLines={3}
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Phone Number"
                value={value}
                onChangeText={onChange}
                error={errors.phoneNumber?.message}
                keyboardType="phone-pad"
                leftIcon="phone-outline"
              />
            )}
          />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <PrimaryButton 
          title="Save Changes" 
          onPress={handleSubmit(onSubmit)} 
          loading={loading}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: themeConstants.spacing.l,
    paddingBottom: themeConstants.spacing.xxl,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: themeConstants.spacing.xl,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: 36,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  form: {
    gap: themeConstants.spacing.m,
  },
  inputGroup: {
    marginBottom: themeConstants.spacing.xs,
  },
  label: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.s,
    marginBottom: themeConstants.spacing.xs,
    marginLeft: themeConstants.spacing.xs,
  },
  footer: {
    padding: themeConstants.spacing.l,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  }
});
