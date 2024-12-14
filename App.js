import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Geolocation from 'react-native-geolocation-service';
import { StyleSheet, Text, View, Button, Alert, Image, Platform, PermissionsAndroid } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const ImagePickerComponent = () => {
  const [uri, setUri] = useState("");
  const [locationData, setLocationData] = useState([]);

  const openImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "You need to enable permission to access the photo library.");
      return;
    }

    const response = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    handleResponse(response);
  };

  const handleCameraLaunch = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "You need to enable permission to access the camera.");
      return;
    }

    const response = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    handleResponse(response);
  };

  const handleResponse = (response) => {
    if (response.canceled) {
      console.log("User cancelled image picker");
    } else if (response.assets && response.assets.length > 0) {
      const imageUri = response.assets[0]?.uri || "";
      setUri(imageUri);
      console.log("Image URI:", imageUri);
    } else {
      console.log("No image URI found in the response");
      Alert.alert("Error", "Failed to retrieve image URI.");
    }
  };

  const saveToCameraRoll = async () => {
    if (!uri) {
      Alert.alert("No image to save", "Please capture or select an image first.");
      return;
    }

    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    if (!mediaLibraryPermission.granted) {
      Alert.alert("Permission required", "You need to enable permission to save images to the gallery.");
      return;
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Camera Roll", asset, false);
      Alert.alert("Image saved!", "The image has been saved to your Camera Roll.");
    } catch (error) {
      Alert.alert("Save Error", "Failed to save the image.");
    }
  };

  const getLocation = async () => {
    const hasPermission = await hasLocationPermission();

    if (!hasPermission) {
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const coords = position.coords;
        setLocationData((prev) => [...prev, coords]);
        console.log("Location Data:", coords);
        saveLocationToFile(coords);
      },
      (error) => {
        console.error(`Error ${error.code}`, error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const saveLocationToFile = async (coords) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}Download/location_data.txt`;
      const locationString = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}, Timestamp: ${new Date().toISOString()}\n`;

      await FileSystem.writeAsStringAsync(fileUri, locationString, {
        encoding: FileSystem.EncodingType.UTF8,
        append: true,
      });

      Alert.alert("Location Saved", "Location data has been saved to Downloads folder.");
      console.log("Location saved to:", fileUri);
    } catch (error) {
      console.error("Error saving location data:", error);
      Alert.alert("Error", "Failed to save location data.");
    }
  };

  const hasLocationPermission = async () => {
    if (Platform.OS === "android" && Platform.Version < 23) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (hasPermission) return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    return status === PermissionsAndroid.RESULTS.GRANTED;
  };

  return (
    <View style={styles.container}>
      <Text>Aurelius Brandon Alexander Abuthan - 00000075101</Text>
      <Button title="OPEN CAMERA" onPress={handleCameraLaunch} color="#1E90FF" />
      <Button title="OPEN GALLERY" onPress={openImagePicker} color="#1E90FF" />
      {uri ? (
          <>
            <Image source={{ uri }} style={styles.image} />
            <Button title="GET GEO LOCATION" onPress={getLocation} color="#1E90FF" />
r            <Button title="CREATE FILE" onPress={saveToCameraRoll} color="#1E90FF" />
          </>
        ) : (
          <Text>No image selected</Text>
        )}      
        <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
});

export default ImagePickerComponent;
