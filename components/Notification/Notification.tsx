import React from 'react';
import styled, { keyframes } from 'styled-components';
import { RiArrowRightUpLine } from 'react-icons/ri';
import { FiAlertTriangle } from 'react-icons/fi';

interface Props {
  msg: string;
  withLink?: boolean;
  linkText?: string;
  linkHref?: string;
  animationText?: string;
  title: string;
  isError?: boolean;
}

const Notification: React.FC<Props> = ({
  msg,
  withLink = false,
  linkText,
  linkHref,
  animationText,
  title,
  isError,
}) => {
  return (
    <SwapHolder>
      <Content>
        <>
          <Title style={{ marginBottom: 14 }}>
            {isError && <FiAlertTriangle size={28} style={{ marginRight: 8 }} />}
            {title}
          </Title>
          <Msg>{msg}</Msg>
          {withLink && (
            <ALink href={linkHref} target="_blank">
              {linkText}
              <RiArrowRightUpLine size={16} style={{ marginLeft: 5, paddingBottom: 1 }} />
            </ALink>
          )}
          {animationText && (
            <AnimationArea>
              <hr />
              <AnimationText> {animationText}</AnimationText>
            </AnimationArea>
          )}
        </>
      </Content>
    </SwapHolder>
  );
};

export default Notification;

const ALink = styled.a`
  font-weight: 700;
  font-size: 12px;
  color: inherit;
  margin-bottom: 2px;

  &:hover {
    color: inherit;
    text-decoration: underline;
  }
`;

const slide = keyframes`
  from {max-height: 0px}
  to {max-height:9999px}
`;

const AnimationArea = styled.div`
  overflow-y: hidden;
  max-height: 0px;
  animation: ${slide} 5s ease-in-out;
  animation-fill-mode: forwards;
  animation-delay: 1s;
`;

const AnimationText = styled.div`
  font-weight: 400;
  font-size: 12px;
  margin-top: 24px;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 0px;
  display: flex;
  align-items: center;
`;

const Msg = styled.div`
  font-weight: 400;
  font-size: 12px;
  margin-bottom: 16px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const SwapHolder = styled.div`
  margin-top: 16px;
  padding-bottom: 5px;
`;
