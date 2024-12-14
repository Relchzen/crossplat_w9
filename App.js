import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { StyleSheet, Text, View, Button, Alert, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const ImagePickerComponent = () => {
  const [uri, setUri] = useState("");

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

    console.log("Image Picker Response:", response);
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

    console.log("Camera Response:", response);
    handleResponse(response);
  };

  const handleResponse = (response) => {
    if (response.canceled) {
      console.log("User cancelled image picker");
    } else if (response.assets && response.assets.length > 0) {
      const imageUri = response.assets[0].uri;
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
      console.log("Image saved to Camera Roll:", asset.uri);
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Save Error", "Failed to save the image.");
    }
  };

  return (
    <View style={styles.container}>
      <Text>Aurelius Brandon Alexander Abuthan - 00000075101</Text>
      <Button title="OPEN CAMERA" onPress={handleCameraLaunch} color="#1E90FF" />
      <Button title="OPEN GALLERY" onPress={openImagePicker} color="#1E90FF" />
      
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.image} />
          <Button title="CREATE FILE" onPress={saveToCameraRoll} color="#1E90FF" />
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