import client from "./client";

export const createReport = (payload) => client.post("/reports", payload).then((r) => r.data.data);
export const listMyReports = (params) =>
    client.get("/reports/me", { params }).then((r) => r.data.data);
export const getReport = (id) => client.get(`/reports/${id}`).then((r) => r.data.data);
export const updateReport = (id, payload) =>
    client.put(`/reports/${id}`, payload).then((r) => r.data.data);
export const submitReport = (id) => client.patch(`/reports/${id}/submit`).then((r) => r.data.data);
export const deleteReport = (id) => client.delete(`/reports/${id}`).then((r) => r.data.data);

// Manager only
export const listReports = (params) => client.get("/reports", { params }).then((r) => r.data.data);
export const getTeamStatus = (params) =>
    client.get("/reports/team-status", { params }).then((r) => r.data.data);
