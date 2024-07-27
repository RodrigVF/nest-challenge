# Repositório Base para Projetos em Nest.js

## Como Testar Localmente

1. Configurar um arquivo `.env` com base no `.env.development`
2. Executar os comandos a seguir no terminal:
    ```sh
    npm i
    services:up
    npm run start:dev
    ```

## Comandos para Configurar Ambiente (Ubuntu/DigitalOcean)

1. Atualizar e instalar dependências:
    ```sh
    sudo apt update && sudo apt upgrade -y
    sudo apt install nodejs npm -y
    ```

2. Instalar Docker:
    ```sh
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker username
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.10.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    docker --version
    docker-compose --version
    ```

3. Clonar o repositório e configurar:
    ```sh
    git clone nest-challenge
    cd nest-challenge

    # Configurar o .env
    ```

4. Iniciar os serviços e a aplicação:
    ```sh
    services:up
    npm i
    npm run start
    ```

## Observação

Caso o Kafka não esteja iniciando, pode ser necessário editar o `compose.yaml` para limitar a memória do Kafka conforme o exemplo:

```yaml
kafka:
  image: wurstmeister/kafka:latest
  environment:
    KAFKA_BROKER_ID: 1
    KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
    KAFKA_ADVERTISED_LISTENERS: INSIDE://kafka:9093,OUTSIDE://localhost:7075
    KAFKA_LISTENERS: INSIDE://0.0.0.0:9093,OUTSIDE://0.0.0.0:7075
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: INSIDE:PLAINTEXT,OUTSIDE:PLAINTEXT
    KAFKA_INTER_BROKER_LISTENER_NAME: INSIDE
    KAFKA_HEAP_OPTS: "-Xmx512M -Xms512M"  # Limitar o uso de memória do Kafka
  ports:
    - "7075:7075"
  depends_on:
    - zookeeper
```