import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, Image, Slider, ScrollView} from 'react-native';
import CustomButton from "./ui/CustomButton";

const DeezerChart = ({openInPlayer, useLocal}) => {

    const [state, setState] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('https://api.deezer.com/chart/0/tracks')
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                for (let i = 0; i < data.data.length; i++) {
                    state.push({
                        title: data.data[i].title,
                        imgSrc: data.data[i].artist.picture_medium,
                        uri: data.data[i].preview
                    })
                }
            }).then(() => setLoading(false));
    }, [])

    return (
        <ScrollView style={styles.container}>
            {loading ? <Text style={styles.loading}>Loading...</Text> :
                <>
                    <Text style={styles.title}> Deezer Chart</Text>
                    <View style={styles.list}>
                        {state.map((item) => <View key={Math.random()} style={styles.item}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Image source={{uri: item.imgSrc}} style={styles.artistPicture}/>
                        </View>)}
                        <CustomButton style={styles.button} onPress={() => openInPlayer(state)}>open in
                            player</CustomButton>
                        <CustomButton style={styles.button} onPress={useLocal}>use local storage</CustomButton>
                    </View>

                </>
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingTop: 30,
        paddingHorizontal: 20
    },
    title: {
        fontSize: 20
    },
    loading: {
        fontSize: 40,
    },
    list: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
    },
    item: {
        width: '30%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20
    },
    itemTitle: {
        marginBottom: 5
    },
    artistPicture: {
        width: 100,
        height: 100
    },
    button: {
        width: 100,
        height: 100,
        marginTop: 30,
        backgroundColor: '#eee',
    }
})

export default DeezerChart;
