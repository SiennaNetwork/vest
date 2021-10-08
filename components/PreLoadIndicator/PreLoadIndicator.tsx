import React from 'react';
import Lottie from 'react-lottie-player';
import styled from 'styled-components';

import dotsAnimDark from '../../public/animations/sienna-pre-loader-pos.json';
import dotsAnimLight from '../../public/animations/sienna-pre-loader-neg.json';

interface Props {
  darkMode?: boolean;
  containerStyle?: React.CSSProperties;
  loop?: boolean;
  play?: boolean;
  width?: number;
  height?: number;
}

const Container = styled.div``;

const PreLoadIndicator = ({
  darkMode = false,
  containerStyle,
  loop = true,
  play = true,
  width = 40,
  height = 30,
}: Props) => (
  <Container style={containerStyle}>
    <Lottie
      animationData={darkMode ? dotsAnimLight : dotsAnimDark}
      loop={loop}
      play={play}
      style={{
        width,
        height,
        padding: 0,
        margin: 0,
      }}
    />
  </Container>
);

export default PreLoadIndicator;
