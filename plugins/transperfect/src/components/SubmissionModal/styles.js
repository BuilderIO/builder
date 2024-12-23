import { css } from "@emotion/core";

export const formStyle = (isDarkMode) => css`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 500px;
  color: #333;
  padding: 20px;
  max-height: 80%;
  overflow-y: auto;

  h2 {
    color: ${isDarkMode ? "white" : "black"};
  }
`;

export const loadingStyle = css`
  display: flex;
  flex-direction: column;
  width: 400px;
  padding: 20px;
  height: 100%;

  img {
    margin: 100px auto;
  }
`;

export const footerStyle = css`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 20px;
  align-items: center;
`;

export const secondaryButtonStyle = (isDarkMode) => css`
  -webkit-font-smoothing: antialiased;
  background-color: transparent;
  border-color: rgb(68, 68, 68);
  border-radius: 5px;
  box-sizing: border-box;
  color: ${isDarkMode ? "rgb(255, 255, 255, 0.54)" : "rgb(0, 0, 0, 0.57)"};
  cursor: pointer;
  border: none;
  display: inline-flex;
  font-family: "Inter", "Roboto", "Helvetica", "Arial", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  justify-content: center;
  line-height: 1.75rem;
  margin: 0;
  min-width: 64px;
  outline: none;
  padding: 5px 16px;
  position: relative;
  text-decoration: none;
  text-transform: capitalize;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
    border 250ms cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  align-items: center;

  &:focus {
    box-shadow: var(--shadow);
  }
`;

export const primaryButtonStyle = (isDarkMode) => css`
  -webkit-font-smoothing: antialiased;
  background-color: rgba(26, 115, 232, 1);
  border: 1px solid rgba(93, 150, 255, 0.5);
  border-radius: 5px;
  box-shadow: none;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font-family: "Inter", "Roboto", "Helvetica", "Arial", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  justify-content: center;
  line-height: 1.75rem;
  margin: 0;
  margin-left: 10px;
  min-width: 64px;
  padding: 5px 16px;
  text-transform: capitalize;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
    border 250ms cubic-bezier(0.4, 0, 0.2, 1);
  align-items: center;
  white-space: nowrap;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(93, 150, 255, 0.4);
  }

  &:disabled {
    background-color: transparent;
    border: 1px solid rgba(93, 150, 255, 0.2);
    color: rgba(93, 150, 255, 0.5);
    cursor: not-allowed;
  }
`;
//   control: (provided) => ({
//     ...provided,
//     marginTop: "12px",
//     marginBottom: "6px",
//     backgroundColor: 'var(--background, #2b2b2b)',
//     borderColor: 'var(--border-color, #444444)',
//     color: 'var(--text-regular, #F2F2F2)',
//     fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
//     '&:hover': {
//       borderColor: 'var(--control-border-color, #444444)'
//     }
//   }),
//   menu: (provided) => ({
//     ...provided,
//     backgroundColor: 'var(--background, #2b2b2b)',
//     borderColor: 'rgba(0, 0, 0, 0.1)',
//     borderRadius: '4px',
//     boxShadow: 'rgba(0, 0, 0, 0.05) 1px 1px 0px',
//     marginTop: '8px',
//     marginBottom: '8px',
//     position: 'absolute',
//     width: '100%',
//     zIndex: 1,
//     boxSizing: 'border-box',
//     border: '1px solid var(--border-color, #444444)',
//     fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
//     color: 'var(--text-regular, #F2F2F2)',
//   }),
//   option: (provided, state) => ({
//     ...provided,
//     backgroundColor: "transparent",
//     color: 'var(--text-regular, #F2F2F2)',

//   }),
//   singleValue: (provided, state) => ({
//     ...provided,
//     fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
//     color: 'var(--text-regular, #F2F2F2)',
//     backgroundColor: state.selectProps.isMulti ? 'rgb(102, 102, 102)' : 'transparent',
//     borderRadius: '2px',
//     display: 'flex',
//     margin: '2px',
//     minWidth: '0px',
//     boxSizing: 'border-box',
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: 'var(--off-background-6, #666666)',
//     color: 'var(--text-regular, #F2F2F2)',
//     fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: 'var(--text-regular, #F2F2F2)',
//   }),
//   multiValueRemove: (provided) => ({
//     ...provided,
//     ':hover': {
//       backgroundColor: 'var(--red, hsl(0, 99%, 64%))',
//       color: 'var(--white, #FFFFFF)',
//     }
//   }),
//   menuPortal: base => ({ ...base, zIndex: 9999 }),

// };

export const selectHint = css`
  font-size: 12px;
  opacity: 0.8;
`;

export const textareaStyle = (isDarkMode) => css`
  font-family: "Inter", "Roboto", "Helvetica", "Arial", sans-serif;
  box-sizing: inherit;
  border: var(--border);
  padding: 10px;
  width: 100%;
  border-radius: 4px;
  resize: vertical;
  background: transparent;
  color: ${isDarkMode ? "#fff" : "#000"};

  &:focus {
    border-color: ${isDarkMode ? "rgb(125, 171, 255,1);" : "rgb(18, 80, 162)"};
    outline: none;
  }
`;

export const datePickerStyle = (isDarkMode) => css`
  width: 100%;
  margin-top: 0px;

  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    font-family: "Inter", "Roboto", "Helvetica", "Arial", sans-serif;
    box-sizing: inherit;
    border: var(--border);
    padding: 10px;
    width: 100%;
    border-radius: 4px;
    color: ${isDarkMode ? "#ffffff" : "#000000"};

    &:focus {
      border-color: ${isDarkMode
        ? "rgb(125, 171, 255,1);"
        : "rgb(18, 80, 162)"};
      outline: none;
    }
  }
`;

export const titleStyle = (isDarkMode) => css`
  font-size: 21px;
  margin: 0 auto;
  color: ${isDarkMode ? "#ffffff" : "#000000"};
`;

export const labelStyle = (isDarkMode) => css`
  font-family: "Inter", "Roboto", "Helvetica", "Arial", sans-serif;
  box-sizing: inherit;
  display: inline-flex;
  padding: 0;
  position: relative;
  width: 100%;
  margin: 0px;
  margin-bottom: 10px;
  font-weight: 500;
  font-size: 14px;

  .focused & {
    color: ${isDarkMode ? "rgb(125, 171, 255,1);" : "rgb(18, 80, 162)"};
    opacity: 1;
  }
`;

export const inputStyle = (isDarkMode) => css`
  font-family: "Inter", "Roboto", "Helvetica", "Arial", sans-serif;
  box-sizing: inherit;
  border: var(--border);
  padding: 10px;
  width: 100%;
  border-radius: 4px;
  color: ${isDarkMode ? "#fff" : "#000"};
  background-color: transparent;

  &:focus {
    border-color: ${isDarkMode ? "rgb(125, 171, 255,1);" : "rgb(18, 80, 162)"};
    outline: none;
  }
`;

export const checkboxContainerStyle = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

export const checkboxLabelStyle = (isDarkMode) => css`
  display: flex;
  align-items: center;
  gap: 5px;

  label {
    font-size: 12px;
    color: ${isDarkMode ? "white" : "black"};
  }
`;

export const darkModeStyles = (isDarkMode) => css`
  color: ${isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.54)"};
  border-color: ${isDarkMode
    ? "var(--border-color-dark)"
    : "var(--border-color)"};
`;

export const sourceStyle = (isDarkMode) => css`
  display: flex;
  gap: 5px;
  align-items: center;

  p {
    font-family: "Inter", "Roboto", "Helvetica", "Arial", sans-serif;
    font-weight: 500;
    font-size: 14px;
  }

  span {
    color: ${isDarkMode ? "#ffffff" : "#000000"};
  }
`;

export const languagesLabelStyle = (isDarkMode) => css`
  font-size: 18px;
  font-weight: bold;
  color: ${isDarkMode ? "#ffffff" : "#000000"};
  margin-bottom: 0px;
  margin-top: 0px;
`;

export const selectorStyle = {
  control: (provided) => ({
    ...provided,
    marginTop: "12px",
    marginBottom: "6px",
    backgroundColor: "var(--background, #2b2b2b)",
    borderColor: "var(--border-color, #444444)",
    color: "var(--text-regular, #F2F2F2)",
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    "&:hover": {
      borderColor: "var(--control-border-color, #444444)",
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "var(--background, #2b2b2b)",
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: "4px",
    boxShadow: "rgba(0, 0, 0, 0.05) 1px 1px 0px",
    marginTop: "8px",
    marginBottom: "8px",
    position: "absolute",
    width: "100%",
    zIndex: 1,
    boxSizing: "border-box",
    border: "1px solid var(--border-color, #444444)",
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    color: "var(--text-regular, #F2F2F2)",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: "transparent",
    color: "var(--text-regular, #F2F2F2)",
  }),
  singleValue: (provided, state) => ({
    ...provided,
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    color: "var(--text-regular, #F2F2F2)",
    backgroundColor: state.selectProps.isMulti
      ? "rgb(102, 102, 102)"
      : "transparent",
    borderRadius: "2px",
    display: "flex",
    margin: "2px",
    minWidth: "0px",
    boxSizing: "border-box",
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "var(--off-background-6, #666666)",
    color: "var(--text-regular, #F2F2F2)",
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "var(--text-regular, #F2F2F2)",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    ":hover": {
      backgroundColor: "var(--red, hsl(0, 99%, 64%))",
      color: "var(--white, #FFFFFF)",
    },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export const attributesStyle = css`
  margin-bottom: 12px;

  label {
    margin: 0;
  }
`;
