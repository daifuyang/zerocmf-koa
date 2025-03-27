// 注册插件
import Article from "@/plugins/article";
import Mbcrm from "@/plugins/mbcrm";

export default function registerPlugins(app: any) {
  Article(app);
  Mbcrm(app);
}
