import {
    ArrowForwardIcon,
    NativeBaseProvider,
    Box,
    Image,
    Center,
    Modal,
    Alert,
    VStack
  } from 'native-base';
  import {StyleSheet, ScrollView, View, Linking,ActivityIndicator,TouchableOpacity} from 'react-native';
  import {DataTable, Searchbar, Text, Card} from 'react-native-paper';
  import {openDatabase} from 'react-native-sqlite-storage';
  import React, {useEffect, useState} from 'react';
  import {useNavigation} from '@react-navigation/native';
  import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
  import { useDispatch, useSelector } from "react-redux";
  import { setAutoSync } from "../../redux/slice/autoSyncSlice";
  const db = openDatabase({name: 'rn_sqlite'});
  
  const SellerDeliveries = ({route}) => {
    const dispatch = useDispatch();
    const syncTimeFull = useSelector((state) => state.autoSync.syncTimeFull);
    const currentDateValue = useSelector((state) => state.currentDate.currentDateValue) || new Date().toISOString().split('T')[0] ;
    const [dataSeller, setData] = useState([]);
    const [data, setData11] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [pending11Seller,setPending] =useState([]);
    const [valueSeller,setValue] =useState([]);
    const [reverseSeller,setReverse] =useState([]);
    // const [pending11,setPending] =useState([]);
    const [pendingP,setPendingP] =useState([]);
    // const [value,setValue] =useState([]);
    // const [reverse,setReverse] =useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal1, setShowModal1] = useState(false);
    const [message1, setMessage1] = useState(0);


    
    const navigation = useNavigation();
    
      // const data =dataSeller.filter((_, index) => valueSeller[index] !== 0);
      const pending11 =pending11Seller.filter((_, index) => reverseSeller[index] !== 0);
      const value = valueSeller.filter((_, index) => reverseSeller[index] !== 0);
      const reverse = reverseSeller.filter((_, index) => reverseSeller[index] !== 0);
    
      useEffect(() => {
      
    if(reverse && reverse.length>0 && data && data.length===0){
      setData11(dataSeller.filter((_, index) => reverseSeller[index] !== 0));
    // console.log(data.length);
    }
    
      }, [reverseSeller,data])
      // console.log(data.length);
      // console.log(dataSeller.length," ",pending11Seller+" ",reverseSeller+" ",valueSeller);
      // console.log(data.length,"  ",pending11+" ",reverse+" ",value);
      const scannedSum  =  data.reduce((sum, seller, i) => sum + (reverse[i] > 0 && pending11[i]===reverse[i] && seller.otpSubmittedDelivery === "true" ? 1 : 0), 0);
      const expectedSum = reverse.reduce((accumulator, currentValue) => accumulator + (currentValue > 0 ? 1 : 0), 0);
  
      useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
          dispatch(setAutoSync(true));
          loadDetails();
          setData11([]);
        });
        return unsubscribe;
      }, [navigation, syncTimeFull]);

    const loadDetails = () => { // setIsLoading(!isLoading);
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM SyncSellerPickUp ORDER BY  CAST(sellerIndex AS INTEGER) ASC', [], (tx1, results) => { // ToastAndroid.show("Loading...", ToastAndroid.SHORT);
                let temp = [];
                // console.log(results.rows.length);
                for (let i = 0; i < results.rows.length; ++i) {
                    temp.push(results.rows.item(i));
                }
                setData(temp);
                // setLoading(false);
            });
        });
        
    };
    useEffect(() => {
      if (dataSeller.length > 0) {
        const counts = [];
        dataSeller.forEach((single) => {
          db.transaction((tx) => {
            tx.executeSql(
              'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=? AND status IS NOT NULL',
              [single.stopId],
              (tx1, results) => {
                counts.push(results.rows.length);
                if (counts.length === dataSeller.length) {
                  setPendingP(counts);
                }
              },
            );
          });
        });
      }
    }, [dataSeller, db]);
    useEffect(() => {
        if (dataSeller.length > 0) {
          const counts = [];
          dataSeller.forEach((single) => {
            db.transaction((tx) => {
              tx.executeSql(
                'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND status IS NOT NULL',
                [single.stopId],
                (tx1, results) => {
                  counts.push(results.rows.length);
                  if (counts.length === dataSeller.length) {
                    setPending(counts);
                  }
                },
              );
            });
          });
        }
      }, [dataSeller, db]);
      useEffect(() => {
        if (dataSeller.length > 0) {
          const counts = [];
          dataSeller.forEach((single) => {
            db.transaction((tx) => {
              tx.executeSql(
                'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=?',
                [single.stopId],
                (tx1, results) => {
                  counts.push(results.rows.length);
                  if (counts.length === dataSeller.length) {
                    setValue(counts);
                  }
                },
              );
            });
          });
        }
      }, [dataSeller, db]);
      useEffect(() => {
        if (dataSeller.length > 0) {
          const counts = [];
          dataSeller.forEach((single) => {
            db.transaction((tx) => {
              tx.executeSql(
                'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND handoverStatus="accepted"',
                [single.stopId],
                (tx1, results) => {
                  counts.push(results.rows.length);
                  if (counts.length === dataSeller.length) {
                    setReverse(counts);
                    setLoading(false);

                  }
                },
              );
            });
          });
        }
      }, [dataSeller, db]);
      
    useEffect(() => {
        (async () => {
            loadDetails();
        })();
    }, []);

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

    const searched = (keyword1) => (c) => {
        let f = c.consignorName;
        return (f.includes(keyword1));
    };
    
    const handleTrip=()=>{
      if(route.params.PendingHandover!=0){
        setMessage1(2);
        setShowModal1(true);
        // navigation.navigate('Main');
      }
      else{
        setMessage1(1);
        setShowModal1(true);
        // navigation.navigate('Main');
      }
    }
    
  return (
  <NativeBaseProvider>
    <Modal isOpen={showModal1} onClose={() => {setShowModal1(false);navigation.navigate('Main')}}>
                <Modal.Content backgroundColor={message1 === 1 ? '#fee2e2' : '#fee2e2'}>
                  <Modal.CloseButton />
                  <Modal.Body>
                    <Alert w="100%" status={message1 === 1 ? 'error' : 'error'}>
                      <VStack space={1} flexShrink={1} w="100%" alignItems="center">
                        <Alert.Icon size="4xl" />
                        <Text my={3} fontSize="md" fontWeight="medium">{message1 === 1 ? 'Trip Not Started Yet' : 'Please complete handover before Start a trip'}</Text>
                      </VStack>
                    </Alert>
                  </Modal.Body>
                </Modal.Content>
      </Modal>
    {loading ? 
        <ActivityIndicator size="large" color="blue" style={{marginTop: 44}} />
      :
      <Box flex={1} bg="#fff"  width="auto" maxWidth="100%">


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
       Delivery Attempted (
        {scannedSum}/{expectedSum})
      </Text>
    </View>
    </View>

      <Searchbar
        placeholder="Search Seller Name"
        onChangeText={(e) => setKeyword(e)}
        value={keyword}
        style={{marginHorizontal: 15, marginTop: 10}}
      />
      <ScrollView style={styles.homepage} showsVerticalScrollIndicator={true} showsHorizontalScrollIndicator={false}>
        
           {route.params.Trip !== 'Start Trip' && data && data.length > 0
                ? data.filter(searched(keyword)).map((single, i) =>
                    reverse[i] > 0 ? (pending11[i]==reverse[i]) && single.otpSubmittedDelivery === "true"? (

                      <TouchableOpacity key={single.stopId} onPress={() => {
                                  navigation.navigate('SellerHandoverSelection', {
                                 paramKey: single.stopId,
                                 Forward: value[i],
                                 consignorAddress1: single.consignorAddress1,
                                 consignorAddress2: single.consignorAddress2,
                                 consignorCity: single.consignorCity,
                                 consignorPincode: single.consignorPincode,
                                 consignorLatitude: single.consignorLatitude,
                                 consignorLongitude: single.consignorLongitude,
                                 contactPersonName: single.contactPersonName,
                                 consignorName: single.consignorName,
                                 PRSNumber: single.PRSNumber,
                                 consignorCode: single.consignorCode,
                                 stopId:single.stopId,
                                 tripId:single.FMtripId,
                                 userId: single.userId,
                                 phone: single.consignorContact,
                                 Reverse: reverse[i],
                                 otpSubmittedDelivery: single.otpSubmittedDelivery,
                                 });
                         }}>
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
                          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#004aad'}}>
                {i+1}.{" "}{single.consignorName}
              </Text>
              
                            <Text style={{ marginBottom: 4 , color: 'black'}}>{single.consignorAddress1}</Text>
                            <Text style={{ marginBottom: 4 , color: 'black'}}>{single.consignorCity}, {single.consignorAddress2}, {single.consignorPincode}</Text>
                            <Text style={{fontWeight: 'bold', marginTop: 8, color: '#004aad' }}>Deliveries({pending11[i]}/{reverse[i]}) </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <TouchableOpacity onPress={() => handlePhoneIconPress(single.consignorContact)}>
                              <MaterialIcons name="phone" size={24} style={{ marginBottom: 12 , }} color="green" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleMapIconPress(single)}>
                              <MaterialIcons name="map-marker-account-outline" size={28} style={{ marginBottom: 12 , }} color="#FFBF00"  />
                            </TouchableOpacity>
                            <Text style={{fontWeight: 'bold',marginTop: 8,  color: '#004aad'}}>Pickups({pendingP[i]}/{value[i]}) </Text>
                          </View>
                        </View>
                      </TouchableOpacity>


             
               
               
               ):(

                     <TouchableOpacity key={single.stopId} onPress={() => {
                          navigation.navigate('SellerHandoverSelection', {
                         paramKey: single.stopId,
                         Forward: value[i],
                         consignorAddress1: single.consignorAddress1,
                         consignorAddress2: single.consignorAddress2,
                         consignorCity: single.consignorCity,
                         consignorPincode: single.consignorPincode,
                         consignorLatitude: single.consignorLatitude,
                         consignorLongitude: single.consignorLongitude,
                         contactPersonName: single.contactPersonName,
                         consignorName: single.consignorName,
                         PRSNumber: single.PRSNumber,
                         consignorCode: single.consignorCode,
                         stopId:single.stopId,
                         tripId:single.FMtripId,
                         userId: single.userId,
                         phone: single.consignorContact,
                         Reverse: reverse[i],
                         otpSubmittedDelivery: single.otpSubmittedDelivery,
                         });
                 }}>
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
                {i+1}.{" "}{single.consignorName}
              </Text>
              
                            <Text style={{ marginBottom: 4 , color: 'black'}}>{single.consignorAddress1}</Text>
                            <Text style={{ marginBottom: 4 , color: 'black'}}>{single.consignorCity}, {single.consignorAddress2}, {single.consignorPincode}</Text>
                            <Text style={{fontWeight: 'bold', marginTop: 8, color: '#004aad' }}>Deliveries({pending11[i]}/{reverse[i]}) </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <TouchableOpacity onPress={() => handlePhoneIconPress(single.consignorContact)}>
                              <MaterialIcons name="phone" size={24} style={{ marginBottom: 12 , }} color="green" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleMapIconPress(single)}>
                              <MaterialIcons name="map-marker-account-outline" size={28} style={{ marginBottom: 12 , }} color="#FFBF00"  />
                            </TouchableOpacity>
                            <Text style={{fontWeight: 'bold',marginTop: 8,  color: '#004aad',}}>Pickups({pendingP[i]}/{value[i]}) </Text>
                          </View>
                        </View>
                      </TouchableOpacity>


                        )
                     : null,
                  )
                : null}
                
                {route.params.Trip === 'Start Trip' && data && data.length > 0
                ? data.filter(searched(keyword)).map((single, i) =>
                    reverse[i] > 0 ? (pending11[i]!==reverse[i])? (

                   <TouchableOpacity key={single.stopId} onPress={() => {
                        handleTrip()
               }}>
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
                {i+1}.{" "}{single.consignorName}
              </Text>
              
                            <Text style={{ marginBottom: 4 , color: 'black'}}>{single.consignorAddress1}</Text>
                            <Text style={{ marginBottom: 4 , color: 'black'}}>{single.consignorCity}, {single.consignorAddress2}, {single.consignorPincode}</Text>
                            <Text style={{fontWeight: 'bold', marginTop: 8, color: '#004aad' }}>Deliveries({pending11[i]}/{reverse[i]}) </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <TouchableOpacity onPress={() => handlePhoneIconPress(single.consignorContact)}>
                              <MaterialIcons name="phone" size={24} style={{ marginBottom: 12 , }} color="green" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleMapIconPress(single)}>
                              <MaterialIcons name="map-marker-account-outline" size={28} style={{ marginBottom: 12 , }} color="#FFBF00"  />
                            </TouchableOpacity>
                            <Text style={{fontWeight: 'bold',marginTop: 8,  color: '#004aad'}}>Pickups({pendingP[i]}/{value[i]}) </Text>
                          </View>
                        </View>
                      </TouchableOpacity>

             
               
               ):(


                  <TouchableOpacity key={single.stopId} >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 16,
                            borderRadius: 10,
                            marginVertical: 8,
                            backgroundColor:  i  % 2 === 0 ? '#E6F2FF' : '#FFFFFF', 
                            shadowColor:'black' ,
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
                          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#004aad'}}>
                {i+1}.{" "}{single.consignorName}
              </Text>
              
                            <Text style={{ marginBottom: 4 , color: 'black'}}>{single.consignorAddress1}</Text>
                            <Text style={{ marginBottom: 4 , color: 'black'}}>{single.consignorCity}, {single.consignorAddress2}, {single.consignorPincode}</Text>
                            <Text style={{fontWeight: 'bold', marginTop: 8, color: '#004aad' }}>Deliveries({pending11[i]}/{reverse[i]}) </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <TouchableOpacity onPress={() => handlePhoneIconPress(single.consignorContact)}>
                              <MaterialIcons name="phone" size={24} style={{ marginBottom: 12 , }} color="green" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleMapIconPress(single)}>
                              <MaterialIcons name="map-marker-account-outline" size={28} style={{ marginBottom: 12 , }} color="#FFBF00"  />
                            </TouchableOpacity>
                            <Text style={{fontWeight: 'bold',marginTop: 8,  color: '#004aad'}}>Pickups({pendingP[i]}/{value[i]}) </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
               


                )
                : null,
                )
                : null}

        <Center>
      <Image style={{ width:150, height:150}} source={require('../../assets/image.png')} alt={'Logo Image'} />
      </Center>
      </ScrollView>
      
    </Box>
    }
    
        </NativeBaseProvider>
  );
  };
  export default SellerDeliveries;
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
        // backgroundColor:"blue",
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