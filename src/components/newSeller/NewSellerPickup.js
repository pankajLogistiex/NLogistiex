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
import {StyleSheet, ScrollView, View, KeyboardAvoidingView,ActivityIndicator,TouchableOpacity, Linking, ToastAndroid } from 'react-native';
import {DataTable, Searchbar, Text, Card} from 'react-native-paper';
import {openDatabase} from 'react-native-sqlite-storage';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from "react-redux";
import { setAutoSync } from "../../redux/slice/autoSyncSlice";
import Lottie from 'lottie-react-native';
import {ProgressBar} from '@react-native-community/progress-bar-android';
// import { Header } from 'react-navigation';
const db = openDatabase({name: 'rn_sqlite'});

const NewSellerPickup = ({route}) => {
  const dispatch = useDispatch();
  const syncTimeFull = useSelector((state) => state.autoSync.syncTimeFull);

  const [dataSeller, setData] = useState([]);
  const [data, setData11] = useState([]);
  const currentDateValue = useSelector((state) => state.currentDate.currentDateValue) || new Date().toISOString().split('T')[0] ;
  const [keyword, setKeyword] = useState('');
  const [pending11Seller,setPending] =useState([]);
  const [pendingR,setPendingR] =useState([]);
  const [valueSeller,setValue] =useState([]);
  const [reverseSeller,setReverse] =useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingR, setLoadingR] = useState(true);
  const [showModal1, setShowModal1] = useState(false);
  const [message1, setMessage1] = useState(0);
  
  const [totalPending,setTotalPending] =useState(0);
  const [totalValue,setTotalValue] =useState(1);
  // const progress = (pending11.reduce((accumulator, currentValue) => accumulator + currentValue, 0)/value.reduce((accumulator, currentValue) => accumulator + currentValue, 0)) * 100


  // const data =(valueSeller && valueSeller.length>0 )?dataSeller.filter((_, index) => valueSeller[index] !== 0):[];
  const pending11 =pending11Seller.filter((_, index) => valueSeller[index] !== 0);
  const value = valueSeller.filter((_, index) => valueSeller[index] !== 0);
  const reverse = reverseSeller.filter((_, index) => valueSeller[index] !== 0);
  const navigation = useNavigation();
  // dataSeller.forEach(item => {console.log(`consignorName: ${item.consignorName}, otpSubmitted: ${item.otpSubmitted}`)});
  // data.forEach(item => console.log(`consignorName: ${item.consignorName}, otpSubmitted: ${item.otpSubmitted}`));
  const progress = 
  (data.reduce((sum, seller, i) => sum + (value[i] > 0 && value[i] === pending11[i] && seller.otpSubmitted=='true' ? 1 : 0), 0)/value.reduce((accumulator, currentValue) => accumulator + (currentValue > 0 ? 1 : 0), 0)) * 100;
  useEffect(() => {
  
    if(value && value.length>0 && data && data.length===0){
      setData11(dataSeller.filter((_, index) => valueSeller[index] !== 0));
    console.log("NewSellerPickup/useeffect_datalength",data.length);
    }
    
      }, [valueSeller,data]);
  
      // console.log(data.length);
      useEffect(() => {
        if(dataSeller){
      setData11([]);
        }
      }, [dataSeller]);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        dispatch(setAutoSync(true));
        setData11([]);
        loadDetails();
      });
      return unsubscribe;
    }, [navigation, syncTimeFull]);
    // console.log(data.length," ",data.filter((_, index) => value[index] !== 0).length);
    // console.log(dataSeller.length," ",pending11Seller+" ",reverseSeller+" ",valueSeller);
    // console.log(data.length,"  ",pending11+" ",reverse+" ",value);

  const loadDetails = () => { // setIsLoading(!isLoading);
      db.transaction((tx) => {
          tx.executeSql('SELECT * FROM SyncSellerPickUp WHERE FMtripId = ? ORDER BY CAST(sellerIndex AS INTEGER) ASC' , [route.params.tripID], (tx1, results) => {
              let temp = [];
              for (let i = 0; i < results.rows.length; ++i) {
                // console.log(results.rows.item(i).sellerIndex);
                  temp.push(results.rows.item(i));
                  // console.log(results.rows.item(i).otpSubmitted," " ,results.rows.item(i).consignorName);
              }
              setData(temp);
              // setData11([]);
              // console.log(value);
              // if(value && value.length>0 && data){
              //   setData11(temp.filter((_, index) => valueSeller[index] !== 0));
              // console.log("check table",data.length);
              // }
              // console.log(temp[0]);
              // setLoading(false);
          });
      });
      
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
  useEffect(() => {
      if (dataSeller.length > 0) {
        // const tc=0;
        const counts = [];
        dataSeller.forEach((single) => {
          db.transaction((tx) => {
            tx.executeSql(
              'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=? AND FMtripId=? AND status IS NOT NULL',
              [single.stopId, single.FMtripId],
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
        // const tc=0;
        const counts = [];
        dataSeller.forEach((single) => {
          db.transaction((tx) => {
            tx.executeSql(
              'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND stopId=? AND FMtripId=?',
              [single.stopId, single.FMtripId],
              (tx1, results) => {
                counts.push(results.rows.length);
                if (counts.length === dataSeller.length) {
                  setValue(counts);
                  // setLoading(false);
                  // setTotalValue(tc);
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
              'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND handoverStatus="accepted"',
              [single.stopId, single.FMtripId],
              (tx1, results) => {
                counts.push(results.rows.length);
                if (counts.length === dataSeller.length) {
                  setReverse(counts);
                  // setLoadingR(false);
                  // setLoading(false);
                }
              },
            );
          });
        });
      }
    }, [dataSeller, db]);
    // }, [data, db]);
    useEffect(() => {
      if (dataSeller.length > 0) {
        const counts = [];
        dataSeller.forEach((single) => {
          db.transaction((tx) => {
            tx.executeSql(
              'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Delivery" AND stopId=? AND FMtripId=? AND status IS NOT NULL',
              [single.stopId, single.FMtripId],
              (tx1, results) => {
                counts.push(results.rows.length);
                if (counts.length === dataSeller.length) {
                  setPendingR(counts);
                  setLoading(false);
                }
              },
            );
          });
        });
      }
    }, [dataSeller, db]);
    
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        // setData11([]);
        // setData([]);
      // console.log("check!2 ",data.length);
    });
    return unsubscribe;
  }, [navigation]);
  const searched = (keyword1) => (c) => {
      let f = c.consignorName;
      return f.toLowerCase().includes(keyword1.toLowerCase());
  };


  const handlePhoneIconPress = (phone) => {
    console.log("NewSellerPickup/handlePhoneIconPress",`Calling ${phone}`);
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
 
return (
<NativeBaseProvider>
          <Modal isOpen={showModal1} onClose={() => {setShowModal1(false); navigation.navigate('Main')}}>
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
{loading &&loadingR ? 
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
          width: `${progress}%`,
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
       Sellers Attempted ({data.reduce((sum, seller, i) => sum + (value[i] > 0 && value[i] === pending11[i] && seller.otpSubmitted=='true'  ? 1 : 0), 0)}/{value.reduce((accumulator, currentValue) => accumulator + (currentValue > 0 ? 1 : 0), 0)})
      </Text>
    </View>
    </View>


    <Searchbar
      placeholder="Search Seller Name"
      onChangeText={(e) => setKeyword(e)}
      value={keyword}
      style={{marginHorizontal: 15, marginTop: 0}}
    />
    <ScrollView style={styles.homepage} showsVerticalScrollIndicator={true} showsHorizontalScrollIndicator={false}>
      {/* <Card> */}
      <View>
       
          {route.params.Trip !== 'Start Trip' && data && data.length > 0
                ? data.filter(searched(keyword)).map((seller, i) =>
                    value[data.findIndex((item) => item.stopId === seller.stopId)] > 0 ? (value[data.findIndex((item) => item.stopId === seller.stopId)] == pending11[data.findIndex((item) => item.stopId === seller.stopId)]) && seller.otpSubmitted === "true" ? 
                    (
        <TouchableOpacity key={seller.stopId} onPress={() => {navigation.navigate('NewSellerSelection', {
          paramKey: seller.stopId,
          Forward: value[data.findIndex((item) => item.stopId === seller.stopId)],
          consignorAddress1: seller.consignorAddress1,
          consignorAddress2: seller.consignorAddress2,
          consignorCity: seller.consignorCity,
          consignorPincode: seller.consignorPincode,
          consignorLatitude: seller.consignorLatitude,
          consignorLongitude: seller.consignorLongitude,
          contactPersonName: seller.contactPersonName,
          consignorName: seller.consignorName,
          PRSNumber: seller.PRSNumber,
          consignorCode: seller.stopId,
          stopId:seller.stopId,
          userId: seller.userId,
          phone: seller.consignorContact,
          otpSubmitted: seller.otpSubmitted,
          FMtripId: seller.FMtripId,
          token:route.params.token
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
              backgroundColor:i  % 2 === 0 ? '#E6F2FF' : '#FFFFFF', 
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
  {i+1}.{" "}{seller.consignorName}
</Text>

              <Text style={{ marginBottom: 4 , color: 'black'}}>{seller.consignorAddress1}</Text>
              <Text style={{ marginBottom: 4 , color: 'black'}}>{seller.consignorCity}, {seller.consignorAddress2}, {seller.consignorPincode}</Text>
              <Text style={{fontWeight: 'bold', marginTop: 8, color: '#004aad' }}>Pickup({pending11[data.findIndex((item) => item.stopId === seller.stopId)]}/{value[data.findIndex((item) => item.stopId === seller.stopId)]}) </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => handlePhoneIconPress(seller.consignorContact)}>
                <MaterialIcons name="phone" size={24} style={{ marginBottom: 12 , }} color="green" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMapIconPress(seller)}>
                <MaterialIcons name="map-marker-account-outline" size={28} style={{ marginBottom: 12 , }} color="#FFBF00"  />
              </TouchableOpacity>
              <Text style={{fontWeight: 'bold',marginTop: 8,  color: '#004aad'}}>Delivery({pendingR[data.findIndex((item) => item.stopId === seller.stopId)]}/{reverse[data.findIndex((item) => item.stopId === seller.stopId)]}) </Text>
            </View>
          </View>

          
        </TouchableOpacity>
                    )
               : 
               (
                  <TouchableOpacity key={seller.stopId} onPress={() => {navigation.navigate('NewSellerSelection', {
                    paramKey: seller.stopId,
                    Forward: value[data.findIndex((item) => item.stopId === seller.stopId)],
                    consignorAddress1: seller.consignorAddress1,
                    consignorAddress2: seller.consignorAddress2,
                    consignorCity: seller.consignorCity,
                    consignorPincode: seller.consignorPincode,
                    consignorLatitude: seller.consignorLatitude,
                    consignorLongitude: seller.consignorLongitude,
                    contactPersonName: seller.contactPersonName,
                    consignorName: seller.consignorName,
                    PRSNumber: seller.PRSNumber,
                    consignorCode: seller.consignorCode,
                    stopId:seller.stopId,
                    userId: seller.userId,
                    phone: seller.consignorContact,
                    otpSubmitted: seller.otpSubmitted,
                    FMtripId: seller.FMtripId,
                    token: route.params.token
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
                        backgroundColor:

                        // seller.otpSubmitted== 'true'
                        //   ? '#FFBF00':
                        
                          i % 2 === 0
                          ? '#E6F2FF'
                          : '#FFFFFF',
                        shadowColor:'black' ,
                        shadowOffset: { width: 5, height: 5 },
                        shadowOpacity: 0.8,
                        shadowRadius: 18,
                        elevation: 5,
                        
                    position: 'relative',
    }}
  >
    {value[data.findIndex((item) => item.stopId === seller.stopId)] === pending11[data.findIndex((item) => item.stopId === seller.stopId)] && seller.otpSubmitted== 'true'
                          ? 
    <Image alt={'Completed Icon'}
      source={require('../../assets/complete/IMG_complete.png')}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 150,
        height: 150,
        opacity: 0.55,
        marginLeft:'31%',
        tintColor: '#90ee90',
        resizeMode: 'cover',
      }}
    /> :null}
                      <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#004aad'}}>
            {i+1}.{" "}{seller.consignorName}
          </Text>
          
                        <Text style={{ marginBottom: 4 , color: 'black'}}>{seller.consignorAddress1}</Text>
                        <Text style={{ marginBottom: 4 , color: 'black'}}>{seller.consignorCity}, {seller.consignorAddress2}, {seller.consignorPincode}</Text>
                        <Text style={{fontWeight: 'bold', marginTop: 8, color: '#004aad' }}>Pickup({pending11[data.findIndex((item) => item.stopId === seller.stopId)]}/{value[data.findIndex((item) => item.stopId === seller.stopId)]}) </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <TouchableOpacity onPress={() => handlePhoneIconPress(seller.consignorContact)}>
                          <MaterialIcons name="phone" size={24} style={{ marginBottom: 12 , }} color="green" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleMapIconPress(seller)}>
                          <MaterialIcons name="map-marker-account-outline" size={28} style={{ marginBottom: 12 , }} color="orange"  />
                        </TouchableOpacity>
                        <Text style={{fontWeight: 'bold',marginTop: 8, color: '#004aad' }}>Delivery({pendingR[data.findIndex((item) => item.stopId === seller.stopId)]}/{reverse[data.findIndex((item) => item.stopId === seller.stopId)]}) </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
               )
                     : null
                  )
                : null}

            {route.params.Trip === 'Start Trip' && data && data.length > 0
                ? data.filter(searched(keyword)).map((seller, i) =>
                    value[data.findIndex((item) => item.stopId === seller.stopId)] > 0 ? (value[data.findIndex((item) => item.stopId === seller.stopId)] != pending11[data.findIndex((item) => item.stopId === seller.stopId)])? 
                    (
        <TouchableOpacity key={seller.stopId} onPress={() => {handleTrip()}}>
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
  {i+1}.{" "}{seller.consignorName}
</Text>

              <Text style={{ marginBottom: 4 , color: 'black'}}>{seller.consignorAddress1}</Text>
              <Text style={{ marginBottom: 4 , color: 'black'}}>{seller.consignorCity}, {seller.consignorAddress2}, {seller.consignorPincode}</Text>
              <Text style={{fontWeight: 'bold', marginTop: 8,  color: '#004aad'}}>Pickup({pending11[data.findIndex((item) => item.stopId === seller.stopId)]}/{value[data.findIndex((item) => item.stopId === seller.stopId)]}) </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => handlePhoneIconPress(seller.consignorContact)}>
                <MaterialIcons name="phone" size={24} style={{ marginBottom: 12 , }} color="green" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMapIconPress(seller)}>
                <MaterialIcons name="map-marker-account-outline" size={28} style={{ marginBottom: 12 , }} color="#FFBF00"  />
              </TouchableOpacity>
              <Text style={{fontWeight: 'bold',marginTop: 8, color: '#004aad' }}>Delivery({pendingR[data.findIndex((item) => item.stopId === seller.stopId)]}/{reverse[data.findIndex((item) => item.stopId === seller.stopId)]}) </Text>
            </View>
          </View>
        </TouchableOpacity>
              ):
              (
                <TouchableOpacity key={seller.stopId} >
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
        {i+1}.{" "}{seller.consignorName}
      </Text>
      
                    <Text style={{ marginBottom: 4 , color: 'black'}}>{seller.consignorAddress1}</Text>
                    <Text style={{ marginBottom: 4 , color: 'black'}}>{seller.consignorCity}, {seller.consignorAddress2}, {seller.consignorPincode}</Text>
                    <Text style={{fontWeight: 'bold', marginTop: 8, color: '#004aad' }}>Pickup({pending11[data.findIndex((item) => item.stopId === seller.stopId)]}/{value[data.findIndex((item) => item.stopId === seller.stopId)]}) </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <TouchableOpacity onPress={() => handlePhoneIconPress(seller.consignorContact)}>
                      <MaterialIcons name="phone" size={24} style={{ marginBottom: 12 , }} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMapIconPress(seller)}>
                      <MaterialIcons name="map-marker-account-outline" size={28} style={{ marginBottom: 12 , }} color="#FFBF00"  />
                    </TouchableOpacity>
                    <Text style={{fontWeight: 'bold',marginTop: 8, color: '#004aad' }}>Delivery({pendingR[data.findIndex((item) => item.stopId === seller.stopId)]}/{reverse[data.findIndex((item) => item.stopId === seller.stopId)]}) </Text>
                  </View>
                </View>
               
              </TouchableOpacity>
                )
                : null,
                )
                : null}
        </View>



      {/* <View style={{ position: 'absolute', bottom: 0 , left:0 ,right:0, alignItems:'center'}}> */}
      <Center>
        <Image style={{ width:150, height:150}} source={require('../../assets/image.png')} alt={'Logo Image'} />
      </Center>
{/* </View> */}
    </ScrollView>
  
  </Box>
  
}

  </NativeBaseProvider>
);
};
export default NewSellerPickup;
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