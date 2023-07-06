import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from "react-redux";
import { Image, View } from "react-native";
import {
  NativeBaseProvider,
  Box,
  Center,
  Button,
  Text,
  ScrollView,
  Stack,
  HStack,
} from "native-base";

const DeviceInformation = () => {
  const deviceInfo = useSelector((state) => state.deviceInfo.currentDeviceInfo);
  const groups = [
    ['manufacturer','modelName', 'uniqueId','brand',  'systemName', 'systemVersion'],
    ['bundleId', 'buildNumber','installReferrer', 'version' ],
    ['DiskUsage', 'RamUsage', 'SignalStrength'],
    [ 'ipAddress', 'locale', 'timezone','country']
    ,
  ];

  console.log(deviceInfo);

  return (
    <NativeBaseProvider>
      <ScrollView>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 28, paddingTop: 25 }}>About Phone</Text>
        </View>
        <Box flex={1} bg="coolGray.100" p={4}>
          {deviceInfo && groups.map((subarray, index) => (
            <React.Fragment key={index}>
              {subarray.map((key) => (
                
                <Box
                  key={key}
                  width="100%"
                  marginBottom="-1"
                  alignItems="center"
                >
                  <Box
                    width="100%"
                    rounded="lg"
                    overflow="hidden"
                    borderColor="coolGray.200"
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
                            fontWeight="500"
                          >
                            {key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
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
                            {deviceInfo[key]}
                          </Text>
                        </HStack>
                      </HStack>
                    </Stack>
                  </Box>
                </Box>
                
              ))}
              <Box
                width="100%"
                marginBottom="4"
                alignItems="center"
              >
                </Box>
            </React.Fragment>
          ))}
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

export default DeviceInformation;
