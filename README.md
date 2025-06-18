# project-manga-fe

Dự án nhỏ về app android đọc truyện
---

## Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

Làm theo các bước bên dưới để cài đặt và chạy ứng dụng trên máy tính của bạn:

### 1. Clone Dự Án

```bash
git clone https://github.com/LGK1412/project-manga-fe.git 
cd project-manga-fe
npm install
```

Trước khi start thì phải vào đăng nhập tài khoản EAS
```bash
eas login
```

```bash
npx expo start
```

### 2. Tải APK cho LD Player

Sau khi mà chạy expo thì nó sẽ có cái link copy nó vào r chạy trong google của LD Player. Tải và cài đặt APK r sau đó mở lên và dùng như EXPO GO.

Vào link `https://expo.dev/accounts/lgk1412/projects/google-signin-app/builds/4fada388-29c3-4865-82ed-1eedee2235a2` tải apk về cài trên LD player hoặc xài Android studio thì khỏi. Link dc cập nhật liên tục sau mỗi lần build.

Trong này ko dùng localhost mà dùng theo ip máy. Mở CMD gõ ipconfig và tìm IPv4 Address đầu tiên. R lấy cái đó thay cho localhost (cái này cho API).

### Lưu ý.

Có cái folder `constants` chứa file `config.js` import cái IP vào để thay đổi khi cần thiết. Này là biến toàn cục thay cho env vì env cần build lại mỗi lần. Tuy nhiên cẫn cần xài env `eas env:pull --environment development` chạy này trong terminal để xài env oke.
