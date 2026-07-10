import client from "./client";

export const getSummary = (params) =>
    client.get("/dashboard/summary", { params }).then((r) => r.data.data);
export const getCharts = (params) =>
    client.get("/dashboard/charts", { params }).then((r) => r.data.data);
export const getActivity = (params) =>
    client.get("/dashboard/activity", { params }).then((r) => r.data.data);
