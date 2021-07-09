import React from "react";
import { Card, CardBody, CardSubtitle, CardText, CardTitle, UncontrolledTooltip, Row, Col } from "reactstrap";
import InfoIcon from "@material-ui/icons/Info";
import { Bar } from "react-chartjs-2";
import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import variables from "../../scss/_variables.scss";
import moment from "moment-timezone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareFull } from "@fortawesome/free-solid-svg-icons";
import "../EVChargerUsageCard/EVChargingUsageCard.css";
import { useTranslation } from "react-i18next";

const CarbonEmissionsSavedCard = (props) => {
    const {t} = useTranslation();
    const createDataset = (data) => {
        return [
            {
                label: "From EV Usage",
                data: [...data.data],
                backgroundColor: variables.iSunGreen,
                pointStyle: "rect",
                maxBarThickness: 20,
            },
            {
                label: data.name,
                data: [...data.data],
                backgroundColor: variables.iSunOrange,
                pointStyle: "rect",
                maxBarThickness: 20,
            },
        ];
    };

    const createChart = (readingDataset, readingLabels) => {
        return {
            labels: readingLabels,
            datasets: createDataset(readingDataset),
        };
    };

    const createOptions = () => {
        return {
            tooltips: {
                enabled: false,
                custom: CustomTooltips,
            },
            maintainAspectRatio: false,
            plugins: {
                datalabels: {
                    display: false,
                    color: "black",
                },
            },
            legend: {
                display: false,
                position: "top",
                align: "right",
                labels: {
                    usePointStyle: true,
                },
            },
            scales: {
                xAxes: [
                    {
                        display: false,
                        stacked: true,
                    },
                ],
                yAxes: [
                    {
                        display: false,
                        stacked: true,
                    },
                ],
            },
        };
    };
    const createSubtitleText = (aggregationType) => {
        switch (aggregationType) {
            case "hour":
                return t('CarbonEmissionsSaved.Date.Today');
            case "day":
                return moment(props.labels[0]).format(t('CarbonEmissionsSaved.Date.Month'));
            case "month":
                return moment(props.labels[0]).format(t('CarbonEmissionsSaved.Date.Year'));
            default:
                return t('CarbonEmissionsSaved.Date.Total');
        }
    };

    const createAggregatedAmount = (data) => {
        return data.reduce((acc, curr) => acc + curr).toFixed(3) * 2;
    };

    return (
        <Card className={"h-100"} style={{ borderRadius: "25px" }}>
            <CardBody>
                <CardTitle className="text-value">
                    <Row className=".d-flex">
                        <Col xs="10">{t('CarbonEmissionsSaved.Title')}</Col>
                        <Col xs="2">
                            <InfoIcon className="d-block float-right position-relative" id="CarbonEmissionInfo" />
                        </Col>
                    </Row>
                    <UncontrolledTooltip placement="right" target="CarbonEmissionInfo">
                        {t('CarbonEmissionsSaved.Tooltip')}
                    </UncontrolledTooltip>
                </CardTitle>
                {props.data && (
                    <Row>
                        <Col>
                            <CardSubtitle>{createSubtitleText(props.aggregationType)}</CardSubtitle>
                            <CardText>{createAggregatedAmount(props.data.data)} tons</CardText>
                        </Col>
                        <Col>
                            <div className={"labels"} style={{ display: "block" }}>
                                <FontAwesomeIcon icon={faSquareFull} color={variables.iSunOrange} />
                                {` ${t('CarbonEmissionsSaved.PV')} `}
                            </div>
                            <div className={"labels"} style={{ display: "block" }}>
                                <FontAwesomeIcon icon={faSquareFull} color={variables.iSunGreen} />
                                {` ${t('CarbonEmissionsSaved.EV')} `}
                            </div>
                        </Col>
                    </Row>
                )}
            </CardBody>

            {props.data ? (
                <>
                    <div className="mt-3 mx-3" style={{ height: "70px" }}>
                        <Bar
                            data={createChart(props.data, props.labels)}
                            options={createOptions(props.data)}
                            height={70}
                        />
                    </div>
                    {props.aggregationType === "hour" && (
                        <small className="text-muted ml-3">
                            {moment(props.latestDataPointTimestamp).format(`[${t('LatestReading.Text')}] MM/DD/YY h:mm a`)}
                        </small>
                    )}
                </>
            ) : (
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

export default CarbonEmissionsSavedCard;
