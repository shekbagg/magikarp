# Magikarp - Hackathon idea voting app

Curate great hackathon ideas through community upvoting

## Configure Google Login

1. Visit https://code.google.com/apis/console/
2. "Create Project", if needed. Wait for Google to finish provisioning.
3. On the left sidebar, go to "APIs & auth" and, underneath, "Consent Screen". Make sure to enter a product name, and save.
4. On the left sidebar, go to "APIs & auth" and then, "Credentials". "Create New Client ID", then select "Web application" as the type.
5. Set Authorized Javascript Origins to: http://localhost:3000/
6. Set Authorized Redirect URI to: http://localhost:3000/_oauth/google
7. Finish by clicking "Create Client ID". Enter values into `private/local-settings.json`.


## Build

### Local development

```
$ meteor --settings private/local-settings.json
```

Your app will now be running at [http://localhost:3000](http://localhost:3000).

### Deploy

Create file at `private/prod-settings.json` with those app credentials.

```
$ meteor deploy YOURAPP.meteor.com --settings private/prod-settings.json
```
