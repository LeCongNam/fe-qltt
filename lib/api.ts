import axios from "axios"

export const apiClient = axios.create({
  baseURL: "/backend",
  headers: {
    "Content-Type": "application/json",
  },
})