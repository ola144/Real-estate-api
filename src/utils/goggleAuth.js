const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOGGLE_CLIENT_ID);

exports.verifyGoogleToken = async (credential) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOGGLE_CLIENT_ID,
  });

  return ticket.getPayload();
};
