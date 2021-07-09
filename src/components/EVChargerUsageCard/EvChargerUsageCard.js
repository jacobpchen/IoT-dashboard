import React from "react";
import { Card, CardBody, CardTitle, Col, Row, UncontrolledTooltip } from "reactstrap";
import InfoIcon from "@material-ui/icons/Info";
import { HorizontalBar } from "react-chartjs-2";
import variables from "../../scss/_variables.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareFull } from "@fortawesome/free-solid-svg-icons";
import "./EVChargingUsageCard.css";
import { useTranslation } from "react-i18next";

const EvChargerUsageCard = (props) => {
    const {t} = useTranslation();
    const chargerLegend = [
        {
            name: t('EVChargerUsage.Status.Available'),
            color: variables.iSunGreen,
        },
        {
            name: t('EVChargerUsage.Status.InUse'),
            color: variables.iSunPurple,
        },
        {
            name: t('EVChargerUsage.Status.Unavailable'),
            color: variables.iSunLightGrey,
        },
    ];

    const statusColorMapping = new Map([
        ["Available", variables.iSunGreen],
        ["In Use", variables.iSunPurple],
        ["Unavailable", variables.iSunLightGrey],
    ]);

    const rangeConversion = (value, data) => {
        const currMax = Math.max(...data.map((dataItem) => dataItem.count));
        const currMin = 1;
        const desiredMin = 1;
        const desiredMax = 3;
        return desiredMin + ((value - currMin) * (desiredMax - desiredMin)) / (currMax - currMin);
    };

    const createDataset = (data) => {
        return data.map((obj) => {
            return {
                label: obj.status,
                data: [obj.count === 0 ? 0.99 : rangeConversion(obj.count, data)],
                displayData: [obj.count === 0 ? 0.99 : obj.count],
                backgroundColor: statusColorMapping.get(obj.status),
                minBarLength: 35,
            };
        });
    };

    const createChart = (dataset) => {
        return {
            labels: [""],
            datasets: dataset,
        };
    };

    const createOptions = (dataset) => {
        return {
            tooltips: {
                enabled: false,
            },
            scales: {
                xAxes: [
                    {
                        barPercentage: 1.0,
                        barThickness: 350,
                        stacked: true,
                        display: false,
                        ticks: {
                            beginAtZero: true,
                            max: dataset.reduce((acc, curr) => acc + curr),
                        },
                    },
                ],
                yAxes: [
                    {
                        stacked: true,
                        display: false,
                    },
                ],
            },
            legend: {
                display: false,
            },
            maintainAspectRatio: false,
            plugins: {
                datalabels: {
                    display: true,
                    color: "white",
                    font: {
                        size: 30,
                        weight: "bold",
                    },
                    formatter: (value, context) => {
                        if (context.dataset.displayData[context.dataIndex] < 1) {
                            return 0;
                        }
                        return context.dataset.displayData[context.dataIndex];
                    },
                },
            },
        };
    };
    let dataset;
    let data;
    let total;
    if (props.data) {
        dataset = createDataset(props.data);
        data = dataset.map((dataItem) => dataItem.data[0]);
        total = props.data
            .map((dataItem) => dataItem.count)
            .reduce((acc, curr) => {
                return acc + curr;
            });
    }

    return (
        <Card className={"h-100"} style={{ borderRadius: "25px" }}>
            <CardBody className={"pb-0"}>
                <CardTitle className="text-value">
                    <Row className=".d-flex">
                        <Col xs="10">
                            <span>{t('EVChargerUsage.Title')}</span>
                        </Col>
                        <Col xs="2">
                            <InfoIcon className="d-block float-right position-relative" id="EVChargingUsageInfo" />
                        </Col>
                    </Row>
                    <UncontrolledTooltip placement="right" target="EVChargingUsageInfo">
                        {t('EVChargerUsage.Tooltip')}
                    </UncontrolledTooltip>
                </CardTitle>
                {props.data && (
                    <>
                        <div
                            style={{
                                height: "100px",
                                width: "100%",
                                position: "relative",
                                display: "flex",
                                flexGrow: 1,
                            }}
                        >
                            <h5 className="title">Total: {total}</h5>
                            <HorizontalBar data={createChart(dataset)} options={createOptions(data)} height={100} />
                        </div>
                        <div>
                            {chargerLegend.map((label) => {
                                return (
                                    <div className={"labels"} key={label.name}>
                                        <FontAwesomeIcon icon={faSquareFull} color={label.color} />
                                        {" " + label.name + " "}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </CardBody>
            {!props.data ? (
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
                <small className="text-muted ml-3">{t('LastUpdated.Text')} N/A</small>
            )}
        </Card>
    );
};

EvChargerUsageCard.defaultProps = {
    data: [
        {
            status: "Available",
            count: 0,
        },
        {
            status: "In Use",
            count: 0,
        },
        {
            status: "Unavailable",
            count: 0,
        },
    ],
};

export default EvChargerUsageCard;
