import React from 'react';
import styled from 'styled-components';

import { defaultColors } from '../../styles/theme';

interface Props {
  onClick: (e: React.SyntheticEvent) => void;
}
const ConnectWalletButton: React.FC<Props> = ({ onClick }) => {
  return <ConnectButton onClick={onClick}>Connect Wallet</ConnectButton>;
};

export default ConnectWalletButton;

const ConnectButton = styled.button`
  background-color: ${defaultColors.blackStone80};
  color: ${defaultColors.white};
  font-size: 17px;
  width: 250px;
  height: 85px;
  position: absolute;
  right: 0px;
  top: 0px;
  z-index: 9;
  cursor: pointer;
  font-weight: 500;
  letter-spacing: -0.66px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
`;
