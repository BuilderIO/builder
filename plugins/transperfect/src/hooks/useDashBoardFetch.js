import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import { getSubmissionList } from '../services';
import appState from "@builder.io/app-context";
import pkg from "../../package.json";

export const useDashBoardFetch = (page, rowsPerPage, submissionName, project, status, submitter) => {
  const pluginSettings =
    appState.user.organization.value.settings.plugins.get(pkg.name);

  const globallinkUrl = pluginSettings.get("Globallinkurl");
  const connectorsKeyString = pluginSettings.get("connectorKey");
  const gccToken = pluginSettings.get("apiKey");

  const [data, setData] = useState([]);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ totalRecords: 0 });

  const isInitialRender = useRef(true);

  const fetchData = useCallback(async (newRowsPerPage = rowsPerPage) => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
    }
    setPaginationLoading(true);

    try {
      const connectorsKeyArray = connectorsKeyString.split(',').map(key => key.trim());
      const response = await getSubmissionList({
        globallinkUrl,
        gccToken,
        connectorKeys: connectorsKeyArray,
        page,
        pageSize: newRowsPerPage,
        submissionName,
        project,
        status,
        submitter
      });

      if (response.status === 200) {
        setData(response.response_data.submission_list);
        setPagination({ totalRecords: response.response_data.total_records_count });
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      setError(err);
    } finally {
      isInitialRender.current = false;
      setPaginationLoading(false);
    }
  }, [page, rowsPerPage, submissionName, project, status, submitter]);

  const debouncedFetchRef = useRef(
    debounce((fetchFn) => {
      fetchFn();
    }, 1000)
  ).current;

  useEffect(() => {
    if (submissionName || submitter) {
      debouncedFetchRef(() => fetchData());
    } else {
      fetchData();
    }

    return () => {
      debouncedFetchRef.cancel();
    };
  }, [fetchData, debouncedFetchRef, submissionName, submitter, page, rowsPerPage, project, status]);

  const refetch = useCallback((newRowsPerPage = rowsPerPage) => {
    if (submissionName || submitter) {
      debouncedFetchRef(() => fetchData(newRowsPerPage));
    } else {
      fetchData(newRowsPerPage);
    }
  }, [fetchData, debouncedFetchRef, rowsPerPage, submissionName, submitter]);

  return { data, initialLoading: isInitialRender.current, paginationLoading, error, pagination, refetch };
};

