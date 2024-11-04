"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const app = (0, express_1.default)();
const port = 3000;
// Configuração do multer para upload de arquivos
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
// Serve o arquivo HTML
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "..", "index.html"));
});
// Rota para upload do arquivo ZIP
app.post("/upload", upload.single("file"), (req, res) => uploadFile(req, res));
async function uploadFile(req, res) {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    // Extrai arquivos do ZIP recebido
    const zip = new adm_zip_1.default(req.file.buffer);
    const zipEntries = zip.getEntries();
    const pdfZip = new adm_zip_1.default();
    // Convertendo os arquivos ZPL para PDF com limite de 5 por segundo
    for (const entry of zipEntries) {
        if (entry.entryName.endsWith(".zpl")) {
            const zplContent = entry.getData().toString("utf8");
            const pdfBuffer = await convertZplToPdf(zplContent);
            pdfZip.addFile(`${entry.entryName.replace(".zpl", ".pdf")}`, pdfBuffer);
        }
        if (entry.entryName.endsWith(".txt")) {
            const zplContent = entry.getData().toString("utf8");
            const pdfBuffer = await convertTxtToPdf(zplContent);
            pdfZip.addFile(`${entry.entryName.replace(".txt", ".pdf")}`, pdfBuffer);
        }
    }
    // Cria o ZIP de saída com os PDFs convertidos
    const pdfZipBuffer = pdfZip.toBuffer();
    res.set("Content-Type", "application/zip");
    res.set("Content-Disposition", "attachment; filename=converted.zip");
    res.send(pdfZipBuffer);
}
// Função para converter ZPL para PDF usando a API do Labelary
async function convertZplToPdf(zplContent) {
    const apiUrl = "http://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/";
    // Realiza a requisição para a API, respeitando o limite de 5 requisições por segundo
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const response = await axios_1.default.post(apiUrl, zplContent, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Accept: "application/pdf",
                    },
                    responseType: "arraybuffer", // Obter a resposta como um buffer
                });
                resolve(Buffer.from(response.data));
            }
            catch (error) {
                reject(error);
            }
        }, 200); // Pausa de 200ms para 5 requisições por segundo
    });
}
// Função para converter ZPL para PDF usando a API do Labelary
async function convertTxtToPdf(zplContent) {
    const apiUrl = "http://api.labelary.com/v1/printers/8dpmm/labels/4x6/";
    // Realiza a requisição para a API, respeitando o limite de 5 requisições por segundo
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const response = await axios_1.default.post(apiUrl, zplContent, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Accept: "application/pdf",
                    },
                    responseType: "arraybuffer", // Obter a resposta como um buffer
                });
                resolve(Buffer.from(response.data));
            }
            catch (error) {
                reject(error);
            }
        }, 200); // Pausa de 200ms para 5 requisições por segundo
    });
}
// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
