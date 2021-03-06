import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native'

import { useNavigation, useRoute } from '@react-navigation/native'

import MapView, { Marker } from 'react-native-maps'
import { SvgUri } from 'react-native-svg'

import Constants from 'expo-constants'
import * as Location from 'expo-location'
import { Feather as Icon } from '@expo/vector-icons'

import api from '../../services/api'

const Points = props => {
  const [items, setItems] = useState([])
  const [points, setPoints] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [initialPosition, setInitialPosition] = useState([0, 0])


  const navigation = useNavigation()
  const route = useRoute()
  const { uf, city } = route.params

  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync()

      if (status !== 'granted') {
        Alert.alert('Oooops...', 'Precisamos de sua permissão para obter a localização')
        return
      }

      const location = await Location.getCurrentPositionAsync()

      const { latitude, longitude } = location.coords

      setInitialPosition([latitude, longitude])
    }


    loadPosition()
  }, [])


  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data)
    })
  }, [])

  useEffect(() => {

    //api.get(`points?uf=${uf}&city=${city}&items=1,2`)

    api.get('points', {
      params: {
        uf,
        city,
        items: selectedItems
      }
    }).then(response => {
      console.log('Fetch Data: ' + response.data)
      const { message } = response.data
      if (message) {
        setPoints([])
      } else {
        setPoints(response.data)
      }
    })
  }, [selectedItems])

  // const points = [{id:  11, name: 'TEste', latitude: -12.558501084630867,longitude: -38.702108860015876 },
  // {id:  12, name: 'TEste', latitude: -12.558501084630867,longitude: -38.702108860015876 }]

  function onNavigateBackHandler() {
    navigation.goBack()
  }

  function onNavigateToDetailHandler(pointId) {
    navigation.navigate('Detail', { pointId })
  }

  const onSelectItemsHandler = (itemId) => {
    const alreadySelected = selectedItems.findIndex(item => item === itemId)

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== itemId)

      setSelectedItems(filteredItems)
    } else {
      setSelectedItems([...selectedItems, itemId])
    }

  }


  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity>
          <Icon name="arrow-left"
            size={20}
            color="#34cb79"
            onPress={onNavigateBackHandler} />
        </TouchableOpacity>

        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

        <View style={styles.mapContainer}>
          {initialPosition[0] !== 0 &&
            (
              <MapView
                style={styles.map}
                // loadingEnabled={initialPosition[0] === 0}
                initialRegion={{
                  latitude: initialPosition[0],
                  longitude: initialPosition[1],
                  latitudeDelta: 0.014,
                  longitudeDelta: 0.014,
                }}
              >

                {

                  points.map(point => (
                    <Marker
                      key={point.id}
                      style={styles.mapMarker}
                      onPress={() => onNavigateToDetailHandler(point.id)}
                      coordinate={{
                        latitude: point.latitude,
                        longitude: point.longitude,
                      }}>

                      <View style={styles.mapMarkerContainer}>
                        <Image
                          style={styles.mapMarkerImage}
                          //source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60' }}
                          source={{ uri: point.image_url }}
                        />
                        <Text style={styles.mapMarkerTitle}>{point.name}</Text>

                      </View>
                    </Marker>

                  )
                  )

                }
              </MapView>
            )
          }
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >


          {items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem : {}
              ]}
              onPress={() => onSelectItemsHandler(item.id)}
              activeOpacity={0.7}>
              <SvgUri width={42} height={42} uri={item.image_url} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80,
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default Points