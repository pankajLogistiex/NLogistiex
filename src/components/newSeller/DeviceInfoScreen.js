import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';
const DeviceInformation = () => {
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    fetchDeviceInfo();
  }, []);

  const fetchDeviceInfo = async () => {
    try {
      const uniqueId = await getUniqueIdWithCatch();
      const manufacturer = await getManufacturerWithCatch();
      const modelName = await getModelWithCatch();
      const brand = await getBrandWithCatch();
      const systemName = await getSystemNameWithCatch();
      const systemVersion = await getSystemVersionWithCatch();
      const bundleId = await getBundleIdWithCatch();
      const buildNumber = await getBuildNumberWithCatch();
      const version = await getVersionWithCatch();
      const buildNumberIOS = await getBuildNumberIOSWithCatch();
      const installReferrer = await getInstallReferrerWithCatch();
      const ipAddress = await getIpAddressWithCatch();
      const macAddress = await getMacAddressWithCatch();
      const locale = await getLocaleWithCatch();
      const country = await getCountryWithCatch();
      const timezone = await getTimezoneWithCatch();

      const deviceInfoData = {
        uniqueId,
        manufacturer,
        modelName,
        brand,
        systemName,
        systemVersion,
        bundleId,
        buildNumber,
        version,
        buildNumberIOS,
        installReferrer,
        ipAddress,
        macAddress,
        locale,
        country,
        timezone,
      };

      setDeviceInfo(deviceInfoData);
    } catch (error) {
      console.error('Error fetching device information:', error);
    }
  };

  const getUniqueIdWithCatch = async () => {
    try {
      return await DeviceInfo.getUniqueId();
    } catch (error) {
      console.error('Error getting unique ID:', error);
      return null;
    }
  };

  const getManufacturerWithCatch = async () => {
    try {
      return await DeviceInfo.getManufacturer();
    } catch (error) {
      console.error('Error getting manufacturer:', error);
      return null;
    }
  };

  const getModelWithCatch = async () => {
    try {
      return await DeviceInfo.getModel();
    } catch (error) {
      console.error('Error getting model:', error);
      return null;
    }
  };

  const getBrandWithCatch = async () => {
    try {
      return await DeviceInfo.getBrand();
    } catch (error) {
      console.error('Error getting brand:', error);
      return null;
    }
  };

  const getSystemNameWithCatch = async () => {
    try {
      return await DeviceInfo.getSystemName();
    } catch (error) {
      console.error('Error getting system name:', error);
      return null;
    }
  };

  const getSystemVersionWithCatch = async () => {
    try {
      return await DeviceInfo.getSystemVersion();
    } catch (error) {
      console.error('Error getting system version:', error);
      return null;
    }
  };

  const getBundleIdWithCatch = async () => {
    try {
      return await DeviceInfo.getBundleId();
    } catch (error) {
      console.error('Error getting bundle ID:', error);
      return null;
    }
  };

  const getBuildNumberWithCatch = async () => {
    try {
      return await DeviceInfo.getBuildNumber();
    } catch (error) {
      console.error('Error getting build number:', error);
      return null;
    }
  };

  const getVersionWithCatch = async () => {
    try {
      return await DeviceInfo.getVersion();
    } catch (error) {
      console.error('Error getting version:', error);
      return null;
    }
  };

  const getBuildNumberIOSWithCatch = async () => {
    try {
      return await DeviceInfo.getBuildNumber();
    } catch (error) {
      console.error('Error getting iOS build number:', error);
      return null;
    }
  };

  const getInstallReferrerWithCatch = async () => {
    try {
      return await DeviceInfo.getInstallReferrer();
    } catch (error) {
      console.error('Error getting install referrer:', error);
      return null;
    }
  };

  const getIpAddressWithCatch = async () => {
    try {
      return await DeviceInfo.getIpAddress();
    } catch (error) {
      console.error('Error getting IP address:', error);
      return null;
    }
  };

  const getMacAddressWithCatch = async () => {
    try {
      return await DeviceInfo.getMacAddress();
    } catch (error) {
      console.log('Error getting MAC address:', error);
      return null;
    }
  };

  const getLocaleWithCatch = async () => {
    try {
      return await RNLocalize.getLocales()[0].languageCode;
    } catch (error) {
      console.error('Error getting locale:', error);
      return null;
    }
  };

  const getCountryWithCatch = async () => {
    try {
      return await RNLocalize.getLocales()[0].countryCode;
    } catch (error) {
      console.error('Error getting country:', error);
      return null;
    }
  };
 

  const getTimezoneWithCatch = async () => {
    try {
      return await RNLocalize.getTimeZone();
    } catch (error) {
      console.error('Error getting timezone:', error);
      return null;
    }
  };

  return (
    <View style={{margin:10,marginLeft:15,}}>
        <Text style={{color:'black',fontSize:17,fontWeight:'bold',}}>Device Information</Text>
      {deviceInfo && (
        <View>
          <Text style={{color:'grey',}}>Unique ID: {deviceInfo.uniqueId}</Text>
          <Text style={{color:'grey',}}>Manufacturer: {deviceInfo.manufacturer}</Text>
          <Text style={{color:'grey',}}>Model Name: {deviceInfo.modelName}</Text>
          <Text style={{color:'grey',}}>Brand: {deviceInfo.brand}</Text>
          <Text style={{color:'grey',}}>System Name: {deviceInfo.systemName}</Text>
          <Text style={{color:'grey',}}>System Version: {deviceInfo.systemVersion}</Text>
          <Text style={{color:'grey',}}>Bundle ID: {deviceInfo.bundleId}</Text>
          <Text style={{color:'grey',}}>Build Number: {deviceInfo.buildNumber}</Text>
          <Text style={{color:'grey',}}>Application Version: {deviceInfo.version}</Text>
          {/* <Text style={{color:'grey',}}>Build Number (iOS): {deviceInfo.buildNumberIOS}</Text> */}
          <Text style={{color:'grey',}}>Install Referrer: {deviceInfo.installReferrer}</Text>
          <Text style={{color:'grey',}}>IP Address: {deviceInfo.ipAddress}</Text>
          <Text style={{color:'grey',}}>MAC Address: {deviceInfo.macAddress}</Text>
          <Text style={{color:'grey',}}>Locale: {deviceInfo.locale}</Text>
          <Text style={{color:'grey',}}>Country: {deviceInfo.country}</Text>
          <Text style={{color:'grey',}}>Timezone: {deviceInfo.timezone}</Text>
        </View>
      )}
    </View>
  );
};

export default DeviceInformation;
