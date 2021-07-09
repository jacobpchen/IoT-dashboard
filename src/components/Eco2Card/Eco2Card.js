import React from "react";
import { Card, CardBody, CardTitle, Col, Row } from "reactstrap";
import InfoIcon from "@material-ui/icons/Info";
import moment from "moment";
import { useTranslation } from "react-i18next";

const Eco2Card = (props) => {
    console.log(props)
    const { t } = useTranslation();
    const getCategory = (value) => {
        switch (true) {
            case value <= 660:
                return "#00e400";
            case 660 < value && value <= 1000:
                return "#ffff00";
            case 1000 < value && value <= 1500:
                return "#ff7e00";
            case 1500 < value && value <= 2500:
                return "#ff0000";
            case 2500 < value:
                return "#99004c";
            default:
                return "#7e0023";
        }
    };
    const getMeaning = (value) => {
        switch (true) {
            case value <= 660:
                return t('AirQuality.Category.Good');
            case 660 < value && value <= 1000:
                return t('AirQuality.Category.Moderate');
            case 1000 < value && value <= 1500:
                return t('AirQuality.Category.UnhealthyForSensitiveGroups');
            case 1500 < value && value <= 2500:
                return t('AirQuality.Category.Unhealthy');
            case 2500 < value:
                return t('AirQuality.Category.VeryUnhealthy');
            default:
                return t('AirQuality.Category.Hazardous');
        }
    };
    let value
    if (props.reading) {
        value = props.reading.value;
    }
    return (
        <Card className={"h-100"} style={{ borderRadius: "25px" }}>
            <CardBody>
                <CardTitle className="text-value">
                    <Row className=".d-flex">
                        <Col xs="10">{t('Eco2.Title')}</Col>
                        {/* <Col xs="2">
                            {t('Eco2.Tooltip')}
                            <InfoIcon className="d-block float-right position-relative" id="AirQualityInfo" />
                        </Col> */}
                    </Row>

                    {/* <UncontrolledTooltip placement="right" target="AirQualityInfo">
                        {t('Eco2.Tooltip')}
                    </UncontrolledTooltip> */}
                </CardTitle>
                {/* <text>{t('Eco2.Tooltip')}</text> */}
                {props.reading && (
                    <div>
                        <svg
                            viewBox="0 0 90 50"
                            preserveAspectRatio="none"
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.1"
                        >
                            <circle
                                cx="50%"
                                cy="50%"
                                r="20"
                                stroke={getCategory(value)}
                                strokeWidth="4"
                                fill="none"
                                id="AQI"
                            />
                            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">
                                {value}
                            </text>
                            <text
                                x="70%"
                                y="75%"
                                dominantBaseline="hanging"
                                textAnchor="start"
                                style={{ font: "9px sans-serif" }}
                            >
                                {/* Add If statements to display different TextNames for each Air QualityCard */}
                                PPM
                            </text>
                        </svg>
                        {/* <UncontrolledTooltip placement="right" target="AQI">
                            {getMeaning(value)}
                        </UncontrolledTooltip> */}
                    </div>
                )}
            </CardBody>
            {!props.reading ? (
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
            ) : (
                //This Line is used to Write a small text at the bottom of the Card:
                //Can Be used for future purposes like descriptions or Comparison
                // <small className="text-muted ml-3">{t('LastUpdated.Text')} {moment(props.reading.createdAt).fromNow()}</small>
                <small className="p-2">
                    {/* {getMeaning(value)} */}
                    {t('Eco2.Tooltip')}
                </small>
            )}
        </Card>
    );
};

export default Eco2Card;
