import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import {
  NativeBaseProvider,
  Box,
  Image,
  Center,
  VStack,
  Button,
  Input,
  Alert,
  Text,
  Modal,
  FloatingLabel,
  Label,
  Item,
} from "native-base";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  ActivityIndicator,
  PermissionsAndroid,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
} from "react-native";
import { launchCamera } from "react-native-image-picker";
import { openDatabase } from "react-native-sqlite-storage";
const db = openDatabase({ name: "rn_sqlite" });
import { useIsFocused } from "@react-navigation/native";
import { backendUrl } from "../utils/backendUrl";
import { useDispatch, useSelector } from "react-redux";
import { setTripStatus } from "../redux/slice/tripSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAutoSync, setForceSync } from "../redux/slice/autoSyncSlice";

export default function MyTrip({ navigation, route }) {
  const dispatch = useDispatch();
  const tripStatus = useSelector((state) => state.trip.tripStatus);
  const syncTimeFull = useSelector((state) => state.autoSync.syncTimeFull);

  const [vehicle, setVehicle] = useState("");
  const [startkm, setStartKm] = useState(0);
  const [endkm, setEndkm] = useState(0);
  const [startImageUrl, setStartImageUrl] = useState("");
  const [endImageUrl, setEndImageUrl] = useState("");
  const [tripID, setTripID] = useState("");
  const [userId, setUserId] = useState(route.params.userId);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [modalVisible, setModalVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(0);
  const [showModal1, setShowModal1] = useState(false);
  const [message1, setMessage1] = useState(0);
  const [tripDetails, setTripDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingPickup, setPendingPickup] = useState(0);
  const [completePickup, setCompletePickup] = useState(0);
  const [rejectedPickup, setRejectedPickup] = useState(0);
  const [notPicked, setNotPicked] = useState(0);
  const [pendingDelivery, setPendingDelivery] = useState(0);
  const [completeDelivery, setCompleteDelivery] = useState(0);
  const [rejectedDelivery, setRejectedDelivery] = useState(0);
  const [notDelivered, setNotDelivered] = useState(0);
  const [pendingHandover, setPendingHandover] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  // const [label, setLabel] = useState('Input vehicle KMs');
  const focus = useIsFocused();
  const startKmInputRef = useRef(null);
  const EndKmInputRef = useRef(null);
  const currentDateValue = useSelector((state) => state.currentDate.currentDateValue) || new Date().toISOString().split('T')[0] ;
  useEffect(() => {
    setTimeout(() => {
      if (startKmInputRef.current) {
        startKmInputRef.current.focus();
      }
      if (EndKmInputRef.current) {
        EndKmInputRef.current.focus();
      }
    }, 200);
  }, []);

  useEffect(() => {
    if (userId) {
      getTripDetails(tripID);
      getTripData(userId);
    }
  }, [userId, tripID]);
  function getTripDetails(tripID) {
    axios
      .get(backendUrl + "UserTripInfo/getUserTripInfo", {
        params: {
          tripID: tripID,
        },
      })
      .then((response) => {
        if (response?.data?.res_data) {
          // setVehicle(response.data.res_data.vehicleNumber);
          const startKm = response.data.res_data.startKilometer;
          setStartKm(startKm);
          if (response.data.res_data.endkilometer) {
            navigation.navigate("StartEndDetails", { tripID: tripID });
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error, "error");
        setLoading(false);
      });
  }
  function getTripData(userId) {
    axios
      .get(backendUrl + "UserTripInfo/getUserTripInfo", {
        params: {
          feUserID: userId,
        },
      })
      .then((response) => {
        setTripDetails(response.data.res_data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error, "error");
        setLoading(false);
      });
  }
  useEffect(() => {
    if (focus == true) {
      getTripDetails(tripID);
      getTripData();
    }
  }, [focus]);
  const loadDetails = async () => {
    db.transaction((txn) => {
      txn.executeSql(
        "SELECT * FROM TripDetails WHERE (tripStatus = ? OR tripStatus = ?) AND userID = ?",
        [20, 50, userId],
        (tx, result) => {
          if (result.rows.length > 0) {
            setTripID(result.rows.item(0).tripID);
            setVehicle(result.rows.item(0).vehicleNumber);
          }
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND status="accepted" AND FMtripId=?',
        [tripID],
        (tx1, results) => {
          setCompletePickup(results.rows.length);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND status="notPicked" AND FMtripId=?',
        [tripID],
        (tx1, results) => {
          let temp = [];
          setNotPicked(results.rows.length);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND status="rejected" AND FMtripId=?',
        [tripID],
        (tx1, results) => {
          setSpr(results.rows.length);
          setRejectedPickup(false);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE shipmentAction="Seller Pickup" AND status IS NULL AND FMtripId=?',
        [tripID],
        (tx1, results) => {
          setPendingPickup(results.rows.length);
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND FMtripId=? AND (handoverStatus="accepted" AND status IS NULL)',
        [tripID],
        (tx1, results) => {
          setPendingDelivery(results.rows.length);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE shipmentAction="Seller Delivery" AND handoverStatus IS NULL AND FMtripId=?',
        [tripID],
        (tx1, results) => {
          setPendingHandover(results.rows.length);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND FMtripId=? AND (status="accepted" OR  status="tagged")',
        [tripID],
        (tx1, results) => {
          let temp = [];
          setCompleteDelivery(results.rows.length);
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND status="notDelivered" AND FMtripId=?',
        [tripID],
        (tx1, results) => {
          let temp = [];
          setNotDelivered(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
        }
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND status="rejected" AND FMtripId=?',
        [tripID],
        (tx1, results) => {
          setRejectedDelivery(results.rows.length);
        }
      );
    });
    setLoading(false);
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(setAutoSync(true));
      dispatch(setForceSync(true));
      loadDetails();
    });
    return unsubscribe;
  }, [navigation, syncTimeFull]);

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

  const takeStartPhoto = async () => {
    setUploadStatus("uploading");
    setStartImageUrl("");
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
    }
    if (result.assets !== undefined) {
      fetch(backendUrl + "DSQCPicture/uploadPicture", {
        method: "POST",
        body: createFormData(result.assets[0], {
          useCase: "DSQC",
          type: "front",
          contextId: "SI002",
          contextType: "shipment",
          hubCode: "HC001",
        }),
      })
        .then((data) => data.json())
        .then((res) => {
          setStartImageUrl(res.publicURL);
          setUploadStatus("done");
        })
        .catch((error) => {
          console.log("upload error", error);
          setUploadStatus("error");
        });
    }
  };

  const takeEndPhoto = async () => {
    setUploadStatus("uploading");
    setEndImageUrl("");
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
    }
    if (result.assets !== undefined) {
      fetch(backendUrl + "DSQCPicture/uploadPicture", {
        method: "POST",
        body: createFormData(result.assets[0], {
          useCase: "DSQC",
          type: "front",
          contextId: "SI002",
          contextType: "shipment",
          hubCode: "HC001",
        }),
      })
        .then((data) => data.json())
        .then((res) => {
          setEndImageUrl(res.publicURL);
          setUploadStatus("done");
        })
        .catch((error) => {
          console.log("upload error", error);
          setUploadStatus("error");
        });
    }
  };

  const submitEndTrip = () => {
    (async () => {
      await axios
        .post(backendUrl + "UserTripInfo/updateUserTripEndDetails", {
          tripID: tripID,
          endTime: new Date().valueOf(),
          endkilometer: endkm,
          endVehicleImageUrl: endImageUrl,
          tripStatus: 200,
          tripSummary: {
            acceptedPickup: completePickup,
            notPicked: notPicked,
            rejectedPickup: rejectedPickup,
            acceptedDelivery: completeDelivery,
            notDelivered: notDelivered,
            rejectedDelivery: rejectedDelivery,
          },
        })
        .then(function (res) {
          dispatch(setTripStatus(0));
          getTripDetails(tripID);
          setMessage(1);
          navigation.navigate("StartEndDetails", { tripID: tripID });
          db.transaction((tx) => {
            tx.executeSql(
              "UPDATE TripDetails SET tripStatus=? WHERE tripID = ?",
              [200, tripID],
              (tx1, results) => {
                if (results.rowsAffected > 0) {
                  console.log("tripStatus updated");
                }
              }
            );
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    })();
  };

  useEffect(() => {
    if (pendingHandover !== 0) {
      setMessage1(2);
      setShowModal1(true);
    }
    // else if(pendingPickup==0 && pendingDelivery==0 && tripStatus==0){
    //   setMessage1(1);
    //   setShowModal1(true);
    // }
  }, [pendingPickup, pendingDelivery, pendingHandover, tripStatus]);
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  currentDate = currentDate.valueOf();
  const submitStartTrip = () => {
    (async () => {
      await axios
        .post(backendUrl + "UserTripInfo/userTripDetails", {
          tripID: tripID,
          userID: userId,
          startTime: new Date().valueOf(),
          vehicleNumber: vehicle,
          startKilometer: startkm,
          startVehicleImageUrl: startImageUrl,
          tripStatus: 50,
        })
        .then(function (res) {
          if (res.data.msg === "TripID already exists") {
            getTripDetails(tripID);
            setMessage(2);
          } else {
            db.transaction((tx) => {
              tx.executeSql(
                "UPDATE TripDetails SET tripStatus=? WHERE tripID = ?",
                [50, tripID],
                (tx1, results) => {
                  if (results.rowsAffected > 0) {
                    console.log("tripStatus updated");
                  }
                }
              );
            });
            dispatch(setTripStatus(1));
            getTripDetails(tripID);
            setMessage(1);
            navigation.navigate("Main", { tripID: tripID });
          }
          setShowModal(true);
        })
        .catch(function (error) {
          console.log(error);
        });
    })();
  };

  const handleInputChange = (value) => {
    setStartKm(value);
    // if (value) {
    //   setLabel('Vehicle KMs');
    // } else {
    //   setLabel('Input vehicle KMs');
    // }
  };
  return (
    <NativeBaseProvider>
      <ScrollView>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="blue"
            style={{ marginTop: 44 }}
          />
        ) : (
          <Box flex={1}>
            {tripStatus == 0 ? (
              <Box
                flex={1}
                bg="gray.300"
                alignItems="center"
                pt={"4%"}
                pb={"50%"}
              >
                <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                  <Modal.Content
                    backgroundColor={message === 1 ? "#dcfce7" : "#fee2e2"}
                  >
                    <Modal.CloseButton />
                    <Modal.Body>
                      <Alert
                        w="100%"
                        status={message === 1 ? "success" : "error"}
                      >
                        <VStack
                          space={1}
                          flexShrink={1}
                          w="100%"
                          alignItems="center"
                        >
                          <Alert.Icon size="4xl" />
                          <Text my={3} fontSize="md" fontWeight="medium">
                            {message === 1
                              ? "Data Successfully Submitted"
                              : "Trip ID already exists"}
                          </Text>
                        </VStack>
                      </Alert>
                    </Modal.Body>
                  </Modal.Content>
                </Modal>
                <Modal
                  isOpen={showModal1}
                  onClose={() => {
                    setShowModal1(false);
                    navigation.navigate("Main");
                  }}
                >
                  <Modal.Content
                    backgroundColor={message1 === 1 ? "#fee2e2" : "#fee2e2"}
                  >
                    <Modal.CloseButton />
                    <Modal.Body>
                      <Alert
                        w="100%"
                        status={message1 === 1 ? "error" : "error"}
                      >
                        <VStack
                          space={1}
                          flexShrink={1}
                          w="100%"
                          alignItems="center"
                        >
                          <Alert.Icon size="4xl" />
                          <Text my={3} fontSize="md" fontWeight="medium">
                            {message1 === 1
                              ? "No Pickup/Delivery Assigned"
                              : "Please complete handover before Start a trip"}
                          </Text>
                        </VStack>
                      </Alert>
                    </Modal.Body>
                  </Modal.Content>
                </Modal>
                <Modal
                  isOpen={modalVisible}
                  onClose={() => setModalVisible(false)}
                  size="lg"
                >
                  <Modal.Content maxWidth="350">
                    <Modal.CloseButton />
                    <Modal.Header />
                    <Modal.Body>
                      <View
                        style={{
                          width: "90%",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignSelf: "center",
                        }}
                      >
                        <Image
                          source={{ uri: startImageUrl }}
                          style={{ width: 400, height: 600 }}
                          alt="image not shown"
                        />
                      </View>
                    </Modal.Body>
                  </Modal.Content>
                </Modal>
                <Box
                  justifyContent="space-between"
                  py={10}
                  px={6}
                  bg="#fff"
                  rounded="xl"
                  width={"90%"}
                  maxWidth="100%"
                  _text={{ fontWeight: "medium" }}
                >
                  <ScrollView>
                    <VStack space={6}>
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "500",
                            color: "gray",
                          }}
                          mb={2}
                        >
                          Start Your Trip
                        </Text>
                      </View>
                      <View flexDirection="column">
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "500",
                            color: "gray",
                          }}
                          mb={1}
                        >
                          Vehicle Number:
                        </Text>
                        <Input
                          disabled
                          selectTextOnFocus={false}
                          editable={false}
                          backgroundColor="gray.300"
                          value={vehicle}
                          size="lg"
                          type={"number"}
                          placeholder="Vehicle Number"
                        />
                      </View>
                      <View flexDirection="column">
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "500",
                            color: "gray",
                          }}
                          mb={1}
                        >
                          Start KMs:
                        </Text>
                        <Input
                          ref={startKmInputRef}
                          keyboardType="numeric"
                          value={startkm}
                          onChangeText={setStartKm}
                          size="lg"
                          type={"number"}
                          placeholder="Start km"
                          style={{
                            fontSize: 18,
                            color: "#000",
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderWidth: 1,
                            borderColor: "#ccc",
                            borderRadius: 4,
                          }}
                        />
                      </View>
                      <Button
                        py={3}
                        variant="outline"
                        _text={{ color: "white", fontSize: 20 }}
                        onPress={takeStartPhoto}
                      >
                        {uploadStatus === "idle" && (
                          <MaterialIcons
                            name="cloud-upload"
                            size={22}
                            color="gray"
                          >
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
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {startImageUrl ? (
                          <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                          >
                            <Image
                              source={{ uri: startImageUrl }}
                              style={{ width: 300, height: 200 }}
                              alt="image not shown"
                            />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      {startkm && vehicle && startImageUrl ? (
                        <Button
                          title="Login"
                          backgroundColor={"#004aad"}
                          _text={{ color: "white", fontSize: 20 }}
                          onPress={() => {
                            submitStartTrip();
                          }}
                        >
                          Start Trip
                        </Button>
                      ) : (
                        <Button
                          opacity={0.5}
                          disabled={true}
                          title="Login"
                          backgroundColor={"#004aad"}
                          _text={{ color: "white", fontSize: 20 }}
                        >
                          Start Trip
                        </Button>
                      )}
                    </VStack>
                  </ScrollView>
                  <Center>
                    <Image
                      style={{ width: 150, height: 100 }}
                      source={require("../assets/image.png")}
                      alt={"Logo Image"}
                    />
                  </Center>
                </Box>
              </Box>
            ) : (
              <Box
                flex={1}
                bg="gray.300"
                alignItems="center"
                pt={"4%"}
                pb={"50%"}
              >
                <Modal
                  isOpen={modalVisible}
                  onClose={() => setModalVisible(false)}
                  size="lg"
                >
                  <Modal.Content maxWidth="350">
                    <Modal.CloseButton />
                    <Modal.Header />
                    <Modal.Body>
                      <View style={{ alignSelf: "center", marginVertical: 5 }}>
                        <Image
                          source={{ uri: endImageUrl }}
                          style={{ width: 400, height: 500 }}
                          alt="image not shown"
                        />
                      </View>
                    </Modal.Body>
                  </Modal.Content>
                </Modal>
                <Box
                  justifyContent="space-between"
                  py={10}
                  px={6}
                  bg="#fff"
                  rounded="xl"
                  width={"90%"}
                  maxWidth="100%"
                  _text={{ fontWeight: "medium" }}
                >
                  <VStack space={6}>
                    <View
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "500",
                          color: "gray",
                        }}
                        mb={2}
                      >
                        Trip Started
                      </Text>
                    </View>
                    <View flexDirection="column">
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "500",
                          color: "gray",
                        }}
                        mb={1}
                      >
                        Vehicle Number:
                      </Text>
                      <Input
                        disabled
                        selectTextOnFocus={false}
                        editable={false}
                        backgroundColor="gray.300"
                        value={vehicle}
                        size="lg"
                        type={"number"}
                        placeholder="Vehicle Number"
                      />
                    </View>
                    <View flexDirection="column">
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "500",
                          color: "gray",
                        }}
                        mb={1}
                      >
                        Start KMs:
                      </Text>
                      <Input
                        selectTextOnFocus={false}
                        editable={false}
                        disabled
                        backgroundColor="gray.300"
                        value={startkm}
                        size="lg"
                        type={"number"}
                        placeholder="Start Km"
                      />
                    </View>
                    <View flexDirection="column">
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "500",
                          color: "gray",
                        }}
                        mb={1}
                      >
                        End KMs:
                      </Text>
                      <Input
                        ref={EndKmInputRef}
                        value={endkm}
                        keyboardType="numeric"
                        onChangeText={setEndkm}
                        size="lg"
                        type={"number"}
                        placeholder="Input End KMs"
                        style={{
                          fontSize: 18,
                          color: "#000",
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderWidth: 1,
                          borderColor: "#ccc",
                          borderRadius: 4,
                        }}
                      />
                    </View>
                    <Button
                      py={3}
                      variant="outline"
                      _text={{ color: "white", fontSize: 20 }}
                      onPress={takeEndPhoto}
                    >
                      {uploadStatus === "idle" && (
                        <MaterialIcons
                          name="cloud-upload"
                          size={22}
                          color="gray"
                        >
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
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {endImageUrl ? (
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                          <Image
                            source={{ uri: endImageUrl }}
                            style={{ width: 300, height: 200 }}
                            alt="image not shown"
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    {pendingPickup != 0 || pendingDelivery != 0 ? (
                      <Button
                        backgroundColor="#004aad"
                        _text={{ color: "white", fontSize: 20 }}
                        onPress={() => navigation.navigate("PendingWork")}
                      >
                        Pending Work
                      </Button>
                    ) : endkm &&
                      endImageUrl &&
                      parseInt(endkm) > parseInt(startkm) ? (
                      <Button
                        backgroundColor="#004aad"
                        _text={{ color: "white", fontSize: 20 }}
                        onPress={() => submitEndTrip()}
                      >
                        End Trip
                      </Button>
                    ) : (
                      <Button
                        opacity={0.5}
                        disabled={true}
                        backgroundColor="#004aad"
                        _text={{ color: "white", fontSize: 20 }}
                      >
                        End Trip
                      </Button>
                    )}
                  </VStack>
                  <Center>
                    <Image
                      style={{ width: 150, height: 100 }}
                      source={require("../assets/image.png")}
                      alt={"Logo Image"}
                    />
                  </Center>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </ScrollView>
    </NativeBaseProvider>
  );
}
