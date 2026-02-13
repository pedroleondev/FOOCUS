# POP: Deploy Automatizado com Docker + Traefik

## Objetivo
Padronizar o processo de containerização e deploy de aplicações React/Vite usando Docker, Traefik e Docker Hub.

## Quando Usar
- Novos projetos React/Vite/Node.js
- Atualizações de imagem Docker
- Deploy em servidores com Portainer + Traefik

## Pré-requisitos
- Docker instalado e configurado
- Acesso ao Docker Hub (`docker login`)
- Repositório criado no Docker Hub
- Servidor com Portainer e Traefik configurados
- Network `metagente-net` existente no swarm

## Estrutura de Arquivos

### 1. Dockerfile (Multi-stage)
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2. nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 3. docker-compose.yaml (Template)
```yaml
version: "3.7"

services:
  {nome_app}:
    image: {dockerhub_user}/{nome_app}:latest
    networks:
      - metagente-net
    environment:
      - VITE_SUPABASE_URL={supabase_url}
      - VITE_SUPABASE_ANON_KEY={supabase_key}
      - VITE_GEMINI_API_KEY={gemini_key}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.{nome_app}.rule=Host(`{dominio}`)
        - traefik.http.routers.{nome_app}.entrypoints=websecure
        - traefik.http.routers.{nome_app}.tls.certresolver=letsencryptresolver
        - traefik.http.services.{nome_app}.loadbalancer.server.port=80
        - traefik.http.services.{nome_app}.loadbalancer.passHostHeader=true

networks:
  metagente-net:
    external: true
```

**Variáveis a substituir:**
- `{nome_app}`: Nome da aplicação (ex: foocus, flow-state)
- `{dockerhub_user}`: Usuário do Docker Hub (ex: pedroleonpython)
- `{dominio}`: Domínio configurado no DNS (ex: foocus.metagente360.cloud)
- `{supabase_url}`: URL do projeto Supabase
- `{supabase_key}`: Chave anônima do Supabase
- `{gemini_key}`: Chave da API Gemini (se necessário)

## Pipeline de Deploy

### Passo 1: Criar/Atualizar Arquivos
```bash
# Criar Dockerfile, nginx.conf e docker-compose.yaml
# (Usar templates acima com substituições)
```

### Passo 2: Build da Imagem
```bash
docker build -t {dockerhub_user}/{nome_app}:latest .
```

### Passo 3: Push para Docker Hub
```bash
# Verificar login
docker login

# Push da imagem
docker push {dockerhub_user}/{nome_app}:latest
```

### Passo 4: Deploy no Portainer
1. Acessar Portainer → Stacks → Add Stack
2. Nome: `{nome_app}`
3. Copiar conteúdo do `docker-compose.yaml`
4. Deploy the stack

## Verificação
- Verificar se o container está rodando: `docker ps`
- Verificar logs: `docker logs {nome_app}`
- Acessar URL: `https://{dominio}`

## Troubleshooting

### Push negado
```bash
# Fazer login no Docker Hub
docker login
# Usar username e access token (não senha)
```

### Container não inicia no Portainer
- Verificar se a imagem existe no Docker Hub
- Verificar se a network `metagente-net` existe
- Verificar logs no Portainer

### Erro 502 Bad Gateway
- Verificar se o Traefik está rodando
- Verificar labels do docker-compose
- Verificar se o DNS está apontando corretamente

## Checklist
- [ ] Dockerfile criado
- [ ] nginx.conf criado
- [ ] docker-compose.yaml criado com domínio correto
- [ ] Repositório Docker Hub criado
- [ ] Docker login realizado
- [ ] Build executado com sucesso
- [ ] Push executado com sucesso
- [ ] Stack criada no Portainer
- [ ] Aplicação acessível via HTTPS

## Notas
- Sempre usar `node:20-alpine` para build (imagem leve)
- Sempre usar `nginx:alpine` para produção
- Network `metagente-net` deve ser criada previamente no swarm
- Certificados SSL automáticos via Let's Encrypt (Traefik)
- Variáveis de ambiente devem ser passadas no docker-compose
