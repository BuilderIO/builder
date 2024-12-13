import { useState, useEffect } from "react";
import { camelizeKeys } from "humps";
import { postCreateSubmission, getProjectConfigs } from "../services";

export const useFetchConfig = ({
  globallinkUrl,
  gccToken,
  connectorKey,
  fetchEnabled,
  submitter,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sourceLanguages, setSourceLanguages] = useState([]);
  const [targetLanguages, setTargetLanguages] = useState([]);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [IsCreateError, setIsCreateError] = useState(false);
  const [isCreateSuccess, setIsCreateSuccess] = useState(false);
  const [customAttributes, setCustomAttributes] = useState([]);
  const [configOptions, setConfigOptions] = useState([]);
  const [supportedLocales, setSupportedLocales] = useState([]);
  const [languageDirections, setLanguageDirections] = useState([]);
  const [isMultiSourceLocaleSupported, setIsMultiSourceLocaleSupported] = useState(false);

  const handleCreateSubmission = async (props) => {
    try {
      setIsCreateLoading(true);
      const {
        instructions,
        selectedSourceLanguages,
        selectedTargetLanguages,
        submissionName,
        dueDate,
        selectedContentData,
        selectedCustomAttributes,
        selecteConfig,
      } = props;
      const payload = {
        submission_name: submissionName,
        due_date: Date.parse(dueDate),
        source_locale: selectedSourceLanguages?.value || "",
        target_locale: selectedTargetLanguages.map((e) => e.value),
        connector_key: connectorKey,
        instructions: instructions,
        callback_url: "",
        reference_file_list: ["test"],
        attributes: selectedCustomAttributes,
        config: selecteConfig,
        submitter_email: submitter.email,
        tasks_list: selectedContentData.map((node) => ({
          node_id: node.id,
          name: node.name,
          is_parent: 0,
          node_type: node.kind,
          sequence_number: 0,
          is_translatable: true,
          parent_id: node.parentId,
          node_model: node.nodeModel,
          remove_after_preprocess: 0,
          filename: `${node.filename}.json`,
          pd_classifier: "Builderio_JSON",
          node_type_icon: "",
        })),
        tags: [],
        workflow: "",
        owners_list: ["kpawale@transperfect.com"],
      };

      await postCreateSubmission({
        submissionModel: payload,
        globallinkUrl,
        gccToken,
      });
      setIsCreateSuccess(true);
    } catch (e) {
      setIsCreateError(true);
    } finally {
      setIsCreateLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getProjectConfigs({
          globallinkUrl,
          gccToken,
          connectorKey,
        });
        const camelizedResponse = camelizeKeys(response).responseData;
        setCustomAttributes(camelizedResponse.submissionOptions.attributes);
        setConfigOptions(camelizedResponse.submissionOptions.config);

        setSupportedLocales(camelizedResponse.supportedLocales);
        setLanguageDirections(camelizedResponse.languageDirections);
        setIsMultiSourceLocaleSupported(camelizedResponse.isMultiSourceLocaleSupported);

        if (!camelizedResponse.isMultiSourceLocaleSupported) {
          const sourceLanguageList = camelizedResponse.supportedLocales
            .filter((element) => element.isSource)
            .map((element) => ({
              label: element.localeLabel,
              value: element.connectorLocale,
            }));
          setSourceLanguages(sourceLanguageList);
          const targetLanguageList = camelizedResponse.supportedLocales
            .filter((element) =>
              camelizedResponse.languageDirections.some(
                (langDir) => element.connectorLocale === langDir.targetLocale
              )
            )
            .map((element) => ({
              label: element.localeLabel,
              value: element.connectorLocale,
            }));

          // Add filter for builder.io languages
          setTargetLanguages(targetLanguageList);
        } else {
          const sourceLocales = camelizedResponse.languageDirections.map(
            (element) => element.sourceLocale
          );
          const sourceLanguageList = camelizedResponse.supportedLocales
            .filter((s) => sourceLocales.includes(s.connectorLocale))
            .map((e) => ({
              label: e.localeLabel,
              value: e.connectorLocale,
            }));
          // Add filter for builder.io languages
          setSourceLanguages(sourceLanguageList);

          const targetLanguageList = getTargetLanguagesForSource(sourceLanguageList[0],
            camelizedResponse.supportedLocales,
            camelizedResponse.languageDirections
          )
          // Add filter for builder.io languages
          setTargetLanguages(targetLanguageList);
        }
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (fetchEnabled && connectorKey) {
      fetchData();
    }
  }, [gccToken, globallinkUrl, connectorKey, fetchEnabled]);

  return {
    sourceLanguages,
    customAttributes,
    setCustomAttributes,
    configOptions,
    setConfigOptions,
    targetLanguages,
    setTargetLanguages,
    handleCreateSubmission,
    isLoading,
    error,
    isCreateLoading,
    IsCreateError,
    isCreateSuccess,
    supportedLocales,
    languageDirections,
    isMultiSourceLocaleSupported,
  };
};

