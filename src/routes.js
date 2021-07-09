import React from 'react';

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const CarPorts = React.lazy(() => import('./views/CarPorts'));
const Busstop = React.lazy(() => import('./views/Busstop'))
const CarPortAssignment = React.lazy(() => import('./views/CarPortAssignment'));
const OverviewDashboard = React.lazy(() => import('./views/OverviewDashboard'));

const routes = [
    { path: '/', exact: true, name: 'Home' },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard },
    { path: '/carports', name: 'Carports', component: CarPorts },
    { path: '/carportassignment', name: 'Car Port Assignment', component: CarPortAssignment },
    { path: '/overview', name: 'Overview', component: OverviewDashboard },
    { path: '/busstop', name: 'Bus Stop', component: Busstop },
];

export default routes;
