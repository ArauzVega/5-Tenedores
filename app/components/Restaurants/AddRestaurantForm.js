import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Dimensions,
  Text,
} from 'react-native';
import { Icon, Avatar, Image, Input, Button } from 'react-native-elements';
import { map, size, filter } from 'lodash';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import Modal from '../Modal';

const widthScreen = Dimensions.get('window').width;

export default function AddRestaurantForm(props) {
  const { toastRef, setIsLoading, navigation } = props;
  const [restauranteName, setRestauranteName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantDescription, setRestaurantDescription] = useState('');
  const [imagesSelected, setImagesSelected] = useState([]);
  const [isVisibleMap, setIsVisibleMap] = useState(false);
  const [locationRestaurant, setLocationRestaurant] = useState(null);

  const addRestaurant = () => {
    console.log('OK...');
    // console.log(restauranteName);
    // console.log(restaurantAddress);
    // console.log(restaurantDescription);
    // console.log(imagesSelected);
    console.log(locationRestaurant);
  };

  return (
    <ScrollView style={styles.scrollView}>
      <ImageRestaurant imageRestaurant={imagesSelected[0]} />
      <FormAdd
        setRestauranteName={setRestauranteName}
        setRestaurantAddress={setRestaurantAddress}
        setRestaurantDescription={setRestaurantDescription}
        setIsVisibleMap={setIsVisibleMap}
      />
      <UploadImage
        toastRef={toastRef}
        imagesSelected={imagesSelected}
        setImagesSelected={setImagesSelected}
      />
      <Button
        title='Crear Restaurante'
        onPress={addRestaurant}
        buttonStyle={styles.btnAddRestaurant}
      />

      <Map
        isVisibleMap={isVisibleMap}
        setIsVisibleMap={setIsVisibleMap}
        setLocationRestaurant={setLocationRestaurant}
        toastRef={toastRef}
      />
    </ScrollView>
  );
}

function ImageRestaurant(props) {
  const { imageRestaurant } = props;

  return (
    <View style={styles.viewPhoto}>
      <Image
        source={
          imageRestaurant
            ? { uri: imageRestaurant }
            : require('../../../assets/img/no-image.png')
        }
        style={{ width: widthScreen, height: 200 }}
      />
    </View>
  );
}

function FormAdd(props) {
  const {
    setRestauranteName,
    setRestaurantAddress,
    setRestaurantDescription,
    setIsVisibleMap,
  } = props;

  return (
    <View style={styles.viewForm}>
      <Input
        placeholder='Nombre del restaurante'
        containerStyle={styles.input}
        onChange={(e) => setRestauranteName(e.nativeEvent.text)}
      />
      <Input
        placeholder='Dirección'
        containerStyle={styles.input}
        onChange={(e) => setRestaurantAddress(e.nativeEvent.text)}
        rightIcon={{
          type: 'material-community',
          name: 'google-maps',
          color: '#c2c2c2',
          onPress: () => setIsVisibleMap(true),
        }}
      />
      <Input
        placeholder='Descripción del restaurante'
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={(e) => setRestaurantDescription(e.nativeEvent.text)}
      />
    </View>
  );
}

// componente para gestionar el mapa
function Map(props) {
  const {
    isVisibleMap,
    setIsVisibleMap,
    setLocationRestaurant,
    toastRef,
  } = props;
  const [location, setLocation] = useState(null);

  // hook con función auto ejecutable para pedir el permiso de localización para obtener las coordenadas de ubicación del usuario
  useEffect(() => {
    (async () => {
      const resultPermissions = await Permissions.askAsync(
        Permissions.LOCATION,
      );

      const statusPermissions = resultPermissions.permissions.location.status;

      if (statusPermissions !== 'granted') {
        toastRef.current.show(
          'Tienes que aceptar los permisos de localización para crear un restaurante',
          3000,
        );
      } else {
        const loc = await Location.getCurrentPositionAsync({
          enableHighAccuracy: true,
        });
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        });
      }
    })();
  }, []);

  // Funcion para guardar la localización en el estado
  const confirmLocation = () => {
    setLocationRestaurant(location);
    toastRef.current.show('Localización guardada correctamente');
    setIsVisibleMap(false);
  };

  return (
    <>
      <Modal isVisible={isVisibleMap} setIsVisible={setIsVisibleMap}>
        <View>
          {location && (
            <MapView
              style={styles.mapStyle}
              initialRegion={location}
              showsUserLocation={true}
              onRegionChange={(region) => setLocation(region)}
            >
              <MapView.Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                draggable
              />
            </MapView>
          )}
          <View style={styles.viewMapBtn}>
            <Button
              title='Guardar Ubicación'
              containerStyle={styles.viewMapBtnContainerSave}
              buttonStyle={styles.viewMapBtnSave}
              onPress={confirmLocation}
            />
            <Button
              title='Cancelar Ubicación'
              containerStyle={styles.viewMapBtnContainerCancel}
              buttonStyle={styles.viewMapBtnCancel}
              onPress={() => setIsVisibleMap(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

function UploadImage(props) {
  const { toastRef, imagesSelected, setImagesSelected } = props;

  const imageSelect = async () => {
    const resultPermissions = await Permissions.askAsync(
      Permissions.CAMERA_ROLL,
    );

    if (resultPermissions === 'denied') {
      toastRef.current.show(
        'Es necesario aceptar los permisos de la galería, si los has rechazado tienes que ir a ajustes y activarlos manualmente.',
        3000,
      );
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (result.cancelled) {
        toastRef.current.show(
          'Has cerrado la galería sin seleccionar ninguna imagen',
          2000,
        );
      } else {
        setImagesSelected([...imagesSelected, result.uri]);
      }
    }
  };

  const removeImage = (image) => {
    Alert.alert(
      'Eliminar Imagen',
      '¿Estás seguro de que quieres eliminar la imagen?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            setImagesSelected(
              filter(imagesSelected, (imageUrl) => imageUrl !== image),
            );
          },
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <View style={styles.viewImage}>
      {size(imagesSelected) < 4 && (
        <Icon
          type='material-community'
          name='camera'
          color='#7a7a7a'
          containerStyle={styles.containerIcon}
          onPress={imageSelect}
        />
      )}

      {map(imagesSelected, (imageRestaurant, index) => (
        <Avatar
          key={index}
          style={styles.miniatureStyle}
          source={{ uri: imageRestaurant }}
          onPress={() => removeImage(imageRestaurant)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    height: '100%',
  },
  viewForm: {
    marginLeft: 10,
    marginRight: 10,
  },
  input: {
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    width: '100%',
    padding: 0,
    margin: 0,
  },
  btnAddRestaurant: {
    backgroundColor: '#00a680',
    margin: 20,
  },
  viewImage: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30,
  },
  containerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    height: 70,
    width: 70,
    backgroundColor: '#e3e3e3',
  },
  miniatureStyle: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  viewPhoto: {
    alignItems: 'center',
    height: 200,
    marginBottom: 20,
  },
  mapStyle: {
    width: '100%',
    height: 500,
  },
  viewMapBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  viewMapBtnContainerCancel: {
    paddingLeft: 5,
  },
  viewMapBtnCancel: {
    backgroundColor: '#a60d0d',
  },
  viewMapBtnContainerSave: {
    paddingRight: 5,
  },
  viewMapBtnSave: {
    backgroundColor: '#00a680',
  },
});
