/* eslint-disable prettier/prettier */
import {
  NativeBaseProvider,
  Box,
  Image,
  Center,
  Button,
  Modal,
  Input,
} from "native-base";
import {
  StyleSheet,
  ScrollView,
  View,
  ToastAndroid,
  ActivityIndicator, 
} from "react-native";
import { DataTable, Searchbar, Text, Card } from "react-native-paper";
import { openDatabase } from "react-native-sqlite-storage";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
const db = openDatabase({ name: "rn_sqlite" });
import GetLocation from "react-native-get-location";
import axios from "axios";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import { backendUrl } from "../../utils/backendUrl";
import { useDispatch, useSelector } from "react-redux";
import { setAutoSync } from "../../redux/slice/autoSyncSlice";

const PendingHandover = ({ route }) => {
  const dispatch = useDispatch();
  const syncTimeFull = useSelector((state) => state.autoSync.syncTimeFull);
  // const [data, setData] = useState([]);
  const [selected, setSelected] = useState("Select Exception Reason");
  const navigation = useNavigation();

  const [data, setData] = useState([]);

  const [displayData, setDisplayData] = useState({});
  // const navigation = useNavigation();

  const [keyword, setKeyword] = useState("");
  const [expected11, setExpected11] = useState(0);
  const [rejected11, setRejected11] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [DropDownValue, setDropDownValue] = useState("");
  const [totalPending, setTotalPending] = useState(0);
  const [stopId, setstopId] = useState("");
  const [showCloseBagModal, setShowCloseBagModal] = useState(false);
  const [latitude, setLatitude] = useState(0);
  const [data11, setData11] = useState([]);
  const [longitude, setLongitude] = useState(0);
  const [modalVisibleCNA, setModalVisibleCNA] = useState(false);
  const [handoverStatus, setHandoverStatus] = useState([]);
  const [runSheetNumbers, setRunSheetNumbers] = useState([]);
  const [totalDone, setTotalDone] = useState(0);
  const currentDateValue = useSelector((state) => state.currentDate.currentDateValue) || new Date().toISOString().split('T')[0] ;
  const userId = useSelector((state) => state.user.user_id);

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
        //   .then((status) => {
        //     if (status) {
        //       console.log("Location enabled");
        //     }
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });
        console.log("PendingHandover.js/CurrentLocation Location Lat long error", error);
      });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(setAutoSync(true));
      loadDetails();
      loadDetails112();
    });
    return unsubscribe;
  }, [navigation, syncTimeFull]);

  const loadDetails = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM SyncSellerPickUp WHERE FMtripId = ? ", [route.params.tripID], (tx1, results) => {
        let temp = [];
        var m = 0;
        for (let i = 0; i < results.rows.length; ++i) {
          const newData = {};
          temp.push(results.rows.item(i));
          // var stopId=results.rows.item(i).stopId;
          // var consignorName=results.rows.item(i).consignorName;

          db.transaction((tx) => {
            db.transaction((tx) => {
              tx.executeSql(
                'SELECT * FROM SellerMainScreenDetails WHERE FMtripId = ? AND  shipmentAction="Seller Delivery" AND stopId=? ',
                [route.params.tripID,results.rows.item(i).stopId],
                (tx1, results11) => {
                  //    console.log(results11,'1',results11.rows.length);
                  //    var expected=results11.rows.length;
                  tx.executeSql(
                    'SELECT * FROM SellerMainScreenDetails WHERE FMtripId = ? AND  shipmentAction="Seller Delivery" AND stopId=? AND handoverStatus IS  NULL',
                    [route.params.tripID,results.rows.item(i).stopId],
                    (tx1, results22) => {
                      // console.log(results22,'2',results22.rows.length);
                      // var scanned=results.rows.length;
                      newData[results.rows.item(i).stopId] = {
                        consignorName: results.rows.item(i).consignorName,
                        expected: results11.rows.length,
                        pending: results22.rows.length,
                      };
                      // console.log(newData);
                      if (newData != null) {
                        setDisplayData((prevData) => ({
                          ...prevData,
                          ...newData,
                        }));
                      }
                    }
                  );
                }
              );
            });
          });
        }
        setData(temp);
      });
    });
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM ShipmentFailure", [], (tx1, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        // console.log('Data from Local Database CPR: \n ', temp);
        setData11(temp);
      });
    });
  };
  //   useEffect(() => {
  //     loadDetails()
  //   }, [])

  const displayData11 = Object.keys(displayData)
    .filter((sealID) => sealID.toLowerCase().includes(keyword.toLowerCase()))
    .reduce((obj, key) => {
      obj[key] = displayData[key];
      return obj;
    }, {});

  // let data11 = [
  //     { value: 'Out of Capacity', label: 'Out of Capacity' },
  //     { value: 'Seller Holiday', label: 'Seller Holiday' },
  //     { value: 'Shipment Not Traceable', label: 'Shipment Not Traceable' },
  //   ];
  function handleButtonPress(item) {
    if (item == "CNA") {
      setModalVisible(false);
    }
    setDropDownValue(item);
  }
  const pendingHandover11 = () => {
    const DropDownValue112 = DropDownValue;
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE FMtripId = ? AND  shipmentAction="Seller Delivery" AND stopId=? ',
        [route.params.tripID,stopId],
        (tx1, results111) => {
          const consignorData = {
            expected: expected11,
            accepted: expected11 - rejected11,
            rejected: rejected11,
            consignorCode: stopId,
            rejectReason: DropDownValue112,
          };
          const tempHandoverStatus = [...handoverStatus];
          const conIndex = tempHandoverStatus.findIndex(
            (obj) => obj.consignorCode === stopId
          );
          if (conIndex != -1) {
            tempHandoverStatus[conIndex] = consignorData;
          } else {
            tempHandoverStatus.push(consignorData);
            setTotalDone(totalDone + rejected11);
          }
          setHandoverStatus(tempHandoverStatus);
          const tempRunsheetArray = [...runSheetNumbers];
          for (var i = 0; i < results111.rows.length; i++) {
            if (
              !tempRunsheetArray.includes(
                results111.rows.item(i).runSheetNumber
              )
            ) {
              tempRunsheetArray.push(results111.rows.item(i).runSheetNumber);
            }
          }
          setRunSheetNumbers(tempRunsheetArray);
        }
      );
    });
    setDropDownValue("");
  };
  useEffect(() => {
    loadDetails112();
  }, []);
  const loadDetails112 = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE FMtripId = ? AND  shipmentAction="Seller Delivery"  AND handoverStatus IS NULL',
        [route.params.tripID],
        (tx1, results) => {
          setTotalPending(results.rows.length);
        }
      );
    });
  };

  function updateQueryLocal(eventTime, rejectReason, stopId) {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE SellerMainScreenDetails SET handoverStatus=?, rejectionReasonL1=?, eventTime=?, latitude=?, longitude=? WHERE  FMtripId = ? AND shipmentAction="Seller Delivery" AND handoverStatus IS Null And stopId=?',
        [
          "pendingHandover",
          rejectReason,
          eventTime,
          latitude,
          longitude,
          route.params.tripID,
          stopId,
        ],
        (tx1, results) => {
          // console.log(results);
        },
        (error) => {
          console.log("PendingHandover.js/updateQueryLocal Status Update Local DB bug", error);
        }
      );
    });
  }

  function changeLocalStatus(time11) {
    try {
      for (var i = 0; i < handoverStatus.length; i++) {
        updateQueryLocal(
          time11,
          handoverStatus[i]?.rejectReason,
          handoverStatus[i]?.consignorCode
        );
      }
    } catch (error) {
      console.log("PendingHandover.js/ChangeQueryLocal==err====", error);
    }
    navigation.navigate("HandOverSummary",{
      tripID:route.params.tripID,
    });
  }
 
  function closeHandover() {
    let time11 = new Date().valueOf();
    console.log("PendingHandover.js/CloseHandover ===handover close data P===", {
      handoverStatus: handoverStatus.concat(
        route.params.acceptedHandoverStatus
      ),
      runsheets: runSheetNumbers,
      feUserID: userId,
      receivingTime: parseInt(time11),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });
    axios
      .post(backendUrl + "SellerMainScreen/closeHandover", {
        handoverStatus: handoverStatus,
        runsheets: runSheetNumbers,
        feUserID: userId,
        receivingTime: parseInt(time11),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      })
      .then((response) => {
        changeLocalStatus(time11);
        ToastAndroid.show("Successfully Handover Closed", ToastAndroid.SHORT);
      })
      .catch((error) => {
        ToastAndroid.show("Somthing Went Wrong", ToastAndroid.SHORT);
        console.error("PendingHandover/CloseHandover  Error:", error);
      });
  }

  return (
    <NativeBaseProvider>
      <Box flex={1} bg="#fff" width="auto" maxWidth="100%">
        <ScrollView
          style={styles.homepage}
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={false}
        >
          <Card>
            <DataTable>
              <DataTable.Header
                style={{
                  height: "auto",
                  backgroundColor: "#004aad",
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                }}
              >
                <DataTable.Title style={{ flex: 1.2 }}>
                  <Text style={{ textAlign: "center", color: "white" }}>
                    Seller Name
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={{ flex: 1.2 }}>
                  <Text style={{ textAlign: "center", color: "white" }}>
                    Expected Deliveries
                  </Text>
                </DataTable.Title>
                <DataTable.Title style={{ flex: 1.2 }}>
                  <Text style={{ textAlign: "center", color: "white" }}>
                    Pending Shipments
                  </Text>
                </DataTable.Title>
              </DataTable.Header>
              {/* <DataTable.Row>
                <DataTable.Cell style={{flex: 1.7}}><Text style={styles.fontvalue} >{route.params.consignorName}</Text></DataTable.Cell>
                <DataTable.Cell style={{flex: 1}}><Text style={styles.fontvalue} >{route.params.expected}</Text></DataTable.Cell>
                <DataTable.Cell style={{flex: 1}}><Text style={styles.fontvalue} >{0}</Text></DataTable.Cell>
              </DataTable.Row> */}

              {displayData && data.length > 0 ? (
                Object.keys(displayData11).map((stopId, index) =>
                  displayData11[stopId].pending > 0 ? (
                    <>
                      <DataTable.Row
                        style={{
                          height: "auto",
                          backgroundColor: "#eeeeee",
                          borderBottomWidth: 1,
                        }}
                        key={stopId}
                      >
                        <DataTable.Cell style={{ flex: 1.7 }}>
                          <Text style={styles.fontvalue}>
                            {displayData11[stopId].consignorName}
                          </Text>
                        </DataTable.Cell>

                        <DataTable.Cell style={{ flex: 1, marginRight: 5 }}>
                          <Text style={styles.fontvalue}>
                            {displayData11[stopId].expected}
                          </Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 1, marginRight: -45 }}>
                          <Text style={styles.fontvalue}>
                            {displayData11[stopId].pending}
                          </Text>
                        </DataTable.Cell>
                        {/* <MaterialIcons name="check" style={{ fontSize: 30, color: 'green', marginTop: 8 }} /> */}
                      </DataTable.Row>
                      <Button
                        title="Pending Handover"
                        onPress={() => {
                          setstopId(stopId);
                          setExpected11(displayData11[stopId].expected);
                          setRejected11(displayData11[stopId].pending);
                          setModalVisible(true);
                        }}
                        w="100%"
                        size="lg"
                        bg="#004aad"
                        mb={4}
                        mt={4}
                      >
                        {handoverStatus.length > 0 &&
                        handoverStatus.filter(
                          (obj) => obj.stopId === stopId
                        )[0]?.rejectReason
                          ? (data11
                              ?.filter((d) => d.applies_to.includes("PRHC"))
                              .filter(
                                (obj) =>
                                  obj.short_code ==
                                  handoverStatus.filter(
                                    (obj) => obj.stopId === stopId
                                  )[0].rejectReason
                              ))[0]?.description
                          : "Select Exception Reason"}
                      </Button>
                    </>
                  ) : null
                )
              ) : (
                <ActivityIndicator
                  size="large"
                  color="#004aad"
                  style={{ marginVertical: 15 }}
                />
              )}
            </DataTable>
          </Card>
        </ScrollView>
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
            <Modal.Header>Pending Handover Reason</Modal.Header>
            <Modal.Body>
              {data11 &&
                data11
                  .filter((d) => d.applies_to.includes("PRHC"))
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
                          d.short_code === DropDownValue
                            ? "#6666FF"
                            : "#C8C8C8",
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
              <Button
                flex="1"
                mt={2}
                bg="#004aad"
                marginBottom={1.5}
                marginTop={1.5}
                onPress={() => {
                  pendingHandover11();
                  setModalVisible(false);
                }}
              >
                Submit
              </Button>
            </Modal.Body>
          </Modal.Content>
        </Modal>
        {displayData && data.length > 0 ? (
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
              w="48%"
              size="lg"
              bg="#004aad"
              onPress={() => navigation.navigate("HandoverShipmentRTO",{
                tripID:route.params.tripID,
              })}
            >
              Resume Scanning
            </Button>
            {totalPending == totalDone ? (
              <Button
                w="48%"
                size="lg"
                bg="#004aad"
                onPress={() => closeHandover()}
              >
                Close Handover
              </Button>
            ) : (
              <Button
                w="48%"
                size="lg"
                bg="gray.300"
                onPress={() =>
                  ToastAndroid.show(
                    "All shipments not scanned",
                    ToastAndroid.SHORT
                  )
                }
              >
                Close Handover
              </Button>
            )}
          </View>
        ) : null}
        <Center>
          <Image
            style={{ width: 150, height: 150 }}
            source={require("../../assets/image.png")}
            alt={"Logo Image"}
          />
        </Center>
      </Box>
    </NativeBaseProvider>
  );
};
export default PendingHandover;
export const styles = StyleSheet.create({
  container112: {
    justifyContent: "center",
  },
  tableHeader: {
    backgroundColor: "#004aad",
    alignItems: "flex-start",
    fontFamily: "open sans",
    fontSize: 15,
    color: "white",
    margin: 1,
  },
  container222: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.2 )",
  },
  normal: {
    fontFamily: "open sans",
    fontWeight: "normal",
    color: "#eee",
    marginTop: 27,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: "#eee",
    width: "auto",
    borderRadius: 0,
    alignContent: "space-between",
  },
  text: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
    justifyContent: "space-between",
    paddingLeft: 20,
  },
  main: {
    backgroundColor: "#004aad",
    width: "auto",
    height: "auto",
    margin: 1,
  },
  textbox: {
    alignItems: "flex-start",
    fontFamily: "open sans",
    fontSize: 13,
    color: "#fff",
  },
  homepage: {
    margin: 10,
    // backgroundColor:"blue",
  },
  mainbox: {
    width: "98%",
    height: 40,
    backgroundColor: "lightblue",
    alignSelf: "center",
    marginVertical: 15,
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
    padding: 10,
    backgroundColor: "blue",
  },
  innerdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fontvalue: {
    fontWeight: "300",
    flex: 1,
    fontFamily: "open sans",
    justifyContent: "center",
  },
  fontvalue1: {
    fontWeight: "700",
    marginTop: 10,
    marginLeft: 100,
    marginRight: -10,
  },
  searchbar: {
    width: "95%",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  bt1: {
    fontFamily: "open sans",
    fontSize: 15,
    lineHeight: 0,
    marginTop: 0,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#004aad",
    width: 110,
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 15,
    marginVertical: 0,
  },
  bt2: {
    fontFamily: "open sans",
    fontSize: 15,
    lineHeight: 0,
    marginTop: -45,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: "#004aad",
    width: 110,
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 235,
    marginVertical: 0,
  },
  btnText: {
    alignSelf: "center",
    color: "#fff",
    fontSize: 15,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 0,
  },
});
