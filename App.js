/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import "react-native-gesture-handler";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./src/redux/store";
import { useRoute } from "@react-navigation/native";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";

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
import { setTripStatus } from "./src/redux/slice/tripSlice";
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
import Mixpanel from "react-native-mixpanel";
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
  const userEmail = useSelector((state) => state.user.user_email);
  const notificationCount = useSelector((state) => state.notification.count);
  // const [notificationCount,setNotificationCount1]=useState(0);
  const syncTime = useSelector((state) => state.autoSync.syncTime);
  const forceSync = useSelector((state) => state.autoSync.forceSync);
  const token = useSelector((state) => state.user.token);
  const isAutoSyncEnable = useSelector(
    (state) => state.autoSync.isAutoSyncEnable
  );

  const currentDateValue =
    useSelector((state) => state.currentDate.currentDateValue) ||
    new Date().toISOString().split("T")[0];
  const deviceInfo = useSelector((state) => state.deviceInfo.currentDeviceInfo);
  const additionalWorkloadInfo11 = useSelector(
    (state) => state.additionalWorkloadInfo.currentAdditionalWorkloadInfo
  );
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [isLoadingSF, setIsLoadingSF] = useState(false);
  const [data, setData] = useState([]);
  const [isLogin, setIsLogin] = useState(false);
  const [scannedStatus, SetScannedStatus] = useState(0);
  const [isMixPanelInit, setIsMixPanelInit] = useState(false);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [tripID, setTripID] = useState("");
  const [showModal11, setShowModal11] = useState(false);
  const [dataN, setDataN] = useState([]);

  // console.log('App.js/ ',additionalWorkloadInfo11);
  // console.log('App.js/ ',userId);
  const DisplayData = async () => {
    const decodedToken = token ? jwtDecode(token) : null;
    const currentEpochTime = Math.floor(Date.now() / 1000);
    if (userId && decodedToken?.exp >= currentEpochTime) {
      try {
        // console.log('App.js/ ',"UserId",userId);
        const fetchData = async () => {
          try {
            const response = await axios.get(
              `${backendUrl}SellerMainScreen/getadditionalwork/${userId}`,
              { headers: getAuthorizedHeaders(token) }
            );
            const responseData = response?.data?.data;
            setDataN(responseData);
            // console.log('App.js/ ','AdditionalWorkload API data=============================================>>>>>>>>>>>>');
            dispatch(setAdditionalWorkloadData(responseData));
            console.log(
              "App.js/DisplayData ",
              "Additional Workload API Data:",
              response.data.data.length
            );
            setShowModal11(responseData && responseData.length > 0);
          } catch (error) {
            console.log("App.js/DisplayData ", "Error Msg11:", error);
          }
        };
        fetchData();
        // const pollingInterval = 20000;
        // const intervalId = setInterval(fetchData, pollingInterval);
        // return () => {
        //   clearInterval(intervalId);
        // };
      } catch (error) {
        console.log("App.js/DisplayData ", "Error Msg1:", error);
      }
    }
  };
  useEffect(() => {
    DisplayData();
  }, [userId, token]);
  useEffect(() => {
    setShowModal11(dataN && dataN.length > 0);
  }, [userId, setShowModal11]);

  const AcceptHandler = async (consignorCodeAccept, stopId, tripId) => {
    // console.log('App.js/ ','df')
    console.log("App.js/AcceptHandler ", {
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
            "App.js/AcceptHandler ",
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
          console.log("App.js/AcceptHandler ", error);
        });
    }
  };

  const RejectHandler = async (consignorCodeReject, stopId, tripId) => {
    console.log("App.js/RejectHandler ", "REJECT ");
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
          console.log("App.js/RejectHandler ", "Msg Rejected ", response.data);
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
          console.log("App.js/RejectHandler ", error);
        });
    }
  };

  let m = 0;
  // console.log('App.js/ ',latitude," " ,longitude);
  useEffect(() => {
    if (userId) {
      current_location();
    }
  }, [token]);

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
  useEffect(() => {
    Mixpanel.sharedInstanceWithToken("c8b2a1b9ad65958a04d82787add43a72")
      .then(() => {
        setIsMixPanelInit(true);
        console.log("App.js/Mixpanel ", "Mixpanel is initialized");
      })
      .catch((error) => {
        console.log(
          "App.js/Mixpanel ",
          "Mixpanel initialization error:",
          error
        );
      });
  }, []);
  // console.log('App.js/ ',"CurrentDate :",currentDateValue);

  useEffect(() => {
    // console.log('App.js/ ',"CurrentDate :", currentDateValue);
    const updateDateAtMidnight = () => {
      const currentDate = new Date();
      const currentDay = currentDate.toISOString().split("T")[0];
      // const temp=currentDateValue;
      if (currentDay !== currentDateValue) {
        // console.log('App.js/ ',"New Date :", currentDay);
        dispatch(setCurrentDateValue(currentDay));

        deleteRowsByDate("SellerMainScreenDetails");
        deleteRowsByDate("SyncSellerPickUp");
        deleteRowsByDate("TripDetails");
        deleteRowsByDate("noticeMessages");
        deleteRowsByDate("ShipmentFailure");
        deleteRowsByDateBag("closeBag1");
        deleteRowsByDateBag("closeHandoverBag1");
        // if(temp!==0){
        //   pull_API_Data();
        // }
      }
    };

    const checkAndUpdateDate = setInterval(updateDateAtMidnight, 60000); // Checks every minute

    return () => clearInterval(checkAndUpdateDate);
  }, [currentDateValue, dispatch]);

  const deleteRowsByDate = (tableName) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 3);
    const yesterdayDateString = yesterday.toISOString().split("T")[0];

    db.transaction((tx) => {
      tx.executeSql(
        `DELETE FROM ${tableName} WHERE date <= ?`,
        [yesterdayDateString],
        (_, { rowsAffected }) => {
          console.log(
            "App.js/deleteRowsByDate ",
            `${rowsAffected} rows deleted from ${tableName}`
          );
        },
        (error) => {
          console.log(
            "App.js/deleteRowsByDate ",
            `Error deleting rows from ${tableName}:`,
            error
          );
        }
      );
    });
  };

  const deleteRowsByDateBag = (tableName) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 3);
    const yesterdayDateString = yesterday.toISOString().split("T")[0];
    console.log("App.js/deleteRowsByDateBag ", yesterdayDateString);
    db.transaction((tx) => {
      tx.executeSql(
        `DELETE FROM ${tableName} WHERE bagDate <= ?`,
        [yesterdayDateString],
        (_, { rowsAffected }) => {
          console.log(
            "App.js/deleteRowsByDateBag ",
            `${rowsAffected} rows deleted from ${tableName}`
          );
        },
        (error) => {
          console.log(
            "App.js/deleteRowsByDateBag ",
            `Error deleting rows from ${tableName}:`,
            error
          );
        }
      );
    });
  };

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

  // const fetchDeviceType = async () => {
  //   const isTablet = await DeviceInfo.isTablet();
  //   const isMobile = !isTablet;

  //   if (isTablet) {
  //     return 'Tablet';
  //   } else if (isMobile) {
  //     return 'Mobile';
  //   }
  // };

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
    if (userId) {
      console.log(
        "App.js/Mixpanel ",
        "===Background Task Run UseEffect Called==="
      );
      if (isMixPanelInit) {
        Mixpanel.trackWithProperties("Background Task Run UseEffect Called", {
          userId: userId,
          userEmail: userEmail,
        });
      }

      const timer = BackgroundTimer.runBackgroundTimer(() => {
        if (isAutoSyncEnable) {
          loadAPI_3();
          push_Data("auto");
          if (isMixPanelInit) {
            Mixpanel.trackWithProperties("Auto sync called", {
              userId: userId,
              userEmail: userEmail,
            });
          }
          console.log("App.js/Mixpanel ", "===Auto sync called===");
        }
      }, autoSyncTime);

      return () => {
        BackgroundTimer.stopBackgroundTimer(timer);
      };
    }
  }, [userId]);

  useEffect(() => {
    if (forceSync) {
      loadAPI_3();
      push_Data();
      if (isMixPanelInit) {
        Mixpanel.trackWithProperties("Force sync called", {
          userId: userId,
          userEmail: userEmail,
        });
      }
      console.log("App.js/forceSync ", "===Force sync called===");
    }
  }, [forceSync, token]);

  useEffect(() => {
    // loadAPI_3();
    pull_API_Data();
  }, [userId, token]);

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

  function NotificationCountIncrease() {
    // dispatch(setNotificationCount(5));
    // dispatch(setNotificationCount(useSelector((state) => state.notification.count) + 1));
  }

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
      DisplayData();
      console.log("App.js/onMessage ", "Notification Arrived");
      handleIncomingMessage(remoteMessage);
      PushNotification.localNotification({
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        channelId: "AdditionalWork_1",
      });
      pull_API_Data();
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

  // useEffect(() => {
  //   const unsubscribe = messaging().onMessage(async (remoteMessage) => {
  //     // Handle FCM message here
  //   });

  //   const unsubscribeNotification = messaging().onNotificationOpenedApp(
  //     (notificationOpen) => {
  //       console.log('App.js/ ',
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
  //         console.log('App.js/ ',
  //           "Opened via notification:",
  //           notificationOpen.notification
  //         );
  //         note11();
  //         // navigation.navigate('NewSellerAdditionNotification');
  //       } else {
  //         console.log('App.js/ ',"Opened normally");
  //       }
  //     });

  //   return () => {
  //     unsubscribe();
  //     unsubscribeNotification();
  //   };
  // }, []);
  const pull_API_Data = (syncType = "manual") => {
    if (userId && isAutoSyncEnable) {
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
      console.log("App.js/pull_API_Data ", "api pull");
      loadAPI_Data1(syncType);
      loadAPI_Data2(syncType);
      loadAPI_3();
      createTableBag1();
      loadAPI_DataSF(syncType);
      DisplayData();
      const randomValue = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
      dispatch(setIsNewSync(randomValue));
    }
  };

  const handleButtonClick = async (APIerror1) => {
    try {
      // console.log('App.js/ ',"API EROOR", "userid");
      // await callApi("APIerror1", "userid");
    } catch (error) {}
  };
  useEffect(() => {
    // This useEffect  is use to hide warnings in mobile screen .
    // LogBox.ignoreLogs(['Warning: Each child in a list should have a unique "key" prop.']);
    LogBox.ignoreAllLogs(true);
  }, []);

  useEffect(() => {
    (async () => {
      if (userId) {
        loadAPI_3();
        pull_API_Data();
        setTimeout(() => {
          loadAPI_Data1();
          loadAPI_Data2();
        }, 2000);
        // console.log('App.js/ ','Pull Data from Api');
      } else {
        navigation.navigate("Login");
      }
    })();
  }, [userId, tripID, token]);
  // console.log(token)
  // Sync button function
  // const note11 = () => {
  //   if (!isLoading) {
  //     // console.log('App.js/ ',"call notification");
  //     navigation.navigate("NewSellerAdditionNotification");
  //   }
  // };

  useEffect(() => {
    if (userId !== null) {
      setTimeout(() => {
        Login_Data_load();
      }, 10);
    }
  }, [userId, token]);

  useEffect(() => {
    if (userId !== null) {
      AsyncStorage.getItem("lastSyncTime112")
        .then((data11) => {
          dispatch(setSyncTime(data11));
          dispatch(setSyncTimeFull(data11));
        })
        .catch((e) => {
          console.log("App.js/useEffect ", e);
        });
    }
  }, [userId, token]);

  const Login_Data_load = () => {
    // console.log('App.js/ ','Login Data Load called');
    AsyncStorage.getItem("apiDataLoaded")
      .then((data11) => {
        // console.log('App.js/ ', 'Api Data Loaded value : ',data11);
        setIsLogin(data11);
        if (data11 === "false") {
          // console.log('App.js/ ',"1st time call");
          pull_API_Data();
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
  // console.log('App.js/ ',userId);
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

  async function postSPS(data, syncType) {
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
    pull_API_Data(syncType);
  }

  const push_Data = (syncType = "manual") => {
    fetchTripInfo();
    if (isAutoSyncEnable) {
      console.log(
        "App.js/push_Data ",
        "push data function",
        new Date().toJSON().slice(0, 10).replace(/-/g, "/")
      );

      dispatch(setForceSync(false));

      Login_Data_load();

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

      if (isMixPanelInit) {
        Mixpanel.trackWithProperties("Post SPS Done at time: " + datetime, {
          userId: userId,
          userEmail: userEmail,
        });
      }

      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM SellerMainScreenDetails WHERE status IS NOT Null AND syncStatus IS Null",
          [],
          (tx1, results) => {
            if (results.rows.length > 0) {
              if (syncType == "manual") {
                ToastAndroid.show("Synchronizing data...", ToastAndroid.SHORT);
              }
              let temp = [];
              for (let i = 0; i < results.rows.length; ++i) {
                temp.push(results.rows.item(i));
              }
              postSPS(temp, syncType);
              if (syncType == "manual") {
                ToastAndroid.show(
                  "Synchronizing data finished",
                  ToastAndroid.SHORT
                );
              }
            } else {
              console.log(
                "App.js/push_Data ",
                "Only Pulling Data.No data to push..."
              );
              pull_API_Data(syncType);
            }
          }
        );
      });
    }
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
        `CREATE TABLE IF NOT EXISTS SyncSellerPickUp( consignorCode VARCHAR(200) ,userId VARCHAR(100), 
            consignorName VARCHAR(200),sellerIndex INT(20),consignorAddress1 VARCHAR(200),consignorAddress2 VARCHAR(200),consignorCity VARCHAR(200),consignorPincode,consignorLatitude INT(20),consignorLongitude DECIMAL(20,10),consignorContact VARCHAR(200),ReverseDeliveries INT(20),runSheetNumber VARCHAR(200),ForwardPickups INT(20), BagOpenClose11 VARCHAR(200), ShipmentListArray VARCHAR(800),contactPersonName VARCHAR(100),otpSubmitted VARCHAR(50),otpSubmittedDelivery VARCHAR(50), stopId VARCHAR(200) PRIMARY KEY, FMtripId VARCHAR(200),date Text)`,
        [],
        (sqlTxn, res) => {
          // console.log('App.js/ ',"table created successfully consignorList");
          // loadAPI_Data();
        },
        (error) => {
          console.log(
            "App.js/createTables1 ",
            "error on creating table " + error.message
          );
        }
      );
    });
  };

  const fetchTripInfo = async () => {
    db.transaction((txn) => {
      txn.executeSql(
        "SELECT * FROM TripDetails WHERE (tripStatus = ? OR tripStatus = ?) AND userID = ? AND date = ?",
        [20, 50, userId, currentDateValue],
        (tx, result) => {
          if (result.rows.length > 0) {
            setTripID(result.rows.item(0).tripID);
            console.log("date", result.rows.item(0).date > today);
          } else {
            txn.executeSql(
              "SELECT * FROM TripDetails WHERE tripStatus = ? AND userID = ? AND date = ?  ORDER BY tripID DESC LIMIT 1",
              [200, userId, currentDateValue],
              (tx, result) => {
                if (result.rows.length > 0) {
                  setTripID(result.rows.item(0).tripID);
                }
              }
            );
          }
        }
      );
    });
  };

  useEffect(() => {
    fetchTripInfo();
  }, [userId]);
  // console.log("token",token)
  const loadAPI_Data1 = (syncType) => {
    if (syncType == "manual") {
      setIsLoading1(true);
    }
    createTables1();
    const decodedToken = token ? jwtDecode(token) : null;
    const currentEpochTime = Math.floor(Date.now() / 1000);
    if (tripID && decodedToken?.exp >= currentEpochTime) {
      (async () => {
        await axios
          .get(backendUrl + `SellerMainScreen/consignorsList/${userId}`, {
            params: {
              tripID: tripID,
            },
            headers: getAuthorizedHeaders(token),
          })
          .then(
            (res) => {
              console.log(
                "App.js/loadAPI_Data1 ",
                "API 1 OK: " + res.data.data.length
              );
              // console.log('App.js/ ',res);
              for (let i = 0; i < res.data.data.length; i++) {
                // let m21 = JSON.stringify(res.data[i].consignorAddress, null, 4);
                db.transaction((txn) => {
                  txn.executeSql(
                    "SELECT * FROM SyncSellerPickUp WHERE stopId = ? AND FMtripId=?",
                    [res.data.data[i].stopId, tripID],
                    (tx, result) => {
                      if (result.rows.length <= 0) {
                        db.transaction((txn) => {
                          txn.executeSql(
                            "INSERT OR REPLACE INTO SyncSellerPickUp( contactPersonName,consignorCode ,userId ,consignorName,sellerIndex ,consignorAddress1,consignorAddress2,consignorCity,consignorPincode,consignorLatitude,consignorLongitude,consignorContact,ReverseDeliveries,runSheetNumber,ForwardPickups,BagOpenClose11, ShipmentListArray,otpSubmitted,otpSubmittedDelivery,stopId, FMtripId,date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                            [
                              res.data.data[i].contactPersonName,
                              res.data.data[i].consignorCode,
                              userId,
                              res.data.data[i].consignorName,
                              res.data.data[i].sequenceNumber,
                              res.data.data[i].consignorAddress1,
                              res.data.data[i].consignorState,
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
                              res.data.data[i].stopId,
                              res.data.data[i].FMtripId,
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
                                "App.js/loadAPI_Data1 ",
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
            },
            (error) => {
              console.log(
                "App.js/loadAPI_Data1 ",
                "error api SellerMainScreen/consignorslist/",
                error
              );
              setIsLoading1(false);
            }
          )
          .catch((error) => {
            console.log(
              "App.js/loadAPI_Data1/Error in API Call Get consgnorsList",
              error
            );
            setIsLoading1(false);
          });
      })();
    } else {
      setIsLoading1(false);
    }
  };
  const viewDetails1 = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM TripDetails", [], (tx1, results) => {
        let temp = [];
        // console.log('App.js/ ',results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));

          // console.log(
          //   "App.js/ ",
          //   "SellerMainScreenDetails",
          //   results.rows.item(i)
          // );
          // var address121 = results.rows.item(i).consignorAddress;
          // var address_json = JSON.parse(address121);
          // console.log('App.js/ ',typeof (address_json));
          // console.log('App.js/ ',"Address from local db : " + address_json.consignorAddress1 + " " + address_json.consignorAddress2);
          // ToastAndroid.show('consignorName:' + results.rows.item(i).consignorName + "\n" + 'PRSNumber : ' + results.rows.item(i).PRSNumber, ToastAndroid.SHORT);
        }
        if (m === 4) {
          ToastAndroid.show("Sync Successful", ToastAndroid.SHORT);
          setIsLogin(true);
          AsyncStorage.setItem("apiDataLoaded", "true");
          // console.log(
          //   "App.js/viewDetails1 ",
          //   "All " + 4 + " APIs loaded successfully "
          // );
          m = 0;

          AsyncStorage.setItem("refresh11", "refresh");
        } else {
          // console.log(
          //   "App.js/viewDetails1 ",
          //   "Only " + m + " APIs loaded out of 4 "
          // );
        }
        // m++;
        // ToastAndroid.show("Sync Successful",ToastAndroid.SHORT);
        // console.log('App.js/ ','Data from Local Database : \n ', JSON.stringify(temp, null, 4));
        // console.log('App.js/ ','data loaded API 1',temp);
        // console.log('App.js/ ','Table1 DB OK:', temp.length);
      });
    });
  };

  // Table 2
  const createTables2 = () => {
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
          date Text
          )`,
        [],
        (sqlTxn, res) => {
          // console.log('App.js/ ',"table created successfully workload");
          // loadAPI_Data();
        },
        (error) => {
          console.log(
            "App.js/createTables2 ",
            "error on creating table SellerMainScreenDetails" + error.message
          );
        }
      );
    });
  };

  const loadAPI_Data2 = (syncType) => {
    if (syncType == "manual") {
      setIsLoading2(true);
    }
    db.transaction((txn) => {
      txn.executeSql(
        "SELECT * FROM TripDetails WHERE (tripStatus = ? OR tripStatus = ?) AND userID = ?",
        [20, 50, userId],
        (tx, result) => {
          if (result.rows.length > 0) {
            var tripStatus = result.rows.item(0).tripStatus;
          }
          console.log("App.js/loadAPI_Data2 ", "Trip id: ", tripID, tripStatus);
          const decodedToken = token ? jwtDecode(token) : null;
          const currentEpochTime = Math.floor(Date.now() / 1000);
          if (decodedToken?.exp >= currentEpochTime) {
            (async () => {
              await axios
                .get(backendUrl + `SellerMainScreen/workload/${userId}`, {
                  params: {
                    tripID: tripID,
                  },
                  headers: getAuthorizedHeaders(token),
                })
                .then(
                  (res) => {
                    createTables2();
                    console.log(
                      "App.js/loadAPI_Data2 ",
                      "API 2 OK: " + res.data.data.length
                    );
                    for (let i = 0; i < res.data.data.length; i++) {
                      const shipmentStatus = res.data.data[i].shipmentStatus;

                      if (
                        !(tripStatus == 50 && shipmentStatus === "WFP") &&
                        tripID
                      ) {
                        db.transaction((txn) => {
                          txn.executeSql(
                            "SELECT * FROM SellerMainScreenDetails where clientShipmentReferenceNumber = ? AND FMtripId=?",
                            [
                              res.data.data[i].clientShipmentReferenceNumber,
                              tripID,
                            ],
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
                          packagingAction,
                          postRDStatus,
                          stopId,
                          FMtripId,
                          date
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                                    [
                                      res.data.data[i]
                                        .clientShipmentReferenceNumber,
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
                                      res.data.data[i].shipmentStatus ==
                                        "PUS" ||
                                      res.data.data[i].shipmentStatus ==
                                        "PUC" ||
                                      res.data.data[i].shipmentStatus ==
                                        "DLR" ||
                                      res.data.data[i].shipmentStatus == "RDS"
                                        ? "accepted"
                                        : res.data.data[i].shipmentStatus ==
                                            "PUR" ||
                                          res.data.data[i].shipmentStatus ==
                                            "RDR" ||
                                          res.data.data[i].shipmentStatus ==
                                            "UDU" ||
                                          res.data.data[i].shipmentStatus ==
                                            "PUF"
                                        ? "rejected"
                                        : res.data.data[i].shipmentStatus ==
                                          "RAH"
                                        ? res.data.data[i].shipmentAction ==
                                          "Seller Pickup"
                                          ? "accepted"
                                          : "rejected"
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
                                      null,
                                      res.data.data[i].stopId,
                                      res.data.data[i].FMtripId,
                                      currentDateValue,
                                    ],
                                    (sqlTxn, _res) => {
                                      // console.log('App.js/ ',`\n Data Added to local db successfully`);
                                      // console.log('App.js/ ',res);
                                    },
                                    (error) => {
                                      console.log(
                                        "App.js/loadAPI_Data2 ",
                                        "error on adding data " + error.message
                                      );
                                    }
                                  );
                                });
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
                    setIsLoading2(false);
                  },
                  (error) => {
                    console.log("App.js/loadAPI_Data2 ", error);
                    setIsLoading2(false);
                  }
                )
                .catch((error) => {
                  console.log(
                    "App.js/loadAPI_Data2/API call workload error",
                    error
                  );
                  setIsLoading2(false);
                });
            })();
          }
        }
      );
    });
  };
  // console.log("token",token)
  const createTables3 = () => {
    db.transaction((txn) => {
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS TripDetails( 
          tripID VARCHAR(200),
          userID VARCHAR(200),
          vehicleNumber VARCHAR(200),
          tripStatus VARCHAR(200),
          createdAt VARCHAR(200),
          updatedAt VARCHAR(200),
          date INTEGER
          )`,
        [],
        (sqlTxn, res) => {
          // console.log('App.js/ ',"table created successfully TripDetails");
          // loadAPI_Data();
        },
        (error) => {
          console.log(
            "App.js/createTables3 ",
            "error on creating table " + error.message
          );
        }
      );
    });
  };

  const loadAPI_3 = () => {
    createTables3();
    const decodedToken = token ? jwtDecode(token) : null;
    const currentEpochTime = Math.floor(Date.now() / 1000);
    if (decodedToken?.exp >= currentEpochTime) {
      (async () => {
        await axios
          .get(backendUrl + "UserTripInfo/getUserTripInfo", {
            params: {
              feUserID: userId,
            },
            headers: getAuthorizedHeaders(token),
          })
          .then(
            (res) => {
              for (let i = 0; i < res.data.res_data.length; i++) {
                let today = new Date();
                today.setUTCHours(0, 0, 0, 0);
                today = today.valueOf();
                if (res.data.res_data[i].date > today) {
                  db.transaction((txn) => {
                    txn.executeSql(
                      `INSERT OR REPLACE INTO TripDetails(tripID , userID, vehicleNumber, tripStatus, createdAt ,updatedAt,date
                          ) VALUES (?,?,?,?,?,?,?)`,
                      [
                        res.data.res_data[i].tripID,
                        res.data.res_data[i].userID,
                        res.data.res_data[i].vehicleNumber,
                        res.data.res_data[i].tripStatus,
                        res.data.res_data[i].createdAt,
                        res.data.res_data[i].updatedAt,
                        currentDateValue,
                      ],
                      (sqlTxn, _res) => {
                        m++;
                        fetchTripInfo();
                      },
                      (error) => {
                        console.log(
                          "App.js/ ",
                          "error on adding data in tripdetails " + error.message
                        );
                      }
                    );
                  });
                }
              }
            },
            (error) => {
              console.log("App.js/ ", "tripdetailserror", error);
            }
          );
      })();
    }
  };
  // console.log(token)
  const createTablesSF = () => {
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
          // console.log('App.js/ ',"Table created successfully Notice");
        },
        (error) => {
          console.log(
            "App.js/createTablesSF ",
            "Error creating table: ",
            error
          );
        }
      );
    });
    db.transaction((txn) => {
      // txn.executeSql('DROP TABLE IF EXISTS ShipmentFailure', []);
      txn.executeSql(
        "CREATE TABLE IF NOT EXISTS ShipmentFailure(_id VARCHAR(24) PRIMARY KEY,description VARCHAR(255),parentCode VARCHAR(20), short_code VARCHAR(20), consignor_failure BOOLEAN, fe_failure BOOLEAN, operational_failure BOOLEAN, system_failure BOOLEAN, enable_geo_fence BOOLEAN, enable_future_scheduling BOOLEAN, enable_otp BOOLEAN, enable_call_validation BOOLEAN, created_by VARCHAR(10), last_updated_by VARCHAR(10), applies_to VARCHAR(255),life_cycle_code INT(20), __v INT(10),date Text)",
        [],
        (sqlTxn, res) => {
          // console.log('App.js/ ',"Table created successfully ShipmentFailure");
          // loadAPI_Data();
        },
        (error) => {
          console.log(
            "App.js/createTablesSF ",
            "error on creating table " + error.message
          );
        }
      );
    });
  };
  const loadAPI_DataSF = (syncType) => {
    if (syncType == "manual") {
      setIsLoadingSF(true);
    }
    createTablesSF();
    const decodedToken = token ? jwtDecode(token) : null;
    const currentEpochTime = Math.floor(Date.now() / 1000);
    if (decodedToken?.exp >= currentEpochTime) {
      (async () => {
        await axios
          .get(backendUrl + "ADshipmentFailure/getList", {
            headers: getAuthorizedHeaders(token),
          })
          .then(
            (res) => {
              // console.log('App.js/ ','Table6 API OK: ' + res.data.data.length);
              // console.log('App.js/ ',res.data);
              for (let i = 0; i < res.data.data.length; i++) {
                // const appliesto=JSON.parse(JSON.stringify(res.data.data[i].appliesTo))
                const appliesto = String(res.data.data[i].appliesTo.slice());
                db.transaction((txn) => {
                  txn.executeSql(
                    `INSERT OR REPLACE INTO ShipmentFailure(_id ,description , parentCode, short_code , consignor_failure , fe_failure , operational_failure , system_failure , enable_geo_fence , enable_future_scheduling , enable_otp , enable_call_validation, created_by , last_updated_by, applies_to ,life_cycle_code , __v,date
                          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
                      currentDateValue,
                    ],
                    (sqlTxn, _res) => {
                      // console.log('App.js/ ','\n Data Added to local db 6 ');
                      // console.log('App.js/ ',res);
                    },
                    (error) => {
                      console.log(
                        "App.js/loadAPI_DataSF ",
                        "error on adding data " + error.message
                      );
                    }
                  );
                });
              }
              m++;
              // console.log('App.js/ ','value of m6 '+m);

              // viewDetailsSF();
              setIsLoadingSF(false);
            },
            (error) => {
              console.log("App.js/loadAPI_DataSF ", error);
              setIsLoadingSF(false);
            }
          )
          .catch((error) => {
            console.log(
              "App.js/loadAPI_DataSF/ADshipmentFailure/getList Error",
              error
            );
            setIsLoadingSF(false);
          });
      })();
    }
  };

  const createTableBag1 = () => {
    // AsyncStorage.setItem("acceptedItemData11", "");

    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS closeBag1 (bagSeal TEXT PRIMARY KEY, bagId TEXT, bagDate TEXT, AcceptedList TEXT,status TEXT,consignorCode Text, stopId Text)",
        [],
        (tx, results) => {
          // console.log('App.js/ ',"Table created successfully Pickup close bag");
        },
        (error) => {
          console.log(
            "App.js/createTableBag1 ",
            "Error occurred while creating the table:",
            error
          );
        }
      );
    });

    db.transaction((tx) => {
      // tx.executeSql('DROP TABLE IF EXISTS closeHandoverBag1', []);
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS closeHandoverBag1 (bagSeal TEXT , bagId TEXT PRIMARY KEY, bagDate TEXT, AcceptedList TEXT,status TEXT,consignorCode text,stopId Text,consignorName Text)",
        [],
        (tx, results) => {
          // console.log('App.js/ ',"Table created successfully Handover Close Bag");
        },
        (error) => {
          console.log(
            "App.js/createTableBag1 ",
            "Error occurred while creating the table:",
            error
          );
        }
      );
    });
  };

  const viewDetailsSF = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM ShipmentFailure", [], (tx1, results) => {
        let temp = [];
        // console.log('App.js/ ',results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        // console.log('App.js/ ',"1173", temp);
        // if (m <= 6){
        //   // ToastAndroid.show('Sync Successful',ToastAndroid.SHORT);
        //   console.log('App.js/ ','Waiting for ' + ( 7 - m ) + ' API to load. Plz wait...');
        //   // m = 0;
        // }
        //  else {
        //   console.log('App.js/ ','Only ' + m + ' APIs loaded out of 6 ');
        // }
        // console.log('App.js/ ','Data from Local Database 6 : \n ', temp);
        // console.log('App.js/ ','TableSF DB OK:', temp.length);
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
                                      RejectHandler(
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
                                      AcceptHandler(
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

      {(isLoading1 || isLoading2 || isLoadingSF) &&
      userId &&
      userId.length > 0 &&
      isLogin ? (
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
    issuer: "https://uacc.logistiex.com/realms/Logistiex-Demo",
    clientId: "logistiex-demo",
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
  }, [refreshToken, refreshTime]);

  async function refreshTokenAgain(refreshToken) {
    await refresh(config, {
      refreshToken: refreshToken,
    })
      .then((response) => {
        if (response?.idToken) {
          AsyncStorage.setItem("token", response?.accessToken);
          AsyncStorage.setItem("idToken", response?.idToken);

          dispatch(setToken(response?.accessToken));
          dispatch(setIdToken(response?.idToken));
          console.log("App.js/refreshTokenAgain/Token Refreshed", response);
        } else {
          console.log("App.js/refreshTokenAgain/No ID Token Error", response);
          LogoutHandle();
        }
      })
      .catch((error) => {
        console.log("App.js/refreshTokenAgain/Refresh Token Error".error);
        LogoutHandle();
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
      { issuer: "https://uacc.logistiex.com/realms/Logistiex-Demo" },
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
