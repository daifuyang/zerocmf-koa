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
import {
  createCustomerController,
  getCustomerController,
  getCustomerListController,
  updateCustomerController,
  deleteCustomerController
} from "../controller/customer";

export default function initRouter(router) {
  const adminRouter = new Router({ prefix: apiv1 + adminPrefix });
  adminRouter.use(auth, apiAccess);
  
  // 医院管理相关路由
  adminRouter.get("/hospitals", getHospitalListController);
  adminRouter.get("/hospitals/:hospitalId", getHospitalController);
  adminRouter.post("/hospitals", createHospitalController);
  adminRouter.put("/hospitals/:hospitalId", updateHospitalController);
  adminRouter.delete("/hospitals/:hospitalId", deleteHospitalController);

  // 客户管理相关路由
  adminRouter.get("/customers", getCustomerListController);
  adminRouter.get("/customers/:customerId", getCustomerController);
  adminRouter.post("/customers", createCustomerController);
  adminRouter.put("/customers/:customerId", updateCustomerController);
  adminRouter.delete("/customers/:customerId", deleteCustomerController);
  
  router.use(adminRouter.routes());
}
