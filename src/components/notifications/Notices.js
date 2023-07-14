import React, { useEffect, useState } from 'react';
import { openDatabase } from "react-native-sqlite-storage";
import axios from "axios";

import {useNavigation} from '@react-navigation/native';

import { TouchableOpacity } from "react-native-gesture-handler";
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

const Notices = () => {
  const [notificationData, setNotificationData] = useState([]);
  
  const navigation = useNavigation();
// console.log(notificationData);
  useEffect(() => {
    const fetchNotificationData = () => {
      const db = openDatabase({ name: "rn_sqlite" });
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT notificationTitle, notificationBody, sentTime, messageId FROM noticeMessages ORDER BY sentTime DESC`,
          [],
          (tx, results) => {
            // console.log(results.rows.length);
            const len = results.rows.length;
            const notificationData = [];

            for (let i = 0; i < len; i++) {
              const row = results.rows.item(i);
              notificationData.push(row);
            }

            setNotificationData(notificationData);
          }
        );
      });
    };

    fetchNotificationData();
  }, [notificationData]);

  return (
<NativeBaseProvider>
<ScrollView>
  <Box flex={1} bg="coolGray.100" p={4}>
    {notificationData && notificationData.length > 0 ? (
      <>
        <Text
          color="black"
          _dark={{
            color: "gray.400",
          }}
          fontWeight="500"
          mb={4}
        >
          {notificationData[0].notificationTitle}
        </Text>
        {notificationData.map((d, i) => {
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
                      <Stack p="4" space={2}>
                      <HStack
                          alignItems="center"
                          space={2}
                          justifyContent="space-between"
                        >
                          <HStack alignItems="center">
                          <Text
                            fontSize="sm"
                            _light={{
                              color: "black",
                            }}
                            _dark={{
                              color: "black",
                            }}
                            fontWeight="400"
                          >
                               {d.notificationBody}
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
                              {d.sentTime}
                            </Text>
                          </HStack>
                        </HStack>
                      </Stack>
                    </Box>
            </Box>
          );
        })}
      </>
    ) : (
      <>
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
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Stack p="4" space={3} textAlign="center"> 
              <HStack
                alignItems="center"
                space={4}
                justifyContent="center" 
              >
                <HStack alignItems="center">
                  <Text
                    color="black"
                    _dark={{
                      color: "gray.400",
                    }}
                    fontWeight="500"
                  >
                    No new notice
                  </Text>
                </HStack>
              </HStack>
             
              <Stack space={2}>
                <Text
                  fontSize="sm"
                  _light={{
                    color: "black",
                  }}
                  _dark={{
                    color: "black",
                  }}
                  fontWeight="400"
                  ml="-0.5"
                  mt="-1"
                >
                  We will notify you when something arrives
                </Text>
              </Stack>
             
              <HStack
                alignItems="center"
                space={4}
                justifyContent="center" 
              >
                <HStack alignItems="center">
                  <TouchableOpacity onPress={() => navigation.popToTop()}>
                    <Button
                      style={{ backgroundColor: "#004aad" }}
                      _dark={{
                        color: "blue.200",
                      }}
                      fontWeight="400"
                    >
                      Go to HomeScreen
                    </Button>
                  </TouchableOpacity>
                </HStack>
              </HStack>
            </Stack>
          </Box>
      </>
    )}
    <Center>
      <Image
        style={{ width: 150, height: 100 }}
        source={require("../../assets/image.png")}
        alt={"Logo Image"}
      />
    </Center>
  </Box>
</ScrollView>
</NativeBaseProvider>


   
  );
};


export default Notices;
