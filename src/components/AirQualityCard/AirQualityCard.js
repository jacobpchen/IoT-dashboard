import React from "react";
import { Card, CardBody, CardTitle, Col, Row, UncontrolledTooltip } from "reactstrap";
import InfoIcon from "@material-ui/icons/Info";
import moment from "moment";
import { useTranslation } from "react-i18next";
import variables from '../../scss/_variables.scss'

const AirQualityCard = (props) => {
    const { t } = useTranslation();
    const getAQICategory = (aqiValue) => {
        switch (true) {
            case aqiValue <= 50:
                return "#00e400";
            case 50 < aqiValue && aqiValue <= 100:
                return "#ffff00";
            case 100 < aqiValue && aqiValue <= 150:
                return "#ff7e00";
            case 150 < aqiValue && aqiValue <= 200:
                return "#ff0000";
            case 200 < aqiValue && aqiValue <= 300:
                return "#99004c";
            default:
                return "#7e0023";
        }
    };

    const microgramsToAQIConversion = (microgramLowConc, microgramHighConc, aqiLow, aqiHigh, currentConcentration) => {
        return Math.round(
            ((aqiHigh - aqiLow) / (microgramHighConc - microgramLowConc)) * (currentConcentration - microgramLowConc) +
            aqiLow
        );
    };

    const getAQIValue = (reading) => {
        switch (true) {
            case reading < 12.1:
                return microgramsToAQIConversion(0.0, 12.0, 0, 50, parseFloat(reading).toFixed(1));
            case 12.1 <= reading && reading < 35.5:
                return microgramsToAQIConversion(12.1, 35.4, 51, 100, parseFloat(reading).toFixed(1));
            case 35.5 <= reading && reading < 55.5:
                return microgramsToAQIConversion(35.5, 55.4, 101, 150, parseFloat(reading).toFixed(1));
            case 55.5 <= reading && reading < 150.5:
                return microgramsToAQIConversion(55.5, 150.4, 151, 200, parseFloat(reading).toFixed(1));
            case 150.5 <= reading && reading < 250.5:
                return microgramsToAQIConversion(150.5, 250.4, 201, 300, parseFloat(reading).toFixed(1));
            case 250.5 <= reading && reading < 350.5:
                return microgramsToAQIConversion(250.5, 350.4, 301, 400, parseFloat(reading).toFixed(1));
            default:
                return microgramsToAQIConversion(350.5, 500, 401, 500, parseFloat(reading).toFixed(1));
        }
    };

    const getAQIMeaning = (aqiValue) => {
        switch (true) {
            case aqiValue <= 50:
                return t('AirQuality.Category.Good');
            case 50 < aqiValue && aqiValue <= 100:
                return t('AirQuality.Category.Moderate');
            case 100 < aqiValue && aqiValue <= 150:
                return t('AirQuality.Category.UnhealthyForSensitiveGroups');
            case 150 < aqiValue && aqiValue <= 200:
                return t('AirQuality.Category.Unhealthy');
            case 200 < aqiValue && aqiValue <= 300:
                return t('AirQuality.Category.VeryUnhealthy');
            default:
                return t('AirQuality.Category.Hazardous');
        }
    };
    let aqiValue;
    if (props.reading) {
        aqiValue = getAQIValue(props.reading.value);
    }
    return (
        <Card className={"h-100"} style={{ borderRadius: "25px", backgroundColor: "pink" }}>

            <CardBody>
                <CardTitle className="text-value">
                    <Row className=".d-flex">
                        <Col xs="10">{t('AirQuality.Title')}</Col>
                        <Col xs="2">
                            <InfoIcon className="d-block float-right position-relative" id="AirQualityInfo" />
                        </Col>
                    </Row>

{/*                     <UncontrolledTooltip placement="right" target="AirQualityInfo">
                        {t('AirQuality.Tooltip')}
                    </UncontrolledTooltip> */}
                </CardTitle>
                {/* <Row>
                    <small className="text-muted ml-3">{t('AirQuality.Tooltip')}</small>
                </Row> */}
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
                                stroke={getAQICategory(aqiValue)}
                                strokeWidth="4"
                                fill="none"
                                id="AQI"
                            />
                            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" style={{ color: variables.busStopAqTextFont }}>
                                {aqiValue.toString()}
                            </text>
                            <text
                                x="70%"
                                y="80%"
                                dominantBaseline="hanging"
                                textAnchor="start"
                                style={{ font: "9px sans-serif", margin: 5 }}
                            >
                                PM2.5
                            </text>
                        </svg>
                        <UncontrolledTooltip placement="right" target="AQI">
                            {getAQIMeaning(aqiValue)}
                        </UncontrolledTooltip>
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
                <small className="text-muted ml-3 p-1">{getAQIMeaning(aqiValue)}</small>
            )}
        </Card>
    );
};

export default AirQualityCard;
