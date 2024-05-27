import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import MapViewDirections from "react-native-maps-directions";
import * as Location from 'expo-location';

const { width, height } = Dimensions.get("window");
const API_KEY= "APIKEY";

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_POSITION = {
  latitude: 41.03929633957409,
  longitude: 28.86034120024554,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const DESTINATION_POSITION = {
  latitude: 41.05420825860609,
  longitude: 29.11397448763802,
};

function InputAutocomplete({
  label,
  placeholder,
  onPlaceSelected,
  initialValue,
}) {
  const ref = useRef();
  
  useEffect(() => {
    if (initialValue) {
      ref.current?.setAddressText(initialValue);
    }
  }, [initialValue]);

  return (
    <>
      <Text>{label}</Text>
      <GooglePlacesAutocomplete
        ref={ref}
        styles={{ textInput: styles.input }}
        placeholder={placeholder || ""}
        fetchDetails
        onPress={(data, details = null) => {
          onPlaceSelected(details);
        }}
        query={{
          key:  API_KEY,
          language: "tr-TR",
        }}
      />
    </>
  );
}

export default function App() {
  const [origin, setOrigin] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [originAddress, setOriginAddress] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Konuma erişim izni reddedildi');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const currentPosition = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setOrigin(currentPosition);
      moveTo(currentPosition);

      const address = await Location.reverseGeocodeAsync(currentPosition);
      if (address.length > 0) {
        const formattedAddress = [
          address[0].street,
          address[0].city,
          address[0].region
        ].filter(Boolean).join(' ');
        setOriginAddress(formattedAddress);
      }
    })();
  }, []);

  const moveTo = async (position) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current?.animateCamera(camera, { duration: 100 });
    }
  };

  const edgePaddingValue = 70;

  const edgePadding = {
    top: edgePaddingValue,
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };

  const traceRouteOnReady = (args) => {
    if (args) {
      setDistance(args.distance);
      setDuration(args.duration);
    }
  };

  const traceRoute = () => {
    if (origin && DESTINATION_POSITION) {
      setShowDirections(true);
      mapRef.current?.fitToCoordinates([origin, DESTINATION_POSITION], { edgePadding });
    }
  };

  const onPlaceSelected = (details) => {
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };
    setOrigin(position);
    moveTo(position);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_POSITION}
      >
        {origin && <Marker coordinate={origin} />}
        <Marker coordinate={DESTINATION_POSITION} />
        {showDirections && origin && DESTINATION_POSITION && (
          <MapViewDirections
            origin={origin}
            destination={DESTINATION_POSITION}
            apikey={API_KEY}
            strokeColor="#6644ff"
            mode="DRIVING"
            strokeWidth={4}
            onReady={traceRouteOnReady}
          />
        )}
      </MapView>
      <View style={styles.searchContainer}>
        <InputAutocomplete
          label="Konum"
          initialValue={originAddress}
          onPlaceSelected={onPlaceSelected}
        />
        <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Adrese Git</Text>
        </TouchableOpacity>
        {distance && duration ? (
          <View>
            <Text>Mesafe: {distance.toFixed(2)} KM</Text>
            <Text>Süre: {Math.ceil(duration)} min DK</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  searchContainer: {
    position: "absolute",
    width: "90%",
    backgroundColor: "white",
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    padding: 8,
    borderRadius: 8,
    top: Constants.statusBarHeight,
  },
  input: {
    borderColor: "#888",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#bbb",
    paddingVertical: 12,
    marginTop: 10,
    borderRadius: 4,
  },
  buttonText: {
    textAlign: "center",
  },
});
