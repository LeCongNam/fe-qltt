import { api, unwrap, type Schemas } from "@/lib/api"

export const authApi = {
  login: (body: Schemas["LoginDto"]) => api.POST("/auth/login", { body }).then(unwrap),
}
