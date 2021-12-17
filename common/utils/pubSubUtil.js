/**
 * Created by gunucklee on 2021. 09 10.
 */
const {PubSub} = require('@google-cloud/pubsub');
module.exports = {
    quickstart: async function(filename) {
        // Imports the Google Cloud client library
        const projectId = 'herbee-4bf6c'; // Your Google Cloud Platform project ID
        const topicName = 'projects/herbee-4bf6c/topics/subscribe'; // Name for the new topic to create
        const subscriptionName = 'projects/herbee-4bf6c/subscriptions/subscribe'; // Name for the new subscription to create

        // Instantiates a client
        const pubsub = new PubSub({projectId});

        // Creates a new topic
        const [topic] = await pubsub.createTopic(topicName);
        console.log(`Topic ${topic.name} created.`);

        // Creates a subscription on that new topic
        const [subscription] = await topic.createSubscription(subscriptionName);

        // Receive callbacks for new messages on the subscription
        subscription.on('message', message => {
            console.log('Received message:', message.data.toString());
            process.exit(0);
        });

        // Receive callbacks for errors on the subscription
        subscription.on('error', error => {
            console.error('Received error:', error);
            process.exit(1);
        });

        // Send a message to the topic
        topic.publish(Buffer.from('Test message!'));

    },
}
