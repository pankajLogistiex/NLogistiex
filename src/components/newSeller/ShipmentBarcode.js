/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  NativeBaseProvider,
  Image,
  Box,
  Fab,
  Icon,
  Button,
  Modal,
  Input,
} from 'native-base';
import React, {useEffect, useState, useRef,useCallback} from 'react';
import axios from 'axios';
import {
  Text,
  View,
  ScrollView,
  Vibration,
  ToastAndroid,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import Sound from 'react-native-sound';
import HapticFeedback from 'react-native-haptic-feedback';
import {Center} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import {openDatabase} from 'react-native-sqlite-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';
import RNBeep from 'react-native-a-beep';
import {Picker} from '@react-native-picker/picker';
import GetLocation from 'react-native-get-location';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import OTPTextInput from 'react-native-otp-textinput';

import dingReject11 from '../../assets/rejected_sound.mp3';

import dingAccept11 from '../../assets/beep_accepted.mp3';
import { backendUrl } from '../../utils/backendUrl';
import { setAutoSync } from '../../redux/slice/autoSyncSlice';
import { useDispatch, useSelector } from 'react-redux';
const db = openDatabase({
  name: 'rn_sqlite',
});

const ShipmentBarcode = ({ route }) => {
  const dispatch = useDispatch();
  const syncTimeFull = useSelector((state) => state.autoSync.syncTimeFull);

  const [expected, setExpected] = useState(0);
  const [newaccepted, setnewAccepted] = useState(0);
  const [newrejected, setnewRejected] = useState(0);
  const [newNotPicked, setNewNotPicked] = useState(0);
  const [barcode, setBarcode] = useState('');
  const [packagingAction, setPackagingAction] = useState();
  const [packagingID, setPackagingID] = useState('');
  const [len, setLen] = useState(0);
  const [DropDownValue, setDropDownValue] = useState('');
  const [rejectedData, setRejectedData] = useState([]);
  const [acceptedArray, setAcceptedArray] = useState([]);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const[enableGeoFence, setEnableGeoFence]= useState(0);
  const [sellerLatitude, setSellerLatitude] = useState(0);
  const [sellerLongitude, setSellerLongitude] = useState(0);
  const currentDateValue = useSelector((state) => state.currentDate.currentDateValue) || new Date().toISOString().split('T')[0] ;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleCNA, setModalVisibleCNA] = useState(false);
  const [bagId, setBagId] = useState('');
  const [bagIdNo, setBagIdNo] = useState(1);
  const [showCloseBagModal, setShowCloseBagModal] = useState(false);
  const [showCloseBagModal11, setShowCloseBagModal11] = useState(false);
  const [showCloseBagModal12, setShowCloseBagModal12] = useState(false);
  const [showModal, setModal] = useState(false);
  const [showModal1, setModal1] = useState(false);
  const [bagSeal, setBagSeal] = useState('');
  const [check11, setCheck11] = useState(0);
  const [pdCheck, setPDCheck] = useState(false);
  const [expectedPackagingId, setExpectedPackaging] = useState('');
  const [scannedValue, setScannedValue] = useState(expectedPackagingId);
  const [showScanner, setShowScanner] = useState(true);

  const buttonColor = acceptedArray.length === 0 ? 'gray.300' : '#004aad';

  const buttonColorRejected = check11 === 0 ? 'gray.300' : '#004aad';
  var otpInput = useRef(null);
  const [name, setName] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [mobileNumber, setMobileNumber] = useState(route.params.phone);
  const [showModal11, setShowModal11] = useState(false);
  const [modalVisible11, setModalVisible11] = useState(false);
  const [DropDownValue11, setDropDownValue11] = useState('');
  const [PartialCloseData, setPartialCloseData] = useState([]);
  const [closeBagColor, setCloseBagColor] = useState('gray.300');
  const [showQRCodeModal, setShowQRCodeModal] = useState(true);
  const [showOuterScanner, setShowOuterScanner] = useState(true);

  const currentDate = new Date().toISOString().slice(0, 10);
  let serialNo = 0;


const [text11,setText11] = useState('');
const [text12,setText12] = useState('');
    const buttonColor11 = text11.length === 1 ? '#004aad' : 'white';
    const [isPressed, setIsPressed] = useState(false);

  const [scanned, setScanned] = useState(true);
  const scannerRef = useRef(null);

  // Calculate the distance between the two locations using the Haversine formula
  const calculateDistance = (lat1, long1, lat2, long2) => {
    const R = 6371; // radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((long2 - long1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c * 1000;
    console.log('Distance between seller and pickup is ' + d + ' meters and ' + d / 1000 + ' Km' ); // distance in meters
    return d;
  };

  // Check if the current location is within 100 meters of the seller location
  const isWithin100Meters = (cLatitude,cLongitude) => {
    const distance = calculateDistance(
      cLatitude,
      cLongitude,
      sellerLatitude,
      sellerLongitude,
    );
    // return distance <= 100;
    return distance;

  };

  // Handle the action based on the geofencing logic
  const handleRejectAction =  async (reason, geofencing) => {
   await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    })
      .then(location => {
        setLatitude(location.latitude);
        setLongitude(location.longitude);
        let m = isWithin100Meters(location.latitude, location.longitude);
        if (geofencing==0) {
          rejectDetails2(location.latitude, location.longitude, reason);
        } else {
          if (m <= 100) {
            rejectDetails2(location.latitude, location.longitude, reason);
          } else {
            Alert.alert(
              'Shipment cannot be rejected',
              Math.floor(m) < 1000
                ? 'You are currently ' + Math.floor(m) + ' meters away from the seller.'
                : 'You are currently ' + Math.floor(m) / 1000 + ' Km away from the seller.',
              [
                {
                  text: 'Cancel reject',
                  onPress: () => {
                    console.log('Cancel Pressed');
                    setEnableGeoFence(0);
                    setDropDownValue('');
                    setExpectedPackaging('');
                    setLen(0);
                  },
                  style: 'cancel',
                },
                {
                  text: 'Retry',
                  onPress: () => handleRejectAction(reason,geofencing),
                },
              ]
            );
          }
        }
      })
      .catch(error => {
        RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
          interval: 10000,
          fastInterval: 5000,
        })
          .then(status => {
            if (status) {
              console.log('Location enabled');
            }
          })
          .catch(err => {
            console.log(err);
          });
        console.log('Location Lat long error', error);
      });
  };
  const vibrateDevice = (type) => {
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };
    HapticFeedback.trigger(type, options);
  };

  const reloadScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.reactivate();
    }
  };

  const sellerLatLongLoad = ()=>{
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SyncSellerPickUp where  stopId=? ',
        [route.params.stopId],
        (tx1, results) => {
          setSellerLatitude(results.rows.item(0).consignorLatitude);
          setSellerLongitude(results.rows.item(0).consignorLongitude);
        },
      );
    });

  };


  Sound.setCategory('Playback');

var dingAccept = new Sound(dingAccept11, error => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // if loaded successfully
  // console.log(
  //   'duration in seconds: ' +
  //     dingAccept.getDuration() +
  //     'number of channels: ' +
  //     dingAccept.getNumberOfChannels(),
  // );
});

  useEffect(() => {
    dingAccept.setVolume(1);
    return () => {
      dingAccept.release();
    };
  }, []);

  var dingReject = new Sound(dingReject11, error => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    // if loaded successfully
    // console.log(
    //   'duration in seconds: ' +
    //   dingReject.getDuration() +
    //     'number of channels: ' +
    //     dingReject.getNumberOfChannels(),
    // );
  });

    useEffect(() => {
      dingReject.setVolume(1);
      return () => {
        dingReject.release();
      };
    }, []);

  useEffect(() => {
    reloadScanner();
    sellerLatLongLoad();
    // Sound.setCategory('Playback');
  }, []);
  const DisplayData11 = async () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM ShipmentFailure', [], (tx1, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        setPartialCloseData(temp);
      });
    });
  };
  useEffect(() => {
    DisplayData11();
    check121();
  }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(setAutoSync(false));
      displayDataSPScan();
      check121();
    sellerLatLongLoad();
      Sound.setCategory('Playback');
    });
    return unsubscribe;
  }, [navigation, syncTimeFull]);
  // useEffect(() => {
  //   partialClose112();
  // }, []);

  const check121 = ()=>{
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM closeBag1 WHERE  stopId=? And status="scanPending"',
        [route.params.stopId],
        (tx1, results) => {
          if (results.rows.length > 0){
          setPDCheck(true);
          } else {
            setPDCheck(false);
          }
        },
      );
    });
  };
  const displayDataSPScan = async () => {

    // db.transaction(tx => {
    //   tx.executeSql(
    //     'SELECT * FROM closeBag1 WHERE  consignorCode=? And status="scanPending"',
    //     [route.params.consignorCode],
    //     (tx1, results) => {
    //       if(results.rows.length>0){
    //       setPDCheck(true);
    //       }else{
    //         setPDCheck(false);
    //       }
    //     },
    //   );
    // });

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=?  AND status="accepted"',
        [route.params.stopId],
        (tx1, results) => {
          setnewAccepted(results.rows.length);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=? AND status="notPicked"',
        [route.params.stopId],
        (tx1, results) => {
          setNewNotPicked(results.rows.length);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=? AND status="rejected"',
        [route.params.stopId],
        (tx1, results) => {
          setnewRejected(results.rows.length);
        },
      );
    });
  };

  const partialClose112 = () => {
    console.log('partialClose popup shown11');

    if (newaccepted + newrejected === route.params.Forward) {
      console.log(newaccepted);
      // sendSmsOtp();
      navigation.navigate('POD', {
        Forward: route.params.Forward,
        accepted: newaccepted,
        rejected: newrejected,
        notPicked: newNotPicked,
        phone: route.params.phone,
        userId: route.params.userId,
        DropDownValue: DropDownValue11,
        consignorCode: route.params.consignorCode,
        stopId:route.params.stopId,
        tripId:route.params.tripID,
        contactPersonName: route.params.contactPersonName,
        runsheetno: route.params.PRSNumber,
        latitude: latitude,
        longitude: longitude,
      });
    } else {
      setDropDownValue11('');
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM closeBag1 WHERE  stopId=? And status="scanPending"',
          [route.params.stopId],
          (tx1, results) => {
            if (results.rows.length > 0){
            setPDCheck(true);
            setModalVisible11(true);
            } else {
              setPDCheck(false);
               setModalVisible11(true);
            }
          },
        );
      });
      // setModalVisible11(true);
    }
  };

  // const clearText = () => {
  //   otpInput.current.clear();
  // }

  // const setText = () => {
  //   otpInput.current.setValue("1234");
  // }

  useEffect(() => {
    current_location();
  }, []);

  const current_location = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    })
      .then(location => {
        setLatitude(location.latitude);
        setLongitude(location.longitude);
      })
      .catch(error => {
        RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
          interval: 10000,
          fastInterval: 5000,
        })
          .then(status => {
            if (status) {
              console.log('Location enabled');
            }
          })
          .catch(err => {
            console.log(err);
          });
        console.log('Location Lat long error', error);
      });
  };

  const sendSmsOtp = async () => {
    console.log(mobileNumber);
    const response = await axios
      .post(backendUrl + 'SMS/msg', {
        mobileNumber: mobileNumber,
      })
      .then(setShowModal11(true))
      .catch(err => console.log('OTP not send'));
    
  };

  function handleButtonPress11(item) {
    console.log('partial button 121' + item);
    if (item == 'PDF') {
      setDropDownValue11('');
      setModalVisible11(false);
      navigation.navigate('Dispatch', {
        consignorCode: route.params.consignorCode,
        userId:route.params.userId,
        stopId:route.params.stopId
      });
    }
    if(item == 'CNA'){
      setDropDownValue11('');
      setModalVisibleCNA(true);
      setModalVisible11(false);
    }
    setDropDownValue11(item);
    // setModalVisible11(false);
  }

  function validateOTP() {
    axios
      .post(backendUrl + 'SMS/OTPValidate', {
        mobileNumber: mobileNumber,
        otp: inputOtp,
      })
      .then(response => {
        if (response.data.return) {
          // submitForm11();
          setInputOtp('');
          setShowModal11(false);
          ToastAndroid.show('Submit successful', ToastAndroid.SHORT);
          navigation.navigate('Main', {
            userId: route.params.userId,
          });
        } else {
          alert('Invalid OTP, please try again !!');
        }
      })
      .catch(error => {
        alert('Invalid OTP, please try again !!');
        console.log(error);
      });
  }

  // useEffect(() => {
  //   setBagId();
  // }, [bagId]);

  // useEffect(() => {
  //       updateDetails2();
  //       console.log("fdfdd "+barcode);
  // });

  function CloseBagEndScan() {
    partialClose112();
    console.log(bagSeal);
    console.log(acceptedArray);
    let date = new Date().getDate();
    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();
    let date11 = date + '' + month + '' + year;
    // console.log(route.params.userId + date11 + bagIdNo);
    let bagId11 = route.params.userId + date11 + bagIdNo;
    setBagId(route.params.userId + date11 + bagIdNo);
    console.log(bagId);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM closeBag1 ',
        [],
        (tx, results) => {
          console.log(results.rows.length);
          serialNo = results.rows.length + 1;
          const bagID =
            route.params.userId + currentDate + (results.rows.length + 1);
          console.log(bagID);
          console.log(results);
          tx.executeSql(
            'INSERT INTO closeBag1 (bagSeal, bagId, bagDate, AcceptedList,status,consignorCode, stopId) VALUES (?, ?, ?, ?,?,?,?)',
            [
              bagSeal,
              route.params.userId +
                '-' +
                currentDate +
                '-' +
                (results.rows.length + 1),
              currentDate,
              JSON.stringify(acceptedArray),
              'scanPending',
              route.params.consignorCode,
              route.params.stopId
            ],
            (tx, results11) => {
              console.log('Row inserted successfully');
              setBagIdNo(bagIdNo + 1);
              setAcceptedArray([]);
              setBagSeal('');
              console.log('\n Data Added to local db successfully closeBag');
              ToastAndroid.show('Bag closed successfully', ToastAndroid.SHORT);
              console.log(results11);
              setBarcode('');
              setPDCheck(true);
              setCheck11(0);
              setText11('');
              viewDetailBag();
            },
            error => {
              console.log('Error occurred while inserting a row:', error);
            },
          );
        },
        error => {
          console.log(
            'Error occurred while generating a unique bag ID:',
            error,
          );
        },
      );
    });
  }

  function CloseBag() {
    console.log(bagSeal);
    console.log(acceptedArray);
    let date = new Date().getDate();
    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();
    let date11 = date + '' + month + '' + year;
    // console.log(route.params.userId + date11 + bagIdNo);
    let bagId11 = route.params.userId + date11 + bagIdNo;
    setBagId(route.params.userId + date11 + bagIdNo);
    console.log(bagId);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM closeBag1 ',
        [],
        (tx, results) => {
          console.log(results.rows.length);
          serialNo = results.rows.length + 1;
          const bagID =
            route.params.userId + currentDate + (results.rows.length + 1);
          console.log(bagID);
          console.log(results);

          tx.executeSql(
            'INSERT INTO closeBag1 (bagSeal, bagId, bagDate, AcceptedList,status,consignorCode,stopId) VALUES (?,?, ?, ?, ?,?,?)',
            [
              bagSeal,
              route.params.userId +
                '-' +
                currentDate +
                '-' +
                (results.rows.length + 1),
              currentDate,
              JSON.stringify(acceptedArray),
              'scanPending',
              route.params.consignorCode,
              route.params.stopId
            ],
            (tx, results11) => {
              console.log('Row inserted successfully');
              setBagIdNo(bagIdNo + 1);
              setAcceptedArray([]);
              setBagSeal('');
              console.log('\n Data Added to local db successfully closeBag');
              ToastAndroid.show('Bag closed successfully', ToastAndroid.SHORT);
              console.log(results11);
              setBarcode('');
              setPDCheck(true);
                setText11('');
                setCheck11(0);
              viewDetailBag();
            },
            error => {
              console.log('Error occurred while inserting a row:', error);
            },
          );
        },
        error => {
          console.log(
            'Error occurred while generating a unique bag ID:',
            error,
          );
        },
      );
    });
  }
  const viewDetailBag = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM closeBag1', [], (tx1, results) => {
        let temp = [];
        console.log(results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        // ToastAndroid.show("Sync Successful",ToastAndroid.SHORT);
        console.log(
          'Data from Local Database : \n ',
          JSON.stringify(temp, null, 4),
        );
        // console.log('Table1 DB OK:', temp.length);
      });
    });
  };
  useEffect(() => {
    createTableBag1();
  }, []);

  const createTableBag1 = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS closeBag1 (bagSeal TEXT PRIMARY KEY, bagId TEXT, bagDate TEXT, AcceptedList TEXT,status TEXT,consignorCode Text, stopId Text)',
        [],
        (tx, results) => {
          console.log('Table created successfully');
        },
        error => {
          console.log('Error occurred while creating the table:', error);
        },
      );
    });
  };
  const updateDetails2 = (expectedPackagingId) => {
    console.log('scan ' + barcode.toString());
    setAcceptedArray([...acceptedArray, barcode.toString()]);
    console.log(acceptedArray);
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE SellerMainScreenDetails SET status="accepted", packagingId=?, expectedPackagingId=?, eventTime=?, latitude=?, longitude=? WHERE  stopId=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) ',
        [
          packagingID,
          expectedPackagingId,
          new Date().valueOf(),
          latitude,
          longitude,
          route.params.stopId,
          barcode,
          barcode,
          barcode,
        ],
        (tx1, results) => {
          let temp = [];
          if (results.rowsAffected > 0) {
            console.log(barcode + 'accepted');
            console.log('accepted at pa 1', expectedPackagingId)
            Vibration.vibrate(200);
            dingAccept.play(success => {
              if (success) {
                console.log('successfully finished playing');
              } else {
                console.log('playback failed due to audio decoding errors');
              }
            });
            displayDataSPScan();
            
          } else {
            console.log(barcode + 'not accepted');
          }
          console.log(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
          
        },
       
      );
    });
    setExpectedPackaging('');
    setPackagingAction();
  };
  
console.log('packagingId',packagingID)
const rejectDetails2 = (latitude, longitude,reason) => {
var barcode11 = barcode;
      //   db.transaction((tx) => {
      //     tx.executeSql('UPDATE SellerMainScreenDetails SET status="rejected" ,rejectionReasonL1=?, eventTime=?, latitude=?, longitude=? WHERE status="accepted" AND consignorCode=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) ', 
      //     [DropDownValue, new Date().valueOf(), latitude, longitude, route.params.consignorCode, barcode11,barcode11,barcode11], (tx1, results) => {
      //       let temp = [];
      //       if (results.rowsAffected > 0) {
      //         // ContinueHandle11();
      //         console.log(barcode11 + 'rejected');
      //         ToastAndroid.show(barcode11 + ' Rejected', ToastAndroid.SHORT);
      //         setCheck11(0);
      //         Vibration.vibrate(200);
      //         dingAccept.play(success => {
      //           if (success) {
      //             console.log('successfully finished playing');
      //           } else {
      //             console.log('playback failed due to audio decoding errors');
      //           }
      //         });

      //         setDropDownValue('');
      //         console.log(acceptedArray);
      //         const newArray = acceptedArray.filter(item => item !== barcode11);
      //         console.log(newArray);
      //         setAcceptedArray(newArray);
      //         setBarcode('');
      //         displayDataSPScan();
      //       } else {
      //         console.log(barcode11 + 'failed to reject item locally');
      //       }
      //       console.log(results.rows.length);
      //       for (let i = 0; i < results.rows.length; ++i) {
      //         temp.push(results.rows.item(i));
      //       }
      //     },
      //   );
      // });
        db.transaction((tx) => {
          tx.executeSql('UPDATE SellerMainScreenDetails SET status="rejected", eventTime=?, latitude=?, longitude=? ,packagingId=?, expectedPackagingId=?, rejectionReasonL1=?  WHERE stopId=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) ', 
          [new Date().valueOf(), latitude, longitude, packagingID, expectedPackagingId, reason,route.params.stopId, barcode11,barcode11,barcode11], (tx1, results) => {
            let temp = [];
            console.log('Rejected Reason : ', reason);
            console.log('Results', results.rowsAffected);
            console.log(results);
            if (results.rowsAffected > 0) {
              // ContinueHandle11();
              console.log(barcode11 + 'rejected');
              ToastAndroid.show(barcode11 + ' Rejected', ToastAndroid.SHORT);
              setCheck11(0);
              // Vibration.vibrate(100);
              Vibration.vibrate(200);
              dingAccept.play(success => {
                if (success) {
                  // Vibration.vibrate(800);
                  console.log('successfully finished playing');
                } else {
                  console.log('playback failed due to audio decoding errors');
                }
              });
              setDropDownValue('');
              setEnableGeoFence(0);
              setBarcode('');
              displayDataSPScan();
            }
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push(results.rows.item(i));
            }
          },
        );
      });
      setExpectedPackaging('');
      setPackagingAction();
  };

  const viewDetails2 = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where status = "accepted"',
        [],
        (tx1, results) => {
          let temp = [];
          console.log(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
            console.log('barcode ' + results.rows.item(i).awbNo);
          }
          // ToastAndroid.show('Sync Successful',ToastAndroid.SHORT);
          console.log(
            'Data from Local Database : \n ',
            JSON.stringify(temp, null, 4),
          );
        },
      );
    });
  };
  const viewDetailsR2 = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where status = "rejected"',
        [],
        (tx1, results) => {
          let temp = [];
          console.log(results.rows.length);
          // setnewRejected(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
            console.log('barcode ' + results.rows.item(i).awbNo);
          }
          // ToastAndroid.show('Sync Successful',ToastAndroid.SHORT);
          console.log(
            'Data from Local Database : \n ',
            JSON.stringify(temp, null, 4),
          );
        },
      );
    });
  };
  const partialClose = () => {
    setDropDownValue11('');
  };

  const getCategories = (data) => {
    db.transaction(txn => {
      txn.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE status IS NULL AND shipmentAction="Seller Pickup" AND  stopId=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber = ?)',
        [route.params.stopId, data, data, data],
        (sqlTxn, res) => {
          setLen(res.rows.length);
          setBarcode(data);
          if (!res.rows.length) {
            db.transaction(tx => {
              tx.executeSql(
                'Select * FROM SellerMainScreenDetails WHERE status IS NOT NULL And shipmentAction="Seller Pickup" And stopId=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?)',
                [route.params.stopId, data, data, data],
                (tx1, results) => {
                  if (results.rows.length === 0) {
                    ToastAndroid.show(
                      'Scanning wrong product',
                      ToastAndroid.SHORT,
                    );
                    setCheck11(0);
                    Vibration.vibrate(800);
                    dingReject.play(success => {
                      if (success) {
                        console.log('successfully finished playing');
                      } else {
                        console.log('playback failed due to audio decoding errors');
                      }
                    });
                    setBarcode('');
                  } else {
                    ToastAndroid.show(data + ' already scanned',ToastAndroid.SHORT);
                    Vibration.vibrate(800);
                    setCheck11(0);
                    dingReject.play(success => {
                      if (success) {
                        console.log('successfully finished playing');
                      } else {
                        console.log('playback failed due to audio decoding errors');
                      }
                    });
                    setBarcode('');
                  }
                },
              );
            });
          } 
          // else {
          //   if (packagingAction !== undefined && packagingAction != 0 && barcode){
          //     setShowCloseBagModal12(true);
          //     setShowOuterScanner(false);
          //   }
          // }
        },
        error => {
          console.log('error on getting categories ' + error.message);
        },
      );
    });
  };
  console.log(text11);
  
  const displayData = async () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?',
        [text11,text11,text11],
        (tx1, results) => {
          if (results.rows.length > 0) { 
            const row = results.rows.item(0); 
            setPackagingAction(row.packagingAction);
            setPackagingID(row.packagingId);
          }
        },
      );
    });
  };
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(setAutoSync(false));
      displayData();
    });
    return unsubscribe;
  }, [navigation, syncTimeFull]);
  useEffect(() => {
    (async () => {
        displayData();
    })();
}, [text11]);

// useEffect(() => {
//   if (packagingAction != 0 && barcode) {
//     setShowCloseBagModal12(true);
//     setShowOuterScanner(false);
//   }
// }, [packagingAction,barcode]);

  const updateCategories = data => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE SellerMainScreenDetails set status=? where clientShipmentReferenceNumber=?',
        ['accepted', data],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
        },
      );
    });
  };
    const updateCategories1 = (data) => {
      db.transaction((tx) => {
        tx.executeSql(
          'UPDATE categories set ScanStatus=?, UploadStatus=? where clientShipmentReferenceNumber=?',
          [1, 1, data],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
          }
        );
      });
    };
    const handlepackaging = (value) => {
      if (packagingAction == 1) {
        ToastAndroid.show(value + ' Saved', ToastAndroid.SHORT);
        setCheck11(1);
        ToastAndroid.show(barcode + ' Accepted', ToastAndroid.SHORT);
        updateDetails2(value);
        displayDataSPScan();
        setLen(0);
      } else if (packagingAction == 2) {
        if (packagingID.trim() === value.trim()) {
          setCheck11(1);
          ToastAndroid.show(barcode + ' Accepted', ToastAndroid.SHORT);
          updateDetails2(value);
          displayDataSPScan();
          setLen(0);
        } else {
          setModal(true);
        }
      } else if (packagingAction == 3) {
        if (packagingID.trim() === value.trim()) {
          setCheck11(1);
          ToastAndroid.show(barcode + ' Accepted', ToastAndroid.SHORT);
          updateDetails2(value);
          displayDataSPScan();
          setLen(0);
        } else {
          setModal1(true);
        }
      } else {
        console.log(packagingID, "is not equal to", value)
      }
      setShowCloseBagModal12(false);
      setShowOuterScanner(true);
    };
    const handleReScan=()=>{
      setExpectedPackaging('')
      setShowOuterScanner(false);
      setShowCloseBagModal12(true);
      if (packagingID.trim() === expectedPackagingId.trim()) {
        setCheck11(1);
        ToastAndroid.show(barcode + ' Accepted', ToastAndroid.SHORT);
        updateDetails2(expectedPackagingId);
        displayDataSPScan();
        setLen(0);
      } else {
        setModal1(true);
        console.log("values not matched ")
      }
    }
    
    const onSuccess = e => {
      console.log(e.data, 'barcode');
      setBarcode(e.data);
      setText11(e.data);
      getCategories(e.data);
    };
    const onSuccess11 = e => {
      // Vibration.vibrate(100);
      // RNBeep.beep();
      Vibration.vibrate(100);
      dingAccept.play(success => {
        if (success) {

          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
      console.log(e.data, 'sealID');
      // getCategories(e.data);
      setBagSeal(e.data);
    };
    const onSuccess12 = e => {
      // Vibration.vibrate(100);
      // RNBeep.beep();
      Vibration.vibrate(100);
      dingAccept.play(success => {
        if (success) {

          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
      console.log(e.data, 'ExpectedPackagingID');
      // getCategories(e.data);
      setExpectedPackaging(e.data);
      handlepackaging(e.data);
    };
    const onSucessThroughButton = (data21)=>{
      console.log(data21, 'barcode');
      setBarcode(data21);
      getCategories(data21);
    };
  useEffect(() => {
    if (len && packagingAction !== undefined ) {
      if(packagingAction==0){
      setCheck11(1);
      ToastAndroid.show(barcode + ' Accepted', ToastAndroid.SHORT);
      updateDetails2();
      displayDataSPScan();
      setLen(0);
    }
    else{
      setShowCloseBagModal12(true);
      setShowOuterScanner(false);
    }
  }
  }, [packagingAction,len]);
  
  const displaydata = async () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM ShipmentFailure',
        [],
        (tx1, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
          // ToastAndroid.show('Sync Successful3', ToastAndroid.SHORT);
          setRejectedData(temp);

        },
      );
    });
  };
  const navigation = useNavigation();
  const [count, setcount] = useState(0);

  useEffect(() => {
    displaydata();
  }, []);

  function handleButtonPress(item, item2) {
    setDropDownValue(item);
    setEnableGeoFence(item2);
  }
  return (
    <NativeBaseProvider>
      <Modal
        w="100%"
        isOpen={showModal11}
        onClose={() => setShowModal11(false)}>
        <Modal.Content w="100%" bg={'#eee'}>
          <Modal.CloseButton />
          <Modal.Body w="100%">
            <Modal.Header>Enter the OTP</Modal.Header>
            <OTPTextInput
              ref={e => (otpInput = e)}
              inputCount={6}
              handleTextChange={e => setInputOtp(e)}
            />
            <Box flexDir="row" justifyContent="space-between" mt={3}>
              <Button w="40%" bg="gray.500" onPress={() => sendSmsOtp()}>
                Resend
              </Button>
              <Button w="40%" bg="#004aad" onPress={() => validateOTP()}>
                Submit
              </Button>
            </Box>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={modalVisible11}
        onClose={() => {
          setModalVisible11(false);
          setDropDownValue11('');
        }}
        size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Partial Close Reason</Modal.Header>
          <Modal.Body>
            {PartialCloseData &&
              PartialCloseData.filter(d => d.applies_to.includes("PPCF") && d.parentCode !== "CNA").map((d, index) =>
                 !pdCheck && d.description === 'Partial Dispatch' ? (
                  <Button
                    h="12"
                    paddingBottom={5}
                    key={d._id}
                    flex="1"
                    mt={2}
                    marginBottom={1.4}
                    marginTop={1.4}
                    style={{
                      backgroundColor:
                        d.short_code === DropDownValue11 ? '#6666FF' : '#C8C8C8',
                      opacity: 0.4,
                    }}
                    title={d.description} onPress={() => ToastAndroid.show('No bags for dispatch',ToastAndroid.SHORT)} >
                    {' '}
                    {/* onPress={() => ToastAndroid.show("No bags for dispatch",ToastAndroid.SHORT)}  */}
                    <Text
                      style={{
                        color:
                          d.short_code === DropDownValue11 ? 'white' : 'black',
                        alignContent: 'center',
                        paddingTop: -5,
                      }}>
                      {' '}
                      {d.description}{' '}
                    </Text>
                  </Button>
                ) : (
                  <Button
                    h="12"
                    paddingBottom={5}
                    key={d._id}
                    flex="1"
                    mt={2}
                    marginBottom={1.4}
                    marginTop={1.4}
                    style={{
                      backgroundColor:
                        d.short_code === DropDownValue11 ? '#6666FF' : '#C8C8C8',
                    }}
                    title={d.description}
                    onPress={() => handleButtonPress11(d.short_code)}>
                    {' '}
                    <Text
                      style={{
                        color:
                          d.short_code === DropDownValue11 ? 'white' : 'black',
                        alignContent: 'center',
                        paddingTop: -5,
                      }}>
                      {' '}
                      {d.description}{' '}
                    </Text>
                  </Button>
                ),
              )}

            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              marginBottom={1.5}
              marginTop={1.5}
              onPress={() => {
                if (!DropDownValue11) {
                  ToastAndroid.show('Please Select Reason ', ToastAndroid.SHORT);                  
                } else {
                  partialClose();
                  setModalVisible11(false);
                  navigation.navigate('POD', {
                    Forward: route.params.Forward,
                    accepted: newaccepted,
                    rejected: newrejected,
                    notPicked: newNotPicked,
                    phone: route.params.phone,
                    userId: route.params.userId,
                    consignorCode: route.params.consignorCode,
                    stopId:route.params.stopId,
                    tripId:route.params.tripID,
                    DropDownValue: DropDownValue11,
                    contactPersonName: route.params.contactPersonName,
                    runsheetno: route.params.PRSNumber,
                    latitude: latitude,
                    longitude: longitude,
                  });
                }
              }}>
              Submit
            </Button>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
          isOpen={modalVisibleCNA}
          onClose={() => {
            setModalVisibleCNA(false);
            setDropDownValue11('');
          }}
          size="lg">
          <Modal.Content maxWidth="350">
            <Modal.CloseButton />
            <Modal.Header>Could Not Attempt Reason</Modal.Header>
            <Modal.Body>
              {PartialCloseData &&
              PartialCloseData.filter(d => d.applies_to.includes("PPCF") && d.parentCode == "CNA").map((d, index) => (
                  <Button
                    key={d._id}
                    flex="1"
                    mt={2}
                    marginBottom={1.5}
                    marginTop={1.5}
                    style={{
                      backgroundColor:
                        d.short_code === DropDownValue11 ? '#6666FF' : '#C8C8C8',
                    }}
                    title={d.description}
                    onPress={() =>
                      handleButtonPress11(d.short_code)
                    }>
                    <Text
                      style={{
                        color:
                          d.short_code == DropDownValue11 ? 'white' : 'black',
                      }}>
                      {d.description}
                    </Text>
                  </Button>
                ))}
              <Button
                flex="1"
                mt={2}
                bg="#004aad"
                marginBottom={1.5}
                marginTop={1.5}
                onPress={() => {
                  if (!DropDownValue11) {
                    ToastAndroid.show('Please Select Reason ', ToastAndroid.SHORT);                  
                  } else {
                    setModalVisibleCNA(false);
                  navigation.navigate('POD', {
                    Forward: route.params.Forward,
                    accepted: newaccepted,
                    rejected: newrejected,
                    notPicked: newNotPicked,
                    phone: route.params.phone,
                    userId: route.params.userId,
                    consignorCode: route.params.consignorCode,
                    stopId:route.params.stopId,
                    tripId:route.params.tripID,
                    DropDownValue: DropDownValue11,
                    contactPersonName: route.params.contactPersonName,
                    runsheetno: route.params.PRSNumber,
                    latitude: latitude,
                    longitude: longitude,
                  })
                  }
                }}>
                Submit
              </Button>
              <Button
                flex="1"
                mt={2}
                bg="#004aad"
                marginBottom={1.5}
                marginTop={1.5}
                onPress={() => {
                  setModalVisible11(true), setModalVisibleCNA(false);
                }}>
                Back
              </Button>
            </Modal.Body>
          </Modal.Content>
        </Modal>
      <Modal
        isOpen={showCloseBagModal11}
        onClose={() => {
          setShowCloseBagModal11(false);
          reloadScanner();
          setShowOuterScanner(true);
          setExpectedPackaging('');
          setPackagingAction();
        }}
        size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Close Bag</Modal.Header>
          <Modal.Body>
            {showCloseBagModal11 && (
              <QRCodeScanner
                onRead={onSuccess11}
                reactivate={true}
                reactivateTimeout={2000}
                flashMode={RNCamera.Constants.FlashMode.off}
                ref={node => {
                  this.scanner = node;
                }}
                containerStyle={{height: 116, marginBottom: '55%'}}
                cameraStyle={{
                  height: 90,
                  marginTop: 95,
                  marginBottom: '15%',
                  width: 289,
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
              />
            )}
            {'\n'}
            <Input
              placeholder="Enter Bag Seal"
              size="md"
              value={bagSeal}
              onChangeText={text => setBagSeal(text)}
              style={{
                width: 290,
                backgroundColor: 'white',
              }}
            />
            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              onPress={() => {
                CloseBagEndScan();
                setShowCloseBagModal11(false);
                setScanned(true);
              }}>
              Submit
            </Button>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={showCloseBagModal12}
        onClose={() => {
          setShowCloseBagModal12(false);
          reloadScanner();
          setExpectedPackaging('')
          setLen(0)
          setShowOuterScanner(true);
        }}
        size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Packaging ID</Modal.Header>
          <Modal.Body>
              <QRCodeScanner
                onRead={onSuccess12}
                reactivate={true}
                reactivateTimeout={2000}
                flashMode={RNCamera.Constants.FlashMode.off}
                ref={node => {
                  this.scanner = node;
                }}
                containerStyle={{height: 116, marginBottom: '55%'}}
                cameraStyle={{
                  height: 90,
                  marginTop: 95,
                  marginBottom: '15%',
                  width: 289,
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
              />
            {'\n'}
            <Input
              placeholder="Enter Packaging ID"
              size="md"
              value={expectedPackagingId}
              onChangeText={text => setExpectedPackaging(text)}
              style={{
                width: 290,
                backgroundColor: 'white',
              }}
            />
            {expectedPackagingId.length ?
            <Button
            flex="1"
            mt={2}
            bg="#004aad"
            onPress={() => {
              handlepackaging(expectedPackagingId);
            }}>
            Submit
          </Button>
          :
          <Button
              flex="1"
              mt={2}
              bg="gray.300"
              >
              Submit
            </Button>
            }
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <Modal
        isOpen={showCloseBagModal}
        onClose={() => {
          setShowCloseBagModal(false);
          reloadScanner();
          setShowOuterScanner(true);
          setExpectedPackaging('');
          setPackagingAction();
        }}
        size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Close Bag</Modal.Header>
          <Modal.Body>
            <QRCodeScanner
              onRead={onSuccess11}
              reactivate={true}
              reactivateTimeout={2000}
              flashMode={RNCamera.Constants.FlashMode.off}
              containerStyle={{height: 116, marginBottom: '55%'}}
              cameraStyle={{
                height: 90,
                marginTop: 95,
                marginBottom: '15%',
                width: 289,
                alignSelf: 'center',
                justifyContent: 'center',
              }}
            />
            {'\n'}
            <Input
              placeholder="Enter Bag Seal"
              size="md"
              value={bagSeal}
              onChangeText={text => setBagSeal(text)}
              style={{
                width: 290,
                backgroundColor: 'white',
              }}
            />
            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              onPress={() => {
                CloseBag(), setShowCloseBagModal(false); setShowOuterScanner(true)
              }}>
              Submit
            </Button>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={showModal}
        onClose={() => {
          setModal(false);
          setExpectedPackaging('')
          setLen(0);
        }}
        size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Accept/Reject Shipment</Modal.Header>
          <Modal.Body>
          <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>
          Packaging ID Mismatch
          </Text>
          </View>
           <View style={{
                width: '90%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignSelf: 'center',
                marginTop: 10,
              }}>
            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              marginBottom={1.5}
              marginTop={1.5}
              marginRight={1}
              onPress={() => {
                setCheck11(1);
                ToastAndroid.show(barcode + ' Accepted', ToastAndroid.SHORT);
                updateDetails2(expectedPackagingId);
                displayDataSPScan();
                setLen(0);
                setModal(false);
              }}>
              Accept Anyway
            </Button>
            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              marginBottom={1.5}
              marginTop={1.5}
              onPress={() => {
                handleRejectAction('WPF',0);
                setModal(false);
              }}>
              Reject
            </Button>
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={showModal1}
        onClose={() => {
          setModal1(false);
          setExpectedPackaging('');
          setLen(0);
        }}
        size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Reject Shipment</Modal.Header>
          <Modal.Body>
          <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>
          Packaging ID Mismatch
          </Text>
          </View>
            <View style={{
                width: '90%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignSelf: 'center',
                marginTop: 10,
              }}>
            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              marginBottom={1.5}
              marginTop={1.5}
              marginRight={1}
              onPress={() => {
              setModal1(false);
              handleRejectAction('WPF',0);
              }}>
              Reject Shipment
            </Button>
            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              marginBottom={1.5}
              marginTop={1.5}
              onPress={() => {
              handleReScan();
              setModal1(false);
              }}>
              ReScan
            </Button>
            </View>
            
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <Modal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setDropDownValue('');
        }}
        size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Reject Reason</Modal.Header>
          <Modal.Body>
            {rejectedData && rejectedData.filter(d => d.applies_to.includes("SHPF")).map(d => (
              <Button
                key={d.short_code}
                flex="1"
                mt={2}
                marginBottom={1.5}
                marginTop={1.5}
                title={d.description}
                style={{
                  backgroundColor:
                    d.short_code === DropDownValue
                      ? '#6666FF'
                      : '#C8C8C8',
                }}
                onPress={() => handleButtonPress(d.short_code, d.enable_geo_fence)}>
                <Text
                  style={{
                    color:
                      DropDownValue == d.short_code
                        ? 'white'
                        : 'black',
                  }}>
                  {d.description}
                </Text>
              </Button>
            ))}
            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              marginBottom={1.5}
              marginTop={1.5}
              onPress={() => {
                // rejectDetails2();
                if (!DropDownValue) {
                  ToastAndroid.show('Please Select Reason ', ToastAndroid.SHORT);                  
                } else {
                handleRejectAction(DropDownValue,enableGeoFence);
                setModalVisible(false);
                }
              }}>
              Submit
            </Button>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <ScrollView
        style={{paddingTop: 20, paddingBottom: 50}}
        showsVerticalScrollIndicator={false}>
        {showOuterScanner  && (
          <QRCodeScanner
            onRead={onSuccess}
            reactivate={true}
            reactivateTimeout={3000}
            ref={scannerRef}
            flashMode={RNCamera.Constants.FlashMode.off}
            containerStyle={{
              width: '100%',
              alignSelf: 'center',
              backgroundColor: 'white',
            }}
            cameraStyle={{width: '90%', alignSelf: 'center'}}
            topContent={
              <View>
                <Text>Scan your Shipments </Text>
              </View>
            }
          />
        )}
        <View>
          <Center />
        </View>
        <View>
          <View style={{backgroundColor: 'white'}}>
            <View style={{alignItems: 'center', marginTop: 15}}>
              <View style={{backgroundColor: 'lightgrey', padding:0, flexDirection: 'row', justifyContent: 'space-between', width: '90%', borderRadius: 10, flex:1}}>
              <Input placeholder="Shipment ID"  value={text11} onChangeText={(text)=>{ setText11(text);}}  style={{
              fontSize: 18, fontWeight: '500', width: 320, backgroundColor:'lightgrey'}} />
<TouchableOpacity style={{flex:1,backgroundColor:'lightgrey',paddingTop:8}} onPress={()=>onSucessThroughButton(text11)}>
  <Center>

  <MaterialIcons name="send" size={30} color="#004aad" />
  </Center>
</TouchableOpacity>

{/* <MaterialIcons name="send" size={30} color="green" /> */}


{/* <Button flex="1" mt={2} bg={buttonColor11} onPress={() => { }}>Submit</Button>
                <Text style={{fontSize: 18, fontWeight: '500'}}>shipment ID: </Text>
                {/* <MaterialIcons name="send" size={24} color={onPress ? 'black' : 'gray'} /> */}
                {/* <Text style={{fontSize: 18, fontWeight: '500'}}>{barcode}</Text> */}
                {/* <View style={{ flex: 1,
                alignItems: 'center',
                justifyContent: 'center',}}>
                <TextInput
                style={styles.textInput}
                placeholder="Enter shipment ID"
                value={barcode}
                onChangeText={(text) => setBarcode(text)}
                />
              <View style={styles.infoContainer}>
            <View style={styles.info}>
            <Text style={styles.label}>shipment ID: </Text>
            <Text style={styles.value}>{barcode}</Text>
        </View> */}
                {/* </View> */}
              </View>
              <Button
              title="Reject Shipment"
              onPress={() =>{ check11 === 0 ? ToastAndroid.show('No Shipment to Reject',ToastAndroid.SHORT) : setModalVisible(true);}}
              w="90%"
              size="lg"
              bg={buttonColorRejected}
              mb={4}
              mt={4}>
              Reject Shipment
            </Button>
              <View
                style={{
                  width: '90%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: 'lightgray',
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                  padding: 10,
                }}>
                <Text style={{fontSize: 18, fontWeight: '500'}}>Expected</Text>
                <Text style={{fontSize: 18, fontWeight: '500'}}>
                  {route.params.Forward}
                </Text>
              </View>
              <View
                style={{
                  width: '90%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: 'lightgray',
                  padding: 10,
                }}>
                <Text style={{fontSize: 18, fontWeight: '500'}}>Accepted</Text>
                <Text style={{fontSize: 18, fontWeight: '500'}}>
                  {newaccepted}
                </Text>
              </View>
              <View
                style={{
                  width: '90%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: 'lightgray',
                  padding: 10,
                }}>
                <Text style={{fontSize: 18, fontWeight: '500'}}>Rejected</Text>
                <Text style={{fontSize: 18, fontWeight: '500'}}>
                  {newrejected}
                </Text>
              </View>
              <View
                style={{
                  width: '90%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: 'lightgray',
                  borderBottomLeftRadius: 5,
                  borderBottomRightRadius: 5,
                  padding: 10,
                }}>
                <Text style={{fontSize: 18, fontWeight: '500'}}>
                  Not Picked
                </Text>
                <Text style={{fontSize: 18, fontWeight: '500'}}>
                  {newNotPicked}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              width: '90%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignSelf: 'center',
              marginTop: 10,
            }}>
            <Button
              onPress={() => {
                if (newaccepted === 0) {
                  partialClose112();
                } else {
                  if (acceptedArray.length !== 0) {
                    setShowCloseBagModal11(true);
                    setShowOuterScanner(false);
                  } else {
                    partialClose112();
                  }
                }
              }}
              w="48%"
              size="lg"
              bg="#004aad">
              End Scan
            </Button>

            <Button
              w="48%"
              size="lg"
              bg={buttonColor}
              onPress={() => {
                if (acceptedArray.length === 0) {
                  ToastAndroid.show('Bag is Empty', ToastAndroid.SHORT);
                } else {
                  setShowCloseBagModal(true);
                  setShowOuterScanner(false);
                }
              }}>
              Close bag
            </Button>
          </View>
          <Center>
            <Image
              style={{
                width: 150,
                height: 100,
              }}
              source={require('../../assets/image.png')}
              alt={'Logo Image'}
            />
          </Center>
        </View>
      </ScrollView>
    </NativeBaseProvider>
  );
};

export default ShipmentBarcode;

export const styles = StyleSheet.create({
  textInput: {
    height: 40,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  infoContainer: {
    marginTop: 10,
    width: '90%',
  },
  info: {
    backgroundColor: 'lightgray',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
  },
  normal: {
    fontFamily: 'open sans',
    fontWeight: 'normal',
    fontSize: 20,
    color: '#eee',
    marginTop: 27,
    paddingTop: 15,
    marginLeft: 10,
    marginRight: 10,
    paddingBottom: 15,
    backgroundColor: '#eee',
    width: 'auto',
    borderRadius: 0,
  },
  container: {
    flexDirection: 'row',
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  main1: {
    backgroundColor: '#004aad',
    fontFamily: 'open sans',
    fontWeight: 'normal',
    fontSize: 20,
    marginTop: 27,
    paddingTop: 15,
    marginLeft: 10,
    marginRight: 10,
    paddingBottom: 15,
    width: 'auto',
    borderRadius: 20,
  },
  textbox1: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    width: 'auto',
    flexDirection: 'column',
    textAlign: 'center',
  },

  textbtn: {
    alignSelf: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  btn: {
    fontFamily: 'open sans',
    fontSize: 15,
    lineHeight: 10,
    marginTop: 80,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#004aad',
    width: 100,
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 60,
  },
  bt3: {
    fontFamily: 'open sans',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 10,
    marginTop: 10,
    backgroundColor: '#004aad',
    width: 'auto',
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 10,
    marginRight: 15,
    // width:'95%',
    // marginTop:60,
  },
  picker: {
    color: 'white',
  },
  pickerItem: {
    fontSize: 20,
    height: 50,
    color: '#ffffff',
    backgroundColor: '#2196f3',
    textAlign: 'center',
    margin: 10,
    borderRadius: 10,
  },
  modalContent: {
    flex: 0.57,
    justifyContent: 'center',
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginLeft: 28,
    marginTop: 175,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 100,
    margin: 5.5,
    color: 'rgba(0,0,0,1)',
    alignContent: 'center',
  },

  containerText: {
    paddingLeft: 30,
    color: '#000',
    fontSize: 15,
  },
  otp: {
    backgroundColor: '#004aad',
    color: '#000',
    marginTop: 5,
    borderRadius: 10,
  },
});
