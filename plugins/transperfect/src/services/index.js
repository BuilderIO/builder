import axios from "axios";

export const postCreateSubmission = async ({
  globallinkUrl,
  submissionModel,
  gccToken,
}) => {
  if (gccToken) {
    const config = {
      headers: {
        "Content-Type": "application/json",
        "api-key": gccToken,
      },
    };

    try {
      const response = await axios.post(
        `${globallinkUrl}` + "/rest-api/v3/submission/create",
        submissionModel,
        config
      );

      await logData(
        globallinkUrl,
        gccToken,
        submissionModel.connector_key,
        response?.data,
        "CBI",
        "Successful- Submission creation was successful."
      );
      return response?.data;
    } catch (error) {
      await logData(
        globallinkUrl,
        gccToken,
        submissionModel.connector_key,
        error.message,
        "CBI",
        "Failure - There was an issue creating the submission. Please try again later."
      );
      throw error;
    }
  }
};

export const getProjectConfigs = async ({
  globallinkUrl,
  connectorKey,
  gccToken,
}) => {
  if (gccToken) {
    try {
      const response = await axios({
        url: `${globallinkUrl}/rest-api/v3/connector/config?connector_key=${connectorKey}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "api-key": gccToken,
        },
      });
      await logData(
        globallinkUrl,
        gccToken,
        connectorKey,
        response?.data,
        "CBI",
        "Successful- The configuration data was successfully retrieved from the API"
      );
      return response?.data;
    } catch (error) {
      await logData(
        globallinkUrl,
        gccToken,
        connectorKey,
        error.message,
        "CBI",
        "Failure - There was an error while retrieving configuration data from the API. Please try again later."
      );
      throw error;
    }
  }
};

export const getConnectorList = async ({ globallinkUrl, gccToken }) => {
  if (gccToken) {
    try {
      const response = await axios({
        url: `${globallinkUrl}/rest-api/v3/connector/list`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "api-key": gccToken,
        },
      });
      return response?.data;
    } catch (error) {
      throw error;
    }
  }
};

export const logData = async (
  globallinkUrl,
  gccToken,
  connectorKey,
  logs,
  origin,
  message
) => {
  try {
    await axios.post(
      `${globallinkUrl}/rest-api/v3/util/log`,
      {
        logs: [
          {
            ...logs,
            origin,
            level: "info",
            timestamp: new Date().getTime(),
            message,
          },
        ],
        connector_key: connectorKey,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": gccToken,
        },
      }
    );
  } catch (error) {
    console.error("Error logging data:", error);
  }
};

export const getSubmissionList = async ({
  globallinkUrl,
  gccToken,
  connectorKeys,
  page,
  pageSize,
  status,
  submissionName,
  project,
  submitter
}) => {
  if (gccToken) {
    try {
      const response = await axios.post(
        `${globallinkUrl}/rest-api/v3/submission/list`,
        {
          connector_key: project === "Any" ? connectorKeys : [project],
          page_number: page,
          page_size: pageSize,
          state: status === "Any" ? [] : [status],
          search_string: submissionName,
          submitter,

        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": gccToken,
          },
        }
      );

      for (const connectorKey of connectorKeys) {
        await logData(
          globallinkUrl,
          gccToken,
          connectorKey,
          response?.data,
          "CBI",
          "Successful - Submission list retrieved successfully."
        );
      }

      return response?.data;
    } catch (error) {
      for (const connectorKey of connectorKeys) {
        await logData(
          globallinkUrl,
          gccToken,
          connectorKey,
          error.message,
          "CBI",
          "Failure - There was an issue retrieving the submission list. Please try again later."
        );
      }
      throw error;
    }
  }
};

export const getTaskList = async ({
  globallinkUrl,
  gccToken,
  submissionId,
  connectorKey,
  page,
  pageSize
}) => {
  if (gccToken) {
    try {
      const response = await axios.post(
        `${globallinkUrl}/rest-api/v3/task/list`,
        {
          submission_id: submissionId,
          connector_key: [connectorKey],
          page_number: page,
          page_size: pageSize
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": gccToken,
          },
        }
      );

      await logData(
        globallinkUrl,
        gccToken,
        connectorKey,
        response?.data,
        "CBI",
        "Successful - Task list retrieved successfully."
      );

      return response?.data;
    } catch (error) {
      await logData(
        globallinkUrl,
        gccToken,
        connectorKey,
        error.message,
        "CBI",
        "Failure - There was an issue retrieving the task list. Please try again later."
      );
      throw error;
    }
  }
};
