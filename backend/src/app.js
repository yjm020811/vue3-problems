const Koa = require("koa");
const Router = require("koa-router");
const koaBody = require("koa-body");
const fs = require("fs-extra");
const path = require("path");
const cors = require("koa2-cors"); // 引入 CORS 中间件

const app = new Koa();
const router = new Router();

// 定义目录
const UPLOAD_DIR = path.resolve(__dirname, "upload/temp"); // 临时目录
const FINAL_DIR = path.resolve(__dirname, "../public"); // 合并后文件目录

// 初始化目录
fs.ensureDirSync(UPLOAD_DIR);
fs.ensureDirSync(FINAL_DIR);

// 允许跨域
app.use(
  cors({
    origin: "*", // 允许所有域名
    methods: ["GET", "POST", "PUT", "DELETE"], // 允许的 HTTP 方法
    allowedHeaders: ["Content-Type", "Authorization", "Accept"] // 允许的请求头
  })
);

// 上传单个切片接口
router.post(
  "/upload",
  koaBody({
    multipart: true,
    formidable: {
      // 设置上传目录，防止默认的/tmp目录不存在
      uploadDir: UPLOAD_DIR,
      // 保持文件后缀
      keepExtensions: true,
      multiples: true,
      maxFileSize: 200 * 1024 * 1024,
      onFileBegin: (name, file) => {
        console.log("File upload starting:", name, file);
      }
    },
    onError: (err) => {
      console.error("koa-body error:", err);
    }
  }),
  async (ctx) => {
    // 添加调试日志
    console.log("Request body:", ctx.request.body);
    console.log("Request files:", ctx.request.files);

    const { chunkIndex, totalChunks, fileName } = ctx.request.body;
    const file = ctx.request.files?.file;

    console.log("File object:", file);
    if (file) {
      console.log("File properties:", {
        path: file.path,
        filepath: file.filepath,
        name: file.name,
        size: file.size
      });
    }

    // 更严格的错误检查
    if (!file) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "No file uploaded"
      };
      return;
    }

    if (!fileName) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "fileName is required"
      };
      return;
    }

    if (chunkIndex === undefined) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "chunkIndex is required"
      };
      return;
    }

    try {
      const fileDir = path.join(UPLOAD_DIR, fileName);
      await fs.ensureDir(fileDir);

      const filePath = file.filepath || file.path;
      if (!filePath) {
        throw new Error("No valid file path found");
      }

      const destPath = path.join(fileDir, `${chunkIndex}`);
      await fs.move(filePath, destPath);

      ctx.body = {
        success: true,
        message: `Chunk ${chunkIndex} uploaded.`
      };
    } catch (error) {
      console.error("Upload error:", error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: "Upload failed",
        error: error.message
      };
    }
  }
);

// 合并切片接口
router.post("/upload/merge", koaBody(), async (ctx) => {
  const { fileName } = ctx.request.body;

  const fileDir = path.join(UPLOAD_DIR, fileName); // 切片存放目录
  const finalFilePath = path.join(FINAL_DIR, fileName); // 最终文件存储路径

  if (!fs.existsSync(fileDir)) {
    ctx.status = 400;
    ctx.body = { success: false, message: "No chunks found for merging." };
    return;
  }

  // 获取切片文件并排序（确保顺序合并）
  const chunkFiles = await fs.readdir(fileDir);
  chunkFiles.sort((a, b) => Number(a) - Number(b));

  // 合并切片文件
  const writeStream = fs.createWriteStream(finalFilePath);
  for (const chunkFile of chunkFiles) {
    const chunkPath = path.join(fileDir, chunkFile);
    const data = await fs.readFile(chunkPath);
    writeStream.write(data);
    await fs.remove(chunkPath); // 删除已合并的切片
  }
  writeStream.end();

  // 删除切片目录
  await fs.remove(fileDir);

  ctx.body = {
    success: true,
    message: "File merged successfully.",
    filePath: `/public/${fileName}`
  };
});

// 注册路由
app.use(router.routes()).use(router.allowedMethods());

// 启动服务
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
