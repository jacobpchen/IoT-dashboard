import React, { Component } from "react";
import { Card, CardBody } from "reactstrap";

class MessageCard extends Component {
    render() {
        return (
            <div>
                <Card>
                    <CardBody>
                        <div className={"d-flex flex-column justify-content-center align-items-center"}>
                            <p><strong>{this.props.title}</strong></p>
                            <p>{this.props.message}</p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        )
    }
}

export default MessageCard