import { useState, useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const IP = '192.168.1.8';

export default function ResetPasswordButton({ email, code, newPassword }) {
  const [loading, setLoading] = useState(false);
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigation = useNavigation(); // 👈 lấy navigation

  const resetPassword = async () => {
    if (!email || !code || !newPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ email, mã xác nhận và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://${IP}:333/api/auth/verify-forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          providedCode: Number(code),
          newPassword,
        }),
      });

      const result = await res.json();

      if (result?.success) {
        Alert.alert('Thành công', result.message || 'Đã đổi mật khẩu');
        setIsLoggedIn(false);

        // 👇 Reset stack và chuyển về màn Login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể đổi mật khẩu');
      }
    } catch (err) {
      Alert.alert('Lỗi kết nối', err.message || 'Máy chủ không phản hồi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={resetPassword}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>Đổi mật khẩu</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    marginTop: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
