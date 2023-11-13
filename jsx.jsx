// npm install axios react-redux redux @react-navigation/native react-native-reanimated react-native-gesture-handler react-native-screens react-native-paper

// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { createStore } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';
import rootReducer from './reducers';
import CharactersScreen from './screens/CharactersScreen';
import FavoritesScreen from './screens/FavoritesScreen';

const Tab = createBottomTabNavigator();
const store = createStore(rootReducer);

const App = () => {
    return (
        <ReduxProvider store={store}>
            <PaperProvider>
                <NavigationContainer>
                    <Tab.Navigator>
                        <Tab.Screen name="Characters" component={CharactersScreen} />
                        <Tab.Screen name="Favorites" component={FavoritesScreen} />
                    </Tab.Navigator>
                </NavigationContainer>
            </PaperProvider>
        </ReduxProvider>
    );
};

export default App;

// reducers/index.js
import { combineReducers } from 'redux';
import favoritesReducer from './favoritesReducer';

const rootReducer = combineReducers({
    favorites: favoritesReducer,
});

export default rootReducer;

// reducers/favoritesReducer.js
const initialState = {
    totalMale: 0,
    totalFemale: 0,
    totalOther: 0,
    characters: [],
};

const favoritesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_TO_FAVORITES':
            const gender = action.payload;
            return {
                ...state,
                characters: [...state.characters, gender],
                [gender === 'male' ? 'totalMale' : gender === 'female' ? 'totalFemale' : 'totalOther']: state[gender === 'male' ? 'totalMale' : gender === 'female' ? 'totalFemale' : 'totalOther'] + 1,
            };
        case 'RESET_FAVORITES':
            return initialState;
        default:
            return state;
    }
};

export default favoritesReducer;

// screens/CharactersScreen.js
import React, { useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { List, Avatar } from 'react-native-paper';
import axios from 'axios';

const CharactersScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const characters = useSelector((state) => state.favorites.characters);

    useEffect(() => {
        axios.get('https://swapi.dev/api/people/')
            .then((response) => response.data.results)
            .then((data) => dispatch({ type: 'SET_CHARACTERS', payload: data }))
            .catch((error) => console.error('Error fetching characters:', error));
    }, [dispatch]);

    const handleCharacterPress = (character) => {
        navigation.navigate('CharacterDetails', { character });
    };

    return (
        <View>
            <FlatList
                data={characters}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.name}
                        onPress={() => handleCharacterPress(item)}
                        left={() => <Avatar.Image source={require('../assets/avatar.png')} />}
                    />
                )}
            />
        </View>
    );
};

export default CharactersScreen;

// screens/FavoritesScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

const FavoritesScreen = () => {
    const { totalMale, totalFemale, totalOther } = useSelector((state) => state.favorites);
    const dispatch = useDispatch();

    const resetFavorites = () => {
        dispatch({ type: 'RESET_FAVORITES' });
    };

    return (
        <View>
            <Text>Total Male Characters: {totalMale}</Text>
            <Text>Total Female Characters: {totalFemale}</Text>
            <Text>Total Other Characters: {totalOther}</Text>
            <Button title="Reset" onPress={resetFavorites} />
        </View>
    );
};

export default FavoritesScreen;

// screens/CharacterDetailsScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

const CharacterDetailsScreen = ({ route }) => {
    const { character } = route.params;
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const addToFavorites = () => {
        dispatch({ type: 'ADD_TO_FAVORITES', payload: character.gender });
    };

    return (
        <View>
            <Text>Name: {character.name}</Text>
            <Text>Gender: {character.gender}</Text>
            <Button title="Add to Favorites" onPress={addToFavorites} />
            <Button title="Back to Characters" onPress={() => navigation.goBack()} />
        </View>
    );
};

export default CharacterDetailsScreen;


