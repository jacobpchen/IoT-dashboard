import React, { Component } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "chartjs-plugin-datalabels";
import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardFooter,
    CardTitle,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row,
    Spinner,
    Container,
} from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import {
    EVMilesDrivenCard,
    CarbonEmissionsSavedCard,
    AirQualityCard,
    DateCarousel,
    SoundAndLightCard, EVChargingUsageCard, EnergyValueCard, BatteryCapacityCard, WeatherCard, AirQualityTrend
} from '../components';
import { Service } from '../services/Service';
import _ from 'lodash';
import moment from 'moment-timezone';
import "moment/min/locales";
import variables from '../scss/_variables.scss';
import LoadingCard from "../LoadingCard";
import MessageCard from "../MessageCard";
import { withTranslation } from "react-i18next";

const brandInfo = getStyle('--info');


class TextWithLoadingSpinner extends Component {
    render() {
        return (
            <React.Fragment>
                {(this.props.isLoading) ?
                    (<React.Fragment>
                        <span className="sr-only">Loading...</span>
                        <Spinner animation="border" size="sm" color={"dark"}
                            role="status" />
                    </React.Fragment>)
                    :
                    (
                        <React.Fragment>{this.props.text}</React.Fragment>
                    )
                }
            </React.Fragment>
        )
    }
}

class Dashboard extends Component {
    notifyTimeout = () => toast(`${this.props.t('Notify.Timeout')}`, { hideProgressBar: true, type: "error", closeButton: false });
    notifyUnauthorized = () => toast(`${this.props.t('Notify.Unauthorized')}`, { hideProgressBar: true, type: "error", closeButton: false });

    constructor(props) {
        super(props);

        moment.tz.setDefault("UTC");
        this.toggle = this.toggle.bind(this);
        this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
        const kwToWattConversionFactor = 1000;
        const date = moment().valueOf();
        const energyChart = {
            labels: [],
            datasets: [
                {
                    label: 'Loading...',
                    backgroundColor: hexToRgba(brandInfo, 10),
                    borderColor: brandInfo,
                    pointHoverBackgroundColor: '#fff',
                    borderWidth: 2,
                    data: [],
                }
            ],
        };

        const energyChartOpts = {
            tooltips: {
                enabled: true,
                intersect: false,
                mode: 'index',
                position: 'nearest',
                callbacks: {
                    labelColor: function (tooltipItem, chart) {
                        return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor };
                    }
                }
            },
            hover:{
                mode: "index"
            },
            maintainAspectRatio: false,
            plugins: {
                datalabels: {
                    display: false,
                    color: 'black'
                }
            },
            legend: {
                display: true,
                position: 'top',
                align: 'center',
                labels: {
                    usePointStyle: true,
                },
            },
            scales: {

                xAxes: [
                    {
                        type:"time",
                        distribution:"linear",
                        offset:false,
                        time:{
                            unit: "hour",
                            displayFormats:{
                                hour:"h A",
                                day:"D",
                                month: "MMM",
                                year: "YYYY"
                            },
                        },
                        scaleLabel: {
                            display: true
                        },
                        ticks: {
                            maxRotation: 0,
                            maxTicksLimit: 12,
                        }
                    }],
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            maxTicksLimit: 8,
                        },
                        scaleLabel: {
                            display: true,
                        },
                    }],
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

        this.state = {
            chart: "LINE",
            dropdownOpen: false,
            radioSelected: 0,
            dataForSelectedRadioIsLoading: 0,
            energyChart: energyChart,
            energyChartOpts: energyChartOpts,
            selectedPvName: "Loading",
            isLoading: false,
            cartPortLocationIds: [],
            failedToLoad: false,
            conversionFactor: kwToWattConversionFactor,
            date: date,
            aggregationType: 'hour',
        };
    }

    componentDidMount() {
        this.setState({isLoading: true, failedToLoad: false, dataForSelectedRadioIsLoading: 0});
        this.loadData();
    }

    handleDateChange = (date, radioButton) => {
        this.setState( {date: date});
        this.onRadioBtnClick(radioButton, date);
    };

    loadData(){
        const carPort = this.props.location.state ? this.props.location.state.selectedCarPort : {};
        if (carPort.locationId !== undefined) {
            this.setState({
                cartPortLocationIds: [carPort.locationId],
                carPortName: carPort.locationName !== undefined ? carPort.locationName : carPort.locationId,
                isDefault: false
            });
            this.createInverterChartData(moment(this.state.date).startOf('day').valueOf(), moment(this.state.date).add(1,'day').startOf('day').valueOf(), "hour", [carPort.locationId], "LINE");
        } else {
            Service.getUserVisibleCarPorts().then((carPorts => {
                const parsedCarPorts = this.parseGetCarPortsToDashboardData(carPorts);
                if (typeof parsedCarPorts[0] !== "undefined") {
                    this.setState({
                        cartPortLocationIds: [parsedCarPorts[0].locationId],
                        carPortName: parsedCarPorts[0].locationName !== undefined ? parsedCarPorts[0].locationName : parsedCarPorts[0].locationId,
                        isDefault: true,
                    });
                    this.createInverterChartData(moment(this.state.date).startOf('day').valueOf(), moment(this.state.date).add(1,'day').startOf('day').valueOf(),"hour", [parsedCarPorts[0].locationId], "LINE");
                } else {
                    this.setState({
                        cartPortLocationIds: [],
                        carPortName: "",
                        isLoading: false,
                        dataForSelectedRadioIsLoading: undefined
                    });
                }
            }), () => {
                this.setState({
                    cartPortLocationIds: [],
                    carPortName: "",
                    isLoading: false,
                    failedToLoad: true
                });
            });
        }
    }
    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
        });
    }

    createInverterChartData(fromMS, toMS, aggregationType, locationIds, chartType) {
        Service.collectFroniousData(fromMS, toMS, aggregationType, locationIds).then(((res) => {

            const carPortData = res[0];
            if (carPortData === undefined || carPortData.length === 0) {
                console.log(`No inverter data`);
                return [];
            }
            this.setState({
                carPort: carPortData,
                chart: chartType,
            });
            let energyChart;
            let energyChartOpts;
            if(carPortData.pvSystem.inverters !== undefined){
                carPortData.pvSystem.inverters.forEach(inverter => {
                    inverter.inverterPower.sort((a, b) => a.aggregationStartTimestampMS - b.aggregationStartTimestampMS);
                    inverter.evMiles.sort((a, b) => a.aggregationStartTimestampMS - b.aggregationStartTimestampMS);
                    inverter.co2Offset.sort((a, b) => a.aggregationStartTimestampMS - b.aggregationStartTimestampMS)
                });
                energyChart = this.createFroniusEnergyChartContent(carPortData);
            }
            if(carPortData.iotGws !== undefined && carPortData.iotGws.length > 0){
                const gwChart = this.createIotGwEnergyChartContent(carPortData.iotGws);
                //if newChart/newOptions are empty then create blank chart
                if(energyChart === undefined){
                    energyChart = {
                        labels: [],
                        datasets: []
                    }
                }
                //otherwise, append to newChart datasets
                energyChart.datasets = energyChart.datasets.concat(gwChart.datasets);
                energyChart.labels = energyChart.labels.concat(gwChart.labels)

            }
            if(energyChart.labels.length > 0){
                energyChart.labels.sort();
                energyChart.labels = [...new Set(energyChart.labels)];
            }
            if(energyChart !== undefined && energyChart.datasets.length > 0) energyChartOpts = this.createNewChartOptions(energyChart.datasets, carPortData, aggregationType);
            else { energyChartOpts = this.state.energyChartOpts }
            this.setState({
                energyChart,
                energyChartOpts,
                isLoading: false,
                dataForSelectedRadioIsLoading: undefined
            });
        }), reason => {
            if (this.state.retrying !== true) {
                this.setState({ retrying: true })
                this.createInverterChartData(fromMS, toMS, aggregationType, locationIds, chartType)
            }
            else if(reason.message === "Forbidden"){
                this.props.history.replace({
                    state: null
                });
                this.loadData();
                this.notifyUnauthorized();
            } else {

                this.notifyTimeout()
            }
        });
    }
    createIotGwEnergyChartContent(gateways){
        const returnChart = {
            labels: [],
            datasets: [],
        }
        for(const gateway of gateways){
            const energyReadings = gateway.inverter.inverterEnergy.sort((r1, r2)=>{
                return r1.timestampMs - r2.timestampMs;
            })
            const inverterId = gateway.inverter.inverterId;
            const gatewayId = gateway.iotGwId;

            const energyChartData = energyReadings.map(reading=>{ return{x:reading.timestampMs, y:(Math.round(reading.value)/this.state.conversionFactor)}});

            const energyChartLabels = energyReadings.map(reading => reading.timestampMs);
            
            const { backgroundColor, borderColor } = this.getInverterColors(parseInt(inverterId)+1);
            returnChart.labels = [...new Set([...energyChartLabels, ...returnChart.labels])]
            returnChart.datasets.push({
                label: "IoT Gateway (" + gatewayId + ":Inverter-" + inverterId + ")",
                backgroundColor,
                borderColor,
                pointHoverBackgroundColor: '#fff',
                borderWidth: 2,
                data: energyChartData,
            })
        }
        return returnChart;
    }

    createFroniusEnergyChartContent(carPortData) {
        const newChart = Object.assign({}, this.state.energyChart);
        const newLabels = this.createInverterPowerLabels(carPortData.pvSystem.inverters);
        const newDatasets = this.createInverterPowerDatasets(carPortData.pvSystem.inverters);
        newChart.labels = newLabels;
        newChart.datasets = newDatasets;
        return newChart;
    }

    createNewChartOptions(newDatasets, carPortData, aggregationType) {
        const newOptions = Object.assign({}, this.state.energyChartOpts);

        //newOptions.scales.yAxes[0].scaleLabel.labelString = aggregationType==="hour" ? "Power [kW]" : "Energy [kWh]";
        newOptions.scales.xAxes[0].distribution = aggregationType === "hour" ? "linear" : "series";
        newOptions.scales.xAxes[0].offset = aggregationType === "hour" ? false : true;
        newOptions.scales.xAxes[0].time.unit = aggregationType;
        return newOptions;
    }

    createInverterDataSetOnPerInverterBasis(inverter, num) {
        const { backgroundColor, borderColor } = this.getInverterColors(num);
        return {
            label: this.state.aggregationType === "hour" ? this.props.t('InverterChart.Legend.1') : this.props.t('InverterChart.Legend.2'),
            backgroundColor,
            borderColor,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 2,
            data: this.createInverterPowerGraphData(inverter),
            pointStyle: "circle",
        };
    }

    createInverterDataSetForTotal(inverters) {
        const { backgroundColor, borderColor } = {
            backgroundColor: variables.totalGraphColor,
            borderColor: variables.totalGraphColorLight
        }
        const dataArrays = [];
        for (let i = 0; i < inverters.length; i++) {
            dataArrays.push(this.createInverterPowerGraphData(inverters[i]))
        }
        let resultDataSet = new Array(dataArrays[0].length);
        for (let i = 0; i < resultDataSet.length; i++) {
            resultDataSet[i] = 0;
            for (let j = 0; j < dataArrays.length; j++) {
                resultDataSet[i] += dataArrays[j][i];
            }
        }

        return {
            label: "Inverter Total",
            backgroundColor,
            borderColor,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 2,
            data: resultDataSet,
        };
    }

    getInverterColors(num) {
        if (num === 0) {
            return {
                backgroundColor: variables.highlightColorLight,
                borderColor: variables.highlightColor,
            }
        } else if (num === 1) {
            return {
                backgroundColor: variables.highlightColor3Light,
                borderColor: variables.highlightColor3,
            }
        }

        return {
            backgroundColor: variables.highlightColorLight,
            borderColor: variables.highlightColor,
        }
    }

    createInverterPowerGraphData(inverter) {
        return inverter.inverterPower.map(_inverter => {return {x: _inverter.aggregationStartTimestampMS, y:Math.round(_inverter.powerExportedInPeriod) / this.state.conversionFactor}});
    }

    createInverterPowerDatasets(inverters) {
        const resultDataSets = [];
        if (inverters.length > 1) {
            resultDataSets.push(this.createInverterDataSetForTotal(inverters));
        }
        for (let i = 0; i < inverters.length; i++) {
            resultDataSets.push(this.createInverterDataSetOnPerInverterBasis(inverters[i], i));
        }
        return resultDataSets;
    }

    stringToColour(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let colour = '#';
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    }

    createInverterPowerLabels(inverters) {
        const inverterPowerDetails = inverters.map(inverter => inverter.inverterPower);
        const inverterAllPowerTimestamps = inverterPowerDetails.flat().map(inverter => inverter.aggregationStartTimestampMS);
        const uniqueTimestamps = _.uniqBy(inverterAllPowerTimestamps);
        return uniqueTimestamps;
    }

    onRadioBtnClick(radioSelected, date) {
        switch (radioSelected) {
            case 0:
                this.setState({aggregationType: 'hour'});
                this.createInverterChartData(moment(date).startOf('day').valueOf(), moment(date).add(1,'day').startOf('day').valueOf(), 'hour', [this.state.cartPortLocationIds], "LINE");
                break;
            case 1:
                this.setState({aggregationType: 'day'});
                this.createInverterChartData(moment(date).startOf('month').valueOf(), moment(date).endOf('month').valueOf(), 'day', [this.state.cartPortLocationIds], "BAR");
                break;
            case 2:
                this.setState({aggregationType: 'month'});
                this.createInverterChartData(moment(date).startOf('year').valueOf(), moment(date).endOf('year').valueOf(), 'month', [this.state.cartPortLocationIds], "BAR");
                break;
            case 3:
                this.setState({aggregationType: 'year'});
                this.createInverterChartData(moment(date).startOf('year').valueOf(), moment(date).endOf('year').valueOf(), 'year', [this.state.cartPortLocationIds], "BAR");
                break;
            default:
                break;
        }

        this.setState({
            radioSelected: radioSelected,
            dataForSelectedRadioIsLoading: radioSelected
        });
    }

    parseGetCarPortsToDashboardData(carPorts) {
        const parsedCarPorts = [];
        for (const carPort of carPorts) {
            parsedCarPorts.push({
                locationId: carPort.locationId,
                locationName: carPort.locationName
            });
        }
        return parsedCarPorts;
    }

    createSmartCitizenSection() {
        const carPort = this.state?.carPort !== undefined ? this.state.carPort : {};
        let resultingRender = [];
        if (carPort && carPort.smartCitizenDevices && carPort.smartCitizenDevices.devices) {
            for (const device of carPort.smartCitizenDevices.devices) {
                const graphColors = [variables.highlightColor4, variables.highlightColor2];
                for (const sensor of device.sensors) {
                    const readings = sensor.readings.sort(((r1, r2) => {
                        return moment(r1.createdAt).valueOf() - moment(r2.createdAt).valueOf()
                    }));
                    const cardId = device.deviceId.toString() + sensor.sensorId.toString();
                    const latestSensorText = (Math.round(readings[readings.length - 1].value * 100) / 100).toString() + sensor.unit;
                    const sensorReadingLabels = readings.map(reading => moment(reading.createdAt).utc().locale(this.locale).format('lll'));
                    const sensorReadingDataset = readings.map(reading => Math.round(reading.value * 100) / 100);
                    const graphColor = graphColors.pop();
                    graphColors.unshift(graphColor);
                    const sensorChart = {
                        labels: sensorReadingLabels,
                        datasets: [
                            {
                                label: "",
                                backgroundColor: graphColor,
                                borderColor: 'rgba(255,255,255,.25)',
                                data: sensorReadingDataset.map(reading => reading),
                            },
                        ],
                    };

                    const sensorChartOptions = this.createSmartCitizenSensorOptions(sensorReadingDataset);
                    resultingRender.push(
                        <div className={"d-flex flex-column w-50 p-2"} key={cardId + "column"}>
                            <Card className={"w-100 text-black"}>
                                <CardBody className={"pb-0"}>
                                    <ButtonGroup className="float-right">
                                        <Dropdown id={cardId} isOpen={this.state[cardId]}
                                            toggle={() => {
                                                this.setState({ [cardId]: !this.state[cardId] });
                                            }}>
                                            <DropdownToggle className="p-0" color="transparent">
                                                <i className="icon-settings" />
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem disabled>Device Id: {device.deviceId}</DropdownItem>
                                                <DropdownItem disabled>Sensor Id: {sensor.sensorId}</DropdownItem>
                                                <DropdownItem disabled>Description: {sensor.description}</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </ButtonGroup>
                                    <div className="text-value">{"Latest: " + latestSensorText}</div>
                                    <div>{sensor.name}</div>
                                    <div className={"w-100 chart-wrapper mx-3"} style={{ height: '70px' }}>
                                        <Line data={sensorChart} options={sensorChartOptions} height={70} />
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    );
                }
            }
        }
        if(resultingRender.length > 0){
            return(
                <CardFooter>
                    <div>
                        Environmental Sensors
                    </div>
                    <div
                        className={"d-flex flex-row w-100 justify-content-center align-items-start p0"}>
                        <Row key="smartCitizenRow"> {resultingRender} </Row>
                    </div>
                </CardFooter>
            );
        }
        else return null;
    }

    createSmartCitizenSensorOptions(sensorReadingDataset) {
        return {
            tooltips: {
                enabled: false,
                custom: CustomTooltips
            },
            maintainAspectRatio: false,
            legend: {
                display: false,
            },
            scales: {
                xAxes: [
                    {
                        gridLines: {
                            color: 'transparent',
                            zeroLineColor: 'transparent',
                        },
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                    }
                ],
                yAxes: [
                    {
                        display: false,
                        ticks: {
                            display: false,
                            min: Math.min.apply(Math, sensorReadingDataset) * 0.9,
                            max: Math.max.apply(Math, sensorReadingDataset) * 1.2,
                        },
                    }
                ],
            },
            elements: {
                line: {
                    borderWidth: 2,
                },
                point: {
                    radius: 0,
                    hitRadius: 8,
                    hoverRadius: 4,
                },
            },
        };
    }

    renderPowerChart(){
        const gateway = this.state?.carPort?.iotGws !== undefined ? this.state.carPort.iotGws : [];
        let renderData = [];
        if(gateway.length > 0){
            let labels = [];
            let data = [];
            for(const index in gateway){
                const powerReadings = gateway[index].inverter.powerAC.sort((r1, r2)=>{
                    return r1.timestampMs - r2.timestampMs;
                });
                const inverterId = gateway[index].inverter.inverterId;
                const gatewayId = gateway[index].iotGwId;

                const powerChartData = powerReadings.map(reading=>{return {x: reading.timestampMs, y:Math.round(reading.value)/this.state.conversionFactor}});

                
                const powerChartLabels = powerReadings.map(reading => reading.timestampMs);
                labels.push(...powerChartLabels);
                const { backgroundColor, borderColor } = this.getInverterColors(parseInt(inverterId)+1);
                data.push(
                    {
                        label: "IoT Gateway (" + gatewayId + ":" + inverterId + ")",
                        backgroundColor,
                        borderColor,
                        data: powerChartData,
                    }
                );
            }
            const chart = {
                labels: [...new Set(labels.sort())],
                datasets: data
            }
            
            const chartOptions = this.createIoTGatewayOptions(data.map(dataset=>dataset.data).flat(), this.state.radioSelected);
            

            renderData.push(
                <div key="PowerChart" className="chart-wrapper mt-2"
                style={{ height: 300 + 'px' }}>
                <Line data={chart} options={chartOptions}
                    height={300} />
            </div>
            );

            return(
                <React.Fragment>
                    <CardTitle>
                        Power Per Inverter
                    </CardTitle>
                        {renderData}
                </React.Fragment>)
        }
    }
    createIoTGatewayOptions(IoTGatewayData, radioSelected){
        let forceTime;
        switch (radioSelected) {
            case 0:
                forceTime = "hour";
                break;
            default:
                forceTime = "day"
                break;
        }
        return {
            tooltips: {
                enabled: false,
                custom: CustomTooltips,
                intersect: true,
                mode: 'nearest',
                position: 'nearest',
                callbacks: {
                    labelColor: function (tooltipItem, chart) {
                        return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor };
                    }
                }
            },
            hover:{
                mode:'nearest'
            },
            maintainAspectRatio: false,
            legend: {
                display: true,
                position: 'top',

            },
            scales: {

                xAxes: [
                    {
                        type:"time",
                        distribution:"linear",
                        time:{
                            minUnit:forceTime,
                            displayFormats:{
                                hour:"h A",
                                day:"MMM DD",
                                month: "MMMM YYYY"
                            },
                        },
                        scaleLabel: {
                            display: true
                        },
                        ticks: {
                            maxRotation: 0,
                            maxTicksLimit: 12,
                        }
                    }],
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            maxTicksLimit: 8,
                            min: Math.min.apply(Math, IoTGatewayData.map(entry=>entry.y)) * 0.9,
                            max: Math.max.apply(Math, IoTGatewayData.map(entry=>entry.y)) * 1.2,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Power [kW]'
                        },
                    }],
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
    }
    renderEnergyChart(){
        if(this.state.energyChart !== undefined && this.state.energyChart.datasets.length > 0){
            return (
                <div className="chart-wrapper mt-2"
                    style={{ height: 300 + 'px' }}>
                    {
                        this.state.chart === "LINE" ?
                            (
                                <Line data={this.state.energyChart} options={this.state.energyChartOpts}
                              height={300}/>) :
                            (
                                <Bar data={this.state.energyChart} options={this.state.energyChartOpts}
                                  height={300}/>)

                    }
                </div>
            )
        }
        return (
            <div
                style={{
                    fontSize: "18px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "300px",
                }}
            >
                {this.props.t('NoDataAvailable')}
            </div>
        )
    }
    createEnvironmentalCardsSection() {
        let evMilesLabels;
        let evMilesDataset;
        let co2OffsetLabels;
        let co2OffsetObj;
        let latestDatapointTimestamp;
        if (this.state.carPort.pvSystem.inverters.length > 0) {
            const evMilesData = this.state.carPort.pvSystem.inverters[0].evMiles;
            evMilesLabels = evMilesData.map(item => moment(item.aggregationStartTimestampMS).format("YYYY-MM-DDTHH:mm:ss"));
            evMilesDataset = evMilesData.map(item => item.co2OffsetInPeriod);
            const co2OffsetData = this.state.carPort.pvSystem.inverters[0].co2Offset;
            const co2OffsetDataset = co2OffsetData.map(item => item.co2OffsetInPeriod);
            co2OffsetLabels = co2OffsetData.map(item => moment(item.aggregationStartTimestampMS).format("YYYY-MM-DDTHH:mm:ss"));
            co2OffsetObj = {
                name: "From PV Production",
                data: co2OffsetDataset
            }
            const inverterPowerLength = this.state.energyChart.labels.length;
            latestDatapointTimestamp = this.state.energyChart.labels[inverterPowerLength - 1];
        }

        let airQualityValue;
        let lightValue;
        let noiseValue;
        let humidityValue;
        let temperatureValue;
        let airQualityTrendValues;
        if(this.state.carPort.smartCitizenDevices.devices.length > 0) {
            airQualityValue = this.state.carPort.smartCitizenDevices.devices[0].latest.sensors.filter(sensor => sensor.sensorId === 87)[0].readings[0];
            noiseValue = this.state.carPort.smartCitizenDevices.devices[0].latest.sensors.filter(sensor => sensor.sensorId === 53)[0].readings[0];
            lightValue = this.state.carPort.smartCitizenDevices.devices[0].latest.sensors.filter(sensor => sensor.sensorId === 14)[0].readings[0];
            temperatureValue = this.state.carPort.smartCitizenDevices.devices[0].latest.sensors.filter(sensor => sensor.sensorId === 55)[0].readings[0];
            humidityValue = this.state.carPort.smartCitizenDevices.devices[0].latest.sensors.filter(sensor => sensor.sensorId === 56)[0].readings[0]
            const airQualityTrendSensor = this.state.carPort.smartCitizenDevices.devices[0].historical.sensors.filter(sensor => sensor.sensorId === 87);
            airQualityTrendValues = airQualityTrendSensor[0].readings.sort((r1, r2) => {
                return moment(r1.createdAt).valueOf() - moment(r2.createdAt).valueOf()
            });
        }

        return (
                <Row key="EVMilesDriven">
                    <Col xs="12" md="6" lg="6" xl={{order: 8, size: 6}} className="py-2">
                        <CarbonEmissionsSavedCard data={co2OffsetObj} labels={co2OffsetLabels} aggregationType={this.state.aggregationType} latestDataPointTimestamp={latestDatapointTimestamp}/>
                    </Col>
                    <Col xs="12" md="6" lg="6"  xl={{order: 2, size:3}} className="py-2">
                        <EVMilesDrivenCard data={evMilesDataset} labels={evMilesLabels} aggregationType={this.state.aggregationType} latestDataPointTimestamp={latestDatapointTimestamp}/>
                    </Col>
                    <Col xs="12" md="6" lg="6" xl={{order: 4, size: 3}} className="py-2">
                        <AirQualityCard reading={airQualityValue} />
                    </Col>
                    <Col xs="12" md="6" lg="6" xl={{order: 6, size: 3}} className="py-2">
                        <SoundAndLightCard light={lightValue} noise={noiseValue} />
                    </Col>
                    <Col xs="12" md="6" lg="6" xl={{order: 3, size: 3}} className="py-2">
                        <EVChargingUsageCard data={undefined}/>
                    </Col>
                    <Col xs="12" md="6" lg="6" xl={{order: 1, size: 6}} className="py-2">
                        <EnergyValueCard data={undefined}/>
                    </Col>
                    <Col xs="12" md="6" lg="6" xl={{order: 9, size: 6}} className="py-2">
                        <BatteryCapacityCard percentage={23}/>
                    </Col>
                    <Col xs="12" md="6" lg="6" xl={{order: 7, size: 3}} className="py-2">
                        <WeatherCard temperature={temperatureValue} humidity={humidityValue}/>
                    </Col>
                    <Col xs="12" md="6" lg="6" xl={{order: 5, size: 3}} className="py-2">
                        <AirQualityTrend data={airQualityTrendValues}/>
                    </Col>
                </Row>

            );
    }

    render() {
        const { t } = this.props;
        if (this.state.isLoading) {
            return (
                <LoadingCard />
            )
        } else if (this.state.failedToLoad) {
            return (
                <MessageCard title={t('MessageCard.FailedLoad')} message={""} />
            )
        } else if (this.state.cartPortLocationIds.length === 0) {
            return (
                <MessageCard title={t('MessageCard.NoCarPort')}
                    message={t('MessageCard.ContactAdminCP')} />
            )
        }
        return (
            <div>
                <ToastContainer />
                <div className="animated fadeIn">
                    <Row style={{overflowY: "hidden"}}>
                        <Col>
                            <Card style={{borderRadius: "25px"}}>
                                <CardBody>
                                    <Row>
                                        <Col sm="9">
                                            <CardTitle className="mb-0"> {this.isDefault()} Carport: {this.state.carPortName}</CardTitle>
                                            <CardTitle>{this.state.aggregationType==="hour" ? t('InverterChart.Title.1') + " (kW)" : t('InverterChart.Title.2') + " (kWh)"}</CardTitle>
                                        </Col>
                                        <Col sm="3" className="pl-2 pr-0 align-self-end">
                                            <ButtonGroup
                                                className="mr-3 d-flex justify-content-end align-content-start"
                                                aria-label="First group">
                                                <Button color="outline-secondary"
                                                    style={{ width: "33%" }}
                                                    onClick={() => this.onRadioBtnClick(0, this.state.date)}
                                                    active={this.state.radioSelected === 0}>
                                                    <TextWithLoadingSpinner text={t('ButtonGroup.Day')}
                                                        isLoading={this.state.dataForSelectedRadioIsLoading === 0} />
                                                </Button>
                                                <Button color="outline-secondary"
                                                    style={{ width: "33%" }}
                                                    onClick={() => this.onRadioBtnClick(1, this.state.date)}
                                                    active={this.state.radioSelected === 1}>
                                                    <TextWithLoadingSpinner text={t('ButtonGroup.Month')}
                                                        isLoading={this.state.dataForSelectedRadioIsLoading === 1} />
                                                </Button>
                                                <Button color="outline-secondary"
                                                    style={{ width: "33%" }}
                                                    onClick={() => this.onRadioBtnClick(2, this.state.date)}
                                                    active={this.state.radioSelected === 2}>
                                                    <TextWithLoadingSpinner text={t('ButtonGroup.Year')}
                                                        isLoading={this.state.dataForSelectedRadioIsLoading === 2} />
                                                </Button>
                                                <Button color="outline-secondary"
                                                    style={{ width: "33%" }}
                                                    onClick={() => this.onRadioBtnClick(3, this.state.date)}
                                                    active={this.state.radioSelected === 3}>
                                                    <TextWithLoadingSpinner text={t('ButtonGroup.Lifetime')}
                                                        isLoading={this.state.dataForSelectedRadioIsLoading === 3} />
                                                </Button>
                                            </ButtonGroup>
                                            {this.state.aggregationType!=="year" ? <DateCarousel date={this.state.date} handleDateChange={this.handleDateChange} aggregationType={this.state.aggregationType} /> : <div style={{height:"35px"}}></div>}
                                        </Col>
                                    </Row>
                                    {this.renderEnergyChart()}
                                    {this.renderPowerChart()}
                                </CardBody>
                                {
                                    this.state.aggregationType === "hour" &&
                                    <small className="text-muted ml-3">{moment(this.state.energyChart.labels[this.state.energyChart.labels.length - 1]).format(`[${this.props.t('LatestReading.Text')}] MM/DD/YY h:mm a`)}
                                    </small>

                                }
                            </Card>
                            <Container className={"px-0"} fluid >
                                    {this.createEnvironmentalCardsSection()}
                            </Container>
                            {false && this.createSmartCitizenSection()}
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
    isDefault() {
        const isDefault = this.state.isDefault;
        const { t } = this.props;
        if (isDefault) {
            return <span><i className="fa fa-star" style={{ color: 'yellow' }}
                aria-hidden="true" /> <i>{t('InverterChart.Default')}:</i></span>;
        }
    }
}
export default withTranslation()(Dashboard);
