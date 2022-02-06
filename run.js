import run from '@googleapis/run';
const SERVICE_ACCOUNT = 'podping-hivewriter-trigger@proud-climber-340004.iam.gserviceaccount.com';
const AUTH_KEY = {};
const PROJECT_ID = 'proud-climber-340004';
const REGION = 'us-central1';
const SERVICE_NAME = 'podping-hivewriter';
const CONTAINER_IMAGE = "us.gcr.io/proud-climber-340004/podping-hivewriter";
const PODPING_HIVE_ACCOUNT = "podping.test";
const PODPING_MEDIUM = "podcast";
const PODPING_REASON = "live";
const PODPING_HIVE_POSTING_KEY_SECRET_NAME = "hive-posting-key";
const PODPING_LIVETEST = "true";
const feeds = ["https://www.example.com/test-feed.xml"];
runPodpingHivewriterContainer(AUTH_KEY, SERVICE_ACCOUNT, PROJECT_ID, REGION, SERVICE_NAME, CONTAINER_IMAGE, PODPING_HIVE_ACCOUNT, PODPING_HIVE_POSTING_KEY_SECRET_NAME, PODPING_MEDIUM, PODPING_REASON, PODPING_LIVETEST, feeds);
async function runPodpingHivewriterContainer(authKey, serviceAccount, projectId, region, serviceName, containerImage, hiveAccount, hivePostingKeySecretName, medium, reason, testMode, feeds) {
    const auth = new run.auth.GoogleAuth({
        credentials: authKey,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const authClient = await auth.getClient();
    const runClient = run.run({
        version: 'v1',
        auth: authClient,
    });
    const requestBody = {
        apiVersion: "serving.knative.dev/v1",
        kind: "Service",
        metadata: {
            name: serviceName,
        },
        spec: {
            template: {
                spec: {
                    serviceAccountName: serviceAccount,
                    containers: [{
                            image: containerImage,
                            resources: { limits: { memory: "256Mi" }, requests: { memory: "150Mi" } },
                            env: [
                                {
                                    name: "PODPING_LIVETEST",
                                    value: testMode
                                },
                                {
                                    name: "PODPING_HIVE_ACCOUNT",
                                    value: hiveAccount
                                },
                                {
                                    name: "PODPING_IGNORE_CONFIG_UPDATES",
                                    value: "true"
                                },
                                {
                                    name: "PODPING_SANITY_CHECK",
                                    value: "false"
                                },
                                {
                                    name: "PODPING_MEDIUM",
                                    value: medium
                                },
                                {
                                    name: "PODPING_REASON",
                                    value: reason
                                },
                                {
                                    name: "PODPING_HIVE_POSTING_KEY",
                                    valueFrom: { secretKeyRef: { name: hivePostingKeySecretName, key: "latest" } }
                                },
                            ],
                            args: [
                                "write",
                                ...feeds
                            ]
                        }]
                }
            }
        }
    };
    try {
        const createResponse = await runClient.projects.locations.services.create({
            parent: `projects/${projectId}/locations/${region}`,
            requestBody
        });
    }
    catch (e) {
        if (e.code === 409) {
            const replaceResponse = runClient.projects.locations.services.replaceService({
                name: `projects/${projectId}/locations/${region}/services/${serviceName}`,
                requestBody
            });
        }
    }
}
//# sourceMappingURL=run.js.map