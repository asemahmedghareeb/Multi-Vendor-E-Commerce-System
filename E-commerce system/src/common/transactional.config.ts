import { DataSource } from 'typeorm';
import { initializeTransactionalContext, addTransactionalDataSource, StorageDriver } from 'typeorm-transactional';

const dataSource = new DataSource({
	type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.POSTGRES_PORT!, 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,

});


initializeTransactionalContext({ storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE });
addTransactionalDataSource(dataSource);
