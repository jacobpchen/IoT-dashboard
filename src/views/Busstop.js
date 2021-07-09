import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Container, Row, Col } from 'reactstrap'

import Eta from '../components/Destination/Eta'
import MiscBucket from '../components/MiscBucket/MiscBucket';
import Pm2_5 from '../components/busComponents/Pm2_5';
import Tvoc from '../components/busComponents/Tvoc'
import Eco2 from '../components/busComponents/Eco2'
import Noise from '../components/busComponents/Noise'

import Advertisement from '../components/Advertisement/Advertisement';

function App() {
    const [data, setData] = useState([])
    const url = 'https://api.smartcitizen.me/devices/12588/'


    useEffect(() => {
        const fetchData = async () => {
            const result = await axios(url)
            setData(result.data.data)

            console.log(data)
        }
        fetchData()
    }, [])

    const Pm2_5Component = () => (<Pm2_5 pm2_5_sensor={data.sensors} />)
    const TvocComponent = () => (<Tvoc tvoc_sensor={data.sensors} />)
    const Eco2Component = () => (<Eco2 eco2_sensor={data.sensors} />)
    const NoiseComponent = () => (<Noise noise_sensor={data.sensors} />)

    return (
        <Container>
            <Row>
                <Eta />
            </Row>

            <Row>
                <Advertisement />
            </Row>

            <Row className="py-2 h-25">
                <Col>{Pm2_5Component()}</Col>
                <Col>{TvocComponent()}</Col>
                <Col>{Eco2Component()}</Col>
                <Col>{NoiseComponent()}</Col>
            </Row>

            <Row>
                <MiscBucket />
            </Row>



        </Container>

    )
}

export default App;
