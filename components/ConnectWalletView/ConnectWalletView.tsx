import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

import { defaultColors } from '../../styles/theme';
import { CHECK_KEPLR_REQUESTED } from '../../redux/actions/user';
import { IStore } from '../../redux/store';
import SideDrawer from '../SideDrawer';
interface Props {
  onClose: () => void;
  visible: boolean;
}

const ConnectWalletView = ({ onClose, visible }: Props) => {
  const dispatch = useDispatch();
  const user = useSelector((state: IStore) => state.user);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  useEffect(() => {
    if (user.keplrErrorMessage !== 'Result is null') {
      setErrorMessage(user.keplrErrorMessage);
    }
  }, [user.keplrErrorMessage]);

  const connectKeplr = async () => {
    if (!user.isKeplrInstalled) {
      setErrorMessage('You need to install Keplr Wallet');

      const a = document.createElement('a');
      a.href = 'https://wallet.keplr.app/';
      a.target = '_blank';
      a.rel = 'noopener norefferer';
      a.click();
      return;
    }

    dispatch({ type: CHECK_KEPLR_REQUESTED });
  };

  return (
    <Container>
      <SideDrawer onClose={onClose} visible={isVisible}>
        <HeaderContainer>
          <ConnectWalletIcon />
          <HeaderTitle>Connect Wallet</HeaderTitle>
        </HeaderContainer>

        <Line>
          <SmallLine />
        </Line>

        <WalletButton onClick={connectKeplr}>
          <WalletIcon src="/icons/keplr.svg" />
          <WalletTitle>Keplr</WalletTitle>
        </WalletButton>

        <ErrorText>{errorMessage}</ErrorText>
      </SideDrawer>
    </Container>
  );
};

export default ConnectWalletView;

const Container = styled.div`
  position: fixed !important;
  bottom: 0;
  right: 0;
  height: 100vh;
  width: 20vw !important;
  min-width: 300px;
  pointer-events: none;
  z-index: 999 !important;

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    width: 100vw;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-height: 530px) {
    margin-bottom: 30px;
  }
`;

const ConnectWalletIcon = styled.div`
  background-image: url('/icons/thick-connect-icon-light.svg');
  width: 30px;
  height: 30px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 45%;
`;

const HeaderTitle = styled.p`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-top: 15px;
  margin-left: 10px;
`;

const Line = styled.div`
  width: 2px;
  min-height: 190px;
  background: ${defaultColors.blackStone70};
  align-self: center;
  margin-top: 20px;
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;

  @media (max-height: 610px) {
    min-height: 120px;
  }

  @media (max-height: 530px) {
    display: none;
  }
`;

const rotate = keyframes`
  0%, 100% {
    transform: translateY(350%); 
  }
  50% {
    transform: translateY(-350%);
  }
`;

const SmallLine = styled.div`
  width: 2px;
  height: 30px;
  background: ${(props) => props.theme.colors.warning};
  animation: ${rotate} 3s linear infinite;
`;

const WalletButton = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: initial;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const WalletIcon = styled.img``;

const WalletTitle = styled.div`
  color: white;
  margin-top: 10px;
  font-weight: 600;
  font-size: 15px;
`;

const ErrorText = styled.div`
  color: ${(props) => props.theme.colors.warning};
  text-align: center;
  position: absolute;
  bottom: 50px;
  margin-left: auto;
  margin-right: auto;
  width: 80%;
  user-select: initial;
`;
