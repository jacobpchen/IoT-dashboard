import React, { Component } from "react";
import "./BatteryIndicator.css";
import variables from "../../../scss/_variables.scss";

class BatteryIndicator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDesktop: false, //This is where I am having problems
        };

        this.updatePredicate = this.updatePredicate.bind(this);
    }
    componentDidMount() {
        this.updatePredicate();
        window.addEventListener("resize", this.updatePredicate);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updatePredicate);
    }

    updatePredicate() {
        this.setState({ isDesktop: window.innerWidth >= 1274 });
    }

    batteryState = (percentage) => {
        switch (true) {
            case 0 <= percentage && percentage < 25:
                return "#ff0000";
            case 25 <= percentage && percentage < 75:
                return "#ffff00";
            case 75 <= percentage && percentage <= 100:
                return variables.iSunGreen;
            default:
                return "#ff0000";
        }
    };

    padZero = (str, len) => {
        len = len || 2;
        let zeros = new Array(len).join("0");
        return (zeros + str).slice(-len);
    };

    invertColor = (hex, bw) => {
        if (hex.indexOf("#") === 0) {
            hex = hex.slice(1);
        }
        // convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error("Invalid HEX color.");
        }
        let r = parseInt(hex.slice(0, 2), 16),
            g = parseInt(hex.slice(2, 4), 16),
            b = parseInt(hex.slice(4, 6), 16);
        if (bw) {
            // http://stackoverflow.com/a/3943023/112731
            return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
        }
        // invert color components
        r = (255 - r).toString(16);
        g = (255 - g).toString(16);
        b = (255 - b).toString(16);
        // pad each with zeros and return
        return "#" + this.padZero(r) + this.padZero(g) + this.padZero(b);
    };

    render() {
        const { percentage } = this.props;
        const color = this.batteryState(percentage);
        const invertedColor = this.invertColor(color, false);
        return (
            <div>
                <div className="row justify-content-center sm-light battery-container">
                    <div className="col sm-6 mb-3 mt-5 col-6 d-flex justify-content-center battery-subcontainer">
                        <div className="battery-outer">
                            {!this.state.isDesktop && (
                                <div
                                    className="percent-font"
                                    style={{
                                        color: percentage > 74 ? "#FFFFFF" : invertedColor,
                                        mixBlendMode: percentage > 74 ? "normal" : "difference",
                                    }}
                                >
                                    {percentage}%
                                </div>
                            )}
                            <div
                                className={`battery-inner visibe`}
                                style={{ background: color, width: `${percentage}%` }}
                            ></div>
                            <div className="battery-charging-indicator"></div>
                        </div>
                    </div>
                    {this.state.isDesktop && (
                        <div
                            className="col sm-6 mb-3 mt-5 col-6 percent-font"
                            style={{
                                color: color,
                            }}
                        >
                            {percentage}%
                        </div>
                    )}
                </div>

            </div>
        );
    }
}

export default BatteryIndicator;
