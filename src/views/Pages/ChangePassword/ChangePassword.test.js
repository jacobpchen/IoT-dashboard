import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter, withRouter} from 'react-router-dom';
import ChangePassword from './ChangePassword';

const ChangePasswordWithRouter = withRouter(ChangePassword);

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<MemoryRouter
        initialEntries={[{pathname: "/login", state: {changePasswordParameters: {user: "testuser", challenge: true}}}]}
        initialIndex={0}>
        <ChangePasswordWithRouter/>
    </MemoryRouter>, div);
    ReactDOM.unmountComponentAtNode(div);
});
