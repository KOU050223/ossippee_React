import { Root, Text } from '@react-three/uikit'

const UITest = () => {
  return (
    <Root
    anchorX="right"      // left | center | right も可
    anchorY="top"        // top | middle | bottom
    margin={32}
    backgroundColor="#000a"
    >
        <Text>Score: 120</Text>
    </Root>
  )
}

export default UITest
