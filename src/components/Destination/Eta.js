import React, { useEffect, useRef, useState, } from 'react'
import { Circle, Layer, Line, Rect, Stage, Text } from 'react-konva';
import { Container } from 'reactstrap'

import variables from '../../scss/_variables.scss'


const Eta = () => {

    const tripDuration = 5 * 60

    const busStop1Ref = useRef()
    const busStop1OutlineRef = useRef()
    const busStop2Ref = useRef()
    const busStop2OutlineRef = useRef()
    const busStop3Ref = useRef()
    const busStop3OutlineRef = useRef()
    const busStop4Ref = useRef()
    const busStop4OutlineRef = useRef()
    const busStop5Ref = useRef()
    const busStop5OutlineRef = useRef()

    const nextStop = useRef()
    const currentMeasurementLocation = useRef()
    const etaRef = useRef()
    const height = 225

    const busStopList = ["Bowling Green", "City Hall", "Canal Street", "Spring Street", "Grand Central Station"]

    const secondShuttleBusRef = useRef()
    const [flag, setFlag] = useState(true)

    const longLoadingBarRef = useRef(null)

    const busStopEta = [0, (tripDuration / 4), (tripDuration / 4) * 2, (tripDuration / 4) * 3, (tripDuration / 4) * 4]

    // Bus Stop Shapes
    // location (x,y) in pixels used for drawing the location of circles relative to it's parent container
    const busStop1 = [250, 125]
    const busStop2 = [busStop1[0] + 150, busStop1[1]]
    const busStop3 = [busStop2[0] + 150, busStop1[1]]
    const busStop4 = [busStop3[0] + 150, busStop1[1]]
    const busStop5 = [busStop4[0] + 150, busStop1[1]]

    const radius = 25

    const lines = [
        busStop1[0] + radius, 0, // x1
        busStop2[0] - radius, 0, // y1
        busStop2[0] + radius, 0, // x2
        busStop3[0] - radius, 0, // y2
        busStop3[0] + radius, 0, // x3
        busStop4[0] - radius, 0, // y3
        busStop4[0] + radius, 0, // x3
        busStop5[0] - radius, 0, // y3
    ]

    function busStop2Arrival() {
        busStop1Ref.current.fill(variables.nextStop)
        busStop1OutlineRef.current.stroke(variables.nextStopOutline)
        busStop2Ref.current.fill(variables.currentStop)
        busStop2OutlineRef.current.stroke(variables.currentStopOutline)

        nextStop.current.text(busStopList[2])
        currentMeasurementLocation.current.text(busStopList[2])
    }

    function busStop3Arrival() {
        busStop2Ref.current.fill(variables.nextStop)
        busStop2OutlineRef.current.stroke(variables.nextStopOutline)
        busStop3Ref.current.fill(variables.currentStop)
        busStop3OutlineRef.current.stroke(variables.currentStopOutline)

        nextStop.current.text(busStopList[3])
        currentMeasurementLocation.current.text(busStopList[3])
    }

    function busStop4Arrival() {
        busStop3Ref.current.fill(variables.nextStop)
        busStop3OutlineRef.current.stroke(variables.nextStopOutline)
        busStop4Ref.current.fill(variables.currentStop)
        busStop4OutlineRef.current.stroke(variables.currentStopOutline)

        nextStop.current.text(busStopList[4])
        currentMeasurementLocation.current.text(busStopList[4])
    }

    function busStop5Arrival() {
        busStop4Ref.current.fill(variables.nextStop)
        busStop4OutlineRef.current.stroke(variables.nextStopOutline)
        busStop5Ref.current.fill(variables.currentStop)
        busStop5OutlineRef.current.stroke(variables.currentStopOutline)
    }

    useEffect(() => {
        if (!flag) {
            return;
        }

        longLoadingBarRef.current.to({
            width: 600,
            duration: tripDuration
        })

        secondShuttleBusRef.current.to({
            x: busStop5[0] - 25,
            duration: tripDuration
        })

        setTimeout(() => { busStop2Arrival() }, busStopEta[1] * 1000)
        setTimeout(() => { busStop3Arrival() }, busStopEta[2] * 1000)
        setTimeout(() => { busStop4Arrival() }, busStopEta[3] * 1000)
        setTimeout(() => { busStop5Arrival() }, busStopEta[4] * 1000)

    }, [flag]);

    return (
        <Container fluid style={{ backgroundColor: '#faf9f9' }}>

            <Stage width={window.innerWidth} height={height}>
                <Layer>
                    <Text
                        x={0}
                        y={0}
                        text="Next Stop: "
                    />

                    <Text
                        x={busStop1[0] - 150}
                        y={0}
                        text={busStopList[1]}
                        ref={nextStop}
                    />

                    <Text
                        x={0}
                        y={20}
                        text="ETA: "
                        ref={etaRef}
                    />

                    <Text
                        x={busStop1[0] - 150}
                        y={20}
                        text="1 minute"
                    />


                    {/**Readings taken from */}
                    <Text
                        x={0}
                        y={height - 15}
                        text="Current measurements at:"
                    />

                    <Text
                        x={150}
                        y={height - 15}
                        text={busStopList[1]}
                        ref={currentMeasurementLocation}
                    />

                    {/** START FIRST STOP */}
                    <Circle
                        x={busStop1[0]}
                        y={busStop1[1]}
                        radius={radius}
                        fill={variables.currentStop}
                        ref={busStop1Ref}
                    />
                    <Circle
                        x={busStop1[0]}
                        y={busStop1[1]}
                        radius={radius}
                        stroke={variables.currentStopOutline}
                        strokeWidth={2.5}
                        ref={busStop1OutlineRef}
                    />
                    <Text
                        x={lines[4] + 30}
                        y={busStop1[1] - 20}
                    /* text={secondsToHms(secondEta)} */
                    />

                    <Text
                        x={busStop1[0] - 5}
                        y={busStop1[1] - 40}
                        text="Bowling Green"
                        rotation={-45}
                    />

                    <Line
                        x={0}
                        y={busStop1[1]}
                        points={[lines[0], lines[1], lines[2], lines[3]]}
                        stroke="#555b6e"
                    />

                    {/** END FIRST STOP */}

                    {/** START SECOND STOP */}

                    <Circle
                        x={busStop2[0]}
                        y={busStop2[1]}
                        radius={radius}
                        fill={variables.nextStop}
                        ref={busStop2Ref}
                    />
                    <Circle
                        x={busStop2[0]}
                        y={busStop2[1]}
                        radius={radius}
                        stroke={variables.nextStopOutline}
                        strokeWidth={2.5}
                        ref={busStop2OutlineRef}
                    />
                    <Text
                        x={busStop2[0] - 15}
                        y={busStop2[1] - 5}
                    /* text={secondsToHms(firstEta)} */
                    />

                    <Text
                        x={busStop2[0] - 5}
                        y={busStop2[1] - 40}
                        text="City Hall"
                        rotation={-45}
                    />

                    <Line
                        x={0}
                        y={busStop1[1]}
                        points={[lines[4], lines[5], lines[6], lines[7]]}
                        stroke="#555b6e"
                    />

                    {/** END SECOND STOP */}

                    {/** START THIRD STOP */}

                    <Circle
                        x={busStop3[0]}
                        y={busStop3[1]}
                        radius={radius}
                        fill={variables.nextStop}
                        ref={busStop3Ref}
                    />
                    <Circle
                        x={busStop3[0]}
                        y={busStop3[1]}
                        radius={radius}
                        stroke={variables.nextStopOutline}
                        strokeWidth={2.5}
                        ref={busStop3OutlineRef}
                    />
                    <Text
                        x={busStop3[0] - 5}
                        y={busStop3[1] - 40}
                        text="Canal Street"
                        rotation={-45}
                    />

                    <Line
                        x={0}
                        y={busStop1[1]}
                        points={[lines[8], lines[9], lines[10], lines[11]]}
                        stroke="#555b6e"
                    />

                    {/** END THIRD STOP */}

                    {/** START FOURTH STOP */}
                    <Circle
                        x={busStop4[0]}
                        y={busStop4[1]}
                        radius={radius}
                        fill={variables.nextStop}
                        ref={busStop4Ref}
                    />
                    <Circle
                        x={busStop4[0]}
                        y={busStop4[1]}
                        radius={radius}
                        stroke={variables.nextStopOutline}
                        strokeWidth={2.5}
                        ref={busStop4OutlineRef}
                    />

                    <Line
                        x={0}
                        y={busStop1[1]}
                        points={[lines[12], lines[13], lines[14], lines[15]]}
                        stroke="#555b6e"
                    />

                    <Text
                        x={busStop4[0] - 5}
                        y={busStop4[1] - 40}
                        text="Spring Street"
                        rotation={-45}
                    />


                    {/** END FOURTH STOP */}

                    {/** START FIFTH STOP */}
                    <Circle
                        x={busStop5[0]}
                        y={busStop5[1]}
                        radius={radius}
                        fill={variables.nextStop}
                        ref={busStop5Ref}
                    />
                    <Circle
                        x={busStop5[0]}
                        y={busStop5[1]}
                        radius={radius}
                        stroke={variables.nextStopOutline}
                        strokeWidth={2.5}
                        ref={busStop5OutlineRef}
                    />

                    <Text
                        x={busStop5[0] - 5}
                        y={busStop5[1] - 40}
                        text="Grand Central Station"
                        rotation={-45}
                    />

                    {/** END FIFTH STOP */}

                    {/**Loading Bar */}
                    <Rect
                        x={busStop1[0]}
                        y={busStop4[1] + 35}
                        width={25}
                        height={30}
                        fill="skyblue"
                        cornerRadius={20}
                        ref={longLoadingBarRef}
                    />
                    <Rect
                        x={busStop1[0]}
                        y={busStop4[1] + 35}
                        width={600}
                        height={30}
                        stroke={"#ccc"}
                        shadowColor={"#bbb"}
                        strokeWidth={4}
                        cornerRadius={20}
                    />

                    <Text
                        x={busStop1[0] + 5}
                        y={lines[1] + 165}
                        fontFamily='FontAwesome'
                        text={'\uf207'}
                        fontSize={20}
                        ref={secondShuttleBusRef} />


                </Layer>
            </Stage>
        </Container>
    )
}

export default Eta
