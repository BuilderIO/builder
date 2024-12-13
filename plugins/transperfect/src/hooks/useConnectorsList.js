import { useState, useEffect } from 'react';
import appState from "@builder.io/app-context";
import pkg from "../../package.json";
import { getConnectorList } from '../services';

const useConnectorsList = () => {
    const pluginSettings =
        appState.user.organization.value.settings.plugins.get(pkg.name);
    const [connectorList, setConnectorList] = useState([]);
    const [, setIsConnectorListLoading] = useState(false);
    const [connectorListError, setConnectorListError] = useState(false);
    const globallinkUrl = pluginSettings.get("Globallinkurl");
    const connectorsKey = pluginSettings.get("connectorKey");
    const apiKey = pluginSettings.get("apiKey");

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
            } catch (e) {
                setConnectorListError(true);
            } finally {
                setIsConnectorListLoading(false);
            }
        };

        fetchConnectorList();
    }, [apiKey, globallinkUrl, connectorsKey]);

    return {
        connectorList,
        connectorListError,
    };
};

export default useConnectorsList;