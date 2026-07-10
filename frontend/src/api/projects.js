import client from "./client";

export const listProjects = () => client.get("/projects").then((r) => r.data.data);
export const createProject = (payload) => client.post("/projects", payload).then((r) => r.data.data);
export const updateProject = (id, payload) =>
    client.put(`/projects/${id}`, payload).then((r) => r.data.data);
export const deleteProject = (id) => client.delete(`/projects/${id}`).then((r) => r.data.data);
