import Router from "koa-router";
import { adminPrefix, apiv1 } from "@/constants/router";
import { auth } from "@/cmf/middlewares/auth";
import apiAccess from "@/cmf/middlewares/apiAccess";
import {
  createHospitalController,
  deleteHospitalController,
  getHospitalController,
  getHospitalListController,
  updateHospitalController
} from "../controller/hospital";

export default function initRouter(router) {
  const adminRouter = new Router({ prefix: apiv1 + adminPrefix });
  adminRouter.use(auth, apiAccess);
  
  // 医院管理相关路由
  adminRouter.get("/hospitals", getHospitalListController);
  adminRouter.get("/hospitals/:hospitalId", getHospitalController);
  adminRouter.post("/hospitals", createHospitalController);
  adminRouter.put("/hospitals/:hospitalId", updateHospitalController);
  adminRouter.delete("/hospitals/:hospitalId", deleteHospitalController);
  
  router.use(adminRouter.routes());
}
