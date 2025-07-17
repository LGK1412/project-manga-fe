import { useState, useEffect } from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { IP } from '../constants/config';

export default function SendForgetPasswordCodeButton({ email }) {
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendCode = async () => {
    if (loading || timer > 0) return;

    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email trước khi gửi mã');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://${IP}:333/api/auth/send-forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result?.success) {
        Alert.alert('Thành công', result.message || 'Đã gửi mã');
        setTimer(60); // cooldown 60s
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể gửi mã');
      }
    } catch (err) {
      Alert.alert('Thất bại', err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSendCode}
      disabled={timer > 0 || loading}
      style={[styles.button, (timer > 0 || loading) && styles.buttonDisabled]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>
          {timer > 0 ? `Gửi lại (${timer}s)` : 'Gửi mã'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
