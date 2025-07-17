import { useState } from 'react';
import { Button, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { IP } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { decodeToken } from '../utils/decodeToken';
import ReusableToast from './ReusableToast';

export default function UpdateUserProfileButton({ name, gender, dob, userId, role }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, success: false, title: '', message: '' });
  const navigation = useNavigation();

  const handleUpdate = async () => {
    const token = await SecureStore.getItemAsync('userToken');

    try {
      setLoading(true);

      const res = await axios.patch(
        `http://${IP}:333/api/user/${userId}/update-profile`,
        { name, gender, dob, role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      if (res.data?.result?.success) {
        const decoded = decodeToken(res.data.result.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(decoded));
        await SecureStore.setItemAsync('userToken', res.data.result.token);

        setToast({
          visible: true,
          success: true,
          title: 'Thành công',
          message: res.data.result.message || 'Cập nhật thành công!',
        });
      } else {
        setToast({
          visible: true,
          success: false,
          title: 'Thất bại',
          message: res.data.result?.message || 'Cập nhật thất bại!',
        });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Lỗi hệ thống, vui lòng thử lại!';
      setToast({
        visible: true,
        success: false,
        title: 'Lỗi',
        message,
      });
      console.error('Update error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <Button title="Cập nhật" onPress={handleUpdate} />
      )}
      <ReusableToast
        {...toast}
        onComplete={() => {
          if (toast.onComplete) toast.onComplete();
          setToast({ ...toast, visible: false });
        }}
      />
    </>
  );
}
