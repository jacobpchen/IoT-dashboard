import React from "react";
import { Card, CardBody, CardTitle, Col, Row, UncontrolledTooltip } from "reactstrap";
import InfoIcon from "@material-ui/icons/Info";
import { HorizontalBar } from "react-chartjs-2";
import variables from "../../scss/_variables.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareFull } from "@fortawesome/free-solid-svg-icons";
import "../EVChargerUsageCard/EVChargingUsageCard.css";
import { useTranslation } from "react-i18next";

const EnergyValueCard = (props) => {
    const {t} = useTranslation();
    const energyValueLegend = [
        {
            name: t('EnergyValue.PV'),
            color: variables.iSunOrange,
        },
        {
            name: t('EnergyValue.EV'),
            color: variables.iSunGreen,
        },
    ];

    const energyValueColorMapping = new Map([
        ["PVSystem", variables.iSunOrange],
        ["EVCharger", variables.iSunGreen],
    ]);

    const convertEnergyToValue = (energyInWatts, conversionFactor) => {
        return (energyInWatts / 1000) * conversionFactor;
    };

    const rangeConversion = (value, data) => {
        const currMax = Math.max(...data.map((dataItem) => dataItem.energy));
        const currMin = 1;
        const desiredMin = 1;
        const desiredMax = 3;
        return desiredMin + ((value - currMin) * (desiredMax - desiredMin)) / (currMax - currMin);
    };

    const numberWithCommas = (x) => {
        return "$" + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const createDataset = (data) => {
        return data.map((obj) => {
            const value = convertEnergyToValue(obj.energy, obj.kWhToCurrency);
            const rangedValue = rangeConversion(value, data);
            const valueWithCommas = numberWithCommas(Math.round(value));

            return {
                label: obj.name,
                data: [obj.energy === 0 ? 0.99 : rangedValue],
                displayData: [obj.energy === 0 ? 0.99 : valueWithCommas],
                backgroundColor: energyValueColorMapping.get(obj.name),
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
                            return "$" + 0;
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
    let totalWithCommas;

    if (props.data) {
        dataset = createDataset(props.data);
        data = dataset.map((dataItem) => dataItem.data[0]);
        total = props.data
            .map((dataItem) => convertEnergyToValue(dataItem.energy, dataItem.kWhToCurrency))
            .reduce((acc, curr) => {
                return acc + curr;
            });
        totalWithCommas = numberWithCommas(Math.round(total));
    }

    return (
        <Card className={"h-100"} style={{ borderRadius: "25px" }}>
            <CardBody className={"pb-0"}>
                <CardTitle className="text-value">
                    <Row className=".d-flex">
                        <Col xs="10">
                            <span>{t('EnergyValue.Title')}</span>
                        </Col>
                        <Col xs="2">
                            <InfoIcon className="d-block float-right position-relative" id="EnergyValueInfo" />
                        </Col>
                    </Row>
                    <UncontrolledTooltip placement="right" target="EnergyValueInfo">
                        {t('EnergyValue.Tooltip')}
                    </UncontrolledTooltip>
                </CardTitle>
                {props.data && (
                    <>
                        <div style={{ height: "100px", width: "100%", position: "relative" }}>
                            <h5 className="title">Total: {totalWithCommas}</h5>
                            <HorizontalBar data={createChart(dataset)} options={createOptions(data)} height={100} />
                        </div>
                        <div>
                            {energyValueLegend.map((label) => {
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

EnergyValueCard.defaultProps = {
    data: [
        {
            name: "PVSystem",
            energy: 0,
            kWhToCurrency: 0.14,
        },
        {
            name: "EVCharger",
            energy: 0,
            kWhToCurrency: 0.14,
        },
    ],
};

export default EnergyValueCard;
