import { api, unwrap, type QueryOf, type Schemas } from "@/lib/api"

export const phieuMuonApi = {
  list: (query: QueryOf<"/phieu-muon">) => api.GET("/phieu-muon", { params: { query } }).then(unwrap),
  detail: (maPhieu: string) => api.GET("/phieu-muon/{maPhieu}", { params: { path: { maPhieu } } }).then(unwrap),
  create: (body: Schemas["TaoPhieuMuonDto"]) => api.POST("/phieu-muon", { body }).then(unwrap),
  huy: (maPhieu: string) => api.POST("/phieu-muon/{maPhieu}/huy", { params: { path: { maPhieu } } }).then(unwrap),
}
