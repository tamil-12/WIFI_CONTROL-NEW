import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Modal, PermissionsAndroid, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';

const WifiScanner = () => {
  const [wifiList, setWifiList] = useState([]);
  const [connectedSSID, setConnectedSSID] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSSID, setSelectedSSID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOn, setIsOn] = useState(false); // State to track the LED status

  const scanWifi = async () => {
    try {
      const wifiArray = await WifiManager.loadWifiList();
      const uniqueWifiList = removeDuplicates(wifiArray, 'SSID'); // Remove duplicate entries
      setWifiList(uniqueWifiList);
    } catch (error) {
      console.error('Error scanning WiFi:', error);
    }
  };

  const removeDuplicates = (arr, key) => {
    return arr.reduce((acc, current) => {
      const x = acc.find(item => item[key] === current[key]);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
  };

  const connectToWifi = async () => {
    try {
      setIsLoading(true);
      await WifiManager.connectToProtectedSSID(selectedSSID, password, false, false);
      setConnectedSSID(selectedSSID);
      setIsModalVisible(false);
      setIsLoading(false);
      console.log(`Connected to ${selectedSSID}`);
    } catch (error) {
      console.error(`Error connecting to ${selectedSSID}:`, error);
      setIsLoading(false);
    }
  };

  const sendData = async (action) => {
    try {
      await fetch(`http://192.168.4.1/send-data`, {
        method: 'POST',
        body: JSON.stringify({ action }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(`Data '${action}' sent successfully`);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  useEffect(() => {
    requestLocationPermission();
    
  }, []);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "React Native Wifi Reborn App Permission",
          message:
            "Location permission is required to connect with or scan for Wifi networks. ",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        scanWifi();
      } else {
        console.log("Location permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {connectedSSID ? (
          <View style={styles.connectedContainer}>
            <Text style={styles.connectedText}>Connected to: {connectedSSID}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.circleButton} onPress={() => sendData('on')}>
                <Text style={styles.buttonText}>On</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleButton} onPress={() => sendData('off')}>
                <Text style={styles.buttonText}>Off</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter message to send"
                onChangeText={text => setMessage(text)}
                value={message}
              />
              <Button title="Send Data" onPress={() => sendData(message)} />
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.buttonContainer}>
              <Button onPress={scanWifi} title="Scan WiFi" />
            </View>
            <View style={styles.wifiListContainer}>
              {wifiList.map((wifi, index) => (
                <View key={index} style={styles.wifiItem}>
                  <Text>{wifi.SSID}</Text>
                  <Text>Signal Strength: {wifi.level}</Text>
                  <Button title="Connect" onPress={() => {
                    setSelectedSSID(wifi.SSID);
                    setIsModalVisible(true);
                  }} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter WiFi Password</Text>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              onChangeText={text => setPassword(text)}
              secureTextEntry={true}
            />
            {isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <Button title="Connect" onPress={connectToWifi} />
            )}
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  wifiListContainer: {
    marginTop: 10,
  },
  wifiItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    padding: 10,
  },
  connectedContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  connectedText: {
    fontSize: 18,
    marginBottom: 10,
  },
  inputContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  passwordInput: {
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  circleButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WifiScanner;
