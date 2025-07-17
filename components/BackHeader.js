// BackHeader.js
// Component này dùng để render nút back trên header
// Cách dùng:
// - Trong screen nào cần custom header back, import BackHeader
// - Dùng navigation.setOptions để set headerLeft thành <BackHeader />
// - Có thể dùng trong useLayoutEffect hoặc useFocusEffect tùy trường hợp

// Ví dụ dùng trong screen:

// Nếu dùng useLayoutEffect:
// import { useLayoutEffect } from 'react';

// Nếu dùng useFocusEffect:
// import { useFocusEffect } from '@react-navigation/native';

/*
useFocusEffect(() => {
  navigation.setOptions({
    headerShown: true,
    title: 'Cập nhật hồ sơ',
    headerLeft: () => <BackHeader />, // 👈 đây là chỗ dùng component
  });
});
*/

import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BackHeader = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
      <Ionicons name="arrow-back" size={24} color="black" />
    </TouchableOpacity>
  );
};

export default BackHeader;
