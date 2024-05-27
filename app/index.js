import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Navigasyon from './Navigasyon';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [locations, setLocations] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');

  useEffect(() => {
    requestPermissions();
    requestLocation();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Bildirim izinleri verilmedi.');
      return;
    }
  };

  const requestLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocations(loc.coords);
  };

  const scheduleNotification = () => {
   if (dateText=='' || timeText=='') {
    Alert.alert('Hata','Lütfen tarih ve saat bilgilerini giriniz')
   } else {
    console.log('date: ', date);
    console.log('time: ', time);
    const trigger = new Date(time.getTime() - 30 * 60000); // 30 dakika öncesi - 30 * 60000
    console.log('trigger', trigger);
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Spa Randevusu',
        body: 'Randevunuza 30 dakika kaldı!',
      },
      trigger: {
        seconds: (trigger.getTime() - Date.now()) / 1000,
        repeats: false,
      },
    });
    Alert.alert('Bilgi','Randevunuz oluşturuldu. 30 Dakika öncesinde bildirim gönderilecektir');
   }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    const fDate = currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear();
    setDateText(fDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
    const fTime = currentTime.getHours() + ':' + currentTime.getMinutes();
    setTimeText(fTime);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
  };

  const Stack = createStackNavigator();

  function HomeScreen({ navigation }) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={showDatepicker}>
          <Text style={styles.buttonText}>Tarih Seç</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onChangeDate}
          />
        )}
        <TouchableOpacity style={styles.button} onPress={showTimepicker}>
          <Text style={styles.buttonText}>Saat Seç</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            testID="timePicker"
            value={time}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onChangeTime}
          />
        )}
        <Text style={styles.dateText}>Seçilen Tarih: {dateText}</Text>
        <Text style={styles.timeText}>Seçilen Saat: {timeText}</Text>
        <TouchableOpacity style={styles.button} onPress={scheduleNotification}>
          <Text style={styles.buttonText}>Bildirim Ayarla</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SpaScreen')}>
          <Text style={styles.buttonText}>Navigasyona Başla</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{
          title: 'Spa Randevu',
          headerTitleAlign: 'center',
          headerStyle: {
            height: 60,
          },
          headerTitleStyle: {
            fontSize: 18,
          },
        }} />
        <Stack.Screen name="SpaScreen" component={Navigasyon} options={{
          title: 'Yol Tarifi',
          headerTitleAlign: 'center',
          headerStyle: {
            height: 60,
          },
          headerTitleStyle: {
            fontSize: 18,
          },
        }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  dateText: {
    fontSize: 18,
    marginVertical: 10,
  },
  timeText: {
    fontSize: 18,
    marginVertical: 10,
  },
});
