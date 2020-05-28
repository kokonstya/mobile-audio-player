import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native'

const CustomButton = ({children, onPress, style}) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.5}>
            <View style={{...styles.button, ...style}}>
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
        color: '#000',
        fontSize: 18,

    }
})

export default CustomButton;
