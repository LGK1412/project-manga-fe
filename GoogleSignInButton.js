import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function GoogleSignInButton() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '682663221551-gja7tocds42r31hdqhu99k97faq1nfu5.apps.googleusercontent.com',
    });
  }, []);

  // function decodeIdToken(idToken) {
  //   const base64Url = idToken.split('.')[1];
  //   const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  //   const jsonPayload = decodeURIComponent(
  //     atob(base64)
  //       .split('')
  //       .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
  //       .join('')
  //   );
  //   return JSON.parse(jsonPayload);
  // }

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfos = await GoogleSignin.signIn();
      
      const idToken = userInfos.data.idToken;
      
      const userInfo = userInfos.data.user
      // console.log(userInfo)
      const res = await fetch('http://192.168.1.7:333/api/auth/google', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,  // idToken phải có giá trị
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInfo
        }),
      });

      const result = await res.json();
      console.log('Server response:', result);
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <View>
      <Button title="Sign in with Google" onPress={signIn} />
    </View>
  );
}
