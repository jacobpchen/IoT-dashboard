import React from "react";
import { Card, CardBody, CardSubtitle, CardText, CardTitle, UncontrolledTooltip, Row, Col } from "reactstrap";
import InfoIcon from "@material-ui/icons/Info";
import { Bar } from "react-chartjs-2";
import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import variables from "../../scss/_variables.scss";
import moment from "moment-timezone";
import { useTranslation } from "react-i18next";

const EVMilesDrivenCard = (props) => {
    const { t } = useTranslation();
    const createChart = (readingDataset, readingLabels) => {
        return {
            labels: readingLabels,
            datasets: [
                {
                    label: "",
                    backgroundColor: variables.iSunGreen,
                    borderColor: "rgba(255,255,255,.25)",
                    data: readingDataset.map((reading) => reading),
                    barPercentage: 1.0,
                    maxBarThickness: 20,
                },
            ],
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
            },
            scales: {
                xAxes: [
                    {
                        minBarLength: 10,
                        display: false,
                    },
                ],
                yAxes: [
                    {
                        display: false,
                    },
                ],
            },
        };
    };
    const createSubtitleText = (aggregationType) => {
        switch (aggregationType) {
            case "hour":
                return t('EVMilesDriven.Date.Today');
            case "day":
                return moment(props.labels[0]).format(t('EVMilesDriven.Date.Month'));
            case "month":
                return moment(props.labels[0]).format(t('EVMilesDriven.Date.Year'));
            default:
                return t('EVMilesDriven.Date.Total');
        }
    };

    const createAggregatedAmount = (data) => {
        return Math.round(data.reduce((acc, curr) => acc + curr));
    };

    return (
        <Card className={"h-100"} style={{ borderRadius: "25px" }}>
            <CardBody className={"pb-0"}>
                <CardTitle className="text-value">
                    <Row className=".d-flex">
                        <Col xs="10">
                            <span>{t('EVMilesDriven.Title')}</span>
                        </Col>
                        <Col xs="2">
                            <InfoIcon className="d-block float-right position-relative" id="EVMilesDrivenInfo" />
                        </Col>
                    </Row>
                    <UncontrolledTooltip placement="right" target="EVMilesDrivenInfo">
                        {t('EVMilesDriven.Tooltip')}
                    </UncontrolledTooltip>
                </CardTitle>
                {!!props.data && (
                    <>
                        <CardSubtitle>{createSubtitleText(props.aggregationType)}</CardSubtitle>
                        <CardText>{createAggregatedAmount(props.data)} miles</CardText>
                    </>
                )}
            </CardBody>
            {props.data ? (
                <>
                    <div className="mt-3 mx-3 " style={{ height: "70px" }}>
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

export default EVMilesDrivenCard;
