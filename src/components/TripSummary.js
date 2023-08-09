import React, { useEffect, useState } from 'react';
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
  Heading,
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
import { launchCamera } from 'react-native-image-picker';
import { openDatabase } from 'react-native-sqlite-storage';
const db = openDatabase({ name: 'rn_sqlite' });
import { useIsFocused } from '@react-navigation/native';
import { backendUrl } from '../utils/backendUrl';
import Lottie from 'lottie-react-native';
import { ProgressBar } from '@react-native-community/progress-bar-android';
import PieChart from 'react-native-pie-chart';

export default function TripSummary({ navigation, route }) {
  const [token, setToken] = useState(route.params.token);

  const [tripDetails, setTripDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const focus = useIsFocused();

  useEffect(() => {
    axios
      .get(backendUrl + 'UserTripInfo/getUserTripInfo', {
        params: {
          tripID: route.params.tripID,
        },
        headers: { Authorization: token } 
      })
      .then(response => {
        setTripDetails(response?.data?.res_data?.tripSummary);
      })
      .catch(error => {
        console.log(error, 'TripSummary/useEffect/error');
      });
    setLoading(false);
  }, []);
//   console.log(tripDetails);
  const dashboardData = [
    {
      title: 'Seller Pickups',
      pendingOrder: 0,
      completedOrder: tripDetails?.acceptedPickup || 0,
      rejectedOrder: tripDetails?.rejectedPickup || 0,
      notPicked: tripDetails?.notPicked || 0,
    },
    {
      title: 'Seller Deliveries',
      pendingOrder: 0,
      completedOrder: tripDetails?.acceptedDelivery || 0,
      rejectedOrder: tripDetails?.rejectedDelivery || 0,
      notPicked: tripDetails?.notDelivered || 0,
    },
  ];
  
  return (
    <NativeBaseProvider>
        {loading ? (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
              backgroundColor: 'rgba(0,0,0,0.65)',
            }}
          >
            <Text style={{ color: 'white' }}>Loading...</Text>
            <Lottie
              source={require('../assets/loading11.json')}
              autoPlay
              loop
              speed={1}
            />
            <ProgressBar width={70} />
          </View>
        ) : (
          <Box flex={1} bg="coolGray.200">
            <ScrollView>
              <Box flex={1} bg="coolGray.200" p={4}>
                {dashboardData.map((it, index) => {
                  if (
                    it.completedOrder !== 0 ||
                    it.notPicked !== 0 ||
                    it.rejectedOrder !== 0
                  ) {
                    return (
                      it.title === 'Seller Pickups' ||
                      it.title === 'Seller Deliveries'
                    ) ? (
                      <Box
                        pt={4}
                        mb="6"
                        rounded="md"
                        bg="white"
                        key={index}
                      >
                        <Box
                          w="100%"
                          flexDir="row"
                          justifyContent="space-between"
                          mb={4}
                          px={4}
                          borderBottomRadius="md"
                        >
                          <Box w="45%">
                            <Heading size="sm" mb={4}>
                              {it.title}
                            </Heading>
                            <PieChart
                              widthAndHeight={120}
                              series={[
                                it.completedOrder,
                                it.pendingOrder,
                                it.notPicked,
                                it.rejectedOrder,
                              ]}
                              sliceColor={[
                                '#4CAF50',
                                '#2196F3',
                                '#FFEB3B',
                                '#F44336',
                              ]}
                              doughnut={true}
                              coverRadius={0.6}
                              coverFill={'#FFF'}
                            />
                          </Box>
                          <View style={{ width: '50%' }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 10,
                              }}
                            >
                              {/* <Heading size="sm">
                                {it.title === 'Seller Pickups' ||
                                it.title === 'Seller Handover'
                                  ? 'Total Sellers'
                                  : 'Total Sellers'}
                              </Heading>
                              <Heading size="sm">{it.totalUsers}</Heading> */}
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}
                            >
                              <View style={{ flexDirection: 'row' }}>
                                <View
                                  style={{
                                    width: 15,
                                    height: 15,
                                    backgroundColor: '#4CAF50',
                                    borderRadius: 100,
                                    marginTop: 4,
                                  }}
                                />
                                <Text
                                  style={{
                                    marginLeft: 10,
                                    fontWeight: '500',
                                    fontSize: 14,
                                    color: 'black',
                                  }}
                                >
                                  Completed
                                </Text>
                              </View>
                              <Text
                                style={{
                                  fontWeight: '500',
                                  fontSize: 14,
                                  color: 'black',
                                }}
                              >
                                {it.completedOrder}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}
                            >
                              <View style={{ flexDirection: 'row' }}>
                                <View
                                  style={{
                                    width: 15,
                                    height: 15,
                                    backgroundColor: '#2196F3',
                                    borderRadius: 100,
                                    marginTop: 4,
                                  }}
                                />
                                <Text
                                  style={{
                                    marginLeft: 10,
                                    fontWeight: '500',
                                    fontSize: 14,
                                    color: 'black',
                                  }}
                                >
                                  Pending
                                </Text>
                              </View>
                              <Text
                                style={{
                                  fontWeight: '500',
                                  fontSize: 14,
                                  color: 'black',
                                }}
                              >
                                {it.pendingOrder}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}
                            >
                              <View style={{ flexDirection: 'row' }}>
                                <View
                                  style={{
                                    width: 15,
                                    height: 15,
                                    backgroundColor: '#FFEB3B',
                                    borderRadius: 100,
                                    marginTop: 4,
                                  }}
                                />
                                {it.title === 'Seller Handover' ? (
                                  <Text
                                    style={{
                                      marginLeft: 10,
                                      fontWeight: '500',
                                      fontSize: 14,
                                      color: 'black',
                                    }}
                                  >
                                    Not Handover
                                  </Text>
                                ) : it.title === 'Seller Deliveries' ? (
                                  <Text
                                    style={{
                                      marginLeft: 10,
                                      fontWeight: '500',
                                      fontSize: 14,
                                      color: 'black',
                                    }}
                                  >
                                    Not Delivered
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      marginLeft: 10,
                                      fontWeight: '500',
                                      fontSize: 14,
                                      color: 'black',
                                    }}
                                  >
                                    Not Picked
                                  </Text>
                                )}
                              </View>
                              <Text
                                style={{
                                  fontWeight: '500',
                                  fontSize: 14,
                                  color: 'black',
                                }}
                              >
                                {it.notPicked}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}
                            >
                              <View style={{ flexDirection: 'row' }}>
                                <View
                                  style={{
                                    width: 15,
                                    height: 15,
                                    backgroundColor: '#F44336',
                                    borderRadius: 100,
                                    marginTop: 4,
                                  }}
                                />
                                <Text
                                  style={{
                                    marginLeft: 10,
                                    fontWeight: '500',
                                    fontSize: 14,
                                    color: 'black',
                                  }}
                                >
                                  Rejected
                                </Text>
                              </View>
                              <Text
                                style={{
                                  fontWeight: '500',
                                  fontSize: 14,
                                  color: 'black',
                                }}
                              >
                                {it.rejectedOrder}
                              </Text>
                            </View>
                          </View>
                        </Box>
                      </Box>
                    ) : (
                      <Text key={index}> NO DATA!!</Text>
                    );
                  }
                })}
                <Center>
                  <Image
                    style={{ width: 150, height: 100 }}
                    source={require('../assets/image.png')}
                    alt={'Logo Image'}
                  />
                </Center>
              </Box>
            </ScrollView>
          </Box>
        )}
    </NativeBaseProvider>
  );
}
