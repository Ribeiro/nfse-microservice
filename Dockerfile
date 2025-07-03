# Etapa 1: build da aplicação
FROM node:18-alpine as builder

WORKDIR /app

# Instala dependências do sistema
RUN apk add --no-cache libxml2-utils

COPY package*.json ./
RUN yarn install

COPY . .

# Gera o build do NestJS
RUN yarn build

# Etapa 2: imagem final e leve
FROM node:18-alpine

WORKDIR /app

# Instala novamente o xmllint na imagem final
RUN apk add --no-cache libxml2-utils

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env .env

EXPOSE 3000

CMD ["node", "dist/main"]
