import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
  NativeBaseProvider,
  Box,
  Image,
  Center,
  VStack,
  Button,
  Input,
  Alert,
  Text,
  Modal,
  FloatingLabel,
  Label,
  Item,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  ActivityIndicator,
  PermissionsAndroid,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import {openDatabase} from 'react-native-sqlite-storage';
const db = openDatabase({name: 'rn_sqlite'});
import {useIsFocused} from '@react-navigation/native';
import {backendUrl} from '../utils/backendUrl';
import {useDispatch, useSelector} from 'react-redux';
import { setTripStatus } from '../redux/slice/tripSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Lottie from "lottie-react-native";
import { ProgressBar } from "@react-native-community/progress-bar-android";

export default function TripHistory({navigation, route}) {
  const dispatch = useDispatch();
  const tripStatus = useSelector(state => state.trip.tripStatus);

  const [vehicle, setVehicle] = useState('');
  const [startkm, setStartKm] = useState(0);
  const [tripID, setTripID] = useState('');
  const [userId, setUserId] = useState(route.params.userId);
  const [pendingPickup, setPendingPickup] = useState(0);
  const [pendingDelivery, setPendingDelivery] = useState(0);
  const [pendingHandover, setPendingHandover] = useState(0);
  const [showModal1, setShowModal1] = useState(false);
  const [message1, setMessage1] = useState(0);
  
  const [tripDetails, setTripDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const focus = useIsFocused();
  const handleTrip = (id) => {
    if (pendingHandover != 0 ) {
      setMessage1(2);
      setShowModal1(true);
    } else if ((pendingPickup !== 0 || pendingDelivery !== 0) && route.params.tripValue=='End Trip' ) {
      navigation.navigate('PendingWork')
    } else {
      navigation.navigate('MyTrip', {userId: id});
    }
  };
useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(backendUrl + 'UserTripInfo/getUserTripInfo', {
          params: {
            feUserID: userId,
          },
        });
        setTripDetails(response.data.res_data);
        setLoading(false);
      } catch (error) {
        console.log(error, 'error');
        setLoading(false);
      }
    };
  
    if (userId) {
      fetchData();
    }
  }, [userId]);
  const loadDetails = async () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE shipmentAction="Seller Pickup" AND status IS NULL',
        [],
        (tx1, results) => {
          setPendingPickup(results.rows.length);
        },
      );
    });

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND status IS NULL',
        [],
        (tx1, results) => {
          setPendingDelivery(results.rows.length);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE shipmentAction="Seller Delivery" AND handoverStatus IS NULL',
        [],
        (tx1, results) => {
          setPendingHandover(results.rows.length);
        },
      );
    });
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDetails();
    });
    return unsubscribe;
  }, [navigation]);
  return (
    <NativeBaseProvider>
      <Modal
                  isOpen={showModal1}
                  onClose={() => {
                    setShowModal1(false);
                    navigation.navigate('Main');
                  }}>
                  <Modal.Content
                    backgroundColor={message1 === 1 ? '#fee2e2' : '#fee2e2'}>
                    <Modal.CloseButton />
                    <Modal.Body>
                      <Alert
                        w="100%"
                        status={message1 === 1 ? 'error' : 'error'}>
                        <VStack
                          space={1}
                          flexShrink={1}
                          w="100%"
                          alignItems="center">
                          <Alert.Icon size="4xl" />
                          <Text my={3} fontSize="md" fontWeight="medium">
                            {message1 === 1
                              ? 'No Pickup/Delivery Assigned'
                              : 'Please complete handover before Start a trip'}
                          </Text>
                        </VStack>
                      </Alert>
                    </Modal.Body>
                  </Modal.Content>
                </Modal>
      <ScrollView>
        {loading ? (
          <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
              backgroundColor: 'rgba(0,0,0,0.65)',
            },
          ]}>
          <Text style={{color: 'white'}}>Loading...</Text>
          <Lottie
            source={require('../assets/loading11.json')}
            autoPlay
            loop
            speed={1}
          />
          <ProgressBar width={70} />
        </View>
        ) : (
          <Box flex={1}>
  {tripDetails.length==0 ? (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' , marginTop:'70%'}}>
    <Text
      style={{
        fontSize: 16,
        fontWeight: '500',
        color: 'gray',
      }}
    >
      No Trip History Found
    </Text>
    <Button
      variant="outline"
      onPress={() => {
        handleTrip(route.params.userId)
      }}
      mt={4}
      style={{
        height: 'auto',
        width: '45%',
        backgroundColor: '#004aad',
        elevation: 10,
      }}
    >
      <Text style={{ color: '#fff' }}>{route.params.tripValue}</Text>
    </Button>
    </View>
) : (
  <>
  {tripDetails
    .filter(data => !data.endTime)
    .map((data, i) => (
        <Box
        key={i}
        flex={1}
        bg="#F5F4F4"
        alignItems="center"
        pt={'2%'}
        pb={'2%'}
      >
        
        {i === 0 && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: 'gray',
              }}
              mb={2}
            >
              Current Trip
            </Text>
          </View>
        )}
        <Box
          justifyContent="space-between"
          py={4}
          px={6}
          bg="#fff"
          rounded="sm"
          width={'90%'}
          maxWidth="100%"
          _text={{ fontWeight: 'medium' }}
          style={{
            elevation: 10,
            shadowColor: 'rgba(154, 160, 166, 0.6)',
            shadowOpacity: 0.8, 
            shadowRadius: 4, 
            shadowOffset: {
              width: 0,
              height: 6, 
            },
            borderWidth: 0.1,
            borderColor: 'gray.100',
          }}
        >
          <ScrollView>
            <VStack space={4}>
              <View flexDirection="row">
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: 'gray',
                    marginRight: 8,
                  }}
                  mb={1}
                >
                  Vehicle Number:
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: 'gray',
                  }}
                  mb={1}
                >
                  {data.vehicleNumber}
                </Text>
              </View>
              <View flexDirection="row">
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: 'gray',
                    marginRight: 8,
                  }}
                  mb={1}
                >
                  Start KMs:
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: 'gray',
                  }}
                  mb={1}
                >
                  {data.startKilometer}
                </Text>
              </View>
              <Button
                w="100%"
                rounded="md"
                style={{
                  height: 'auto',
                  backgroundColor: '#004aad',
                  elevation: 10,
                }}
                onPress={() => {
                  handleTrip(data.userID)
                }}
              >
                End Trip
              </Button>
            </VStack>
          </ScrollView>
        </Box>
      </Box>
    ))
    }
  {tripDetails
    .filter(data => data.startTime && data.endTime)
    .sort((a, b) => new Date(b.endTime) - new Date(a.endTime))
    .map((data, i) => (
        <Box
        key={i}
        flex={1}
        bg="#F5F4F4"
        alignItems="center"
        pt={'2%'}
        pb={'2%'}
      >
        
        {i === 0 && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: 'gray',
              }}
              mb={2}
            >
              Previously Ended Trips
            </Text>
          </View>
        )}
        <Box
          justifyContent="space-between"
          py={4}
          px={6}
          bg="#fff"
          rounded="sm"
          width={'90%'}
          maxWidth="100%"
          _text={{ fontWeight: 'medium' }}
          style={{
            elevation: 10,
            shadowColor: 'rgba(154, 160, 166, 0.6)',
            shadowOpacity: 0.8, 
            shadowRadius: 4, 
            shadowOffset: {
              width: 0,
              height: 6, 
            },
            borderWidth: 0.1,
            borderColor: 'gray.100',
          }}
        >
          <ScrollView>
            <VStack space={4}>
              <View flexDirection="row">
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: 'gray',
                    marginRight: 8,
                  }}
                  mb={1}
                >
                  Vehicle Number:
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: 'gray',
                  }}
                  mb={1}
                >
                  {data.vehicleNumber}
                </Text>
              </View>
              <View flexDirection="row">
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: 'gray',
                    marginRight: 8,
                  }}
                  mb={1}
                >
                  Start KMs:
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: 'gray',
                  }}
                  mb={1}
                >
                  {data.startKilometer}
                </Text>
              </View>
              <View flexDirection="row">
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: 'gray',
                    marginRight: 8,
                  }}
                  mb={1}
                >
                  End KMs:
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: 'gray',
                  }}
                  mb={1}
                >
                  {data.endkilometer}
                </Text>
              </View>
              <Button
                w="100%"
                rounded="md"
                style={{
                  height: 'auto',
                  backgroundColor: '#004aad',
                  elevation: 10,
                }}
                onPress={() => {
                  navigation.navigate('StartEndDetails', { tripID: data.tripID });
                }}
              >
                View Details
              </Button>
            </VStack>
          </ScrollView>
        </Box>
      </Box>
    ))
    }
  </>
)}
<Center>
<Image
  style={{width: 150, height: 100}}
  source={require('../assets/image.png')}
  alt={'Logo Image'}
/>
</Center>

          </Box>
        )}
      </ScrollView>
    </NativeBaseProvider>
  );
}
