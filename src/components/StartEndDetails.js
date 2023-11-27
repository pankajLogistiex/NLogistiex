import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  NativeBaseProvider,
  Box,
  Center,
  VStack,
  Button,
  Icon,
  Input,
  Heading,
  Alert,
  Text,
  Modal,
  ScrollView,
  Stack,
} from "native-base";
import { Image, StyleSheet, View } from "react-native";
import { backendUrl } from "../utils/backendUrl";
import moment from "moment";
import { getAuthorizedHeaders } from "../utils/headers";

export default function StartEndDetails({ navigation, route }) {
  const [data, setData] = useState();
  const [token, setToken] = useState(route.params.token);
  const [printData, setPrintData] = useState([]);
  const [startImage, setStartImage] = useState("");
  const [endImage, setEndImage] = useState("");
  useEffect(() => {
    axios
      .get(backendUrl + "UserTripInfo/getUserTripInfo", {
        params: {
          tripID: route.params.tripID,
        },
        headers: getAuthorizedHeaders(token),
      })
      .then((response) => {
        console.log("StartEndDetails/useEffect/data", response.data);
        setData(response.data);
        setPrintData(response?.data?.res_data);
        if (response?.data?.res_data?.startVehicleImageUrl) {
          axios
            .get(
              "https://storage.dev.logistiex.com/api/file-metas/" +
                response?.data?.res_data?.startVehicleImageUrl,
              {
                headers: getAuthorizedHeaders(token),
              }
            )
            .then((res) => {
              setStartImage(res.data?.signedUrl);
            })
            .catch((error) => {
              console.log(
                error,
                "StartEndDetails/useEffect/errorInStartTripImage"
              );
            });
        }
        if (response?.data?.res_data?.endVehicleImageUrl) {
          axios
            .get(
              "https://storage.dev.logistiex.com/api/file-metas/" +
                response?.data?.res_data?.endVehicleImageUrl,
              {
                headers: getAuthorizedHeaders(token),
              }
            )
            .then((res) => {
              setEndImage(res.data?.signedUrl);
            })
            .catch((error) => {
              console.log(
                error,
                "StartEndDetails/useEffect/errorInEndTripImage"
              );
            });
        }
      })
      .catch((error) => {
        console.log(error, "StartEndDetails/useEffect/error");
      });
  }, []);
  console.log("StartEndDetails/printData/", printData);
  return printData ? (
    <NativeBaseProvider>
      <ScrollView>
        <Box marginTop={1}>
          <Stack space="2" p="4">
            <Text
              style={{
                backgroundColor: "#CCCCCC",
                fontSize: 16,
                borderWidth: 1,
                borderColor: "#004aad",
                borderRadius: 5,
                paddingVertical: 15,
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "black",
              }}
            >
              Start Time -{" "}
              {moment(printData.startTime)
                .utcOffset("+05:30")
                .format("YYYY-MM-DD HH:mm:ss")}
            </Text>
            <Text
              style={{
                backgroundColor: "#CCCCCC",
                fontSize: 16,
                borderWidth: 1,
                borderColor: "#004aad",
                borderRadius: 5,
                paddingVertical: 15,
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "black",
              }}
            >
              Vehicle Number - {printData.vehicleNumber}
            </Text>
            <Text
              style={{
                backgroundColor: "#CCCCCC",
                fontSize: 16,
                borderWidth: 1,
                borderColor: "#004aad",
                borderRadius: 5,
                paddingVertical: 15,
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "black",
              }}
            >
              Start Kilometer - {printData.startKilometer}
            </Text>
            <Text
              style={{
                backgroundColor: "#CCCCCC",
                fontSize: 16,
                borderWidth: 1,
                borderColor: "#004aad",
                borderRadius: 5,
                paddingVertical: 15,
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "black",
              }}
            >
              End Kilometer - {printData.endkilometer}
            </Text>
            <Text
              style={{
                backgroundColor: "#CCCCCC",
                fontSize: 16,
                borderWidth: 1,
                borderColor: "#004aad",
                borderRadius: 5,
                paddingVertical: 15,
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "black",
              }}
            >
              Total Trip Time -{" "}
              {Math.floor(
                ((printData.endTime - printData.startTime) / 1000 / 60 / 60) %
                  24
              )}{" "}
              hours{" "}
              {Math.floor(
                ((printData.endTime - printData.startTime) / 1000 / 60) % 60
              )}{" "}
              min{" "}
              {Math.floor(
                ((printData.endTime - printData.startTime) / 1000 / 60 / 60) %
                  24
              )}{" "}
              sec
            </Text>
            <Text
              style={{
                backgroundColor: "#CCCCCC",
                fontSize: 16,
                borderWidth: 1,
                borderColor: "#004aad",
                borderRadius: 5,
                paddingVertical: 15,
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "black",
              }}
            >
              Total KMs Travelled -{" "}
              {printData.endkilometer - printData.startKilometer}
            </Text>
          </Stack>
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {startImage ? (
              <Image
                style={{ height: 200, width: "90%", borderRadius: 5 }}
                source={{ uri: startImage }}
                alt="image base"
              />
            ) : null}
            <Text
              bold
              position="absolute"
              color="coolGray.50"
              top="0"
              m="4"
              bgColor="#004aad"
            >
              Start vehicle
            </Text>
            {endImage ? (
              <Image
                marginTop={15}
                style={{ height: 200, width: "90%", borderRadius: 5 }}
                source={{ uri: endImage }}
                alt="image base"
              />
            ) : null}
            <Text bold position="absolute" color="coolGray.50" top="40" m="20">
              End vehicle
            </Text>
          </View>
        </Box>
        <Center>
          <Image
            style={{ width: 150, height: 100 }}
            source={require("../assets/image.png")}
            alt={"Logo Image"}
          />
        </Center>
      </ScrollView>
    </NativeBaseProvider>
  ) : (
    <NativeBaseProvider>
      <Text>Loading</Text>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
  },
  stretch: {
    width: 170,
    height: 200,
    resizeMode: "stretch",
  },
});
