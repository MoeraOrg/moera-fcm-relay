# FCM Relay For Moera Mobile Clients

## Resources

* Live network: https://web.moera.org
* Read more about Moera at https://moera.org
* Bugs and feature requests: https://github.com/MoeraOrg/moera-issues/issues

## Installation instructions

1. As prerequisites, you need to have Node.js 18+ and PostgreSQL 9.6+
   installed. In all major Linux distributions, you can install them from
   the main package repository.
2. Create a PostgreSQL user `<username>` with password `<password>` and
   an empty database `<dbname>` owned by this user (see
   [detailed instructions][1]).
3. Go to the project root.
4. Copy `.env` file to `.env.local` and fill database credentials in `DATABASE`
   variable.
5. Put a correct `moera-client-android-firebase-account.json` file to etc/
   subdirectory under the project root. It is the Firebase service account
   private key that you need to download from the Firebase console.
5. By default, the server runs on port 8101. If you want it to run on a
   different port, set the `PORT` variable in `.env.local` accordingly.
6. Run `yarn install` or `npm install`.
7. Run `yarn start` or `npm start`.

[1]: https://moera.org/administration/installation/create-db.html
