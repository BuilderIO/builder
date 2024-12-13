/** @jsx jsx */
import React, { useMemo, useState, useEffect } from "react";
import { jsx } from "@emotion/core";
import { useFetchConfig } from "../../hooks/useFetchConfig";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import {
  formStyle,
  labelStyle,
  footerStyle,
  secondaryButtonStyle,
  primaryButtonStyle,
  selectHint,
  textareaStyle,
  inputStyle,
  languagesLabelStyle,
  datePickerStyle,
  loadingStyle,
  titleStyle,
  darkModeStyles,
  checkboxContainerStyle,
  checkboxLabelStyle,
  selectorStyle,
  attributesStyle,
} from "./styles";
import { CustomCheckbox } from "../CheckBox/CheckBox";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import appState from "@builder.io/app-context";
import Select from "react-select";
import { getConnectorList } from "../../services/index";
import { getTargetLanguagesForSource } from "../../utils";

const minDate = new Date();
minDate.setDate(minDate.getDate() + 1);

export const SubmissionModal = ({
  selectedContentData,
  onClose,
  globallinkUrl,
  connectorsKey,
  apiKey,
  submitter,
}) => {
  const [fetchEnabled, setFetchEnabbled] = useState(false);
  const [connectorList, setConnectorList] = useState([]);
  const [connectorKey, setConnectorKey] = useState({ label: "", value: "" });

  const {
    targetLanguages,
    sourceLanguages,
    handleCreateSubmission,
    setCustomAttributes,
    customAttributes,
    configOptions,
    setConfigOptions,
    isLoading,
    error,
    isCreateLoading,
    isCreateSuccess,
    IsCreateError,
    supportedLocales,
    languageDirections,
    setTargetLanguages,
    isMultiSourceLocaleSupported
  } = useFetchConfig({
    globallinkUrl,
    gccToken: apiKey,
    connectorKey: connectorKey?.value,
    fetchEnabled,
    submitter,
  });

  const [selectedSourceLanguages, setSelectedSourceLanguages] = useState(
    sourceLanguages[0]
  );
  const [selectedTargetLanguages, setSelectedTargetLanguages] = useState([]);
  const [selectedCustomAttributes, setSelectedCustomAttributes] = useState({});
  const [selecteConfig, setSelecteConfig] = useState({});
  const [submissionName, setSubmissionName] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [isConnectorListLoading, setIsConnectorListLoading] = useState(false);
  const [connectorListError, setConnectorListError] = useState(false);
  const [dueDate, setDueDate] = useState(minDate);
  const [focusStates, setFocusStates] = useState({});
  const isDarkMode = appState.theme.isDarkMode;

  const handleFocus = (inputName) => {
    setFocusStates({ ...focusStates, [inputName]: true });
  };

  const handleBlur = (inputName) => {
    setFocusStates({ ...focusStates, [inputName]: false });
  };

  const isTranslateDisabled = useMemo(() => {
    const hasMissingMandatoryAttribute = customAttributes.some((attribute) => {
      if (attribute.isMandatory) {
        const selectedValue = selectedCustomAttributes[attribute.name];
        return (
          selectedValue === undefined ||
          selectedValue === null ||
          selectedValue === "" ||
          (Array.isArray(selectedValue) && selectedValue.length === 0)
        );
      }
      return false;
    });
    return (
      !selectedSourceLanguages ||
      selectedSourceLanguages.length === 0 ||
      !selectedTargetLanguages ||
      selectedTargetLanguages.length === 0 ||
      !submissionName ||
      submissionName.trim() === "" ||
      hasMissingMandatoryAttribute ||
      !connectorKey
    );
  }, [
    selectedSourceLanguages,
    selectedTargetLanguages,
    submissionName,
    selectedCustomAttributes,
    connectorKey,
  ]);

  const handleTranslate = async (e) => {
    e.preventDefault();
    await handleCreateSubmission({
      instructions,
      selectedSourceLanguages,
      selectedTargetLanguages,
      submissionName,
      dueDate,
      selectedContentData,
      selectedCustomAttributes,
      selecteConfig,
    });
  };
  const handleAttributesChange = (event, attributeIndex) => {
    const updatedAttributeList = customAttributes.map((attribute, index) => {
      if (index === attributeIndex) {
        return {
          ...attribute,
          value: event,
        };
      }
      return attribute;
    });

    setCustomAttributes(updatedAttributeList);

    const finalObject = updatedAttributeList.reduce((acc, attribute) => {
      const attributeValue = Array.isArray(attribute.value)
        ? attribute.value.map((item) =>
          typeof item === "object" ? item.value : item
        )
        : typeof attribute.value === "object" && attribute.value !== null
          ? attribute.value.value
          : attribute.value;

      acc[attribute.name] = attributeValue !== undefined ? attributeValue : "";
      return acc;
    }, {});
    setSelectedCustomAttributes(finalObject);
  };

  const handleConfigChange = (configIndex) => {
    const updatedConfigList = configOptions.map((config, index) => {
      if (index === configIndex) {
        return {
          ...config,
          value: !config.value,
        };
      }
      return config;
    });
    setConfigOptions(updatedConfigList);

    const finalObject = updatedConfigList
      .filter((config) => config.enabled)
      .reduce((acc, config) => {
        acc[config.key] = config.value !== undefined ? config.value : false;
        return acc;
      }, {});
    setSelecteConfig(finalObject);
  };


  useEffect(() => {
    if (sourceLanguages.length > 0) {
      setSelectedSourceLanguages(sourceLanguages[0]);
      if (isMultiSourceLocaleSupported) {
        const targetLanguageList = getTargetLanguagesForSource(sourceLanguages[0],
          supportedLocales,
          languageDirections
        )
        setTargetLanguages(targetLanguageList);
      }
    }
  }, [sourceLanguages, isMultiSourceLocaleSupported]);

  useEffect(() => {
    const initialConfig = configOptions
      .filter((config) => config.enabled)
      .reduce((acc, config) => {
        acc[config.key] = config.value !== undefined ? config.value : false;
        return acc;
      }, {});
    setSelecteConfig(initialConfig);
  }, [configOptions]);

  useEffect(() => {
    const fetchConnectorList = async () => {
      try {
        setIsConnectorListLoading(true);
        const connectorListResponse = await getConnectorList({
          globallinkUrl,
          gccToken: apiKey,
        });
        const connectorKeysArray = connectorsKey.split(",").map((key) => {
          const foundConnector = connectorListResponse.response_data.find(
            (connector) => connector.connector_key === key
          );
          return {
            label: foundConnector ? foundConnector.connector_name : key,
            value: key,
          };
        });
        setConnectorList(connectorKeysArray);
        setConnectorKey(connectorKeysArray[0]);
        setFetchEnabbled(true);
      } catch (e) {
        setIsConnectorListLoading(false);
        setConnectorListError(true);
      } finally {
        setIsConnectorListLoading(false);
      }
    };

    fetchConnectorList();
  }, [apiKey, globallinkUrl]);

  if (isLoading || isConnectorListLoading)
    return (
      <div css={loadingStyle}>
        {" "}
        <LoadingSpinner />
      </div>
    );
  if (error || connectorListError)
    return (
      <div css={formStyle(isDarkMode)}>
        <h2>Error: Please check your settings or try again later.</h2>
      </div>
    );

  return isCreateSuccess ? (
    <div css={formStyle}>
      <h1 css={languagesLabelStyle(isDarkMode)}>
        Item(s) sent for translation successfully.
      </h1>
    </div>
  ) : IsCreateError ? (
    <div css={formStyle}>
      <h1 css={languagesLabelStyle(isDarkMode)}>
        Error while submission, Please try again later !
      </h1>
    </div>
  ) : (
    <div css={formStyle}>
      <p css={titleStyle(isDarkMode)}>Translation Configuration</p>
      <div css={attributesStyle}>
        <label
          htmlFor={`PROJECT`}
          css={[labelStyle(isDarkMode), darkModeStyles(isDarkMode)]}
        >
          Project *
        </label>
        <Select
          isClearable
          isSearchable
          onChange={(event) => {
            setConnectorKey(event);
          }}
          options={connectorList}
          placeholder="Project"
          value={connectorKey}
          styles={selectorStyle}
        />
        <span css={[selectHint, darkModeStyles(isDarkMode)]}>
          Select your translation project.
        </span>
      </div>
      <div css={attributesStyle}>
        <label
          htmlFor={`Source Language`}
          css={[labelStyle(isDarkMode), darkModeStyles(isDarkMode)]}
        >
          Source Language *
        </label>
        <Select
          isClearable
          isSearchable
          onChange={(event) => {
            setSelectedSourceLanguages(event);

            if (isMultiSourceLocaleSupported) {
              const targetLanguageList = getTargetLanguagesForSource(event,
                supportedLocales,
                languageDirections
              )
              setTargetLanguages(targetLanguageList);
            }
          }}
          options={sourceLanguages}
          placeholder="Source Language"
          value={selectedSourceLanguages}
          styles={selectorStyle}
        />
      </div>

      <div className={focusStates["submission-name"] ? "focused" : ""}>
        <label
          htmlFor="submission-name"
          css={[labelStyle(isDarkMode), darkModeStyles(isDarkMode)]}
        >
          Submission Name *
        </label>
        <input
          id="submission-name"
          value={submissionName}
          onChange={(e) => setSubmissionName(e.target.value)}
          onFocus={() => handleFocus("submission-name")}
          onBlur={() => handleBlur("submission-name")}
          placeholder="Submission Name"
          type="text"
          css={inputStyle(isDarkMode)}
        />
        <span css={[selectHint, darkModeStyles(isDarkMode)]}>
          Enter a name for a submission.
        </span>
      </div>

      <div className={focusStates["due-date"] ? "focused" : ""}>
        <label
          htmlFor="source-selector"
          css={[labelStyle(isDarkMode), darkModeStyles(isDarkMode)]}
        >
          Due Date *
        </label>
        <div css={datePickerStyle(isDarkMode)}>
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            minDate={minDate}
            dateFormat="dd/MM/yyyy"
            onCalendarOpen={() => handleFocus("due-date")}
            onCalendarClose={() => handleBlur("due-date")}
          />
          <span css={[selectHint, darkModeStyles(isDarkMode)]}>
            Select translation due date from the calendar.
          </span>
        </div>
      </div>

      <div>
        <label
          htmlFor="target-selector"
          css={[labelStyle(isDarkMode), darkModeStyles(isDarkMode)]}
        >
          Select Target locales *
        </label>
        <div css={checkboxContainerStyle}>
          <div css={checkboxLabelStyle(isDarkMode)}>
            <CustomCheckbox
              checked={
                selectedTargetLanguages.length === targetLanguages.length
              }
              onChange={(e) => {
                const isChecked = e.target.checked;
                setSelectedTargetLanguages(isChecked ? targetLanguages : []);
              }}
            />
            <label>Select all</label>
          </div>
          {targetLanguages.map((language) => (
            <div key={language.value} css={checkboxLabelStyle(isDarkMode)}>
              <CustomCheckbox
                checked={selectedTargetLanguages.some(
                  (selectedLanguage) =>
                    selectedLanguage.value === language.value
                )}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setSelectedTargetLanguages((prev) =>
                    isChecked
                      ? [...(prev || []), language]
                      : (prev || []).filter(
                        (selectedLanguage) =>
                          selectedLanguage.value !== language.value
                      )
                  );
                }}
              />
              <label>{language.label}</label>
            </div>
          ))}
        </div>

        <span css={[selectHint, darkModeStyles(isDarkMode)]}>
          Select required Target locales for translation.
        </span>
      </div>

      <div>
        <label
          htmlFor="target-selector"
          css={[labelStyle(isDarkMode), darkModeStyles(isDarkMode)]}
        >
          Custom Attributes :
        </label>
        {customAttributes.length > 0 &&
          customAttributes.map((attribute, index) => (
            <div key={index}>
              {(!attribute.values || attribute.values.length === 0) && (
                <div css={attributesStyle}>
                  <label
                    htmlFor={`attributes`}
                    css={[labelStyle(isDarkMode), darkModeStyles(isDarkMode)]}
                  >
                    {attribute.name}&nbsp;
                    {attribute.isMandatory && <span>*</span>}
                  </label>
                  <input
                    type="text"
                    onChange={(event) => {
                      handleAttributesChange(event.target.value, index);
                    }}
                    value={attribute.value}
                    placeholder={attribute.name}
                    css={inputStyle(isDarkMode)}
                  />
                </div>
              )}

              {attribute.values && attribute.values.length > 0 && (
                <div css={attributesStyle}>
                  <label
                    htmlFor={`attributes`}
                    css={[labelStyle(isDarkMode), darkModeStyles(isDarkMode)]}
                  >
                    {attribute.name}&nbsp;
                    {attribute.isMandatory && <span>*</span>}
                  </label>
                  <Select
                    isClearable
                    isSearchable
                    isMulti={attribute.isMultiselect}
                    onChange={(event) => {
                      handleAttributesChange(event, index);
                    }}
                    options={attribute.values.map((e) => ({
                      label: e,
                      value: e,
                    }))}
                    placeholder={attribute.name}
                    value={attribute?.value}
                    styles={selectorStyle}
                  />
                </div>
              )}
            </div>
          ))}
      </div>

      <div>
        {configOptions.some((config) => config.enabled) && (
          <>
            <label css={[labelStyle(isDarkMode), darkModeStyles(isDarkMode)]}>
              Configuration :
            </label>
            {configOptions.map((config, index) => {
              return (
                config.enabled && (
                  <div key={index} css={checkboxLabelStyle(isDarkMode)}>
                    <CustomCheckbox
                      onChange={() => handleConfigChange(index)}
                      checked={config.value}
                    />
                    <label css={[darkModeStyles(isDarkMode)]}>
                      {config.name}
                    </label>
                  </div>
                )
              );
            })}
          </>
        )}
      </div>

      <div className={focusStates["instructions"] ? "focused" : ""}>
        <label
          htmlFor="instructions"
          css={[labelStyle(isDarkMode), darkModeStyles(isDarkMode)]}
        >
          Instructions :
        </label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          onFocus={() => handleFocus("instructions")}
          onBlur={() => handleBlur("instructions")}
          placeholder="Instructions"
          css={textareaStyle(isDarkMode)}
        />
        <span css={[selectHint, darkModeStyles(isDarkMode)]}>
          If you have any specific translation instructions, you can enter those
          here before submitting for translations.
        </span>
      </div>

      <div css={footerStyle}>
        <button
          type="button"
          css={secondaryButtonStyle(isDarkMode)}
          onClick={onClose}
        >
          Cancel
        </button>
        {isCreateLoading ? (
          <LoadingSpinner />
        ) : (
          <button
            css={primaryButtonStyle(isDarkMode)}
            onClick={(e) => handleTranslate(e)}
            disabled={isTranslateDisabled}
          >
            Translate
          </button>
        )}
      </div>
    </div>
  );
};
