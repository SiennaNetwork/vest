import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *,
  *::after,
  *::before {
    box-sizing: border-box;
  }

  body {
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
    font-family: 'Inter', BlinkMacSystemFont, -apple-system, Roboto, Helvetica, Arial, sans-serif;
    transition: all 0.25s linear;
  }

  .ant-drawer-body {
    overflow-y: hidden;

  }

  .ant-drawer-close {
    outline: none !important;
  }
  .ant-drawer-close:hover {
    opacity: 0.5;
  }
  .ant-list-empty-text > * {
    color: white !important;
  }
  
  .ant-notification {
    margin-right: 0;
  }

  .ant-notification-notice {
    background: ${({ theme }) => theme.colors.bgInverted};
  }

  .anticon.ant-notification-notice-icon-success {
    color: ${({ theme }) => theme.colors.textInverted};
  }

  .ant-notification-notice-message {
    color: ${({ theme }) => theme.colors.textInverted};
  }

  .ant-notification-close-x{
    position: relative;
    top: -5px;
    right: -10px;
    color: ${({ theme }) => theme.colors.textInverted};
  } 

  .swap-notify{
    background: ${({ theme }) => theme.colors.bgInverted};
    color: ${({ theme }) => theme.colors.textInverted};
    line-height: 1.25;
    font-size: 12px;
    width:330px;
    border-radius:0px;

  }
  
  hr {
    background-color: ${({ theme }) => theme.colors.dividerLineInverted};
  }

  .antdNotificationSuccessClass {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  }

  .antdNotificationSuccessClass > div > div {
  display: flex;
  align-items: center;
  }

  .antdNotificationSuccessClass > a {
  display: flex;
  align-items: center;
  position: initial;
  }
`;
