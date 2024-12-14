import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Geolocation from 'react-native-geolocation-service';
import { StyleSheet, Text, View, Button, Alert, Image, Platform, PermissionsAndroid } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import * as Notifications from 'expo-notifications';

const ImagePickerComponent = () => {
  const [uri, setUri] = useState("");
  const [locationData, setLocationData] = useState(null);

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
    // Log the entire response object
    console.log('Full Response:', JSON.stringify(response, null, 2));
  
    if (response.canceled) {
      console.log("User cancelled image picker");
      setUri(null);
    } else if (response.assets && response.assets.length > 0) {
      const imageUri = response.assets[0].uri;
      
      // Additional type and content checks
      console.log("Image URI:", imageUri);
      console.log("Image URI type:", typeof imageUri);
      console.log("Image URI exists:", !!imageUri);
  
      // Validate the URI before setting
      if (typeof imageUri === 'string' && imageUri.trim() !== '') {
        setUri(imageUri);
      } else {
        console.error("Invalid image URI");
        Alert.alert("Error", "Invalid image URI");
      }
    } else {
      console.log("No image URI found in the response");
      Alert.alert("Error", "Failed to retrieve image URI.");
      setUri(null);
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
        setLocationData(coords);
        console.log("Location Data:", coords);
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

  const showNotification = async (title, body) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null,
    });
  };

  const saveToFirebase = async () => {
    if (!uri || !locationData) {
      Alert.alert("Missing Data", "Make sure to select an image and fetch location first.");
      return;
    }

    try {
      // Upload image to Firebase Storage
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `images/${Date.now()}.jpg`);
      const uploadResult = await uploadBytes(storageRef, blob);

      // Get the download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Save metadata to Firestore
      const docRef = await addDoc(collection(db, "photos"), {
        imageUrl: downloadURL,
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        },
        timestamp: new Date().toISOString(),
      });

      Alert.alert("Success", `Photo and location saved with ID: ${docRef.id}`);
      await showNotification(
        "Data Saved Successfully",
        `Image and location saved: Lat ${locationData.latitude}, Lon ${locationData.longitude}`
      );
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      Alert.alert("Error", "Failed to save photo and location.");
      await showNotification(
        "Data Save Failed",
        `Failed to save data: Lat ${locationData?.latitude || "N/A"}, Lon ${locationData?.longitude || "N/A"}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text>Aurelius Brandon Alexander Abuthan - 00000075101</Text>
      <Button title="OPEN CAMERA" onPress={handleCameraLaunch} color="#1E90FF" />
      <Button title="OPEN GALLERY" onPress={openImagePicker} color="#1E90FF" />
      {uri && typeof uri === 'string' ? (
      <Image 
        source={{ uri: uri }} 
        style={styles.image} 
        resizeMode="cover"
        onError={(e) => {
          console.error('Image load error:', JSON.stringify(e.nativeEvent));
          Alert.alert('Image Error', 'Could not load the image');
          setUri(null);
        }}
      />
    ) : (
      <Text>No image selected</Text>
    )}
      <Button title="GET GEO LOCATION" onPress={getLocation} color="#1E90FF" />
      <Button title="SAVE TO FIREBASE" onPress={saveToFirebase} color="#1E90FF" />
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
