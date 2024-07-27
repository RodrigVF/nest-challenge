
import { Kafka, logLevel } from 'kafkajs';
import * as dotenv from 'dotenv';

dotenv.config();

const kafka = new Kafka({
 clientId: 'nest-challenge',
 brokers: [process.env.KAFKA_BROKER],
 logLevel: logLevel.ERROR,
});

export const kafkaProducer = kafka.producer();
export const kafkaConsumer = kafka.consumer({ groupId: 'our-group' });