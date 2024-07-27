
import { Kafka, logLevel } from 'kafkajs';

const kafka = new Kafka({
 clientId: 'nest-challenge',
 brokers: ['localhost:7075'],
 logLevel: logLevel.ERROR,
});

export const kafkaProducer = kafka.producer();
export const kafkaConsumer = kafka.consumer({ groupId: 'our-group' });