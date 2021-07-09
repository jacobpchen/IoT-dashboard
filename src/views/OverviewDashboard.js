import React, { Component } from 'react';
import Authentication from '../Authentication';
import { Service } from '../services/Service';
import { Bar } from 'react-chartjs-2';
import LoadingCard from "../LoadingCard";
import { ToastContainer, toast } from 'react-toastify';
import * as moment from 'moment';
import MessageCard from "../MessageCard";
import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardTitle,
    Col,
    Row,
    Spinner
} from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import variables from '../scss/_variables.scss';
import _ from 'lodash';

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

class OverviewDashboard extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.locale = window.navigator.language;
        this.state = { auth: Authentication.getBearerAuthHeader(), isLoading: false, failedToLoad: false }
    }
    componentDidMount() {
        this._isMounted = true;
        this.setState({ isLoading: true });
        this.loadData().then(
           
        )

        this.setState({
            dataForSelectedRadioIsLoading: 0,
            mainChart: {},
            mainChartOpts: {
                tooltips: {
                    enabled: false,
                    custom: CustomTooltips,
                    intersect: true,
                    mode: 'index',
                    position: 'nearest',
                    callbacks: {
                        labelColor: function (tooltipItem, chart) {
                            return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor };
                        }
                    }
                },
                plugins: {
                    datalabels: {
                        display: false,
                        color: 'black'
                    }
                },
                maintainAspectRatio: false,
                legend: {
                    display: true,
                    position: 'bottom'
                },
                scales: {

                    xAxes: [
                        {
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
                                labelString: 'Exported [kWh]'
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
            }
        });
    }
    componentWillUnmount(){
        this._isMounted = false;
    }

    notifyTimeout = () => toast("Timeout, please refresh page", { hideProgressBar: true, type: "error", closeButton: false });
    notifyRedirect = () => toast("Insufficient priviledges, redirecting...", { hideProgressBar: true, type: "error", closeButton: false });

    async loadData() {
        var roles;
        try {
            roles = await Authentication.getUserRoles();
            if (roles !== undefined && roles.indexOf('admins') > -1) {
                this.setState({ isAdmin: true });
                let adminCarPorts = await Service.getUserVisibleCarPorts();
                if(this._isMounted){
                    this.setState({adminCarPorts: adminCarPorts});
                }
                this.loadCarPortData(adminCarPorts, moment().add(-1, 'days').valueOf(), moment().valueOf(), "hour");
            }
            else {
                this.setState({ isAdmin: false });
                this.notifyRedirect();
                setTimeout(() => this.props.history.push('/dashboard') , 1500)
                
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>


    loadCarPortData(adminCarPorts, fromMS, toMS, aggregationType) {
        if(!this._isMounted) return;
        const resultPromises = []
        for (const locationId of adminCarPorts.map(carPort => carPort.locationId)) {
            resultPromises.push(Service.collectFroniousData(fromMS, toMS, aggregationType, [locationId]));
        }
        Promise.all(resultPromises).then(results => {
            //if a carport doesn't have Fronius inverter, don't include it
            const carPortsToInsert = [];
            for(const carPort of results.flat()){
                if(carPort.pvSystem.inverters !== undefined){
                    carPortsToInsert.push(carPort);
                }
            }
            
            this.setState({ carPorts: carPortsToInsert });

            const newChart = this.createNewChart(this.state.carPorts);
            if(newChart === null) return;
            this.setState({
                mainChart: newChart
            });
        });
    }

    createNewChart(carPorts) {
        const newChart = Object.assign({}, this.state.mainChart);
        const newLabels = this.createCarportPowerLabels(carPorts);
        const newDatasets = this.createCarPortPowerDatasets(carPorts);
        newChart.labels = newLabels;
        newChart.datasets = newDatasets;
        if(newLabels === null || newDatasets === null){
            return null;
        }
        this.setState({ isLoading: false, failedToLoad: false, dataForSelectedRadioIsLoading: undefined })
        return newChart;
    }

    createCarportPowerLabels(carPorts) {
        if(carPorts === undefined) return null;
        const carPortInverters = carPorts.map(carPort => carPort.pvSystem).map(pvSystem => pvSystem.inverters).flat();
        const inverterPowerDetails  = carPortInverters.map(inverter => inverter.inverterPower).flat()
        let format = 'lll'
        if(inverterPowerDetails[0].aggregationPeriodType === 'hour') {
            format = 'h:mm'
        } else if (inverterPowerDetails[0].aggregationPeriodType === 'month' ) {
            format = 'MMM/YY'
        } else {
            if(navigator.language === "en-US"){
                format = 'MMM Do'
            } else {
                format = 'Do MMM'
            }
        }
        const inverterAllPowerTimestamps = inverterPowerDetails.flat().map(inverter => inverter.aggregationStartTimestampMS);
        const uniqueTimestamps = _.uniqBy(inverterAllPowerTimestamps);
        return uniqueTimestamps.map(timestamp => {
            const parsed = moment(timestamp).utc().locale(this.locale);
            return parsed.format(format);
        });
    }

    createCarPortPowerDatasets(carPorts) {
        if(carPorts === undefined) return null;
        const resultDataSets = [];
        if(carPorts.length > 1){
            resultDataSets.push(this.createCarPortDataSetsForTotal(carPorts));
        }
        for (let i = 0; i < carPorts.length; i++) {
            resultDataSets.push(this.createCarPortDataSetOnPerCarPortBasis(carPorts[i], i));
        }
        return resultDataSets;
    }

    createCarPortDataSetOnPerCarPortBasis(carPort, num) {
        const { backgroundColor, borderColor } = this.getInverterColors(num);
        return {
            label: "Carport (" + carPort.pvSystem.pvSystemName + ")",
            backgroundColor,
            borderColor,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 2,
            data: this.createCarportPowerGraphData(carPort),
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

    createInverterDataSetForTotal(inverters) {
        const { backgroundColor, borderColor } = {
            backgroundColor: variables.totalGraphColor,
            borderColor: variables.totalGraphColorLight
        }
        const dataArrays = [];
        for(let i = 0; i < inverters.length; i++) {
            dataArrays.push(this.createCarportPowerGraphData(inverters[i]))
        }
        let resultDataSet = new Array(dataArrays[0].length);
        for(let i = 0; i < resultDataSet.length; i++){
            resultDataSet[i] = 0;
            for(let j = 0; j < dataArrays.length; j++){
                resultDataSet[i] += dataArrays[j][i];
            }
        }

        return {
            label: "Carport Total",
            backgroundColor,
            borderColor,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 2,
            data: resultDataSet,
        };
    }

    createCarPortDataSetsForTotal(carPorts) {
        const { backgroundColor, borderColor } = {
            backgroundColor: variables.totalGraphColor,
            borderColor: variables.totalGraphColorLight
        }
        const dataArrays = [];
        for(let i = 0; i < carPorts.length; i++) {
            dataArrays.push(this.createCarportPowerGraphData(carPorts[i]))
        }
        let resultDataSet = new Array(dataArrays[0].length);
        for(let i = 0; i < resultDataSet.length; i++){
            resultDataSet[i] = 0;
            for(let j = 0; j < dataArrays.length; j++){
                resultDataSet[i] += dataArrays[j][i];
            }
        }

        return {
            label: "Carport Total",
            backgroundColor,
            borderColor,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 2,
            data: resultDataSet,
        };
    }
    
    createCarportPowerGraphData(carPort) {
        return carPort.pvSystem.inverters.map(inverter => inverter.inverterPower).flat().map(inveterPower => Math.round(inveterPower.powerExportedInPeriod) / 1000);
    }

    onRadioBtnClick(radioSelected) {
        switch (radioSelected) {
            case 0:
                this.loadCarPortData(this.state.adminCarPorts, moment().add(-1, 'day').valueOf(), moment().valueOf(), "hour");
                break;
            case 1:
                this.loadCarPortData(this.state.adminCarPorts, moment().add(-7, 'day').valueOf(), moment().valueOf(), "day");
                break;
            case 2:
                this.loadCarPortData(this.state.adminCarPorts, moment().add(-1, 'month').valueOf(), moment().valueOf(), "day");
                break;
            case 3:
                this.loadCarPortData(this.state.adminCarPorts, moment().add(-1, 'year').valueOf(), moment().valueOf(), "month");
                break;
            default:
                break;
        }

        this.setState({
            radioSelected: radioSelected,
            dataForSelectedRadioIsLoading: radioSelected
        });
    }

    render() {
        if (this.state.isLoading) {
            return (<LoadingCard />)
        } else if (this.state.failedToLoad) {
            return (
                <MessageCard title={"Failed to load, please try again later."} message={""} />
            )
        }
        else if (!this.state.isAdmin) {
            return (
                <MessageCard title={"Warning: Unauthorized User"} message={"If you believe you have reached this page in error, please contact your administrator."} />
            )
        }
        return (
            <div>
                <ToastContainer />
                <div className="animated fadeIn">
                    <Row>
                        <Col>
                            <Card>
                                <CardBody>
                                    <Row>
                                        <Col sm="9">
                                            <CardTitle className="mb-0"> Energy Per Carport</CardTitle>
                                            <div className="small text-muted">{this.state.carPortName}</div>
                                        </Col>

                                        <Col sm="3" className="pl-2 pr-0 align-self-end">
                                            <ButtonGroup
                                                className="mr-3 d-flex justify-content-end align-content-start"
                                                aria-label="First group">
                                                <Button color="outline-secondary"
                                                    style={{ width: "33%" }}
                                                    onClick={() => this.onRadioBtnClick(0)}
                                                    active={this.state.radioSelected === 0}>
                                                    <TextWithLoadingSpinner text={"Day"}
                                                        isLoading={this.state.dataForSelectedRadioIsLoading === 0} />
                                                </Button>
                                                <Button color="outline-secondary"
                                                    style={{ width: "33%" }}
                                                    onClick={() => this.onRadioBtnClick(1)}
                                                    active={this.state.radioSelected === 1}>
                                                    <TextWithLoadingSpinner text={"Week"}
                                                        isLoading={this.state.dataForSelectedRadioIsLoading === 1} />
                                                </Button>
                                                <Button color="outline-secondary"
                                                    style={{ width: "33%" }}
                                                    onClick={() => this.onRadioBtnClick(2)}
                                                    active={this.state.radioSelected === 2}>
                                                    <TextWithLoadingSpinner text={"Month"}
                                                        isLoading={this.state.dataForSelectedRadioIsLoading === 2} />
                                                </Button>
                                                <Button color="outline-secondary"
                                                    style={{ width: "33%" }}
                                                    onClick={() => this.onRadioBtnClick(3)}
                                                    active={this.state.radioSelected === 3}>
                                                    <TextWithLoadingSpinner text={"Year"}
                                                        isLoading={this.state.dataForSelectedRadioIsLoading === 3} />
                                                </Button>
                                            </ButtonGroup>
                                        </Col>
                                    </Row>
                                    <div className="chart-wrapper mt-2"
                                        style={{ height: 300 + 'px' }}>
                                        <Bar data={this.state.mainChart} options={this.state.mainChartOpts}
                                            height={300} />
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}


export default OverviewDashboard