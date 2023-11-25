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
} from "native-base";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
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
} from "react-native";
import Sound from "react-native-sound";
import HapticFeedback from "react-native-haptic-feedback";
import { Center } from "native-base";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import { openDatabase } from "react-native-sqlite-storage";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import NetInfo from "@react-native-community/netinfo";
import RNBeep from "react-native-a-beep";
import { Picker } from "@react-native-picker/picker";
import GetLocation from "react-native-get-location";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import OTPTextInput from "react-native-otp-textinput";
import { callApi } from "../ApiError";
import dingReject11 from "../../assets/rejected_sound.mp3";

import dingAccept11 from "../../assets/beep_accepted.mp3";
import { backendUrl } from "../../utils/backendUrl";
import { setAutoSync } from "../../redux/slice/autoSyncSlice";
import { useDispatch, useSelector } from "react-redux";
import { getAuthorizedHeaders } from "../../utils/headers";
const db = openDatabase({
  name: "rn_sqlite",
});

const ShipmentBarcode = ({ route }) => {
  const dispatch = useDispatch();
  const syncTimeFull = useSelector((state) => state.autoSync.syncTimeFull);
  const [expected, setExpected] = useState(0);
  const [newaccepted, setnewAccepted] = useState(0);
  const [newrejected, setnewRejected] = useState(0);
  const [newNotPicked, setNewNotPicked] = useState(0);
  const [barcode, setBarcode] = useState("");
  const [packagingAction, setPackagingAction] = useState();
  const [packagingID, setPackagingID] = useState("");
  const [stopId, setstopId] = useState("");
  const [len, setLen] = useState(0);
  const [DropDownValue, setDropDownValue] = useState("");
  const [rejectedData, setRejectedData] = useState([]);
  const [acceptedArray, setAcceptedArray] = useState([]);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [enableGeoFence, setEnableGeoFence] = useState(0);
  const [sellerLatitude, setSellerLatitude] = useState(0);
  const [sellerLongitude, setSellerLongitude] = useState(0);
  const currentDateValue =
    useSelector((state) => state.currentDate.currentDateValue) ||
    new Date().toISOString().split("T")[0];
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleCNA, setModalVisibleCNA] = useState(false);
  const [bagId, setBagId] = useState("");
  const [bagIdNo, setBagIdNo] = useState(1);
  const [showCloseBagModal, setShowCloseBagModal] = useState(false);
  const [showCloseBagModal11, setShowCloseBagModal11] = useState(false);
  const [showCloseBagModal12, setShowCloseBagModal12] = useState(false);
  const [showModal, setModal] = useState(false);
  const [showModal1, setModal1] = useState(false);
  const [bagSeal, setBagSeal] = useState("");
  const [check11, setCheck11] = useState(0);
  const [pdCheck, setPDCheck] = useState(false);
  const [expectedPackagingId, setExpectedPackaging] = useState("");
  const [scannedValue, setScannedValue] = useState(expectedPackagingId);
  const [showScanner, setShowScanner] = useState(true);
  const [Forward, setForward] = useState(route.params.Forward);
  const [token, setToken] = useState(route.params.token);

  const buttonColor = acceptedArray.length === 0 ? "gray.300" : "#004aad";

  const buttonColorRejected = check11 === 0 ? "gray.300" : "#004aad";
  var otpInput = useRef(null);
  const [name, setName] = useState("");
  const [inputOtp, setInputOtp] = useState("");
  const [mobileNumber, setMobileNumber] = useState(route.params.phone);
  const [showModal11, setShowModal11] = useState(false);
  const [modalVisible11, setModalVisible11] = useState(false);
  const [DropDownValue11, setDropDownValue11] = useState("");
  const [PartialCloseData, setPartialCloseData] = useState([]);
  const [closeBagColor, setCloseBagColor] = useState("gray.300");
  const [showQRCodeModal, setShowQRCodeModal] = useState(true);
  const [showOuterScanner, setShowOuterScanner] = useState(true);
  const [isRejecting, setIsRejecting] = useState(false);
  const currentDate = new Date().toISOString().slice(0, 10);
  let serialNo = 0;

  const [text11, setText11] = useState("");
  const [text12, setText12] = useState("");
  const buttonColor11 = text11.length === 1 ? "#004aad" : "white";
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
    console.log(
      "ShipmentBarcode/CalculateDistance/Distance between seller and pickup is " +
        d +
        " meters and " +
        d / 1000 +
        " Km"
    ); // distance in meters
    return d;
  };

  // Check if the current location is within 100 meters of the seller location
  const isWithin100Meters = (cLatitude, cLongitude) => {
    const distance = calculateDistance(
      cLatitude,
      cLongitude,
      sellerLatitude,
      sellerLongitude
    );
    // return distance <= 100;
    return distance;
  };

  // Handle the action based on the geofencing logic
  const handleRejectAction = async (reason, geofencing) => {
    await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    })
      .then((location) => {
        setLatitude(location.latitude);
        setLongitude(location.longitude);
        let m = isWithin100Meters(location.latitude, location.longitude);
        if (geofencing == 0) {
          rejectDetails2(location.latitude, location.longitude, reason);
        } else {
          if (m <= 100) {
            rejectDetails2(location.latitude, location.longitude, reason);
          } else {
            Alert.alert(
              "Shipment cannot be rejected",
              Math.floor(m) < 1000
                ? "You are currently " +
                    Math.floor(m) +
                    " meters away from the seller."
                : "You are currently " +
                    Math.floor(m) / 1000 +
                    " Km away from the seller.",
              [
                {
                  text: "Cancel reject",
                  onPress: () => {
                    // console.log('Cancel Pressed');
                    setEnableGeoFence(0);
                    setDropDownValue("");
                    setExpectedPackaging("");
                    setLen(0);
                    setIsRejecting(false);
                  },
                  style: "cancel",
                },
                {
                  text: "Retry",
                  onPress: () => handleRejectAction(reason, geofencing),
                },
              ]
            );
          }
        }
      })
      .catch((error) => {
        RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
          interval: 10000,
          fastInterval: 5000,
        })
          .then((status) => {
            if (status) {
              console.log("ShipmentBarcode/handleRejection/Location enabled");
            }
          })
          .catch((err) => {
            console.log("ShipmentBarcode/handleRejection", err);
          });
        console.log(
          "ShipmentBarcode/handleRejection/Location Lat long error",
          error
        );
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

  const sellerLatLongLoad = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM SyncSellerPickUp where  stopId=? ",
        [route.params.stopId],
        (tx1, results) => {
          setSellerLatitude(results.rows.item(0).consignorLatitude);
          setSellerLongitude(results.rows.item(0).consignorLongitude);
        }
      );
    });
  };

  Sound.setCategory("Playback");

  var dingAccept = new Sound(dingAccept11, (error) => {
    if (error) {
      console.log("ShipmentBarcode/dingAccept/failed to load the sound", error);
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

  var dingReject = new Sound(dingReject11, (error) => {
    if (error) {
      console.log("ShipmentBarcode/dingReject/failed to load the sound", error);
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
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM ShipmentFailure", [], (tx1, results) => {
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
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(setAutoSync(false));
      displayDataSPScan();
      check121();
      sellerLatLongLoad();
      Sound.setCategory("Playback");
    });
    return unsubscribe;
  }, [navigation, syncTimeFull]);
  // useEffect(() => {
  //   partialClose112();
  // }, []);

  const check121 = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM closeBag1 WHERE  stopId=? And status="scanPending"',
        [route.params.stopId],
        (tx1, results) => {
          if (results.rows.length > 0) {
            setPDCheck(true);
          } else {
            setPDCheck(false);
          }
        }
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
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=? AND FMtripId=?',
        [route.params.stopId, route.params.tripID],
        (tx1, results) => {
          setForward(results.rows.length);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=?  AND status="accepted" AND FMtripId=?',
        [route.params.stopId, route.params.tripID],
        (tx1, results) => {
          setnewAccepted(results.rows.length);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=? AND status="notPicked" AND FMtripId=?',
        [route.params.stopId, route.params.tripID],
        (tx1, results) => {
          setNewNotPicked(results.rows.length);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=? AND status="rejected" AND FMtripId=?',
        [route.params.stopId, route.params.tripID],
        (tx1, results) => {
          setnewRejected(results.rows.length);
        }
      );
    });
  };
  const partialClose112 = () => {
    console.log("ShipmentBarcode/partialClose112/partialClose popup shown11");

    if (newaccepted + newrejected === Forward) {
      console.log("ShipmentBarcode/partialClose112/", newaccepted);
      // sendSmsOtp();
      navigation.navigate("POD", {
        Forward: Forward,
        accepted: newaccepted,
        rejected: newrejected,
        notPicked: newNotPicked,
        phone: route.params.phone,
        userId: route.params.userId,
        DropDownValue: DropDownValue11,
        consignorCode: route.params.consignorCode,
        stopId: route.params.stopId,
        tripId: route.params.tripID,
        contactPersonName: route.params.contactPersonName,
        runsheetno: route.params.PRSNumber,
        latitude: latitude,
        longitude: longitude,
        token: token,
      });
    } else {
      setDropDownValue11("");
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM closeBag1 WHERE  stopId=? And status="scanPending"',
          [route.params.stopId],
          (tx1, results) => {
            if (results.rows.length > 0) {
              setPDCheck(true);
              setModalVisible11(true);
            } else {
              setPDCheck(false);
              setModalVisible11(true);
            }
          }
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
      .then((location) => {
        setLatitude(location.latitude);
        setLongitude(location.longitude);
      })
      .catch((error) => {
        RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
          interval: 10000,
          fastInterval: 5000,
        })
          .then((status) => {
            if (status) {
              console.log("ShipmentBarcode/current_location/Location enabled");
            }
          })
          .catch((err) => {
            console.log("ShipmentBarcode/current_location", err);
          });
        console.log(
          "ShipmentBarcode/current_location/Location Lat long error",
          error
        );
      });
  };

  const sendSmsOtp = async () => {
    console.log("ShipmentBarcode/sendSmsOtp", mobileNumber);
    const response = await axios
      .post(
        backendUrl + "SMS/msg",
        {
          mobileNumber: mobileNumber,
        },
        { headers: getAuthorizedHeaders(token) }
      )
      .then(setShowModal11(true))
      .catch((err) => console.log("ShipmentBarcode/sendSmsOtp/OTP not send"));
  };

  function handleButtonPress11(item) {
    console.log(
      "ShipmentBarcode/handleButtonPress11/partial button 121" + item
    );
    if (item == "PDF") {
      setDropDownValue11("");
      setModalVisible11(false);
      navigation.navigate("Dispatch", {
        consignorCode: route.params.consignorCode,
        userId: route.params.userId,
        stopId: route.params.stopId,
        token: token,
      });
    }
    if (item == "CNA") {
      setDropDownValue11("");
      setModalVisibleCNA(true);
      setModalVisible11(false);
    }
    setDropDownValue11(item);
    // setModalVisible11(false);
  }

  function validateOTP() {
    axios
      .post(
        backendUrl + "SMS/OTPValidate",
        {
          mobileNumber: mobileNumber,
          otp: inputOtp,
        },
        { headers: getAuthorizedHeaders(token) }
      )
      .then((response) => {
        if (response.data.return) {
          // submitForm11();
          setInputOtp("");
          setShowModal11(false);
          ToastAndroid.show("Submit successful", ToastAndroid.SHORT);
          navigation.navigate("Main", {
            userId: route.params.userId,
          });
        } else {
          alert("Invalid OTP, please try again !!");
        }
      })
      .catch((error) => {
        alert("Invalid OTP, please try again !!");
        console.log("ShipmentBarcode/validateOtp/", error);
      });
  }

  // useEffect(() => {
  //   setBagId();
  // }, [bagId]);

  // useEffect(() => {
  //       updateDetails2();
  //       console.log("fdfdd "+barcode);
  // });

  const callErrorAPIFromScanner = (error) => {
    console.log(
      "ShipmentBarcode/callErrorAPIFromScanner/Scanner Error API called"
    );
    callApi(error, latitude, longitude, route.params.userId, token);
  };

  function CloseBagEndScan() {
    partialClose112();
    console.log("ShipmentBarcode/CloseBagEndScan/", bagSeal);
    console.log("ShipmentBarcode/CloseBagEndScan/", acceptedArray);
    let date = new Date().getDate();
    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();
    let date11 = date + "" + month + "" + year;
    // console.log(route.params.userId + date11 + bagIdNo);
    let bagId11 = route.params.userId + date11 + bagIdNo;
    setBagId(route.params.userId + date11 + bagIdNo);
    console.log("ShipmentBarcode/CloseBagScan/", bagId);

    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM closeBag1 ",
        [],
        (tx, results) => {
          // console.log(results.rows.length);
          serialNo = results.rows.length + 1;
          const bagID =
            route.params.userId + currentDate + (results.rows.length + 1);
          tx.executeSql(
            "INSERT INTO closeBag1 (bagSeal, bagId, bagDate, AcceptedList,status,consignorCode, stopId) VALUES (?, ?, ?, ?,?,?,?)",
            [
              bagSeal,
              route.params.userId +
                "-" +
                currentDate +
                "-" +
                (results.rows.length + 1),
              currentDate,
              JSON.stringify(acceptedArray),
              "scanPending",
              route.params.consignorCode,
              route.params.stopId,
            ],
            (tx, results11) => {
              // console.log('Row inserted successfully');
              setBagIdNo(bagIdNo + 1);
              setAcceptedArray([]);
              setBagSeal("");
              console.log(
                "\n ShipmentBarcode/CloseBagEndScan/Data Added to local db successfully closeBag"
              );
              ToastAndroid.show("Bag closed successfully", ToastAndroid.SHORT);
              console.log("ShipmentBarcode/CloseBagEndScan/", results11);
              setBarcode("");
              setPDCheck(true);
              setCheck11(0);
              setText11("");
              viewDetailBag();
            },
            (error) => {
              console.log(
                "ShipmentBarcode/CloseBagEndScan/Error occurred while inserting a row:",
                error
              );
            }
          );
          tx.executeSql(
            "UPDATE SellerMainScreenDetails SET bagSealId=?, syncStatus='' WHERE bagId=?",
            [
              bagSeal,
              route.params.userId +
                "-" +
                currentDate +
                "-" +
                (results.rows.length + 1),
            ],
            (tx1, results) => {
              if (results.rowsAffected > 0) {
                console.log(
                  "ShipmentBarcode/CloseBagEndScan/bagSealId Updated in SellerMainScreenDetails Table"
                );
              } else {
                console.log(
                  "ShipmentBarcode/CloseBagEndScan/sealId Not Updated in SellerMainScreenDetails Table"
                );
              }
            }
          );
        },
        (error) => {
          console.log(
            "ShipmentBarcode/CloseBagEndScan/Error occurred while generating a unique bag ID:",
            error
          );
        }
      );
    });
  }

  function CloseBag() {
    console.log("ShipmentBarcode/CloseBag/", bagSeal);
    let date = new Date().getDate();
    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();
    let date11 = date + "" + month + "" + year;
    // console.log(route.params.userId + date11 + bagIdNo);
    let bagId11 = route.params.userId + date11 + bagIdNo;
    setBagId(route.params.userId + date11 + bagIdNo);
    console.log("ShipmentBarcode/CloseBag/", bagId);

    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM closeBag1 ",
        [],
        (tx, results) => {
          console.log("ShipmentBarcode/CloseBag/", results.rows.length);
          serialNo = results.rows.length + 1;
          const bagID =
            route.params.userId + currentDate + (results.rows.length + 1);
          console.log("ShipmentBarcode/CloseBag/", bagID);
          console.log("ShipmentBarcode/CloseBag", results);

          tx.executeSql(
            "INSERT INTO closeBag1 (bagSeal, bagId, bagDate, AcceptedList,status,consignorCode,stopId) VALUES (?,?, ?, ?, ?,?,?)",
            [
              bagSeal,
              route.params.userId +
                "-" +
                currentDate +
                "-" +
                (results.rows.length + 1),
              currentDate,
              JSON.stringify(acceptedArray),
              "scanPending",
              route.params.consignorCode,
              route.params.stopId,
            ],
            (tx, results11) => {
              console.log("ShipmentBarcode/CloseBag/Row inserted successfully");
              setBagIdNo(bagIdNo + 1);
              setAcceptedArray([]);
              setBagSeal("");
              console.log(
                "\n ShipmentBarcode/CloseBag/Data Added to local db successfully closeBag"
              );
              ToastAndroid.show("Bag closed successfully", ToastAndroid.SHORT);
              console.log("ShipmentBarcode/CloseBag/", results11);
              setBarcode("");
              setPDCheck(true);
              setText11("");
              setCheck11(0);
              viewDetailBag();
            },
            (error) => {
              console.log(
                "ShipmentBarcode/CloseBag/Error occurred while inserting a row:",
                error
              );
            }
          );
          tx.executeSql(
            "UPDATE SellerMainScreenDetails SET bagSealId=?, syncStatus='' WHERE bagId=?",
            [
              bagSeal,
              route.params.userId +
                "-" +
                currentDate +
                "-" +
                (results.rows.length + 1),
            ],
            (tx1, results) => {
              if (results.rowsAffected > 0) {
                console.log(
                  "ShipmentBarcode/CloseBag/bagSealId Updated in SellerMainScreenDetails Table"
                );
              } else {
                console.log(
                  "ShipmentBarcode/CloseBag/bagSealId Not Updated in SellerMainScreenDetails Table"
                );
              }
            }
          );
        },
        (error) => {
          console.log(
            "ShipmentBarcode/CloseBag/Error occurred while generating a unique bag ID:",
            error
          );
        }
      );
    });
  }
  const viewDetailBag = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM closeBag1", [], (tx1, results) => {
        let temp = [];
        console.log("ShipmentBarcode/viewDetailBag/", results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        // ToastAndroid.show("Sync Successful",ToastAndroid.SHORT);
        console.log(
          "ShipmentBarcode/viewDeatilsBag/Data from Local Database : \n ",
          JSON.stringify(temp, null, 4)
        );
        // console.log('Table1 DB OK:', temp.length);
      });
    });
  };
  useEffect(() => {
    createTableBag1();
  }, []);

  const createTableBag1 = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS closeBag1 (bagSeal TEXT PRIMARY KEY, bagId TEXT, bagDate TEXT, AcceptedList TEXT,status TEXT,consignorCode Text, stopId Text)",
        [],
        (tx, results) => {
          console.log(
            "ShipmentBarcode/createTableBag1/Table created successfully"
          );
        },
        (error) => {
          console.log(
            "ShipmentBarcode/createTableBag1/Error occurred while creating the table:",
            error
          );
        }
      );
    });
  };
  const updateDetails2 = (expectedPackagingId, stopId) => {
    console.log("ShipmentBarcode/updateDetails2/scan " + barcode.toString());
    console.log("******BagId******", bagId);
    if (route.params.stopId == stopId) {
      console.log(
        "ShipmentBarcode/updateDetails2/updatedetails when stopid same"
      );
      setAcceptedArray([...acceptedArray, barcode.toString()]);
      console.log("ShipmentBarcode/updateDetails2/", acceptedArray);
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM closeBag1 ",
          [],
          (tx, results) => {
            tx.executeSql(
              'UPDATE SellerMainScreenDetails SET status="accepted", packagingId=?, expectedPackagingId=?, eventTime=?, latitude=?, longitude=?, bagId=? WHERE  stopId=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) AND FMtripId=?',
              [
                packagingID,
                expectedPackagingId,
                new Date().valueOf(),
                latitude,
                longitude,
                route.params.userId +
                  "-" +
                  currentDate +
                  "-" +
                  (results.rows.length + 1),
                route.params.stopId,
                barcode,
                barcode,
                barcode,
                route.params.tripID,
              ],
              (tx1, results) => {
                let temp = [];
                if (results.rowsAffected > 0) {
                  console.log(
                    barcode + "ShipmentBarcode/updateDetails2/accepted"
                  );
                  // console.log('accepted at pa 1', expectedPackagingId)
                  Vibration.vibrate(200);
                  dingAccept.play((success) => {
                    if (success) {
                      console.log(
                        "ShipmentBarcode/updateDetails2/successfully finished playing"
                      );
                    } else {
                      console.log(
                        "ShipmentBarcode/updateDetails2/playback failed due to audio decoding errors"
                      );
                    }
                  });
                  displayDataSPScan();
                } else {
                  console.log(
                    barcode + "ShipmentBarcode/updateDetails2/not accepted"
                  );
                }
                console.log(
                  "ShipmentBarcode/updateDetails2/",
                  results.rows.length
                );
                for (let i = 0; i < results.rows.length; ++i) {
                  temp.push(results.rows.item(i));
                }
              }
            );
          },
          (error) => {
            console.log(
              "ShipmentBarcode/updateDetails2/Error occurred while Getting closebags 1",
              error
            );
          }
        );
      });
      setExpectedPackaging("");
      setPackagingAction();
    } else {
      setAcceptedArray([...acceptedArray, barcode.toString()]);
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM closeBag1 ",
          [],
          (tx, results) => {
            tx.executeSql(
              'UPDATE SellerMainScreenDetails SET status="accepted", packagingId=?, expectedPackagingId=?, eventTime=?, latitude=?, longitude=?, bagId=?, stopId=?, rejectionReasonL1="", postRDStatus="false", syncStatus="",rejectionStage="" WHERE (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) AND FMtripId=?',
              [
                packagingID,
                expectedPackagingId,
                new Date().valueOf(),
                latitude,
                longitude,
                route.params.userId +
                  "-" +
                  currentDate +
                  "-" +
                  (results.rows.length + 1),
                route.params.stopId,
                barcode,
                barcode,
                barcode,
                route.params.tripID,
              ],
              (tx1, results) => {
                let temp = [];
                if (results.rowsAffected > 0) {
                  console.log(
                    barcode + "ShipmentBarcode/updateDetails2/accepted"
                  );
                  // console.log('accepted at pa 1', expectedPackagingId)
                  Vibration.vibrate(200);
                  dingAccept.play((success) => {
                    if (success) {
                      console.log(
                        "ShipmentBarcode/updateDetails2/successfully finished playing"
                      );
                    } else {
                      console.log(
                        "ShipmentBarcode/updateDetails2/playback failed due to audio decoding errors"
                      );
                    }
                  });
                  displayDataSPScan();
                } else {
                  console.log(
                    barcode + "ShipmentBarcode/updateDetails2/not accepted"
                  );
                }
                console.log(
                  "ShipmentBarcode/updateDetails2",
                  results.rows.length
                );
                for (let i = 0; i < results.rows.length; ++i) {
                  temp.push(results.rows.item(i));
                }
              }
            );
          },
          (error) => {
            console.log(
              "ShipmentBarcode/updateDetails2/Error occurred while Getting closebags 1",
              error
            );
          }
        );
      });
      setExpectedPackaging("");
      setPackagingAction();
    }
    setstopId("");
  };

  const rejectDetails2 = (latitude, longitude, reason) => {
    var barcode11 = barcode;
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE SellerMainScreenDetails SET status="rejected", bagId="", bagSealId="", eventTime=?, latitude=?, longitude=?, packagingId=?, expectedPackagingId=?, rejectionReasonL1=?  WHERE stopId=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) AND FMtripId=?',
        [
          new Date().valueOf(),
          latitude,
          longitude,
          packagingID,
          expectedPackagingId,
          reason,
          route.params.stopId,
          barcode11,
          barcode11,
          barcode11,
          route.params.tripID,
        ],
        (tx1, results) => {
          let temp = [];
          if (results.rowsAffected > 0) {
            ToastAndroid.show(barcode11 + " Rejected", ToastAndroid.SHORT);
            setCheck11(0);
            displayDataSPScan();
            setDropDownValue("");
            setEnableGeoFence(0);
            setBarcode("");
            setExpectedPackaging("");
            setPackagingAction();
            Vibration.vibrate(200);
            const filteredAcceptedArray = acceptedArray.filter(
              (acceptedBarcode) => acceptedBarcode !== barcode11.toString()
            );
            setAcceptedArray(filteredAcceptedArray);
            dingAccept.play((success) => {
              if (success) {
                // Vibration.vibrate(800);
                console.log(
                  "ShipmentBarcode/rejectDetails2/successfully finished playing"
                );
              } else {
                console.log(
                  "ShipmentBarcode/rejectDetails2/playback failed due to audio decoding errors"
                );
              }
            });
          }
          // for (let i = 0; i < results.rows.length; ++i) {
          //   temp.push(results.rows.item(i));
          // }
        }
      );
    });
    setIsRejecting(false);
    setstopId("");
  };
  const viewDetails2 = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where status = "accepted"',
        [],
        (tx1, results) => {
          let temp = [];
          // console.log(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
            // console.log('barcode ' + results.rows.item(i).awbNo);
          }
          // ToastAndroid.show('Sync Successful',ToastAndroid.SHORT);
          // console.log(
          //   'Data from Local Database : \n ',
          //   JSON.stringify(temp, null, 4),
          // );
        }
      );
    });
  };
  const viewDetailsR2 = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where status = "rejected"',
        [],
        (tx1, results) => {
          let temp = [];
          // console.log(results.rows.length);
          // setnewRejected(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
          // ToastAndroid.show('Sync Successful',ToastAndroid.SHORT);
        }
      );
    });
  };
  const partialClose = () => {
    setDropDownValue11("");
  };

  const getCategories = (data, stopId) => {
    if (route.params.stopId == stopId) {
      db.transaction((txn) => {
        txn.executeSql(
          'SELECT * FROM SellerMainScreenDetails WHERE status IS NULL AND shipmentAction="Seller Pickup" AND  consignorCode=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber = ?) AND FMtripId=?',
          [route.params.consignorCode, data, data, data, route.params.tripID],
          (sqlTxn, res) => {
            setLen(res.rows.length);
            setBarcode(data);
            if (!res.rows.length) {
              db.transaction((tx) => {
                tx.executeSql(
                  'Select * FROM SellerMainScreenDetails WHERE status IS NOT NULL And shipmentAction="Seller Pickup" And consignorCode=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) AND FMtripId=?',
                  [
                    route.params.consignorCode,
                    data,
                    data,
                    data,
                    route.params.tripID,
                  ],
                  (tx1, results) => {
                    if (results.rows.length === 0) {
                      ToastAndroid.show(
                        "Scanning wrong product",
                        ToastAndroid.SHORT
                      );
                      setCheck11(0);
                      Vibration.vibrate(800);
                      dingReject.play((success) => {
                        if (success) {
                          console.log(
                            "ShipmentBarcode/getCategories/successfully finished playing"
                          );
                        } else {
                          console.log(
                            "ShipmentBarcode/getCategories/playback failed due to audio decoding errors"
                          );
                        }
                      });
                      setBarcode("");
                    } else {
                      ToastAndroid.show(
                        data + " already scanned",
                        ToastAndroid.SHORT
                      );
                      Vibration.vibrate(800);
                      setCheck11(0);
                      dingReject.play((success) => {
                        if (success) {
                          console.log(
                            "ShipmentBarcode/getCategoies/successfully finished playing"
                          );
                        } else {
                          console.log(
                            "ShipmentBarcode/getCategories/playback failed due to audio decoding errors"
                          );
                        }
                      });
                      setBarcode("");
                      setstopId("");
                      setExpectedPackaging("");
                      setPackagingAction();
                    }
                  }
                );
              });
            }
          },
          (error) => {
            console.log(
              "ShipmentBarcode/getCategories/error on getting categories " +
                error.message
            );
          }
        );
      });
    } else {
      db.transaction((txn) => {
        txn.executeSql(
          'SELECT * FROM SellerMainScreenDetails WHERE (status="notPicked" OR status="rejected") AND shipmentAction="Seller Pickup" AND  consignorCode=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber = ?) AND FMtripId=?',
          [route.params.consignorCode, data, data, data, route.params.tripID],
          (sqlTxn, res) => {
            setLen(res.rows.length);
            setBarcode(data);
            if (!res.rows.length) {
              db.transaction((tx) => {
                tx.executeSql(
                  'Select * FROM SellerMainScreenDetails WHERE  (status!="notPicked" OR status!="rejected") And shipmentAction="Seller Pickup" And consignorCode=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) AND FMtripId=?',
                  [
                    route.params.consignorCode,
                    data,
                    data,
                    data,
                    route.params.tripID,
                  ],
                  (tx1, results) => {
                    if (results.rows.length === 0) {
                      ToastAndroid.show(
                        "Scanning wrong product",
                        ToastAndroid.SHORT
                      );
                      setCheck11(0);
                      Vibration.vibrate(800);
                      dingReject.play((success) => {
                        if (success) {
                          console.log(
                            "ShipmentBarcode/getCategories/successfully finished playing"
                          );
                        } else {
                          console.log(
                            "ShipmentBarcode/getCategoies/playback failed due to audio decoding errors"
                          );
                        }
                      });
                      setBarcode("");
                    } else {
                      ToastAndroid.show(
                        data + " already scanned",
                        ToastAndroid.SHORT
                      );
                      Vibration.vibrate(800);
                      setCheck11(0);
                      dingReject.play((success) => {
                        if (success) {
                          console.log(
                            "ShipmentBarcode/getCategories/successfully finished playing"
                          );
                        } else {
                          console.log(
                            "ShipmentBarcode/getCategories/playback failed due to audio decoding errors"
                          );
                        }
                      });
                      setBarcode("");
                      setstopId("");
                      setExpectedPackaging("");
                      setPackagingAction();
                    }
                  }
                );
              });
            }
          },
          (error) => {
            console.log(
              "ShipmentBarcode/getCategories/error on getting categories " +
                error.message
            );
          }
        );
      });
    }
  };

  const displayData = async (text11, callback) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM SellerMainScreenDetails where awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?",
        [text11, text11, text11],
        (tx1, results) => {
          if (results.rows.length > 0) {
            const row = results.rows.item(0);
            setPackagingAction(row.packagingAction);
            setPackagingID(row.packagingId);
            setstopId(row.stopId);
            callback(row.stopId);
          } else {
            callback(null);
          }
        }
      );
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(setAutoSync(false));
      displayData(text11);
    });
    return unsubscribe;
  }, [navigation, syncTimeFull]);
  useEffect(() => {
    (async () => {
      displayData(text11);
    })();
  }, [text11]);

  const handlepackaging = (value, stopId) => {
    if (packagingAction == 1) {
      ToastAndroid.show(value + " Saved", ToastAndroid.SHORT);
      setCheck11(1);
      ToastAndroid.show(barcode + " Accepted", ToastAndroid.SHORT);
      updateDetails2(value, stopId);
      displayDataSPScan();
      setLen(0);
    } else if (packagingAction == 2) {
      if (packagingID.trim() === value.trim()) {
        setCheck11(1);
        ToastAndroid.show(barcode + " Accepted", ToastAndroid.SHORT);
        updateDetails2(value, stopId);
        displayDataSPScan();
        setLen(0);
      } else {
        setModal(true);
        setIsRejecting(true);
      }
    } else if (packagingAction == 3) {
      if (packagingID.trim() === value.trim()) {
        setCheck11(1);
        ToastAndroid.show(barcode + " Accepted", ToastAndroid.SHORT);
        updateDetails2(value, stopId);
        displayDataSPScan();
        setLen(0);
      } else {
        setModal1(true);
        setIsRejecting(true);
        setShowOuterScanner(false);
      }
    } else {
      console.log(
        packagingID,
        "ShipmentBarcode/handlePackaging/is not equal to",
        value
      );
    }
    setShowCloseBagModal12(false);
    setShowOuterScanner(true);
  };
  const handleReScan = () => {
    setExpectedPackaging("");
    setShowOuterScanner(false);
    setShowCloseBagModal12(true);
    if (packagingID.trim() === expectedPackagingId.trim()) {
      setCheck11(1);
      ToastAndroid.show(barcode + " Accepted", ToastAndroid.SHORT);
      updateDetails2(expectedPackagingId, stopId);
      displayDataSPScan();
      setLen(0);
    } else {
      setModal1(true);
      setIsRejecting(true);
      console.log("ShipmentBarcode/handleReScan/values not matched ");
    }
  };

  const onSuccess = (e) => {
    if (!isRejecting) {
      console.log(e.data, "ShipmentBarcode/onSuccess/barcode");
      setBarcode(e.data);
      setText11(e.data);
      displayData(e.data, (stopId) => {
        if (stopId) {
          getCategories(e.data, stopId);
        } else {
          handleInvalidScan();
        }
      });
    }
  };

  const handleInvalidScan = () => {
    console.log("ShipmentBarcode/handleInvalidScan/Wrong Product");
    ToastAndroid.show("Scanning wrong product", ToastAndroid.SHORT);
    setCheck11(0);
    Vibration.vibrate(800);
    dingReject.play((success) => {
      if (success) {
        console.log(
          "ShipmentBarcode/handleInvidScan/successfully finished playing"
        );
      } else {
        console.log(
          "ShipmentBarcode/handleInvidScan/playback failed due to audio decoding errors"
        );
      }
    });
    setBarcode("");
  };

  const onSuccess11 = (e) => {
    // Vibration.vibrate(100);
    // RNBeep.beep();
    Vibration.vibrate(100);
    dingAccept.play((success) => {
      if (success) {
        console.log(
          "ShipmentBarcode/onSuccess11/successfully finished playing"
        );
      } else {
        console.log(
          "ShipmentBarcode/onSuccess11/playback failed due to audio decoding errors"
        );
      }
    });
    console.log(e.data, "ShipmentBarcode/onSuccess11/sealID");
    // getCategories(e.data);
    setBagSeal(e.data);
  };
  const onSuccess12 = (e) => {
    // Vibration.vibrate(100);
    // RNBeep.beep();
    Vibration.vibrate(100);
    dingAccept.play((success) => {
      if (success) {
        console.log(
          "ShipmentBarcode/onSuccess12/successfully finished playing"
        );
      } else {
        console.log(
          "ShipmentBarcode/onSuccess12/playback failed due to audio decoding errors"
        );
      }
    });
    console.log(e.data, "ShipmentBarcode/onSucess12/ExpectedPackagingID");
    // getCategories(e.data);
    setExpectedPackaging(e.data);
    handlepackaging(e.data, stopId);
  };
  const onSucessThroughButton = (data21) => {
    console.log(data21, "ShipmentBarcode/onSucessThroughButton/barcode");
    setBarcode(data21);
    setText11(data21);
    displayData(data21, (stopId) => {
      if (stopId) {
        getCategories(data21, stopId);
      } else {
        handleInvalidScan();
      }
    });
  };
  useEffect(() => {
    if (len && packagingAction !== undefined && !isRejecting) {
      if (packagingAction == 0) {
        setCheck11(1);
        ToastAndroid.show(barcode + " Accepted", ToastAndroid.SHORT);
        updateDetails2(expectedPackagingId, stopId);
        displayDataSPScan();
        setLen(0);
      } else {
        setShowCloseBagModal12(true);
        setShowOuterScanner(false);
      }
    }
  }, [packagingAction, len]);

  const displaydata = async () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM ShipmentFailure", [], (tx1, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        // ToastAndroid.show('Sync Successful3', ToastAndroid.SHORT);
        setRejectedData(temp);
      });
    });
  };
  const navigation = useNavigation();

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
        onClose={() => setShowModal11(false)}
      >
        <Modal.Content w="100%" bg={"#eee"}>
          <Modal.CloseButton />
          <Modal.Body w="100%">
            <Modal.Header>Enter the OTP</Modal.Header>
            <OTPTextInput
              ref={(e) => (otpInput = e)}
              inputCount={6}
              handleTextChange={(e) => setInputOtp(e)}
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
          setDropDownValue11("");
          setShowOuterScanner(true);
        }}
        size="lg"
      >
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Partial Close Reason</Modal.Header>
          <Modal.Body>
            {PartialCloseData &&
              PartialCloseData.filter(
                (d) => d.applies_to.includes("PPCF") && d.parentCode !== "CNA"
              ).map((d, index) =>
                !pdCheck && d.description === "Partial Dispatch" ? (
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
                        d.short_code === DropDownValue11
                          ? "#6666FF"
                          : "#C8C8C8",
                      opacity: 0.4,
                    }}
                    title={d.description}
                    onPress={() =>
                      ToastAndroid.show(
                        "No bags for dispatch",
                        ToastAndroid.SHORT
                      )
                    }
                  >
                    {" "}
                    {/* onPress={() => ToastAndroid.show("No bags for dispatch",ToastAndroid.SHORT)}  */}
                    <Text
                      style={{
                        color:
                          d.short_code === DropDownValue11 ? "white" : "black",
                        alignContent: "center",
                        paddingTop: -5,
                      }}
                    >
                      {" "}
                      {d.description}{" "}
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
                        d.short_code === DropDownValue11
                          ? "#6666FF"
                          : "#C8C8C8",
                    }}
                    title={d.description}
                    onPress={() => handleButtonPress11(d.short_code)}
                  >
                    {" "}
                    <Text
                      style={{
                        color:
                          d.short_code === DropDownValue11 ? "white" : "black",
                        alignContent: "center",
                        paddingTop: -5,
                      }}
                    >
                      {" "}
                      {d.description}{" "}
                    </Text>
                  </Button>
                )
              )}

            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              marginBottom={1.5}
              marginTop={1.5}
              onPress={() => {
                if (!DropDownValue11) {
                  ToastAndroid.show(
                    "Please Select Reason ",
                    ToastAndroid.SHORT
                  );
                } else {
                  partialClose();
                  setModalVisible11(false);
                  navigation.navigate("POD", {
                    Forward: Forward,
                    accepted: newaccepted,
                    rejected: newrejected,
                    notPicked: newNotPicked,
                    phone: route.params.phone,
                    userId: route.params.userId,
                    consignorCode: route.params.consignorCode,
                    stopId: route.params.stopId,
                    tripId: route.params.tripID,
                    DropDownValue: DropDownValue11,
                    contactPersonName: route.params.contactPersonName,
                    runsheetno: route.params.PRSNumber,
                    latitude: latitude,
                    longitude: longitude,
                    token: token,
                  });
                }
              }}
            >
              Submit
            </Button>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={modalVisibleCNA}
        onClose={() => {
          setModalVisibleCNA(false);
          setDropDownValue11("");
        }}
        size="lg"
      >
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Could Not Attempt Reason</Modal.Header>
          <Modal.Body>
            {PartialCloseData &&
              PartialCloseData.filter(
                (d) => d.applies_to.includes("PPCF") && d.parentCode == "CNA"
              ).map((d, index) => (
                <Button
                  key={d._id}
                  flex="1"
                  mt={2}
                  marginBottom={1.5}
                  marginTop={1.5}
                  style={{
                    backgroundColor:
                      d.short_code === DropDownValue11 ? "#6666FF" : "#C8C8C8",
                  }}
                  title={d.description}
                  onPress={() => handleButtonPress11(d.short_code)}
                >
                  <Text
                    style={{
                      color:
                        d.short_code == DropDownValue11 ? "white" : "black",
                    }}
                  >
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
                  ToastAndroid.show(
                    "Please Select Reason ",
                    ToastAndroid.SHORT
                  );
                } else {
                  setModalVisibleCNA(false);
                  navigation.navigate("POD", {
                    Forward: Forward,
                    accepted: newaccepted,
                    rejected: newrejected,
                    notPicked: newNotPicked,
                    phone: route.params.phone,
                    userId: route.params.userId,
                    consignorCode: route.params.consignorCode,
                    stopId: route.params.stopId,
                    tripId: route.params.tripID,
                    DropDownValue: DropDownValue11,
                    contactPersonName: route.params.contactPersonName,
                    runsheetno: route.params.PRSNumber,
                    latitude: latitude,
                    longitude: longitude,
                    token: token,
                  });
                }
              }}
            >
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
              }}
            >
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
          setExpectedPackaging("");
          setPackagingAction();
          setstopId("");
        }}
        size="lg"
      >
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
                ref={(node) => {
                  this.scanner = node;
                }}
                containerStyle={{ height: 116, marginBottom: "55%" }}
                cameraStyle={{
                  height: 90,
                  marginTop: 95,
                  marginBottom: "15%",
                  width: 289,
                  alignSelf: "center",
                  justifyContent: "center",
                }}
                onError={(error) => {
                  callErrorAPIFromScanner(error);
                }}
              />
            )}
            <View style={{ alignItems: "center" }}>
              <Input
                placeholder="Enter Bag Seal"
                size="md"
                value={bagSeal}
                onChangeText={(text) => setBagSeal(text)}
                style={{
                  width: 290,
                  backgroundColor: "white",
                }}
              />
              <Button
                flex="1"
                mt={2}
                bg="#004aad"
                style={{ width: 290 }}
                onPress={() => {
                  CloseBagEndScan();
                  setShowCloseBagModal11(false);
                  setScanned(true);
                }}
              >
                Submit
              </Button>
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={showCloseBagModal12}
        onClose={() => {
          setShowCloseBagModal12(false);
          reloadScanner();
          setExpectedPackaging("");
          setLen(0);
          setShowOuterScanner(true);
        }}
        size="lg"
      >
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Packaging ID</Modal.Header>
          <Modal.Body>
            <QRCodeScanner
              onRead={onSuccess12}
              reactivate={true}
              reactivateTimeout={2000}
              flashMode={RNCamera.Constants.FlashMode.off}
              ref={(node) => {
                this.scanner = node;
              }}
              containerStyle={{ height: 116, marginBottom: "55%" }}
              cameraStyle={{
                height: 90,
                marginTop: 95,
                marginBottom: "15%",
                width: 289,
                alignSelf: "center",
                justifyContent: "center",
              }}
              onError={(error) => {
                callErrorAPIFromScanner(error);
              }}
            />
            <View style={{ alignItems: "center" }}>
              <Input
                placeholder="Enter Packaging ID"
                size="md"
                value={expectedPackagingId}
                onChangeText={(text) => setExpectedPackaging(text)}
                style={{
                  width: 290,
                  backgroundColor: "white",
                }}
              />
              {expectedPackagingId.length ? (
                <Button
                  flex="1"
                  mt={2}
                  bg="#004aad"
                  onPress={() => {
                    handlepackaging(expectedPackagingId, stopId);
                  }}
                  style={{ width: 290 }}
                >
                  Submit
                </Button>
              ) : (
                <Button flex="1" mt={2} bg="gray.300" style={{ width: 290 }}>
                  Submit
                </Button>
              )}
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <Modal
        isOpen={showCloseBagModal}
        onClose={() => {
          setShowCloseBagModal(false);
          reloadScanner();
          setShowOuterScanner(true);
          setExpectedPackaging("");
          setPackagingAction();
          setstopId("");
        }}
        size="lg"
      >
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Close Bag</Modal.Header>
          <Modal.Body>
            <QRCodeScanner
              onRead={onSuccess11}
              reactivate={true}
              reactivateTimeout={2000}
              flashMode={RNCamera.Constants.FlashMode.off}
              containerStyle={{ height: 116, marginBottom: "55%" }}
              cameraStyle={{
                height: 90,
                marginTop: 95,
                marginBottom: "15%",
                width: 289,
                alignSelf: "center",
                justifyContent: "center",
              }}
              onError={(error) => {
                callErrorAPIFromScanner(error);
              }}
            />
            <View style={{ alignItems: "center" }}>
              <Input
                placeholder="Enter Bag Seal"
                size="md"
                value={bagSeal}
                onChangeText={(text) => setBagSeal(text)}
                style={{
                  width: 290,
                  backgroundColor: "white",
                }}
              />
              <Button
                flex="1"
                mt={2}
                bg="#004aad"
                style={{ width: 290 }}
                onPress={() => {
                  CloseBag(), setShowCloseBagModal(false);
                  setShowOuterScanner(true);
                }}
              >
                Submit
              </Button>
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={showModal}
        onClose={() => {
          setModal(false);
          setExpectedPackaging("");
          setLen(0);
          setIsRejecting(false);
        }}
        size="lg"
      >
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Accept/Reject Shipment</Modal.Header>
          <Modal.Body>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Packaging ID Mismatch
              </Text>
            </View>
            <View
              style={{
                width: "90%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignSelf: "center",
                marginTop: 10,
              }}
            >
              <Button
                flex="1"
                mt={2}
                bg="#004aad"
                marginBottom={1.5}
                marginTop={1.5}
                marginRight={1}
                onPress={() => {
                  setCheck11(1);
                  ToastAndroid.show(barcode + " Accepted", ToastAndroid.SHORT);
                  updateDetails2(expectedPackagingId, stopId);
                  displayDataSPScan();
                  setLen(0);
                  setModal(false);
                  setIsRejecting(false);
                }}
              >
                Accept Anyway
              </Button>
              <Button
                flex="1"
                mt={2}
                bg="#004aad"
                marginBottom={1.5}
                marginTop={1.5}
                onPress={() => {
                  handleRejectAction("WPF", 0);
                  setModal(false);
                  setIsRejecting(true);
                }}
              >
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
          setExpectedPackaging("");
          setLen(0);
          setIsRejecting(false);
        }}
        size="lg"
      >
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Reject Shipment</Modal.Header>
          <Modal.Body>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Packaging ID Mismatch
              </Text>
            </View>
            <View
              style={{
                width: "90%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignSelf: "center",
                marginTop: 10,
              }}
            >
              <Button
                flex="1"
                mt={2}
                bg="#004aad"
                marginBottom={1.5}
                marginTop={1.5}
                marginRight={1}
                onPress={() => {
                  setModal1(false);
                  handleRejectAction("WPF", 0);
                  setIsRejecting(true);
                }}
              >
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
                  setIsRejecting(false);
                }}
              >
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
          setDropDownValue("");
          setIsRejecting(false);
        }}
        size="lg"
      >
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Reject Reason</Modal.Header>
          <Modal.Body>
            {rejectedData &&
              rejectedData
                .filter((d) => d.applies_to.includes("SHPF"))
                .map((d) => (
                  <Button
                    key={d.short_code}
                    flex="1"
                    mt={2}
                    marginBottom={1.5}
                    marginTop={1.5}
                    title={d.description}
                    style={{
                      backgroundColor:
                        d.short_code === DropDownValue ? "#6666FF" : "#C8C8C8",
                    }}
                    onPress={() =>
                      handleButtonPress(d.short_code, d.enable_geo_fence)
                    }
                  >
                    <Text
                      style={{
                        color:
                          DropDownValue == d.short_code ? "white" : "black",
                      }}
                    >
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
                  ToastAndroid.show(
                    "Please Select Reason ",
                    ToastAndroid.SHORT
                  );
                } else {
                  handleRejectAction(DropDownValue, enableGeoFence);
                  setModalVisible(false);
                }
              }}
            >
              Submit
            </Button>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <ScrollView
        style={{ paddingTop: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {showOuterScanner && (
          <QRCodeScanner
            onRead={onSuccess}
            reactivate={true}
            reactivateTimeout={3000}
            ref={scannerRef}
            flashMode={RNCamera.Constants.FlashMode.off}
            containerStyle={{
              width: "100%",
              alignSelf: "center",
              backgroundColor: "white",
            }}
            onError={(error) => {
              callErrorAPIFromScanner(error);
            }}
            cameraStyle={{ width: "90%", alignSelf: "center" }}
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
          <View style={{ backgroundColor: "white" }}>
            <View style={{ alignItems: "center", marginTop: 15 }}>
              <View
                style={{
                  backgroundColor: "lightgrey",
                  padding: 0,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "90%",
                  borderRadius: 10,
                  flex: 1,
                }}
              >
                <Input
                  placeholder="Shipment ID"
                  value={text11}
                  onChangeText={(text) => {
                    setText11(text);
                  }}
                  style={{
                    fontSize: 18,
                    fontWeight: "500",
                    width: 320,
                    backgroundColor: "lightgrey",
                  }}
                />
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: "lightgrey",
                    paddingTop: 8,
                  }}
                  onPress={() => onSucessThroughButton(text11)}
                >
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
                onPress={() => {
                  if (check11 === 0) {
                    ToastAndroid.show(
                      "No Shipment to Reject",
                      ToastAndroid.SHORT
                    );
                  } else {
                    setModalVisible(true);
                    setIsRejecting(true);
                  }
                }}
                w="90%"
                size="lg"
                bg={buttonColorRejected}
                mb={4}
                mt={4}
              >
                Reject Shipment
              </Button>
              <View
                style={{
                  width: "90%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: "lightgray",
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                  padding: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  Expected
                </Text>
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  {Forward}
                </Text>
              </View>
              <View
                style={{
                  width: "90%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: "lightgray",
                  padding: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  Accepted
                </Text>
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  {newaccepted}
                </Text>
              </View>
              <View
                style={{
                  width: "90%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: "lightgray",
                  padding: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  Rejected
                </Text>
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  {newrejected}
                </Text>
              </View>
              <View
                style={{
                  width: "90%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderColor: "lightgray",
                  borderBottomLeftRadius: 5,
                  borderBottomRightRadius: 5,
                  padding: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  Not Picked
                </Text>
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  {newNotPicked}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              width: "90%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignSelf: "center",
              marginTop: 10,
            }}
          >
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
              bg="#004aad"
            >
              End Scan
            </Button>

            <Button
              w="48%"
              size="lg"
              bg={buttonColor}
              onPress={() => {
                if (acceptedArray.length === 0) {
                  ToastAndroid.show("Bag is Empty", ToastAndroid.SHORT);
                } else {
                  setShowCloseBagModal(true);
                  setShowOuterScanner(false);
                }
              }}
            >
              Close bag
            </Button>
          </View>
          <Center>
            <Image
              style={{
                width: 150,
                height: 100,
              }}
              source={require("../../assets/image.png")}
              alt={"Logo Image"}
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
    width: "90%",
    backgroundColor: "white",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  infoContainer: {
    marginTop: 10,
    width: "90%",
  },
  info: {
    backgroundColor: "lightgray",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
  },
  value: {
    fontSize: 18,
    fontWeight: "500",
  },
  normal: {
    fontFamily: "open sans",
    fontWeight: "normal",
    fontSize: 20,
    color: "#eee",
    marginTop: 27,
    paddingTop: 15,
    marginLeft: 10,
    marginRight: 10,
    paddingBottom: 15,
    backgroundColor: "#eee",
    width: "auto",
    borderRadius: 0,
  },
  container: {
    flexDirection: "row",
  },
  text: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  main1: {
    backgroundColor: "#004aad",
    fontFamily: "open sans",
    fontWeight: "normal",
    fontSize: 20,
    marginTop: 27,
    paddingTop: 15,
    marginLeft: 10,
    marginRight: 10,
    paddingBottom: 15,
    width: "auto",
    borderRadius: 20,
  },
  textbox1: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    width: "auto",
    flexDirection: "column",
    textAlign: "center",
  },

  textbtn: {
    alignSelf: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  btn: {
    fontFamily: "open sans",
    fontSize: 15,
    lineHeight: 10,
    marginTop: 80,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#004aad",
    width: 100,
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 60,
  },
  bt3: {
    fontFamily: "open sans",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    lineHeight: 10,
    marginTop: 10,
    backgroundColor: "#004aad",
    width: "auto",
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 10,
    marginRight: 15,
    // width:'95%',
    // marginTop:60,
  },
  picker: {
    color: "white",
  },
  pickerItem: {
    fontSize: 20,
    height: 50,
    color: "#ffffff",
    backgroundColor: "#2196f3",
    textAlign: "center",
    margin: 10,
    borderRadius: 10,
  },
  modalContent: {
    flex: 0.57,
    justifyContent: "center",
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginLeft: 28,
    marginTop: 175,
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 100,
    margin: 5.5,
    color: "rgba(0,0,0,1)",
    alignContent: "center",
  },

  containerText: {
    paddingLeft: 30,
    color: "#000",
    fontSize: 15,
  },
  otp: {
    backgroundColor: "#004aad",
    color: "#000",
    marginTop: 5,
    borderRadius: 10,
  },
});
