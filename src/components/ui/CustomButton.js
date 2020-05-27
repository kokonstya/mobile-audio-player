import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native'

const CustomButton = ({children, onPress, color = 'transparent'}) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <View style={{...styles.button, backgroundColor: color}}>
                <Text style={styles.text}>{children}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 10,
        margin: 3
    },
    text: {
        color: '#000'
    }
})

export default CustomButton;
