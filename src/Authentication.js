import EventEmitter from 'events';
import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';

class Authentication extends EventEmitter {

    constructor() {
        super();

        if (!Authentication.instance) {
            this.CLIENT_ID = '4chd2bq9ej1hhj4g4fec19d45q';
            this.USER_POOL_ID = 'us-east-1_sWqdolC7R';
            this.REDIRECT_URI = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

            this.userWithLoginChallenge = undefined;

            this.configureAmplify();

            Authentication.instance = this;
        }

        return Authentication.instance;
    };

    configureAmplify() {
        Amplify.configure({
            Auth: {
                region: 'us-east-1',
                userPoolId: this.USER_POOL_ID,
                userPoolWebClientId: this.CLIENT_ID,
                mandatorySignIn: true,
                authenticationFlowType: 'USER_SRP_AUTH',
                oauth: {
                    domain: 'isun-dashboard',
                    scope: ['email', 'profile', 'openid'],
                    redirectSignIn: this.REDIRECT_URI,
                    redirectSignOut: this.REDIRECT_URI,
                    responseType: 'code'
                }
            }
        });
    };

    async getAuthSessionAndRefreshWhenRefreshTokenIsValid() {
        let session = undefined;
        try {
            session = await Auth.currentSession();
        } catch (error) {
            console.error('Could not retrieve Cognito auth session');
            throw error;
        }

        if (!session) {
            throw new Error('No valid session available');
        }

        return session;
    };

    async getUserName() {
        try {
            const session = await this.getAuthSessionAndRefreshWhenRefreshTokenIsValid();
            const decodedToken = session.getIdToken().decodePayload();
            return decodedToken['cognito:username'];
        } catch (error) {
            console.error('ID Token does not exist. Unknown User.');
            await this.logout(); //make sure user is logged out
            return 'Unknown User';
        }
    };

    async getUserId() {
        try {
            const session = await this.getAuthSessionAndRefreshWhenRefreshTokenIsValid();
            const decodedToken = session.getIdToken().decodePayload();
            return decodedToken['cognito:username'];
        } catch (error) {
            console.error('ID Token does not exist. Unknown User.');
            await this.logout(); //make sure user is logged out
            return undefined;
        }
    };

    /**
     *
     * @returns {string|*} either "user" or "[user, admins] for any combination of roles
     */
    async getUserRoles() {
        try {
            const session = await this.getAuthSessionAndRefreshWhenRefreshTokenIsValid();
            const decodedToken = session.getAccessToken().decodePayload();
            return decodedToken['cognito:groups'];
        } catch (error) {
            console.error('ID Token does not exist. Unknown User.');
            await this.logout(); //make sure user is logged out
            return undefined;
        }
    };

    async getBearerAuthHeader() {
        try {
            const session = await this.getAuthSessionAndRefreshWhenRefreshTokenIsValid();
            return 'Bearer ' + session.getAccessToken().getJwtToken();
        } catch (error) {
            console.error('ID Token does not exist. Unknown User.');
            await this.logout(); //make sure user is logged out
            return undefined;
        }
    };

    async login(username, password) {
        try {
            const user = await Auth.signIn(username, password);
            if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                this.userWithLoginChallenge = user;
                this.emit('changePasswordRequired', {
                    userName: user.getUsername(),
                    challenge: {challengeName: user.challengeName, challengeParam: user.challengeParam}
                });
            } else {
                this.emit('sessionStarted');
            }
        } catch (error) {
            console.log(error);
            if (error.code === 'UserNotConfirmedException') {
                // The error happens if the user didn't finish the confirmation step when signing up
                // In this case you need to resend the code and confirm the user
                // About how to resend the code and confirm the user, please check the signUp part
                // We don't expect our users to confirm their signup, so this should never happen
                console.warn(JSON.stringify(error));
            } else if (error.code === 'PasswordResetRequiredException') {
                // The error happens when the password is reset in the Cognito console
                // In this case you need to call forgotPassword to reset the password
                // Please check the Forgot Password part.
                //TODO handle this correctly!
            } else if (error.code === 'NotAuthorizedException') {
                // The error happens when the incorrect password is provided
                this.emit('authenticationRejected');
            } else if (error.code === 'UserNotFoundException') {
                // The error happens when the supplied username/email does not exist in the Cognito user pool
                this.emit('authenticationRejected');
            } else {
                this.emit('authenticationFailed');
            }

        }
    };

    async logout() {
        try {
            await Auth.signOut();
            this.emit('sessionEnded');
        } catch (error) {
            console.error('Could not log out user');
        }
    };

    async changePassword(oldPassword, newPassword, challenge) {
        try {
            if (challenge) {
                await Auth.completeNewPassword(this.userWithLoginChallenge, newPassword, {});
            } else {
                await Auth.changePassword(await Auth.currentAuthenticatedUser(), oldPassword, newPassword);
            }
            this.emit('passwordChanged');
        } catch (error) {
            console.error('Could not change password of user');
        }
    }

    async isSessionActive() {
        try {
            const session = await this.getAuthSessionAndRefreshWhenRefreshTokenIsValid();
            return session.isValid();
        } catch (error) {
            console.error('Could not get Cognito auth session.');
        }
        return false;
    };
}

const authenticationInstance = new Authentication();
Object.seal(authenticationInstance);

export default authenticationInstance;
