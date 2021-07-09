import React from "react";
import { Card, CardBody, CardTitle, Col, Row, UncontrolledTooltip } from "reactstrap";
import InfoIcon from "@material-ui/icons/Info";
import { ReactComponent as Humidity } from "../../assets/img/humidity.svg";
import { ReactComponent as Thermometer } from "../../assets/img/thermometer.svg";
import variables from "../../scss/_variables.scss";
import moment from "moment";
import { useTranslation } from "react-i18next";

const WeatherCard = (props) => {
    const {t} = useTranslation();
    return (
        <Card className={"h-100"} style={{ borderRadius: "25px" }}>
            <CardBody>
                <CardTitle className="text-value">
                    <Row className=".d-flex">
                        <Col xs="10">{t('Weather.Title')}</Col>
                        <Col xs="2">
                            <InfoIcon className="d-block float-right position-relative" id="WeatherInfo" />
                        </Col>
                        <UncontrolledTooltip placement="right" target="WeatherInfo">
                            {t('Weather.Tooltip')}
                        </UncontrolledTooltip>
                    </Row>
                </CardTitle>
                {(props.humidity && props.temperature) && (
                    <>
                    <div style={{ height: "140px", fontSize: "27px" }} className={"d-block"}>
                        <Row className={"h-50 d-flex"}>
                            <Col>
                                <Thermometer
                                    fill={variables.iSunOrange}
                                    height="100%"
                                    width="100%"
                                    style={{ position: "absolute" }}
                                />
                            </Col>
                            <Col style={{ fontSize: "100%", alignSelf: "center" }}>
                                {Math.round(props.temperature.value)} ºC
                            </Col>
                        </Row>
                        <Row className={"h-50 d-flex mt-3"}>
                            <Col>
                                <Humidity
                                    fill={variables.iSunLightGrey}
                                    height="100%"
                                    width="100%"
                                    style={{ position: "absolute" }}
                                />
                            </Col>
                            <Col style={{ fontSize: "100%", alignSelf: "center" }}>{Math.round(props.humidity.value)} %</Col>
                        </Row>
                    </div>
                    </>
                    )}
            </CardBody>
            {(props.humidity && props.temperature) && <small className="text-muted ml-3">{t('LastUpdated.Text')} {moment(props.temperature.createdAt).fromNow()}</small>
            }
            {!(props.humidity && props.temperature) && (
                <div
                    style={{
                        fontSize: "18px",
                        display: "flex",
                        justifyContent: "center",
                        height: "140px",
                    }}
                >
                    {t('NoDataAvailable')}
                </div>
            )}
        </Card>
    );
};

export default WeatherCard;
