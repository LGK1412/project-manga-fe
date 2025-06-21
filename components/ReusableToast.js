import { useEffect } from 'react';
import Toast from 'react-native-toast-message';

const ReusableToast = ({ visible, success, title, message, onComplete }) => {
  useEffect(() => {
    if (visible) {
      Toast.show({
        type: success ? 'success' : 'error',
        text1: title,
        text2: message,
        position: 'top',
        autoHide: true,
        visibilityTime: 3000,
        onHide: onComplete,
      });
    }
  }, [visible]);

  return null;
};

export default ReusableToast;
