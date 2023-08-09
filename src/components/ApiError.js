import axios from 'axios';
import { ToastAndroid } from 'react-native';
import { backendUrl } from '../utils/backendUrl';
import DeviceInfo from 'react-native-device-info';
import { Provider, useDispatch, useSelector } from "react-redux";
// import GetLocation from 'react-native-get-location';

export const callApi = async (APIerror,latitude,longitude, userId, token) => {
  let time11 = new Date().valueOf();
  const deviceId = await DeviceInfo.getUniqueId();
  try {
  //   const location = await GetLocation.getCurrentPosition({
  //     enableHighAccuracy: true,
  //     timeout: 10000,
  //   });
  //   const { latitude, longitude } = location;

    const response = await axios.post(backendUrl + 'SellerMainScreen/registerDeviceErros', {
      deviceId: deviceId,
      userId: userId,
      requestTime: parseInt(time11),
      latitude: latitude,
      longitude: longitude,
      infoParameters: APIerror,
    },
    { headers: { Authorization: token } });

    // console.log(response);
    ToastAndroid.show('Error Report Submitted', ToastAndroid.SHORT);
    console.log('API response:', response.data);
  } catch (error) {
    console.error('Error API Error:', error);
  }
};
