# podping-hivewriter on gcloud with cloud run

## Example Typescript/Javascript code

The typescript/javascript code in this repository is a reference implementation of running podping-hivewriter as an ad-hoc container to publish updates to podping.  This runs it in "write" mode.

The code will need to be adapted to your project -- make sure not to commit the AUTH_KEY to version control nor make it public in any way.

0. Optionally create a new project in GCP.  All of the resources below should be in the same project.  Whatever project you use, find the project ID and fill in the `PROJECT_ID` variable
   * Enable the "Cloud Run" API
1. Create a secret in the GCP secret manager, by default we call it "hive-posting-key".  If you use a different name, fill it in the `PODPING_HIVE_POSTING_KEY_SECRET_NAME` variable
   * Include the posting key for the Hive account you will be using.
2. Create a service account, copy the email address to `SERVICE_ACCOUNT`
   * Give it the "Service Account User" role
   * Generate a new Key as JSON, download the file, and copy the contents to `AUTH_KEY`.  
3. Go to IAM and edit the new service account you created.  Ensure it has the following roles:
   * "Service Account User"
   * "Cloud Run Admin"
   * "Secret Manager Secret Accessor"
4. Fill in `PODPING_HIVE_ACCOUNT` with your own Hive account
5. Test


## Example CLI command

This is an example gcloud cli command to do the above.  You will need to replace the service-account, hive account, secret references, and project name, and feed URLs in args.

Also remove `PODPING_LIVETEST=true` from env-vars once you're ready to go to prod

```bash
gcloud run deploy podping-hivewriter \
    --async \
    --no-allow-unauthenticated \
    --memory=256Mi \
    --no-use-http2 \
    --cpu-throttling \
    --platform=managed \
    --region=us-central1 \
    --project=proud-climber-340004 \
    --image=us.gcr.io/proud-climber-340004/podping-hivewriter \
    --service-account=proud-climber-340004@appspot.gserviceaccount.com \
    --set-env-vars=PODPING_LIVETEST=true,PODPING_HIVE_ACCOUNT=podping.test,PODPING_IGNORE_CONFIG_UPDATES=true,PODPING_SANITY_CHECK=false,PODPING_MEDIUM=podcast,PODPING_REASON=live \
    --set-secrets=PODPING_HIVE_POSTING_KEY=hive-posting-key:latest \
    --args=write,https://www.example.com/feed.xml,https://some.new.podcast.live/feed.xml,http://insecure.example.com/new-feed.xml
```


## Pulling the image into your own container registry

I had to do this, but you probably don't need to since I made mine publicly available.

1. Install docker (or equivalent like podman on linux)
2. [Install the gcloud cli and log in](https://cloud.google.com/sdk/docs/install)
3. [Log into gcloud container registry](https://cloud.google.com/container-registry/docs/advanced-authentication#prereqs)
   * This is what I used for `podman`: https://stackoverflow.com/questions/63790529/authenticate-to-google-container-registry-with-podman
4. Pull the latest podping-hivewriter image from docker hub:
   ```bash
   docker pull docker.io/podcastindexorg/podping-hivewriter
   ```
5. Tag the podping-hivewriter image for your own repository:
   ```bash
   docker tag docker.io/podcastindexorg/podping-hivewriter [asia.,eu.,us.]gcr.io/[your-gcloud-project]/podping-hivewriter
   ```
6. Push the podping-hivewriter image to your own repository:
     ```bash
     [asia.,eu.,us.]gcr.io/[your-gcloud-project]/podping-hivewriter
     ```
7. Optionally make the repository "public" in the "Settings" on the left, if you want others to use your image.
