import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import SendCodeButton from '../components/SendForgetPasswordCodeButton';
import ResetPasswordButton from '../components/ResetPasswordButton';
import { Formik } from 'formik';
import * as Yup from 'yup';

export default function ForgetPasswordScreen() {
  const validationSchema = Yup.object({
    email: Yup.string()
      .required('Vui lòng nhập email')
      .email('Email không hợp lệ')
      .min(6, 'Email phải từ 6 ký tự')
      .max(60, 'Email không vượt quá 60 ký tự')
      .matches(/@(?:[a-zA-Z0-9-]+\.)?(com|net|vn)$/, 'Email phải có đuôi .com, .net, hoặc .vn'),

    code: Yup.string()
      .required('Vui lòng nhập mã')
      .matches(/^\d{6}$/, 'Mã xác nhận phải gồm đúng 6 chữ số'),

    newPassword: Yup.string()
      .required('Vui lòng nhập mật khẩu')
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{6,30}$/,
        'Mật khẩu từ 6-30 ký tự gồm chữ, số và ký tự đặc biệt'
      )
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>

      <Formik
        initialValues={{ email: '', code: '', newPassword: '' }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          console.log('Submit:', values);
          // Gọi ResetPassword API ở đây
        }}
      >
        {({ handleChange, handleSubmit, values, errors, touched, handleBlur }) => (
          <>
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
            />
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <SendCodeButton email={values.email} />

            <TextInput
              placeholder="Mã xác nhận"
              style={styles.input}
              value={values.code}
              onChangeText={handleChange('code')}
              onBlur={handleBlur('code')}
              keyboardType="numeric"
            />
            {touched.code && errors.code && <Text style={styles.error}>{errors.code}</Text>}

            <TextInput
              placeholder="Mật khẩu mới"
              secureTextEntry
              style={styles.input}
              value={values.newPassword}
              onChangeText={handleChange('newPassword')}
              onBlur={handleBlur('newPassword')}
            />
            {touched.newPassword && errors.newPassword && <Text style={styles.error}>{errors.newPassword}</Text>}

            <ResetPasswordButton code={values.code} newPassword={values.newPassword} email={values.email} />            
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 8,
    borderRadius: 5,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: -5,
    marginBottom: 8,
  },
});
