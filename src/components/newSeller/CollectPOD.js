/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  ArrowForwardIcon,
  NativeBaseProvider,
  Box,
  Image,
  Center,
  Input,
  Modal,
  Heading,
  VStack,
  Alert,
} from "native-base";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ToastAndroid,
} from "react-native";
import Lottie from "lottie-react-native";
import { ProgressBar } from "@react-native-community/progress-bar-android";
import DeviceInfo from "react-native-device-info";
import axios from "axios";
import { HStack, Button } from "native-base";
import React, { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import OTPTextInput from "react-native-otp-textinput";

import { openDatabase } from "react-native-sqlite-storage";
import { backendUrl } from "../../utils/backendUrl";
import { setAutoSync } from "../../redux/slice/autoSyncSlice";
import { useDispatch, useSelector } from "react-redux";
import { getAuthorizedHeaders } from "../../utils/headers";

const db = openDatabase({
  name: "rn_sqlite",
});
const CollectPOD = ({ route }) => {
  const dispatch = useDispatch();
  const syncTimeFull = useSelector((state) => state.autoSync.syncTimeFull);
  var otpInput = useRef(null);
  const navigation = useNavigation();
  const [name, setName] = useState(route.params.contactPersonName);
  const [inputOtp, setInputOtp] = useState("");
  const [mobileNumber, setMobileNumber] = useState(route.params.phone);
  const [token, setToken] = useState(route.params.token);
  const [showModal11, setShowModal11] = useState(false);
  const [DropDownValue11, setDropDownValue11] = useState(null);
  const [PartialCloseData, setPartialCloseData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(0);
  const [runsheetNo, setRunsheetNo] = useState("");
  const [timer, setTimer] = useState(60);
  const [newaccepted, setnewAccepted] = useState(
    route.params.accepted + route.params.tagged
  );
  const [newrejected, setnewRejected] = useState(route.params.rejected);
  const [newNotDelivered, setNewNotDelivered] = useState(
    route.params.notDelivered
  );
  const currentDateValue =
    useSelector((state) => state.currentDate.currentDateValue) ||
    new Date().toISOString().split("T")[0];
  const [acceptedArray, setAcceptedArray] = useState([]);
  const [rejectedArray, setRejectedArray] = useState([]);
  const [notDeliveredArray, setNotDeliveredArray] = useState([]);
  const [showLoading, setLoading] = useState(false);

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
  const DisplayData11 = async () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM PartialCloseReasons", [], (tx1, results) => {
        let temp = [];
        // console.log('CollectPOD.js/ ',results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        // console.log('CollectPOD.js/ ','Data from Local Database partialClosure : \n ', temp);
        setPartialCloseData(temp);
        // console.log('CollectPOD.js/ ','Table6 DB OK:', temp.length);
      });
    });
    // await fetch(PartialClose)
    // .then((response) => response.json())
    // .then((json) => {
    //   setPartialCloseData(json);
    // })
    // .catch((error) => alert(error))
  };
  useEffect(() => {
    DisplayData11();
  }, []);

  const clearText = () => {
    otpInput.current.clear();
  };

  const setText = () => {
    otpInput.current.setValue("1234");
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(setAutoSync(true));
      displayDataSPScan();
    });
    return unsubscribe;
  }, [navigation, syncTimeFull]);

  const displayDataSPScan = async () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND (status="accepted" OR status="tagged")',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          setnewAccepted(results.rows.length);
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i).clientShipmentReferenceNumber);
          }
          setAcceptedArray(temp);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND (handoverStatus="accepted" AND status IS NULL)',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          setNewNotDelivered(results.rows.length);
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i).clientShipmentReferenceNumber);
          }
          setNotDeliveredArray(temp);
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND status="rejected"',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          setnewRejected(results.rows.length);
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i).clientShipmentReferenceNumber);
          }
          setRejectedArray(temp);
        }
      );
    });
  };

  const submitForm11 = async () => {
    const deviceId = await DeviceInfo.getUniqueId();
    const IpAddress = await DeviceInfo.getIpAddress();
    const eventTime = new Date().valueOf();
    console.log("CollectPOD.js/submitForm11 ", "=======post rd delivery====", {
      runsheetNo: runsheetNo,
      expected: route.params.Forward,
      accepted: newaccepted,
      rejected: newrejected,
      nothandedOver: newNotDelivered,
      feUserID: route.params.userId,
      receivingTime: eventTime,
      latitude: route.params.latitude,
      longitude: route.params.longitude,
      receiverMobileNo: mobileNumber,
      receiverName: name,
      consignorAction: "Seller Delivery",
      consignorCode: route.params.consignorCode,
      stopId: route.params.stopId,
      tripId: route.params.tripId,
      acceptedShipments: acceptedArray,
      rejectedShipments: rejectedArray,
      nothandedOverShipments: notDeliveredArray,
    });
    axios
      .post(
        backendUrl + "SellerMainScreen/postRD",
        {
          runsheetNo: runsheetNo,
          expected: route.params.Forward,
          accepted: newaccepted,
          rejected: newrejected,
          nothandedOver: newNotDelivered,
          feUserID: route.params.userId,
          receivingTime: eventTime,
          latitude: route.params.latitude,
          longitude: route.params.longitude,
          receiverMobileNo: mobileNumber,
          receiverName: name,
          consignorAction: "Seller Delivery",
          consignorCode: route.params.consignorCode,
          acceptedShipments: acceptedArray,
          rejectedShipments: rejectedArray,
          nothandedOverShipments: notDeliveredArray,
          stopId: route.params.stopId,
          tripID: route.params.tripId,
          deviceId: deviceId,
          deviceIPaddress: IpAddress,
        },
        { headers: getAuthorizedHeaders(token) }
      )
      .then(function (response) {
        db.transaction((tx) => {
          tx.executeSql(
            'UPDATE SyncSellerPickUp  SET otpSubmittedDelivery="true" WHERE stopId=? AND FMtripId=? ',
            [route.params.stopId, route.params.tripId],
            (tx1, results) => {
              // console.log('CollectPOD.js/ ','Results', results.rowsAffected);
              // console.log('CollectPOD.js/ ',results);
              if (results.rowsAffected > 0) {
                console.log(
                  "CollectPOD.js/submitForm11 ",
                  "otp status updated seller delivery in seller table "
                );
              } else {
                console.log(
                  "CollectPOD.js/submitForm11 ",
                  "opt status not updated in seller delivery in local table"
                );
              }
              // console.log('CollectPOD.js/ ',results.rows.length);
            }
          );
        });
        db.transaction((tx) => {
          tx.executeSql(
            'UPDATE SellerMainScreenDetails SET status="notDelivered", rejectionReasonL1=?, eventTime=?, latitude=?, longitude=? WHERE shipmentAction="Seller Delivery" AND (handoverStatus="accepted" AND status IS NULL) AND stopId=? AND FMtripId=?',
            [
              route.params.DropDownValue,
              eventTime,
              route.params.latitude,
              route.params.longitude,
              route.params.stopId,
              route.params.tripId,
            ],
            (tx1, results) => {
              if (results.rowsAffected > 0) {
                ToastAndroid.show(
                  "Partial Closed Successfully",
                  ToastAndroid.SHORT
                );
              } else {
                console.log(
                  "CollectPOD.js/submitForm11 ",
                  "failed to add notPicked item locally"
                );
              }
            }
          );
        });
        console.log(
          "CollectPOD.js/submitForm11 ",
          "POST RD Data Submitted",
          response.data
        );
        alert("Delivery Successfully completed");
        setLoading(false);
        navigation.navigate("Main");
      })
      .catch(function (error) {
        console.log("CollectPOD.js/submitForm11 ", error.response.data);
      });
  };
  const sendSmsOtp = async () => {
    const response = await axios
      .post(
        backendUrl + "SMS_new/sendOTP",
        {
          mobileNumber: mobileNumber,
          useCase: "POSTRD DELIVERY OTP",
          payLoad: {
            deliveredCount: newaccepted,
            failedCount: newrejected + newNotDelivered,
          },
        },
        { headers: getAuthorizedHeaders(token) }
      )
      .then(setShowModal11(true))
      .catch((err) =>  ToastAndroid.show(err,"OTP not sent", ToastAndroid.SHORT)
      );
  };

  function handleButtonPress11(item) {
    // if(item=='Partial Dispatch'){
    //   navigation.navigate('Dispatch');
    // }
    setDropDownValue11(item);
    // setModalVisible11(false);
  }

  function validateOTP() {
    axios
      .post(
        backendUrl + "SMS_new/OTPValidate",
        {
          mobileNumber: mobileNumber,
          useCase: "POSTRD DELIVERY OTP",
          otp: inputOtp,
        },
        { headers: getAuthorizedHeaders(token) }
      )
      .then((response) => {
        if (response.data.return) {
          // alert("OTP Submitted Successfully")
          setLoading(true);
          setMessage(1);
          submitForm11();
          setInputOtp("");
          setShowModal11(false);
        } else {
          alert("Invalid OTP, please try again !!");
          setMessage(2);
        }
      })
      .catch((error) => {
        // alert('Invalid OTP, please try again !!');
        setMessage(2);
        console.log("CollectPOD.js/validateOTP ", error);
      });
  }
  const displayData = async () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=?',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          // ToastAndroid.show("Loading...", ToastAndroid.SHORT);
          let temp = [];
          console.log("CollectPOD.js/displayData ", results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
          setRunsheetNo(temp[0].runSheetNumber);
        }
      );
    });
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(setAutoSync(true));
      displayData();
    });
    return unsubscribe;
  }, [navigation, syncTimeFull]);

  return (
    <NativeBaseProvider>
      {/* 
     <Modal
        w="100%"
        isOpen={showModal11}
        onClose={() => {
          setShowModal11(false);
          setTimer(60);
        }}>
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
              {timer ? (
                <Button w="40%" bg="gray.500">
                  <Text style={{color: 'white'}}>{timer}s</Text>
                </Button>
              ) : (
                <Button
                  w="40%"
                  bg="gray.500"
                  onPress={() => {
                    sendSmsOtp();
                    setTimer(60);
                  }}>
                  Resend
                </Button>
              )}
              <Button w="40%" bg="gray.500" onPress={()=>sendSmsOtp()}>Resend</Button> 
              <Button w="40%" bg="#004aad" onPress={() => validateOTP()}>
                Submit
              </Button>
            </Box>
          </Modal.Body>
        </Modal.Content>
      </Modal>*/}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content backgroundColor={message === 1 ? "#dcfce7" : "#fee2e2"}>
          <Modal.CloseButton />
          <Modal.Body>
            <Alert w="100%" status={message === 1 ? "success" : "error"}>
              <VStack space={1} flexShrink={1} w="100%" alignItems="center">
                <Alert.Icon size="4xl" />
                <Text my={3} fontSize="md" fontWeight="medium">
                  {message === 1
                    ? "OTP Submitted Successfully"
                    : "Invalid OTP, please try again !!"}
                </Text>
              </VStack>
            </Alert>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      {showLoading ? (
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
        <View style={{ backgroundColor: "white", flex: 1, paddingTop: 30 }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ alignItems: "center", marginTop: 15 }}>
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
                  Accepted
                </Text>
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  {route.params.accepted}
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
                  {route.params.rejected}
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
                <Text style={{ fontSize: 18, fontWeight: "500" }}>Tagged</Text>
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  {route.params.tagged}
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
                  {newNotDelivered}
                </Text>
              </View>
            </View>
            <Center>
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
                value={mobileNumber}
                onChangeText={(e) => setMobileNumber(e)}
              />

              {!showModal11 ? (
                <Button
                  w="90%"
                  size="lg"
                  style={{ backgroundColor: "#004aad", color: "#fff" }}
                  title="Submit"
                  onPress={() => {
                    if(!name || !mobileNumber){
                      ToastAndroid.show("Please enter name and mobile number", ToastAndroid.SHORT);
                    }else{setShowModal11(true);
                      sendSmsOtp();
                      setTimer(60);}
                  }}
                >
                  Send OTP
                </Button>
              ) : timer ? (
                <Button w="90%" size="lg" bg="gray.500">
                  <Text style={{ color: "white", fontSize: 16.5 }}>
                    Resend OTP in {timer}sec
                  </Text>
                </Button>
              ) : (
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
                      {/* <Center> */}
                      <OTPTextInput
                        handleTextChange={(e) => setInputOtp(e)}
                        inputCount={6}
                        tintColor="#004aad"
                        offTintColor="gray"
                        containerStyle={{
                          marginTop: 4,
                          padding: 10,
                          // size:20
                        }}
                        textInputStyle={{
                          backgroundColor: "#F5F5F5",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: "#BDBDBD",
                          padding: 10,
                        }}
                        // secureTextEntry={!showPassword}
                        keyboardType="number-pad"
                        onBackspace={() =>
                          console.log("CollectPOD.js/ ", "back")
                        }
                      />
                    </View>
                  </Center>

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
                  {/* </Box> */}
                </>
              ) : null}

              {/* <Button
              w="90%"
              size="lg"
              style={{
                backgroundColor: '#004aad',
                color: '#fff',
                marginBottom: 10,
              }}
              title="Generate"
              onPress={() => {
                setShowModal11(true);
                sendSmsOtp();
              }}>
              Generate OTP
            </Button> */}
            </Center>
            <Center>
              <Image
                style={{ width: 150, height: 150 }}
                source={require("../../assets/image.png")}
                alt={"Logo Image"}
              />
            </Center>
          </ScrollView>
        </View>
      )}
    </NativeBaseProvider>
  );
};

export default CollectPOD;

export const styles = StyleSheet.create({
  normal: {
    fontFamily: "open sans",
    fontWeight: "normal",
    color: "#eee",
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#eee",
    width: "auto",
    borderRadius: 0,
  },

  text: {
    paddingLeft: 20,
    color: "#000",
    fontWeight: "normal",
    fontSize: 18,
  },
  container: {
    flex: 1,
    fontFamily: "open sans",
    fontWeight: "normal",
    color: "#eee",
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "auto",
    borderWidth: 1,
    borderColor: "#eee",
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
