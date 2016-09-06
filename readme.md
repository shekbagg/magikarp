# Meteor Vote App

## Configure Social Login apps

### Facebook
Visit [https://developers.facebook.com](https://developers.facebook.com)  and set up an app with the Site URL set to http://localhost:3000/. Create a file called `private/local-settings.json` with App ID and App Secret of your Facebook app. See `local-settings.json.example` for a template.

### Twitter

1. Visit [https://dev.twitter.com/apps/new](https://dev.twitter.com/apps/new).
2. Set Callback URL to: http://127.0.0.1:3000/_oauth/twitter
3. Select "Create your Twitter application".
4. On the Settings tab, enable "Allow this application to be used to Sign in with Twitter" and click "Update settings".
5. Switch to the "Keys and Access Tokens" tab. Enter values into `private/local-settings.json`.

### Google
1. Visit https://code.google.com/apis/console/
2. "Create Project", if needed. Wait for Google to finish provisioning.
3. On the left sidebar, go to "APIs & auth" and, underneath, "Consent Screen". Make sure to enter a product name, and save.
4. On the left sidebar, go to "APIs & auth" and then, "Credentials". "Create New Client ID", then select "Web application" as the type.
5. Set Authorized Javascript Origins to: http://localhost:3000/
6. Set Authorized Redirect URI to: http://localhost:3000/_oauth/google
7. Finish by clicking "Create Client ID". Enter values into `private/local-settings.json`.


### Set Admins
To grant certain user administrative access, add their Facebook ID in an array in `private/admins.json`. See `admins.json.example` for a template. To find an account Facebook ID, visit [FindMyFacebookId.com](http://findmyfacebookid.com/).

## Build

### Local development

```
$ meteor --settings private/local-settings.json
```

Your app will now be running at [http://localhost:3000](http://localhost:3000).

### Deploy

Create Facebook and Twitter apps for production environment. Create file at `private/prod-settings.json` with those app credentials.

```
$ meteor deploy YOURAPP.meteor.com --settings private/prod-settings.json
```

For more deployment options, see [http://docs.meteor.com/#/full/deploying](http://docs.meteor.com/#/full/deploying).

## Todo
- [x] Add Twitter login
- [x] Add Google login
- [x] Hide results from user until all their votes have been cast
- [x] Show Admins all users who have cast votes (to discourage users from voting from multiple accounts)
- [x] Make ability to vote _against_ something adminable

