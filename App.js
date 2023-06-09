/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import "react-native-gesture-handler";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./src/redux/store";
import {
  NativeBaseProvider,
  Box,
  Text,
  Image,
  Avatar,
  Heading,
  Button,
  Select,
  Divider,
  Center,
  VStack,
  Modal,
} from "native-base";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  NavigationContainer,
  DrawerActions,
  useIsFocused,
} from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Login from "./src/components/Login";
import Main from "./src/components/Main";
import NewSellerPickup from "./src/components/newSeller/NewSellerPickup";
import SellerHandover from "./src/components/newSeller/SellerHandover";
import HandoverShipment from "./src/components/newSeller/HandoverShipment";
import OpenBags from "./src/components/newSeller/OpenBags";
import PendingHandover from "./src/components/newSeller/PendingHandover";
import NotPicked from "./src/components/newSeller/NotPicked";
import NotDelivered from "./src/components/newSeller/notDelivered";
import PendingWork from "./src/components/newSeller/PendingWork";
import HandOverSummary from "./src/components/newSeller/HandOverSummary";
import NewSellerSelection from "./src/components/newSeller/NewSellerSelection";
import ShipmentBarcode from "./src/components/newSeller/ShipmentBarcode";
import SellerDeliveries from "./src/components/newSeller/SellerDeliveries";
import SellerHandoverSelection from "./src/components/newSeller/SellerHandoverSelection";
import ScanShipment from "./src/components/newSeller/ScanShipment";
import CollectPOD from "./src/components/newSeller/CollectPOD";
import Dispatch from "./src/components/newSeller/Dispatch";
import MapScreen from "./src/components/MapScreen";
import Reject from "./src/components/RejectReason";
import POD from "./src/components/newSeller/POD";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ToastAndroid,
  PermissionsAndroid,
  Alert,
} from "react-native";
import { Badge } from "react-native-paper";
import Lottie from "lottie-react-native";
import { ProgressBar } from "@react-native-community/progress-bar-android";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import { openDatabase } from "react-native-sqlite-storage";
import NewSellerAdditionNotification from "./src/components/NewSellerAdditionNotification";
import StartEndDetails from "./src/components/StartEndDetails";
import SellerSelection from "./src/components/newSeller/SellerSelection";
import UpdateSellerCloseReasonCode from "./src/components/newSeller/UpdateSellerCloseReasonCode";
import CloseReasonCode from "./src/components/newSeller/CloseReasonCode";
import ReturnHandoverRejectionTag from "./src/components/newSeller/ReturnHandoverRejectionTag";
import HandoverShipmentRTO from "./src/components/newSeller/HandoverShipmentRTO";
import { LogBox } from "react-native";
import MyTrip from "./src/components/MyTrip";
import TripHistory from "./src/components/TripHistory";
import { backendUrl } from "./src/utils/backendUrl";
import messaging from "@react-native-firebase/messaging";
import { setIsNewSync } from "./src/redux/slice/isNewSync";
import {
  setToken,
  setUserEmail,
  setUserId,
  setUserName,
} from "./src/redux/slice/userSlice";
import { logout } from "react-native-app-auth";
import PushNotification from "react-native-push-notification";
import { setNotificationCount } from "./src/redux/slice/notificationSlice";

const db = openDatabase({ name: "rn_sqlite" });

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function StackNavigators({ navigation }) {
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.user.user_id);
  const notificationCount = useSelector((state) => state.notification.count);
  // const [notificationCount,setNotificationCount1]=useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isLogin, setIsLogin] = useState(false);
  const [lastSyncTime11, setLastSyncTime] = useState("");
  const [scannedStatus, SetScannedStatus] = useState(0);
  let m = 0;
  useEffect(() => {
    requestPermissions();
  }, []);
  const requestPermissions = async () => {
    try {
      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "This app needs access to your camera.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (cameraPermission !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Camera permission denied");
      }

      const storagePermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "This app needs access to your storage.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (storagePermission !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Storage permission denied");
      }

      messaging()
        .requestPermission()
        .then((permission) => {
          if (permission) {
            console.log("Notification permission granted");
            // messaging().getToken().then((token) => {
            // console.log('FCM Token:', token);
            // });
          } else {
            console.log("Notification permission denied");
          }
        });

      const locationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to your location.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (locationPermission !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Location permission denied");
      }
    } catch (error) {
      console.warn(error);
    }
  };

  function NotificationCountIncrease() {
    // dispatch(setNotificationCount(5));
    // dispatch(setNotificationCount(useSelector((state) => state.notification.count) + 1));
  }
  
console.log('Notification Count',notificationCount,' ',useSelector((state) => state.notification.count));
    // dispatch(setNotificationCount(useSelector((state) => state.notification.count) + 1));

// dispatch(setNotificationCount(41));
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log(remoteMessage.notification);
      // setNotificationCount1((prevCount)=>prevCount+1);
      const newvalue=notificationCount+1;
      dispatch(setNotificationCount(newvalue));
      // NotificationCountIncrease();
      PushNotification.localNotification({
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        channelId: "AdditionalWork_1",
      });
    });

    return unsubscribe;
  }, [dispatch, notificationCount]);

  useEffect(() => {
    PushNotification.createChannel({
      channelId: "AdditionalWork_1",
      channelName: "AdditionalWork_Channel",
    });
    PushNotification.configure({
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },

      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);

        navigation.navigate("NewSellerAdditionNotification");
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === "ios",
    });
  }, []);

  // useEffect(() => {
  //   const unsubscribe = messaging().onMessage(async (remoteMessage) => {
  //     // Handle FCM message here
  //   });

  //   const unsubscribeNotification = messaging().onNotificationOpenedApp(
  //     (notificationOpen) => {
  //       console.log(
  //         "Opened via notification11:",
  //         notificationOpen.notification
  //       );

  //       // navigation.navigate('NewSellerAdditionNotification');
  //     }
  //   );

  //   messaging()
  //     .getInitialNotification()
  //     .then((notificationOpen) => {
  //       if (notificationOpen) {
  //         console.log(
  //           "Opened via notification:",
  //           notificationOpen.notification
  //         );
  //         note11();
  //         // navigation.navigate('NewSellerAdditionNotification');
  //       } else {
  //         console.log("Opened normally");
  //       }
  //     });

  //   return () => {
  //     unsubscribe();
  //     unsubscribeNotification();
  //   };
  // }, []);

  const pull_API_Data = () => {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var datetime = "Last Sync\n" + hours + ":" + minutes + " " + ampm;
    setLastSyncTime(datetime);
    AsyncStorage.setItem("lastSyncTime112", datetime);

    console.log("api pull");
    loadAPI_Data1();
    loadAPI_Data2();
    // loadAPI_Data3();
    // loadAPI_Data4();
    // loadAPI_Data5();
    // loadAPI_Data6();
    // loadAPI_DataCD();
    createTableBag1();
    loadAPI_DataSF();

    const randomValue = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
    dispatch(setIsNewSync(randomValue));
  };
  useEffect(() => {
    // This useEffect  is use to hide warnings in mobile screen .
    // LogBox.ignoreLogs(['Warning: Each child in a list should have a unique "key" prop.']);
    LogBox.ignoreAllLogs(true);
  }, []);

  useEffect(() => {
    (async () => {
      if (userId) {
        pull_API_Data();
      } else {
        navigation.navigate("Login");
      }
    })();
  }, [userId]);

  // Sync button function
  const note11 = () => {
    if (!isLoading) {
      console.log("call notification");
      navigation.navigate("NewSellerAdditionNotification");
    }
  };

  useEffect(() => {
    if (userId !== null) {
      setTimeout(() => {
        Login_Data_load();
      }, 10);
    }
  }, [userId]);

  useEffect(() => {
    if (userId !== null) {
      AsyncStorage.getItem("lastSyncTime112")
        .then((data11) => {
          setLastSyncTime(data11);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [userId]);

  const Login_Data_load = () => {
    // console.log('Login Data Load called');
    AsyncStorage.getItem("apiDataLoaded")
      .then((data11) => {
        // console.log( 'Api Data Loaded value : ',data11);
        setIsLogin(data11);
        if (data11 === "false") {
          console.log("1st time call");
          pull_API_Data();
          AsyncStorage.setItem("apiDataLoaded", "true");
          // return;
        }
      })
      .catch((e) => {
        console.log(e);
      });
    AsyncStorage.getItem("lastSyncTime112")
      .then((data11) => {
        setLastSyncTime(data11);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  // console.log(userId);
  async function postSPSCalling(row) {
    console.log("===========row=========", {
      clientShipmentReferenceNumber: row.clientShipmentReferenceNumber,
      awbNo: row.awbNo,
      clientRefId: row.clientRefId,
      expectedPackagingId: row.packagingId,
      packagingId: row.expectedPackagingId,
      courierCode: row.courierCode,
      consignorCode: row.consignorCode,
      packagingAction: row.packagingAction,
      runsheetNo: row.runSheetNumber,
      shipmentAction: row.shipmentAction,
      feUserID: userId,
      rejectionReasonL1: row.rejectionReasonL1,
      rejectionReasonL2: row.rejectionReasonL2
        ? row.rejectionReasonL2
        : row.rejectionReasonL1,
      rejectionStage: 1,
      bagId: row.bagId,
      eventTime: parseInt(row.eventTime),
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      packagingStatus: 1,
      scanStatus:
        row.status == "accepted" ? 1 : row.status == "rejected" ? 2 : 0,
    });
    await axios
      .post(backendUrl + "SellerMainScreen/postSPS", {
        clientShipmentReferenceNumber: row.clientShipmentReferenceNumber,
        awbNo: row.awbNo,
        clientRefId: row.clientRefId,
        expectedPackagingId: row.packagingId,
        packagingId: row.expectedPackagingId,
        courierCode: row.courierCode,
        consignorCode: row.consignorCode,
        packagingAction: row.packagingAction,
        runsheetNo: row.runSheetNumber,
        shipmentAction: row.shipmentAction,
        feUserID: userId,
        rejectionReasonL1: row.rejectionReasonL1,
        rejectionReasonL2: row.rejectionReasonL2
          ? row.rejectionReasonL2
          : row.rejectionReasonL1,
        rejectionStage: 1,
        bagId: row.bagId,
        eventTime: parseInt(row.eventTime),
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        packagingStatus: 1,
        scanStatus:
          row.status == "accepted" ? 1 : row.status == "rejected" ? 2 : 0,
      })
      .then((response) => {
        console.log("sync Successfully pushed");
        console.log(response);
        db.transaction((tx) => {
          tx.executeSql(
            'UPDATE SellerMainScreenDetails SET syncStatus="done" WHERE clientShipmentReferenceNumber = ?',
            [row.clientShipmentReferenceNumber],
            (tx1, results) => {
              let temp = [];
              console.log(
                "===========Local Sync Status Results==========",
                results.rowsAffected
              );
              if (results.rowsAffected > 0) {
                console.log("Sync status done in localDB");
              } else {
                console.log(
                  "Sync Status not changed in localDB or already synced"
                );
              }
            }
          );
        });
      })
      .catch((error) => {
        setIsLoading(false);
        console.log("sync error", { error });
      });
  }

  async function postSPS(data) {
    await data.map((row) => {
      postSPSCalling(row);
    });
    pull_API_Data();
  }

  const push_Data = () => {
    console.log(
      "push data function",
      new Date().toJSON().slice(0, 10).replace(/-/g, "/")
    );

    Login_Data_load();

    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var time = hours + ":" + minutes + " " + ampm;
    var datetime = "Last Sync\n" + hours + ":" + minutes + " " + ampm;
    setLastSyncTime(datetime);
    AsyncStorage.setItem("lastSyncTime112", datetime);

    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM SellerMainScreenDetails WHERE status IS NOT Null AND syncStatus IS Null",
        [],
        (tx1, results) => {
          if (results.rows.length > 0) {
            ToastAndroid.show("Synchronizing data...", ToastAndroid.SHORT);
            let temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push(results.rows.item(i));
            }
            postSPS(temp);
            setIsLoading(false);
            ToastAndroid.show(
              "Synchronizing data finished",
              ToastAndroid.SHORT
            );
          } else {
            console.log("Only Pulling Data.No data to push...");
            pull_API_Data();
          }
        }
      );
    });
  };

  const sync11 = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected && state.isInternetReachable) {
        push_Data();
      } else {
        ToastAndroid.show("You are Offline!", ToastAndroid.SHORT);
      }
    });
  };

  /*              Press (Ctrl + k + 2) keys together for better API tables view in App.js (VSCode) */

  // Table 1
  const createTables1 = () => {
    db.transaction((txn) => {
      // txn.executeSql('DROP TABLE IF EXISTS SyncSellerPickUp', []);
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS SyncSellerPickUp( consignorCode ID VARCHAR(200) PRIMARY KEY ,userId VARCHAR(100), 
            consignorName VARCHAR(200),consignorAddress1 VARCHAR(200),consignorAddress2 VARCHAR(200),consignorCity VARCHAR(200),consignorPincode,consignorLatitude INT(20),consignorLongitude DECIMAL(20,10),consignorContact VARCHAR(200),ReverseDeliveries INT(20),runSheetNumber VARCHAR(200),ForwardPickups INT(20), BagOpenClose11 VARCHAR(200), ShipmentListArray VARCHAR(800),contactPersonName VARCHAR(100),otpSubmitted VARCHAR(50),otpSubmittedDelivery VARCHAR(50))`,
        [],
        (sqlTxn, res) => {
          // console.log("table created successfully1212");
          // loadAPI_Data();
        },
        (error) => {
          console.log("error on creating table " + error.message);
        }
      );
    });
  };
  const loadAPI_Data1 = () => {
    setIsLoading(!isLoading);
    createTables1();
    (async () => {
      await axios
        .get(backendUrl + `SellerMainScreen/consignorsList/${userId}`)
        .then(
          (res) => {
            console.log("API 1 OK: " + res.data.data.length);
            // console.log(res);
            for (let i = 0; i < res.data.data.length; i++) {
              // let m21 = JSON.stringify(res.data[i].consignorAddress, null, 4);

              db.transaction((txn) => {
                txn.executeSql(
                  "SELECT * FROM SyncSellerPickUp where consignorCode = ?",
                  [res.data.data[i].consignorCode],
                  (tx, result) => {
                    if (result.rows.length <= 0) {
                      db.transaction((txn) => {
                        txn.executeSql(
                          "INSERT OR REPLACE INTO SyncSellerPickUp( contactPersonName,consignorCode ,userId ,consignorName,consignorAddress1,consignorAddress2,consignorCity,consignorPincode,consignorLatitude,consignorLongitude,consignorContact,ReverseDeliveries,runSheetNumber,ForwardPickups,BagOpenClose11, ShipmentListArray,otpSubmitted,otpSubmittedDelivery) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                          [
                            res.data.data[i].contactPersonName,
                            res.data.data[i].consignorCode,
                            userId,
                            res.data.data[i].consignorName,
                            res.data.data[i].consignorAddress1,
                            res.data.data[i].consignorAddress2,
                            res.data.data[i].consignorCity,
                            res.data.data[i].consignorPincode,
                            res.data.data[i].consignorLatitude,
                            res.data.data[i].consignorLongitude,
                            res.data.data[i].consignorContact,
                            res.data.data[i].ReverseDeliveries,
                            res.data.data[i].runsheetNo,
                            res.data.data[i].ForwardPickups,
                            "true",
                            " ",
                            "false",
                            "false",
                          ],
                          (sqlTxn, _res) => {
                            console.log(
                              "\n Data Added to local db successfully1212"
                            );
                            // console.log(res);
                          },
                          (error) => {
                            console.log(
                              "error on loading  data from api SellerMainScreen/consignorslist/" +
                                error.message
                            );
                          }
                        );
                      });
                    }
                  }
                );
              });
            }
            viewDetails1();
            m++;
            // console.log('value of m1 '+m);
            AsyncStorage.setItem("load11", "notload");
            setIsLoading(false);
          },
          (error) => {
            console.log("error api SellerMainScreen/consignorslist/", error);
          }
        );
    })();
  };
  const viewDetails1 = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM SyncSellerPickUp", [], (tx1, results) => {
        let temp = [];
        // console.log(results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));

          console.log(results.rows.item(i).contactPersonName);
          // var address121 = results.rows.item(i).consignorAddress;
          // var address_json = JSON.parse(address121);
          // console.log(typeof (address_json));
          // console.log("Address from local db : " + address_json.consignorAddress1 + " " + address_json.consignorAddress2);
          // ToastAndroid.show('consignorName:' + results.rows.item(i).consignorName + "\n" + 'PRSNumber : ' + results.rows.item(i).PRSNumber, ToastAndroid.SHORT);
        }
        if (m === 3) {
          ToastAndroid.show("Sync Successful", ToastAndroid.SHORT);
          setIsLoading(false);
          setIsLogin(true);
          AsyncStorage.setItem("apiDataLoaded", "true");
          console.log("All " + m + " APIs loaded successfully ");
          m = 0;

          AsyncStorage.setItem("refresh11", "refresh");
        } else {
          console.log("Only " + m + " APIs loaded out of 3 ");
        }
        // m++;
        // ToastAndroid.show("Sync Successful",ToastAndroid.SHORT);
        // console.log('Data from Local Database : \n ', JSON.stringify(temp, null, 4));
        // console.log('data loaded API 1',temp);
        // console.log('Table1 DB OK:', temp.length);
      });
    });
  };

  // Table 2
  const createTables2 = () => {
    db.transaction((txn) => {
      // txn.executeSql('DROP TABLE IF EXISTS SellerMainScreenDetails', []);
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS SellerMainScreenDetails( 
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clientShipmentReferenceNumber VARCHAR(200),
          clientRefId VARCHAR(200),
          awbNo VARCHAR(200),
          courierCode VARCHAR(200),
          consignorCode VARCHAR(200),
          packagingStatus VARCHAR(200),
          packagingId VARCHAR(200),
          expectedPackagingId VARCHAR(200),
          runSheetNumber VARCHAR(200),
          shipmentStatus VARCHAR(200),
          shipmentAction VARCHAR(200),
          rejectionReasonL1 VARCHAR(200),
          rejectionReasonL2 VARCHAR(200),
          rejectionStage VARCHAR(200),
          eventTime VARCHAR(200),
          status VARCHAR(200),
          handoverStatus VARCHAR(200),
          syncStatus VARCHAR(200),
          syncHandoverStatus VARCHAR(200),
          latitude VARCHAR(200),
          longitude VARCHAR(200),
          bagId VARCHAR(200),
          packagingAction VARCHAR(200)
          )`,
        [],
        (sqlTxn, res) => {
          console.log("table created successfully SellerMainScreenDetails");
          // loadAPI_Data();
        },
        (error) => {
          console.log("error on creating table " + error.message);
        }
      );
    });
  };

  const loadAPI_Data2 = () => {
    setIsLoading(!isLoading);
    (async () => {
      await axios.get(backendUrl + `SellerMainScreen/workload/${userId}`).then(
        (res) => {
          createTables2();
          console.log("API 2 OK: " + res.data.data.length);
          for (let i = 0; i < res.data.data.length; i++) {
            db.transaction((txn) => {
              txn.executeSql(
                "SELECT * FROM SellerMainScreenDetails where clientShipmentReferenceNumber = ?",
                [res.data.data[i].clientShipmentReferenceNumber],
                (tx, result) => {
                  if (result.rows.length <= 0) {
                    db.transaction((txn) => {
                      txn.executeSql(
                        `INSERT OR REPLACE INTO SellerMainScreenDetails( 
                          clientShipmentReferenceNumber,
                          clientRefId,
                          awbNo,
                          courierCode,
                          consignorCode,
                          packagingStatus,
                          packagingId,
                          expectedPackagingId,
                          runSheetNumber,
                          shipmentStatus,
                          shipmentAction,
                          rejectionReasonL1,
                          rejectionReasonL2,
                          rejectionStage,
                          eventTime,
                          status,
                          handoverStatus,
                          syncStatus,
                          syncHandoverStatus,
                          bagId,
                          packagingAction
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                        [
                          res.data.data[i].clientShipmentReferenceNumber,
                          res.data.data[i].clientRefId,
                          res.data.data[i].awbNo,
                          res.data.data[i].courierCode,
                          res.data.data[i].consignorCode,
                          res.data.data[i].packagingStatus,
                          res.data.data[i].expectedPackagingId,
                          res.data.data[i].scannedPackageingId,
                          res.data.data[i].runsheetNo,
                          res.data.data[i].shipmentStatus,
                          res.data.data[i].shipmentAction,
                          "",
                          "",
                          0,
                          res.data.data[i].actionTime,
                          res.data.data[i].shipmentStatus == "PUS" ||
                          res.data.data[i].shipmentStatus == "PUC" ||
                          res.data.data[i].shipmentStatus == "DLR" ||
                          res.data.data[i].shipmentStatus == "RDS"
                            ? "accepted"
                            : res.data.data[i].shipmentStatus == "PUR" ||
                              res.data.data[i].shipmentStatus == "RDR" ||
                              res.data.data[i].shipmentStatus == "UDU" ||
                              res.data.data[i].shipmentStatus == "PUF"
                            ? "rejected"
                            : null,
                          // null,
                          res.data.data[i].handoverStatus == 1
                            ? "accepted"
                            : res.data.data[i].handoverStatus == 2
                            ? "rejected"
                            : null,
                          null,
                          null,
                          "",
                          res.data.data[i].packagingAction,
                        ],
                        (sqlTxn, _res) => {
                          // console.log(`\n Data Added to local db successfully`);
                          // console.log(res);
                        },
                        (error) => {
                          console.log("error on adding data " + error.message);
                        }
                      );
                    });
                  }
                }
              );
            });
          }
          m++;
          // console.log('value of m2 '+m);
          // setIsLoading(false);
        },
        (error) => {
          console.log(error);
        }
      );
    })();
  };

  const createTablesSF = () => {
    db.transaction((txn) => {
      // txn.executeSql('DROP TABLE IF EXISTS ShipmentFailure', []);
      txn.executeSql(
        "CREATE TABLE IF NOT EXISTS ShipmentFailure(_id VARCHAR(24) PRIMARY KEY,description VARCHAR(255),parentCode VARCHAR(20), short_code VARCHAR(20), consignor_failure BOOLEAN, fe_failure BOOLEAN, operational_failure BOOLEAN, system_failure BOOLEAN, enable_geo_fence BOOLEAN, enable_future_scheduling BOOLEAN, enable_otp BOOLEAN, enable_call_validation BOOLEAN, created_by VARCHAR(10), last_updated_by VARCHAR(10), applies_to VARCHAR(255),life_cycle_code INT(20), __v INT(10))",
        [],
        (sqlTxn, res) => {
          console.log("table ShipmentFailure created successfully");
          // loadAPI_Data();
        },
        (error) => {
          console.log("error on creating table " + error.message);
        }
      );
    });
  };
  const loadAPI_DataSF = () => {
    // setIsLoading(!isLoading);
    createTablesSF();
    (async () => {
      await axios.get(backendUrl + "ADshipmentFailure/getList").then(
        (res) => {
          // console.log('Table6 API OK: ' + res.data.data.length);
          // console.log(res.data);
          for (let i = 0; i < res.data.data.length; i++) {
            // const appliesto=JSON.parse(JSON.stringify(res.data.data[i].appliesTo))
            const appliesto = String(res.data.data[i].appliesTo.slice());
            db.transaction((txn) => {
              txn.executeSql(
                `INSERT OR REPLACE INTO ShipmentFailure(_id ,description , parentCode, short_code , consignor_failure , fe_failure , operational_failure , system_failure , enable_geo_fence , enable_future_scheduling , enable_otp , enable_call_validation, created_by , last_updated_by, applies_to ,life_cycle_code , __v
                          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                  res.data.data[i]._id,
                  res.data.data[i].description,
                  res.data.data[i].parentCode,
                  res.data.data[i].shortCode,
                  res.data.data[i].consignorFailure,
                  res.data.data[i].feFailure,
                  res.data.data[i].operationalFailure,
                  res.data.data[i].systemFailure,
                  res.data.data[i].enableGeoFence,
                  res.data.data[i].enableFutureScheduling,
                  res.data.data[i].enableOTP,
                  res.data.data[i].enableCallValidation,
                  res.data.data[i].createdBy,
                  res.data.data[i].lastUpdatedBy,
                  appliesto,
                  res.data.data[i].lifeCycleCode,
                  res.data.data[i].__v,
                ],
                (sqlTxn, _res) => {
                  // console.log('\n Data Added to local db 6 ');
                  // console.log(res);
                },
                (error) => {
                  console.log("error on adding data " + error.message);
                }
              );
            });
          }
          m++;
          // console.log('value of m6 '+m);

          // viewDetailsSF();
          // setIsLoading(false);
        },
        (error) => {
          console.log(error);
        }
      );
    })();
  };

  const createTableBag1 = () => {
    // AsyncStorage.setItem("acceptedItemData", "");
    db.transaction((tx) => {
      // tx.executeSql('DROP TABLE IF EXISTS closeHandoverBag1', []);
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS closeHandoverBag1 (bagSeal TEXT , bagId TEXT PRIMARY KEY, bagDate TEXT, AcceptedList TEXT,status TEXT,consignorCode Text,consignorName Text)",
        [],
        (tx, results) => {
          console.log("Table created successfully");
        },
        (error) => {
          console.log("Error occurred while creating the table:", error);
        }
      );
    });
  };

  const viewDetailsSF = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM ShipmentFailure", [], (tx1, results) => {
        let temp = [];
        // console.log(results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        console.log("1173", temp);
        // if (m <= 6){
        //   // ToastAndroid.show('Sync Successful',ToastAndroid.SHORT);
        //   console.log('Waiting for ' + ( 7 - m ) + ' API to load. Plz wait...');
        //   // m = 0;
        // }
        //  else {
        //   console.log('Only ' + m + ' APIs loaded out of 6 ');
        // }
        // console.log('Data from Local Database 6 : \n ', temp);
        // console.log('TableSF DB OK:', temp.length);
      });
    });
  };

  return (
    <NativeBaseProvider>
      <Stack.Navigator
        initialRouteName={"Main"}
        key={"Main"}
        screenOptions={{
          headerStyle: {
            backgroundColor: "#004aad",
            // elevation: 0,
          },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
            // alignSelf: 'center',
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            header: () => null,
          }}
        />
        <Stack.Screen
          name="SellerSelection"
          component={SellerSelection}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Notification
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
          }}
        />

        <Stack.Screen
          name="CloseReasonCode"
          component={CloseReasonCode}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Notification
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
          }}
        />

        <Stack.Screen
          name="UpdateSellerCloseReasonCode"
          component={UpdateSellerCloseReasonCode}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Notification
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
          }}
        />

        <Stack.Screen
          name="ReturnHandoverRejectionTag"
          component={ReturnHandoverRejectionTag}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Notification
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
          }}
        />

        <Stack.Screen
          name="Main"
          component={Main}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Welcome,
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                    // navigation.dispatch(DrawerActions.openDrawer());
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />

        <Stack.Screen
          name="NewSellerPickup"
          component={NewSellerPickup}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Seller Pickups
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                    // navigation.dispatch(DrawerActions.openDrawer());
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
            //  headerRight: () => (
            //         <NativeBaseProvider>
            //       {/* //     <Button  leftIcon={<Icon as={MaterialIcons} name="sync" size="sm" />} > Sync</Button> */}
            //       <Button leftIcon={<Icon as={MaterialIcons} name="sync" size="sm" color="white" />}onPress={() => sync11()
            //     }
            //       style={{
            //         marginTop:8.5,marginBottom:8, marginLeft: 10,marginRight:12,backgroundColor: '#004aad',width:30,height:38,alignSelf: 'center',
            //         borderRadius: 10,
            // }}
            // title="sync" name='Sync' ></Button>
            //       </NativeBaseProvider>
            //       )
          }}
        />
        <Stack.Screen
          name="SellerHandover"
          component={SellerHandover}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Seller Handover
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="HandoverShipment"
          component={HandoverShipment}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Shipment
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="OpenBags"
          component={OpenBags}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Open Bags
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="PendingHandover"
          component={PendingHandover}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Pending Handover
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="PendingWork"
          component={PendingWork}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Pending Work
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="NotPicked"
          component={NotPicked}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Pending Work
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="NotDelivered"
          component={NotDelivered}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Pending Work
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="HandOverSummary"
          component={HandOverSummary}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Handover Summary
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />

        <Stack.Screen
          name="HandoverShipmentRTO"
          component={HandoverShipmentRTO}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Handover Scan
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />

        <Stack.Screen
          name="NewSellerSelection"
          component={NewSellerSelection}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Seller Summary
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />

        <Stack.Screen
          name="ShipmentBarcode"
          component={ShipmentBarcode}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Scan Products
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="SellerDeliveries"
          component={SellerDeliveries}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Seller Deliveries
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="SellerHandoverSelection"
          component={SellerHandoverSelection}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Seller Handover
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="ScanShipment"
          component={ScanShipment}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Scan Shipment
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>
                  {lastSyncTime11}
                </Text>
                <TouchableOpacity
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    sync11();
                  }}
                >
                  <MaterialIcons
                    name="sync"
                    style={{ fontSize: 30, color: "white", marginTop: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="CollectPOD"
          component={CollectPOD}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Seller Deliveries
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                {/* <Text style={{fontSize: 12, color: 'white'}}>{lastSyncTime11}</Text>
                <TouchableOpacity
                  style={{marginRight: 15}}
                  onPress={() => {
                    sync11();
                  }}>
                  <MaterialIcons
                    name="sync"
                    style={{fontSize: 30, color: 'white',marginTop:5}}
                  />
                </TouchableOpacity> */}
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{
                      fontSize: 30,
                      color: "white",
                      marginRight: 5,
                      marginTop: 5,
                    }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="Dispatch"
          component={Dispatch}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Bag to Dispatch
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
          }}
        />

        <Stack.Screen
          name="MapScreen"
          component={MapScreen}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Map Navigation
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                {/* <TouchableOpacity
                  style={{marginRight: 15}}
                  onPress={() => {
                    sync11();
                  }}>
                  <MaterialIcons
                    name="sync"
                    style={{fontSize: 30, color: 'white'}}
                  /> */}
                {/* </TouchableOpacity> */}
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewSellerAdditionNotification");
                  }}
                >
                  <MaterialIcons
                    name="bell-outline"
                    style={{ fontSize: 30, color: "white", marginRight: 5 }}
                  />
                  {notificationCount ? (
                    <Badge
                      style={{
                        position: "absolute",
                        fontSize: 15,
                        borderColor: "white",
                        borderWidth: 1,
                      }}
                    >
                      {notificationCount}
                    </Badge>
                  ) : null}
                </TouchableOpacity>
              </View>
            ),
          }}
        />

        <Stack.Screen
          name="TripHistory"
          component={TripHistory}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    TripHistory
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
          }}
        />

        <Stack.Screen
          name="reject"
          component={Reject}
          options={{
            header: () => null,
          }}
        />

        <Stack.Screen
          name="POD"
          component={POD}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Pickup Summary
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
          }}
        />

        <Stack.Screen
          name="MyTrip"
          component={MyTrip}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    My Trip
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
          }}
        />

        <Stack.Screen
          name="StartEndDetails"
          component={StartEndDetails}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Trip Details
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
          }}
        />

        <Stack.Screen
          name="NewSellerAdditionNotification"
          component={NewSellerAdditionNotification}
          options={{
            headerTitle: (props) => (
              <NativeBaseProvider>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -15,
                  }}
                >
                  <MaterialIcons
                    name="menu"
                    style={{ fontSize: 30, marginLeft: 10, color: "white" }}
                    onPress={() => navigation.toggleDrawer()}
                  />
                  <Heading style={{ color: "white", marginLeft: 10 }} size="md">
                    Notification
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
          }}
        />
      </Stack.Navigator>

      {isLoading && userId && userId.length > 0 && isLogin ? (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1,
              backgroundColor: "rgba(0,0,0,0.65)",
            },
          ]}
        >
          <Text style={{ color: "white" }}>Syncing Data. Please Wait...</Text>
          <Lottie
            source={require("./src/assets/loading11.json")}
            autoPlay
            loop
            speed={1}
          />
          <ProgressBar width={70} />
        </View>
      ) : null}
    </NativeBaseProvider>
  );
}

function CustomDrawerContent({ navigation }) {
  const dispatch = useDispatch();

  const [language, setLanguage] = useState("");

  const email = useSelector((state) => state.user.user_email);
  const id = useSelector((state) => state.user.user_id);
  const name = useSelector((state) => state.user.user_name);
  const idToken = useSelector((state) => state.user.idToken);
  const token = useSelector((state) => state.user.token);

  const LogoutHandle = async () => {
    try {
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("name");
      await AsyncStorage.removeItem("email");
      await AsyncStorage.removeItem("token");

      dispatch(setUserId(""));
      dispatch(setUserEmail(""));
      dispatch(setUserName(""));
      dispatch(setToken(""));
    } catch (e) {
      console.log(e);
    }
    try {
      await AsyncStorage.multiRemove(await AsyncStorage.getAllKeys());
      console.log("AsyncStorage cleared successfully!");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }

    db.transaction((tx) => {
      tx.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        [],
        (tx1, result) => {
          console.log(result);
          let i = 0;
          for (i = 0; i < result.rows.length; i++) {
            const tableName = result.rows.item(i).name;
            console.log(tableName);
            tx.executeSql(`DROP TABLE IF EXISTS ${tableName}`);
          }
          if (i === result.rows.length) {
            console.log("SQlite DB cleared successfully!");
          }
        }
      );
    });

    await logout(
      { issuer: "https://uacc.logistiex.com/realms/Logistiex-Demo" },
      {
        idToken: idToken,
        postLogoutRedirectUrl: "com.demoproject.app://Login",
      }
    )
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log("Logout Error", err);
      });
  };

 
  return (
    <NativeBaseProvider>
      <TouchableOpacity
        onPress={()=>{navigation.closeDrawer();}}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1, 
        }}
      >
        <MaterialIcons name="close" size={26} color="black" /> 
      </TouchableOpacity>
      {email ? (
        <Box pt={5} px={5} key={"extra" + email}>
          <Center>
            <Avatar bg="white" size="xl" 
      >
              <MaterialIcons
                name="account"
                style={{ fontSize: 95, color: "#004aad" }}
              />
            </Avatar>
            <Heading mt={4} size="md" color="gray.800">
              {name}
            </Heading>
            <Text mt={1} color="gray.600">
              {email}
            </Text>
          </Center>
          <Button
            mt={4}
            onPress={() => {
              LogoutHandle();
  
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [
                    { name: "Login" },
                  ],
                })
              );
  
              navigation.closeDrawer();
            }}
            style={{ backgroundColor: "#004aad" ,justifyContent: 'flex-start', alignItems: 'flex-start',paddingLeft:20}}
            startIcon={
              <MaterialIcons
                name="logout"
                style={{ fontSize: 20, color: "white" }}
              />
            }
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Box pt={5} px={5}>
          <Button
            onPress={() => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [
                    { name: "Login" },
                  ],
                })
              );
  
              navigation.closeDrawer();
            }}
            style={{ backgroundColor: "#004aad" ,justifyContent: 'flex-start', alignItems: 'flex-start',paddingLeft:20 }}
            startIcon={
              <MaterialIcons
                name="login"
                style={{ fontSize: 20, color: "white" }}
              />
            }
          >
            Login
          </Button>
        </Box>
      )}
      {email ? (
        <View >
          <Divider my={5} height={1.5}/>
          <Box px={5}>
            <Button
              variant="outline"
              onPress={() => {
                navigation.navigate("Main");
                navigation.closeDrawer();
              }}
              style={{ color: "#004aad", borderColor: "#004aad" ,justifyContent: 'flex-start', alignItems: 'flex-start',paddingLeft:20 }}
              startIcon={
                <MaterialIcons
                  name="home"
                  style={{ fontSize: 20, color: "#004aad" }}
                />
              }
            >
              <Text style={{ color: "#004aad" }}>Home</Text>
            </Button>
            <Button
              variant="outline"
              onPress={() => {
                navigation.navigate("MyTrip", { userId: id });
                navigation.closeDrawer();
              }}
              mt={4}
              style={{ color: "#004aad", borderColor: "#004aad",justifyContent: 'flex-start', alignItems: 'flex-start',paddingLeft:20 }}
              startIcon={
                // <MaterialIcons
                //   name="motorbike"
                //   style={{ fontSize: 20, color: "#004aad" }}
                // />
                <Icon name="motorcycle" size={18} color="#004aad" />
              }
            >
              <Text style={{ color: "#004aad" }}>My Trip</Text>
            </Button>
            <Button
              variant="outline"
              onPress={() => {
                navigation.navigate("NewSellerAdditionNotification", {
                  userId: id,
                });
                navigation.closeDrawer();
              }}
              mt={4}
              style={{ color: "#004aad", borderColor: "#004aad" ,justifyContent: 'flex-start', alignItems: 'flex-start',paddingLeft:20}}
              startIcon={
                // <>
                //  <MaterialIcons
                //    name="briefcase"
                //    style={{ fontSize: 20, color: "#004aad" }}
                // />
                <Icon name="briefcase" size={18} color="#004aad" />
            //  </> 
             }
            >
              <Text style={{ color: "#004aad" }}>Additional Workload</Text>
            </Button>
          </Box>
        </View>
      ) : null}
      <Divider my={5} height={1.5}/>
      <Box px={5}>
        <Select
          selectedValue={language}
          minWidth={200}
          accessibilityLabel="Choose Language"
          placeholder="Choose Language"
          _selectedItem={{ bg: "#004aad", color: "white" }}
          mt={0}
          onValueChange={(itemValue) => setLanguage(itemValue)}
          InputLeftElement={
            <Icon name="language" style={{ fontSize: 20, color: "#004aad" ,justifyContent: 'flex-start', alignItems: 'flex-start',paddingLeft:20 }} />
            // <MaterialIcons
            //   name="translate"
            //   style={{ fontSize: 20, color: "#004aad", marginRight: 5 }}
            // />
          } 
        >
          <Select.Item label="English (US)" value="English" />
          <Select.Item label="Hindi (हिन्दी)" value="Hindi" />
          <Select.Item label="Marathi (मराठी)" value="Marathi" />
          <Select.Item label="Urdu (اردو )" value="Urdu" />
          <Select.Item label="Telugu (తెలుగు )" value="Telugu" />
          <Select.Item label="Tamil (தமிழ் )" value="Tamil" />
        </Select>
      </Box>
      <Center
        bottom={0}
        position="absolute"
        left="17%"
        _text={{ color: 'gray.400', fontSize: 'xs' }}
      >
        <Image
          style={{ width: 190, height: 150 }}
          source={require('./src/assets/image.png')}
          alt="Logo Image"
        />
      </Center>
    </NativeBaseProvider>
  );
  
  
}

export default function App({ navigation }) {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="home"
          key={"home"}
          drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
          <Drawer.Screen
            name="home"
            component={StackNavigators}
            options={{
              header: () => null,
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
