import React, { Component } from "react";
import { Card, CardBody, Spinner } from "reactstrap";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { withTranslation } from "react-i18next";

class LoadingCard extends Component {

    render() {
        return (
            <div>
                <ToastContainer />
                <Card>
                    <CardBody>
                        <div className={"d-flex flex-column justify-content-center  align-items-center"}>
                            <span className="sr-only">{this.props.text ? this.props.text : this.props.t('Loading.LoadingData')}</span>
                            <Spinner animation="border border-sm" role="status"/>
                            <strong>{this.props.text ? this.props.text : this.props.t('Loading.LoadingData')}</strong>
                        </div>
                    </CardBody>
                </Card>
            </div>
        )
    }
}

export default withTranslation()(LoadingCard);