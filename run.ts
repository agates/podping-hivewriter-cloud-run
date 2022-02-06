import run from '@googleapis/run'


const SERVICE_ACCOUNT = 'podping-hivewriter-trigger@proud-climber-340004.iam.gserviceaccount.com'  // this is a service account you create, replace this
const AUTH_KEY = {
    // fill this in with a JSON key from your gcp service account
}
const PROJECT_ID = 'proud-climber-340004'  // this is your GCP project ID, replace this
const REGION = 'us-central1'  // run this wherever you want
const SERVICE_NAME = 'podping-hivewriter'  // this is the name of the service this will create/update in Cloud Run.  can be anything
const CONTAINER_IMAGE = "us.gcr.io/proud-climber-340004/podping-hivewriter"  // only replace this if you pulled in your own image
const PODPING_HIVE_ACCOUNT = "podping.test"  // this is your own hive account, replace this
const PODPING_MEDIUM = "podcast"
const PODPING_REASON = "live"
const PODPING_HIVE_POSTING_KEY_SECRET_NAME = "hive-posting-key" // this is the name of a secret in the same project as above, you can use this name or make your own
const PODPING_LIVETEST = "true"  // turn this to "false" when ready to go to prod


const feeds = ["https://www.example.com/test-feed.xml"]
  

runPodpingHivewriterContainer(
    AUTH_KEY,
    SERVICE_ACCOUNT,
    PROJECT_ID,
    REGION,
    SERVICE_NAME,
    CONTAINER_IMAGE,
    PODPING_HIVE_ACCOUNT,
    PODPING_HIVE_POSTING_KEY_SECRET_NAME,
    PODPING_MEDIUM,
    PODPING_REASON,
    PODPING_LIVETEST,
    feeds
)

async function runPodpingHivewriterContainer(
    authKey: any,
    serviceAccount: string,
    projectId: string,
    region: string,
    serviceName: string,
    containerImage: string,
    hiveAccount: string,
    hivePostingKeySecretName: string,
    medium: string,
    reason: string,
    testMode: string,
    feeds: string[]) {
    const auth = new run.auth.GoogleAuth({
        credentials: authKey,
          // Scopes can be specified either as an array or as a single, space-delimited string.
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
    const authClient = await auth.getClient();

    const runClient = run.run({
        version: 'v1',
        auth: authClient,
    })

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
    }

    try {
        const createResponse = await runClient.projects.locations.services.create({
            parent: `projects/${projectId}/locations/${region}`,
            requestBody
        })
    }
    catch (e: any) {
        // 409 conflict response indicates the service already exists.  Replace it
        if (e.code === 409) {
            const replaceResponse = runClient.projects.locations.services.replaceService({
                name: `projects/${projectId}/locations/${region}/services/${serviceName}`,
                requestBody
            })
        }
    }
}


// v2 version of create ceall -- not yet enabled on gcp api?  Simpler than the above
/*const createResponse = await runClient.projects.locations.services.create({
    parent: `projects/${projectId}/locations/${region}`,
    serviceId: serviceName,
    requestBody: {
        //name: serviceName,
        template: {
            serviceAccount: serviceAccount,
            containers: [{
                image: "us.gcr.io/proud-climber-340004/podping-hivewriter",
                resources: { limits: { memory: "256m" } },
                env: [
                    {
                        name: "PODPING_LIVETEST",
                        value: "true"
                    },
                    {
                        name: "PODPING_HIVE_ACCOUNT",
                        value: "podping.test"
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
                        value: "podcast"
                    },
                    {
                        name: "PODPING_REASON",
                        value: "live"
                    },
                    {
                        name: "PODPING_HIVE_POSTING_KEY",
                        valueSource: { secretKeyRef: { secret: `projects/${projectId}/secrets/hive-posting-key` } }
                    },
                ],
                args: [
                    "write",
                    "https://www.example.com/feed.xml",
                    "https://some.new.podcast.live/feed.xml",
                    "http://insecure.example.com/new-feed.xml"
                ]
            }]
        }
    }
})*/