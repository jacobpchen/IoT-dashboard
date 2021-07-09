import React, {Component} from 'react';
import {Route, Switch, Redirect, withRouter, BrowserRouter} from 'react-router-dom';
import './App.scss';
import Authentication from './Authentication';
import LoadingCard from "./LoadingCard";
import { withTranslation } from "react-i18next";
// Only inserted this comment to update dependencies, can be deleted later

// Containers
const DefaultLayout = withRouter(React.lazy(() => import('./containers/DefaultLayout')));

// Pages
const Login = withRouter(React.lazy(() => import('./views/Pages/Login')));
const Register = withRouter(React.lazy(() => import('./views/Pages/Register')));
const ChangePassword = withRouter(React.lazy(() => import('./views/Pages/ChangePassword')));
const Page404 = withRouter(React.lazy(() => import('./views/Pages/Page404')));
const Page500 = withRouter(React.lazy(() => import('./views/Pages/Page500')));

class PrivateRouteWithoutRouter extends Component {
    constructor(props) {
        super(props);

        this.state = {sessionIsActive: false, checkingSession: true};
    }

    componentDidMount() {
        Authentication.isSessionActive().then((sessionIsActive) => {
            this.setState({sessionIsActive: sessionIsActive, checkingSession: false});
        });
    }

    render() {
        const {component: Component, ...rest} = this.props;

        return (
            <Route
                {...rest}
                render={props => {
                    if (this.state.sessionIsActive) {
                        return (<Component {...props} />);
                    } else if (!this.state.checkingSession) {
                        return (<Redirect to={{
                            pathname: '/login',
                            state: {from: this.props.location}
                        }}/>);
                    }
                }}
            />
        );
    }
}

const PrivateRoute = withRouter(PrivateRouteWithoutRouter);

class App extends Component {
    loading = () => <LoadingCard text={`${this.props.t('Loading.PreparingPage')}`}/>;
    render() {
        return (
            <BrowserRouter>
                <React.Suspense fallback={this.loading()}>
                    <Switch>
                        <Route exact path="/login" name="Login Page" render={props => <Login {...props}/>}/>
                        <Route exact path="/register" name="Register Page" render={props => <Register {...props}/>}/>
                        <Route exact path="/changePassword" name="Change Password Page"
                               render={props => <ChangePassword {...props}/>}/>
                        <Route exact path="/404" name="Page 404" render={props => <Page404 {...props}/>}/>
                        <Route exact path="/500" name="Page 500" render={props => <Page500 {...props}/>}/>
                        <PrivateRoute path="/" name="Home" component={DefaultLayout}/>
                    </Switch>
                </React.Suspense>
            </BrowserRouter>
        );
    }
}

export default withTranslation()(App);
