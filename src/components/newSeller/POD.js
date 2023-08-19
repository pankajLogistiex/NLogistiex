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
import axios from "axios";
import { HStack, Button } from "native-base";
import React, { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import GetLocation from "react-native-get-location";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import OTPTextInput from "react-native-otp-textinput";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { openDatabase } from "react-native-sqlite-storage";
import { backendUrl } from "../../utils/backendUrl";
import { setAutoSync } from "../../redux/slice/autoSyncSlice";
import { useDispatch, useSelector } from "react-redux";
import DeviceInfo from "react-native-device-info";
import { getAuthorizedHeaders } from "../../utils/headers";

const db = openDatabase({
  name: "rn_sqlite",
});
const POD = ({ route }) => {
  const dispatch = useDispatch();
  const syncTimeFull = useSelector((state) => state.autoSync.syncTimeFull);
  // console.log("========post rd params=======", route.params);
  const navigation = useNavigation();
  const [name, setName] = useState(route.params.contactPersonName);
  const [inputOtp, setInputOtp] = useState("");
  const [mobileNumber, setMobileNumber] = useState(route.params.phone);
  const [token, setToken] = useState(route.params.token);
  const [showModal11, setShowModal11] = useState(false);
  const [modalVisible11, setModalVisible11] = useState(false);
  const [DropDownValue11, setDropDownValue11] = useState(null);
  const [PartialCloseData, setPartialCloseData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(0);
  const currentDateValue =
    useSelector((state) => state.currentDate.currentDateValue) ||
    new Date().toISOString().split("T")[0];
  const [runsheetNo, setRunsheetNo] = useState("");
  const [newaccepted, setnewAccepted] = useState(route.params.accepted);
  const [newrejected, setnewRejected] = useState(route.params.rejected);
  const [newNotPicked, setNewNotPicked] = useState(route.params.notPicked);
  const [acceptedArray, setAcceptedArray] = useState([]);
  const [rejectedArray, setRejectedArray] = useState([]);
  const [notPickedArray, setNotPickedArray] = useState([]);
  const [showLoading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [showPassword, setShowPassword] = useState(false);
  const refs = useRef([]);

  // const handleOnChange = (value, index) => {
  //   // console.log(inputOtp.filter(digit => typeof digit === 'string' && digit !== '').join(''));
  //   setInputOtp((prev) => {
  //     const nextOtp = [...prev];
  //     nextOtp[index] = value;
  //     return nextOtp;
  //   });
  //   if (index < refs.current.length - 1 && value) {
  //     refs.current[index + 1].focus();
  //   }
  // };

  // const handleOnKeyPress = (event, index) => {
  //   if (event.nativeEvent.key === 'Backspace' && !inputOtp[index] && index > 0) {
  //     refs.current[index - 1].focus();
  //   }
  // };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

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
        // console.log(results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        // console.log('Data from Local Database partialClosure : \n ', temp);
        setPartialCloseData(temp);
        // console.log('Table6 DB OK:', temp.length);
      });
    });
  };
  useEffect(() => {
    DisplayData11();
  }, []);

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
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=?  AND status="accepted" AND FMtripId=?',
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
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=? AND FMtripId=? AND status is NULL',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          setNewNotPicked(results.rows.length);
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i).clientShipmentReferenceNumber);
          }
          setNotPickedArray(temp);
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=? AND status="rejected" AND FMtripId=?',
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
    console.log("POD/submitForm11/========postRD Data==========", {
      runsheetNo: runsheetNo,
      expected: route.params.Forward,
      accepted: newaccepted,
      rejected: newrejected,
      nothandedOver: newNotPicked,
      feUserID: route.params.userId,
      receivingTime: eventTime,
      latitude: route.params.latitude,
      longitude: route.params.longitude,
      receiverMobileNo: mobileNumber,
      receiverName: name,
      consignorAction: "Seller Pickup",
      consignorCode: route.params.consignorCode,
      stopId: route.params.stopId,
      acceptedShipments: acceptedArray,
      rejectedShipments: rejectedArray,
      nothandedOverShipments: notPickedArray,
      tripId: route.params.tripId,
      deviceId: deviceId,
      deviceIPaddress: IpAddress,
    });

    try {
      axios
        .post(
          backendUrl + "SellerMainScreen/postRD",
          {
            runsheetNo: runsheetNo,
            expected: route.params.Forward,
            accepted: route.params.accepted,
            rejected: route.params.rejected,
            nothandedOver: newNotPicked,
            feUserID: route.params.userId,
            receivingTime: eventTime,
            latitude: route.params.latitude,
            longitude: route.params.longitude,
            receiverMobileNo: mobileNumber,
            receiverName: name,
            consignorAction: "Seller Pickup",
            consignorCode: route.params.consignorCode,
            stopId: route.params.stopId,
            acceptedShipments: acceptedArray,
            rejectedShipments: rejectedArray,
            nothandedOverShipments: notPickedArray,
            tripID: route.params.tripId,
            deviceId: deviceId,
            deviceIPaddress: IpAddress,
          },
          { headers: getAuthorizedHeaders(token) }
        )
        .then(function (response) {
          db.transaction((tx) => {
            tx.executeSql(
              'UPDATE SyncSellerPickUp  SET otpSubmitted="true" WHERE stopId=? AND FMtripId=? ',
              [route.params.stopId, route.params.tripId],
              (tx1, results) => {
                // console.log('Results', results.rowsAffected);
                // console.log(results);
                if (results.rowsAffected > 0) {
                  console.log(
                    "POD/SubmitForm11/otp status updated  in seller table "
                  );
                } else {
                  console.log(
                    "POD/SubmitForm11/opt status not updated in local table"
                  );
                }
                // console.log(results.rows.length);
              }
            );
          });

          db.transaction((tx) => {
            tx.executeSql(
              'UPDATE SellerMainScreenDetails SET status="notPicked", rejectionReasonL1=?, eventTime=?, latitude=?, longitude=? WHERE shipmentAction="Seller Pickup" AND status IS Null And stopId=? AND FMtripId=?',
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
                  console.log("POD/SubmitForm11/added notPicked item locally");
                } else {
                  console.log(
                    "POD/SubmitForm11/failed to add notPicked item locally"
                  );
                }
              }
            );
          });
          console.log("POD/SubmitForm11/POST RD Data Submitted", response.data);
          alert("Pickup Successfully completed");
          postRDStatus();
          navigation.navigate("Main");
        })
        .catch(function (error) {
          console.log("POD/SubmitForm11", error.response.data);
          setLoading(false);
          alert(error.response.data.msg);
          navigation.navigate("Main");
        });
    } catch (error) {
      console.log("POD/SubmitForm11/===try catch post rd error====", error);
    }
  };

  const sendSmsOtp = async () => {
    await axios
      .post(
        backendUrl + "SMS_new/sendOTP",
        {
          mobileNumber: mobileNumber,
          useCase: "POSTRD PICKUP OTP",
          payLoad: {
            acceptedCount: newaccepted,
            failedCount: newrejected + newNotPicked,
          },
        },
        { headers: getAuthorizedHeaders(token) }
      )
      .then(setShowModal11(true))
      .catch((err) => console.log("POD/sendSmsOtp/OTP not send"));
  };

  function handleButtonPress11(item) {
    // if(item=='Partial Dispatch'){
    //   navigation.navigate('Dispatch');
    // }
    setDropDownValue11(item);
    // setModalVisible11(false);
  }

  function postRDStatus() {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE SellerMainScreenDetails  SET postRDStatus="true" WHERE shipmentAction="Seller Pickup" AND stopId=? AND status IS NOT NULL',
        [route.params.stopId],
        (tx1, results) => {
          if (results.rowsAffected > 0) {
            console.log("POD/postRDStatus/postRd STATUS UPDATED");
          } else {
            console.log("POD/postRDStatus/postRD not updated in local table");
          }
        }
      );
    });
  }

  function validateOTP() {
    console.log("POD/validateOTP", inputOtp);
    var otp11 = inputOtp;
    // const otp11=mm.filter(Boolean).join('');
    // console.log(otp11);
    axios
      .post(
        backendUrl + "SMS_new/OTPValidate",
        {
          mobileNumber: mobileNumber,
          useCase: "POSTRD PICKUP OTP",
          otp: otp11,
        },
        { headers: getAuthorizedHeaders(token) }
      )
      .then((response) => {
        if (response.data.return) {
          // alert("OTP Submitted Successfully")
          setLoading(true)
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
        console.log("POD/validateOTP", error);
      });
  }

  const displayData = async () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=? AND FMtripId=?',
        [route.params.stopId, route.params.tripId],
        (tx1, results) => {
          // ToastAndroid.show("Loading...", ToastAndroid.SHORT);
          let temp = [];
          console.log("POD/displayData/", results.rows.length);
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
      <Modal
        isOpen={modalVisible11}
        onClose={() => setModalVisible11(false)}
        size="lg"
      >
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Partial Close Reason Code</Modal.Header>
          <Modal.Body>
            {PartialCloseData &&
              PartialCloseData.map((d, index) => (
                <Button
                  key={d.reasonID}
                  flex="1"
                  mt={2}
                  marginBottom={1.5}
                  marginTop={1.5}
                  style={{
                    backgroundColor:
                      d.reasonName === DropDownValue11 ? "#6666FF" : "#C8C8C8",
                  }}
                  title={d.reasonName}
                  onPress={() => handleButtonPress11(d.reasonName)}
                >
                  <Text
                    style={{
                      color:
                        d.reasonName == DropDownValue11 ? "white" : "black",
                    }}
                  >
                    {d.reasonName}
                  </Text>
                </Button>
              ))}
            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              marginBottom={1.5}
              marginTop={1.5}
              onPress={() => setModalVisible11(false)}
            >
              Submit
            </Button>
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <Center>
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
              <Text style={{ fontSize: 18, fontWeight: "500" }}>Expected</Text>
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
              <Text style={{ fontSize: 18, fontWeight: "500" }}>Accepted</Text>
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
              <Text style={{ fontSize: 18, fontWeight: "500" }}>Rejected</Text>
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
          </Center>
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
                  sendSmsOtp();
                  setTimer(60);
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
                      }}
                      textInputStyle={{
                        backgroundColor: "#F5F5F5",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#BDBDBD",
                        padding: 10,
                      }}
                      keyboardType="number-pad"
                      onBackspace={() => console.log("back")}
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
              </>
            ) : null}
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

export default POD;

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
