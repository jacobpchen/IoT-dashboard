import React from 'react'
import { Container, Row, Col } from 'reactstrap'

import YoutubeEmbed from "./YoutubeEmbed"
import weather from '../../assets/img/weather.jpg'

const MiscBucket = () => {
    return (
        <Container>
            <Row>
                <Col className="w-40">
                    <YoutubeEmbed embedId="t1vW6gMyPoQ" />
                </Col>
                <Col>
                    <img src={weather} style={{ height: "200px", width: "100%"}} alt="picture of the forecast" />
                </Col>
            </Row>
        </Container>
    )
}

export default MiscBucket
