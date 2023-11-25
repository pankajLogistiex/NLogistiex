/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import "react-native-gesture-handler";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./src/redux/store";
import { useRoute } from "@react-navigation/native";

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
  HStack,
} from "native-base";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/FontAwesome";
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
  ScrollView,
} from "react-native";
import { Badge } from "react-native-paper";
import Lottie from "lottie-react-native";
import { ProgressBar } from "@react-native-community/progress-bar-android";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import { openDatabase } from "react-native-sqlite-storage";
import NewSellerAdditionNotification from "./src/components/NewSellerAdditionNotification";
import DeviceInfoScreen from "./src/components/newSeller/DeviceInfoScreen";
import StartEndDetails from "./src/components/StartEndDetails";
import SellerSelection from "./src/components/newSeller/SellerSelection";
import UpdateSellerCloseReasonCode from "./src/components/newSeller/UpdateSellerCloseReasonCode";
import CloseReasonCode from "./src/components/newSeller/CloseReasonCode";
import ReturnHandoverRejectionTag from "./src/components/newSeller/ReturnHandoverRejectionTag";
import HandoverShipmentRTO from "./src/components/newSeller/HandoverShipmentRTO";
import { LogBox } from "react-native";
import MyTrip from "./src/components/MyTrip";
import TripHistory from "./src/components/TripHistory";
import TripSummary from "./src/components/TripSummary";
import { backendUrl } from "./src/utils/backendUrl";
import messaging from "@react-native-firebase/messaging";
import { setIsNewSync } from "./src/redux/slice/isNewSync";
import { setCurrentDeviceInfo } from "./src/redux/slice/deviceInfoSlice";
import {
  setIdToken,
  setToken,
  setUserEmail,
  setUserId,
  setUserName,
} from "./src/redux/slice/userSlice";
import { setCurrentDateValue } from "./src/redux/slice/currentDateSlice";
import { setAdditionalWorkloadData } from "./src/redux/slice/additionalWorkloadSlice";
import { logout, refresh } from "react-native-app-auth";
import PushNotification from "react-native-push-notification";
import { setNotificationCount } from "./src/redux/slice/notificationSlice";
import BackgroundTimer from "react-native-background-timer";
import {
  setForceSync,
  setSyncTime,
  setSyncTimeFull,
} from "./src/redux/slice/autoSyncSlice";
import DeviceInfo from "react-native-device-info";
import * as RNLocalize from "react-native-localize";
import GetLocation from "react-native-get-location";
import { callApi } from "./src/components/ApiError";
import { autoSyncTime } from "./src/utils/autoSyncTime";
import { getAuthorizedHeaders } from "./src/utils/headers";
import jwtDecode from "jwt-decode";
const db = openDatabase({ name: "rn_sqlite" });

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function StackNavigators({ navigation }) {
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.user.user_id);
  const notificationCount = useSelector((state) => state.notification.count);
  // const [notificationCount,setNotificationCount1]=useState(0);
  const syncTime = useSelector((state) => state.autoSync.syncTime);
  const forceSync = useSelector((state) => state.autoSync.forceSync);
  const token = useSelector((state) => state.user.token);
  const isAutoSyncEnable = useSelector(
    (state) => state.autoSync.isAutoSyncEnable
  );

  const todayDate =
    // useSelector((state) => state.currentDate.currentDateValue) ||
    new Date().toISOString().split("T")[0];
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [isLoadingSF, setIsLoadingSF] = useState(false);
  const [isLoading4, setIsLoading4] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [tripID, setTripID] = useState("");
  const [showModal11, setShowModal11] = useState(false);
  const [dataN, setDataN] = useState([]);
  const [currentDateValue, setCurrentDateValue] = useState(todayDate);

  function createTables() {
    createConsignorListTable();
    createWorkloadTable();
    createTripDetailTable();
    createNofiticationTable();
    createShipmentFailureTable();
    createCloseBagTable();
    createCloseBagHandoverTable();
  }

  useEffect(() => {
    createTables();
  }, [userId]);

  async function syncData() {
    try {
      await getUserTripInfoApiCall();
      await AdditionalWorkloadApiCall();
      await getFailureReasonApiCall();
    } catch (error) {
      console.log("Error in API calls:", error);
    }
  }

  useEffect(() => {
    if (userId) {
      syncData();
    }
  }, [userId, token]);

  const formatDate = (dateArray) => {
    const [mm, dd, yyyy] = dateArray;
    return `${yyyy}-${mm?.padStart(2, "0")}-${dd?.padStart(2, "0")}`;
  };

  async function getWorkloadData(syncType = "manual") {
    if (syncType != "auto") {
      setSyncLoading(true);
    }
    const currentDate = new Date();
    const currentEpochTime = currentDate.getTime();

    const tripDate = new Date(parseInt(tripID?.split("-")[1]));
    const todayDate = new Date(currentEpochTime);

    // if (
    //   formatDate(tripDate.toLocaleString().split(",")[0].split("/")) !=
    //   formatDate(todayDate.toLocaleString().split(",")[0].split("/"))
    // ) {
    //   db.transaction((tx) => {
    //     tx.executeSql(
    //       "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    //       [],
    //       (tx1, result) => {
    //         for (let i = 0; i < result.rows.length; i++) {
    //           const tableName = result.rows.item(i).name;
    //           tx1.executeSql(`DELETE FROM ${tableName}`);
    //           // console.log(`Cleared data from table: ${tableName}`);
    //         }
    //         console.log("SQLite DB data cleared successfully!");
    //       }
    //     );
    //   });
    //   setIsLoading1(false);
    //   setIsLoading2(false);
    //   setIsLoading4(false);
    //   setIsLoadingSF(false);
    //   setSyncLoading(false);
    // } else {
    if (userId) {
      await getUserTripInfoApiCall(syncType);
    }
    if (
      tripID &&
      userId &&
      userId == tripID.split("-")[0] &&
      formatDate(tripDate.toLocaleString().split(",")[0].split("/")) ==
        formatDate(todayDate.toLocaleString().split(",")[0].split("/"))
    ) {
      await getConsignorListApiCall(syncType);
      await getWorkloadApiCall(syncType);
    }
    // }
    setSyncLoading(false);
  }

  useEffect(() => {
    setCurrentDateValue(new Date().toISOString().split("T")[0]);
    sync11();
  }, [tripID, token, userId, currentDateValue]);

  useEffect(() => {
    if (userId && tripID) {
      console.log(
        "App.js/AutoSync ",
        "===Background Task Run UseEffect Called==="
      );
      const timer = BackgroundTimer.runBackgroundTimer(() => {
        sync11("auto");
        console.log("App.js/AutoSync/ ", "===Auto sync called===");
      }, autoSyncTime);

      return () => {
        BackgroundTimer.stopBackgroundTimer(timer);
      };
    }
  }, [userId, tripID]);

  useEffect(() => {
    if (forceSync) {
      sync11();
      console.log("App.js/forceSync/ ", "===Force sync called===");
    }
  }, [forceSync, token]);

  const createConsignorListTable = () => {
    db.transaction((txn) => {
      // txn.executeSql('DROP TABLE IF EXISTS SyncSellerPickUp', []);
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS SyncSellerPickUp( consignorCode VARCHAR(200) ,userId VARCHAR(100), 
            consignorName VARCHAR(200),sellerIndex INT(20),consignorAddress1 VARCHAR(200),consignorAddress2 VARCHAR(200),consignorCity VARCHAR(200),consignorPincode,consignorLatitude INT(20),consignorLongitude DECIMAL(20,10),consignorContact VARCHAR(200),ReverseDeliveries INT(20),runSheetNumber VARCHAR(200),ForwardPickups INT(20), BagOpenClose11 VARCHAR(200), ShipmentListArray VARCHAR(800),contactPersonName VARCHAR(100),otpSubmitted VARCHAR(50),otpSubmittedDelivery VARCHAR(50), stopId VARCHAR(200) PRIMARY KEY, FMtripId VARCHAR(200),date Text)`,
        [],
        (sqlTxn, res) => {
          // console.log("App.js/ ", "table created successfully consignorList");
          // loadAPI_Data();
        },
        (error) => {
          console.log(
            "App.js/createConsignorListTable ",
            "error on creating table " + error.message
          );
        }
      );
    });
  };

  const createWorkloadTable = () => {
    db.transaction((txn) => {
      // txn.executeSql('DROP TABLE IF EXISTS SellerMainScreenDetails', []);
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS SellerMainScreenDetails( 
          clientShipmentReferenceNumber id VARCHAR(200) PRIMARY KEY,
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
          packagingAction VARCHAR(200),
          postRDStatus VARCHAR(200),
          stopId VARCHAR(200),
          FMtripId VARCHAR(200),
          date Text,
          bagSealId VARCHAR(200)
          )`,
        [],
        (sqlTxn, res) => {
          // console.log("App.js/ ", "table created successfully workload");
          // loadAPI_Data();
        },
        (error) => {
          console.log(
            "App.js/createWorkloadTable ",
            "error on creating table SellerMainScreenDetails" + error.message
          );
        }
      );
    });
  };

  const createTripDetailTable = () => {
    db.transaction((txn) => {
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS TripDetails( 
          tripID VARCHAR(200),
          userID VARCHAR(200),
          vehicleNumber VARCHAR(200),
          tripStatus VARCHAR(200),
          createdAt VARCHAR(200),
          updatedAt VARCHAR(200),
          date VARCHAR(200)
          )`,
        [],
        (sqlTxn, res) => {
          // console.log("App.js/ ", "table created successfully TripDetails");
          // loadAPI_Data();
        },
        (error) => {
          console.log(
            "App.js/createTripDetailTable ",
            "error on creating table " + error.message
          );
        }
      );
    });
  };

  const createNofiticationTable = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS noticeMessages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          messageId TEXT,
          notificationTitle TEXT,
          notificationBody TEXT,
          date TEXT,
          sentTime TEXT,
          message TEXT,
          sellerName TEXT,
          sellerCode TEXT
        )`,
        [],
        (tx, results) => {
          // console.log("App.js/ ", "Table created successfully Notice");
        },
        (error) => {
          console.log(
            "App.js/createNofiticationTable ",
            "Error creating table: ",
            error
          );
        }
      );
    });
  };

  const createShipmentFailureTable = () => {
    db.transaction((txn) => {
      // txn.executeSql('DROP TABLE IF EXISTS ShipmentFailure', []);
      txn.executeSql(
        "CREATE TABLE IF NOT EXISTS ShipmentFailure(_id VARCHAR(24) PRIMARY KEY,description VARCHAR(255),parentCode VARCHAR(20), short_code VARCHAR(20), consignor_failure BOOLEAN, fe_failure BOOLEAN, operational_failure BOOLEAN, system_failure BOOLEAN, enable_geo_fence BOOLEAN, enable_future_scheduling BOOLEAN, enable_otp BOOLEAN, enable_call_validation BOOLEAN, created_by VARCHAR(10), last_updated_by VARCHAR(10), applies_to VARCHAR(255),life_cycle_code INT(20), __v INT(10),date Text)",
        [],
        (sqlTxn, res) => {
          // console.log("App.js/ ", "Table created successfully ShipmentFailure");
          // loadAPI_Data();
        },
        (error) => {
          console.log(
            "App.js/createShipmentFailureTable ",
            "error on creating table " + error.message
          );
        }
      );
    });
  };

  const createCloseBagTable = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS closeBag1 (bagSeal TEXT PRIMARY KEY, bagId TEXT, bagDate TEXT, AcceptedList TEXT,status TEXT,consignorCode Text, stopId Text)",
        [],
        (tx, results) => {
          // console.log(
          //   "App.js/ ",
          //   "Table created successfully Pickup close bag"
          // );
        },
        (error) => {
          console.log(
            "App.js/createCloseBagTable ",
            "Error occurred while creating the table:",
            error
          );
        }
      );
    });
  };

  const createCloseBagHandoverTable = () => {
    db.transaction((tx) => {
      // tx.executeSql('DROP TABLE IF EXISTS closeHandoverBag1', []);
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS closeHandoverBag1 (bagSeal TEXT , bagId TEXT PRIMARY KEY, bagDate TEXT, AcceptedList TEXT,status TEXT,consignorCode text,stopId Text,consignorName Text)",
        [],
        (tx, results) => {
          // console.log(
          //   "App.js/ ",
          //   "Table created successfully Handover Close Bag"
          // );
        },
        (error) => {
          console.log(
            "App.js/createCloseBagHandoverTable ",
            "Error occurred while creating the table:",
            error
          );
        }
      );
    });
  };

  const getUserTripInfoApiCall = async (syncType = "manual") => {
    if (syncType != "auto") {
      setIsLoading4(true);
    }
    try {
      const decodedToken = token ? jwtDecode(token) : null;
      const currentEpochTime = Math.floor(Date.now() / 1000);

      if (decodedToken?.exp >= currentEpochTime) {
        const response = await axios.get(
          backendUrl + "UserTripInfo/getUserTripInfo",
          {
            params: {
              feUserID: userId,
            },
            headers: getAuthorizedHeaders(token),
          }
        );
        if (response && response?.data?.res_data?.length) {
          for (let i = 0; i < response.data.res_data.length; i++) {
            let today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            today = today.valueOf();
            if (response.data.res_data[i].date > today) {
              const data = response.data.res_data[i];
              db.transaction((txn) => {
                txn.executeSql(
                  `INSERT OR REPLACE INTO TripDetails(tripID , userID, vehicleNumber, tripStatus, createdAt ,updatedAt,date
                          ) VALUES (?,?,?,?,?,?,?)`,
                  [
                    data.tripID,
                    data.userID,
                    data.vehicleNumber,
                    data.tripStatus,
                    data.createdAt,
                    data.updatedAt,
                    currentDateValue,
                  ],
                  (sqlTxn, _res) => {
                    m++;
                    fetchTripInfo();
                  },
                  (error) => {
                    fetchTripInfo();
                    console.log(
                      "App.js/ ",
                      "error on adding data in tripdetails " + error.message
                    );
                  }
                );
              });
            }
          }
        } else {
          fetchTripInfo();
        }
        setIsLoading4(false);
      }
    } catch (error) {
      setIsLoading4(false);
      fetchTripInfo();
      console.log("getUserTripInfoApiCall Error:", error);
    }
  };

  const AdditionalWorkloadApiCall = async () => {
    try {
      const decodedToken = token ? jwtDecode(token) : null;
      const currentEpochTime = Math.floor(Date.now() / 1000);

      if (userId && decodedToken?.exp >= currentEpochTime) {
        const response = await axios.get(
          `${backendUrl}SellerMainScreen/getadditionalwork/${userId}`,
          {
            headers: getAuthorizedHeaders(token),
          }
        );

        const responseData = response?.data?.data;
        setDataN(responseData);
        dispatch(setAdditionalWorkloadData(responseData));
        // console.log("Additional Workload API Data:", response.data.data.length);
        setShowModal11(responseData && responseData.length > 0);
      }
    } catch (error) {
      console.log("AdditionalWorkloadApiCall Error:", error);
      throw error; // Re-throw the error to be caught by performApiCalls
    }
  };

  const AdditionalWorkloadAcceptHandler = async (
    consignorCodeAccept,
    stopId,
    tripId
  ) => {
    console.log("App.js/AdditionalWorkloadAcceptHandler ", {
      consignorCode: consignorCodeAccept,
      feUserId: userId,
      stopId: stopId,
      tripID: tripId,
    });
    const decodedToken = token ? jwtDecode(token) : null;
    const currentEpochTime = Math.floor(Date.now() / 1000);
    if (decodedToken?.exp >= currentEpochTime) {
      axios
        .post(
          backendUrl + "SellerMainScreen/acceptWorkLoad",
          {
            consignorCode: consignorCodeAccept,
            feUserId: userId,
            stopId: stopId,
            tripID: tripId,
          },
          { headers: getAuthorizedHeaders(token) }
        )
        .then((response) => {
          console.log(
            "App.js/AdditionalWorkloadAcceptHandler ",
            "Msg Accepted ",
            response.data,
            "",
            userId
          );
          dispatch(setNotificationCount(notificationCount - 1));
          dispatch(setForceSync(true));
          const updatedData = dataN.filter(
            (item) => item.consignorCode !== consignorCodeAccept
          );
          setDataN(updatedData);
          dispatch(setAdditionalWorkloadData(updatedData));
          if (updatedData.length == 0) {
            setShowModal11(false);
          }
        })
        .catch((error) => {
          console.log("App.js/AdditionalWorkloadAcceptHandler ", error);
        });
    }
  };

  const AdditionalWorkloadRejectHandler = async (
    consignorCodeReject,
    stopId,
    tripId
  ) => {
    const decodedToken = token ? jwtDecode(token) : null;
    const currentEpochTime = Math.floor(Date.now() / 1000);
    if (decodedToken?.exp >= currentEpochTime) {
      axios
        .post(
          backendUrl + "SellerMainScreen/rejectWorkLoad",
          {
            consignorCode: consignorCodeReject,
            feUserId: userId,
            stopId: stopId,
            tripID: tripId,
          },
          { headers: getAuthorizedHeaders(token) }
        )
        .then((response) => {
          console.log(
            "App.js/AdditionalWorkloadRejectHandler ",
            "Msg Rejected ",
            response.data
          );
          dispatch(setNotificationCount(notificationCount - 1));
          const updatedData = dataN.filter(
            (item) => item.consignorCode !== consignorCodeReject
          );
          setDataN(updatedData);
          dispatch(setAdditionalWorkloadData(updatedData));
          if (updatedData.length == 0) {
            setShowModal11(false);
          }
        })
        .catch((error) => {
          console.log("App.js/AdditionalWorkloadRejectHandler ", error);
        });
    }
  };

  const getConsignorListApiCall = async (syncType = "manual") => {
    try {
      if (syncType != "auto") {
        setIsLoading1(true);
      }

      const decodedToken = token ? jwtDecode(token) : null;
      const currentEpochTime = Math.floor(Date.now() / 1000);

      if (tripID && decodedToken?.exp >= currentEpochTime) {
        const response = await axios.get(
          backendUrl + `SellerMainScreen/consignorsList/${userId}`,
          {
            params: {
              tripID: tripID,
            },
            headers: getAuthorizedHeaders(token),
          }
        );

        console.log(
          "App.js/getConsignorListApiCall ",
          "API 1 OK: " + response.data.data.length
        );

        for (let i = 0; i < response.data.data.length; i++) {
          const data = response.data.data[i];
          const result = await new Promise((resolve, reject) => {
            db.transaction((txn) => {
              txn.executeSql(
                "SELECT * FROM SyncSellerPickUp WHERE stopId = ? AND FMtripId=?",
                [data.stopId, tripID],
                (tx, result) => {
                  resolve(result);
                },
                (error) => {
                  reject(error);
                }
              );
            });
          });

          if (result.rows.length <= 0) {
            db.transaction((txn) => {
              txn.executeSql(
                "INSERT OR REPLACE INTO SyncSellerPickUp( contactPersonName,consignorCode ,userId ,consignorName,sellerIndex ,consignorAddress1,consignorAddress2,consignorCity,consignorPincode,consignorLatitude,consignorLongitude,consignorContact,ReverseDeliveries,runSheetNumber,ForwardPickups,BagOpenClose11, ShipmentListArray,otpSubmitted,otpSubmittedDelivery,stopId, FMtripId,date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                [
                  data.contactPersonName,
                  data.consignorCode,
                  userId,
                  data.consignorName,
                  data.sequenceNumber,
                  data.consignorAddress1,
                  data.consignorState,
                  data.consignorCity,
                  data.consignorPincode,
                  data.consignorLatitude,
                  data.consignorLongitude,
                  data.consignorContact,
                  data.ReverseDeliveries,
                  data.runsheetNo,
                  data.ForwardPickups,
                  "true",
                  " ",
                  "false",
                  "false",
                  data.stopId,
                  data.FMtripId,
                  currentDateValue,
                ],
                (sqlTxn, _res) => {
                  // console.log('App.js/ ',
                  // "\n Data Added to local db successfully1212"
                  // );
                  // console.log('App.js/ ',res);
                },
                (error) => {
                  console.log(
                    "App.js/getConsignorListApiCall ",
                    "error on loading  data from api SellerMainScreen/consignorslist/" +
                      error.message
                  );
                }
              );
            });
          }
        }

        viewDetails1();
        m++;
        // console.log('App.js/ ','value of m1 '+m);
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var miliseconds = date.getMilliseconds();
        var ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        var datetime = "Last Sync\n" + hours + ":" + minutes + " " + ampm;
        dispatch(setSyncTime(datetime));
        dispatch(setSyncTimeFull(minutes + seconds + miliseconds));
        AsyncStorage.setItem("lastSyncTime112", datetime);
        AsyncStorage.setItem("load11", "notload");
        setIsLoading1(false);
      }
    } catch (error) {
      console.log(
        "App.js/getConsignorListApiCall ",
        "error api SellerMainScreen/consignorslist/",
        error
      );
      setIsLoading1(false);
      throw error;
    }
  };

  const getWorkloadApiCall = async (syncType = "manual") => {
    try {
      if (syncType != "auto") {
        setIsLoading2(true);
      }
      if (tripID) {
        db.transaction((txn) => {
          txn.executeSql(
            "SELECT * FROM TripDetails WHERE userID = ? AND date=?",
            [userId, currentDateValue],
            (tx, result) => {
              if (result.rows.length > 0) {
                var tripStatus = result.rows.item(0).tripStatus;
                console.log(
                  "App.js/getWorkloadApiCall ",
                  "Trip id: ",
                  tripID,
                  tripStatus
                );
                const decodedToken = token ? jwtDecode(token) : null;
                const currentEpochTime = Math.floor(Date.now() / 1000);
                if (decodedToken?.exp >= currentEpochTime) {
                  async function callApiasync() {
                    const response = await axios.get(
                      backendUrl + `SellerMainScreen/workload/${userId}`,
                      {
                        params: {
                          tripID: tripID,
                        },
                        headers: getAuthorizedHeaders(token),
                      }
                    );

                    console.log(
                      "App.js/getWorkloadApiCall ",
                      "API 2 OK: " + response.data.data.length
                    );

                    for (let i = 0; i < response.data.data.length; i++) {
                      const shipmentStatus =
                        response.data.data[i].shipmentStatus;
                      const data = response.data.data[i];
                      if (!(tripStatus == 50 && shipmentStatus === "WFP")) {
                        db.transaction((txn) => {
                          txn.executeSql(
                            "SELECT * FROM SellerMainScreenDetails where clientShipmentReferenceNumber = ? AND FMtripId=?",
                            [data.clientShipmentReferenceNumber, tripID],
                            (tx, result) => {
                              if (result.rows.length <= 0) {
                                async function insertData() {
                                  await new Promise((resolve, reject) => {
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
                          packagingAction,
                          postRDStatus,
                          stopId,
                          FMtripId,
                          date,
                          bagSealId
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                                        [
                                          data.clientShipmentReferenceNumber,
                                          data.clientRefId,
                                          data.awbNo,
                                          data.courierCode,
                                          data.consignorCode,
                                          data.packagingStatus,
                                          data.expectedPackagingId,
                                          data.scannedPackageingId,
                                          data.runsheetNo,
                                          data.shipmentStatus,
                                          data.shipmentAction,
                                          "",
                                          "",
                                          0,
                                          data.actionTime,
                                          data.shipmentStatus == "PUS" ||
                                          data.shipmentStatus == "PUC" ||
                                          data.shipmentStatus == "DLR" ||
                                          data.shipmentStatus == "RDS"
                                            ? "accepted"
                                            : data.shipmentStatus == "PUR" ||
                                              data.shipmentStatus == "RDR" ||
                                              data.shipmentStatus == "UDU" ||
                                              data.shipmentStatus == "PUF"
                                            ? "rejected"
                                            : data.shipmentStatus == "RAH"
                                            ? data.shipmentAction ==
                                              "Seller Pickup"
                                              ? "accepted"
                                              : "rejected"
                                            : null,
                                          // null,
                                          data.handoverStatus == 1
                                            ? "accepted"
                                            : data.handoverStatus == 2
                                            ? "rejected"
                                            : null,
                                          null,
                                          null,
                                          data.bagId,
                                          data.packagingAction,
                                          null,
                                          data.stopId,
                                          data.FMtripId,
                                          currentDateValue,
                                          data?.bagSealId,
                                        ],
                                        (sqlTxn, _res) => {
                                          // console.log(
                                          //   "App.js/ ",
                                          //   `Data Added to local db successfully`
                                          // );
                                          // console.log('App.js/ ',res);
                                        },
                                        (error) => {
                                          console.log(
                                            "App.js/getWorkloadApiCall ",
                                            "error on adding data " +
                                              error.message
                                          );
                                        }
                                      );
                                      resolve();
                                    });
                                  });
                                }
                                insertData();
                              }
                            }
                          );
                        });
                      }
                    }
                    m++;
                    var date = new Date();
                    var hours = date.getHours();
                    var minutes = date.getMinutes();
                    var seconds = date.getSeconds();
                    var miliseconds = date.getMilliseconds();
                    var ampm = hours >= 12 ? "PM" : "AM";
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    minutes = minutes < 10 ? "0" + minutes : minutes;
                    var datetime =
                      "Last Sync\n" + hours + ":" + minutes + " " + ampm;
                    dispatch(setSyncTime(datetime));
                    dispatch(setSyncTimeFull(minutes + seconds + miliseconds));
                    AsyncStorage.setItem("lastSyncTime112", datetime);
                    // console.log('App.js/ ','value of m2 '+m);

                    if (response?.data?.data?.length >= 0) {
                      setTimeout(() => {
                        const randomValue =
                          Math.floor(Math.random() * (100 - 1 + 1)) + 1;
                        dispatch(setIsNewSync(randomValue));
                        setIsLoading2(false);
                      }, 2000);
                    } else {
                      setIsLoading2(false);
                    }
                  }
                  callApiasync();
                }
              }
            }
          );
        });
      } else {
        setIsLoading2(false);
      }
    } catch (error) {
      console.log("App.js/getWorkloadApiCall ", error);
      setIsLoading2(false);
      throw error;
    }
  };

  const getFailureReasonApiCall = async () => {
    try {
      setIsLoadingSF(true);
      const decodedToken = token ? jwtDecode(token) : null;
      const currentEpochTime = Math.floor(Date.now() / 1000);
      if (decodedToken?.exp >= currentEpochTime) {
        const response = await axios.get(
          backendUrl + "ADshipmentFailure/getList",
          {
            headers: getAuthorizedHeaders(token),
          }
        );

        // console.log("App.js/ ", "Table6 API OK: " + response.data.data.length);

        for (let i = 0; i < response.data.data.length; i++) {
          // const appliesto=JSON.parse(JSON.stringify(response.data.data[i].appliesTo))
          const appliesto = String(response.data.data[i].appliesTo.slice());
          const data = response.data.data[i];
          db.transaction((txn) => {
            txn.executeSql(
              `INSERT OR REPLACE INTO ShipmentFailure(_id ,description , parentCode, short_code , consignor_failure , fe_failure , operational_failure , system_failure , enable_geo_fence , enable_future_scheduling , enable_otp , enable_call_validation, created_by , last_updated_by, applies_to ,life_cycle_code , __v,date
                          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
              [
                data._id,
                data.description,
                data.parentCode,
                data.shortCode,
                data.consignorFailure,
                data.feFailure,
                data.operationalFailure,
                data.systemFailure,
                data.enableGeoFence,
                data.enableFutureScheduling,
                data.enableOTP,
                data.enableCallValidation,
                data.createdBy,
                data.lastUpdatedBy,
                appliesto,
                data.lifeCycleCode,
                data.__v,
                currentDateValue,
              ],
              (sqlTxn, _res) => {
                // console.log('App.js/ ','\n Data Added to local db 6 ');
                // console.log('App.js/ ',res);
              },
              (error) => {
                console.log(
                  "App.js/getFailureReasonApiCall ",
                  "error on adding data " + error.message
                );
              }
            );
          });
        }
        m++;
        setIsLoadingSF(false);
      }
    } catch (error) {
      console.log("App.js/ ", "error on adding data ", error.message);
      setIsLoadingSF(false);
      throw error;
    }
  };

  async function postSPSCalling(row) {
    const deviceId = await DeviceInfo.getUniqueId();
    const IpAddress = await DeviceInfo.getIpAddress();
    // console.log("App.js/postSPSCalling ", "===========row=========", {
    //   clientShipmentReferenceNumber: row.clientShipmentReferenceNumber,
    //   awbNo: row.awbNo,
    //   clientRefId: row.clientRefId,
    //   expectedPackagingId: row.packagingId,
    //   packagingId: row.expectedPackagingId,
    //   courierCode: row.courierCode,
    //   consignorCode: row.consignorCode,
    //   packagingAction: row.packagingAction,
    //   runsheetNo: row.runSheetNumber,
    //   shipmentAction: row.shipmentAction,
    //   feUserID: userId,
    //   rejectionReason: row.rejectionReasonL2
    //     ? row.rejectionReasonL2
    //     : row.rejectionReasonL1,
    //   rejectionStage: 1,
    //   bagId: row.bagId,
    //   eventTime: parseInt(row.eventTime),
    //   latitude: parseFloat(row.latitude),
    //   longitude: parseFloat(row.longitude),
    //   packagingStatus: 1,
    //   scanStatus:
    //     row.status == "accepted" ? 1 : row.status == "rejected" ? 2 : 0,
    //   stopId: row.stopId,
    //   tripID: row.FMtripId,
    //   deviceId: deviceId,
    //   deviceIPaddress: IpAddress,
    //   bagSealId: row.bagSealId,
    // });
    const decodedToken = token ? jwtDecode(token) : null;
    const currentEpochTime = Math.floor(Date.now() / 1000);
    if (decodedToken?.exp >= currentEpochTime) {
      await axios
        .post(
          backendUrl + "SellerMainScreen/postSPS",
          {
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
            rejectionReason: row.rejectionReasonL2
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
            stopId: row.stopId,
            tripID: row.FMtripId,
            deviceId: deviceId,
            deviceIPaddress: IpAddress,
            bagSealId: row.bagSealId
          },
          { headers: getAuthorizedHeaders(token) }
        )
        .then((response) => {
          console.log("App.js/postSPSCalling ", "sync Successfully pushed");
          console.log("App.js/postSPSCalling ", response);
          db.transaction((tx) => {
            tx.executeSql(
              'UPDATE SellerMainScreenDetails SET syncStatus="done" WHERE clientShipmentReferenceNumber = ?',
              [row.clientShipmentReferenceNumber],
              (tx1, results) => {
                let temp = [];
                // console.log(
                //   "App.js/postSPSCalling ",
                //   "===========Local Sync Status Results==========",
                //   results.rowsAffected
                // );
                if (results.rowsAffected > 0) {
                  console.log(
                    "App.js/postSPSCalling ",
                    "Sync status done in localDB"
                  );
                } else {
                  console.log(
                    "App.js/postSPSCalling ",
                    "Sync Status not changed in localDB or already synced"
                  );
                }
              }
            );
          });
        })
        .catch((error) => {
          callApi(error, latitude, longitude, userId, token);
          console.log("App.js/postSPSCalling ", "sync error", { error });
        });
    }
  }

  async function postSPS(data) {
    await data.map((row) => {
      postSPSCalling(row);
    });
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var miliseconds = date.getMilliseconds();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var time = hours + ":" + minutes + " " + ampm;
    var datetime = "Last Sync\n" + hours + ":" + minutes + " " + ampm;
    dispatch(setSyncTime(datetime));
    dispatch(setSyncTimeFull(minutes + seconds + miliseconds));
    AsyncStorage.setItem("lastSyncTime112", datetime);
  }

  const push_Data = (syncType = "manual") => {
    console.log(
      "App.js/push_Data ",
      "push data function",
      new Date().toJSON().slice(0, 10).replace(/-/g, "/")
    );

    dispatch(setForceSync(false));

    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var miliseconds = date.getMilliseconds();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var time = hours + ":" + minutes + " " + ampm;
    var datetime = "Last Sync\n" + hours + ":" + minutes + " " + ampm;
    dispatch(setSyncTime(datetime));
    dispatch(setSyncTimeFull(minutes + seconds + miliseconds));
    AsyncStorage.setItem("lastSyncTime112", datetime);

    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM SellerMainScreenDetails WHERE status IS NOT Null AND (syncStatus IS Null OR syncStatus='')",
        [],
        (tx1, results) => {
          if (results.rows.length > 0) {
            if (syncType != "auto") {
              ToastAndroid.show("Synchronizing data...", ToastAndroid.SHORT);
            }
            let temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push(results.rows.item(i));
            }
            postSPS(temp);
            if (syncType != "auto") {
              ToastAndroid.show(
                "Synchronizing data finished",
                ToastAndroid.SHORT
              );
            }
          } else {
            console.log("App.js/push_Data/", "No data to push...");
          }
        }
      );
    });
  };

  const pull_Data = async (syncType = "manual") => {
    try {
      var date = new Date();
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var seconds = date.getSeconds();
      var miliseconds = date.getMilliseconds();
      var ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      var datetime = "Last Sync\n" + hours + ":" + minutes + " " + ampm;
      dispatch(setSyncTime(datetime));
      dispatch(setSyncTimeFull(minutes + seconds + miliseconds));
      AsyncStorage.setItem("lastSyncTime112", datetime);
      console.log("App.js/pull_Data ", "api pull");
      getWorkloadData(syncType);
      const randomValue = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
      dispatch(setIsNewSync(randomValue));
    } catch (err) {
      console.log("===Error Pull Api===", err);
    }
  };

  useEffect(() => {
    setShowModal11(dataN && dataN.length > 0);
  }, [userId, setShowModal11]);

  let m = 0;
  // console.log('App.js/ ',latitude," " ,longitude);
  useEffect(() => {
    if (userId) {
      current_location();
    }
  }, [userId, token]);

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
        //       console.log('App.js/ ','Location enabled');
        //     }
        //   })
        //   .catch(err => {
        //     console.log('App.js/ ',err);
        //   });
        console.log(
          "App.js/current_location ",
          "Location Lat long error",
          error
        );
      });
  };

  // useEffect(() => {
  //   // console.log('App.js/ ',"CurrentDate :", currentDateValue);
  //   const updateDateAtMidnight = () => {
  //     const currentDate = new Date();
  //     const currentDay = currentDate.toISOString().split("T")[0];
  //     // const temp=currentDateValue;
  //     if (currentDay !== currentDateValue) {
  //       // console.log('App.js/ ',"New Date :", currentDay);
  //       dispatch(setCurrentDateValue(currentDay));

  //       deleteRowsByDate("SellerMainScreenDetails");
  //       deleteRowsByDate("SyncSellerPickUp");
  //       deleteRowsByDate("TripDetails");
  //       deleteRowsByDate("noticeMessages");
  //       deleteRowsByDate("ShipmentFailure");
  //       deleteRowsByDateBag("closeBag1");
  //       deleteRowsByDateBag("closeHandoverBag1");
  //     }
  //   };

  //   const checkAndUpdateDate = setInterval(updateDateAtMidnight, 60000); // Checks every minute

  //   return () => clearInterval(checkAndUpdateDate);
  // }, [currentDateValue, dispatch]);

  // const deleteRowsByDate = (tableName) => {
  //   const yesterday = new Date();
  //   yesterday.setDate(yesterday.getDate() - 3);
  //   const yesterdayDateString = yesterday.toISOString().split("T")[0];

  //   db.transaction((tx) => {
  //     tx.executeSql(
  //       `DELETE FROM ${tableName} WHERE date <= ?`,
  //       [yesterdayDateString],
  //       (_, { rowsAffected }) => {
  //         console.log(
  //           "App.js/deleteRowsByDate ",
  //           `${rowsAffected} rows deleted from ${tableName}`
  //         );
  //       },
  //       (error) => {
  //         console.log(
  //           "App.js/deleteRowsByDate ",
  //           `Error deleting rows from ${tableName}:`,
  //           error
  //         );
  //       }
  //     );
  //   });
  // };

  // const deleteRowsByDateBag = (tableName) => {
  //   const yesterday = new Date();
  //   yesterday.setDate(yesterday.getDate() - 3);
  //   const yesterdayDateString = yesterday.toISOString().split("T")[0];
  //   console.log("App.js/deleteRowsByDateBag ", yesterdayDateString);
  //   db.transaction((tx) => {
  //     tx.executeSql(
  //       `DELETE FROM ${tableName} WHERE bagDate <= ?`,
  //       [yesterdayDateString],
  //       (_, { rowsAffected }) => {
  //         console.log(
  //           "App.js/deleteRowsByDateBag ",
  //           `${rowsAffected} rows deleted from ${tableName}`
  //         );
  //       },
  //       (error) => {
  //         console.log(
  //           "App.js/deleteRowsByDateBag ",
  //           `Error deleting rows from ${tableName}:`,
  //           error
  //         );
  //       }
  //     );
  //   });
  // };

  // console.log('App.js/ ',"Redux deviceInfo Value ",deviceInfo);
  useEffect(() => {
    fetchDeviceInfo();
  }, []);

  const fetchDeviceInfo = async () => {
    try {
      const uniqueId = await getUniqueIdWithCatch();
      const manufacturer = await getManufacturerWithCatch();
      const modelName = await getModelWithCatch();
      const brand = await getBrandWithCatch();
      const systemName = await getSystemNameWithCatch();
      const systemVersion = await getSystemVersionWithCatch();
      const bundleId = await getBundleIdWithCatch();
      const buildNumber = await getBuildNumberWithCatch();
      const version = await getVersionWithCatch();
      // const buildNumberIOS = await getBuildNumberIOSWithCatch();
      const installReferrer = await getInstallReferrerWithCatch();
      const ipAddress = await getIpAddressWithCatch();
      const macAddress = await getMacAddressWithCatch();
      const locale = await getLocaleWithCatch();
      const country = await getCountryWithCatch();
      const timezone = await getTimezoneWithCatch();
      const RamUsage = await getRAMUsagePercentage();
      const DiskUsage = await getDiskUtilizationPercentage();
      const SignalStrength = await getSignalStrength();
      const deviceType = await getDeviceType();
      // const device= await fetchDeviceType();
      const deviceInfoData = {
        uniqueId,
        manufacturer,
        modelName,
        brand,
        systemName,
        systemVersion,
        bundleId,
        buildNumber,
        version,
        // buildNumberIOS,
        installReferrer,
        ipAddress,
        macAddress,
        locale,
        country,
        timezone,
        RamUsage,
        DiskUsage,
        SignalStrength,
        deviceType,
        // device,
      };

      // setDeviceInfo(deviceInfoData);
      // console.log('App.js/ ',deviceInfoData);
      dispatch(setCurrentDeviceInfo(deviceInfoData));
    } catch (error) {
      console.error("Error fetching device information:", error);
    }
  };

  const getUniqueIdWithCatch = async () => {
    try {
      return await DeviceInfo.getUniqueId();
    } catch (error) {
      console.error("Error getting unique ID:", error);
      return null;
    }
  };

  const getDeviceType = async () => {
    try {
      return await DeviceInfo.getDeviceType();
    } catch (error) {
      console.error("Error getting Device Type:", error);
      return null;
    }
  };

  const getManufacturerWithCatch = async () => {
    try {
      return await DeviceInfo.getManufacturer();
    } catch (error) {
      console.error("Error getting manufacturer:", error);
      return null;
    }
  };

  const getModelWithCatch = async () => {
    try {
      return await DeviceInfo.getModel();
    } catch (error) {
      console.error("Error getting model:", error);
      return null;
    }
  };

  const getBrandWithCatch = async () => {
    try {
      return await DeviceInfo.getBrand();
    } catch (error) {
      console.error("Error getting brand:", error);
      return null;
    }
  };

  const getSystemNameWithCatch = async () => {
    try {
      return await DeviceInfo.getSystemName();
    } catch (error) {
      console.error("Error getting system name:", error);
      return null;
    }
  };

  const getSystemVersionWithCatch = async () => {
    try {
      return await DeviceInfo.getSystemVersion();
    } catch (error) {
      console.error("Error getting system version:", error);
      return null;
    }
  };

  const getBundleIdWithCatch = async () => {
    try {
      return await DeviceInfo.getBundleId();
    } catch (error) {
      console.error("Error getting bundle ID:", error);
      return null;
    }
  };

  const getBuildNumberWithCatch = async () => {
    try {
      return await DeviceInfo.getBuildNumber();
    } catch (error) {
      console.error("Error getting build number:", error);
      return null;
    }
  };

  const getVersionWithCatch = async () => {
    try {
      return await DeviceInfo.getVersion();
    } catch (error) {
      console.error("Error getting version:", error);
      return null;
    }
  };

  const getBuildNumberIOSWithCatch = async () => {
    try {
      return await DeviceInfo.getBuildNumber();
    } catch (error) {
      console.error("Error getting iOS build number:", error);
      return null;
    }
  };

  const getInstallReferrerWithCatch = async () => {
    try {
      return await DeviceInfo.getInstallReferrer();
    } catch (error) {
      console.error("Error getting install referrer:", error);
      return null;
    }
  };

  const getIpAddressWithCatch = async () => {
    try {
      return await DeviceInfo.getIpAddress();
    } catch (error) {
      console.error("Error getting IP address:", error);
      return null;
    }
  };

  const getRAMUsagePercentage = async () => {
    try {
      const totalMemory = await DeviceInfo.getTotalMemory();
      const usedMemory = await DeviceInfo.getUsedMemory();

      if (totalMemory === 0) {
        throw new Error("Invalid total memory value");
      }

      const ramUsagePercentage = Math.floor((usedMemory / totalMemory) * 100);

      if (isNaN(ramUsagePercentage)) {
        throw new Error("Invalid RAM usage calculation");
      }

      return ramUsagePercentage;
    } catch (error) {
      console.log(
        "App.js/ ",
        "Error occurred while calculating RAM usage:",
        error
      );
      return 0; // Default value or error handling logic
    }
  };

  const getDiskUtilizationPercentage = async () => {
    try {
      const diskSpace = await DeviceInfo.getFreeDiskStorage();
      const totalSpace = await DeviceInfo.getTotalDiskCapacity();
      const diskUsagePercentage = Math.floor(
        ((totalSpace - diskSpace) / totalSpace) * 100
      );

      if (isNaN(diskUsagePercentage)) {
        throw new Error("Invalid disk utilization calculation");
      }

      return diskUsagePercentage;
    } catch (error) {
      console.log(
        "App.js/ ",
        "Error occurred while calculating disk utilization:",
        error
      );
      return 0; // Default value or error handling logic
    }
  };

  const getSignalStrength = async () => {
    try {
      return (await NetInfo.fetch()).details?.strength;
    } catch (error) {
      console.log("App.js/ ", "Error getting Signal Strength:", error);
      return null;
    }
  };

  const getMacAddressWithCatch = async () => {
    try {
      return await DeviceInfo.getMacAddress();
    } catch (error) {
      console.log("App.js/ ", "Error getting MAC address:", error);
      return null;
    }
  };

  const getLocaleWithCatch = async () => {
    try {
      return await RNLocalize.getLocales()[0].languageCode;
    } catch (error) {
      console.error("Error getting locale:", error);
      return null;
    }
  };

  const getCountryWithCatch = async () => {
    try {
      return await RNLocalize.getLocales()[0].countryCode;
    } catch (error) {
      console.error("Error getting country:", error);
      return null;
    }
  };

  const getTimezoneWithCatch = async () => {
    try {
      return await RNLocalize.getTimeZone();
    } catch (error) {
      console.error("Error getting timezone:", error);
      return null;
    }
  };

  useEffect(() => {
    requestPermissions();
    console.log("App.js/requestPermissions ", "Request permission", userId);
  }, []);

  const requestPermissions = async () => {
    try {
      const notificationPermission = await messaging().requestPermission();
      if (notificationPermission == "granted") {
        console.log(
          "App.js/requestPermissions",
          "Notification permission granted"
        );
      } else {
        console.log(
          "App.js/requestPermissions",
          "Notification permission denied"
        );
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const handleIncomingMessage = async (message) => {
    console.log("App.js/handleIncomingMessage ", message);
    const { messageId, notification, sentTime } = message;
    const sendDate = new Date().toISOString().slice(0, 10);
    const date = new Date(sentTime);

    const options = { hour: "numeric", minute: "numeric", hour12: true };
    const formattedTime = date.toLocaleTimeString("en-US", options);

    console.log("App.js/handleIncomingMessage ", formattedTime, notification);

    db.transaction((tx) => {
      const messageRegex = /.*?- (.+?) \(/;
      const messageMatch = notification.body.match(messageRegex);
      const message = messageMatch ? messageMatch[1] : null;

      const sellerNameRegex = /- (.+?) \(/;
      const sellerNameMatch = notification.body.match(sellerNameRegex);
      const sellerName = sellerNameMatch ? sellerNameMatch[1] : null;

      const sellerCodeRegex = /\( (.+?) \)/;
      const sellerCodeMatch = notification.body.match(sellerCodeRegex);
      const sellerCode = sellerCodeMatch ? sellerCodeMatch[1] : null;
      console.log(
        "App.js/handleIncomingMessage ",
        message,
        " ",
        sellerName,
        " ",
        " ",
        sellerCode
      );
      tx.executeSql(
        "INSERT INTO noticeMessages (messageId, notificationTitle, notificationBody, date, sentTime, message, sellerName, sellerCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          messageId,
          notification.title,
          notification.body,
          sendDate,
          formattedTime.toString(),
          notification.body.match(/^(.*?) -/)?.[1] || null,
          sellerName,
          sellerCode,
        ],
        (tx, results) => {
          console.log("App.js/handleIncomingMessage ", results);
          if (results.rowsAffected > 0) {
            console.log(
              "App.js/handleIncomingMessage ",
              "Message stored in the local database ",
              notification.body
            );
          }
        }
      );
    });
  };

  // console.log('App.js/ ',"Notification Count",notificationCount," ",useSelector((state) => state.notification.count));
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("App.js/onMessage ", remoteMessage.notification);
      const newvalue = notificationCount + 1;
      dispatch(setNotificationCount(newvalue));
      AdditionalWorkloadApiCall();
      console.log("App.js/onMessage ", "Notification Arrived");
      handleIncomingMessage(remoteMessage);
      PushNotification.localNotification({
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        channelId: "AdditionalWork_1",
      });
      pull_Data("auto");
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
        console.log("App.js/PushNotification ", "TOKEN:", token);
      },

      onNotification: function (notification) {
        console.log("App.js/PushNotification ", "NOTIFICATION:", notification);

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

  useEffect(() => {
    // This useEffect  is use to hide warnings in mobile screen .
    // LogBox.ignoreLogs(['Warning: Each child in a list should have a unique "key" prop.']);
    LogBox.ignoreAllLogs(true);
  }, []);

  useEffect(() => {
    if (userId) {
      Login_Data_load();
    } else {
      navigation.navigate("Login");
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      AsyncStorage.getItem("lastSyncTime112")
        .then((data11) => {
          dispatch(setSyncTime(data11));
          dispatch(setSyncTimeFull(data11));
        })
        .catch((e) => {
          console.log("App.js/useEffect ", e);
        });
    }
  }, [userId]);

  const Login_Data_load = () => {
    // console.log('App.js/ ','Login Data Load called');
    AsyncStorage.getItem("apiDataLoaded")
      .then((data11) => {
        // console.log('App.js/ ', 'Api Data Loaded value : ',data11);
        if (data11 === "false") {
          // console.log('App.js/ ',"1st time call");
          AsyncStorage.setItem("apiDataLoaded", "true");
          // return;
        }
      })
      .catch((e) => {
        // console.log('App.js/ ',e);
      });
    AsyncStorage.getItem("lastSyncTime112")
      .then((data11) => {
        dispatch(setSyncTime(data11));
        dispatch(setSyncTimeFull(data11));
      })
      .catch((e) => {
        // console.log('App.js/ ',e);
      });
  };

  const sync11 = (syncType = "manual") => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected && state.isInternetReachable) {
        if (syncType != "auto") {
          setIsLoading2(true);
        }
        if (userId) {
          pull_Data(syncType);
          push_Data(syncType);
        } else {
          setIsLoading2(false);
        }
      } else {
        ToastAndroid.show("You are Offline!", ToastAndroid.SHORT);
        setIsLoading2(false);
      }
    });
  };

  const fetchTripInfo = async () => {
    try {
      db.transaction((txn) => {
        txn.executeSql(
          "SELECT * FROM TripDetails WHERE (tripStatus = ? OR tripStatus = ?) AND userID = ? AND date = ?",
          [20, 50, userId, currentDateValue],
          (tx, result) => {
            if (result.rows.length > 0) {
              setTripID(result.rows.item(0).tripID);
            } else {
              txn.executeSql(
                "SELECT * FROM TripDetails WHERE tripStatus = ? AND userID = ? AND date = ?  ORDER BY tripID DESC LIMIT 1",
                [200, userId, currentDateValue],
                (tx, res) => {
                  if (res.rows.length > 0) {
                    setTripID(res.rows.item(0).tripID);
                  } else {
                    setTripID("");
                    setIsLoading2(false);
                  }
                }
              );
            }
          }
        );
      });
    } catch (err) {
      console.log("App.js/fetchTripInfo Error", err);
      setIsLoading2(false);
    }
  };

  const viewDetails1 = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM TripDetails", [], (tx1, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        if (m === 4) {
          ToastAndroid.show("Sync Successful", ToastAndroid.SHORT);
          AsyncStorage.setItem("apiDataLoaded", "true");
          m = 0;
          AsyncStorage.setItem("refresh11", "refresh");
        }
      });
    });
  };

  return (
    <NativeBaseProvider>
      {isAutoSyncEnable && (
        <Modal isOpen={showModal11}>
          <Modal.Content bg={"#eee"}>
            <ScrollView>
              <Modal.Header>Additional Workload</Modal.Header>
              <Box flex={1} bg="coolGray.100" p={4}>
                {dataN && dataN.length
                  ? dataN.map((d, i) => {
                      return (
                        <Box
                          key={i}
                          width="100%"
                          marginBottom="5"
                          alignItems="center"
                        >
                          <Box
                            width="100%"
                            rounded="lg"
                            overflow="hidden"
                            borderColor="coolGray.100"
                            borderWidth="1"
                            _dark={{
                              borderColor: "coolGray.600",
                              backgroundColor: "white",
                            }}
                            _web={{
                              shadow: 2,
                              borderWidth: 0,
                            }}
                            _light={{
                              backgroundColor: "white",
                            }}
                          >
                            <View style={{ padding: 16 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  marginBottom: 4,
                                }}
                              >
                                <View style={{ alignItems: "center" }}>
                                  <Text
                                    color="black"
                                    _dark={{
                                      color: "gray.400",
                                    }}
                                    fontWeight="400"
                                  >
                                    {d.consignorName} {d.consignorCode}
                                  </Text>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                  <Text
                                    color="black"
                                    _dark={{
                                      color: "gray.400",
                                    }}
                                    fontWeight="400"
                                  >
                                    {d.ForwardPickups}/{d.ReverseDeliveries}
                                  </Text>
                                </View>
                              </View>
                              <View
                                style={{
                                  backgroundColor: "#eee",
                                  height: 1,
                                  marginVertical: 8,
                                }}
                              />
                              <View style={{ marginBottom: 4 }}>
                                <Text
                                  fontSize="sm"
                                  _light={{
                                    color: "black",
                                  }}
                                  _dark={{
                                    color: "black",
                                  }}
                                  fontWeight="500"
                                  ml="-0.5"
                                  mt="-1"
                                >
                                  {d.consignorAddress1} {d.consignorAddress2}
                                  {"\n"}
                                  {d.consignorCity} - {d.consignorPincode}
                                </Text>
                              </View>
                              <View
                                style={{
                                  backgroundColor: "#eee",
                                  height: 1,
                                  marginVertical: 8,
                                }}
                              />
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <View style={{ alignItems: "center" }}>
                                  <Button
                                    style={{ backgroundColor: "#FF2E2E" }}
                                    _dark={{
                                      color: "red.200",
                                    }}
                                    onPress={() =>
                                      AdditionalWorkloadRejectHandler(
                                        d.consignorCode,
                                        d.stopId,
                                        d.FMtripId
                                      )
                                    }
                                  >
                                    <Text style={{ color: "white" }}>
                                      Reject
                                    </Text>
                                  </Button>
                                </View>
                                <View style={{ alignItems: "center" }}>
                                  <Button
                                    style={{ backgroundColor: "#004aad" }}
                                    _dark={{
                                      color: "blue.200",
                                    }}
                                    onPress={() =>
                                      AdditionalWorkloadAcceptHandler(
                                        d.consignorCode,
                                        d.stopId,
                                        d.FMtripId
                                      )
                                    }
                                  >
                                    <Text style={{ color: "white" }}>
                                      Accept
                                    </Text>
                                  </Button>
                                </View>
                              </View>
                            </View>
                          </Box>
                        </Box>
                      );
                    })
                  : null}
              </Box>
            </ScrollView>
          </Modal.Content>
        </Modal>
      )}
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
          name="DeviceInfoScreen"
          component={DeviceInfoScreen}
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
                    Device Info
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
                    Welcome
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 10 }}>
                <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                {/* <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                {/* <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                {/* <Text style={{ fontSize: 12, color: "white" }}>{syncTime}</Text>
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
                    Trip History
                  </Heading>
                </View>
              </NativeBaseProvider>
            ),
            headerLeft: () => null,
          }}
        />

        <Stack.Screen
          name="TripSummary"
          component={TripSummary}
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
                    Trip Summary
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
      {/* isLoading1 || isLoading2 || isLoadingSF || isLoading4 || syncLoading */}
      {isLoading2 && userId && userId.length > 0 ? (
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
  const [pendingPickup, setPendingPickup] = useState(0);
  const [pendingDelivery, setPendingDelivery] = useState(0);
  const [detailsLoaded, setDetailsLoaded] = useState(false);
  const email = useSelector((state) => state.user.user_email);
  const id = useSelector((state) => state.user.user_id);
  const name = useSelector((state) => state.user.user_name);
  const idToken = useSelector((state) => state.user.idToken);
  const token = useSelector((state) => state.user.token);
  const tripStatus = useSelector((state) => state.trip.tripStatus);
  const refreshToken = useSelector((state) => state.user.refreshToken);
  const refreshTime = useSelector((state) => state.user.refreshTime);

  const config = {
    issuer: "https://uacc.logistiex.com/realms/janus-test",
    clientId: "fm-app",
    redirectUrl: "com.demoproject.app://Login",
    scopes: [
      "openid",
      "web-origins",
      "acr",
      "offline_access",
      "email",
      "microprofile-jwt",
      "profile",
      "address",
      "phone",
      "roles",
    ],
  };

  useEffect(() => {
    // const decodedToken = token ? jwtDecode(token) : null;
    // const currentEpochTime = Math.floor(Date.now() / 1000);
    // if (id && decodedToken?.exp - 180 < currentEpochTime) {

    if (id) {
      if (refreshToken) {
        refreshTokenAgain(refreshToken);
      }
      if (refreshTime && refreshToken) {
        const intervalId = setInterval(() => {
          if (refreshToken) {
            refreshTokenAgain(refreshToken);
          }
        }, refreshTime);

        return () => {
          clearInterval(intervalId);
        };
      }
    }
  }, [refreshToken, refreshTime, id]);

  async function refreshTokenAgain(refreshToken) {
    NetInfo.fetch().then((state) => {
      if (state.isConnected && state.isInternetReachable) {
        async function call() {
          await refresh(config, {
            refreshToken: refreshToken,
          })
            .then((response) => {
              if (response?.idToken) {
                AsyncStorage.setItem("token", response?.accessToken);
                AsyncStorage.setItem("idToken", response?.idToken);

                dispatch(setToken(response?.accessToken));
                dispatch(setIdToken(response?.idToken));
                // console.log("App.js/refreshTokenAgain/Token Refreshed", response);
                console.log("App.js/refreshTokenAgain/Token Refreshed");
              } else {
                console.log(
                  "App.js/refreshTokenAgain/No ID Token Error",
                  response
                );
                LogoutHandle();
              }
            })
            .catch((error) => {
              console.log("App.js/refreshTokenAgain/Refresh Token Error".error);
              LogoutHandle();
            });
        }
        call();
      } else {
        ToastAndroid.show("You are Offline!", ToastAndroid.SHORT);
      }
    });
  }

  useEffect(() => {
    const loadDetails = async () => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM SellerMainScreenDetails WHERE shipmentAction="Seller Pickup" AND status IS NULL',
          [],
          (tx1, results) => {
            setPendingPickup(results.rows.length);
          }
        );
      });

      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND (handoverStatus="accepted" AND status IS NULL)',
          [],
          (tx1, results) => {
            setPendingDelivery(results.rows.length);
          }
        );
      });
      setDetailsLoaded(true);
    };
    loadDetails();
  }, []);
  const handleStartTrip = () => {
    if (detailsLoaded) {
      if ((pendingPickup != 0 || pendingDelivery != 0) && tripStatus == 1) {
        navigation.navigate("PendingWork", { token: token });
      } else {
        navigation.navigate("MyTrip", { userId: id, token: token });
      }
      navigation.closeDrawer();
    }
  };
  const LogoutHandle = async () => {
    await logout(
      { issuer: "https://uacc.logistiex.com/realms/janus-test" },
      {
        idToken: idToken,
        postLogoutRedirectUrl: "com.demoproject.app://Login",
      }
    )
      .then((result) => {
        console.log("App.js/LogoutHandle ", result);
        async function call1() {
          try {
            await AsyncStorage.removeItem("userId");
            await AsyncStorage.removeItem("name");
            await AsyncStorage.removeItem("email");
            await AsyncStorage.removeItem("token");

            dispatch(setUserId(""));
            dispatch(setUserEmail(""));
            dispatch(setUserName(""));
            dispatch(setToken(""));
            dispatch(setNotificationCount(0));
            dispatch(setCurrentDateValue(0));
            dispatch(setCurrentDeviceInfo(""));
            dispatch(setAdditionalWorkloadData(""));
          } catch (e) {
            console.log("App.js/LogoutHandle ", e);
          }
        }
        async function call2() {
          try {
            await AsyncStorage.multiRemove(await AsyncStorage.getAllKeys());
            console.log(
              "App.js/LogoutHandle ",
              "AsyncStorage cleared successfully!"
            );
          } catch (error) {
            console.error("Error clearing AsyncStorage:", error);
          }
        }

        call1();
        call2();

        db.transaction((tx) => {
          tx.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
            [],
            (tx1, result) => {
              console.log("App.js/LogoutHandle ", result);
              let i = 0;
              for (i = 0; i < result.rows.length; i++) {
                const tableName = result.rows.item(i).name;
                console.log("App.js/LogoutHandle ", tableName);
                tx.executeSql(`DROP TABLE IF EXISTS ${tableName}`);
              }
              if (i === result.rows.length) {
                console.log(
                  "App.js/LogoutHandle ",
                  "SQlite DB cleared successfully!"
                );
              }
            }
          );
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: "Login" }],
          })
        );

        navigation.closeDrawer();
      })
      .catch((err) => {
        console.log("App.js/LogoutHandle ", "Logout Error", err);
      });
  };

  return (
    <NativeBaseProvider>
      <TouchableOpacity
        onPress={() => {
          navigation.closeDrawer();
        }}
        style={{
          position: "absolute",
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
            <Avatar bg="white" size="xl">
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
            }}
            style={{
              backgroundColor: "#004aad",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              paddingLeft: 20,
            }}
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
                  routes: [{ name: "Login" }],
                })
              );

              navigation.closeDrawer();
            }}
            style={{
              backgroundColor: "#004aad",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              paddingLeft: 20,
            }}
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
        <View>
          <Divider my={5} height={1.5} />
          <Box px={5}>
            <Button
              variant="outline"
              onPress={() => {
                navigation.navigate("Main");
                navigation.closeDrawer();
              }}
              style={{
                color: "#004aad",
                borderColor: "#004aad",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                paddingLeft: 20,
              }}
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
                handleStartTrip();
              }}
              mt={4}
              style={{
                color: "#004aad",
                borderColor: "#004aad",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                paddingLeft: 20,
              }}
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
              style={{
                color: "#004aad",
                borderColor: "#004aad",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                paddingLeft: 20,
              }}
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
            <Button
              variant="outline"
              onPress={() => {
                navigation.navigate("DeviceInfoScreen");
              }}
              mt={4}
              style={{
                color: "#004aad",
                borderColor: "#004aad",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                paddingLeft: 25,
              }}
              startIcon={
                // <MaterialIcons
                //   name="motorbike"
                //   style={{ fontSize: 20, color: "#004aad" }}
                // />
                <Icon name="mobile" size={22} color="#004aad" />
              }
            >
              <Text style={{ color: "#004aad" }}>Device Info</Text>
            </Button>
          </Box>
        </View>
      ) : null}
      <Divider my={5} height={1.5} />
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
            <Icon
              name="language"
              style={{
                fontSize: 20,
                color: "#004aad",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                paddingLeft: 20,
              }}
            />
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
        _text={{ color: "gray.400", fontSize: "xs" }}
      >
        <Image
          style={{ width: 190, height: 150 }}
          source={require("./src/assets/image.png")}
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
