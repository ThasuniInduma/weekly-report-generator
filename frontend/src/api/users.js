import client from "./client";

export const listUsers = () => client.get("/users").then((r) => r.data.data);
