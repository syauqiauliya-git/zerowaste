import React from 'react'
import { Image, ImageProps, StyleProp, ImageStyle } from 'react-native'

type LogoProps = {
  size?: number
  style?: StyleProp<ImageStyle>
} & Omit<ImageProps, 'source' | 'style'>

const Logo: React.FC<LogoProps> = ({ size = 200, style, ...rest }) => {
  return (
    <Image
      source={require('../../assets/images/zerowaste-logo.png')}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="ZeroWaste logo"
      {...rest}
    />
  )
}

export default Logo
export { Logo }
