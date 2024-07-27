module.exports = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true, // In development, set to true; in production, set to false
};