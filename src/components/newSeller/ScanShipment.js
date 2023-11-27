/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  NativeBaseProvider,
  Image,
  Box,
  Fab,
  Icon,
  Button,
  Alert,
  Modal,
  Input,
} from "native-base";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  ActivityIndicator,
  PermissionsAndroid,
  Text,
  View,
  ScrollView,
  Vibration,
  ToastAndroid,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Center } from "native-base";
import { useNavigation } from "@react-navigation/native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { openDatabase } from "react-native-sqlite-storage";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import NetInfo from "@react-native-community/netinfo";
import RNBeep from "react-native-a-beep";
import { Picker } from "@react-native-picker/picker";
import GetLocation from "react-native-get-location";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import {
  backgroundColor,
  borderColor,
  height,
  marginTop,
  style,
} from "styled-system";
import dingReject11 from "../../assets/rejected_sound.mp3";
import dingAccept11 from "../../assets/beep_accepted.mp3";
import Sound from "react-native-sound";
import { Console } from "console";
import { callApi } from "../ApiError";
// import GetLocation from 'react-native-get-location';
// import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import OTPTextInput from "react-native-otp-textinput";
import { RNCamera } from "react-native-camera";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { panGestureHandlerCustomNativeProps } from "react-native-gesture-handler/lib/typescript/handlers/PanGestureHandler";
import { backendUrl } from "../../utils/backendUrl";
import { setAutoSync } from "../../redux/slice/autoSyncSlice";
import { useDispatch, useSelector } from "react-redux";
import { getAuthorizedHeaders } from "../../utils/headers";
import { is } from "@babel/types";
const db = openDatabase({
  name: "rn_sqlite",
});

const ScanShipment = ({ route }) => {
  const dispatch = useDispatch();
  const syncTimeFull = useSelector((state) => state.autoSync.syncTimeFull);
  const [expected, setExpected] = useState(0);
  const [newaccepted, setnewAccepted] = useState(0);
  const [newrejected, setnewRejected] = useState(0);
  const [newtagged, setnewTagged] = useState(0);
  const [notDelivered, setnotDelivered] = useState(0);
  const [barcode, setBarcode] = useState("");
  const [len, setLen] = useState(0);
  const [token, setToken] = useState(route.params.token);
  const [DropDownValue, setDropDownValue] = useState(null);
  const [DropDownValue11, setDropDownValue11] = useState(null);
  const [rejectedData, setRejectedData] = useState([]);
  const [acceptedArray, setAcceptedArray] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [NotAttemptData, setNotAttemptData] = useState([]);
  const [bagId, setBagId] = useState("");
  const [bagIdNo, setBagIdNo] = useState(1);
  const [showCloseBagModal, setShowCloseBagModal] = useState(false);
  const [bagSeal, setBagSeal] = useState("");
  const [packagingAction, setPackagingAction] = useState();
  const [packagingID, setPackagingID] = useState(0);
  const [showCloseBagModal12, setShowCloseBagModal12] = useState(false);
  const [showModal, setModal] = useState(false);
  const [showModal1, setModal1] = useState(false);
  const [expectedPackagingId, setExpectedPackaging] = useState("");
  const [scanned, setScanned] = useState(true);
  const [check11, setCheck11] = useState(0);
  const [modalVisibleCNA, setModalVisibleCNA] = useState(false);
  const buttonColorRejected = check11 === 0 ? "gray.300" : "#004aad";
  var otpInput = useRef(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [imageUrlsSigned, setImageUrlsSigned] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRejecting, setIsRejecting] = useState(false);
  const currentDateValue =
    useSelector((state) => state.currentDate.currentDateValue) ||
    new Date().toISOString().split("T")[0];
  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "App needs camera permission",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const createFormData = (photo, body) => {
    const data = new FormData();

    data.append("file", {
      name: photo.fileName,
      type: photo.type,
      uri:
        Platform.OS === "android"
          ? photo.uri
          : photo.uri.replace("file://", ""),
    });

    Object.keys(body).forEach((key) => {
      data.append(key, body[key]);
    });
    return data;
  };
  // var imageUrls = [];
  const takePicture = async () => {
    setUploadStatus("uploading");
    let options = {
      mediaType: "photo",
      quality: 1,
      cameraType: "back",
      maxWidth: 480,
      maxHeight: 480,
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };
    let isGranted = await requestCameraPermission();
    let result = null;
    if (isGranted) {
      result = await launchCamera(options);
      console.log("ScanShipment.js/takePicture ", result);
    }
    if (result.assets !== undefined) {
      const newImage = result.assets[0];
      const formData = createFormData(newImage, {
        useCase: "dsqc",
        type: newImage?.type,
        contextId: barcode,
      });

      fetch(backendUrl + "DSQCPicture/uploadPicture", {
        method: "POST",
        body: formData,
        headers: getAuthorizedHeaders(token),
      })
        .then((data) => data.json())
        .then((res) => {
          setUploadStatus("done");
          setModalVisible1(true);
          console.log("ScanShipment.js/takePicture ", "upload success", res);
          setImageUrls((prevImageUrls) => [...prevImageUrls, res.publicURL]);
          setImageUrlsSigned((prevImageUrls) => [
            ...prevImageUrls,
            res.signedUrl,
          ]);
          setUploadStatus("idle");
        })
        .catch((error) => {
          console.log("ScanShipment.js/takePicture ", "upload error", error);
          setUploadStatus("error");
        });
    }
  };
  console.log("ScanShipment.js/takePicture ", "length", imageUrls.length);
  const scannerRef = useRef(null);

  const reloadScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.reactivate();
    }
  };
  useEffect(() => {
    reloadScanner();
  }, []);

  Sound.setCategory("Playback");

  var dingAccept = new Sound(dingAccept11, (error) => {
    if (error) {
      console.log(
        "ScanShipment.js/dingAccept ",
        "failed to load the sound",
        error
      );
      return;
    }
    // if loaded successfully
    // console.log('ScanShipment.js/ ',
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
      console.log(
        "ScanShipment.js/dingReject ",
        "failed to load the sound",
        error
      );
      return;
    }
    // if loaded successfully
    // console.log('ScanShipment.js/ ',
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
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(setAutoSync(false));
      displayDataSPScan();
    });
    return unsubscribe;
  }, [navigation, syncTimeFull]);

  const NotAttemptReasons11 = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM NotAttemptReasons", [], (tx1, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        setNotAttemptData(temp);
      });
    });
  };
  const DisplayData2 = async () => {
    NotAttemptReasons11();
  };

  useEffect(() => {
    DisplayData2();
  }, []);

  const displayDataSPScan = async () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND status="accepted"',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          setnewAccepted(results.rows.length);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND status="notDelivered"',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          setnotDelivered(results.rows.length);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND status="rejected"',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          setnewRejected(results.rows.length);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND status="tagged"',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          setnewTagged(results.rows.length);
        }
      );
    });
    setLoading(false);
  };
  const displayData = async () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM SellerMainScreenDetails where awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?",
        [barcode, barcode, barcode],
        (tx1, results) => {
          if (results.rows.length > 0) {
            const row = results.rows.item(0);
            setPackagingAction(row.packagingAction);
            setPackagingID(row.packagingId);
          }
        }
      );
    });
  };
  // console.log('ScanShipment.js/ ',"packagingId",packagingID)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(setAutoSync(false));
      displayData();
    });
    return unsubscribe;
  }, [navigation, syncTimeFull]);
  useEffect(() => {
    (async () => {
      displayData();
    })();
  }, [barcode]);

  const updateDetails2 = (expectedPackagingId) => {
    console.log(
      "ScanShipment.js/updateDetails2 ",
      "scan " + barcode.toString()
    );
    setAcceptedArray([...acceptedArray, barcode.toString()]);
    console.log("ScanShipment.js/updateDetails2 ", acceptedArray);
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE SellerMainScreenDetails SET status="accepted", expectedPackagingId=?, eventTime=?, latitude=?, longitude=? WHERE shipmentAction="Seller Delivery" AND stopId=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) AND FMtripId=?',
        [
          expectedPackagingId,
          new Date().valueOf(),
          latitude,
          longitude,
          route.params.stopId,
          barcode,
          barcode,
          barcode,
          route.params.tripId,
        ],
        (tx1, results) => {
          let temp = [];
          console.log(
            "ScanShipment.js/updateDetails2 ",
            "Results",
            results.rowsAffected
          );
          console.log("ScanShipment.js/updateDetails2 ", results);

          if (results.rowsAffected > 0) {
            console.log(
              "ScanShipment.js/updateDetails2 ",
              barcode + "accepted"
            );
            Vibration.vibrate(200);
            dingAccept.play((success) => {
              if (success) {
                // Vibration.vibrate(800);
                console.log(
                  "ScanShipment.js/updateDetails2 ",
                  "successfully finished playing"
                );
              } else {
                console.log(
                  "ScanShipment.js/updateDetails2 ",
                  "playback failed due to audio decoding errors"
                );
              }
            });
            displayDataSPScan();
          } else {
            console.log(
              "ScanShipment.js/updateDetails2 ",
              barcode + "not accepted"
            );
          }
          console.log("ScanShipment.js/updateDetails2 ", results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
        }
      );
    });
    setExpectedPackaging("");
    setPackagingAction();
  };

  const rejectDetails2 = (reason) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE SellerMainScreenDetails SET status="rejected" , eventTime=?, latitude=?, longitude=? , expectedPackagingId=?, rejectionReasonL1=?  WHERE  shipmentAction="Seller Delivery" AND stopId=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) AND FMtripId=?',
        [
          new Date().valueOf(),
          latitude,
          longitude,
          expectedPackagingId,
          reason,
          route.params.stopId,
          barcode,
          barcode,
          barcode,
          route.params.tripId,
        ],
        (tx1, results) => {
          let temp = [];
          // console.log('ScanShipment.js/ ','Rejected Reason : ', reason);
          // console.log('ScanShipment.js/ ','Results', results.rowsAffected);
          // console.log('ScanShipment.js/ ',results);
          if (results.rowsAffected > 0) {
            // ContinueHandle11();
            console.log(
              "ScanShipment.js/rejectDetails2 ",
              barcode + "rejected"
            );
            ToastAndroid.show(barcode + " Rejected", ToastAndroid.SHORT);
            Vibration.vibrate(100);
            RNBeep.beep();
            setDropDownValue("");
            displayDataSPScan();
          } else {
            console.log(
              "ScanShipment.js/rejectDetails2 ",
              barcode + "failed to reject item locally"
            );
          }
          setIsRejecting(false);
          setImageUrls([]);
          setImageUrlsSigned([]);
          setCheck11(0);
          setExpectedPackaging("");
          setPackagingAction();
          console.log("ScanShipment.js/rejectDetails2 ", results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
        }
      );
    });
  };
  const taggedDetails = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE SellerMainScreenDetails SET status="tagged", eventTime=?, latitude=?, longitude=? , expectedPackagingId=?, rejectionReasonL1=?  WHERE stopId=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) AND FMtripId=?',
        [
          new Date().valueOf(),
          latitude,
          longitude,
          expectedPackagingId,
          DropDownValue,
          route.params.stopId,
          barcode,
          barcode,
          barcode,
          route.params.tripId,
        ],
        (tx1, results) => {
          let temp = [];
          // console.log(
          //   "ScanShipment.js/rejectDetails2 ",
          //   "Rejected Reason : ",
          //   DropDownValue
          // );
          // console.log(
          //   "ScanShipment.js/rejectDetails2 ",
          //   "Results",
          //   results.rowsAffected
          // );
          // console.log("ScanShipment.js/rejectDetails2 ", results);
          if (results.rowsAffected > 0) {
            // ContinueHandle11();
            console.log("ScanShipment.js/rejectDetails2 ", barcode + "tagged");
            ToastAndroid.show(barcode + " Tagged", ToastAndroid.SHORT);
            Vibration.vibrate(100);
            RNBeep.beep();
            setDropDownValue("");
            displayDataSPScan();
          } else {
            console.log(
              "ScanShipment.js/rejectDetails2 ",
              barcode + "failed to tagged item locally"
            );
          }
          setIsRejecting(false);
          setImageUrls([]);
          setImageUrlsSigned([]);
          setCheck11(0);
          setExpectedPackaging("");
          setPackagingAction();
          console.log("ScanShipment.js/rejectDetails2 ", results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
        }
      );
    });
  };
  console.log(isRejecting);
  const getCategories = (data) => {
    db.transaction((txn) => {
      txn.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE status IS NULL AND shipmentAction="Seller Delivery" AND stopId=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber = ?) AND FMtripId=?',
        [route.params.stopId, data, data, data, route.params.tripId],
        (sqlTxn, res) => {
          setLen(res.rows.length);
          setBarcode(data);
          if (!res.rows.length) {
            db.transaction((tx) => {
              tx.executeSql(
                'Select * FROM SellerMainScreenDetails WHERE status IS NOT NULL And shipmentAction="Seller Delivery" And stopId=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) AND FMtripId=?',
                [route.params.stopId, data, data, data, route.params.tripId],
                (tx1, results) => {
                  if (results.rows.length === 0) {
                    ToastAndroid.show(
                      "Scanning wrong product",
                      ToastAndroid.SHORT
                    );
                  } else {
                    ToastAndroid.show(
                      data + " already scanned",
                      ToastAndroid.SHORT
                    );
                    setExpectedPackaging("");
                    setPackagingAction();
                  }
                }
              );
            });
          }
          //  else if (packagingAction !== undefined && packagingAction != 0 && barcode) {
          //   setShowCloseBagModal12(true);
          //   setScanned(false);
          // }
        },
        (error) => {
          console.log(
            "ScanShipment.js/getCategories ",
            "error on getting categories " + error.message
          );
        }
      );
    });
  };

  const handlepackaging = (value) => {
    if (packagingID != null && packagingID.trim() == value.trim()) {
      setCheck11(1);
      ToastAndroid.show(barcode + " Accepted", ToastAndroid.SHORT);
      updateDetails2(value);
      displayDataSPScan();
      setLen(0);
    } else {
      setModal1(true);
      setIsRejecting(true);
    }
    setShowCloseBagModal12(false);
    setScanned(true);
  };
  const handleReScan = () => {
    setExpectedPackaging("");
    setScanned(false);
    setShowCloseBagModal12(true);
    if (
      packagingID != null &&
      packagingID.trim() == expectedPackagingId.trim()
    ) {
      setCheck11(1);
      ToastAndroid.show(barcode + " Accepted", ToastAndroid.SHORT);
      updateDetails2(expectedPackagingId);
      displayDataSPScan();
      setLen(0);
    } else {
      setModal1(true);
      setIsRejecting(true);
    }
  };

  const updateCategories = (data) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE SellerMainScreenDetails set status=? where clientShipmentReferenceNumber=?",
        ["accepted", data],
        (tx, results) => {
          // console.log('ScanShipment.js/ ','Results', results.rowsAffected);
        }
      );
    });
  };

  const updateCategories1 = (data) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE categories set ScanStatus=?, UploadStatus=? where clientShipmentReferenceNumber=?",
        [1, 1, data],
        (tx, results) => {
          // console.log('ScanShipment.js/ ','Results', results.rowsAffected);
        }
      );
    });
  };
  const onSuccess = (e) => {
    if (!isRejecting) {
      console.log("ScanShipment.js/onSuccess ", e.data, "barcode");
      setBarcode(e.data);
      getCategories(e.data);
    }
  };

  const onSuccess12 = (e) => {
    // Vibration.vibrate(100);
    // RNBeep.beep();
    Vibration.vibrate(100);
    dingAccept.play((success) => {
      if (success) {
        console.log(
          "ScanShipment.js/onSuccess12 ",
          "successfully finished playing"
        );
      } else {
        console.log(
          "ScanShipment.js/onSuccess12 ",
          "playback failed due to audio decoding errors"
        );
      }
    });
    console.log("ScanShipment.js/onSuccess12 ", e.data, "ExpectedPackagingID");
    // getCategories(e.data);
    setExpectedPackaging(e.data);
    handlepackaging(e.data);
  };
  const onSucessThroughButton = (data21) => {
    console.log("ScanShipment.js/onSucessThroughButton ", data21, "barcode");
    setBarcode(data21);

    // barcode === data21 ? getCategories(data21) : setBarcode(data21);
    // getCategories(e.data);
    getCategories(data21);
  };

  useEffect(() => {
    if (len && packagingAction !== undefined) {
      if (packagingAction == 0) {
        setCheck11(1);
        Vibration.vibrate(100);
        RNBeep.beep();
        ToastAndroid.show(barcode + " Accepted", ToastAndroid.SHORT);
        updateDetails2(expectedPackagingId);
        displayDataSPScan();
        setLen(0);
      } else {
        setShowCloseBagModal12(true);
        setScanned(false);
      }
    }
  }, [len, packagingAction]);

  const displaydata = async () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM ShipmentFailure", [], (tx1, results) => {
        let temp = [];
        // console.log('ScanShipment.js/ ',results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        setRejectedData(temp);
      });
    });
  };
  const navigation = useNavigation();
  const [count, setcount] = useState(0);

  const handleSync = () => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        alert("check net connection");
        return;
      }
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM categories where ScanStatus = ? AND UploadStatus = ?",
          [1, 0],
          (tx, results) => {
            var len = results.rows.length;
            if (len > 0) {
              let res = results.rows.item(0);
              axios
                .post("https://bked.logistiex.com/SellerMainScreen/postSPS", {
                  clientShipmentReferenceNumber:
                    res.clientShipmentReferenceNumber,
                  feUserID: route.params.userId,
                  isAccepted: "false",
                  rejectionReason: "null",
                  consignorCode: res.consignorCode,
                  stopId: res.stopId,
                  tripId: res.FMtripId,
                  pickupTime: new Date()
                    .toJSON()
                    .slice(0, 10)
                    .replace(/-/g, "/"),
                  latitude: 0,
                  longitude: 0,
                  packagingId: "ss",
                  packageingStatus: 1,
                  PRSNumber: res.PRSNumber,
                })
                .then(function (response) {
                  // console.log('ScanShipment.js/ ',response.data, 'hello');
                  updateCategories1(res.clientShipmentReferenceNumber);
                  alert("Data send on Server");
                })
                .catch(function (error) {
                  // console.log('ScanShipment.js/ ',error);
                });
            } else {
              alert("No data found");
            }
          }
        );
      });
    });
    // Unsubscribe
    unsubscribe();
  };
  useEffect(() => {
    displaydata();
  }, []);
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
        // RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        //   interval: 10000,
        //   fastInterval: 5000,
        // })
        //   .then(status => {
        //     if (status) {
        //       console.log('ScanShipment.js/ ','Location enabled');
        //     }
        //   })
        //   .catch(err => {
        //     console.log('ScanShipment.js/ ',err);
        //   });
        console.log(
          "ScanShipment.js/current_location ",
          "Location Lat long error",
          error
        );
      });
  };

  const callErrorAPIFromScanner = (error) => {
    console.log(
      "ScanShipment.js/callErrorAPIFromScanner ",
      "Scanner Error API called"
    );
    callApi(error, latitude, longitude, route.params.userId, token);
  };

  const partialClose112 = () => {
    if (newaccepted + newrejected + newtagged === route.params.Forward) {
      navigation.navigate("CollectPOD", {
        Forward: route.params.Forward,
        accepted: newaccepted,
        rejected: newrejected,
        tagged: newtagged,
        phone: route.params.phone,
        userId: route.params.userId,
        consignorCode: route.params.consignorCode,
        stopId: route.params.stopId,
        tripId: route.params.tripId,
        contactPersonName: route.params.contactPersonName,
        notDelivered: notDelivered,
        runsheetno: route.params.PRSNumber,
        latitude: latitude,
        longitude: longitude,
        DropDownValue: DropDownValue11,
        token: token,
      });
    } else {
      setDropDownValue11("");
      setModalVisible2(true);
    }
  };
  function handleButtonPress(item) {
    setDropDownValue(item);
  }
  function handleButtonPress2(item) {
    if (item == "CNA") {
      setModalVisibleCNA(true);
      setModalVisible2(false);
    }
    setDropDownValue11(item);
  }
  return (
    <NativeBaseProvider>
      <Modal
        isOpen={modalVisible2}
        onClose={() => {
          setModalVisible2(false);
          setDropDownValue11("");
        }}
        size="lg"
      >
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Partial Close Reason</Modal.Header>
          <Modal.Body>
            {rejectedData &&
              rejectedData
                .filter(
                  (d) => d.applies_to.includes("PDCF") && d.parentCode !== "CNA"
                )
                .map((d, index) => (
                  <Button
                    key={d._id}
                    flex="1"
                    mt={2}
                    marginBottom={1.5}
                    marginTop={1.5}
                    style={{
                      backgroundColor:
                        d.short_code === DropDownValue11
                          ? "#6666FF"
                          : "#C8C8C8",
                    }}
                    title={d.description}
                    onPress={() => handleButtonPress2(d.short_code)}
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
                  setModalVisible2(false);
                  navigation.navigate("CollectPOD", {
                    Forward: route.params.Forward,
                    accepted: newaccepted,
                    rejected: newrejected,
                    tagged: newtagged,
                    phone: route.params.phone,
                    userId: route.params.userId,
                    consignorCode: route.params.consignorCode,
                    stopId: route.params.stopId,
                    tripId: route.params.tripId,
                    contactPersonName: route.params.contactPersonName,
                    notDelivered: notDelivered,
                    runsheetno: route.params.PRSNumber,
                    latitude: latitude,
                    longitude: longitude,
                    DropDownValue: DropDownValue11,
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
            {rejectedData &&
              rejectedData
                .filter(
                  (d) => d.applies_to.includes("PDCF") && d.parentCode == "CNA"
                )
                .map((d, index) => (
                  <Button
                    key={d._id}
                    flex="1"
                    mt={2}
                    marginBottom={1.5}
                    marginTop={1.5}
                    style={{
                      backgroundColor:
                        d.short_code === DropDownValue11
                          ? "#6666FF"
                          : "#C8C8C8",
                    }}
                    title={d.description}
                    onPress={() => handleButtonPress2(d.short_code)}
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
                setModalVisibleCNA(false);
                navigation.navigate("CollectPOD", {
                  Forward: route.params.Forward,
                  accepted: newaccepted,
                  rejected: newrejected,
                  tagged: newtagged,
                  phone: route.params.phone,
                  userId: route.params.userId,
                  consignorCode: route.params.consignorCode,
                  stopId: route.params.stopId,
                  tripId: route.params.tripId,
                  contactPersonName: route.params.contactPersonName,
                  notDelivered: notDelivered,
                  runsheetno: route.params.PRSNumber,
                  latitude: latitude,
                  longitude: longitude,
                  DropDownValue: DropDownValue11,
                  token: token,
                });
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
                setModalVisible2(true), setModalVisibleCNA(false);
              }}
            >
              Back
            </Button>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setIsRejecting(false);
        }}
        size="lg"
      >
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Return Handover Rejection Tag</Modal.Header>
          <Modal.Body>
            {rejectedData &&
              rejectedData
                .filter((d) => d.applies_to.includes("RHRF"))
                .map((d) => (
                  <Button
                    key={d._id}
                    flex="1"
                    mt={2}
                    marginBottom={1.5}
                    marginTop={1.5}
                    title={d.description}
                    style={{
                      backgroundColor:
                        d.short_code === DropDownValue ? "#6666FF" : "#C8C8C8",
                    }}
                    onPress={() => handleButtonPress(d.short_code)}
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
                  if (!DropDownValue) {
                    ToastAndroid.show(
                      "Please Select Reason ",
                      ToastAndroid.SHORT
                    );
                  } else {
                    setModalVisible(false);
                    rejectDetails2(DropDownValue);
                    setIsRejecting(true);
                  }
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
                  if (!DropDownValue) {
                    ToastAndroid.show(
                      "Please Select Reason ",
                      ToastAndroid.SHORT
                    );
                  } else {
                    setModalVisible(false);
                    taggedDetails();
                  }
                }}
              >
                Tag Shipment
              </Button>
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={modalVisible1}
        onClose={() => {
          setModalVisible1(false);
          setImageUrls([]);
          setImageUrlsSigned([]);
          setIsRejecting(false);
        }}
        size="lg"
      >
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Return Handover Rejection Tag</Modal.Header>
          <Modal.Body>
            <Button
              py={3}
              variant="outline"
              _text={{ color: "white", fontSize: 20 }}
              onPress={takePicture}
            >
              {uploadStatus === "idle" && (
                <MaterialIcons name="cloud-upload" size={22} color="gray">
                  {" "}
                  Image
                </MaterialIcons>
              )}
              {uploadStatus === "uploading" && (
                <ActivityIndicator size="small" color="gray" />
              )}
              {uploadStatus === "done" && (
                <MaterialIcons name="check" size={22} color="green" />
              )}
              {uploadStatus === "error" && (
                <MaterialIcons name="error" size={22} color="red" />
              )}
            </Button>
            {imageUrlsSigned.length > 0 && (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 50,
                }}
              >
                {imageUrlsSigned.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    style={{ width: 100, height: 100 }}
                  />
                ))}
              </View>
            )}
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
                  setImageUrls([]);
                  setImageUrlsSigned([]);
                  takePicture();
                }}
              >
                ReClick
              </Button>
              {imageUrls.length < 1 ? (
                <Button
                  opacity={0.5}
                  disabled={true}
                  flex="1"
                  mt={2}
                  bg="#004aad"
                  marginBottom={1.5}
                  marginTop={1.5}
                >
                  Save
                </Button>
              ) : (
                <Button
                  flex="1"
                  mt={2}
                  bg="#004aad"
                  marginBottom={1.5}
                  marginTop={1.5}
                  onPress={() => {
                    setModalVisible(true);
                    setModalVisible1(false);
                    setIsRejecting(true);
                  }}
                >
                  Save
                </Button>
              )}
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
          setScanned(true);
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
                    handlepackaging(expectedPackagingId);
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
                  rejectDetails2("WPR");
                  setModal1(false);
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
      <ScrollView
        style={{ paddingTop: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="blue"
            style={{ marginTop: 44 }}
          />
        ) : (
          <>
            {scanned && (
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
              <Center></Center>
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
                      value={barcode}
                      onChangeText={(text) => {
                        setBarcode(text);
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
                      onPress={() => onSucessThroughButton(barcode)}
                    >
                      <Center>
                        <MaterialIcons name="send" size={30} color="#004aad" />
                      </Center>
                    </TouchableOpacity>
                  </View>
                  <Button
                    title="Reject/Tag Shipment"
                    onPress={() => {
                      if (check11 === 0) {
                        ToastAndroid.show(
                          "No Shipment to Reject/Tag",
                          ToastAndroid.SHORT
                        );
                      } else {
                        // setModalVisible1(true);
                        takePicture();
                        setIsRejecting(true);
                      }
                    }}
                    w="90%"
                    size="lg"
                    bg={buttonColorRejected}
                    mb={4}
                    mt={4}
                  >
                    Reject/Tag Shipment
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
                      {route.params.Forward}
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
                      Delivered
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
                      borderBottomWidth: 0,
                      borderColor: "lightgray",
                      padding: 10,
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "500" }}>
                      Tagged
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: "500" }}>
                      {newtagged}
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
                      Not Handed Over
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: "500" }}>
                      {notDelivered}
                    </Text>
                  </View>
                  <Button
                    onPress={() => {
                      partialClose112();
                    }}
                    w="90%"
                    size="lg"
                    bg="#004aad"
                    mb={4}
                    mt={4}
                  >
                    End Scan
                  </Button>
                </View>
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
          </>
        )}
      </ScrollView>
    </NativeBaseProvider>
  );
};

export default ScanShipment;

export const styles = StyleSheet.create({
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

  // text:{
  //   paddingLeft:20,
  //   color:'#000',
  //   fontWeight:'normal',
  //   fontSize:18
  // },
  // container:{
  //     flex:1,
  //     fontFamily:'open sans',
  //     fontWeight:'normal',
  //     color:'#eee',
  //     paddingTop:10,
  //     paddingBottom:10,
  //     flexDirection:'row',
  //     justifyContent:'space-between',
  //     width: 'auto',
  //     borderWidth:1,
  //     borderColor:'#eee'

  // },

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
