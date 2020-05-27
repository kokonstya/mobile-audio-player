import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, Image, Slider} from 'react-native';
import {Foundation} from '@expo/vector-icons';
import CustomButton from "./src/components/ui/CustomButton";
import {Audio} from 'expo-av'

const playList = [
    {
        title: 'Hamlet - Act I',
        author: 'William Shakespeare',
        source: 'Librivox',
        // uri:
        //     'https://ia800204.us.archive.org/11/items/hamlet_0911_librivox/hamlet_act1_shakespeare.mp3',
        uri:
            'https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Podington_Bear_-_Rubber_Robot.mp3',
        imageSource: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg'
    },
    {
        title: 'Hamlet - Act II',
        author: 'William Shakespeare',
        source: 'Librivox',
        uri:
            'https://ia600204.us.archive.org/11/items/hamlet_0911_librivox/hamlet_act2_shakespeare.mp3',
        imageSource: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg'
    },
    {
        title: 'Hamlet - Act III',
        author: 'William Shakespeare',
        source: 'Librivox',
        uri: 'http://www.archive.org/download/hamlet_0911_librivox/hamlet_act3_shakespeare.mp3',
        imageSource: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg'
    },
    {
        title: 'Hamlet - Act IV',
        author: 'William Shakespeare',
        source: 'Librivox',
        uri:
            'https://ia800204.us.archive.org/11/items/hamlet_0911_librivox/hamlet_act4_shakespeare.mp3',
        imageSource: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg'
    },
    {
        title: 'Hamlet - Act V',
        author: 'William Shakespeare',
        source: 'Librivox',
        uri:
            'https://ia600204.us.archive.org/11/items/hamlet_0911_librivox/hamlet_act5_shakespeare.mp3',
        imageSource: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg'
    }
]

const App = () => {
    const [state, setState] = useState({position: 0, duration: 1})
    let [progress, setProgress] = useState(0)
    let [volume, setVolume] = useState(1.0)
    let [loading, setLoading] = useState(true)
    const [playbackInstance, setPlaybackInstance] = useState({})
    let [isPlaying, setIsPlaying] = useState(false)
    let [currentIndex, setCurrentIndex] = useState(0)

    const loadSong = async () => {
        try {
            const playbackInstance = new Audio.Sound()
            const source = {
                uri: playList[currentIndex].uri
            }

            const status = {
                shouldPlay: isPlaying,
                volume
            }

            playbackInstance.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)
            await playbackInstance.loadAsync(source, status, false)
            setPlaybackInstance(playbackInstance)

        } catch (e) {
            console.log(e)
        }
    }
    const onPlaybackStatusUpdate = (status) => {
        if (status.positionMillis) {
            let position = status.positionMillis
            let duration = status.durationMillis
            setState({
                position: position,
                duration: duration
            })
            setProgress(Math.floor((position / duration) * 100))
        }
    }
    const handlerSliderChange = (value) => {
        playbackInstance.getStatusAsync().then((i) => {
            playbackInstance.setPositionAsync(value * i.durationMillis / 100)
        })
    }
    const handlerVolumeChange = async (value) => {
        await playbackInstance.setVolumeAsync(value)
    }

    const _getMMSSFromMillis = (millis) => {
        const totalSeconds = millis / 1000;
        const seconds = Math.floor(totalSeconds % 60);
        const minutes = Math.floor(totalSeconds / 60);

        const padWithZero = number => {
            const string = number.toString();
            if (number < 10) {
                return '0' + string;
            }
            return string;
        };
        return padWithZero(minutes) + ':' + padWithZero(seconds);
    }

    const _getTimestamp = () => {
        if (
            playbackInstance != null
        ) {
            return `${_getMMSSFromMillis(
                state.position
            )} / ${_getMMSSFromMillis(
                state.duration
            )}`;
        }
        return '';
    }

    const handlePlayPause = async () => {
        isPlaying ? await playbackInstance.pauseAsync() : await playbackInstance.playAsync()

        setIsPlaying((isPlaying) => !isPlaying)
    }
    const handleStop = async () => {
        if (isPlaying) {
            await playbackInstance.stopAsync()
            setIsPlaying((isPlaying) => !isPlaying)
            setProgress(0)
            setState({position: 0, duration: 1})
        }
    }

    const handlePreviousTrack = async () => {
        if (playbackInstance) {
            setLoading(true)
            await playbackInstance.unloadAsync()
            currentIndex < playList.length - 1 ? (currentIndex -= 1) : (currentIndex = 0)
            setCurrentIndex(
                currentIndex
            )
            loadSong().then( ()=> setLoading(false))


        }
    }

    const handleNextTrack = async () => {
        if (playbackInstance) {
            setLoading(true)
            await playbackInstance.unloadAsync()
            currentIndex < playList.length - 1 ? (currentIndex += 1) : (currentIndex = 0)
            setCurrentIndex(
                currentIndex
            )
            loadSong().then( ()=> setLoading(false))

        }
    }

    useEffect(() => {
        const setSettings = async () => {
            const response = await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                playsInSilentModeIOS: true,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
                shouldDuckAndroid: true,
                staysActiveInBackground: true,
                playThroughEarpieceAndroid: true
            })
            await loadSong(currentIndex, isPlaying).then(() => setLoading(false))
        }
        setSettings();

    }, [])


    return (
        <View style={styles.container}>
            <Image style={styles.songImg}
                   source={{uri: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg'}}/>
            <Text style={styles.title}>{playList[currentIndex].title}</Text>
            <Text style={styles.title}>{loading ? (
                'BUFFERING...'
            ) : (
                _getTimestamp()
            )}</Text>
            {loading ? <Text>loading...</Text> :
                <View style={styles.controls}>
                    <CustomButton onPress={handlePreviousTrack}>
                        <Foundation name="previous" size={36} color="black"/>
                    </CustomButton>
                    <CustomButton onPress={handlePlayPause}>
                        {isPlaying ? <Foundation name="pause" size={36} color="black"/> :
                            <Foundation name="play" size={36} color="black"/>}
                    </CustomButton>
                    <CustomButton onPress={handleStop}>
                        <Foundation name="stop" size={36} color="black"/>
                    </CustomButton>
                    <CustomButton onPress={handleNextTrack}>
                        <Foundation name="next" size={36} color="black"/>
                    </CustomButton>

                </View>
            }
<View style={styles.progress}>
            <Slider style={styles.slider} minimumValue={0} value={progress}
                    maximumValue={100} step={1} onValueChange={handlerSliderChange}/>
</View>
            <View style={styles.volume}>
                <Foundation name="volume-none" size={36} color="black"/>
                <Slider style={styles.slider} minimumValue={0} value={volume}
                        maximumValue={1} step={0.05} onValueChange={handlerVolumeChange}/>
                <Foundation name="volume" size={36} color="black"/>
            </View>
        </View>
    )
}

export default App

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',

    },
    songImg: {
        width: 300,
        height: 300,
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        marginBottom: 10
    },
    controls: {
        flexDirection: 'row',
        marginBottom: 20
    },
    progress: {
        marginBottom: 20
    },
    slider: {
        width: 300,
        marginBottom: 10
    },
    volume: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    volumeSlider: {
        width: 200,
    }

})
