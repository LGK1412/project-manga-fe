import React, { useState } from 'react';
import { View, Image, Alert, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { IP } from '../constants/config';

const UploadAvatarScreen = () => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const pickImage = async () => {
        if (loading) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const uploadImage = async () => {
        if (!image || loading) return;
        setLoading(true);

        const userInfoStr = await AsyncStorage.getItem('userInfo');
        const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

        if (!userInfo || !userInfo.userId) {
            Alert.alert('Error', 'No userId found');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('image', {
            uri: image,
            name: 'avatar.jpg',
            type: 'image/jpeg',
        });

        try {
            const res = await axios.patch(
                `http://${IP}:333/api/image/${userInfo.userId}/upload-avatar`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 10000,
                }
            );
            const newUrl = res.data.url;
            userInfo.avatar = newUrl;
            console.log(newUrl)
            await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));

            Alert.alert('Success', 'Avatar updated');
            navigation.goBack();
        } catch (err) {
            console.log(err);
            Alert.alert('Error', 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const Btn = ({ title, onPress, disabled }) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={{
                backgroundColor: disabled ? '#aaa' : '#007bff',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                marginTop: 16,
                width: 200,
                alignItems: 'center',
            }}
        >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            {image && (
                <Image
                    source={{ uri: image }}
                    style={{ width: 200, height: 200, borderRadius: 100, marginBottom: 20 }}
                />
            )}
            {loading && <ActivityIndicator size="large" color="#007bff" />}
            <Btn title="Pick an image" onPress={pickImage} disabled={loading} />
            <Btn title="Upload" onPress={uploadImage} disabled={!image || loading} />
        </View>
    );
};

export default UploadAvatarScreen;
