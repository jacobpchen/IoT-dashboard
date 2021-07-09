import React from "react";
import { Card, CardBody, CardTitle, Col, Row } from "reactstrap";
import InfoIcon from "@material-ui/icons/Info";
import moment from "moment";
import { useTranslation } from "react-i18next";

const TvocCard = (props) => {
    console.log(props)
    const { t } = useTranslation();
    const getCategory = (value) => {
        switch (true) {
            case value <= 65:
                return "#00e400";
            case 65 < value && value <= 220:
                return "#ffff00";
            case 220 < value && value <= 660:
                return "#ff7e00";
            case 660 < value && value <= 2200:
                return "#ff0000";
            case 2200 < value && value <= 5500:
                return "#99004c";
            default:
                return "#7e0023";
        }
    };

    const getMeaning = (value) => {
        switch (true) {
            case value <= 65:
                return t('.Category.Excellent');
            case 65 < value && value <= 220:
                return t('Tvoc.Category.Good');
            case 220 < value && value <= 660:
                return t('Tvoc.Category.Moderate');
            case 650 < value && value <= 2200:
                return t('Tvoc.Category.Poor');
            case 2200 < value && value <= 5500:
                return t('Tvoc.Category.UnHealthy');
            default:
                return t('Tvoc.Category.Hazardous');
        }
    };
    let value;
    if (props.reading) {
        value = props.reading.value;

    }
    return (
        <Card className={"h-100"} style={{ borderRadius: "25px" }}>
            <CardBody>
                <CardTitle className="text-value">
                    <Row className=".d-flex">
                        <Col xs="10">{t('Tvoc.Title')}</Col>
                        {/* <Col xs="2">
                            <InfoIcon className="d-block float-right position-relative" id="TvocInfo" />
                        </Col> */}
                    </Row>
                    {/* <UncontrolledTooltip placement="right" target="TvocInfo">
                        {t('Tvoc.Tooltip')}
                    </UncontrolledTooltip> */}
                </CardTitle>
                {/* <text>{t('Tvoc.Tooltip')}</text> */}
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
                                // getAQICategory gets the color of the Wheel
                                stroke={getCategory(value)}
                                strokeWidth="4"
                                fill="none"
                                id="AQI"
                            />
                            <i class="fas fa-wind"></i>
                            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">
                                {/* This line displays the Value of the TVOC value currently */}
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
                                PPB
                            </text>
                        </svg>
                        {/* <UncontrolledTooltip placement="right" target="AQI">
                            {getMeaning(value)}
                            </UncontrolledTooltip>*/}
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
                    {t('Tvoc.Tooltip')}
                </small>
            )}
        </Card>
    );
};

export default TvocCard;