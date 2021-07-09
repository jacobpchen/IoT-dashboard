import React, { Component, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import * as router from 'react-router-dom';
import { Container } from 'reactstrap';

import {
    AppFooter,
    AppHeader,
    AppSidebar,
    AppSidebarFooter,
    AppSidebarForm,
    AppSidebarHeader,
    AppSidebarMinimizer,
    AppSidebarNav2 as AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';
import './Default.scss';
import variables from '../../scss/_variables.scss'

import Authentication from '../../Authentication';
import LoadingCard from "../../LoadingCard";
import { capitalize } from "lodash";
import { withTranslation } from "react-i18next";
import i18next from 'i18next';
import moment from 'moment';
import "moment/min/locales";

const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

class DefaultLayout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            role: "",
            isAdmin: false
        };
        moment.locale(i18next.language)
    }

    async componentDidMount() {
        try {
            const username = await Authentication.getUserName();
            const roles = await Authentication.getUserRoles();

            if (roles.indexOf('admins') > -1) {
                this.setState({ isAdmin: true });
            }
            else {
                this.setState({ isAdmin: false });
            }

            this.setState({
                username,
                role: capitalize(typeof roles === "string" ? roles : roles.join(", ")),
            });
        } catch (err) {
            console.log("Failed to get username and role");
        }
    }

    loading = () => <LoadingCard text={"Preparing page"} />;

    async signOut(e) {
        e.preventDefault();
        await Authentication.logout();
        this.props.history.push('/login');
    }

    handleLanguageChange(lang) {
        i18next.changeLanguage(lang);
        moment.locale(lang)
    }

    render() {
        const { t } = this.props;
        if (this.state.isAdmin && !navigation.items.some((item) => item.name === "Admin Settings")) {
            navigation.items.push({
                name: 'Admin Settings',
                url: '/carportassignment',
                icon: 'cil-settings',
            })
        }

        const translatedNavigation = {
            items: navigation.items.map((navigationItem, index) => {
                return { ...navigationItem, name: t(`Nav.${index}`) }
            })
        };
        return (
            <div className="app">

                 <AppHeader fixed>
                    <Suspense fallback={this.loading()}>
                        <DefaultHeader {...this.state} onLanguageChange={this.handleLanguageChange} onLogout={async (e) => await this.signOut(e)} />
                    </Suspense>
                </AppHeader> 
                <div className="app-body">
                                         <AppSidebar className="sidebar" fixed display="lg">
                        <AppSidebarHeader />
                        <AppSidebarForm />
                        <Suspense>
                            <AppSidebarNav navConfig={translatedNavigation} router={router} />
                        </Suspense>
                        <AppSidebarFooter />
                        <AppSidebarMinimizer />
                    </AppSidebar>
                    <main className="main" style={{ paddingTop: '2vh', backgroundColor: variables.busStopBackground }}>
                        <Container fluid>
                            <Suspense fallback={this.loading()}>
                                <Switch>
                                    {routes.map((route, idx) => {
                                        return route.component ? (
                                            <Route
                                                key={idx}
                                                path={route.path}
                                                exact={route.exact}
                                                name={route.name}
                                                render={props => (
                                                    <route.component {...props} />
                                                )} />
                                        ) : null;
                                    })}
                                    <Redirect from="/" to="/dashboard" />
                                </Switch>
                            </Suspense>
                        </Container>
                    </main>
                </div>
                <AppFooter>
                    <Suspense fallback={this.loading()}>
                        <DefaultFooter />
                    </Suspense>
                </AppFooter>
            </div >
        );
    }
}

export default withTranslation()(DefaultLayout);
