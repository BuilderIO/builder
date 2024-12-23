/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useState, useCallback, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    CircularProgress,
    TextField,
    Select,
    MenuItem,
    Grid,
} from "@mui/material";
import { useDashBoardFetch } from "../../hooks/useDashBoardFetch";
import OutlineTag from "../OutlineTag/OutlineTag";
import { SUBMISSION_STATUS } from "../../constants";
import useConnectorsList from "../../hooks/useConnectorsList";
import TaskListModal from "../TaskListModal/TaskListModal";
import { ErrorOutline } from "@mui/icons-material";

const Dashboard = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [submissionName, setSubmissionName] = useState("");
    const [project, setProject] = useState({
        label: "Translations Status",
        value: "Any",
    });
    const [status, setStatus] = useState({
        label: "Translation Projects",
        value: "Any",
    });
    const [submitter, setSubmitter] = useState("");
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { connectorList, connectorListError } = useConnectorsList();
    const {
        data,
        initialLoading,
        paginationLoading,
        error,
        pagination,
        refetch,
    } = useDashBoardFetch(
        page + 1,
        rowsPerPage,
        submissionName,
        project.value,
        status.value,
        submitter
    );

    const handleChangePage = useCallback(
        (event, newPage) => {
            setPage(newPage);
            refetch();
        },
        [refetch]
    );

    const handleChangeRowsPerPage = useCallback(
        (event) => {
            const newRowsPerPage = parseInt(event.target.value, 10);
            setRowsPerPage(newRowsPerPage);
            setPage(0);
            refetch(newRowsPerPage);
        },
        [refetch]
    );

    const handleSubmissionNameChange = useCallback((e) => {
        setSubmissionName(e.target.value);
        setPage(0);
    }, []);

    const handleProjectChange = useCallback((e) => {
        setProject({ label: e.target.value, value: e.target.value });
        setPage(0);
    }, []);

    const handleStatusChange = useCallback((e) => {
        setStatus({ label: e.target.value, value: e.target.value });
        setPage(0);
    }, []);

    const handleSubmitterChange = useCallback((e) => {
        setSubmitter(e.target.value);
        setPage(0);
    }, []);

    useEffect(() => {
        refetch();
    }, [submissionName, project, status, submitter, refetch]);

    const formatDate = useCallback((timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }, []);

    const renderStatusChips = useCallback((status) => {
        switch (status) {
            case "Pre-process":
                return <OutlineTag className="preProcess" content={status} />;
            case "Delivered":
                return <OutlineTag className="delivered" content={status} />;
            case "Completed":
                return <OutlineTag className="completed" content={status} />;
            case "Cancelled":
                return <OutlineTag className="cancelled" content={status} />;
            default:
                return <OutlineTag className="default" content={status} />;
        }
    }, []);

    const handleRowClick = useCallback((submission) => {
        setSelectedSubmission(submission);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedSubmission(null);
        setIsModalOpen(false);
    }, []);

    if (initialLoading)
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                }}
            >
                <CircularProgress />
            </div>
        );

    if (error || connectorListError)
        return <div>Please check configuration or try again later</div>;
    if (!data) return <div>No data available</div>;

    const rows = data.map((submission) => ({
        pdSubmissionId: Object.keys(submission.pd_submission_id)[0],
        name: submission.submission_name,
        submitter: submission.submitter,
        project: connectorList.find(
            (connector) => connector.value === submission.connector_key
        ),
        createdAt: formatDate(submission.created_at),
        dueDate: formatDate(submission.due_date),
        targetLanguage:
            submission.language_jobs[0]?.target_locale.locale_display_name || "N/A",
        config: submission.config,
        status: submission.state.state_name,
        submissionId: submission.submission_id,
        isError: submission.is_error,
    }));

    return (
        <>
            <TaskListModal
                submission={selectedSubmission}
                open={isModalOpen}
                onClose={handleCloseModal}
            />
            <Grid container spacing={2} style={{ paddingBottom: "16px" }}>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="Submission Name"
                        value={submissionName}
                        onChange={handleSubmissionNameChange}
                        size="small"
                    />
                </Grid>
                <Grid item xs={3}>
                    <Select
                        fullWidth
                        value={project.value}
                        onChange={handleProjectChange}
                        displayEmpty
                        size="small"
                    >
                        <MenuItem value="Any">Translation Projects</MenuItem>
                        {connectorList.map((proj) => (
                            <MenuItem key={proj.value} value={proj.value}>
                                {proj.label}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="Created By"
                        value={submitter}
                        onChange={handleSubmitterChange}
                        size="small"
                    />
                </Grid>
                <Grid item xs={3}>
                    <Select
                        fullWidth
                        value={status.value}
                        onChange={handleStatusChange}
                        displayEmpty
                        size="small"
                    >
                        {SUBMISSION_STATUS.map((stat) => (
                            <MenuItem key={stat.value} value={stat.value}>
                                {stat.label}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
            </Grid>

            <Paper
                style={{
                    width: "100%",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "93%",
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                }}
            >
                <TableContainer style={{ height: "100%" }}>
                    <Table
                        stickyHeader
                        aria-label="sticky table"
                        style={{
                            height: paginationLoading || rows.length === 0 ? "100%" : "auto",
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                {[
                                    "ID",
                                    "Submission Name",
                                    "Creator",
                                    "Project",
                                    "Created At",
                                    "Due Date",
                                    "Language",
                                    "Status",
                                ].map((header) => (
                                    <TableCell
                                        key={header}
                                        sx={{
                                            fontWeight: "bold",
                                            fontSize: "14px",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody
                            style={{
                                height:
                                    paginationLoading || rows.length === 0 ? "100%" : "auto",
                            }}
                        >
                            {paginationLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        style={{ height: "100%", textAlign: "center" }}
                                    >
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} style={{ textAlign: "center" }}>
                                        No data available
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <TableRow
                                        key={row.pdSubmissionId}
                                        onClick={() => handleRowClick(row)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <TableCell
                                            sx={{
                                                fontSize: "13px",
                                                fontFamily: "inherit",
                                                maxWidth: "150px",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {row.isError === 1 && (
                                                <ErrorOutline
                                                    color="error"
                                                    fontSize="small"
                                                    style={{ marginRight: '8px', verticalAlign: 'middle' }}
                                                />
                                            )}
                                            {row.pdSubmissionId}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontSize: "13px",
                                                fontFamily: "inherit",
                                                maxWidth: "230px",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {row.name.match(/.{1,50}/g)?.join('\n') || row.name}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontSize: "13px",
                                                fontFamily: "inherit",
                                                maxWidth: "150px",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {row.submitter}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontSize: "13px",
                                                fontFamily: "inherit",
                                                maxWidth: "150px",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {row.project.label}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontSize: "13px",
                                                fontFamily: "inherit",
                                                maxWidth: "120px",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {row.createdAt}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontSize: "13px",
                                                fontFamily: "inherit",
                                                maxWidth: "120px",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {row.dueDate}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontSize: "13px",
                                                fontFamily: "inherit",
                                                maxWidth: "120px",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {row.targetLanguage}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontSize: "13px",
                                                fontFamily: "inherit",
                                            }}
                                        >
                                            {renderStatusChips(row.status)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody >
                    </Table >
                </TableContainer >
                <TablePagination
                    sx={{
                        height: "55px",
                        overflow: "hidden",
                        fontSize: "13px",
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input, & .MuiTablePagination-displayedRows': {
                            fontSize: '13px',
                            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        },
                    }}
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={pagination.totalRecords}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper >
        </>
    );
};

export default Dashboard;
