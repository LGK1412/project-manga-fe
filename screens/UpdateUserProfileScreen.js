import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Switch, ActivityIndicator,
  StyleSheet, TouchableOpacity, ScrollView, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import UpdateUserProfileButton from '../components/UpdateUserProfileButton';
import ChangePasswordButton from '../components/ChangePasswordButton';
import { useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BackHeader from '../components/BackHeader';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Họ tên không được để trống'),
  gender: Yup.string().required('Chọn giới tính'),
  dob: Yup.string().required('Chọn ngày sinh'),
});


export default function UpdateUserProfileScreen() {
  const navigation = useNavigation();
  
  useFocusEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Cập nhật hồ sơ',
      headerLeft: () => <BackHeader />,
    });
  });

  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('userInfo');
      const user = JSON.parse(userJson);
      setEmail(user.email || '');
      setUserId(user.userId);
      setInitialValues({
        name: user.name || '',
        gender: user.gender?.charAt(0).toUpperCase() + user.gender?.slice(1).toLowerCase() || 'Other',
        dob: user.dob || '',
        isAuthor: user.role === 'author',
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      navigation.replace('UpdateUserProfile');
    }, 500);
  };

  const parseDob = (dobStr) => {
    const [day, month, year] = dobStr.split('-');
    return new Date(`${year}-${month}-${day}`);
  };

  if (loading || !initialValues) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={() => { }}
      >
        {({ values, errors, touched, handleChange, setFieldValue }) => (
          <View style={styles.container}>
            {/* Các input giữ nguyên như bạn viết */}
            <Text style={styles.label}>Email (không sửa được):</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
            />

            <Text style={styles.label}>Tên người dùng:</Text>
            <TextInput
              style={styles.input}
              value={values.name}
              onChangeText={handleChange('name')}
              placeholder="Nhập họ tên"
              placeholderTextColor="#999"
            />
            {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}

            <Text style={styles.label}>Giới tính:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={values.gender}
                onValueChange={(value) => setFieldValue('gender', value)}
                style={styles.picker}
              >
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>

            <Text style={styles.label}>Ngày sinh:</Text>
            <View style={styles.row}>
              <Text style={styles.dobText}>{values.dob || 'Chưa chọn'}</Text>
              <TouchableOpacity style={styles.smallButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.buttonText}>Chọn ngày</Text>
              </TouchableOpacity>
            </View>
            {touched.dob && errors.dob && <Text style={styles.error}>{errors.dob}</Text>}

            {showDatePicker && (
              <DateTimePicker
                value={values.dob ? parseDob(values.dob) : new Date()}
                mode="date"
                display="default"
                onChange={(e, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const day = selectedDate.getDate().toString().padStart(2, '0');
                    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                    const year = selectedDate.getFullYear();
                    const dobStr = `${day}-${month}-${year}`;
                    setFieldValue('dob', dobStr);
                  }
                }}
              />
            )}

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Role: Author</Text>
              <Switch
                value={values.isAuthor}
                onValueChange={value => setFieldValue('isAuthor', value)}
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
                thumbColor={values.isAuthor ? '#fff' : '#f4f3f4'}
              />
            </View>

            <UpdateUserProfileButton
              name={values.name}
              gender={values.gender}
              dob={values.dob}
              userId={userId}
              role={values.isAuthor ? 'author' : 'user'}
            />

            <ChangePasswordButton />
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center',
    alignItems: 'center',
  },
  label: { alignSelf: 'flex-start', fontSize: 16, fontWeight: '500', marginBottom: 4, color: '#333' },
  input: {
    width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10,
    marginBottom: 8, borderRadius: 8, fontSize: 16, color: 'black', height: 52
  },
  disabledInput: { backgroundColor: '#eee' },
  pickerWrapper: {
    width: '100%', height: 52, borderWidth: 1, borderColor: '#ccc',
    borderRadius: 8, marginBottom: 12, overflow: 'hidden', justifyContent: 'center',
  },
  picker: { width: '100%', height: 52, color: 'black' },
  switchContainer: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginVertical: 10
  },
  row: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8
  },
  smallButton: {
    backgroundColor: '#4CAF50', paddingVertical: 8,
    paddingHorizontal: 16, borderRadius: 6
  },
  buttonText: { color: '#fff', fontWeight: '500' },
  dobText: { fontSize: 16, color: '#333' },
  error: {
    alignSelf: 'flex-start',
    color: 'red',
    marginBottom: 4,
    marginTop: -8,
    fontSize: 13,
  }
});
