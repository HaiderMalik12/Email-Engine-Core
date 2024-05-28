# Email Engine Core

## Prerequisites

To run the completed project in this folder, you need the following:

- [Node.js](https://nodejs.org) installed on your development machine. If you do not have Node.js, visit the previous link for download options.
- Either a personal Microsoft account with a mailbox on Outlook.com, or a Microsoft work or school account.

If you don't have a Microsoft account, there are a couple of options to get a free account:

- You can [sign up for a new personal Microsoft account](https://signup.live.com/signup?wa=wsignin1.0&rpsnv=12&ct=1454618383&rver=6.4.6456.0&wp=MBI_SSL_SHARED&wreply=https://mail.live.com/default.aspx&id=64855&cbcxt=mai&bk=1454618383&uiflavor=web&uaid=b213a65b4fdc484382b6622b3ecaa547&mkt=E-US&lc=1033&lic=1).
- You can [sign up for the Microsoft 365 Developer Program](https://developer.microsoft.com/microsoft-365/dev-program) to get a free Microsoft 365 subscription.

## Register a web application with the Azure Active Directory admin center

1. Open a browser and navigate to the Azure Active Directory admin center. Login using a **personal account** (aka: Microsoft Account) or **Work or School Account**.

1. Select **Azure Active Directory** in the left-hand navigation, then select **App registrations** under **Manage**.

1. Select **New registration**. On the **Register an application** page, set the values as follows.

   - Set **Name** to `Email Engine Core`.
   - Set **Supported account types** to **Accounts in any organizational directory and personal Microsoft accounts**.
   - Under **Redirect URI**, set the first drop-down to `Web` and set the value to `http://localhost:3000/auth/redirect`.

1. Choose **Register**. On the **Email Engine Core** page, copy the value of the **Application (client) ID** and save it, you will need it in the next step.

1. Select **Certificates & secrets** under **Manage**. Select the **New client secret** button. Enter a value in **Description** and select one of the options for **Expires** and choose **Add**.

1. Copy the client secret value before you leave this page. You will need it in the next step.

   > [!IMPORTANT]
   > This client secret is never shown again, so make sure you copy it now.

1. Go to API permissions in your `Email Engine Core` and select the Microsoft Graph. You need to select the delegate permission option here. Please set these API permissions:
   - `User.Read,Calendars.ReadWrite,MailboxSettings.Read,Mail.Read,Mail.ReadWrite,openid,profile,offline_access`

You can search all of these permissions one by one. Please don't forget to click on the `Grant admin consent for Default Directory`

## Configure the Application

1. Rename the `example.env` file to `.env`.
2. Edit the `.env` file and make the following changes.

   1. Replace `YOUR_CLIENT_ID_HERE` with the **Application Id** you got from the App Registration Portal.
   2. Replace `YOUR_CLIENT_SECRET_HERE` with the client secret you got from the App Registration Portal.

3. In your command-line interface (CLI), navigate to the **src** directory and run the following command to install requirements.

   ```Shell
   npm install
   ```

4. Please install the ElasticSearch and Kibana and run the ElasticSearch and Kibana from your terminal
5. Please run the setup script to create indices in elasticsearch `npm run setup`
6. You need `https` to work with microsoft webhook to get the real time notification if user peroforms any action on his inbox like deleting email from outlook. Microsoft webhook works with `https`
7. Please create a new account on [ngRok](https://ngrok.com/) and install ngRok on your machine
8. Please get your config token `ngrok config add-authtoken 2eJYK7mLsTl7cX0CxOfsZNd3WnD_4LMYkGewYQ2aADSADDD` something like that and run this command in your terminal
9. Start ngRok with this command `ngrok http 3000`
10. It will give you the free ngRok url something like that `https://4372-103-167-254-72.ngrok-free.app`. Please replace it with notification url in the .env file `NOTIFICATION_URL=https://4372-103-167-254-72.ngrok-free.app/notifications`

## Run the Application

1. Run the following command in your CLI to start the application.

   ```Shell
   npm run dev
   ```

1. Open a browser and browse to `http://localhost:3000`.
