import React from "react";
import { Card, CardBody, CardTitle, Col, Row, UncontrolledTooltip } from "reactstrap";
import InfoIcon from "@material-ui/icons/Info";
import { Line } from "react-chartjs-2";
import variables from "../../scss/_variables.scss";
import moment from "moment";
import { useTranslation } from "react-i18next";

const AirQualityTrend = (props) => {
    const { t } = useTranslation();
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

    const createChart = (data) => {
        return {
            labels: data.map((dataItem) => dataItem.createdAt), //labels
            datasets: [
                {
                    data: data.map((dataItem) => getAQIValue(dataItem.value)), //data points
                    borderWidth: 1,
                    backgroundColor: variables.iSunPurple,
                    borderColor: "rgba(255,255,255,.25)",
                },
            ],
        };
    };

    const options = {
        tooltips: {
            enabled: true,
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
                    display: false,
                },
            ],
            yAxes: [
                {
                    display: false,
                },
            ],
        },
        elements: {
            point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 4,
                hoverBorderWidth: 5,
            },
        },
    };

    return (
        <Card className={"h-100"} style={{ borderRadius: "25px" }}>
            <CardBody className={"pb-0"}>
                <CardTitle className="text-value">
                    <Row className=".d-flex">
                        <Col xs="10">{t('AirQualityTrend.Title')}</Col>
                        <Col xs="2">
                            <InfoIcon className="d-block float-right position-relative" id="AirQualityTrendInfo" />
                        </Col>
                    </Row>
                    <UncontrolledTooltip placement="right" target="AirQualityTrendInfo">
                        {t('AirQualityTrend.Tooltip')}
                    </UncontrolledTooltip>
                </CardTitle>
            </CardBody>
            {props.data ? (
                <>
                    <div className="mx-3" style={{ height: "125px" }}>
                        <Line data={createChart(props.data)} options={options} height={125} width={250} />
                    </div>
                    <small className="text-muted ml-3">
                        {t('LastUpdated.Text')} {moment(props.data[props.data.length - 1].createdAt).fromNow()}
                    </small>
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
AirQualityTrend.defaultProps = {
    dataPoints: [50, 100, 150, 500, 300, 20],
    labels: ["good", "moderate", "unhealthy for sensitive people", "unhealthy", "very unhealthy", "Hazardous"],
};

export default AirQualityTrend;
