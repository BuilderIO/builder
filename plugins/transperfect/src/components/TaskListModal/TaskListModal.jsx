/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useEffect, useState, useCallback } from "react";
import {
    Modal,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Grid,
    CircularProgress,
} from "@mui/material";
import useTaskList from "../../hooks/useTaskList";
import { css } from "@emotion/react";
import OutlineTag from "../OutlineTag/OutlineTag";
import { ErrorOutline } from "@mui/icons-material";

const styles = {
    label: css`
    .label-text {
      color: gray;
    }
    .value-text {
      color: black;
      word-break: break-all;
    }
  `,
};

const TaskListModal = ({ submission, open, onClose }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { tasks, loading, error, fetchTasks, totalRecords } = useTaskList(
        submission?.submissionId,
        submission?.project.value
    );

    useEffect(() => {
        if (open && submission?.submissionId && submission?.project) {
            fetchTasks(page + 1, rowsPerPage);
        }
    }, [
        open,
        submission?.submissionId,
        submission?.project,
        fetchTasks,
        page,
        rowsPerPage,
    ]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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

    const formatDate = useCallback((timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }, []);

    if (!open) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 800,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    maxHeight: "90vh",
                    overflow: "auto",
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                }}
            >
                <Grid
                    container
                    spacing={2}
                    sx={{
                        border: "2px solid #ddd",
                    }}
                >
                    <Grid item xs={6}>
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{
                                fontFamily: "inherit",
                                color: '#000000'
                            }}
                        >
                            Submission Details
                        </Typography>
                        <Typography sx={{ mt: 2, fontSize: "13px", fontFamily: "inherit" }}>
                            {submission && (
                                <>
                                    <p css={styles.label}>
                                        <span className="label-text">Submission ID:</span>{" "}
                                        <span className="value-text">
                                            {submission.submissionId || "N/A"}
                                        </span>
                                    </p>
                                    <p css={styles.label}>
                                        <span className="label-text">Submission Name:</span>{" "}
                                        <span className="value-text">
                                            {submission.name || "N/A"}
                                        </span>
                                    </p>
                                    <p css={styles.label}>
                                        <span className="label-text">GlobalLink Project:</span>{" "}
                                        <span className="value-text">
                                            {submission.project?.label || "N/A"}
                                        </span>
                                    </p>
                                    <p css={styles.label}>
                                        <span className="label-text">Created By:</span>{" "}
                                        <span className="value-text">
                                            {submission.submitter || "N/A"}
                                        </span>
                                    </p>
                                    <p css={styles.label}>
                                        <span className="label-text">Date Created:</span>{" "}
                                        <span className="value-text">
                                            {submission.createdAt || "N/A"}
                                        </span>
                                    </p>
                                    <p css={styles.label}>
                                        <span className="label-text">Due Date:</span>{" "}
                                        <span className="value-text">
                                            {submission.dueDate || "N/A"}
                                        </span>
                                    </p>
                                </>
                            )}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{ fontFamily: "inherit", color: "#000000" }}
                        >
                            Custom Config
                        </Typography>
                        <Typography sx={{ mt: 2, fontSize: "13px", fontFamily: "inherit" }}>
                            <p css={styles.label}>
                                <span className="label-text">Select Only New File: </span>{" "}
                                <span className="value-text">
                                    {submission?.config?.is_select_only_new_files
                                        ? "True"
                                        : "False"}
                                </span>
                            </p>
                            <p css={styles.label}>
                                <span className="label-text">Include Linked components: </span>
                                <span className="value-text">
                                    {submission?.config?.translate_linked_content ? "Yes" : "No"}
                                </span>
                            </p>
                        </Typography>
                    </Grid>
                </Grid>
                <Box sx={{ mt: 4, maxHeight: 350, overflow: "auto" }}>
                    {error && (
                        <Typography
                            color="error"
                            sx={{ fontFamily: "inherit", fontSize: "13px" }}
                        >
                            Error: {error}
                        </Typography>
                    )}
                    <TableContainer component={Paper} sx={{ maxHeight: "250px" }}>
                        <Table stickyHeader aria-label="task list table">
                            <TableHead>
                                <TableRow>
                                    {[
                                        "Entry name",
                                        "Field Type",
                                        "Translated Date",
                                        "Target Languages",
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
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            style={{
                                                height: "200px",
                                                textAlign: "center",
                                                fontFamily: "inherit",
                                            }}
                                        >
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : tasks.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            style={{
                                                textAlign: "center",
                                                fontSize: "13px",
                                                fontFamily: "inherit",
                                            }}
                                        >
                                            No data available
                                        </TableCell>
                                    </TableRow>
                                ) : tasks && tasks.length > 0 ? (
                                    tasks.map((task) => (
                                        <TableRow key={task.task_id}>
                                            <TableCell
                                                sx={{
                                                    fontSize: "13px",
                                                    fontFamily: "inherit",
                                                }}
                                            >

                                                {task.is_error === 1 && (
                                                    <ErrorOutline
                                                        color="error"
                                                        fontSize="small"
                                                        style={{ marginRight: '8px', verticalAlign: 'middle' }}
                                                    />
                                                )}
                                                {task.name || "N/A"}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontSize: "13px",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                {task.file_type || "N/A"}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontSize: "13px",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                {formatDate(task.completion_date) || "N/A"}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontSize: "13px",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                {task.target_locale?.locale_display_name || "N/A"}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontSize: "13px",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                {renderStatusChips(task.state)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No tasks found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
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
                        component="div"
                        count={totalRecords}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </Box>
            </Box>
        </Modal>
    );
};

export default TaskListModal;
