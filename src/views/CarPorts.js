import React, {Component} from 'react';
import {Service} from '../services/Service';
import pixidaLogo from '../assets/img/PIXIDA_favicon_black_red_192x192.ico';
import {
    Collapse,
    Button,
    CardBody,
    Card,
    Table,
    CardText,
    CardSubtitle,
    CardHeader
} from 'reactstrap';
import LoadingCard from "../LoadingCard";
import MessageCard from "../MessageCard";

class CarPorts extends Component {

    constructor(props) {
        super(props);
        this.state = {
            carPorts: [],
            openCarPortCardIndex: 0,
            radioSelected: 2,
            isLoading: false,
            failedToLoad: false
        };
    }

    componentDidMount() {
        this.setState({isLoading: true});

        Service.getUserVisibleCarPorts().then((carPorts => {
            const carPortViewData = this.parseToViewData(carPorts);
            this.setState({
                carPorts: carPortViewData,
                isLoading: false,
                failedToLoad: false,
            });
        }), () => {
            this.setState({
                isLoading: false,
                failedToLoad: true
            });
        });
    }

    toggle = (index) => {
        if (this.state.openCarPortCardIndex === index) {
            this.setState({openCarPortCardIndex: -1});
        } else {
            this.setState({openCarPortCardIndex: index});
        }
    };

    parseToViewData(carPorts) {
        const parsedCarPorts = [];
        for (const carPort of carPorts) {
            try {
                parsedCarPorts.push({
                    locationId: carPort.locationId,
                    locationName: carPort.locationName !== undefined ? carPort.locationName : carPort.locationId,
                    devices: {
                        smartcitizenDevices: carPort.devices.smartcitizenDevices.map(smartCitizenDevice => {
                            return {
                                deviceId: smartCitizenDevice.deviceId,
                                sensors: smartCitizenDevice.sensors.map(sensor => {
                                    return {
                                        unit: sensor.unit,
                                        name: sensor.name,
                                        description: sensor.description,
                                        sensorId: sensor.sensorId
                                    };
                                })
                            };
                        }),
                        iotGws: carPort.devices.iotGws,
                        pvSystem: {
                            pvSystemId: carPort.devices.pvSystem.pvSystemId,
                            pvSystemName: carPort.devices.pvSystem.pvSystemName,
                            inverterIds: carPort.devices.pvSystem.inverterIds
                        }
                    }
                });
            } catch (err) {
                console.info(`API Error, check interface`);
            }
        }
        return parsedCarPorts;
    }

    createCarPortCards() {
        const carPorts = this.state && this.state.carPorts !== undefined ? this.state.carPorts : [];

        const cards = [];
        for (const [index, carPort] of carPorts.entries()) {
            cards.push(
                <Card key={carPort.locationId}>
                    <CardHeader icon="primary" onClick={() => {
                        this.toggle(index);
                    }} key={carPort.locationName}>
                        <div className={"d-flex flex-row align-items-center"}>
                            <div className={"p-2 flex-column"}>
                                <i className={(this.state.openCarPortCardIndex === index) ? "cil-chevron-bottom" : "cil-chevron-left"}/>
                            </div>
                            <div className={"p-2 flex-column flex-fill"}>
                                <strong>{carPort.locationName}</strong>
                            </div>
                            <div className={"flex-column"}>
                                <Button color="primary" onClick={(event) => {
                                    event.stopPropagation();
                                    this.props.history.push({
                                        pathname: '/dashboard',
                                        state: {selectedCarPort: carPort}
                                    });
                                }}>
                                    <i className={"cil-graph"}/>&nbsp;
                                    View
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <Collapse isOpen={(this.state.openCarPortCardIndex === index)}>
                        <CardBody>
                            {this.getRenderedPvSystem(carPort.devices)}
                            {this.getRenderedSmartcitizenSensors(carPort.devices)}
                            {this.getRenderedIotGws(carPort.devices)}
                        </CardBody>
                    </Collapse>
                </Card>
            );
        }
        return cards;
    }

    getRenderedPvSystem(carPort) {
        const renderedPvSystem = [];
        const pvSystemToRender = carPort !== undefined && carPort.pvSystem.pvSystemId !== undefined ? carPort.pvSystem : undefined;
        if (pvSystemToRender) {
            renderedPvSystem.push(
                <CardSubtitle className="ml-2 mb-2 mt-1" key="pvSystemToRender.pvSystemId" ><i
                className=" mr-3 cil-home"/>PvSystem - {pvSystemToRender.pvSystemName}</CardSubtitle>
            );
        }
        const invertersToRender = carPort !== undefined && carPort.pvSystem.inverterIds !== undefined ? carPort.pvSystem.inverterIds : [];
        if (invertersToRender.length > 0) {
            renderedPvSystem.push(
                <CardSubtitle className="ml-2 mb-1 mt-4" key="invertersCard"><i
                className=" mr-3 cil-crop-rotate"/>Inverters</CardSubtitle>
            );
        }
        for (const inverter of invertersToRender) {
            renderedPvSystem.push(
                <CardText className="ml-5 mb-1 text-muted" key={inverter}>{inverter}</CardText>
            );
        }

        return renderedPvSystem;
    }

    getRenderedSmartcitizenSensors(carPort) {
        let renderedSmartcitizenDevices = [];
        const smartcitizenSensorsToRender = carPort && carPort.smartcitizenDevices && carPort.smartcitizenDevices.length > 0 ? Object.assign([], carPort.smartcitizenDevices) : [];
        if (smartcitizenSensorsToRender.length > 0) {
            renderedSmartcitizenDevices.push(
                <CardSubtitle key={smartcitizenSensorsToRender[0].deviceId + "title"} className="ml-2 mb-4 mt-3"><i className=" mr-3 cil-rss"/>Smartcitizen
                    Devices</CardSubtitle>
            );

            const smartCitizenTableHead = [];
            smartCitizenTableHead.push(<thead key={smartcitizenSensorsToRender[0].deviceId + "tablehead"}>
                <tr>
                    <th>Device</th>
                    <th>Sensor</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Unit of Measurement</th>
                </tr>
            </thead>)
            const smartCitizenTableBody = []
            for (const smartCitizenDevice of smartcitizenSensorsToRender) {
                const sensors = smartCitizenDevice.sensors;
                for (const sensor of sensors) {
                    smartCitizenTableBody.push(
                        <tr key={sensor.name}>
                            <td>{smartCitizenDevice.deviceId}</td>
                            <td>{sensor.sensorId}</td>
                            <td>{sensor.name}</td>
                            <td>{sensor.description}</td>
                            <td>{sensor.unit}</td>
                        </tr>
                    );
                }
            }
        renderedSmartcitizenDevices = renderedSmartcitizenDevices.concat(<div className="mr-3" key={smartcitizenSensorsToRender[0].deviceId+"alldata"}><Table bordered className="ml-2">{smartCitizenTableHead}<tbody>{smartCitizenTableBody}</tbody></Table></div>);
        }

        return renderedSmartcitizenDevices;
    }

    getRenderedIotGws(carPort) {
        const renderedIotGws = [];
        const IotGwsSensorsToRender = carPort && carPort.iotGws && carPort.iotGws.length > 0 ? carPort.iotGws : [];
        if (IotGwsSensorsToRender.length > 0) {
            renderedIotGws.push(
                <CardSubtitle className="ml-2 mb-1 mt-3" key={IotGwsSensorsToRender[0].deviceId + "header"}><i className="mr-3"><img src={pixidaLogo} alt="" width="14px"/></i>IoT Gateways</CardSubtitle>
            );
        }
        for (const index in IotGwsSensorsToRender) {
            const iotGw = IotGwsSensorsToRender[index];
            renderedIotGws.push(
                <CardText key={iotGw} className="ml-5 mb-1 text-muted">{iotGw}</CardText>
            );
        }

        return renderedIotGws;
    }

    render() {
        if (this.state.isLoading) {
            return (
                <LoadingCard/>
            )
        } else if (this.state.failedToLoad) {
            return (
                <MessageCard title={"Failed to load, please try again later."} message={""}/>
            )
        } else if (typeof this.state.carPorts === "undefined" || this.state.carPorts.length === 0) {
            return (
                <MessageCard title={"No carport is assigned to your account."}
                             message={"Please contact an administrator to have carports assigned to you"}/>
            )
        }

        return (
            <div>
                {this.createCarPortCards()}
            </div>
        );
    }
}

export default CarPorts;