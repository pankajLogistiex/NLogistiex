import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  NativeBaseProvider,
  Box,
  Center,
  Button,
  Text,
  ScrollView,
  Stack,
  HStack,
  Divider,
} from "native-base";
import { Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { backendUrl } from "../utils/backendUrl";
import { useSelector, useDispatch } from "react-redux";
import { setNotificationCount } from "../redux/slice/notificationSlice";

export default function NewSellerAdditionNotification() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.user_id);
  const notificationCount = useSelector((state) => state.notification.count);

  const [data, setData] = useState([]);

  const DisplayData = () => {
    if (userId) {
      axios
        .get(backendUrl + `SellerMainScreen/getadditionalwork/${userId}`)
        .then((res) => {
          console.log(res.data.data);
          setData(res.data.data);
        })
        .catch((error) => {
          console.log("Error Msg1:", error);
        });
    }
  };
  useEffect(() => {
    DisplayData();
  }, [userId]);

  const AcceptHandler = async () => {
    // console.log('df')
    axios
      .post(backendUrl + "SellerMainScreen/acceptWorkLoad", {
        consignorCode: data.consignorCode,
        feUserId: userId,
      })
      .then((response) => {
        console.log("Msg Accepted ", response.data);
        dispatch(setNotificationCount(notificationCount - 1));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const RejectHandler = async () => {
    // console.log('df')
    axios
      .post(backendUrl + "SellerMainScreen/rejectWorkLoad", {
        consignorCode: data.consignorCode,
        feUserId: userId,
      })
      .then((response) => {
        console.log("Msg Rejected ", response.data);
        dispatch(setNotificationCount(notificationCount - 1));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <NativeBaseProvider>
      <ScrollView>
        <Box flex={1} bg="coolGray.100" p={4}>
          {data && data.length
            ? data.map((d, i) => {
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
                      <Stack p="4" space={3}>
                        <HStack
                          alignItems="center"
                          space={4}
                          justifyContent="space-between"
                        >
                          <HStack alignItems="center">
                            <Text
                              color="black"
                              _dark={{
                                color: "gray.400",
                              }}
                              fontWeight="400"
                            >
                              {d.consignorName} {d.consignorCode}
                            </Text>
                          </HStack>
                          <HStack alignItems="center">
                            <Text
                              color="black"
                              _dark={{
                                color: "gray.400",
                              }}
                              fontWeight="400"
                            >
                              {d.ForwardPickups}/{d.ReverseDeliveries}
                            </Text>
                          </HStack>
                        </HStack>
                        <Divider
                          my="1"
                          _light={{
                            bg: "muted.200",
                          }}
                          _dark={{
                            bg: "muted.50",
                          }}
                        />
                        <Stack space={2}>
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
                            Address of seller {"\n"}
                            {d.consignorAddress1} {d.consignorAddress2}
                            {"\n"}
                            {d.consignorCity} - {d.consignorPincode}
                          </Text>
                        </Stack>
                        <Divider
                          my="1"
                          _light={{
                            bg: "muted.200",
                          }}
                          _dark={{
                            bg: "muted.50",
                          }}
                        />
                        <HStack
                          alignItems="center"
                          space={4}
                          justifyContent="space-between"
                        >
                          <HStack alignItems="center">
                            <TouchableOpacity onPress={() => RejectHandler()}>
                              <Button
                                style={{ backgroundColor: "#FF2E2E" }}
                                _dark={{
                                  color: "red.200",
                                }}
                                fontWeight="400"
                              >
                                Reject
                              </Button>
                            </TouchableOpacity>
                          </HStack>
                          <HStack alignItems="center">
                            <TouchableOpacity onPress={() => AcceptHandler()}>
                              <Button
                                style={{ backgroundColor: "#004aad" }}
                                _dark={{
                                  color: "blue.200",
                                }}
                                fontWeight="400"
                              >
                                Accept
                              </Button>
                            </TouchableOpacity>
                          </HStack>
                        </HStack>
                      </Stack>
                    </Box>
                  </Box>
                );
              })
            : null}

          <Center>
            <Image
              style={{ width: 150, height: 100 }}
              source={require("../assets/image.png")}
              alt={"Logo Image"}
            />
          </Center>
        </Box>
      </ScrollView>
    </NativeBaseProvider>
  );
}
