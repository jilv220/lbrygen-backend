"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const compression = require("compression");
const port = process.env.PORT || 5000;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.use(compression());
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map