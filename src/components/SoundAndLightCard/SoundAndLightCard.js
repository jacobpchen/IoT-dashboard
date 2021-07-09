import React from "react";
import { Card, CardBody, CardTitle, Col, Row, UncontrolledTooltip } from "reactstrap";
import InfoIcon from "@material-ui/icons/Info";
import { ReactComponent as LightBulb } from "../../assets/img/light-bulb.svg";
import { ReactComponent as SoundWave } from "../../assets/img/sound-wave.svg";
import variables from "../../scss/_variables.scss";
import moment from "moment";
import { useTranslation } from "react-i18next";

const SoundAndLightCard = (props) => {
    const {t} = useTranslation();
    let isLightPresent;
    if(props.light) {
        isLightPresent = props.light.value > 0 ? "gold" : "black";
    }

    return (
        <Card className={"h-100"} style={{ borderRadius: "25px" }}>
            <CardBody>
                <CardTitle className="text-value">
                    <Row className=".d-flex">
                        <Col xs="10">{t('SoundAndLight.Title')}</Col>
                        <Col xs="2">
                            <InfoIcon className="d-block float-right position-relative" id="SoundAndLightInfo" />
                        </Col>
                    </Row>
                    <UncontrolledTooltip placement="right" target="SoundAndLightInfo">
                        {t('SoundAndLight.Tooltip')}
                    </UncontrolledTooltip>
                </CardTitle>
                {props.light && props.noise && (
                    <div style={{ height: "140px" }} className={"d-block"}>
                        <Row className={"h-50 d-flex"}>
                            <Col>
                                <LightBulb fill={isLightPresent} style={{ position: "absolute" }} />
                            </Col>
                            <Col style={{ fontSize: "175%", alignSelf: "center" }}>{props.light.value} lx</Col>
                        </Row>
                        <Row className={"h-50 d-flex"}>
                            <Col>
                                <SoundWave fill={variables.iSunPurple} style={{ position: "absolute" }} />
                            </Col>
                            <Col style={{ fontSize: "175%", alignSelf: "center" }}>
                                {Math.round(props.noise.value)} dBA
                            </Col>
                        </Row>
                    </div>
                )}
            </CardBody>
{/*             {props.light && props.noise && (
                <small className="text-muted ml-3">{t('LastUpdated.Text')} {moment(props.light.createdAt).fromNow()}</small>
            )}

            {!(props.light && props.noise) && (
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
            )} */}
            <small className='p-2'>
                    {/* {getAQIMeaning(aqiValue)} */}
                    {t('SoundAndLight.Tooltip')}
                    </small>
        </Card>
    );
};

export default SoundAndLightCard;
