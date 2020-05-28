import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, Image, Slider} from 'react-native';
import {Foundation} from '@expo/vector-icons';
import CustomButton from "./src/components/ui/CustomButton";
import {Audio} from 'expo-av'
import DeezerChart from "./src/components/DeezerChart";
let playList = localPlayList
const localPlayList = [
    {
        title: 'Local song 1',
        uri: require('./assets/music/1.mp3'),
        imgSrc: require('./assets/music/icon-music.png')
    },
    {
        title: 'Local song 2',
        uri: require('./assets/music/2.mp3'),
        imgSrc: require('./assets/music/icon-music.png')
    },
    {
        title: 'Local song 3',
        uri: require('./assets/music/3.mp3'),
        imgSrc: require('./assets/music/icon-music.png')
    },
    {
        title: 'Local song 4',
        uri: require('./assets/music/4.mp3'),
        imgSrc: require('./assets/music/icon-music.png')
    },
    {
        title: 'Local song 5',
        uri: require('./assets/music/5.mp3'),
        imgSrc: require('./assets/music/icon-music.png')
    }
]

const App = () => {
    let [local, setLocal] = useState(true)
    let [deezer, setDeezer] = useState(true)
    const [state, setState] = useState({position: 0, duration: 1})
    let [progress, setProgress] = useState(0)
    let [volume, setVolume] = useState(1.0)
    let [loading, setLoading] = useState(true)
    const [playbackInstance, setPlaybackInstance] = useState({})
    let [isPlaying, setIsPlaying] = useState(false)
    let [currentIndex, setCurrentIndex] = useState(0)

    const loadSong = async (local) => {
        try {
            const playbackInstance = new Audio.Sound()
            let source;
            if (local) {
                source = playList[currentIndex].uri
            } else {
                source = {uri: playList[currentIndex].uri}
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
        if (playbackInstance) {
            await playbackInstance.stopAsync()
            setIsPlaying(false)
            setProgress(0)
            setState({position: 0, duration: 1})
        }
    }

    const handlePreviousTrack = async () => {
        if (playbackInstance) {
            setLoading(true)
            await playbackInstance.unloadAsync()
            currentIndex > 0 && currentIndex < playList.length - 1 ? (currentIndex -= 1) : (currentIndex = 0)
            setCurrentIndex(
                currentIndex
            )
            loadSong(local).then(() => setLoading(false))
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
            loadSong(local).then(() => setLoading(false))
        }
    }

    const openInPlayer = (newPlayList) => {
        playList = newPlayList
        setLocal(
            false
        )
        setLoading(true)
        setDeezer(false)
        loadSong(false).then(() => setLoading(false))
    }

    const useLocal = () => {
        setLoading(true)
        playList = localPlayList
        setLocal(
            true
        )
        setDeezer(false)
        loadSong(true).then(() => setLoading(false))
    }

    const backToDeezer = async () => {

        if (playbackInstance) {
            await playbackInstance.unloadAsync()
            setIsPlaying(false)
            setProgress(0)
            setState({position: 0, duration: 1})
        }
        setCurrentIndex(
            0
        )
        setDeezer(true)
    }

    useEffect(() => {
        const setSettings = async () => {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                playsInSilentModeIOS: true,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
                shouldDuckAndroid: true,
                staysActiveInBackground: true,
                playThroughEarpieceAndroid: true
            })
            // await loadSong().then(() => setLoading(false))
        }
        setSettings();

    }, [])

    if (deezer) {
        return <DeezerChart openInPlayer={openInPlayer} useLocal={useLocal}/>
    }

    return (

        <View style={styles.container}>
            {local ? <Image style={styles.songImg} source={playList[currentIndex].imgSrc}/> :
                <Image style={styles.songImg} source={{uri: playList[currentIndex].imgSrc}}/>}
            <Text style={styles.title}>{playList[currentIndex].title}</Text>
            <Text style={styles.title}>{loading ? (
                'BUFFERING...'
            ) : (
                _getTimestamp()
            )}</Text>
            {loading ? <Text style={styles.loading}>loading...</Text> :
                <View style={styles.controls}>
                    <CustomButton style={styles.control} onPress={handlePreviousTrack}>
                        <Foundation name="previous" size={36} color="black"/>
                    </CustomButton>
                    <CustomButton style={styles.control} onPress={handlePlayPause}>
                        {isPlaying ? <Foundation name="pause" size={36} color="black"/> :
                            <Foundation name="play" size={36} color="black"/>}
                    </CustomButton>
                    <CustomButton style={styles.control} onPress={handleStop}>
                        <Foundation name="stop" size={36} color="black"/>
                    </CustomButton>
                    <CustomButton style={styles.control} onPress={handleNextTrack}>
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
            <CustomButton onPress={backToDeezer}>back to deezer</CustomButton>
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
    loading: {
        fontSize: 30,
        color: 'red'
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
    control: {
        width: 70,
        margin: 5
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
