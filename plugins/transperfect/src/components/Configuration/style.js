import { css } from "@emotion/react";

export const styles = {
  formContainer: css`
  height:100%;
  width:100%;
`,
  container: css`
      font-family: Arial, sans-serif;
      max-width: 1900px;
      margin: auto;
      padding: 0 30px;
      width: 100%;
      height: 100%;
    `,
  header: css`
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    `,
  logo: css`
      width: 150px;
      height: auto;
      padding: 16px 0px;
    `,
  tabContainer: css`
      display: flex;
      border-bottom: 1px solid #ccc;
      margin-bottom: 20px;
    `,
  tabButton: css`
      background: none;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      &:hover {
        background-color: #f0f0f0;
      }
      &.active {
        border-bottom: 2px solid #007bff;
        color: #007bff;
      }
    `,
  content: css`
      height:88vh;
      padding: 0px;
      background-color: #f9f9f9;
      border-radius: 4px;
    `,
};