/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import {
  NativeBaseProvider,
  Box,
  Image,
  Center,
  Button,
  ArrowForwardIcon, 
} from 'native-base';
import {StyleSheet,View, ScrollView, Linking,ActivityIndicator,TouchableOpacity} from 'react-native';
import {DataTable, Searchbar, Text, Card} from 'react-native-paper';
import Lottie from 'lottie-react-native';
import {ProgressBar} from '@react-native-community/progress-bar-android';
import {openDatabase} from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";
import { setAutoSync } from "../../redux/slice/autoSyncSlice";

import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const db = openDatabase({name: 'rn_sqlite'});

const SellerHandover = ({ route }) => {
  const dispatch = useDispatch();
  const syncTimeFull = useSelector((state) => state.autoSync.syncTimeFull);

  const [data, setData] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [numScanned, setNumScanned] = useState(0);
  const [displayData, setDisplayData] = useState({});
  const [results, setResults] = useState({});
  const currentDateValue = useSelector((state) => state.currentDate.currentDateValue) || new Date().toISOString().split('T')[0] ;
  const [loading, setLoading] = useState(true);
  const [MM,setMM] = useState(0);
  const [acceptedItemData, setAcceptedItemData] = useState({});
//   const expectedSum = Object.values(displayData).reduce((sum, item) => sum + (item.expected > 0 ? item.expected : 0), 0);
// const scannedSum = Object.values(displayData).reduce((sum, item) => sum + (item.expected > 0 ? item.scanned : 0), 0);

 const scannedSum = Object.values(displayData).reduce((sum, item) => sum + (item.expected > 0 && item.expected === item.scanned && !acceptedItemData[item.stopId] ? 1 : 0), 0);
 const expectedSum = Object.values(displayData).reduce((sum, item) => sum + (item.expected > 0 ?  1 : 0), 0);

  // const progress = Object.values(displayData).reduce((sum, item) => sum + (item.expected > 0 ? item.scanned : 0), 0) / Object.values(displayData).reduce((sum, item) => sum + (item.expected > 0 ? item.expected : 0), 0);
  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(setAutoSync(true));
      loadDetails();
    });
    return unsubscribe;
  }, [navigation, syncTimeFull]);

useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
  AsyncStorage.getItem('acceptedItemData')
  .then((data) => {
    if (data !== null) {
      const acceptedItemData123 = JSON.parse(data);
      console.log(acceptedItemData123);
      setAcceptedItemData(acceptedItemData123);
    } else {
      console.log("Data is null ",data);
    }
  })
  .catch((error) => {
    console.log(error);
  });
});
return unsubscribe;
}, [navigation, syncTimeFull]);
// console.log(loading);
  const loadDetails = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM SyncSellerPickUp WHERE FMtripId = ? ORDER BY CAST(sellerIndex AS INTEGER) ASC', [route.params.tripID], (tx1, results) => {
        let temp = [];
        var m = 0;
        for (let i = 0; i < results.rows.length; ++i) {
          
          const newData = {};
          temp.push(results.rows.item(i));
          // console.log(results.rows.item(i).consignorName," " ,results.rows.item(i).sellerIndex);

          // var stopId=results.rows.item(i).stopId;
          var consignorName=results.rows.item(i).sellerIndex;
// console.log(consignorName);
          db.transaction(tx => {
            db.transaction(tx => {
              tx.executeSql(
                'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=?',
                [results.rows.item(i).stopId, results.rows.item(i).FMtripId],
                (tx1, results11) => {
                  //    console.log(results11,'1',results11.rows.length);
                  //    var expected=results11.rows.length;
                  tx.executeSql(
                    'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND handoverStatus IS NOT NULL',
                    [results.rows.item(i).stopId, results.rows.item(i).FMtripId],
                    (tx1, results22) => {
                      setMM(MM + results22.rows.length);
                      // console.log(results22,'2',results22.rows.length);
                      // var scanned=results.rows.length;
                      newData[results.rows.item(i).stopId] = {
                        consignorName: results.rows.item(i).consignorName,
                        stopId:results.rows.item(i).stopId,
                        consignorContact:results.rows.item(i).consignorContact,
                        consignorAddress1 :results.rows.item(i).consignorAddress1,
                        consignorCity:results.rows.item(i).consignorCity,
                        consignorAddress2:results.rows.item(i).consignorAddress2,
                        consignorPincode:results.rows.item(i).consignorPincode,
                        consignorLatitude:results.rows.item(i).consignorLatitude,
                        consignorLongitude:results.rows.item(i).consignorLongitude,
                        sequenceNumber:results.rows.item(i).sellerIndex,
                        expected: results11.rows.length,
                        scanned: results22.rows.length,
                      };
                      // console.log(newData);
                      if (newData != null && results11.rows.length>0) {
                        setDisplayData(prevData => ({
                          ...prevData,
                          ...newData,
                        }));
                        // console.log(results.rows.item(i).consignorName," " ,results.rows.item(i).sellerIndex);
                      }
                      if(i===results.rows.length-1){
                        setLoading(false);
                      }
                    },
                  );
                },
              );
            });
          });

        }
        setData(temp);
        // setLoading(false);
      });
    });

    db.transaction((tx) => {
      tx.executeSql(
        `SELECT stopId, AcceptedList
        FROM closeHandoverBag1`,
        [],
        (tx, resultSet) => {
          // console.log("resultSet", resultSet.rows.raw());
          const rows = resultSet.rows.raw();
          const updatedResults = {};
    
          rows.forEach((item) => {
            const stopId = item.stopId;
            const acceptedList = JSON.parse(item.AcceptedList);
    
            if (!updatedResults[stopId]) {
              updatedResults[stopId] = 0;
            }
    
            updatedResults[stopId] += acceptedList.length;
    
            // console.log("item", item);
          });
               
          setResults(updatedResults);
          console.log("Seller Closed Bags Count : ",updatedResults);
        }
      );
    });

  };
//   useEffect(() => {
//     loadDetails()
//   }, [])
const handlePhoneIconPress = (phone) => {
  console.log(`Calling ${phone}`);
  Linking.openURL('tel:' + phone);
};

const handleMapIconPress = (seller) => {
  // console.log(`Navigating to ${seller}`);
  const type = `${seller.consignorAddress1 ? seller.consignorAddress1 + ' ' : ''}${seller.consignorAddress2 ? seller.consignorAddress2 + ', ' : ''}${seller.consignorCity ? seller.consignorCity + ' ' : ''}${seller.consignorPincode || ''}`;
// console.log(type);
  const scheme = Platform.select({ios: 'maps:0,0?q=', android: 'geo:0,0?q='});
  const latLng = `${seller.consignorLatitude},${seller.consignorLongitude}`;
  const label = type;
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`,
  });

  Linking.openURL(url);
};

  const displayData11 = Object.keys(displayData)
    .filter(sealID => sealID.toLowerCase().includes(keyword.toLowerCase()))
    .reduce((obj, key) => {
      obj[key] = displayData[key];
      return obj;
    }, {});

  // const searched = (keyword1) => (c) => {
  //     let f = c.consignorName;
  //     return (f.includes(keyword1));
  // };
  
  return (
    <NativeBaseProvider>
      {loading ? 
        // <ActivityIndicator size="large" color="blue" style={{marginTop: 44}} />
        <View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1,
                  backgroundColor: 'rgba(0,0,0,0.65)',
                },
              ]}>
              <Text style={{color: 'white'}}>Loading...</Text>
              <Lottie
                source={require('../../assets/loading11.json')}
                autoPlay
                loop
                speed={1}
                //   progress={animationProgress.current}
              />
              <ProgressBar width={70} />
            </View>
      :
      <Box flex={1} bg="#fff" width="auto" maxWidth="100%">


      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0, padding: 14, justifyContent: 'center', alignItems: 'center' }}> 
<View
      style={{
        width: '100%',
        height: 50,
        backgroundColor: '#f2f2f2',
        borderRadius: 5,
        overflow: 'hidden',
        
      }}
    >
      <View
        style={{
          width: `${(scannedSum/expectedSum)*100}%`,
          height: '100%',
          backgroundColor: '#90ee90',
          borderRadius: 5,
        }}
      />
      <Text
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          textAlignVertical: 'center',
          fontSize: 18,
          color: 'black',
          fontWeight: 'bold',
        }}
      >
       Handover Attempted (
        {scannedSum}/{expectedSum})
      </Text>
    </View>
    </View>

        <ScrollView
          style={styles.homepage}
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={false}>

              {displayData && data.length > 0
                ? Object.keys(displayData11).map((stopId, i) =>
                    displayData11[stopId].expected > 0 ? displayData11[stopId].expected !== displayData11[stopId].scanned ? (

         <View key={stopId}> 
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderRadius: 10,
              marginVertical: 8,
              backgroundColor: i  % 2 === 0 ? '#E6F2FF' : '#FFFFFF', 
              shadowColor:'black' ,
              shadowOffset: { width: 5, height: 5 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 5,
            }}
          >
            <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#004aad'}}>
   {i+1}.{" "}{displayData11[stopId].consignorName}
</Text>

              <Text style={{ marginBottom: 4 , color: 'black'}}>{displayData11[stopId].consignorAddress1}</Text>
              <Text style={{ marginBottom: 4 , color: 'black'}}>{displayData11[stopId].consignorCity}, {displayData11[stopId].consignorAddress2}, {displayData11[stopId].consignorPincode}</Text>
              <Text style={{fontWeight: 'bold', marginTop: 8, color: '#004aad' }}>Handovers({displayData11[stopId].expected}) </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => handlePhoneIconPress( displayData11[stopId].consignorContact)}>
                <MaterialIcons name="phone" size={24} style={{ marginBottom: 12 , }} color="green" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMapIconPress( displayData11[stopId])}>
                <MaterialIcons name="map-marker-account-outline" size={28} style={{ marginBottom: 12 , }} color="#FFBF00"  />
              </TouchableOpacity>
              <Text style={{fontWeight: 'bold',marginTop: 8,  color: '#004aad'}}>Scanned({displayData11[stopId].scanned}) </Text>
            </View>
          </View>
         </View>


                      ) 
                      : 
                      (

                      //  results && results[stopId]  && results[stopId] === displayData11[stopId].expected
                      !acceptedItemData[stopId]
                       ? 

<View key={stopId}>
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderRadius: 10,
      marginVertical: 8,
      backgroundColor: i % 2 === 0 ? '#E6F2FF' : '#FFFFFF',
      shadowColor: 'black',
      shadowOffset: { width: 5, height: 5 },
      shadowOpacity: 0.8,
      shadowRadius: 20,
      elevation: 5,
      position: 'relative',
    }}
  >
    <Image alt={'Completed Icon'}
      source={require('../../assets/complete/IMG_complete.png')}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 150,
        height: 150,
        opacity: 0.8,
        marginLeft:'31%',
        tintColor: '#90ee90',
        resizeMode: 'cover',
      }}
    />

    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#004aad' }}>
        {i + 1}. {displayData11[stopId].consignorName}
      </Text>

      <Text style={{ marginBottom: 4, color: 'black' }}>{displayData11[stopId].consignorAddress1}</Text>
      <Text style={{ marginBottom: 4, color: 'black' }}>
        {displayData11[stopId].consignorCity}, {displayData11[stopId].consignorAddress2},{' '}
        {displayData11[stopId].consignorPincode}
      </Text>
      <Text style={{ fontWeight: 'bold', marginTop: 8, color: '#004aad' }}>
        Handovers({displayData11[stopId].expected})
      </Text>
    </View>

    <View style={{ alignItems: 'flex-end' }}>
      <TouchableOpacity onPress={() => handlePhoneIconPress(displayData11[stopId].consignorContact)}>
        <MaterialIcons name="phone" size={24} style={{ marginBottom: 12 }} color="green" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleMapIconPress(displayData11[stopId])}>
        <MaterialIcons
          name="map-marker-account-outline"
          size={28}
          style={{ marginBottom: 12 }}
          color="#FFBF00"
        />
      </TouchableOpacity>
      <Text style={{ fontWeight: 'bold', marginTop: 8, color: '#004aad' }}>Scanned({displayData11[stopId].scanned})</Text>
    </View>
  </View>
</View>



                      
                      :

<View   key={stopId}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderRadius: 10,
              marginVertical: 8,
              backgroundColor:i  % 2 === 0 ? '#E6F2FF' : '#FFFFFF', 
              shadowColor:'black' ,
              shadowOffset: { width: 5, height: 5 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 5,
            }}
          > 
            <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#004aad'}}>
   {i+1}.{" "}{displayData11[stopId].consignorName}
</Text>

              <Text style={{ marginBottom: 4 , color: 'black'}}>{ displayData11[stopId].consignorAddress1}</Text>
              <Text style={{ marginBottom: 4 , color: 'black'}}>{ displayData11[stopId].consignorCity}, { displayData11[stopId].consignorAddress2}, { displayData11[stopId].consignorPincode}</Text>
              <Text style={{fontWeight: 'bold', marginTop: 8, color: '#004aad' }}>Handovers({displayData11[stopId].expected}) </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => handlePhoneIconPress( displayData11[stopId].consignorContact)}>
                <MaterialIcons name="phone" size={24} style={{ marginBottom: 12 , }} color="green" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMapIconPress( displayData11[stopId])}>
                <MaterialIcons name="map-marker-account-outline" size={28} style={{ marginBottom: 12 , }} color="#FFBF00"  />
              </TouchableOpacity>
              <Text style={{fontWeight: 'bold',marginTop: 8,  color: '#004aad'}}>Scanned({displayData11[stopId].scanned}) </Text>
            </View>
          </View>
        </View> 

                        )
                     : null,
                  )
                : null}
          <Center>
          <Image
            style={{width: 150, height: 150}}
            source={require('../../assets/image.png')}
            alt={'Logo Image'}
          />
        </Center>
        </ScrollView>
        <Center>
          <Button
            w="50%"
            size="lg"
            style={{backgroundColor: '#004aad', color: '#fff',marginBottom:30}}
            onPress={() => navigation.navigate('HandoverShipmentRTO', {
              allCloseBAgData: acceptedItemData,
              tripID:route.params.tripID,
            })}>
            Start Scanning
          </Button>
        </Center>
        {/* <Center>
          <Image
            style={{width: 150, height: 150}}
            source={require('../../assets/image.png')}
            alt={'Logo Image'}
          />
        </Center> */}
      </Box>}
    </NativeBaseProvider>
  );
};
export default SellerHandover;
export const styles = StyleSheet.create({
  container112: {
    justifyContent: 'center',
  },
  tableHeader: {
    backgroundColor: '#004aad',
    alignItems: 'flex-start',
    fontFamily: 'open sans',
    fontSize: 15,
    color: 'white',
    margin: 1,
  },
  container222: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.2 )',
  },
  normal: {
    fontFamily: 'open sans',
    fontWeight: 'normal',
    color: '#eee',
    marginTop: 27,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#eee',
    width: 'auto',
    borderRadius: 0,
    alignContent: 'space-between',
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
    justifyContent: 'space-between',
    paddingLeft: 20,
  },
  main: {
    backgroundColor: '#004aad',
    width: 'auto',
    height: 'auto',
    margin: 1,
  },
  textbox: {
    alignItems: 'flex-start',
    fontFamily: 'open sans',
    fontSize: 13,
    color: '#fff',
  },
  homepage: {
    margin: 10,
    marginTop:-5,
    // backgroundColor:"lightgrey",
  },
  mainbox: {
    width: '98%',
    height: 40,
    backgroundColor: 'lightblue',
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 1,
  },
  innerup: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'blue',
  },
  innerdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fontvalue: {
    fontWeight: '300',
    flex: 1,
    fontFamily: 'open sans',
    justifyContent: 'center',
  },
  fontvalue1: {
    fontWeight: '700',
    marginTop: 10,
    marginLeft: 100,
    marginRight: -10,
  },
  searchbar: {
    width: '95%',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  bt1: {
    fontFamily: 'open sans',
    fontSize: 15,
    lineHeight: 0,
    marginTop: 0,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#004aad',
    width: 110,
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 15,
    marginVertical: 0,
  },
  bt2: {
    fontFamily: 'open sans',
    fontSize: 15,
    lineHeight: 0,
    marginTop: -45,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#004aad',
    width: 110,
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 235,
    marginVertical: 0,
  },
  btnText: {
    alignSelf: 'center',
    color: '#fff',
    fontSize: 15,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 0,
  },
});
