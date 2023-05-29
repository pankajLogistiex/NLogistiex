/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  NativeBaseProvider,
  Box,
  Image,
  Center,
  VStack,
  Button,
  Icon,
  Input,
  Heading,
  Alert,
  Text,
  Modal,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pressable, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { backendUrl } from "../utils/backendUrl";
import { BackHandler } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import messaging from "@react-native-firebase/messaging";
import {
  setUserEmail,
  setUserId,
  setUserName,
  setToken,
  setIdToken,
} from "../redux/slice/userSlice";
import { authorize } from "react-native-app-auth";

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

export default function Login() {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(0);
  const [loginClicked, setLoginClicked] = useState(false);
  const [notificationToken, setNotificationToken] = useState("");
  const navigation = useNavigation();

  const getData = async () => {
    try {
      const id = useSelector((state) => state.user.user_id);
      if (id) {
        navigation.navigate("Main");
      }
    } catch (e) {
      console.log(e);
    }
  };

  async function getProfile(token, idToken) {
    await axios
      .post(
        backendUrl + "Login/userLogin",
        {
          notificationToken: notificationToken,
        },
        { headers: { Authorization: token } }
      )
      .then((response) => {
        console.log("===login response===", response?.data?.userDetails);
        setMessage(1);
        setShowModal(true);
        AsyncStorage.setItem("userId", response?.data?.userDetails?.userId);
        AsyncStorage.setItem(
          "name",
          response?.data?.userDetails?.userFirstName +
            " " +
            response?.data?.userDetails?.userLastName
        );
        AsyncStorage.setItem(
          "email",
          response?.data?.userDetails?.userPersonalEmailId
        );
        AsyncStorage.setItem("token", token);
        AsyncStorage.setItem("idToken", idToken);
        AsyncStorage.setItem("acceptedItemData11", JSON.stringify({}));

        dispatch(setUserId(response?.data?.userDetails?.userId));
        dispatch(
          setUserEmail(response?.data?.userDetails?.userPersonalEmailId)
        );
        dispatch(
          setUserName(
            response?.data?.userDetails?.userFirstName +
              " " +
              response?.data?.userDetails?.userLastName
          )
        );
        dispatch(setToken(token));
        dispatch(setIdToken(idToken));

        setLoginClicked(false);

        setTimeout(() => {
          setShowModal(false);
          navigation.navigate("Main");
        }, 100);
      })
      .catch((err) => {
        console.log(err);
        setMessage(2);
        setShowModal(true);
        setLoginClicked(false);
      });
  }

  async function handleLogin() {
    setLoginClicked(true);
    try {
      await authorize(config)
        .then((res) => {
          console.log("====Keycloak res=====", res);
          if (res?.accessToken) {
            getProfile(res?.accessToken, res?.idToken);
          } else {
            setMessage(2);
            setShowModal(true);
            setLoginClicked(false);
          }
        })
        .catch((err) => {
          setLoginClicked(false);
          console.log(err);
          setMessage(2);
          setShowModal(true);
        });
    } catch (error) {
      console.log("Authentication error:", error);
      setLoginClicked(false);
    }
  }

  async function getUserDetails() {
    await AsyncStorage.getItem("userId")
      .then((value) => {
        dispatch(setUserId(value));
        if (value) {
          navigation.navigate("Main");
        }
      })
      .catch((err) => {
        console.log(err);
      });

    await AsyncStorage.getItem("email")
      .then((value) => {
        dispatch(setUserEmail(value));
      })
      .catch((err) => {
        console.log(err);
      });

    await AsyncStorage.getItem("name")
      .then((value) => {
        dispatch(setUserName(value));
      })
      .catch((err) => {
        console.log(err);
      });

    setIsLoading(false);
  }

  useEffect(() => {
    messaging()
      .requestPermission()
      .then((permission) => {
        if (permission) {
          console.log("Notification permission granted");
          messaging()
            .getToken()
            .then((token) => {
              console.log("FCM Token:", token);
              setNotificationToken(token);
            });
        } else {
          console.log("Notification permission denied");
        }
      });
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButtonPress
    );

    return () => backHandler.remove();
  }, []);

  const handleBackButtonPress = () => {
    BackHandler.exitApp();
    return true; // Prevent default behavior (going back to previous screen)
  };

  useEffect(() => {
    getData();
    getUserDetails();
  }, []);

  const handleLogin1 = async () => {
    setLoginClicked(true);
    await axios
      .post(backendUrl + "Login/login", {
        email: email,
        password: password,
        notificationToken: notificationToken,
      })
      .then(
        async (response) => {
          setLoginClicked(false);
          setMessage(1);
          setShowModal(true);
          await AsyncStorage.setItem(
            "userId",
            response.data.userDetails.userId
          );
          await AsyncStorage.setItem(
            "name",
            response.data.userDetails.userFirstName +
              " " +
              response.data.userDetails.userLastName
          );
          await AsyncStorage.setItem(
            "email",
            response.data.userDetails.userPersonalEmailId
          );

          dispatch(setUserId(response.data.userDetails.userId));
          dispatch(setUserEmail(response.data.userDetails.userPersonalEmailId));
          dispatch(
            setUserName(
              response.data.userDetails.userFirstName +
                " " +
                response.data.userDetails.userLastName
            )
          );

          setTimeout(() => {
            setShowModal(false);
            navigation.navigate("Main");
          }, 100);
        },
        (error) => {
          console.log(error);
          setLoginClicked(false);
          setMessage(2);
          setShowModal(true);
        }
      );
  };

  return (
    <NativeBaseProvider>
      {!isLoading ? (
        <Box flex={1} bg="#004aad" alignItems="center" pt={"40%"}>
          <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
            <Modal.Content
              backgroundColor={message === 1 ? "#dcfce7" : "#fee2e2"}
            >
              <Modal.CloseButton />
              <Modal.Body>
                <Alert w="100%" status={message === 1 ? "success" : "error"}>
                  <VStack space={1} flexShrink={1} w="100%" alignItems="center">
                    <Alert.Icon size="4xl" />
                    <Text my={3} fontSize="md" fontWeight="medium">
                      {message === 1
                        ? "Successfully logged in"
                        : "Incorrect username or password"}
                    </Text>
                  </VStack>
                </Alert>
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
              <Center>
                <Heading>Sign in</Heading>
              </Center>
              {/* <Input
                value={email}
                onChangeText={setEmail}
                size="lg"
                InputLeftElement={
                  <Icon
                    as={<MaterialIcons name="email-outline" />}
                    size={6}
                    ml="2"
                    color="muted.400"
                  />
                }
                placeholder="Enter your email"
              />
              <Input
                value={password}
                onChangeText={setPassword}
                size="lg"
                InputLeftElement={
                  <Icon
                    as={<MaterialIcons name="lock-outline" />}
                    size={6}
                    ml="2"
                    color="muted.400"
                  />
                }
                type={show ? "text" : "password"}
                InputRightElement={
                  <Pressable onPress={() => setShow(!show)}>
                    <Icon
                      as={<MaterialIcons name={show ? "eye" : "eye-off"} />}
                      size={6}
                      mr="2"
                      color="muted.400"
                    />
                  </Pressable>
                }
                placeholder="Password"
              /> */}
              {loginClicked ? (
                <Button
                  isLoading
                  isLoadingText="Login"
                  title="Login"
                  backgroundColor="#004aad"
                  _text={{ color: "white", fontSize: 20 }}
                >
                  LOGIN
                </Button>
              ) : (
                <Button
                  title="Login"
                  backgroundColor="#004aad"
                  _text={{ color: "white", fontSize: 20 }}
                  onPress={() => handleLogin()}
                >
                  LOGIN
                </Button>
              )}
            </VStack>
          </Box>
          <Center>
            <Image
              style={{ width: 300, height: 300 }}
              source={require("../assets/logo.png")}
              alt={"Logo Image"}
            />
          </Center>
        </Box>
      ) : null}
    </NativeBaseProvider>
  );
}
