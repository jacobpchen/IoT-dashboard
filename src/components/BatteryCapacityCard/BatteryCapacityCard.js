import React from "react";
import { Card, CardBody, CardTitle, Col, Row, UncontrolledTooltip } from "reactstrap";
import InfoIcon from "@material-ui/icons/Info";
import BatteryIndicator from "./BatteryIndicator/BatteryIndicator";
import { useTranslation } from "react-i18next";

const BatteryCapacityCard = (props) => {
    const {t} = useTranslation();
    return (
        <Card className={"h-100"} style={{ borderRadius: "25px" }}>
            <CardBody className={"pb-0"}>
                <CardTitle className="text-value">
                    <Row className=".d-flex">
                        <Col xs="10">
                            <span>{t('BatteryCapacity.Title')}</span>
                        </Col>
                        <Col xs="2">
                            <InfoIcon className="d-block float-right position-relative" id="BatteryCapacityInfo" />
                        </Col>
                    </Row>
                    <UncontrolledTooltip placement="right" target="BatteryCapacityInfo">
                        {t('BatteryCapacity.Tooltip')}
                    </UncontrolledTooltip>
                </CardTitle>
                {
                    props.percentage &&
                    <BatteryIndicator percentage={props.percentage} />
                }
            </CardBody>
            {!(props.percentage) ? (
                <div style={{
                    fontSize: "18px",
                    display: "flex",
                    justifyContent: "center",
                    height: "140px",
                }}
                >
                    {t('NoDataAvailable')}
                </div>
            ): (
                <small className="text-muted ml-3">{t('LastUpdated.Text')} N/A</small>
            )}
        </Card>
    );
};

export default BatteryCapacityCard;
