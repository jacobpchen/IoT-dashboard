import React, {Component} from 'react';
import {UncontrolledDropdown, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem} from 'reactstrap';
import PropTypes from 'prop-types';
import {AppNavbarBrand, AppSidebarToggler} from '@coreui/react';
import logo from '../../assets/img/atlas_logo.png';
import compass from '../../assets/img/iSunOSCone.webp';
import moment from 'moment';
import variables from "../../scss/_variables.scss";
import './Default.scss';
import { withTranslation } from "react-i18next";
import "moment/min/locales";


const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timestamp: moment().valueOf(),
        };
    }
    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.setState({
            timestamp: moment().valueOf(),
        });
    }

    render() {
        // eslint-disable-next-line
        const {children, t, i18n, ...attributes} = this.props;

        return (
            <React.Fragment>
                <AppNavbarBrand
                    full={{src: logo,height: "29px", width: "120px", alt: 'iSun Energy Logo'}}
                    minimized={{src: compass, height: "30px", width: "20px",  alt: 'iSun Energy Logo'}}
                />
                <AppSidebarToggler className="d-md-down-none" display="lg"/>
                <Nav className="d-md-down-none" navbar>
                    <NavItem className="px-3" style={{fontSize: "20px", fontWeight: "bold", color: variables.iSunLightGrey}}>
                        {moment(this.state.timestamp).local().format(t('Time') )}
                    </NavItem>
                </Nav>
                <Nav className="ml-auto" navbar>
                    <UncontrolledDropdown nav direction="down">
                        <DropdownToggle nav>
                            <i className="user-icon fa fa-2x fa-user-circle-o"/>
                        </DropdownToggle>
                        <DropdownMenu right>
                            <DropdownItem header tag="div" className="text-center">
                                <strong>{this.props.username}</strong>
                                <strong> ({this.props.role})</strong>
                            </DropdownItem>
                            <DropdownItem onClick={e => this.props.onLogout(e)}><i
                                className="fa fa-lock"/>
                                Logout
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                    <UncontrolledDropdown nav direction="down">
                        <DropdownToggle nav>
                            <i className="fa fa-2x fa-globe"/>
                            <span className="language">{i18n.language.toUpperCase()}</span>
                        </DropdownToggle>
                        <DropdownMenu right>
                            <DropdownItem header tag="div">
                                {t('Language.Language')}
                            </DropdownItem>
                            <DropdownItem onClick={()=> this.props.onLanguageChange('en')}>
                                {t('Language.English')}
                            </DropdownItem>
                            <DropdownItem onClick={()=> this.props.onLanguageChange('es')}>
                                {t('Language.Spanish')}
                            </DropdownItem>
                            <DropdownItem onClick={()=> this.props.onLanguageChange('fr')}>
                                {t('Language.French')}
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </Nav>
            </React.Fragment>
        );
    }
}


DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default withTranslation()(DefaultHeader);
