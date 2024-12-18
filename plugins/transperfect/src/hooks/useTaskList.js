import { useState, useCallback } from 'react';
import { getTaskList } from '../services';
import appState from "@builder.io/app-context";
import pkg from "../../package.json";

const useTaskList = (submissionId, connectorKey) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        totalRecords: 0,
        currentPage: 1,
        totalPages: 1
    });

    const pluginSettings = appState.user.organization.value.settings.plugins.get(pkg.name);
    const globallinkUrl = pluginSettings.get("Globallinkurl");
    const gccToken = pluginSettings.get("apiKey");

    const fetchTasks = useCallback(async (page = 1, pageSize = 10) => {
        if (!submissionId || !connectorKey) return;

        try {
            setLoading(true);
            setError(null);
            const response = await getTaskList({
                globallinkUrl,
                gccToken,
                submissionId,
                connectorKey,
                page,
                pageSize
            });

            if (response.status === 200) {
                setTasks(response.response_data.tasks_list);
                setPagination({
                    totalRecords: response.response_data.total_records_count,
                    currentPage: response.response_data.current_page_number,
                    totalPages: response.response_data.total_result_pages_count
                });
            } else {
                throw new Error('Failed to fetch tasks');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [submissionId, connectorKey, globallinkUrl, gccToken]);

    return { tasks, loading, error, fetchTasks, pagination, totalRecords: pagination.totalRecords };
};

export default useTaskList;
