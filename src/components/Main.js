/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {Fab} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon1 from 'react-native-vector-icons/FontAwesome';
import {Icon} from 'native-base';
import Lottie from 'lottie-react-native';
import {ProgressBar} from '@react-native-community/progress-bar-android';
import {
  NativeBaseProvider,
  Box,
  Button,
  Center,
  Image,
  Heading,
  VStack,
  Alert,
  Modal,
} from 'native-base';
import { TouchableOpacity } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {openDatabase} from 'react-native-sqlite-storage';
const db = openDatabase({name: 'rn_sqlite'});
import PieChart from 'react-native-pie-chart';
import {StyleSheet} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {backendUrl} from '../utils/backendUrl';
import {convertAbsoluteToRem} from 'native-base/lib/typescript/theme/tools';
import {useSelector, useDispatch} from 'react-redux';
import {setUserEmail, setUserId, setUserName} from '../redux/slice/userSlice';
import {setTripStatus} from '../redux/slice/tripSlice';

export default function Main({navigation, route}) {
  const dispatch = useDispatch();

  const id = useSelector(state => state.user.user_id);
  const tripStatus = useSelector(state => state.trip.tripStatus);
  const isNewSync = useSelector(state => state.newSync.value);

  const [data, setData] = useState(0);
  // const [data1, setData1] = useState(0);
  // const [data2, setData2] = useState('');

  const [isData, setIsData] = useState(false);

  const [spts, setSpts] = useState(0);
  const [spc, setSpc] = useState(0);
  const [spp, setSpp] = useState(0);
  const [spnp, setSpnp] = useState(0);
  const [spr, setSpr] = useState(0);
const [bagShipmentCount,setBagShipmentCount] = useState(0);
  const [shts, setShts] = useState(0);
  const [shc1, setShc1] = useState(0);
  const [shp1, setShp1] = useState(0);
  const [shnp1, setShnp1] = useState(0);
  const [shr1, setShr1] = useState(0);

  const [sdts, setSdts] = useState(0);
  const [spc1, setSpc1] = useState(0);
  const [spp1, setSpp1] = useState(0);
  const [spnp1, setSpnp1] = useState(0);
  const [spr1, setSpr1] = useState(0);
  const [SpARC, setSpARC] = useState(0);
  const [SpARC1, setSpARC1] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [tripValue, setTripValue] = useState('Start Trip');
  const [Forward, setForward] = useState(0);
  const [Reverse, setReverse] = useState(0);
  const [tripData, setTripData] = useState([]);
  const [tripID, setTripID] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal1, setShowModal1] = useState(false);
  const [message1, setMessage1] = useState(0);
  const [myArray, setMyArray] = useState([]);
  const focus = useIsFocused();

  async function getUserDetails() {
    await AsyncStorage.getItem('email')
      .then(value => {
        dispatch(setUserEmail(value));
      })
      .catch(err => {
        console.log(err);
      });

    await AsyncStorage.getItem('userId')
      .then(value => {
        dispatch(setUserId(value));
      })
      .catch(err => {
        console.log(err);
      });

    await AsyncStorage.getItem('name')
      .then(value => {
        dispatch(setUserName(value));
      })
      .catch(err => {
        console.log(err);
      });
      await AsyncStorage.getItem('tripID')
      .then(value => {
        setTripID(value);
      })
      .catch(err => {
        console.log(err);
      });
  }
  function getTripDetails(tripId) {
    axios
      .get(backendUrl + 'UserTripInfo/getUserTripInfo', {
        params: {
          tripID: tripId,
        },
      })
      .then(response => {
        if (response?.data?.res_data) {
          if (response.data.res_data.endkilometer) {
            dispatch(setTripStatus(2));
          } else if (response.data.res_data.startKilometer) {
            dispatch(setTripStatus(1));
          } else {
            dispatch(setTripStatus(0));
          }
        }
      })
      .catch(error => {
        console.log(error, 'error');
      });
  }

  useEffect(() => {
    getUserDetails();
  }, []);

  useEffect(() => {
    getTripDetails(tripID);
  }, [tripID]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSellerPickupDetails();
      loadHanoverDetails();
      loadSellerDeliveryDetails();
      loadtripdetails();
    });
    return unsubscribe;
  }, [navigation]);

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('refresh11');
      if (value === 'refresh') {
        loadSellerPickupDetails();
        loadHanoverDetails();
        loadSellerDeliveryDetails();
        loadtripdetails();
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadSellerPickupDetails();
    loadHanoverDetails();
    loadSellerDeliveryDetails();
    loadtripdetails();
  }, [isNewSync]);

  const loadtripdetails = async () => {
    setIsLoading(!isLoading);
  };

  useEffect(() => {
    if (tripStatus == 1) {
      setTripValue('End Trip');
    } else {
      setTripValue('Start Trip');
    }
  }, [tripStatus]);

  const loadSellerPickupDetails = async () => {
    setIsLoading(!isLoading);
    // setSpp(1);
    // setSpnp(1);
    // setSpc(1);
    // setSpr(1);
    // await AsyncStorage.setItem('refresh11', 'notrefresh');
    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(DISTINCT consignorCode) as count FROM SellerMainScreenDetails WHERE shipmentAction="Seller Pickup"',
        [],
        (tx1, results) => {
          setSpts(results.rows.item(0).count);
          if (results.rows.length > 0) {
            setIsData(true);
          }
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE shipmentAction="Seller Pickup" AND status IS NULL',
        [],
        (tx1, results) => {
          setSpp(results.rows.length);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE shipmentAction="Seller Pickup"',
        [],
        (tx1, results) => {
          setForward(results.rows.length);
        },
      );
    });

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND status="accepted"',
        [],
        (tx1, results) => {
          setSpc(results.rows.length);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND status="accepted" OR status="rejected"',
        [],
        (tx1, results) => {
          setSpARC(results.rows.length);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND status="notPicked"',
        [],
        (tx1, results) => {
          let temp = [];
          setSpnp(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
        },
      );
    });

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND status="rejected"',
        [],
        (tx1, results) => {
          setSpr(results.rows.length);
          setIsLoading(false);
        },
      );
    });
    setLoading(false);
  };

  const loadHanoverDetails = async () => {
    setIsLoading(!isLoading);
    // setSpp1(1);
    // setSpnp1(1);
    // setSpc1(1);
    // setSpr1(1);
    await AsyncStorage.setItem('refresh11', 'notrefresh');
    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(DISTINCT consignorCode) as count FROM SellerMainScreenDetails WHERE shipmentAction="Seller Delivery"',
        [],
        (tx1, results) => {
          setShts(results.rows.item(0).count);
          if (results.rows.length > 0) {
            setIsData(true);
          }
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE shipmentAction="Seller Delivery" AND handoverStatus IS NULL',
        [],
        (tx1, results) => {
          setShp1(results.rows.length);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE shipmentAction="Seller Delivery" AND handoverStatus="pendingHandover"',
        [],
        (tx1, results) => {
          setShnp1(results.rows.length);
        },
      );
    });

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND handoverStatus="accepted" ',
        [],
        (tx1, results) => {
          let temp = [];
          setShc1(results.rows.length);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND  handoverStatus="rejected"',
        [],
        (tx1, results) => {
          setShr1(results.rows.length);
        },
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        `SELECT consignorCode, AcceptedList
        FROM closeHandoverBag1`,
        [],
        (tx, resultSet) => {
          // console.log("resultSet", resultSet.rows.raw());
          const rows = resultSet.rows.raw();
    for (let i = 0; i < rows.length; i++) {
            const item=rows[i];
            const consignorCode = item.consignorCode;
            const acceptedList = JSON.parse(item.AcceptedList);
    // console.log(consignorCode,"  ",acceptedList);
            JSON.parse(rows[i].AcceptedList).forEach((item) => {
              // console.log(item);
              if (!myArray.includes(item)) {
                setMyArray([...myArray, item]);
            }

            });
        }
          // console.log("Seller Handover Closed Bags Shipment Count:",myArray.length);
        }
      );
    });

    setLoading(false);
  };

  const loadSellerDeliveryDetails = async () => {
    setIsLoading(!isLoading);
    // setSpp1(1);
    // setSpnp1(1);
    // setSpc1(1);
    // setSpr1(1);
    await AsyncStorage.setItem('refresh11', 'notrefresh');
    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(DISTINCT consignorCode) as count FROM SellerMainScreenDetails WHERE shipmentAction="Seller Delivery"',
        [],
        (tx1, results) => {
          setSdts(results.rows.item(0).count);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE shipmentAction="Seller Delivery" AND (handoverStatus="accepted" AND status IS NULL)',
        [],
        (tx1, results) => {
          setSpp1(results.rows.length);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE shipmentAction="Seller Delivery"',
        [],
        (tx1, results) => {
          setReverse(results.rows.length);
        },
      );
    });

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND status="accepted" OR  status="tagged"',
        [],
        (tx1, results) => {
          let temp = [];
          setSpc1(results.rows.length);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND status="accepted" OR status="rejected"',
        [],
        (tx1, results) => {
          setSpARC1(results.rows.length);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND status="notDelivered"',
        [],
        (tx1, results) => {
          let temp = [];
          setSpnp1(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
        },
      );
    });

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND status="rejected"',
        [],
        (tx1, results) => {
          setSpr1(results.rows.length);
          setIsLoading(false);
        },
      );
    });
    setLoading(false);
  };

  const value = {
    Accepted: 0,
    Rejected: 0,
  };

  // const createTables = () => {
  //     db.transaction(txn => {
  //         txn.executeSql('DROP TABLE IF EXISTS categories', []);
  //         txn.executeSql('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, clientShipmentReferenceNumber VARCHAR(50), packagingId VARCHAR(50), packagingStatus VARCHAR(50), consignorCode VARCHAR(50), consignorContact VARCHAR(50), PRSNumber VARCHAR(50), ForwardPickups VARCHAR(50), ScanStatus INT(10), UploadStatus INT(10))', [], (sqlTxn, res) => { // console.log("table created successfully");
  //         }, error => {
  //             console.log('error on creating table ' + error.message);
  //         },);
  //     });
  // };

  // const addCategory = (clientShipmentReferenceNumber, packagingId, packagingStatus, consignorCode, consignorContact, PRSNumber, ForwardPickups, ScanStatus, UploadStatus) => {
  //     // console.log(clientShipmentReferenceNumber, packagingId, packagingStatus, consignorCode, consignorContact, PRSNumber, ForwardPickups, ScanStatus, UploadStatus);
  //     if (!clientShipmentReferenceNumber && !packagingId && !packagingStatus && !consignorCode && !consignorContact && !PRSNumber && !ForwardPickups && !ScanStatus && !UploadStatus) { // eslint-disable-next-line no-alert
  //         alert('Enter category');
  //         return false;
  //     }

  //     db.transaction(txn => {
  //         txn.executeSql('INSERT INTO categories (clientShipmentReferenceNumber, packagingId, packagingStatus , consignorCode, consignorContact, PRSNumber, ForwardPickups,ScanStatus,UploadStatus) VALUES (?,?,?,?,?,?,?,?,?)', [
  //             clientShipmentReferenceNumber,
  //             packagingId,
  //             packagingStatus,
  //             consignorCode,
  //             consignorContact,
  //             PRSNumber,
  //             ForwardPickups,
  //             ScanStatus,
  //             UploadStatus,
  //         ], (sqlTxn, res) => {
  //             // console.log('category added successfully');
  //         }, error => {
  //             console.log('error on adding category ' + error.message);
  //         },);
  //     });
  // };
  const handleStartTrip = () => {
    if (spp == 0 && spp1 == 0 && shp1 == 0 && tripValue == 'Start Trip') {
      setMessage1(1);
      setShowModal1(true);
    } else if (shp1 != 0) {
      setMessage1(2);
      setShowModal1(true);
    } else {
      navigation.navigate('MyTrip', {userId: id});
    }
  };
  const storeUser = async () => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // removeUser();
    storeUser();
  }, []);

  // db.transaction(txn => {
  //     txn.executeSql('DROP TABLE IF EXISTS Sync1', []);
  //     txn.executeSql('CREATE TABLE IF NOT EXISTS Sync1(userId ID VARCHAR(30) PRIMARY KEY  ,consignorPickupsList INT(15), CustomerPickupsList VARCHAR(50))', [], (sqlTxn, res) => {
  //         console.log('table created successfully');
  //     }, error => {
  //         console.log('error on creating table ' + error.message);
  //     },);
  // });

  // db.transaction(txn => {
  //     txn.executeSql('INSERT OR REPLACE INTO Sync1 (userId ,consignorPickupsList , CustomerPickupsList) VALUES (?,?,?)', [
  //         userId, data1, data2,
  //     ], (sqlTxn, res) => {
  //         console.log('Data Added to local db successfully');
  //         console.log(res);
  //         console.log(data1 + ' ' + data2);
  //     }, error => {
  //         console.log('error on adding data ' + error.message);
  //     },);
  // });

  // const viewDetails = () => {
  //     db.transaction((tx) => {
  //         tx.executeSql('SELECT * FROM Sync1 where userId=?', [userId], (tx1, results) => {
  //             let temp = [];
  //             for (let i = 0; i < results.rows.length; ++i) {
  //                 temp.push(results.rows.item(i));
  //                 console.log(results.rows.item(i).consignorPickupsList);
  //                 setData1(results.rows.item(i).consignorPickupsList);
  //                 setData2(results.rows.item(i).CustomerPickupsList);
  //                 ToastAndroid.show('consignorPickupsList :' + results.rows.item(i).consignorPickupsList + '\n' + 'CustomerPickupsList : ' + results.rows.item(i).CustomerPickupsList, ToastAndroid.SHORT);
  //             }
  //             // console.log(temp);
  //             // console.log(tx1);
  //         });
  //     });
  // };

  // useEffect(() => {
  //     createTables();
  //     (async () => {
  //         await axios.get(`https://bked.logistiex.com/SellerMainScreen/getMSD/${
  //             route.params.userId
  //         }`).then((res) => {
  //             setData(res.data.consignorPickupsList);
  //         }, (error) => {
  //             alert(error);
  //         });
  //     })();

  //     (async () => {
  //         await axios.get(shipmentData).then((res) => {
  //             res.data.map(m => {
  //                 axios.get(`https://bked.logistiex.com/SellerMainScreen/getSellerDetails/${
  //                     m.consignorCode
  //                 }`).then((d) => {
  //                     d.data.totalPickups.map((val) => {
  //                         addCategory(val.clientShipmentReferenceNumber, val.packagingId, val.packagingStatus, m.consignorCode, m.consignorContact, m.PRSNumber, m.ForwardPickups, 0, 0);
  //                     });
  //                 });
  //             });

  //         }, (error) => {
  //             alert(error);
  //         });
  //     })();
  // }, []);

  // useEffect(() => {
  //     (async () => {
  //         await axios.get(getData).then((res) => {
  //             setData1(res.data.consignorPickupsList);
  //             setData2(res.data.CustomerPickupsList);
  //             console.log(res.data.CustomerPickupsList);
  //             console.log(res.data.consignorPickupsList);
  //             // createTables();
  //         }, (error) => {
  //             Alert.alert(error);
  //         });
  //     })();
  // }, []);
  const dashboardData = [
    {
      title: 'Seller Pickups',
      totalUsers: spts,
      pendingOrder: spp,
      completedOrder: spc,
      rejectedOrder: spr,
      notPicked: spnp,
    },
    {
      title: 'Seller Deliveries',
      totalUsers: sdts,
      pendingOrder: spp1,
      completedOrder: spc1,
      rejectedOrder: spr1,
      notPicked: spnp1,
    },
    {
      title: 'Seller Handover',
      totalUsers: shts,
      pendingOrder: shp1,
      completedOrder: shc1,
      rejectedOrder: shr1,
      notPicked: shnp1,
    },

    //  {
    //     title: 'Customer Pickups',
    //     totalUsers: 21,
    //     pendingOrder: 23,
    //     completedOrder: 123,
    //     rejectedOrder: 112,
    //     notPicked: 70,
    // }, {
    //     title: 'Customer Deliveries',
    //     totalUsers: 9,
    //     pendingOrder: 200,
    //     completedOrder: 303,
    //     rejectedOrder: 32,
    //     notPicked: 70,
    // },
  ];

  return (
    <NativeBaseProvider>
      <Modal isOpen={showModal1} onClose={() => setShowModal1(false)}>
        <Modal.Content backgroundColor={message1 === 1 ? '#fee2e2' : '#fee2e2'}>
          <Modal.CloseButton />
          <Modal.Body>
            <Alert w="100%" status={message1 === 1 ? 'error' : 'error'}>
              <VStack space={1} flexShrink={1} w="100%" alignItems="center">
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
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={{marginTop: 44}} />
      ) : (
        <Box flex={1} bg="gray.300">
          <ScrollView>
            <Box flex={1} bg="gray.300" p={4}>
              {dashboardData.map((it, index) => {
                if (
                  it.completedOrder !== 0 ||
                  it.pendingOrder !== 0 ||
                  it.notPicked !== 0 ||
                  it.rejectedOrder !== 0
                ) {
                  if (shp1 === 0  && shc1 === myArray.length ) {
                    return it.title === 'Seller Pickups' ||
                      it.title === 'Seller Deliveries' ? (
                      <Box pt={4} mb="6" rounded="md" bg="white" key={index}>
                        <Box
                          w="100%"
                          flexDir="row"
                          justifyContent="space-between"
                          mb={4}
                          px={4}
                          borderBottomRadius="md">
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
                          <View style={{width: '50%'}}>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 10,
                              }}>
                              <Heading size="sm">
                                {it.title === 'Seller Pickups' ||
                                it.title === 'Seller Handover'
                                  ? //  || it.title === 'Seller Deliveries'
                                    'Total Sellers'
                                  : 'Total Sellers'}
                              </Heading>
                              <Heading size="sm">{it.totalUsers}</Heading>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}>
                              <View style={{flexDirection: 'row'}}>
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
                                  }}>
                                  Completed
                                </Text>
                              </View>
                              <Text
                                style={{
                                  fontWeight: '500',
                                  fontSize: 14,
                                  color: 'black',
                                }}>
                                {it.completedOrder}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}>
                              <View style={{flexDirection: 'row'}}>
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
                                  }}>
                                  Pending
                                </Text>
                              </View>
                              <Text
                                style={{
                                  fontWeight: '500',
                                  fontSize: 14,
                                  color: 'black',
                                }}>
                                {it.pendingOrder}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}>
                              <View style={{flexDirection: 'row'}}>
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
                                    }}>
                                    Not Handover
                                  </Text>
                                ) : it.title === 'Seller Deliveries' ? (
                                  <Text
                                    style={{
                                      marginLeft: 10,
                                      fontWeight: '500',
                                      fontSize: 14,
                                      color: 'black',
                                    }}>
                                    Not Delivered
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      marginLeft: 10,
                                      fontWeight: '500',
                                      fontSize: 14,
                                      color: 'black',
                                    }}>
                                    Not Picked
                                  </Text>
                                )}
                              </View>
                              <Text
                                style={{
                                  fontWeight: '500',
                                  fontSize: 14,
                                  color: 'black',
                                }}>
                                {it.notPicked}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}>
                              <View style={{flexDirection: 'row'}}>
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
                                  }}>
                                  Rejected
                                </Text>
                              </View>
                              <Text
                                style={{
                                  fontWeight: '500',
                                  fontSize: 14,
                                  color: 'black',
                                }}>
                                {it.rejectedOrder}
                              </Text>
                            </View>
                          </View>
                        </Box>
                        {it.title === 'Seller Handover' ? (


<TouchableOpacity
w="100%"
      style={{
        // size:'90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#004aad',
        elevation: 10,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        // margin: 20,
        padding:8,
        borderRadius:6,

        paddingHorizontal: 10,
      }}
      onPress={()=>{navigation.navigate('SellerHandover');}}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image alt={'Icon Image'}
          source={require('../assets/icons11/Sellerhandover.png')}
          style={{
            width: 45,
            height: 30,
            tintColor: 'white',
            marginRight: 5,
          }}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: 'white',
          }}
        >
          {tripValue === 'Start Trip'
            ? 'Start Handover'
            : spp1 === 0
            ? 'Handover completed'
            : 'Handover in progress'}
        </Text>
      </View>
      <Icon1 name="chevron-right" size={16} color="white" />
    </TouchableOpacity>

/*
                          <Button
                            w="100%"
                            // size="lg"
                            // bg="#004aad"
                            rounded="md"
                            style={{
                              height: 'auto',
                              backgroundColor: '#004aad',
                              elevation: 10,
                            }}
                            onPress={() =>
                              navigation.navigate('SellerHandover')
                            }>
                            {tripValue === 'Start Trip'
                              ? 'Start Handover'
                              : spp1 === 0
                              ? 'Handover completed'
                              : 'Handover in progress'}
                          </Button>
*/

                        ) : it.title === 'Seller Deliveries' ? (


                          <TouchableOpacity
                          w="100%"
                                style={{
                                  // size:'90%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  backgroundColor: '#004aad',
                                  elevation: 10,
                                  borderTopLeftRadius: 0,
                                  borderTopRightRadius: 0,
                                  // margin: 20,
                                  padding:8,
                                  borderRadius:6,
                          
                                  paddingHorizontal: 10,
                                }}
                                onPress={()=>{navigation.navigate('SellerDeliveries', {
                                  Forward: Forward,
                                  Reverse: Reverse,
                                  Trip: tripValue,
                                  PendingHandover: shp1,
                                })}}
                              >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  <Image alt={'Icon Image'}
                                    source={require('../assets/icons11/1685906413809.png')}
                                    style={{
                                      width: 30,
                                      height: 30,
                                      tintColor: 'white',
                                      marginRight: 12,
                                      marginLeft:8,
                                    }}
                                  />
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontWeight: '500',
                                      color: 'white',
                                    }}
                                  >
                                     {tripValue === 'Start Trip'
                              ? 'New Delivery'
                              : spp1 === 0
                              ? 'Delivery completed'
                              : 'Delivery in progress'}
                                  </Text>
                                </View>
                                <Icon1 name="chevron-right" size={16} color="white" />
                              </TouchableOpacity>

/*
                          <Button
                            w="100%"
                            // size="lg"
                            // bg="#004aad"
                            rounded="md"
                            style={{
                              height: 'auto',
                              backgroundColor: '#004aad',
                              elevation: 10,
                            }}
                            onPress={() =>
                              navigation.navigate('SellerDeliveries', {
                                Forward: Forward,
                                Reverse: Reverse,
                                Trip: tripValue,
                                PendingHandover: shp1,
                              })
                            }>
                            {tripValue === 'Start Trip'
                              ? 'New Delivery'
                              : spp1 === 0
                              ? 'Delivery completed'
                              : 'Delivery in progress'}
                          </Button>
*/


                        ) : (



                          <TouchableOpacity
w="100%"
      style={{
        // size:'90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#004aad',
        elevation: 10,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        // margin: 20,
        padding:8,
        borderRadius:6,

        paddingHorizontal: 10,
      }}
      onPress={()=>{navigation.navigate('NewSellerPickup', {
        Forward: Forward,
        Reverse: Reverse,
        Trip: tripValue,
        userId: id,
        PendingHandover: shp1,
      })}}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image alt={'Icon Image'}
          source={require('../assets/icons11/new_pickup11.png')}
          style={{
            width: 45,
            height: 30,
            tintColor: 'white',
            marginRight: 5,
          }}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: 'white',
          }}
        >
           {tripValue === 'Start Trip'
                              ? 'New Pickup'
                              : spp === 0
                              ? 'Pickup completed'
                              : 'Pickup in progress'}
        </Text>
      </View>
      <Icon1 name="chevron-right" size={16} color="white" />
    </TouchableOpacity>
                          /*
                          <Button
                            w="100%"
                            // size="lg"
                            // bg="#004aad"
                            rounded="md"
                            style={{
                              height: 'auto',
                              backgroundColor: '#004aad',
                              elevation: 10,
                            }}
                            
                            onPress={() =>
                              navigation.navigate('NewSellerPickup', {
                                Forward: Forward,
                                Reverse: Reverse,
                                Trip: tripValue,
                                userId: id,
                                PendingHandover: shp1,
                              })
                            }>
                              <Image alt={'Icon Image'}
        source={require('../assets/icons11/new_pickup11.png')}
        style={{
          width: 5,
          height: 5,
          tintColor: 'blue',
        }}
      />
                            {tripValue === 'Start Trip'
                              ? 'New Pickup'
                              : spp === 0
                              ? 'Pickup completed'
                              : 'Pickup in progress'}
                          </Button>
                          */



                        )}
                      </Box>
                    ) : null;
                  } else {
                    return it.title === 'Seller Pickups' ||
                      it.title === 'Seller Handover' ? (
                      <Box pt={4} mb="6" rounded="md" bg="white" key={index}>
                        <Box
                          w="100%"
                          flexDir="row"
                          justifyContent="space-between"
                          mb={4}
                          px={4}>
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
                          <View style={{width: '50%'}}>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 10,
                              }}>
                              <Heading size="sm">
                                {it.title === 'Seller Pickups' ||
                                it.title === 'Seller Handover'
                                  ? //  || it.title === 'Seller Deliveries'
                                    'Total Sellers'
                                  : 'Total Sellers'}
                              </Heading>
                              <Heading size="sm">{it.totalUsers}</Heading>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}>
                              <View style={{flexDirection: 'row'}}>
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
                                  }}>
                                  Completed
                                </Text>
                              </View>
                              <Text
                                style={{
                                  fontWeight: '500',
                                  fontSize: 14,
                                  color: 'black',
                                }}>
                                {it.completedOrder}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}>
                              <View style={{flexDirection: 'row'}}>
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
                                  }}>
                                  Pending
                                </Text>
                              </View>
                              <Text
                                style={{
                                  fontWeight: '500',
                                  fontSize: 14,
                                  color: 'black',
                                }}>
                                {it.pendingOrder}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}>
                              <View style={{flexDirection: 'row'}}>
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
                                    }}>
                                    Not Handover
                                  </Text>
                                ) : it.title === 'Seller Deliveries' ? (
                                  <Text
                                    style={{
                                      marginLeft: 10,
                                      fontWeight: '500',
                                      fontSize: 14,
                                      color: 'black',
                                    }}>
                                    Not Delivered
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      marginLeft: 10,
                                      fontWeight: '500',
                                      fontSize: 14,
                                      color: 'black',
                                    }}>
                                    Not Picked
                                  </Text>
                                )}
                              </View>
                              <Text
                                style={{
                                  fontWeight: '500',
                                  fontSize: 14,
                                  color: 'black',
                                }}>
                                {it.notPicked}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}>
                              <View style={{flexDirection: 'row'}}>
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
                                  }}>
                                  Rejected
                                </Text>
                              </View>
                              <Text
                                style={{
                                  fontWeight: '500',
                                  fontSize: 14,
                                  color: 'black',
                                }}>
                                {it.rejectedOrder}
                              </Text>
                            </View>
                          </View>
                        </Box>
                        {it.title === 'Seller Handover' ? (


               

<TouchableOpacity
w="100%"
      style={{
        // size:'90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#004aad',
        elevation: 10,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        // margin: 20,
        padding:8,
        borderRadius:6,

        paddingHorizontal: 10,
      }}
      onPress={()=>{navigation.navigate('SellerHandover');}}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image alt={'Icon Image'}
          source={require('../assets/icons11/Sellerhandover.png')}
          style={{
            width: 45,
            height: 30,
            tintColor: 'white',
            marginRight: 5,
          }}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: 'white',
          }}
        >
          {tripValue === 'Start Trip'
            ? 'Start Handover'
            : spp1 === 0
            ? 'Handover completed'
            : 'Handover in progress'}
        </Text>
      </View>
      <Icon1 name="chevron-right" size={16} color="white" />
    </TouchableOpacity>


 
/*
 <Button
w="100%"
style={{
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#004aad',
  elevation: 10,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  marginTop: -10,
  paddingHorizontal: 10,
}}
onPress={() =>
  navigation.navigate('SellerHandover')
}
>
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Image alt={'Icon Image'}
      source={require('../assets/icons11/Sellerhandover.png')}
      style={{
        width: 45,
        height: 30,
        tintColor: 'white',
        marginRight: 5,
      }}
    />
    <Text
      style={{
        fontSize: 16,
        fontWeight: '500',
        color: 'white',
      }}
    >
        {tripValue === 'Start Trip'
                               ? 'Start Handover'
                               : spp1 === 0
                               ? 'Handover completed'
                               : 'Handover in progress'}
    </Text>
  </View>
  <Icon1 name="chevron-right" size={16} color="white" />
</View>
</Button> 
*/


                          // <Button
                          //   w="100%"
                          //   // size="lg"
                          //   // bg="#004aad"
                          //   rounded="md"
                          //   style={{
                          //     height: 'auto',
                          //     backgroundColor: '#004aad',
                          //     elevation: 10,
                          //   }}
                          //   onPress={() =>
                          //     navigation.navigate('SellerHandover')
                          //   }>
                          //   {tripValue === 'Start Trip'
                          //     ? 'Start Handover'
                          //     : spp1 === 0
                          //     ? 'Handover completed'
                          //     : 'Handover in progress'}
                          // </Button>



                        ) : it.title === 'Seller Deliveries' ? (


<TouchableOpacity
                          w="100%"
                                style={{
                                  // size:'90%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  backgroundColor: '#004aad',
                                  elevation: 10,
                                  borderTopLeftRadius: 0,
                                  borderTopRightRadius: 0,
                                  // margin: 20,
                                  padding:8,
                                  borderRadius:6,
                          
                                  paddingHorizontal: 10,
                                }}
                                onPress={()=>{navigation.navigate('SellerDeliveries', {
                                  Forward: Forward,
                                  Reverse: Reverse,
                                  Trip: tripValue,
                                  PendingHandover: shp1,
                                })}}
                              >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  <Image alt={'Icon Image'}
                                    source={require('../assets/icons11/1685906413809.png')}
                                    style={{
                                      width: 30,
                                      height: 30,
                                      tintColor: 'white',
                                      // marginRight: 5,
                                      marginRight: 12,
                                      marginLeft:8,
                                    }}
                                  />
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontWeight: '500',
                                      color: 'white',
                                    }}
                                  >
                                     {tripValue === 'Start Trip'
                              ? 'New Delivery'
                              : spp1 === 0
                              ? 'Delivery completed'
                              : 'Delivery in progress'}
                                  </Text>
                                </View>
                                <Icon1 name="chevron-right" size={16} color="white" />
                              </TouchableOpacity>

                          /*
                          <Button
                            w="100%"
                            // size="lg"
                            // bg="#004aad"
                            rounded="md"
                            style={{
                              height: 'auto',
                              backgroundColor: '#004aad',
                              elevation: 10,
                            }}
                            onPress={() =>
                              navigation.navigate('SellerDeliveries', {
                                Forward: Forward,
                                Reverse: Reverse,
                                Trip: tripValue,
                                PendingHandover: shp1,
                              })
                            }>
                            {tripValue === 'Start Trip'
                              ? 'New Delivery'
                              : spp1 === 0
                              ? 'Delivery completed'
                              : 'Delivery in progress'}
                          </Button>
                          */



                        ) : (

                          <TouchableOpacity
                          w="100%"
                                style={{
                                  // size:'90%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  backgroundColor: '#004aad',
                                  elevation: 10,
                                  borderTopLeftRadius: 0,
                                  borderTopRightRadius: 0,
                                  // margin: 20,
                                  padding:8,
                                  borderRadius:6,
                          
                                  paddingHorizontal: 10,
                                }}
                                onPress={()=>{navigation.navigate('NewSellerPickup', {
                                  Forward: Forward,
                                  Reverse: Reverse,
                                  Trip: tripValue,
                                  userId: id,
                                  PendingHandover: shp1,
                                })}}
                              >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  <Image alt={'Icon Image'}
                                    source={require('../assets/icons11/new_pickup11.png')}
                                    style={{
                                      width: 40,
                                      height: 30,
                                      tintColor: 'white',
                                      marginRight: 5,
                                    }}
                                  />
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontWeight: '500',
                                      color: 'white',
                                    }}
                                  >
                                     {tripValue === 'Start Trip'
                                                        ? 'New Pickup'
                                                        : spp === 0
                                                        ? 'Pickup completed'
                                                        : 'Pickup in progress'}
                                  </Text>
                                </View>
                                <Icon1 name="chevron-right" size={16} color="white" />
                              </TouchableOpacity>
                         /* 
                         <Button
  w="100%"
  style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#004aad',
    elevation: 10,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: -10,
    paddingHorizontal: 10,
  }}
  onPress={() =>
    navigation.navigate('NewSellerPickup', {
      Forward: Forward,
      Reverse: Reverse,
      Trip: tripValue,
      userId: id,
      PendingHandover: shp1,
    })
  }
>
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image alt={'Icon Image'}
        source={require('../assets/icons11/new_pickup11.png')}
        style={{
          width: 35,
          height: 32,
          tintColor: 'white',
          marginRight: 5,
        }}
      />
      <Text
        style={{
          fontSize: 16,
          fontWeight: '500',
          color: 'white',
        }}
      >
        {tripValue === 'Start Trip'
          ? 'New Pickup                                                   '
          : spp === 0
          ? 'Pickup completed'
          : 'Pickup in progress'}
      </Text>
    </View>
    <Icon1 name="chevron-right" size={16} color="white" />
  </View>
</Button>
*/

                        
                        )}
                      </Box>
                    ) : null;
                  }
                } else {
                  return (
                    // <Box pt={4} mb="6" rounded="md" bg="white" key={index}>
                    //   <Box
                    //     w="100%"
                    //     flexDir="row"
                    //             justifyContent="space-between"
                    //             mb={4}
                    //             px={4}>
                    //             <Box w="45%">
                    //               <Heading size="sm" mb={4}>
                    //                 {it.title}
                    //               </Heading>
                    //               <Center>
                    //                 {/* <Text style={{color:'black'}}>No assignment for {it.title} </Text> */}
                    //                 <Image alt={'Icon Image'}
                    //                   style={{width: 80, height: 80}}
                    //                   source={require('../assets/noDataAvailable.jpg')}
                    //                   alt={'No data Image'}
                    //                 />
                    //               </Center>
                    //             </Box>
                    //             <View style={{width: '50%'}}>
                    //               <View
                    //                 style={{
                    //                   flexDirection: 'row',
                    //                   justifyContent: 'space-between',
                    //                   marginBottom: 10,
                    //                 }}>
                    //                 <Heading size="sm">
                    //                   {it.title === 'Seller Pickups' ||
                    //                   it.title === 'Seller Deliveries'
                    //                     ? 'Total Sellers'
                    //                     : 'Total Customers'}
                    //                 </Heading>
                    //                 <Heading size="sm">{it.totalUsers}</Heading>
                    //               </View>
                    //               <View
                    //                 style={{
                    //                   flexDirection: 'row',
                    //                   justifyContent: 'space-between',
                    //                   marginTop: 10,
                    //                 }}>
                    //                 <View style={{flexDirection: 'row'}}>
                    //                   <View
                    //                     style={{
                    //                       width: 15,
                    //                       height: 15,
                    //                       backgroundColor: '#4CAF50',
                    //                       borderRadius: 100,
                    //                       marginTop: 4,
                    //                     }}
                    //                   />
                    //                   <Text
                    //                     style={{
                    //                       marginLeft: 10,
                    //                       fontWeight: '500',
                    //                       fontSize: 14,
                    //                       color: 'black',
                    //                     }}>
                    //                     Completed
                    //                   </Text>
                    //                 </View>
                    //                 <Text
                    //                   style={{
                    //                     fontWeight: '500',
                    //                     fontSize: 14,
                    //                     color: 'black',
                    //                   }}>
                    //                   {it.completedOrder}
                    //                 </Text>
                    //               </View>
                    //               <View
                    //                 style={{
                    //                   flexDirection: 'row',
                    //                   justifyContent: 'space-between',
                    //                   marginTop: 10,
                    //                 }}>
                    //                 <View style={{flexDirection: 'row'}}>
                    //                   <View
                    //                     style={{
                    //                       width: 15,
                    //                       height: 15,
                    //                       backgroundColor: '#2196F3',
                    //                       borderRadius: 100,
                    //                       marginTop: 4,
                    //                     }}
                    //                   />
                    //                   <Text
                    //                     style={{
                    //                       marginLeft: 10,
                    //                       fontWeight: '500',
                    //                       fontSize: 14,
                    //                       color: 'black',
                    //                     }}>
                    //                     Pending
                    //                   </Text>
                    //                 </View>
                    //                 <Text
                    //                   style={{
                    //                     fontWeight: '500',
                    //                     fontSize: 14,
                    //                     color: 'black',
                    //                   }}>
                    //                   {it.pendingOrder}
                    //                 </Text>
                    //               </View>
                    //               <View
                    //                 style={{
                    //                   flexDirection: 'row',
                    //                   justifyContent: 'space-between',
                    //                   marginTop: 10,
                    //                 }}>
                    //                 <View style={{flexDirection: 'row'}}>
                    //                   <View
                    //                     style={{
                    //                       width: 15,
                    //                       height: 15,
                    //                       backgroundColor: '#FFEB3B',
                    //                       borderRadius: 100,
                    //                       marginTop: 4,
                    //                     }}
                    //                   />
                    //                   {it.title === 'Seller Deliveries' ? (
                    //                     <Text
                    //                       style={{
                    //                         marginLeft: 10,
                    //                         fontWeight: '500',
                    //                         fontSize: 14,
                    //                         color: 'black',
                    //                       }}>
                    //                       Not Delivered
                    //                     </Text>
                    //                   ) : (
                    //                     <Text
                    //                       style={{
                    //                         marginLeft: 10,
                    //                         fontWeight: '500',
                    //                         fontSize: 14,
                    //                         color: 'black',
                    //                       }}>
                    //                       Not Picked
                    //                     </Text>
                    //                   )}
                    //                 </View>
                    //                 <Text
                    //                   style={{
                    //                     fontWeight: '500',
                    //                     fontSize: 14,
                    //                     color: 'black',
                    //                   }}>
                    //                   {it.notPicked}
                    //                 </Text>
                    //               </View>
                    //               <View
                    //                 style={{
                    //                   flexDirection: 'row',
                    //                   justifyContent: 'space-between',
                    //                   marginTop: 10,
                    //                 }}>
                    //                 <View style={{flexDirection: 'row'}}>
                    //                   <View
                    //                     style={{
                    //                       width: 15,
                    //                       height: 15,
                    //                       backgroundColor: '#F44336',
                    //                       borderRadius: 100,
                    //                       marginTop: 4,
                    //                     }}
                    //                   />
                    //                   <Text
                    //                     style={{
                    //                       marginLeft: 10,
                    //                       fontWeight: '500',
                    //                       fontSize: 14,
                    //                       color: 'black',
                    //                     }}>
                    //                     Rejected
                    //                   </Text>
                    //                 </View>
                    //                 <Text
                    //                   style={{
                    //                     fontWeight: '500',
                    //                     fontSize: 14,
                    //                     color: 'black',
                    //                   }}>
                    //                   {it.rejectedOrder}
                    //                 </Text>
                    //               </View>
                    //             </View>
                    //           </Box>

                    // </Box>
                    null
                  );
                }
              })}
              {/* {(dashboardData[1].completedOrder!=0 || dashboardData[1].pendingOrder!=0 || dashboardData[1].notPicked!=0 || dashboardData[1].rejectedOrder!=0) ?
        <Button w="100%" size="lg" bg="#004aad" onPress={()=>navigation.navigate('SellerHandover')}>Start Handover</Button>
        :
        null} */}
              {isData ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  variant="outline"
                  onPress={() => {
                    handleStartTrip();
                  }}
                  mt={4}
                  style={{
                    // height: 'auto',
                    width:'48%',
                    // backgroundColor: '#fff',
                    backgroundColor: '#004aad',

                    borderWidth: 2,
                    borderColor: '#004aad',
                    elevation: 15,
                    shadowColor: 'rgba(154, 160, 166, 0.5)',
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Image alt={'Icon Image'}
      source={require('../assets/icons11/1685612829193.png')}
      style={{
        width: 30,
        height: 26,
        tintColor: 'white',
        marginRight: 5,
      }}
    />
                  <Text style={{ color: 'white',fontWeight:'bold'}}>{tripValue}</Text>
                  </View>
                </Button>
                <Button
                  variant="outline"
                  onPress={() => {
                    navigation.navigate('TripHistory', { userId: id , tripValue:tripValue});
                  }}
                  mt={4}
                  style={{

                    backgroundColor: '#004aad',



                    height: 'auto',
                    width:'48%',
                    // backgroundColor: '#fff',
                    borderWidth: 2,
                    borderColor: '#004aad',
                    elevation: 15,
                    shadowColor: 'rgba(154, 160, 166, 0.5)',
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Image alt={'Icon Image'}
      source={require('../assets/icons11/1685611800053.png')}
      style={{
        width: 25,
        height: 25,
        tintColor: 'white',
        marginRight: 5,
      }}
    />
                  <Text style={{ color: 'white',fontWeight:'bold' }}>Trip History</Text>
                  </View>
                </Button>
              </View>              
              
              ) : (
                <Center style={{marginVertical: 50}}>
                  {/* <Text style={{color:'black'}}>No assignment for {it.title} </Text> */}
                  <Image
                    source={require('../assets/noDataAvailable.jpg')}
                    alt={'No data Image'}
                  />
                </Center>
              )}

              {/* <Fab onPress={()=>{navigation.navigate('MyTrip', {userId: id})}} position="absolute" size="sm" style={{backgroundColor: '#004aad'}} label={<Text style={{color: 'white', fontSize: 16}} >{tripValue}</Text>} /> */}
              {/* <Button w="100%" size="lg" bg="#004aad" mt={-5} onPress={()=>navigation.navigate('SellerHandover')}>Seller Handover</Button> */}
              {/* <Button w="100%" size="lg" bg="#004aad" onPress={()=>navigation.navigate('SellerHandover')}>Start Handover</Button> */}
              <Center>
                <Image
                  style={{width: 150, height: 100}}
                  source={require('../assets/image.png')}
                  alt={'Logo Image'}
                />
              </Center>
            </Box>
          </ScrollView>
          {/* <Fab onPress={()=>sync11()} position="absolute" size="sm" style={{backgroundColor: '#004aad'}} icon={<Icon color="white" as={<MaterialIcons name="sync" />} size="sm" />} /> */}
          {isLoading ? (
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
                //   progress={animationProgress.current}
              />
              <ProgressBar width={70} />
            </View>
          ) : null}
        </Box>
      )}
    </NativeBaseProvider>
  );
}
