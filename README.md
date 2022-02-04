# podping-hivewriter on gcloud with cloud run

1. Create a secret in gcloud secret manager
   * Include the posting key for the Hive account you will be using.
2. ... TBD javascript code to run the CLI command below


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
