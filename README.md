# nfse-microservice

Microsserviço responsável por emissão, consulta e cancelamento de NFS-e (Nota Fiscal de Serviço Eletrônica), utilizando o padrão [GINFES](https://www.ginfes.com.br/) como provedor principal dos fluxos fiscais. Desenvolvido com [NestJS](https://nestjs.com/), o projeto integra assinatura digital, validação XML contra XSD e geração de templates com EJS.

---

## ✅ Funcionalidades

- ✔️ Emissão de RPS e Lote de RPS (Ginfes)
- ✔️ Consulta de NFS-e por número, RPS e protocolo de lote
- ✔️ Cancelamento de NFS-e
- ✔️ Validação de XML contra XSD (schema oficial da GINFES)
- ✔️ Assinatura digital de XML com certificado A1 (PFX)
- ✔️ Geração de XMLs com templates `.ejs`
- ✔️ Modo mock (simulação local de respostas SOAP)

---

## 📦 Requisitos

- Node.js = 18
- Yarn ou NPM
- `xmllint` instalado no sistema (usado via CLI)
- Certificado digital A1 (.pfx)
- Schemas `.xsd` e templates `.ejs` organizados em:
  - `src/xml/schemas/`
  - `src/xml/templates/`

---

## 🚀 Como rodar o projeto

```bash
# Instalar dependências
yarn install

# Rodar em modo desenvolvimento
yarn start:dev
````

⚙️ Variáveis de ambiente

```env
PORT=3000
USE_MOCK=true
URL_GINFES=https://homologacao.ginfes.com.br/ServiceGinfesImpl
PATH_PFX=certificado.pfx
PASS_PFX=senha123
```

🧪 Teste com Mock
- Para simular o ambiente sem enviar dados reais ao provedor:
```env
USE_MOCK=true
```
* Isso ativa os serviços de assinatura e envio SOAP simulados (MockAssinaturaService, MockSoapService).

📁 Estrutura básica

```bash
src/
├── controllers/
├── services/
├── dtos/
├── xml/
│   ├── schemas/       # Arquivos .xsd
│   └── templates/     # Templates .ejs
```