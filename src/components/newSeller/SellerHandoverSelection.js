/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Image,
  Center,
  NativeBaseProvider,
  Fab,
  Icon,
  Button,
  Box,
  Heading,
  Modal,
  VStack,
  Alert,
  Input,
} from "native-base";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  getPick,
  TouchableWithoutFeedbackBase,
  ToastAndroid,
  Linking,
  ActivityIndicator,
} from "react-native";
import Lottie from "lottie-react-native";
import { ProgressBar } from "@react-native-community/progress-bar-android";
import call from "react-native-phone-call";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Pie from "react-native-pie";
import { openDatabase } from "react-native-sqlite-storage";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
const db = openDatabase({
  name: "rn_sqlite",
});
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import PieChart from "react-native-pie-chart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GetLocation from "react-native-get-location";
import { backendUrl } from "../../utils/backendUrl";
import { setAutoSync } from "../../redux/slice/autoSyncSlice";
import { useDispatch, useSelector } from "react-redux";
import OTPTextInput from "react-native-otp-textinput";
import DeviceInfo from "react-native-device-info";
import { getAuthorizedHeaders } from "../../utils/headers";

const SellerHandoverSelection = ({ route }) => {
  const dispatch = useDispatch();
  const syncTimeFull = useSelector((state) => state.autoSync.syncTimeFull);
  const [barcodeValue, setBarcodeValue] = useState("");
  const shipmentData =
    backendUrl + `SellerMainScreen/getSellerDetails/${route.params.paramKey}`;
  const [acc, setAcc] = useState(0);
  const [pending, setPending] = useState(route.params.Reverse);
  const [token, setToken] = useState(route.params.token);
  const [Forward, setForward] = useState("");
  const [reject, setReject] = useState(0);
  const [data, setData] = useState([]);
  const [order, setOrder] = useState([]);
  const [newdata, setnewdata] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState(route.params.phone);
  const [type, setType] = useState("");
  const [DropDownValue, setDropDownValue] = useState(null);
  const [DropDownValue1, setDropDownValue1] = useState(null);
  const [rejectStage, setRejectStage] = useState(null);
  const [CloseData, setCloseData] = useState([]);
  const [NotAttemptData, setNotAttemptData] = useState([]);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [notPicked11, setNotPicked11] = useState(0);
  const [rejectedOrder11, setRejectedOrder11] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [rejectionCode, setRejectionCode] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible3, setModalVisible3] = useState(false);
  const [name, setName] = useState(route.params.contactPersonName);
  const [enableOTP, setEnableOTP] = useState(0);
  const [inputOtp, setInputOtp] = useState("");
  const currentDateValue =
    useSelector((state) => state.currentDate.currentDateValue) ||
    new Date().toISOString().split("T")[0];
  const [showModal11, setShowModal11] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [timer]);
  // useEffect(() => {
  //   if(!loading){
  //     current_location();}
  //   }, [loading]);

  // const current_location = () => {
  //   GetLocation.getCurrentPosition({
  //     enableHighAccuracy: true,
  //     timeout: 10000,
  //   })
  //     .then(location => {
  //       setLatitude(location.latitude);
  //       setLongitude(location.longitude);
  //     })
  //     .catch(error => {
  //       RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
  //         interval: 10000,
  //         fastInterval: 5000,
  //       })
  //         .then(status => {
  //           if (status) {
  //             console.log('SellerHandoverSelection.js/ ','Location enabled');
  //           }
  //         })
  //         .catch(err => {
  //           console.log('SellerHandoverSelection.js/ ',err);
  //         });
  //       console.log('SellerHandoverSelection.js/ ','Location Lat long error', error);
  //     });
  // };
  const DisplayData = async () => {
    closePickup11();
  };
  const notPicked = async () => {
    AsyncStorage.setItem("refresh11", "refresh");
    setLoading(true);
    const deviceId = await DeviceInfo.getUniqueId();
    const IpAddress = await DeviceInfo.getIpAddress();
    const eventTime = new Date().valueOf();
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    })
      .then((location) => {
        setLatitude(location.latitude);
        setLongitude(location.longitude);

        axios
          .post(
            backendUrl + "SellerMainScreen/deliveryAttemptFailed",
            {
              consignorCode: route.params.consignorCode,
              rejectionReason: rejectionCode,
              feUserID: route.params.userId,
              latitude: parseFloat(location.latitude),
              longitude: parseFloat(location.longitude),
              eventTime: eventTime,
              rejectionStage: "SLDF",
              stopId: route.params.stopId,
              tripID: route.params.tripId,
              deviceId: deviceId,
              deviceIPaddress: IpAddress,
            },
            { headers: getAuthorizedHeaders(token) }
          )
          .then(function (response) {
            console.log("SellerHandoverSelection.js/notPicked ", response.data);
            db.transaction((tx) => {
              tx.executeSql(
                'UPDATE SellerMainScreenDetails SET status="notDelivered", eventTime=?, latitude=?, longitude=?, rejectionReasonL1=? WHERE shipmentAction="Seller Delivery" AND (handoverStatus="accepted" AND status IS NULL) AND stopId=? AND FMtripId=?',
                [
                  eventTime,
                  location.latitude,
                  location.longitude,
                  rejectionCode,
                  route.params.stopId,
                  route.params.tripId,
                ],
                (tx1, results) => {
                  let temp = [];
                  console.log(
                    "SellerHandoverSelection.js/notPicked ",
                    results.rows.length
                  );
                  for (let i = 0; i < results.rows.length; ++i) {
                    temp.push(results.rows.item(i));
                  }
                }
              );
            });

            db.transaction((tx) => {
              tx.executeSql(
                'UPDATE SyncSellerPickUp  SET otpSubmittedDelivery="true" WHERE stopId=? AND FMtripId=? ',
                [route.params.stopId, route.params.tripId],
                (tx1, results) => {
                  if (results.rowsAffected > 0) {
                    console.log(
                      "SellerHandoverSelection.js/notPicked ",
                      "otp status updated seller delivery in seller table "
                    );
                    // navigation.navigate(SellerDeliveries);
                    navigation.goBack();
                    setLoading(false);
                    // loadSellerPickupDetails();
                  } else {
                    console.log(
                      "SellerHandoverSelection.js/notPicked ",
                      "opt status not updated in seller delivery in local table"
                    );
                  }
                }
              );
            });
            setMessage("Successfully submitted");
            setStatus("success");
          })
          .catch(function (error) {
            console.log("SellerHandoverSelection.js/notPicked ", error);
            setMessage("Submission failed");
            // navigation.goBack();
            setStatus("error");
            setLoading(false);
            ToastAndroid.show("API Error", ToastAndroid.SHORT);
          });
        setShowModal(true);
      })
      .catch((error) => {
        ToastAndroid.show("Turn on device location", ToastAndroid.SHORT);
        console.log(
          "SellerHandoverSelection.js/notPicked ",
          "Location Lat long error",
          error
        );
        setDropDownValue("");
        setDropDownValue1("");
        setLoading(false);
      });
    // navigation.navigate('SellerDeliveries')
  };
  const closePickup11 = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM ShipmentFailure", [], (tx1, results) => {
        let temp = [];
        console.log(
          "SellerHandoverSelection.js/closePickup11 ",
          results.rows.length
        );
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        setCloseData(temp);
      });
    });
  };
  const DisplayData2 = async () => {
    NotAttemptReasons11();
  };

  const NotAttemptReasons11 = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM NotAttemptReasons", [], (tx1, results) => {
        let temp = [];
        // console.log('SellerHandoverSelection.js/ ',results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        setNotAttemptData(temp);
      });
    });
  };

  useEffect(() => {
    DisplayData();
  }, []);

  useEffect(() => {
    DisplayData2();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(setAutoSync(true));
      loadSellerPickupDetails();
    });
    return unsubscribe;
  }, [navigation, syncTimeFull]);

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("refresh11");
      if (value === "refresh") {
        loadSellerPickupDetails();
      }
    } catch (e) {
      console.log("SellerHandoverSelection.js/getData ", e);
    }
  };

  useEffect(() => {
    const StartValue = setInterval(() => {
      getData();
    }, 100);
    return () => clearInterval(StartValue);
  }, []);

  const sync11 = () => {
    loadSellerPickupDetails();
  };

  const loadSellerPickupDetails = async () => {
    await AsyncStorage.setItem("refresh11", "notrefresh");
    db.transaction((tx) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND handoverStatus="accepted"',
          [route.params.stopId, route.params.tripId],
          (tx1, results) => {
            setForward(results.rows.length);
          }
        );
      });
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND (status="accepted" OR status="tagged")',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          // let temp = [];
          // console.log('SellerHandoverSelection.js/ ',results.rows.length);
          setAcc(results.rows.length);
          if (results.rows.length === 0) {
            tx.executeSql("DROP TABLE IF EXISTS closeBag1", []);
          }
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND status="notDelivered"',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          setNotPicked11(results.rows.length);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND status="rejected"',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          setRejectedOrder11(results.rows.length);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND (handoverStatus="accepted" AND status IS NULL)',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          setPending(results.rows.length);
          setLoading(false);
        }
      );
    });
  };

  let r = [];
  // useEffect(() => {
  //   (async () => {
  //     db.transaction(tx => {
  //       tx.executeSql(
  //         'SELECT * FROM categories where ScanStatus = ?',
  //         [1],
  //         (tx, results) => {
  //           var len = results.rows.length;
  //           setPending(Forward - len);
  //         },
  //       );
  //     });
  //   })();
  // }, []);

  const loadDetails = () => {
    // setIsLoading(!isLoading);
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM SellerDetails11", [], (tx1, results) => {
        // ToastAndroid.show("Loading...", ToastAndroid.SHORT);
        let temp = [];
        // console.log('SellerHandoverSelection.js/ ',results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
          // console.log('SellerHandoverSelection.js/ ',results.rows.item(i).consignorName);
        }
        // console.log('SellerHandoverSelection.js/ ',
        // 'Data from Local Database : \n ',
        // JSON.stringify(temp, null, 4),
        // );
        setData(temp);
        //   setIsLoading(false);
      });
    });
  };

  const toggleLoading = () => {
    setIsLoading(!isLoading);
    (async () => {
      await axios
        .get(shipmentData, { headers: getAuthorizedHeaders(token) })
        .then(
          (res) => {
            setData(res.data);
          },
          (error) => {
            alert(error);
          }
        );
    })();
    setIsLoading ? navigation.navigate("loading1") : null;
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate("SellerHandoverSelection");
    }, 3000);
  };

  const triggerCall = () => {
    console.log("SellerHandoverSelection.js/triggerCall ", phone);
    Linking.openURL("tel:" + phone);
  };

  var TotalpickUp = 0;
  var CompletePickUp = 0;
  let net = TotalpickUp - CompletePickUp;

  useEffect(() => {
    let addresss = "";
    if (route && route.params) {
      if (route.params.consignorAddress1) {
        addresss += route.params.consignorAddress1;
        addresss += " ";
      }
      if (route.params.consignorAddress2) {
        addresss += route.params.consignorAddress2;
        addresss += ", ";
      }
      if (route.params.consignorCity) {
        addresss += route.params.consignorCity;
        addresss += " ";
      }
      if (route.params.consignorPincode) {
        addresss += route.params.consignorPincode;
      }
    }
    setType(addresss);
  }, []);

  function handleButtonPress(item, item2, item3) {
    if (item == "Could Not Attempt") {
      setModalVisible2(true);
      setModalVisible(false);
    } else {
      setDropDownValue(item);
      setRejectionCode(item2);
      setEnableOTP(item3);
      setRejectStage("L1");
    }
  }
  function handleButtonPress2(item, item2, item3) {
    setDropDownValue1(item);
    setRejectionCode(item2);
    setEnableOTP(item3);
    setRejectStage("L2");
  }

  function openMap() {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${route.params.consignorLatitude},${route.params.consignorLongitude}`;
    const label = type;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  }
  const sendSmsOtp = async () => {
    await axios
      .post(
        backendUrl + "SMS_new/sendOTP",
        {
          mobileNumber: phone,
          useCase: "POSTRD DELIVERY OTP",
          payLoad: {
            acceptedCount: 0,
            failedCount: pending,
          },
        },
        { headers: getAuthorizedHeaders(token) }
      )
      .then(setShowModal11(true))
      .catch((err) =>
        console.log("SellerHandoverSelection.js/sendSmsOtp ", "OTP not send")
      );
  };
  function validateOTP() {
    console.log("SellerHandoverSelection.js/validateOTP ", inputOtp, phone);
    var otp11 = inputOtp;
    axios
      .post(
        backendUrl + "SMS_new/OTPValidate",
        {
          mobileNumber: phone,
          useCase: "POSTRD DELIVERY OTP",
          otp: otp11,
        },
        { headers: getAuthorizedHeaders(token) }
      )
      .then((response) => {
        if (response.data.return) {
          setInputOtp("");
          notPicked();
          setModalVisible3(false);
          setShowModal11(false);
        } else {
          alert("Invalid OTP, please try again !!");
        }
      })
      .catch((error) => {
        console.log("SellerHandoverSelection.js/validateOTP ", error);
      });
  }

  return (
    <NativeBaseProvider>
      {loading ? (
        // <ActivityIndicator size="large" color="blue" style={{marginTop: 44}} />
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
          <Text style={{ color: "white" }}>Loading...</Text>
          <Lottie
            source={require("../../assets/loading11.json")}
            autoPlay
            loop
            speed={1}
            //   progress={animationProgress.current}
          />
          <ProgressBar width={70} />
        </View>
      ) : (
        <View>
          <Modal>
            <Modal.Content
              backgroundColor={status === "success" ? "#dcfce7" : "#fee2e2"}
            >
              <Modal.CloseButton />
              <Modal.Body>
                {status === "success" ? (
                  <Alert w="100%" status="success">
                    <VStack
                      space={1}
                      flexShrink={1}
                      w="100%"
                      alignItems="center"
                    >
                      <Alert.Icon size="4xl" />
                      <Text my={3} fontSize="md" fontWeight="medium">
                        {message}
                      </Text>
                    </VStack>
                  </Alert>
                ) : (
                  <Alert w="100%" status="error">
                    <VStack
                      space={1}
                      flexShrink={1}
                      w="100%"
                      alignItems="center"
                    >
                      <Alert.Icon size="4xl" />
                      <Text my={3} fontSize="md" fontWeight="medium">
                        {message}
                      </Text>
                    </VStack>
                  </Alert>
                )}
              </Modal.Body>
            </Modal.Content>
          </Modal>
          <Modal
            isOpen={modalVisible}
            onClose={() => {
              setModalVisible(false);
              setDropDownValue("");
            }}
            size="lg"
          >
            <Modal.Content maxWidth="350">
              <Modal.CloseButton />
              <Modal.Header>Close Delivery Reason Code</Modal.Header>
              <Modal.Body>
                {CloseData &&
                  CloseData.filter(
                    (d) =>
                      d.applies_to.includes("SLDF") && d.parentCode !== "CNA"
                  ).map((d, index) => (
                    <Button
                      key={d._id}
                      flex="1"
                      mt={2}
                      marginBottom={1.5}
                      marginTop={1.5}
                      style={{
                        backgroundColor:
                          d.description === DropDownValue
                            ? "#6666FF"
                            : "#C8C8C8",
                      }}
                      title={d.description}
                      onPress={() =>
                        handleButtonPress(
                          d.description,
                          d.short_code,
                          d.enable_otp
                        )
                      }
                    >
                      <Text
                        style={{
                          color:
                            DropDownValue == d.description ? "white" : "black",
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
                    if (!DropDownValue) {
                      ToastAndroid.show(
                        "Please Select Reason ",
                        ToastAndroid.SHORT
                      );
                    } else {
                      if (enableOTP == 1) {
                        setModalVisible3(true);
                      } else {
                        notPicked();
                      }
                      setModalVisible(false);
                    }
                  }}
                >
                  Submit
                </Button>
              </Modal.Body>
            </Modal.Content>
          </Modal>
          <Modal
            isOpen={modalVisible2}
            onClose={() => {
              setModalVisible2(false);
              setDropDownValue1("");
            }}
            size="lg"
          >
            <Modal.Content maxWidth="350">
              <Modal.CloseButton />
              <Modal.Header>Could Not Attempt Reason</Modal.Header>
              <Modal.Body>
                {CloseData &&
                  CloseData.filter(
                    (d) =>
                      d.applies_to.includes("SLDF") && d.parentCode == "CNA"
                  ).map((d, index) => (
                    <Button
                      key={d._id}
                      flex="1"
                      mt={2}
                      marginBottom={1.5}
                      marginTop={1.5}
                      style={{
                        backgroundColor:
                          d.description === DropDownValue1
                            ? "#6666FF"
                            : "#C8C8C8",
                      }}
                      title={d.description}
                      onPress={() =>
                        handleButtonPress2(
                          d.description,
                          d.short_code,
                          d.enable_otp
                        )
                      }
                    >
                      <Text
                        style={{
                          color:
                            d.description == DropDownValue1 ? "white" : "black",
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
                    if (!DropDownValue1) {
                      ToastAndroid.show(
                        "Please Select Reason ",
                        ToastAndroid.SHORT
                      );
                    } else {
                      if (enableOTP == 1) {
                        setModalVisible3(true);
                      } else {
                        notPicked();
                      }
                      setModalVisible2(false);
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
                    setModalVisible(true), setModalVisible2(false);
                  }}
                >
                  Back
                </Button>
              </Modal.Body>
            </Modal.Content>
          </Modal>
          <Modal
            isOpen={modalVisible3}
            onClose={() => {
              setModalVisible3(false);
              setDropDownValue("");
              setDropDownValue1("");
              setEnableOTP(0);
            }}
            size="lg"
          >
            <Modal.Content maxWidth="350">
              <Modal.CloseButton />
              <Modal.Header>Submit OTP</Modal.Header>
              <Modal.Body>
                <Input
                  mx="3"
                  mt={4}
                  placeholder="Receiver Name"
                  w="90%"
                  bg="gray.200"
                  size="lg"
                  value={name}
                  onChangeText={(e) => setName(e)}
                />
                <Input
                  mx="3"
                  my={4}
                  placeholder="Mobile Number"
                  w="90%"
                  bg="gray.200"
                  size="lg"
                  value={phone}
                  onChangeText={(e) => setPhone(e)}
                />
                {!showModal11 ? (
                  <Center>
                    <Button
                      w="90%"
                      size="lg"
                      style={{ backgroundColor: "#004aad", color: "#fff" }}
                      title="Submit"
                      onPress={() => {
                        sendSmsOtp();
                        setTimer(60);
                      }}
                    >
                      Send OTP
                    </Button>
                  </Center>
                ) : timer ? (
                  <Center>
                    <Button w="90%" size="lg" bg="gray.500">
                      <Text style={{ color: "white", fontSize: 16.5 }}>
                        Resend OTP in {timer}sec
                      </Text>
                    </Button>
                  </Center>
                ) : (
                  <Center>
                    <Button
                      w="90%"
                      size="lg"
                      bg="gray.500"
                      onPress={() => {
                        sendSmsOtp();
                        setTimer(60);
                      }}
                    >
                      Resend
                    </Button>
                  </Center>
                )}

                {showModal11 ? (
                  <>
                    <Center>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                        }}
                      >
                        <OTPTextInput
                          handleTextChange={(e) => setInputOtp(e)}
                          inputCount={6}
                          tintColor="#004aad"
                          offTintColor="gray"
                          containerStyle={{
                            marginTop: 4,
                            padding: 10,
                          }}
                          textInputStyle={{
                            width: "12.5%",
                            backgroundColor: "#F5F5F5",
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: "#BDBDBD",
                            padding: 10,
                          }}
                          keyboardType="number-pad"
                          onBackspace={() =>
                            console.log("SellerHandoverSelection.js/ ", "back")
                          }
                        />
                      </View>
                    </Center>
                    <Center>
                      <Button
                        w="90%"
                        size="lg"
                        bg="#004aad"
                        onPress={() => {
                          validateOTP();
                        }}
                      >
                        Verify OTP
                      </Button>
                    </Center>
                  </>
                ) : null}
              </Modal.Body>
            </Modal.Content>
          </Modal>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View
              style={{
                width: "100%",
                justifyContent: "center",
                flexDirection: "row",
                marginTop: 30,
              }}
            >
              {acc !== 0 ||
              pending !== 0 ||
              notPicked11 !== 0 ||
              rejectedOrder11 !== 0 ? (
                <PieChart
                  widthAndHeight={160}
                  series={[acc, pending, notPicked11, rejectedOrder11]}
                  sliceColor={["#4CAF50", "#2196F3", "#FEBE00", "#F44336"]}
                  doughnut={true}
                  coverRadius={0.6}
                  coverFill={"#FFF"}
                />
              ) : (
                <Center>
                  <Image
                    style={{ width: 140, height: 140 }}
                    source={require("../../assets/no_assignment.png")}
                    alt={"No data Image"}
                  />
                </Center>
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
                width: "85%",
                marginTop: 25,
                marginBottom: 5,
                alignSelf: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  backgroundColor: "#4CAF50",
                  width: "48%",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "white", alignSelf: "center" }}>
                  Accepted : {acc}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "#FEBE00",
                  // backgroundColor: '#FFEB3B',
                  width: "48%",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "white", alignSelf: "center" }}>
                  Not Delivered : {notPicked11}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                width: "85%",
                marginTop: 5,
                marginBottom: 10,
                alignSelf: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  // backgroundColor: '#F44336',
                  backgroundColor: "#2196F3",
                  width: "48%",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "white", alignSelf: "center" }}>
                  Pending : {pending}
                </Text>
              </View>
              <View
                style={{
                  // backgroundColor: '#F44336',
                  backgroundColor: "#F44336",
                  width: "48%",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "white", alignSelf: "center" }}>
                  Rejected : {rejectedOrder11}
                </Text>
              </View>
            </View>
            <View style={styles.containter}>
              <ScrollView
                style={styles.homepage}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                <ScrollView keyboardShouldPersistTaps="handled">
                  <View style={styles.containter}>
                    <View style={styles.mainbox}>
                      <View
                        style={{
                          flexDirection: "column",
                          paddingHorizontal: 10,
                          paddingTop: 15,
                          paddingBottom: 10,
                        }}
                      >
                        {/* <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          paddingBottom: 10,
                        }}> */}
                        <Text
                          style={{
                            fontWeight: "500",
                            fontSize: 18,
                            color: "black",
                          }}
                        >
                          Seller Name
                        </Text>
                        <Text
                          style={{
                            fontWeight: "500",
                            fontSize: 18,
                            color: "gray",
                          }}
                        >
                          {route.params.consignorName}
                        </Text>
                        {/* </View> */}
                        {/* <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}> */}
                        <Text
                          style={{
                            fontWeight: "500",
                            fontSize: 18,
                            color: "black",
                          }}
                        >
                          Address
                        </Text>
                        <Text
                          style={{
                            fontWeight: "500",
                            fontSize: 18,
                            color: "gray",
                            // paddingLeft: 10,
                            // flex: 1,
                            // textAlign: 'right',
                          }}
                        >
                          {type}
                        </Text>
                        {/* </View> */}
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingHorizontal: 10,
                          paddingTop: 15,
                          paddingBottom: 15,
                          borderTopColor: "lightgray",
                          borderTopWidth: 1,
                        }}
                      >
                        <View style={styles.outer1}>
                          <Text
                            style={{ color: "#6DB1E1", fontWeight: "700" }}
                            onPress={triggerCall}
                          >
                            Call Seller
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => openMap()}>
                          <View style={styles.outer1}>
                            <Text
                              style={{ color: "#6DB1E1", fontWeight: "700" }}
                            >
                              Get Direction
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </ScrollView>
                {pending === 0 &&
                route.params.otpSubmittedDelivery === "true" ? (
                  <Center>
                    <Button
                      w="90%"
                      size="lg"
                      bg="#004aad"
                      mb={4}
                      mt={4}
                      onPress={() => navigation.navigate("SellerDeliveries")}
                    >
                      Go Back
                    </Button>
                  </Center>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      width: "92%",
                      justifyContent: "space-between",
                      marginTop: 10,
                      alignSelf: "center",
                    }}
                  >
                    <Button
                      leftIcon={
                        <Icon
                          color="white"
                          as={<MaterialIcons name="close-circle-outline" />}
                          size="sm"
                        />
                      }
                      onPress={() => setModalVisible(true)}
                      style={[
                        { backgroundColor: "#004aad", width: "48%" },
                        pending !== route.params.Reverse && {
                          backgroundColor: "gray",
                        },
                      ]}
                      disabled={pending !== route.params.Reverse}
                      disabledStyle={{ backgroundColor: "gray" }}
                    >
                      Close Delivery
                    </Button>
                    <Button
                      style={{
                        backgroundColor: "#004aad",
                        width: "50%",
                        alignSelf: "center",
                      }}
                      leftIcon={
                        <Icon
                          color="white"
                          as={<MaterialIcons name="barcode-scan" />}
                          size="sm"
                        />
                      }
                      onPress={() =>
                        navigation.navigate("ScanShipment", {
                          Forward: Forward,
                          PRSNumber: route.params.PRSNumber,
                          consignorCode: route.params.consignorCode,
                          stopId: route.params.stopId,
                          tripId: route.params.tripId,
                          userId: route.params.userId,
                          phone: route.params.phone,
                          contactPersonName: route.params.contactPersonName,
                          packagingId: route.params.packagingId,
                          latitude: route.params.consignorLatitude,
                          longitude: route.params.consignorLongitude,
                          token: token,
                          // TotalpickUp : newdata[0].totalPickups
                        })
                      }
                    >
                      Scan
                    </Button>
                  </View>
                )}
                <View style={{ paddingTop: 60 }}>
                  <Center>
                    <Image
                      style={{ width: 150, height: 150 }}
                      source={require("../../assets/image.png")}
                      alt={"Logo Image"}
                    />
                  </Center>
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}
    </NativeBaseProvider>
  );
};

export default SellerHandoverSelection;
export const styles = StyleSheet.create({
  scanbtn: {
    width: 140,
    height: 50,
    color: "white",
    borderBottomColor: "red",
    borderBottomWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  scanbtn2: {
    width: 140,
    height: 50,
    color: "white",
    borderBottomColor: "green",
    borderBottomWidth: 2,
    // color:'white',
    marginLeft: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  iconbar: {
    marginTop: 10,
    marginLeft: 30,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    // backgroundColor:'green'
  },
  containter: {
    marginTop: 0,
    marginVertical: 0,
    alignSelf: "center",
  },
  searchbar: {
    width: 280,
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
  text: {
    paddingLeft: 30,
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
  },
  text1: {
    alignSelf: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  bt1: {
    fontFamily: "open sans",
    fontSize: 15,
    lineHeight: 10,
    marginTop: 30,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#004aad",
    width: 100,
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 0,
  },
  bt2: {
    fontFamily: "open sans",
    fontSize: 15,
    lineHeight: 10,
    marginTop: -44,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#004aad",
    width: 100,
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 110,
  },
  bt3: {
    fontFamily: "open sans",
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
    lineHeight: 10,
    marginTop: -44,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#004aad",
    width: 100,
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 220,
  },
  // containter:{
  //   marginTop:30,
  //   marginVertical:0,
  //   alignSelf:'center',
  // },
  mainbox: {
    width: 340,
    height: "auto",
    backgroundColor: "white",
    alignSelf: "center",
    marginVertical: 20,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 1,
  },
  innerup: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  innerdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  outerdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderTopWidth: 2,
    borderColor: "#F4F4F4",
  },
  outer1: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  fontvalue: {
    padding: 10,
    fontWeight: "700",
    color: "black",
  },
  container69: {
    alignItems: "center",
    justifyContent: "center",
    height: 250,
  },
  gauge: {
    position: "absolute",
    width: 100,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeText: {
    backgroundColor: "transparent",
    color: "#000",
    fontSize: 24,
  },
  modalContent: {
    flex: 0.7,
    justifyContent: "center",
    height: "50%",
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
  },
});
